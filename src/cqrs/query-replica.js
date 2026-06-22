const EventEmitter = require('../utils/event-emitter');
const {
  createEmptyView,
  applyDomainEventToView,
  verifyEventChain,
  verifyDomainEvent,
  DOMAIN_EVENT_SCHEMA_VERSION
} = require('./domain-events');

class DignityQueryReplica extends EventEmitter {
  constructor(dignityP2P, { groupId, collections = [], tierMode = 'auto', publisherId = null } = {}) {
    super();

    if (!dignityP2P) {
      throw new Error('DignityQueryReplica requires dignityP2P');
    }
    if (!groupId) {
      throw new Error('DignityQueryReplica requires groupId');
    }

    this.dignity = dignityP2P;
    this.groupId = groupId;
    this.collections = [...collections];
    this.tierMode = tierMode;
    this.publisherId = publisherId;
    this.view = createEmptyView(this.collections);
    this.eventLog = [];
    this.started = false;
    this.boundDomainHandler = this.handleDomainEvent.bind(this);
    this.boundPeerGroupHandler = this.handlePeerGroupMessage.bind(this);
  }

  async start(options = {}) {
    if (this.started) {
      return this;
    }

    await this.dignity.joinPeerGroup(this.groupId, {
      tierMode: this.tierMode,
      role: 'subscriber',
      commandCapable: false,
      domainEvents: true,
      publisherId: this.publisherId,
      liveCap: options.liveCap,
      bulkIntervalMs: options.bulkIntervalMs,
      bootstrapPeerIds: options.bootstrapPeerIds,
      metadata: { role: 'subscriber', replica: true }
    });

    this.dignity.on('domainevent', this.boundDomainHandler);
    this.dignity.on('peergroupmessage', this.boundPeerGroupHandler);
    this.started = true;
    this.emit('started', { groupId: this.groupId });
    return this;
  }

  async stop() {
    if (!this.started) {
      return;
    }

    this.dignity.off('domainevent', this.boundDomainHandler);
    this.dignity.off('peergroupmessage', this.boundPeerGroupHandler);
    await this.dignity.leavePeerGroup(this.groupId);
    this.started = false;
    this.emit('stopped', { groupId: this.groupId });
  }

  handleDomainEvent(event) {
    if (!event || event.groupId !== this.groupId) {
      return;
    }

    if (this.publisherId && event.publisherId !== this.publisherId) {
      return;
    }

    this.ingestEvent(event);
  }

  handlePeerGroupMessage(message) {
    if (!message || message.groupId !== this.groupId) {
      return;
    }

    if (message.type === 'domain:checkpoint') {
      this.emit('checkpoint', message.payload);
    }
  }

  ingestEvent(event, { skipChainCheck = false } = {}) {
    const verified = verifyDomainEvent(event, {
      supportedVersions: [DOMAIN_EVENT_SCHEMA_VERSION]
    });

    if (!verified.ok) {
      this.emit('warning', { type: 'domain-event-rejected', reason: verified.reason, event });
      return false;
    }

    if (!skipChainCheck && this.eventLog.length > 0) {
      const lastHash = this.eventLog[this.eventLog.length - 1].eventHash;
      if (event.prevHash !== lastHash) {
        this.emit('chainbroken', {
          groupId: this.groupId,
          expectedPrev: lastHash,
          actualPrev: event.prevHash,
          eventId: event.eventId
        });
        return false;
      }
    } else if (!skipChainCheck && this.eventLog.length === 0 && event.prevHash) {
      this.emit('chainbroken', {
        groupId: this.groupId,
        expectedPrev: null,
        actualPrev: event.prevHash,
        eventId: event.eventId
      });
      return false;
    }

    const duplicate = this.eventLog.some((entry) => entry.eventId === event.eventId);
    if (duplicate) {
      return false;
    }

    const result = applyDomainEventToView(this.view, event, {
      collectionsFilter: this.collections.length > 0 ? this.collections : null
    });

    if (result.applied || result.reason === 'collection-filtered') {
      this.eventLog.push({ ...event });
      this.emit('change', { event, result });
      return true;
    }

    this.emit('warning', { type: 'domain-event-not-applied', reason: result.reason, event });
    return false;
  }

  read(collectionName, id) {
    const collection = this.view.get(collectionName);
    if (!collection) {
      return null;
    }
    const record = collection.get(id);
    if (!record || record.deletedAt) {
      return null;
    }
    return { ...record, data: { ...record.data } };
  }

  list(collectionName, options = {}) {
    const collection = this.view.get(collectionName);
    if (!collection) {
      return [];
    }

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
      records.push({ ...record, data: { ...record.data } });
    }

    return records;
  }

  verifyChain() {
    const result = verifyEventChain(this.eventLog);
    if (!result.ok) {
      this.emit('chainbroken', { groupId: this.groupId, ...result });
    }
    return result;
  }

  getViewStats() {
    const stats = {
      groupId: this.groupId,
      eventCount: this.eventLog.length,
      collections: {}
    };

    for (const [name, collection] of this.view.entries()) {
      let active = 0;
      let deleted = 0;
      for (const record of collection.values()) {
        if (record.deletedAt) {
          deleted += 1;
        } else {
          active += 1;
        }
      }
      stats.collections[name] = { active, deleted };
    }

    return stats;
  }
}

module.exports = DignityQueryReplica;
