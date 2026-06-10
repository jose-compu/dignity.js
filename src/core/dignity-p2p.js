const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const EventEmitter = require('../utils/event-emitter');
const { MessageSecurityService, stableStringify } = require('../security/message-security-service');
const {
  DEFAULT_PEER_GROUP_OPTIONS,
  peerGroupScope,
  selectFanoutPeers
} = require('../gossip/peer-group');

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
 * Interface shape is intentionally REST-like:
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
    this.maxAppliedOperations = security && typeof security.maxAppliedOperations === 'number'
      ? security.maxAppliedOperations
      : 50000;

    this.state = new Map(); // collection -> Map(id -> record)
    this.appliedOperations = new Map(); // opId -> appliedAt
    this.boundMessageHandler = this.handleIncomingMessage.bind(this);
  }

  async start() {
    this.networkAdapter.onMessage(this.boundMessageHandler);
    await this.networkAdapter.start(this.nodeId);
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

    this.applyOperation(operation);
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

    this.applyOperation(operation);
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

    this.applyOperation(operation);
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

    this.applyOperation(operation);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
      }),
      connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: existing })
    });
  }

  registerPeerPublicKey(peerId, publicKey) {
    this.securityService.registerPeerPublicKey(peerId, publicKey);
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
  }

  listConnectedPeerIds() {
    if (typeof this.networkAdapter.listOpenPeerIds === 'function') {
      return this.networkAdapter.listOpenPeerIds();
    }
    return [];
  }

  selectPeerGroupFanout(groupId, count, excludePeerIds = []) {
    const scope = this.peerGroupScopeFor(groupId);
    const peers = this.listPeers(scope, { includeSelf: false });
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
    const config = {
      fanout: typeof options.fanout === 'number' ? options.fanout : this.defaultPeerGroupFanout,
      maxActivePeers: typeof options.maxActivePeers === 'number'
        ? options.maxActivePeers
        : this.defaultPeerGroupMaxActivePeers,
      maxHops: typeof options.maxHops === 'number' ? options.maxHops : this.defaultGossipMaxHops,
      relayEnabled: options.relayEnabled !== false
    };

    await this.joinDiscovery(scope, {
      metadata: {
        peerGroup: groupId,
        ...(options.metadata || {})
      },
      bootstrapPeerIds: options.bootstrapPeerIds,
      heartbeatIntervalMs: options.heartbeatIntervalMs,
      ttlMs: options.ttlMs
    });

    this.peerGroups.set(groupId, config);
    this.emit('peergroupjoined', { groupId, config });
    return config;
  }

  async leavePeerGroup(groupId) {
    if (!groupId) {
      return;
    }

    const scope = this.peerGroupScopeFor(groupId);
    await this.leaveDiscovery(scope);
    this.peerGroups.delete(groupId);
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

    const fanout = typeof options.fanout === 'number'
      ? options.fanout
      : (group ? group.fanout : this.defaultPeerGroupFanout);
    const maxActivePeers = group ? group.maxActivePeers : this.defaultPeerGroupMaxActivePeers;
    const maxHop = typeof options.maxHops === 'number'
      ? options.maxHops
      : (group ? group.maxHops : this.defaultGossipMaxHops);

    const fanoutPeerIds = this.selectPeerGroupFanout(groupId, fanout, [this.nodeId]);
    if (fanoutPeerIds.length > 0) {
      await this.ensureConnectedToPeers(fanoutPeerIds.slice(0, maxActivePeers));
      await this.enforceConnectionBudget();
    }

    const gossipId = options.gossipId || this.idGenerator();
    this.markSeenGossip(gossipId);

    await this.broadcastMessage('peer-group:gossip', {
      groupId,
      gossipId,
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
      senderId: decrypted.senderId
    });

    const group = this.peerGroups.get(groupId);
    const configuredMaxHop = group ? group.maxHops : this.defaultGossipMaxHops;
    const maxHop = typeof payloadMaxHop === 'number'
      ? Math.min(payloadMaxHop, configuredMaxHop)
      : configuredMaxHop;

    if (!group || group.relayEnabled === false || hop >= maxHop) {
      return;
    }

    const relayPeers = this.selectPeerGroupFanout(groupId, group.fanout, [
      decrypted.senderId,
      this.nodeId
    ]);

    if (relayPeers.length === 0) {
      return;
    }

    await this.ensureConnectedToPeers(relayPeers.slice(0, group.maxActivePeers));
    await this.enforceConnectionBudget();

    await this.broadcastMessage('peer-group:gossip', {
      groupId,
      gossipId,
      hop: hop + 1,
      maxHop,
      innerMessageType,
      innerPayload
    }, {
      broadcastScope: this.peerGroupScopeFor(groupId),
      fanoutPeerIds: relayPeers
    });
  }

  normalizeGossipOperation(operation, senderId) {
    if (!operation || !senderId) {
      return null;
    }

    if (operation.actorId && operation.actorId !== senderId) {
      this.emit('warning', {
        type: 'gossip-operation-actor-mismatch',
        senderId,
        actorId: operation.actorId,
        kind: operation.kind,
        collection: operation.collectionName,
        id: operation.id
      });
      return null;
    }

    const normalized = {
      ...operation,
      actorId: senderId
    };

    if (normalized.kind === 'create') {
      normalized.ownerId = senderId;
    }

    return normalized;
  }

  async dispatchPeerGroupInnerMessage(innerMessageType, innerPayload, context = {}) {
    if (innerMessageType === 'operation') {
      const operation = this.normalizeGossipOperation(innerPayload, context.senderId);
      if (operation) {
        this.applyOperation(operation);
      }
      return;
    }

    if (innerMessageType === 'record:snapshot') {
      const { collectionName, record } = innerPayload || {};
      if (collectionName && record) {
        const applied = this.restoreRecord(collectionName, record, {
          rejectOnHashMismatch: true,
          rejectOnOwnershipMismatch: true,
          via: 'peer-group'
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

    if (message && message.senderId && message.senderPublicKey) {
      this.trustPeerPublicKey(message.senderId, message.senderPublicKey);
    }

    if (decrypted.messageType === 'operation') {
      this.applyOperation(decrypted.payload);
      return;
    }

    if (decrypted.messageType === 'record:snapshot') {
      const payload = decrypted.payload || {};
      const { collectionName, record } = payload;

      if (collectionName && record) {
        const applied = this.restoreRecord(collectionName, record);
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

  applyOperation(operation) {
    if (!operation || !operation.opId || this.appliedOperations.has(operation.opId)) {
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
