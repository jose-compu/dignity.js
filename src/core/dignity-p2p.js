const EventEmitter = require('../utils/event-emitter');
const { MessageSecurityService } = require('../security/message-security-service');

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
 * Authorization model:
 * - object creator is the owner
 * - only owner can update or delete
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

    this.state = new Map(); // collection -> Map(id -> record)
    this.appliedOperations = new Set();
    this.boundMessageHandler = this.handleIncomingMessage.bind(this);
  }

  async start() {
    this.networkAdapter.onMessage(this.boundMessageHandler);
    await this.networkAdapter.start(this.nodeId);
  }

  async stop() {
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

    return {
      id: record.id,
      ownerId: record.ownerId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
      data: { ...record.data }
    };
  }

  async create(collectionName, data, options = {}) {
    const collection = this.getCollection(collectionName);
    const id = options.id || this.idGenerator();

    if (collection.has(id) && !collection.get(id).deletedAt) {
      throw new Error(`Object ${id} already exists in ${collectionName}`);
    }

    const timestamp = this.now();
    const operation = {
      opId: this.idGenerator(),
      kind: 'create',
      collectionName,
      id,
      actorId: this.nodeId,
      ownerId: this.nodeId,
      timestamp,
      payload: { ...data }
    };

    this.applyOperation(operation);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
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

    if (existing.ownerId !== this.nodeId) {
      throw new Error(`Only owner ${existing.ownerId} can update object ${id}`);
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

    this.applyOperation(operation);
    await this.broadcastMessage('operation', operation, {
      broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
        messageType: 'operation',
        operation,
        collectionName
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
      })
    });
  }

  registerPeerPublicKey(peerId, publicKey) {
    this.securityService.registerPeerPublicKey(peerId, publicKey);
  }

  getPublicKey() {
    return this.securityService.getPublicKey();
  }

  async broadcastMessage(messageType, payload, securityContext = {}) {
    const envelope = await this.securityService.secureOutgoingMessage({
      messageType,
      payload,
      targetId: null,
      securityContext
    });
    await this.networkAdapter.broadcast(envelope);
  }

  async sendDirectMessage(targetId, messageType, payload) {
    const envelope = await this.securityService.secureOutgoingMessage({
      messageType,
      payload,
      targetId
    });
    await this.networkAdapter.broadcast(envelope);
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
    const metadata = options.metadata || {};

    const existing = this.discoveryRooms.get(normalizedScope);
    if (existing && existing.timer) {
      clearInterval(existing.timer);
    }

    const timer = setInterval(() => {
      this.announcePresence(normalizedScope).catch((error) => {
        this.emit('warning', { type: 'presence-heartbeat-failed', scope: normalizedScope, error });
      });
    }, heartbeatIntervalMs);

    this.discoveryRooms.set(normalizedScope, {
      metadata,
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
    // Backward compatibility for raw operation payloads
    if (message && message.opId && message.kind) {
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

    if (decrypted.messageType === 'operation') {
      this.applyOperation(decrypted.payload);
      return;
    }

    if (decrypted.messageType === 'presence:announce') {
      const payload = decrypted.payload || {};
      const scope = payload.scope || 'main';
      const peerId = payload.peerId || decrypted.senderId;
      if (!peerId) {
        return;
      }

      const presenceMap = this.getPresenceMap(scope);
      const isNewPeerInScope = !presenceMap.has(peerId);

      this.upsertPresence(
        scope,
        peerId,
        payload.metadata || {},
        payload.ttlMs || this.defaultPresenceTtlMs,
        payload.announcedAt || this.now()
      );

      // Discovery handshake: when a new peer appears in a joined scope,
      // send our current presence so late joiners quickly converge.
      if (isNewPeerInScope && peerId !== this.nodeId && this.discoveryRooms.has(scope)) {
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
      const map = this.presenceByScope.get(scope);
      if (map && peerId && map.has(peerId)) {
        map.delete(peerId);
        this.emit('peerleft', { scope, peerId, reason: 'leave' });
      }
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
        data: { ...operation.payload },
        createdAt: operation.timestamp,
        updatedAt: operation.timestamp,
        deletedAt: null,
        version: 1
      });

      this.appliedOperations.add(operation.opId);
      this.emit('change', { kind: 'create', collection: operation.collectionName, id: operation.id });
      return true;
    }

    if (!current || current.deletedAt) {
      return false;
    }

    if (operation.actorId !== current.ownerId) {
      return false;
    }

    if (typeof operation.baseVersion === 'number' && operation.baseVersion !== current.version) {
      return false;
    }

    if (operation.kind === 'update') {
      current.data = {
        ...current.data,
        ...operation.payload
      };
      current.updatedAt = operation.timestamp;
      current.version += 1;

      this.appliedOperations.add(operation.opId);
      this.emit('change', { kind: 'update', collection: operation.collectionName, id: operation.id });
      return true;
    }

    if (operation.kind === 'delete') {
      current.deletedAt = operation.timestamp;
      current.updatedAt = operation.timestamp;
      current.version += 1;

      this.appliedOperations.add(operation.opId);
      this.emit('change', { kind: 'delete', collection: operation.collectionName, id: operation.id });
      return true;
    }

    return false;
  }
}

module.exports = DignityP2P;
