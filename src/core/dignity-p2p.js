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

    this.state = new Map(); // collection -> Map(id -> record)
    this.appliedOperations = new Set();
    this.boundMessageHandler = this.handleIncomingMessage.bind(this);
  }

  async start() {
    this.networkAdapter.onMessage(this.boundMessageHandler);
    await this.networkAdapter.start(this.nodeId);
  }

  async stop() {
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
