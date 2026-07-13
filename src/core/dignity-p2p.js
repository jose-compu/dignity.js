const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const EventEmitter = require('../utils/event-emitter');
const {
  MessageSecurityService,
  stableStringify,
  DEFAULT_APP_PASSWORD
} = require('../security/message-security-service');
const {
  revokeAndRotateIdentity,
  rotateIdentityPassword,
  enrollColdRecoveryPassword
} = require('../security/identity-rotation');
const { deriveKeyPairFromCredentials } = require('../security/derive-key-pair');
const {
  DEFAULT_PEER_GROUP_OPTIONS,
  peerGroupScope,
  parsePeerGroupScope,
  selectFanoutPeers
} = require('../gossip/peer-group');
const {
  operationToDomainEvent,
  signDomainEvent,
  verifyDomainEvent,
  applyDomainEventToView,
  createEmptyView,
  buildCheckpoint
} = require('../cqrs/domain-events');
const {
  DEFAULT_LIVE_CAP,
  DEFAULT_BULK_INTERVAL_MS,
  assignPeerGroupTier,
  filterPeersByTier
} = require('../cqrs/peer-group-tiers');
const { electBulkRelays } = require('../cqrs/bulk-relay');
const {
  COMPATIBILITY_POLICIES,
  DEFAULT_COMPATIBILITY_POLICY,
  buildVerificationEntry,
  buildPublisherVerificationKey,
  evaluateVerificationCompatibility,
  buildVerificationPresenceMetadata,
  buildPublisherVerificationPresenceMetadata
} = require('../security/verification-code');

function computeContentHash(data) {
  const canonical = stableStringify(data || {});
  const bytes = naclUtil.decodeUTF8(canonical);
  const hash = nacl.hash(bytes);
  const hex = Array.from(hash, (b) => b.toString(16).padStart(2, '0')).join('');
  return `sha512:${hex}`;
}

/**
 * Core node API for replicated object collections.
 *
 * Interface shape uses a familiar CRUD surface:
 * - create(collection, data)
 * - read(collection, id)
 * - list(collection)
 * - update(collection, id, patch)
 * - remove(collection, id)
 *
 * PeerJS / mesh replication helpers (see README "PeerJS mesh bootstrap"):
 * - connectToPeer(peerId), getConnectionStats(), ensureConnectedToPeers(peerIds)
 * - joinDiscovery(scope, { bootstrapPeerIds })
 * - broadcastMessage(type, payload, { connectToPeers, broadcastScope })
 * - pushRecordSnapshot(collection, id, options) — full record sync for late joiners
 * - getRecordPeerIds(collection, id) — owner + collaborators for connectToPeers
 * - joinPeerGroup(groupId) / publishToPeerGroup(groupId, type, payload) — scalable gossip PubSub
 *
 * Authorization model:
 * - object creator is the owner
 * - only owner can update or delete (collaborators may update when listed)
 */
class DignityP2P extends EventEmitter {
  constructor({ nodeId, networkAdapter, idGenerator, now, security } = {}) {
    super();

    if (!nodeId) {
      throw new Error('DignityP2P requires nodeId');
    }

    if (!networkAdapter) {
      throw new Error('DignityP2P requires networkAdapter');
    }

    this.nodeId = nodeId;
    this.networkAdapter = networkAdapter;
    this.idGenerator = idGenerator || (() => `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    this.now = now || (() => Date.now());
    this.securityService = new MessageSecurityService({
      nodeId: this.nodeId,
      options: security || {},
      now: this.now
    });
    this.bannedPeers = new Map();
    this.peerBanDurationMs = security && typeof security.banDurationMs === 'number'
      ? security.banDurationMs
      : 48 * 60 * 60 * 1000;
    this.resolveBroadcastScope = security && typeof security.resolveBroadcastScope === 'function'
      ? security.resolveBroadcastScope
      : (() => 'default');
    this.defaultDiscoveryHeartbeatMs = security && typeof security.discoveryHeartbeatMs === 'number'
      ? security.discoveryHeartbeatMs
      : 15000;
    this.defaultPresenceTtlMs = security && typeof security.presenceTtlMs === 'number'
      ? security.presenceTtlMs
      : 45000;
    this.discoveryRooms = new Map(); // scope -> { metadata, heartbeatIntervalMs, ttlMs, timer }
    this.presenceByScope = new Map(); // scope -> Map(peerId -> presence)
    this.peerGroups = new Map(); // groupId -> PeerGroup config
    this.seenGossipIds = new Map(); // gossipId -> expiresAt
    this.defaultPeerGroupFanout = security && typeof security.peerGroupFanout === 'number'
      ? security.peerGroupFanout
      : DEFAULT_PEER_GROUP_OPTIONS.fanout;
    this.defaultPeerGroupMaxActivePeers = security && typeof security.peerGroupMaxActivePeers === 'number'
      ? security.peerGroupMaxActivePeers
      : DEFAULT_PEER_GROUP_OPTIONS.maxActivePeers;
    this.defaultGossipMaxHops = security && typeof security.gossipMaxHops === 'number'
      ? security.gossipMaxHops
      : DEFAULT_PEER_GROUP_OPTIONS.maxHops;
    this.globalMaxOpenConnections = security && typeof security.globalMaxOpenConnections === 'number'
      ? security.globalMaxOpenConnections
      : 32;
    this.gossipIdTtlMs = security && typeof security.gossipIdTtlMs === 'number'
      ? security.gossipIdTtlMs
      : 5 * 60 * 1000;
    this.maxSeenGossipIds = security && typeof security.maxSeenGossipIds === 'number'
      ? security.maxSeenGossipIds
      : 100000;
    this.gossipPublishMinIntervalMs = security && typeof security.gossipPublishMinIntervalMs === 'number'
      ? security.gossipPublishMinIntervalMs
      : 0;
    this.lastGossipPublishAt = new Map(); // groupId -> timestamp
    this.maxAppliedOperations = security && typeof security.maxAppliedOperations === 'number'
      ? security.maxAppliedOperations
      : 50000;
    this.domainEventLogs = new Map(); // groupId -> event[]
    this.lastEventHashByGroup = new Map(); // groupId -> hash
    this.bulkRelayByGroup = new Map(); // groupId -> peerId[]
    this.replicaViews = new Map(); // groupId -> view Map

    this.state = new Map(); // collection -> Map(id -> record)
    this.appliedOperations = new Map(); // opId -> appliedAt
    this.verificationRegistry = new Map(); // collection -> verification entry
    this.publisherVerificationRegistry = new Map(); // publisherId:collection -> verification entry
    this.boundMessageHandler = this.handleIncomingMessage.bind(this);
  }

  async start() {
    this.networkAdapter.onMessage(this.boundMessageHandler);
    await this.networkAdapter.start(this.nodeId);

    const appPassword = this.securityService.options.appPassword;
    if (!appPassword || appPassword === DEFAULT_APP_PASSWORD) {
      this.emit('warning', {
        type: 'default-app-password',
        message: 'Using the default appPassword is insecure; set a strong shared secret in production.'
      });
    }
  }

  async stop() {
    const joinedGroups = Array.from(this.peerGroups.keys());
    for (const groupId of joinedGroups) {
      try {
        await this.leavePeerGroup(groupId);
      } catch (error) {
        this.emit('warning', { type: 'peer-group-leave-failed', groupId, error });
      }
    }

    const joinedScopes = Array.from(this.discoveryRooms.keys());
    for (const scope of joinedScopes) {
      // Best effort leave announce; do not fail node shutdown if network is interrupted.
      try {
        await this.leaveDiscovery(scope);
      } catch (error) {
        this.emit('warning', { type: 'presence-leave-failed', scope, error });
      }
    }

    this.networkAdapter.offMessage(this.boundMessageHandler);
    await this.networkAdapter.stop();
  }

  getCollection(collectionName) {
    if (!collectionName) {
      throw new Error('collectionName is required');
    }

    if (!this.state.has(collectionName)) {
      this.state.set(collectionName, new Map());
    }

    return this.state.get(collectionName);
  }

  normalizeRecord(record) {
    if (!record || record.deletedAt) {
      return null;
    }

    const normalizedData = { ...(record.data || {}) };

    return {
      id: record.id,
      ownerId: record.ownerId,
      collaboratorIds: Array.isArray(record.collaboratorIds) ? [...record.collaboratorIds] : [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
      hash: record.hash || computeContentHash(normalizedData),
      data: normalizedData
    };
  }

  canUpdateRecord(record, actorId) {
    if (!record || !actorId) {
      return false;
    }

    if (record.ownerId === actorId) {
      return true;
    }

    return Array.isArray(record.collaboratorIds) && record.collaboratorIds.includes(actorId);
  }

  normalizeCollaboratorIds(collaborators) {
    if (!Array.isArray(collaborators)) {
      return [];
    }

    return [...new Set(collaborators.filter(Boolean))];
  }

  getRecordPeerIds(collectionName, id, options = {}) {
    const record = options.fromRecord || this.getCollection(collectionName).get(id);
    if (!record) {
      return [];
    }

    const includeSelf = options.includeSelf === true;
    const peerIds = [record.ownerId, ...(record.collaboratorIds || [])];

    return [...new Set(peerIds.filter(Boolean).filter((peerId) => includeSelf || peerId !== this.nodeId))];
  }

  resolveReplicationPeers(collectionName, id, options = {}, hints = {}) {
    if (options.connectToPeers === false) {
      return undefined;
    }

    if (Array.isArray(options.connectToPeers)) {
      return options.connectToPeers;
    }

    const peerIds = new Set();

    if (hints.fromRecord) {
      for (const peerId of this.getRecordPeerIds(collectionName, id, {
        fromRecord: hints.fromRecord,
        includeSelf: true
      })) {
        peerIds.add(peerId);
      }
    } else if (id) {
      for (const peerId of this.getRecordPeerIds(collectionName, id, { includeSelf: true })) {
        peerIds.add(peerId);
      }
    }

    if (Array.isArray(options.collaborators)) {
      for (const peerId of this.normalizeCollaboratorIds(options.collaborators)) {
        peerIds.add(peerId);
      }
    }

    if (Array.isArray(hints.extraPeerIds)) {
      for (const peerId of hints.extraPeerIds) {
        if (peerId) {
          peerIds.add(peerId);
        }
      }
    }

    return [...peerIds].filter((peerId) => peerId && peerId !== this.nodeId);
  }

  async create(collectionName, data, options = {}) {
    const collection = this.getCollection(collectionName);
    const id = options.id || this.idGenerator();

    if (collection.has(id) && !collection.get(id).deletedAt) {
      throw new Error(`Object ${id} already exists in ${collectionName}`);
    }

    const timestamp = this.now();
    const collaboratorIds = this.normalizeCollaboratorIds(options.collaborators);
    const operation = {
      opId: this.idGenerator(),
      kind: 'create',
      collectionName,
      id,
      actorId: this.nodeId,
      ownerId: this.nodeId,
      collaboratorIds,
      timestamp,
      payload: { ...(data || {}) }
    };
    this.attachVerificationMetadata(operation);

    this.applyOperation(operation);
    await this.maybePublishDomainEvent(operation, options);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
      }),
      connectToPeers: this.resolveReplicationPeers(collectionName, null, options, {
        extraPeerIds: options.collaborators
      })
    });

    return this.read(collectionName, id);
  }

  read(collectionName, id) {
    const collection = this.getCollection(collectionName);
    return this.normalizeRecord(collection.get(id));
  }

  list(collectionName, options = {}) {
    const collection = this.getCollection(collectionName);
    const includeDeleted = options.includeDeleted || false;

    const records = [];
    for (const record of collection.values()) {
      if (record.deletedAt && !includeDeleted) {
        continue;
      }

      if (record.deletedAt && includeDeleted) {
        records.push({
          id: record.id,
          ownerId: record.ownerId,
          deletedAt: record.deletedAt,
          version: record.version
        });
        continue;
      }

      records.push(this.normalizeRecord(record));
    }

    return records;
  }

  async update(collectionName, id, partialData, options = {}) {
    const existing = this.getCollection(collectionName).get(id);

    if (!existing || existing.deletedAt) {
      throw new Error(`Object ${id} does not exist in ${collectionName}`);
    }

    if (!this.canUpdateRecord(existing, this.nodeId)) {
      throw new Error(`Only owner ${existing.ownerId} or collaborators can update object ${id}`);
    }

    if (options.collaborators !== undefined && existing.ownerId !== this.nodeId) {
      throw new Error(`Only owner ${existing.ownerId} can change collaborators on object ${id}`);
    }

    if (typeof options.expectedVersion === 'number' && existing.version !== options.expectedVersion) {
      this.emitConflict({
        kind: 'update',
        collection: collectionName,
        id,
        expectedVersion: options.expectedVersion,
        currentVersion: existing.version,
        phase: 'local'
      });

      const error = new Error(
        `Version conflict on ${collectionName}/${id}: expected ${options.expectedVersion}, current ${existing.version}`
      );
      error.code = 'VERSION_CONFLICT';
      throw error;
    }

    const operation = {
      opId: this.idGenerator(),
      kind: 'update',
      collectionName,
      id,
      actorId: this.nodeId,
      timestamp: this.now(),
      baseVersion: existing.version,
      payload: { ...partialData }
    };

    if (options.collaborators !== undefined) {
      operation.collaboratorIds = this.normalizeCollaboratorIds(options.collaborators);
    }

    this.attachVerificationMetadata(operation);
    this.applyOperation(operation);
    await this.maybePublishDomainEvent(operation, options);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
      }),
      connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: existing })
    });

    return this.read(collectionName, id);
  }

  async updateWithRetry(collectionName, id, patchFn, options = {}) {
    const maxAttempts = typeof options.maxAttempts === 'number' ? options.maxAttempts : 5;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const current = this.read(collectionName, id);
      if (!current) {
        throw new Error(`Object ${id} does not exist in ${collectionName}`);
      }

      const patch = await patchFn(current);
      try {
        return await this.update(collectionName, id, patch, {
          ...options,
          expectedVersion: current.version
        });
      } catch (error) {
        if (error.code !== 'VERSION_CONFLICT' || attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error(`Unable to update ${collectionName}/${id} after ${maxAttempts} attempts`);
  }

  /**
   * Propose an update to the record owner (non-owner turn-based games, #13).
   * @param {string} collectionName
   * @param {string} id
   * @param {object} patch
   * @param {object} [options]
   * @returns {Promise<{ proposalId: string }>}
   */
  async proposeUpdate(collectionName, id, patch, options = {}) {
    const existing = this.getCollection(collectionName).get(id);

    if (!existing || existing.deletedAt) {
      throw new Error(`Object ${id} does not exist in ${collectionName}`);
    }

    if (existing.ownerId === this.nodeId) {
      throw new Error('Owner should call update() directly');
    }

    if (this.isPeerBanned(this.nodeId)) {
      throw new Error('Proposer is banned');
    }

    const proposalId = `prop-${this.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const payload = {
      proposalId,
      collection: collectionName,
      id,
      patch: { ...patch },
      proposerId: this.nodeId,
      baseVersion: existing.version
    };

    await this.sendDirectMessage(existing.ownerId, 'proposal', payload);

    if (options.connectToPeers) {
      await this.ensureConnectedToPeers(options.connectToPeers);
    }

    return { proposalId };
  }

  /**
   * Accept a proposal and apply the patch as owner (#13).
   * @param {object} proposal
   * @param {object} [options]
   * @returns {Promise<object>} updated record
   */
  async acceptProposal(proposal, options = {}) {
    if (!proposal || !proposal.collection || !proposal.id) {
      throw new Error('acceptProposal requires a valid proposal');
    }

    const existing = this.read(proposal.collection, proposal.id);
    if (!existing || existing.ownerId !== this.nodeId) {
      throw new Error('Only the record owner can accept proposals');
    }

    if (proposal.proposerId && this.isPeerBanned(proposal.proposerId)) {
      await this.rejectProposal(proposal, 'proposer-banned');
      throw new Error('Proposer is banned');
    }

    if (!proposal.patch || typeof proposal.patch !== 'object' || Array.isArray(proposal.patch)) {
      await this.rejectProposal(proposal, 'invalid-patch');
      throw new Error('Proposal patch must be a plain object');
    }

    try {
      const record = await this.update(proposal.collection, proposal.id, proposal.patch, {
        ...options,
        expectedVersion: proposal.baseVersion
      });
      await this.sendDirectMessage(proposal.proposerId, 'proposal:result', {
        proposalId: proposal.proposalId,
        ok: true,
        collection: proposal.collection,
        id: proposal.id
      });
      return record;
    } catch (error) {
      await this.sendDirectMessage(proposal.proposerId, 'proposal:result', {
        proposalId: proposal.proposalId,
        ok: false,
        reason: error.message || 'rejected',
        code: error.code || 'proposal-rejected'
      });
      throw error;
    }
  }

  /**
   * Reject a proposal without applying a patch (#13).
   * @param {object} proposal
   * @param {string} [reason]
   * @returns {Promise<void>}
   */
  async rejectProposal(proposal, reason = 'rejected') {
    if (!proposal || !proposal.proposerId) {
      throw new Error('rejectProposal requires proposerId');
    }

    await this.sendDirectMessage(proposal.proposerId, 'proposal:result', {
      proposalId: proposal.proposalId,
      ok: false,
      reason,
      code: 'proposal-rejected'
    });
  }

  async transferOwnership(collectionName, id, newOwnerId, options = {}) {
    if (!newOwnerId) {
      throw new Error('newOwnerId is required');
    }

    const existing = this.getCollection(collectionName).get(id);

    if (!existing || existing.deletedAt) {
      throw new Error(`Object ${id} does not exist in ${collectionName}`);
    }

    if (existing.ownerId !== this.nodeId) {
      throw new Error(`Only owner ${existing.ownerId} can transfer object ${id}`);
    }

    const operation = {
      opId: this.idGenerator(),
      kind: 'transfer-ownership',
      collectionName,
      id,
      actorId: this.nodeId,
      timestamp: this.now(),
      baseVersion: existing.version,
      newOwnerId,
      keepPreviousOwnerAsCollaborator: options.keepAsCollaborator !== false
    };

    this.attachVerificationMetadata(operation);
    this.applyOperation(operation);
    await this.maybePublishDomainEvent(operation, options);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
      }),
      connectToPeers: this.resolveReplicationPeers(collectionName, id, options, {
        fromRecord: existing,
        extraPeerIds: [newOwnerId]
      })
    });

    return this.read(collectionName, id);
  }

  async remove(collectionName, id, options = {}) {
    const existing = this.getCollection(collectionName).get(id);

    if (!existing || existing.deletedAt) {
      throw new Error(`Object ${id} does not exist in ${collectionName}`);
    }

    if (existing.ownerId !== this.nodeId) {
      throw new Error(`Only owner ${existing.ownerId} can delete object ${id}`);
    }

    const operation = {
      opId: this.idGenerator(),
      kind: 'delete',
      collectionName,
      id,
      actorId: this.nodeId,
      timestamp: this.now(),
      baseVersion: existing.version
    };

    this.attachVerificationMetadata(operation);
    this.applyOperation(operation);
    await this.maybePublishDomainEvent(operation, options);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
      }),
      connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: existing })
    });
  }

  /**
   * Register verification code and optional compatibility policy for a collection (#115–#117).
   * @param {string} collectionName
   * @param {object} options
   * @param {Function|string|object} options.code
   * @param {string} [options.version] semver
   * @param {string} [options.policy]
   * @returns {object} entry summary
   */
  registerVerification(collectionName, options = {}) {
    if (!collectionName) {
      throw new Error('registerVerification requires collectionName');
    }
    if (!options.code) {
      throw new Error('registerVerification requires code');
    }

    const entry = buildVerificationEntry({
      code: options.code,
      version: options.version || null,
      policy: options.policy || DEFAULT_COMPATIBILITY_POLICY,
      reflective: options.reflective === true,
      stripComments: options.stripComments,
      collapseWhitespace: options.collapseWhitespace,
      allowNative: options.allowNative === true
    });
    this.verificationRegistry.set(collectionName, entry);

    this._refreshDiscoveryVerificationMetadata();

    return {
      collection: collectionName,
      verificationHash: entry.hash,
      verificationVersion: entry.version,
      policy: entry.policy,
      reflective: entry.reflective,
      logicFingerprints: entry.fingerprintList || []
    };
  }

  /**
   * Register official dapp logic for a specific publisher + collection (#123 decentralized trust).
   * Subscribers opt in to this publisher's semver + hash as the official version for that collection.
   * No central registry — trust is peer-to-peer, keyed by publisherId (signed mesh identity).
   *
   * @param {string} publisherId official publisher peer id
   * @param {string} collectionName
   * @param {object} options
   * @param {Function|string|object} options.code
   * @param {string} [options.version] official dapp semver (e.g. 0.13.0)
   * @param {string} [options.policy]
   * @param {string} [options.dappId] manifest id for the decentralized app
   * @returns {object}
   */
  registerPublisherVerification(publisherId, collectionName, options = {}) {
    if (!publisherId) {
      throw new Error('registerPublisherVerification requires publisherId');
    }
    if (!collectionName) {
      throw new Error('registerPublisherVerification requires collectionName');
    }
    if (!options.code) {
      throw new Error('registerPublisherVerification requires code');
    }

    const entry = buildVerificationEntry({
      code: options.code,
      version: options.version || null,
      policy: options.policy || DEFAULT_COMPATIBILITY_POLICY,
      publisherId,
      dappId: options.dappId || null,
      reflective: options.reflective === true,
      stripComments: options.stripComments,
      collapseWhitespace: options.collapseWhitespace,
      allowNative: options.allowNative === true
    });
    const key = buildPublisherVerificationKey(publisherId, collectionName);
    this.publisherVerificationRegistry.set(key, entry);

    if (publisherId === this.nodeId) {
      this._refreshDiscoveryVerificationMetadata();
    }

    return {
      publisherId,
      collection: collectionName,
      dappId: entry.dappId,
      verificationHash: entry.hash,
      verificationVersion: entry.version,
      policy: entry.policy,
      reflective: entry.reflective,
      logicFingerprints: entry.fingerprintList || []
    };
  }

  getVerificationEntry(collectionName) {
    return this.verificationRegistry.get(collectionName) || null;
  }

  getPublisherVerificationEntry(publisherId, collectionName) {
    if (!publisherId || !collectionName) {
      return null;
    }
    return this.publisherVerificationRegistry.get(
      buildPublisherVerificationKey(publisherId, collectionName)
    ) || null;
  }

  resolveVerificationEntry(collectionName, senderId = null) {
    if (senderId) {
      const publisherEntry = this.getPublisherVerificationEntry(senderId, collectionName);
      if (publisherEntry) {
        return publisherEntry;
      }
    }
    return this.getVerificationEntry(collectionName);
  }

  _buildDiscoveryVerificationMetadata() {
    const verification = buildVerificationPresenceMetadata(this.verificationRegistry);
    const officialPublishers = buildPublisherVerificationPresenceMetadata(
      this.publisherVerificationRegistry
    );
    if (Object.keys(officialPublishers).length === 0) {
      return { verification };
    }
    return { verification, officialPublishers };
  }

  _refreshDiscoveryVerificationMetadata() {
    const verificationMeta = this._buildDiscoveryVerificationMetadata();
    for (const [scope, room] of this.discoveryRooms.entries()) {
      if (room) {
        room.metadata = {
          ...(room.metadata || {}),
          ...verificationMeta
        };
        this.upsertPresence(scope, this.nodeId, room.metadata, room.ttlMs, this.now());
      }
    }
  }

  attachVerificationMetadata(target) {
    if (!target || !target.collectionName) {
      return target;
    }

    const entry = this.resolveVerificationEntry(target.collectionName, this.nodeId);
    if (!entry) {
      return target;
    }

    target.verificationHash = entry.hash;
    if (entry.version) {
      target.verificationVersion = entry.version;
    }
    return target;
  }

  _listOfficialPublisherIdsForCollection(collectionName) {
    const publisherIds = [];
    for (const key of this.publisherVerificationRegistry.keys()) {
      const separator = key.indexOf(':');
      if (separator === -1) {
        continue;
      }
      const collection = key.slice(separator + 1);
      if (collection === collectionName) {
        publisherIds.push(key.slice(0, separator));
      }
    }
    return publisherIds;
  }

  checkVerificationOnIngest(collectionName, remoteMeta = {}, senderId = null) {
    const officialPublishers = this._listOfficialPublisherIdsForCollection(collectionName);
    if (officialPublishers.length > 0 && senderId && !officialPublishers.includes(senderId)) {
      this.emit('policyrejected', {
        policy: 'official-publisher-only',
        collection: collectionName,
        senderId,
        officialPublishers,
        reason: 'untrusted-publisher'
      });
      return false;
    }

    const entry = this.resolveVerificationEntry(collectionName, senderId);
    const result = evaluateVerificationCompatibility(entry, remoteMeta, {
      collection: collectionName,
      senderId
    });

    for (const evt of result.events || []) {
      this.emit(evt.type, evt.payload);
    }

    return result.action !== 'reject';
  }

  registerPeerPublicKey(peerId, publicKey, options = {}) {
    this.securityService.registerPeerPublicKey(peerId, publicKey, options);
  }

  getPeerIdentityGeneration(peerId) {
    return this.securityService.getPeerIdentityGeneration(peerId);
  }

  getPeerIdentityState(peerId) {
    return this.securityService.getPeerIdentityState(peerId);
  }

  applyPeerIdentityRotation(peerId, rotation) {
    const result = this.securityService.applyIdentityRotation(peerId, rotation);
    if (result.applied) {
      this.emit('identityrotated', {
        peerId,
        username: rotation.username,
        fromGeneration: result.fromGeneration,
        toGeneration: result.toGeneration,
        rotationKind: result.rotationKind
      });
    }
    return result;
  }

  async broadcastIdentityRotation(rotation, options = {}) {
    return this.broadcastMessage('identity:rotate', rotation, options);
  }

  async broadcastColdRecoveryEnrollment(enrollment, options = {}) {
    return this.broadcastMessage('identity:cold-enroll', enrollment, options);
  }

  applyPeerColdRecoveryEnrollment(peerId, enrollment) {
    const result = this.securityService.applyColdRecoveryEnrollment(peerId, enrollment);
    if (result.applied) {
      this.emit('coldrecoveryenrolled', {
        peerId,
        username: enrollment.username,
        recoveryPublicKey: enrollment.recoveryPublicKey
      });
    }
    return result;
  }

  async enrollAndBroadcastColdRecovery({
    username,
    coldPassword,
    pepper = '',
    kdfIterations,
    broadcastOptions = {}
  } = {}) {
    const result = await enrollColdRecoveryPassword({
      username,
      coldPassword,
      pepper,
      kdfIterations
    });
    await this.broadcastColdRecoveryEnrollment(result.enrollment, broadcastOptions);
    return result;
  }

  async revokeAndRotateDerivedIdentity({
    username,
    password,
    coldPassword,
    currentGeneration = 1,
    reason = 'compromise-recovery',
    pepper = '',
    kdfIterations,
    broadcast = false,
    broadcastOptions = {}
  } = {}) {
    const result = await revokeAndRotateIdentity({
      username,
      password,
      coldPassword,
      currentGeneration,
      reason,
      pepper,
      kdfIterations
    });

    if (broadcast) {
      await this.broadcastIdentityRotation(result.rotation, broadcastOptions);
    }

    return result;
  }

  async rotateDerivedIdentityPassword({
    username,
    currentPassword,
    newPassword,
    coldPassword,
    currentGeneration = 1,
    reason = 'password-change',
    pepper = '',
    kdfIterations,
    broadcast = false,
    broadcastOptions = {}
  } = {}) {
    const result = await rotateIdentityPassword({
      username,
      currentPassword,
      newPassword,
      coldPassword,
      currentGeneration,
      reason,
      pepper,
      kdfIterations
    });

    if (broadcast) {
      await this.broadcastIdentityRotation(result.rotation, broadcastOptions);
    }

    return result;
  }

  async adoptDerivedIdentityKeyPair(keyPair, { generation = 1 } = {}) {
    if (!keyPair || !keyPair.signing || !keyPair.encryption) {
      throw new Error('adoptDerivedIdentityKeyPair requires a derived keyPair');
    }

    this.securityService.signingSecretKey = keyPair.signing.secretKey;
    this.securityService.signingPublicKey = keyPair.signing.publicKey;
    this.securityService.encryptionSecretKey = keyPair.encryption.secretKey;
    this.securityService.encryptionPublicKey = keyPair.encryption.publicKey;
    this.securityService.publicKeyBundle = {
      signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
      encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
    };
    this.securityService.options.keyPair = keyPair;
    this.securityService.options.identityGeneration = generation;
  }

  async deriveAndAdoptIdentity({ username, password, generation = 1, pepper = '', kdfIterations } = {}) {
    const keyPair = await deriveKeyPairFromCredentials({
      username,
      password,
      generation,
      pepper,
      kdfIterations
    });
    await this.adoptDerivedIdentityKeyPair(keyPair, { generation });
    return keyPair;
  }

  trustPeerPublicKey(peerId, publicKey) {
    if (!peerId || !publicKey) {
      return false;
    }

    try {
      this.registerPeerPublicKey(peerId, publicKey);
      return true;
    } catch (error) {
      this.emit('warning', { type: 'peer-key-trust-failed', peerId, error });
      return false;
    }
  }

  trustPeerFromMetadata(peerId, metadata) {
    if (!metadata || !metadata.publicKey) {
      return false;
    }

    return this.trustPeerPublicKey(peerId, metadata.publicKey);
  }

  getPublicKey() {
    return this.securityService.getPublicKey();
  }

  async connectToPeer(peerId) {
    if (!peerId || peerId === this.nodeId) {
      return null;
    }

    if (typeof this.networkAdapter.connectToPeer !== 'function') {
      throw new Error('Network adapter does not support connectToPeer');
    }

    return this.networkAdapter.connectToPeer(peerId);
  }

  getConnectionStats() {
    const adapter = this.networkAdapter;
    if (!adapter) {
      return { openCount: 0, peerIds: [] };
    }

    const peerIds = typeof adapter.listOpenPeerIds === 'function'
      ? adapter.listOpenPeerIds()
      : [];

    const openCount = typeof adapter.getOpenConnectionCount === 'function'
      ? adapter.getOpenConnectionCount()
      : peerIds.length;

    return { openCount, peerIds };
  }

  async ensureConnectedToPeers(peerIds = []) {
    const normalized = [...new Set((peerIds || []).filter(Boolean))];
    const results = [];

    for (const peerId of normalized) {
      if (peerId === this.nodeId) {
        continue;
      }

      try {
        await this.connectToPeer(peerId);
        results.push({ peerId, ok: true });
      } catch (error) {
        this.emit('warning', { type: 'peer-connect-failed', peerId, error });
        results.push({ peerId, ok: false, error });
      }
    }

    return results;
  }

  async broadcastMessage(messageType, payload, securityContext = {}) {
    const connectToPeers = securityContext.connectToPeers;
    if (Array.isArray(connectToPeers) && connectToPeers.length > 0) {
      await this.ensureConnectedToPeers(connectToPeers);
      await this.enforceConnectionBudget();
    }

    const envelope = await this.securityService.secureOutgoingMessage({
      messageType,
      payload,
      targetId: null,
      securityContext
    });

    const fanoutPeerIds = securityContext.fanoutPeerIds;
    if (
      Array.isArray(fanoutPeerIds)
      && fanoutPeerIds.length > 0
      && typeof this.networkAdapter.sendToPeers === 'function'
    ) {
      await this.networkAdapter.sendToPeers(envelope, fanoutPeerIds);
      return;
    }

    await this.networkAdapter.broadcast(envelope);
  }

  async sendDirectMessage(targetId, messageType, payload) {
    if (targetId) {
      try {
        await this.connectToPeer(targetId);
      } catch (error) {
        this.emit('warning', { type: 'direct-message-connect-failed', targetId, error });
      }
    }

    const envelope = await this.securityService.secureOutgoingMessage({
      messageType,
      payload,
      targetId
    });

    if (targetId && typeof this.networkAdapter.sendToPeers === 'function') {
      await this.networkAdapter.sendToPeers(envelope, [targetId]);
      return;
    }

    await this.networkAdapter.broadcast(envelope);
  }

  peerGroupScopeFor(groupId) {
    return peerGroupScope(groupId);
  }

  getPeerGroupConfig(groupId) {
    return this.peerGroups.get(groupId) || null;
  }

  listPeerGroupMembers(groupId, options = {}) {
    return this.listPeers(this.peerGroupScopeFor(groupId), options);
  }

  getPeerGroupStats() {
    const adapter = this.networkAdapter;
    const openPeerIds = typeof adapter.listOpenPeerIds === 'function'
      ? adapter.listOpenPeerIds()
      : [];

    return {
      joinedGroups: Array.from(this.peerGroups.keys()),
      seenGossipCount: this.seenGossipIds.size,
      openConnectionCount: openPeerIds.length,
      globalMaxOpenConnections: this.globalMaxOpenConnections
    };
  }

  pruneSeenGossip() {
    const now = this.now();
    for (const [gossipId, expiresAt] of this.seenGossipIds.entries()) {
      if (expiresAt <= now) {
        this.seenGossipIds.delete(gossipId);
      }
    }

    while (this.seenGossipIds.size > this.maxSeenGossipIds) {
      const oldestGossipId = this.seenGossipIds.keys().next().value;
      if (!oldestGossipId) {
        break;
      }
      this.seenGossipIds.delete(oldestGossipId);
    }
  }

  hasSeenGossip(gossipId) {
    if (!gossipId) {
      return false;
    }

    this.pruneSeenGossip();
    return this.seenGossipIds.has(gossipId);
  }

  markSeenGossip(gossipId) {
    if (!gossipId) {
      return;
    }

    this.seenGossipIds.set(gossipId, this.now() + this.gossipIdTtlMs);
    this.pruneSeenGossip();
  }

  listConnectedPeerIds() {
    if (typeof this.networkAdapter.listOpenPeerIds === 'function') {
      return this.networkAdapter.listOpenPeerIds();
    }
    return [];
  }

  selectPeerGroupFanout(groupId, count, excludePeerIds = [], fanoutOptions = {}) {
    const scope = this.peerGroupScopeFor(groupId);
    const group = this.peerGroups.get(groupId);
    let peers = this.listPeers(scope, { includeSelf: false });

    if (group && group.tiered && fanoutOptions.tier) {
      peers = filterPeersByTier(peers, fanoutOptions.tier);
    }

    if (fanoutOptions.bulkRelayOnly) {
      peers = peers.filter((peer) => peer.metadata?.bulkRelay === true);
    }

    return selectFanoutPeers({
      peers,
      count,
      excludePeerIds: [...excludePeerIds, this.nodeId],
      connectedPeerIds: this.listConnectedPeerIds()
    });
  }

  async enforceConnectionBudget() {
    const adapter = this.networkAdapter;
    if (typeof adapter.listOpenPeerIds !== 'function' || typeof adapter.disconnectPeer !== 'function') {
      return;
    }

    const openPeerIds = adapter.listOpenPeerIds();
    if (openPeerIds.length <= this.globalMaxOpenConnections) {
      return;
    }

    const excess = openPeerIds.length - this.globalMaxOpenConnections;
    const toClose = openPeerIds.slice(0, excess);
    for (const peerId of toClose) {
      try {
        await adapter.disconnectPeer(peerId);
      } catch (error) {
        this.emit('warning', { type: 'peer-disconnect-failed', peerId, error });
      }
    }
  }

  async joinPeerGroup(groupId, options = {}) {
    if (!groupId) {
      throw new Error('joinPeerGroup requires groupId');
    }

    const scope = this.peerGroupScopeFor(groupId);
    const role = options.role || options.metadata?.role || 'subscriber';
    const tierMode = options.tierMode || 'auto';
    const tiered = options.tiered === true
      || options.tierMode !== undefined
      || options.role !== undefined
      || typeof options.liveCap === 'number';
    const liveCap = typeof options.liveCap === 'number' ? options.liveCap : DEFAULT_LIVE_CAP;
    const existingMembers = this.listPeerGroupMembers(groupId, { includeSelf: false });
    const existingSubscriberCount = existingMembers.filter((member) => {
      const memberRole = member.metadata?.peerGroupRole || member.metadata?.role;
      return memberRole !== 'publisher';
    }).length;
    let assignedTier = tiered
      ? assignPeerGroupTier({
        joinIndex: existingSubscriberCount,
        liveCap,
        requestedTier: tierMode === 'auto' ? null : tierMode,
        role
      })
      : null;
    const publisherId = options.publisherId || (role === 'publisher' ? this.nodeId : null);

    const config = {
      fanout: typeof options.fanout === 'number' ? options.fanout : this.defaultPeerGroupFanout,
      maxActivePeers: typeof options.maxActivePeers === 'number'
        ? options.maxActivePeers
        : this.defaultPeerGroupMaxActivePeers,
      maxHops: typeof options.maxHops === 'number' ? options.maxHops : this.defaultGossipMaxHops,
      relayEnabled: options.relayEnabled !== false,
      tiered,
      tierMode,
      liveCap,
      bulkIntervalMs: typeof options.bulkIntervalMs === 'number'
        ? options.bulkIntervalMs
        : DEFAULT_BULK_INTERVAL_MS,
      domainEvents: options.domainEvents !== false,
      autoPublishDomainEvents: options.autoPublishDomainEvents !== false,
      role,
      publisherId,
      commandCapable: options.commandCapable !== false,
      peerGroupTier: assignedTier
    };

    await this.joinDiscovery(scope, {
      metadata: {
        peerGroup: groupId,
        ...(assignedTier ? { peerGroupTier: assignedTier } : {}),
        peerGroupRole: role,
        ...(publisherId ? { publisherId } : {}),
        bulkRelay: false,
        ...(options.metadata || {})
      },
      bootstrapPeerIds: options.bootstrapPeerIds,
      heartbeatIntervalMs: options.heartbeatIntervalMs,
      ttlMs: options.ttlMs
    });

    this.peerGroups.set(groupId, config);
    if (!this.domainEventLogs.has(groupId)) {
      this.domainEventLogs.set(groupId, []);
    }
    if (!this.replicaViews.has(groupId)) {
      this.replicaViews.set(groupId, createEmptyView());
    }

    this.refreshBulkRelays(groupId);
    if (tiered && tierMode === 'auto' && role === 'subscriber') {
      assignedTier = this.recalculateOwnPeerGroupTier(groupId) || assignedTier;
      config.peerGroupTier = assignedTier;
    }
    this.emit('peergroupjoined', { groupId, config, tier: assignedTier });
    return config;
  }

  recalculateOwnPeerGroupTier(groupId) {
    const group = this.peerGroups.get(groupId);
    if (!group || !group.tiered || group.role !== 'subscriber') {
      return group ? group.peerGroupTier : null;
    }

    if (group.tierMode !== 'auto') {
      return group.peerGroupTier;
    }

    const scope = this.peerGroupScopeFor(groupId);
    const members = this.listPeerGroupMembers(groupId, { includeSelf: true });
    const subscribers = members
      .filter((member) => {
        const memberRole = member.metadata?.peerGroupRole || member.metadata?.role;
        return memberRole !== 'publisher';
      })
      .map((member) => member.peerId)
      .sort();

    const joinIndex = subscribers.indexOf(this.nodeId);
    if (joinIndex < 0) {
      return group.peerGroupTier;
    }

    const newTier = assignPeerGroupTier({
      joinIndex,
      liveCap: group.liveCap,
      requestedTier: null,
      role: 'subscriber'
    });

    if (newTier === group.peerGroupTier) {
      return newTier;
    }

    group.peerGroupTier = newTier;
    const room = this.discoveryRooms.get(scope);
    if (room) {
      room.metadata = {
        ...(room.metadata || {}),
        peerGroupTier: newTier
      };
      this.upsertPresence(scope, this.nodeId, room.metadata, room.ttlMs, this.now());
      this.announcePresence(scope).catch((error) => {
        this.emit('warning', { type: 'tier-announce-failed', groupId, error });
      });
    }

    return newTier;
  }

  async leavePeerGroup(groupId) {
    if (!groupId) {
      return;
    }

    const scope = this.peerGroupScopeFor(groupId);
    await this.leaveDiscovery(scope);
    this.peerGroups.delete(groupId);
    this.bulkRelayByGroup.delete(groupId);
    this.emit('peergroupleft', { groupId });
  }

  async publishToPeerGroup(groupId, innerMessageType, innerPayload, options = {}) {
    if (!groupId) {
      throw new Error('publishToPeerGroup requires groupId');
    }

    const group = this.peerGroups.get(groupId);
    if (!group && options.allowUnjoined !== true) {
      throw new Error(`PeerGroup ${groupId} has not been joined`);
    }

    if (this.gossipPublishMinIntervalMs > 0) {
      const lastPublishAt = this.lastGossipPublishAt.get(groupId) || 0;
      const elapsed = this.now() - lastPublishAt;
      if (elapsed < this.gossipPublishMinIntervalMs) {
        const error = new Error(`Gossip publish rate limit exceeded for group ${groupId}`);
        error.code = 'GOSSIP_RATE_LIMIT';
        throw error;
      }
    }

    const fanout = typeof options.fanout === 'number'
      ? options.fanout
      : (group ? group.fanout : this.defaultPeerGroupFanout);
    const maxActivePeers = group ? group.maxActivePeers : this.defaultPeerGroupMaxActivePeers;
    const maxHop = typeof options.maxHops === 'number'
      ? options.maxHops
      : (group ? group.maxHops : this.defaultGossipMaxHops);

    const fanoutOptions = {};
    if (group && group.tiered && options.tier !== 'bulk') {
      fanoutOptions.tier = options.tier || 'live';
    }

    const fanoutPeerIds = this.selectPeerGroupFanout(groupId, fanout, [this.nodeId], fanoutOptions);
    if (fanoutPeerIds.length > 0) {
      await this.ensureConnectedToPeers(fanoutPeerIds.slice(0, maxActivePeers));
      await this.enforceConnectionBudget();
    }

    const gossipId = options.gossipId || this.idGenerator();
    this.markSeenGossip(gossipId);
    this.lastGossipPublishAt.set(groupId, this.now());

    await this.broadcastMessage('peer-group:gossip', {
      groupId,
      gossipId,
      publisherId: this.nodeId,
      hop: 0,
      maxHop,
      innerMessageType,
      innerPayload
    }, {
      broadcastScope: this.peerGroupScopeFor(groupId),
      fanoutPeerIds
    });

    return { gossipId, fanoutPeerIds };
  }

  async publishPeerGroupBulk(groupId, innerMessageType, innerPayload, options = {}) {
    const group = this.peerGroups.get(groupId);
    if (!group && options.allowUnjoined !== true) {
      throw new Error(`PeerGroup ${groupId} has not been joined`);
    }

    if (group && group.role !== 'publisher') {
      throw new Error(`Only publisher can bulk-publish to PeerGroup ${groupId}`);
    }

    const fanout = typeof options.fanout === 'number'
      ? options.fanout
      : (group ? group.fanout : this.defaultPeerGroupFanout);
    const maxActivePeers = group ? group.maxActivePeers : this.defaultPeerGroupMaxActivePeers;
    const maxHop = typeof options.maxHops === 'number'
      ? options.maxHops
      : (group ? group.maxHops : this.defaultGossipMaxHops);

    const fanoutPeerIds = this.selectPeerGroupFanout(
      groupId,
      fanout,
      [this.nodeId],
      { tier: 'bulk', bulkRelayOnly: group?.tiered === true }
    );

    if (fanoutPeerIds.length > 0) {
      await this.ensureConnectedToPeers(fanoutPeerIds.slice(0, maxActivePeers));
      await this.enforceConnectionBudget();
    }

    const gossipId = options.gossipId || this.idGenerator();
    this.markSeenGossip(gossipId);

    await this.broadcastMessage('peer-group:gossip', {
      groupId,
      gossipId,
      publisherId: this.nodeId,
      hop: 0,
      maxHop,
      deliveryTier: 'bulk',
      innerMessageType,
      innerPayload
    }, {
      broadcastScope: this.peerGroupScopeFor(groupId),
      fanoutPeerIds
    });

    return { gossipId, fanoutPeerIds };
  }

  async publishPeerGroupCheckpoint(groupId, options = {}) {
    const group = this.peerGroups.get(groupId);
    if (!group) {
      throw new Error(`PeerGroup ${groupId} has not been joined`);
    }

    const events = this.domainEventLogs.get(groupId) || [];
    const checkpoint = buildCheckpoint(groupId, events, {
      publisherId: options.publisherId || group.publisherId || this.nodeId
    });

    await this.publishPeerGroupBulk(groupId, 'domain:checkpoint', checkpoint, options);
    this.emit('checkpointpublished', { groupId, checkpoint });
    return checkpoint;
  }

  resolvePublisherGroupIds(options = {}) {
    if (options.peerGroupId) {
      return [options.peerGroupId];
    }

    const groups = [];
    for (const [groupId, config] of this.peerGroups.entries()) {
      if (config.domainEvents && config.autoPublishDomainEvents && config.role === 'publisher') {
        groups.push(groupId);
      }
    }
    return groups;
  }

  async maybePublishDomainEvent(operation, options = {}) {
    const groupIds = this.resolvePublisherGroupIds(options);
    if (groupIds.length === 0) {
      return;
    }

    for (const groupId of groupIds) {
      await this.publishDomainEventForOperation(groupId, operation);
    }
  }

  async publishDomainEventForOperation(groupId, operation) {
    const group = this.peerGroups.get(groupId);
    if (!group || !group.domainEvents) {
      return null;
    }

    if (group.role !== 'publisher') {
      throw new Error(`Only publisher can emit domain events for PeerGroup ${groupId}`);
    }

    const prevHash = this.lastEventHashByGroup.get(groupId) || null;
    let event = operationToDomainEvent(operation, {
      publisherId: this.nodeId,
      groupId,
      prevHash,
      eventIdGenerator: () => this.idGenerator()
    });

    if (this.securityService.options.signingEnabled && this.securityService.signingSecretKey) {
      event = signDomainEvent(event, this.securityService.signingSecretKey);
    }

    const log = this.domainEventLogs.get(groupId) || [];
    log.push(event);
    this.domainEventLogs.set(groupId, log);
    this.lastEventHashByGroup.set(groupId, event.eventHash);

    this.emit('domainevent', event);

    if (group.autoPublishDomainEvents) {
      await this.publishToPeerGroup(groupId, 'domain:event', event, { tier: 'live' });
      if (group.tiered) {
        await this.publishPeerGroupBulk(groupId, 'domain:event', event);
      }
    }

    return event;
  }

  refreshBulkRelays(groupId) {
    const group = this.peerGroups.get(groupId);
    if (!group || !group.tiered) {
      return [];
    }

    const peers = this.listPeerGroupMembers(groupId, { includeSelf: false });
    const relays = electBulkRelays(peers);
    const previous = this.bulkRelayByGroup.get(groupId) || [];
    this.bulkRelayByGroup.set(groupId, relays);

    const changed = previous.length !== relays.length
      || previous.some((id, index) => id !== relays[index]);

    if (changed) {
      this.emit('bulkrelaychanged', { groupId, relays, previous });
    }

    return relays;
  }

  ingestRemoteDomainEvent(event, context = {}) {
    const groupId = event.groupId || context.groupId;
    if (!groupId) {
      return false;
    }

    const group = this.peerGroups.get(groupId);
    if (!group) {
      return false;
    }

    const publisherId = event.publisherId || context.publisherId;
    if (group.publisherId && publisherId !== group.publisherId) {
      this.emit('warning', {
        type: 'domain-event-rejected',
        groupId,
        reason: 'publisher-mismatch',
        eventId: event.eventId,
        expectedPublisher: group.publisherId,
        actualPublisher: publisherId
      });
      return false;
    }

    let signingPublicKey = null;
    if (this.securityService.options.signingEnabled && publisherId) {
      const peerKey = this.securityService.resolvePeerPublicKey(publisherId, null);
      signingPublicKey = peerKey ? peerKey.signingPublicKey : null;
      if (!signingPublicKey) {
        this.emit('warning', {
          type: 'domain-event-rejected',
          groupId,
          reason: 'missing-publisher-key',
          eventId: event.eventId,
          publisherId
        });
        return false;
      }
    }

    const verified = verifyDomainEvent(event, { signingPublicKey });
    if (!verified.ok) {
      this.emit('warning', {
        type: 'domain-event-rejected',
        groupId,
        reason: verified.reason,
        eventId: event.eventId
      });
      return false;
    }

    if (this.securityService.options.signingEnabled && verified.unsigned) {
      this.emit('warning', {
        type: 'domain-event-rejected',
        groupId,
        reason: 'unsigned-event',
        eventId: event.eventId
      });
      return false;
    }

    if (!this.checkVerificationOnIngest(event.collectionName, {
      verificationHash: event.verificationHash,
      verificationVersion: event.verificationVersion
    }, context.senderId || publisherId)) {
      return false;
    }

    const log = this.domainEventLogs.get(groupId) || [];
    if (log.some((entry) => entry.eventId === event.eventId)) {
      return false;
    }

    const expectedPrev = log.length > 0 ? log[log.length - 1].eventHash : null;
    if (event.prevHash !== expectedPrev) {
      this.emit('chainbroken', {
        groupId,
        expectedPrev,
        actualPrev: event.prevHash,
        eventId: event.eventId
      });
      return false;
    }

    log.push(event);
    this.domainEventLogs.set(groupId, log);
    this.lastEventHashByGroup.set(groupId, event.eventHash);

    if (!group.commandCapable) {
      const view = this.replicaViews.get(groupId) || createEmptyView();
      applyDomainEventToView(view, event);
      this.replicaViews.set(groupId, view);
    }

    this.emit('domainevent', event);
    return true;
  }

  async publishRecordToPeerGroup(groupId, collectionName, id, options = {}) {
    const collection = this.getCollection(collectionName);
    const raw = collection.get(id);
    if (!raw || raw.deletedAt) {
      throw new Error(`Object ${id} does not exist in ${collectionName}`);
    }

    const record = this.normalizeRecord(raw);
    return this.publishToPeerGroup(groupId, 'record:snapshot', {
      collectionName,
      record
    }, options);
  }

  async handlePeerGroupGossip(decrypted) {
    const payload = decrypted.payload || {};
    const {
      groupId,
      gossipId,
      publisherId = decrypted.senderId,
      hop = 0,
      maxHop: payloadMaxHop,
      innerMessageType,
      innerPayload
    } = payload;

    if (!groupId || !innerMessageType || !gossipId) {
      return;
    }

    if (!this.peerGroups.has(groupId)) {
      return;
    }

    if (this.hasSeenGossip(gossipId)) {
      return;
    }

    this.markSeenGossip(gossipId);
    await this.dispatchPeerGroupInnerMessage(innerMessageType, innerPayload, {
      groupId,
      senderId: decrypted.senderId,
      publisherId
    });

    const group = this.peerGroups.get(groupId);
    const deliveryTier = payload.deliveryTier || 'live';

    if (group && group.tiered && group.peerGroupTier === 'bulk' && deliveryTier !== 'bulk') {
      return;
    }

    const configuredMaxHop = group ? group.maxHops : this.defaultGossipMaxHops;
    const maxHop = typeof payloadMaxHop === 'number'
      ? Math.min(payloadMaxHop, configuredMaxHop)
      : configuredMaxHop;

    if (!group || group.relayEnabled === false || hop >= maxHop) {
      return;
    }

    const relayOptions = {};
    if (group.tiered) {
      relayOptions.tier = deliveryTier === 'bulk' ? 'bulk' : 'live';
      if (deliveryTier === 'bulk') {
        relayOptions.bulkRelayOnly = true;
      }
    }

    const relayPeers = this.selectPeerGroupFanout(groupId, group.fanout, [
      decrypted.senderId,
      this.nodeId
    ], relayOptions);

    if (relayPeers.length === 0) {
      return;
    }

    await this.ensureConnectedToPeers(relayPeers.slice(0, group.maxActivePeers));
    await this.enforceConnectionBudget();

    await this.broadcastMessage('peer-group:gossip', {
      groupId,
      gossipId,
      publisherId,
      hop: hop + 1,
      maxHop,
      deliveryTier,
      innerMessageType,
      innerPayload
    }, {
      broadcastScope: this.peerGroupScopeFor(groupId),
      fanoutPeerIds: relayPeers
    });
  }

  normalizeGossipOperation(operation, publisherId) {
    if (!operation || !publisherId) {
      return null;
    }

    if (operation.actorId && operation.actorId !== publisherId) {
      this.emit('warning', {
        type: 'gossip-operation-actor-mismatch',
        publisherId,
        actorId: operation.actorId,
        kind: operation.kind,
        collection: operation.collectionName,
        id: operation.id
      });
      return null;
    }

    const normalized = {
      ...operation,
      actorId: publisherId
    };

    if (normalized.kind === 'create') {
      normalized.ownerId = publisherId;
    }

    return normalized;
  }

  async dispatchPeerGroupInnerMessage(innerMessageType, innerPayload, context = {}) {
    if (innerMessageType === 'operation') {
      const operation = this.normalizeGossipOperation(
        innerPayload,
        context.publisherId || context.senderId
      );
      if (operation) {
        this.applyOperation(operation, { senderId: context.senderId });
      }
      return;
    }

    if (innerMessageType === 'domain:event') {
      this.ingestRemoteDomainEvent(innerPayload, context);
      return;
    }

    if (innerMessageType === 'domain:checkpoint') {
      this.emit('peergroupmessage', {
        groupId: context.groupId,
        senderId: context.senderId,
        type: 'domain:checkpoint',
        payload: innerPayload
      });
      return;
    }

    if (innerMessageType === 'record:snapshot') {
      const { collectionName, record } = innerPayload || {};
      if (collectionName && record) {
        const applied = this.restoreRecord(collectionName, record, {
          rejectOnHashMismatch: true,
          rejectOnOwnershipMismatch: true,
          via: 'peer-group',
          senderId: context.senderId
        });
        if (applied) {
          this.emit('change', {
            kind: 'snapshot',
            collection: collectionName,
            id: record.id,
            via: 'peer-group',
            groupId: context.groupId
          });
        }
      }
      return;
    }

    this.emit('peergroupmessage', {
      groupId: context.groupId,
      senderId: context.senderId,
      type: innerMessageType,
      payload: innerPayload
    });
  }

  getPresenceMap(scope) {
    if (!this.presenceByScope.has(scope)) {
      this.presenceByScope.set(scope, new Map());
    }

    return this.presenceByScope.get(scope);
  }

  upsertPresence(scope, peerId, metadata, ttlMs, announcedAt) {
    const map = this.getPresenceMap(scope);
    const existing = map.get(peerId);
    const next = {
      peerId,
      scope,
      metadata: metadata ? { ...metadata } : {},
      lastSeenAt: announcedAt,
      expiresAt: announcedAt + ttlMs
    };
    map.set(peerId, next);

    this.trustPeerFromMetadata(peerId, next.metadata);

    const groupId = parsePeerGroupScope(scope);
    if (groupId && this.peerGroups.has(groupId)) {
      this.refreshBulkRelays(groupId);
      if (peerId !== this.nodeId) {
        this.recalculateOwnPeerGroupTier(groupId);
      }
    }

    if (!existing) {
      this.emit('peerdiscovered', { scope, peerId, metadata: next.metadata });
    }

    return next;
  }

  prunePresence(scope) {
    const map = this.presenceByScope.get(scope);
    if (!map) {
      return;
    }

    const now = this.now();
    for (const [peerId, entry] of map.entries()) {
      if (entry.expiresAt <= now) {
        map.delete(peerId);
        this.emit('peerleft', { scope, peerId, reason: 'timeout' });
      }
    }
  }

  async joinDiscovery(scope = 'main', options = {}) {
    const normalizedScope = scope || 'main';
    const heartbeatIntervalMs = options.heartbeatIntervalMs || this.defaultDiscoveryHeartbeatMs;
    const ttlMs = options.ttlMs || this.defaultPresenceTtlMs;
    const metadata = {
      publicKey: this.getPublicKey(),
      ...this._buildDiscoveryVerificationMetadata(),
      ...(options.metadata || {})
    };
    const bootstrapPeerIds = Array.isArray(options.bootstrapPeerIds)
      ? [...new Set(options.bootstrapPeerIds.filter(Boolean))]
      : [];

    const existing = this.discoveryRooms.get(normalizedScope);
    if (existing && existing.timer) {
      clearInterval(existing.timer);
    }

    if (bootstrapPeerIds.length > 0) {
      await this.ensureConnectedToPeers(bootstrapPeerIds);
    }

    const timer = setInterval(() => {
      this.announcePresence(normalizedScope).catch((error) => {
        this.emit('warning', { type: 'presence-heartbeat-failed', scope: normalizedScope, error });
      });
    }, heartbeatIntervalMs);

    this.discoveryRooms.set(normalizedScope, {
      metadata,
      bootstrapPeerIds,
      heartbeatIntervalMs,
      ttlMs,
      timer
    });

    this.upsertPresence(normalizedScope, this.nodeId, metadata, ttlMs, this.now());
    await this.announcePresence(normalizedScope);
  }

  async announcePresence(scope = 'main', metadataOverride = null) {
    const normalizedScope = scope || 'main';
    const room = this.discoveryRooms.get(normalizedScope);
    if (!room) {
      throw new Error(`Scope ${normalizedScope} has not been joined for discovery`);
    }

    const metadata = metadataOverride || room.metadata || {};
    const announcedAt = this.now();
    this.upsertPresence(normalizedScope, this.nodeId, metadata, room.ttlMs, announcedAt);

    await this.broadcastMessage(
      'presence:announce',
      {
        scope: normalizedScope,
        peerId: this.nodeId,
        metadata,
        ttlMs: room.ttlMs,
        announcedAt
      },
      { broadcastScope: normalizedScope }
    );
  }

  async leaveDiscovery(scope = 'main') {
    const normalizedScope = scope || 'main';
    const room = this.discoveryRooms.get(normalizedScope);
    if (!room) {
      return;
    }

    if (room.timer) {
      clearInterval(room.timer);
    }
    this.discoveryRooms.delete(normalizedScope);

    const map = this.presenceByScope.get(normalizedScope);
    if (map) {
      map.delete(this.nodeId);
    }

    await this.broadcastMessage(
      'presence:leave',
      {
        scope: normalizedScope,
        peerId: this.nodeId,
        leftAt: this.now()
      },
      { broadcastScope: normalizedScope }
    );
  }

  listPeers(scope = 'main', options = {}) {
    const normalizedScope = scope || 'main';
    const includeSelf = options.includeSelf !== false;
    this.prunePresence(normalizedScope);

    const map = this.presenceByScope.get(normalizedScope);
    if (!map) {
      return [];
    }

    return Array.from(map.values())
      .filter((entry) => includeSelf || entry.peerId !== this.nodeId)
      .map((entry) => ({
        peerId: entry.peerId,
        scope: entry.scope,
        metadata: { ...entry.metadata },
        lastSeenAt: entry.lastSeenAt,
        expiresAt: entry.expiresAt
      }));
  }

  async handleIncomingMessage(message) {
    // Backward compatibility for raw operation payloads (in-memory tests only)
    if (message && message.opId && message.kind) {
      if (this.securityService.options.enabled) {
        this.emit('messageignored', {
          reason: 'raw-operation-rejected',
          hint: 'Unsigned raw operations are disabled when security is enabled'
        });
        return;
      }

      this.applyOperation(message);
      return;
    }

    if (message && message.senderId && this.isPeerBanned(message.senderId)) {
      this.emit('messageignored', {
        senderId: message.senderId,
        reason: 'peer-banned'
      });
      return;
    }

    let decrypted;
    try {
      decrypted = await this.securityService.decryptIncomingMessage(message);
    } catch (error) {
      const senderId = message ? message.senderId : null;
      if (senderId && (error.code === 'INVALID_SIGNATURE' || error.code === 'INVALID_POW')) {
        this.banPeer(senderId, this.peerBanDurationMs, error.code);
      }

      this.emit('securityerror', {
        senderId,
        error
      });
      return;
    }

    if (!decrypted || decrypted.ignored) {
      return;
    }

    if (decrypted.messageType === 'identity:rotate') {
      const peerId = decrypted.senderId || decrypted.payload?.username;
      if (peerId && decrypted.payload) {
        const result = this.applyPeerIdentityRotation(peerId, decrypted.payload);
        if (!result.applied) {
          this.emit('warning', {
            type: 'identity-rotation-ignored',
            peerId,
            reason: result.reason
          });
        }
      }
      return;
    }

    if (decrypted.messageType === 'identity:cold-enroll') {
      const peerId = decrypted.senderId || decrypted.payload?.username;
      if (peerId && decrypted.payload) {
        try {
          this.applyPeerColdRecoveryEnrollment(peerId, decrypted.payload);
        } catch (error) {
          this.emit('warning', {
            type: 'cold-recovery-enrollment-rejected',
            peerId,
            error
          });
        }
      }
      return;
    }

    if (message && message.senderId && message.senderPublicKey) {
      this.trustPeerPublicKey(message.senderId, message.senderPublicKey);
    }

    if (decrypted.messageType === 'operation') {
      this.applyOperation(decrypted.payload, { senderId: decrypted.senderId });
      return;
    }

    if (decrypted.messageType === 'record:snapshot') {
      const payload = decrypted.payload || {};
      const { collectionName, record } = payload;

      if (collectionName && record) {
        const applied = this.restoreRecord(collectionName, record, {
          rejectOnHashMismatch: true,
          via: 'direct-mesh',
          senderId: decrypted.senderId
        });
        if (applied) {
          this.emit('change', {
            kind: 'snapshot',
            collection: collectionName,
            id: record.id
          });
        }
      }
      return;
    }

    if (decrypted.messageType === 'presence:announce') {
      const payload = decrypted.payload || {};
      const scope = payload.scope || 'main';
      const peerId = payload.peerId || decrypted.senderId;
      if (!peerId || peerId !== decrypted.senderId) {
        return;
      }

      if (!this.discoveryRooms.has(scope)) {
        return;
      }

      const room = this.discoveryRooms.get(scope);
      const presenceMap = this.getPresenceMap(scope);
      const isNewPeerInScope = !presenceMap.has(peerId);
      const requestedTtl = typeof payload.ttlMs === 'number' ? payload.ttlMs : room.ttlMs;
      const ttlMs = Math.min(requestedTtl, room.ttlMs);

      this.upsertPresence(
        scope,
        peerId,
        payload.metadata || {},
        ttlMs,
        this.now()
      );

      if (payload.metadata && payload.metadata.publicKey) {
        this.trustPeerPublicKey(peerId, payload.metadata.publicKey);
      }

      // Discovery handshake: when a new peer appears in a joined scope,
      // send our current presence so late joiners quickly converge.
      if (isNewPeerInScope && peerId !== this.nodeId && this.discoveryRooms.has(scope)) {
        if (typeof this.networkAdapter.connectToPeer === 'function') {
          Promise.resolve(this.connectToPeer(peerId)).catch((error) => {
            this.emit('warning', { type: 'peer-connect-failed', scope, peerId, error });
          });
        }

        this.announcePresence(scope).catch((error) => {
          this.emit('warning', { type: 'presence-handshake-failed', scope, error });
        });
      }
      return;
    }

    if (decrypted.messageType === 'presence:leave') {
      const payload = decrypted.payload || {};
      const scope = payload.scope || 'main';
      const peerId = payload.peerId || decrypted.senderId;
      if (!peerId || peerId !== decrypted.senderId) {
        return;
      }

      const map = this.presenceByScope.get(scope);
      if (map && peerId && map.has(peerId)) {
        map.delete(peerId);
        this.emit('peerleft', { scope, peerId, reason: 'leave' });
      }
      return;
    }

    if (decrypted.messageType === 'peer-group:gossip') {
      await this.handlePeerGroupGossip(decrypted);
      return;
    }

    if (decrypted.messageType === 'proposal') {
      const payload = decrypted.payload || {};
      if (!payload.proposalId || payload.proposerId !== decrypted.senderId) {
        return;
      }

      if (!payload.patch || typeof payload.patch !== 'object' || Array.isArray(payload.patch)) {
        return;
      }

      const record = this.read(payload.collection, payload.id);
      if (!record || record.ownerId !== this.nodeId) {
        return;
      }

      if (this.isPeerBanned(decrypted.senderId)) {
        return;
      }

      this.emit('proposal', {
        proposalId: payload.proposalId,
        collection: payload.collection,
        id: payload.id,
        patch: payload.patch,
        proposerId: decrypted.senderId,
        baseVersion: payload.baseVersion
      });
      return;
    }

    if (decrypted.messageType === 'proposal:result') {
      this.emit('proposalresult', {
        ...decrypted.payload,
        fromPeerId: decrypted.senderId
      });
      return;
    }

    this.emit('message', {
      senderId: decrypted.senderId,
      targetId: decrypted.targetId,
      type: decrypted.messageType,
      payload: decrypted.payload
    });
  }

  banPeer(peerId, durationMs = this.peerBanDurationMs, reason = 'manual') {
    if (!peerId) {
      return;
    }

    const bannedUntil = this.now() + Math.max(1, durationMs);
    this.bannedPeers.set(peerId, {
      peerId,
      reason,
      bannedAt: this.now(),
      bannedUntil
    });

    this.emit('peerbanned', {
      peerId,
      reason,
      bannedUntil
    });
  }

  unbanPeer(peerId) {
    this.bannedPeers.delete(peerId);
    this.emit('peerunbanned', { peerId });
  }

  getBanInfo(peerId) {
    const info = this.bannedPeers.get(peerId);
    if (!info) {
      return null;
    }

    if (info.bannedUntil <= this.now()) {
      this.bannedPeers.delete(peerId);
      return null;
    }

    return { ...info };
  }

  isPeerBanned(peerId) {
    return this.getBanInfo(peerId) !== null;
  }

  emitConflict(details) {
    this.emit('conflict', details);
  }

  restoreRecord(collectionName, record, options = {}) {
    if (!record || !record.id) {
      return false;
    }

    if (options.senderId && !this.checkVerificationOnIngest(collectionName, {
      verificationHash: record.verificationHash,
      verificationVersion: record.verificationVersion
    }, options.senderId)) {
      return false;
    }

    const collection = this.getCollection(collectionName);
    const current = collection.get(record.id);
    if (current && current.version >= record.version) {
      return false;
    }

    const restoredData = { ...(record.data || {}) };
    const computedHash = computeContentHash(restoredData);
    const rejectOnHashMismatch = options.rejectOnHashMismatch === true;
    const rejectOnOwnershipMismatch = options.rejectOnOwnershipMismatch === true;

    if (
      rejectOnOwnershipMismatch
      && current
      && record.ownerId
      && current.ownerId !== record.ownerId
    ) {
      this.emit('warning', {
        type: 'ownership-mismatch',
        collection: collectionName,
        id: record.id,
        currentOwnerId: current.ownerId,
        advertisedOwnerId: record.ownerId,
        via: options.via || null
      });
      return false;
    }

    if (!record.hash) {
      const warning = {
        type: 'content-hash-missing',
        collection: collectionName,
        id: record.id,
        via: options.via || null
      };
      this.emit('warning', warning);
      if (rejectOnHashMismatch) {
        return false;
      }
    } else if (record.hash !== computedHash) {
      this.emit('warning', {
        type: 'content-hash-mismatch',
        collection: collectionName,
        id: record.id,
        advertisedHash: record.hash,
        computedHash,
        via: options.via || null
      });
      if (rejectOnHashMismatch) {
        return false;
      }
    }

    collection.set(record.id, {
      id: record.id,
      ownerId: record.ownerId,
      collaboratorIds: this.normalizeCollaboratorIds(record.collaboratorIds),
      data: restoredData,
      hash: computedHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt || null,
      version: record.version
    });

    return true;
  }

  async pushRecordSnapshot(collectionName, id, options = {}) {
    const collection = this.getCollection(collectionName);
    const raw = collection.get(id);

    if (!raw || raw.deletedAt) {
      throw new Error(`Object ${id} does not exist in ${collectionName}`);
    }

    const record = {
      id: raw.id,
      ownerId: raw.ownerId,
      collaboratorIds: Array.isArray(raw.collaboratorIds) ? [...raw.collaboratorIds] : [],
      data: { ...(raw.data || {}) },
      hash: raw.hash || computeContentHash(raw.data || {}),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt || null,
      version: raw.version
    };

    const verificationEntry = this.resolveVerificationEntry(collectionName, this.nodeId);
    if (verificationEntry) {
      record.verificationHash = verificationEntry.hash;
      if (verificationEntry.version) {
        record.verificationVersion = verificationEntry.version;
      }
    }

    await this.broadcastMessage('record:snapshot', { collectionName, record }, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'record:snapshot',
        collectionName,
        id
      }),
      connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: raw })
    });

    return record;
  }

  pruneAppliedOperations() {
    while (this.appliedOperations.size > this.maxAppliedOperations) {
      const oldestOpId = this.appliedOperations.keys().next().value;
      if (!oldestOpId) {
        break;
      }
      this.appliedOperations.delete(oldestOpId);
    }
  }

  applyOperation(operation, options = {}) {
    if (!operation || !operation.opId || this.appliedOperations.has(operation.opId)) {
      return false;
    }

    if (options.senderId && !this.checkVerificationOnIngest(operation.collectionName, {
      verificationHash: operation.verificationHash,
      verificationVersion: operation.verificationVersion
    }, options.senderId)) {
      return false;
    }

    const collection = this.getCollection(operation.collectionName);
    const current = collection.get(operation.id);

    if (operation.kind === 'create') {
      if (current && !current.deletedAt) {
        return false;
      }

      collection.set(operation.id, {
        id: operation.id,
        ownerId: operation.ownerId,
        collaboratorIds: this.normalizeCollaboratorIds(operation.collaboratorIds),
        data: { ...(operation.payload || {}) },
        hash: computeContentHash(operation.payload || {}),
        createdAt: operation.timestamp,
        updatedAt: operation.timestamp,
        deletedAt: null,
        version: 1
      });

      this.appliedOperations.set(operation.opId, this.now());
      this.pruneAppliedOperations();
      this.emit('change', { kind: 'create', collection: operation.collectionName, id: operation.id });
      return true;
    }

    if (!current || current.deletedAt) {
      if (operation.kind !== 'create') {
        this.emit('warning', {
          type: 'orphan-operation',
          kind: operation.kind,
          collection: operation.collectionName,
          id: operation.id,
          actorId: operation.actorId,
          hint: 'Peer is missing the record; pushRecordSnapshot from the owner to catch up.'
        });
      }
      return false;
    }

    if (operation.kind === 'transfer-ownership') {
      if (operation.actorId !== current.ownerId) {
        return false;
      }

      if (typeof operation.baseVersion === 'number' && operation.baseVersion !== current.version) {
        this.emitConflict({
          kind: operation.kind,
          collection: operation.collectionName,
          id: operation.id,
          expectedVersion: operation.baseVersion,
          currentVersion: current.version,
          phase: 'remote',
          operation
        });
        return false;
      }

      const previousOwnerId = current.ownerId;
      current.ownerId = operation.newOwnerId;

      if (operation.keepPreviousOwnerAsCollaborator !== false) {
        const collaborators = this.normalizeCollaboratorIds(current.collaboratorIds);
        if (!collaborators.includes(previousOwnerId)) {
          collaborators.push(previousOwnerId);
        }
        current.collaboratorIds = collaborators.filter((peerId) => peerId !== operation.newOwnerId);
      }

      current.updatedAt = operation.timestamp;
      current.version += 1;

      this.appliedOperations.set(operation.opId, this.now());
      this.pruneAppliedOperations();
      this.emit('change', {
        kind: 'transfer-ownership',
        collection: operation.collectionName,
        id: operation.id,
        previousOwnerId,
        newOwnerId: operation.newOwnerId
      });
      return true;
    }

    if (operation.kind === 'delete') {
      if (operation.actorId !== current.ownerId) {
        return false;
      }

      if (typeof operation.baseVersion === 'number' && operation.baseVersion !== current.version) {
        this.emitConflict({
          kind: operation.kind,
          collection: operation.collectionName,
          id: operation.id,
          expectedVersion: operation.baseVersion,
          currentVersion: current.version,
          phase: 'remote',
          operation
        });
        return false;
      }

      current.deletedAt = operation.timestamp;
      current.updatedAt = operation.timestamp;
      current.version += 1;

      this.appliedOperations.set(operation.opId, this.now());
      this.pruneAppliedOperations();
      this.emit('change', { kind: 'delete', collection: operation.collectionName, id: operation.id });
      return true;
    }

    if (!this.canUpdateRecord(current, operation.actorId)) {
      return false;
    }

    if (typeof operation.baseVersion === 'number' && operation.baseVersion !== current.version) {
      this.emitConflict({
        kind: operation.kind,
        collection: operation.collectionName,
        id: operation.id,
        expectedVersion: operation.baseVersion,
        currentVersion: current.version,
        phase: 'remote',
        operation
      });
      return false;
    }

    if (operation.kind === 'update') {
      current.data = {
        ...current.data,
        ...operation.payload
      };
      current.hash = computeContentHash(current.data);

      if (Array.isArray(operation.collaboratorIds) && operation.actorId === current.ownerId) {
        current.collaboratorIds = this.normalizeCollaboratorIds(operation.collaboratorIds);
      }

      current.updatedAt = operation.timestamp;
      current.version += 1;

      this.appliedOperations.set(operation.opId, this.now());
      this.pruneAppliedOperations();
      this.emit('change', { kind: 'update', collection: operation.collectionName, id: operation.id });
      return true;
    }

    return false;
  }
}

module.exports = DignityP2P;
