const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('../security/message-security-service');

const DOMAIN_EVENT_SCHEMA_VERSION = 1;

const OPERATION_KIND_TO_EVENT_KIND = {
  create: 'record:created',
  update: 'record:updated',
  delete: 'record:removed',
  'transfer-ownership': 'ownership:transferred'
};

function computeContentHash(data) {
  const canonical = stableStringify(data || {});
  const bytes = naclUtil.decodeUTF8(canonical);
  const hash = nacl.hash(bytes);
  const hex = Array.from(hash, (b) => b.toString(16).padStart(2, '0')).join('');
  return `sha512:${hex}`;
}

function canonicalEventBody(event) {
  return stableStringify({
    schemaVersion: event.schemaVersion,
    eventId: event.eventId,
    groupId: event.groupId,
    publisherId: event.publisherId,
    kind: event.kind,
    collectionName: event.collectionName,
    id: event.id,
    payload: event.payload,
    timestamp: event.timestamp,
    baseVersion: event.baseVersion,
    prevHash: event.prevHash || null,
    newOwnerId: event.newOwnerId || null
  });
}

function computeEventHash(event) {
  const canonical = canonicalEventBody(event);
  const bytes = naclUtil.decodeUTF8(canonical);
  const hash = nacl.hash(bytes);
  const hex = Array.from(hash, (b) => b.toString(16).padStart(2, '0')).join('');
  return `sha512:${hex}`;
}

function operationToDomainEvent(operation, { publisherId, groupId, prevHash, eventIdGenerator }) {
  if (!operation || !publisherId || !groupId) {
    throw new Error('operationToDomainEvent requires operation, publisherId, and groupId');
  }

  const kind = OPERATION_KIND_TO_EVENT_KIND[operation.kind];
  if (!kind) {
    throw new Error(`Unsupported operation kind for domain event: ${operation.kind}`);
  }

  const event = {
    schemaVersion: DOMAIN_EVENT_SCHEMA_VERSION,
    eventId: eventIdGenerator ? eventIdGenerator() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    groupId,
    publisherId,
    kind,
    collectionName: operation.collectionName,
    id: operation.id,
    payload: operation.payload || {},
    timestamp: operation.timestamp,
    baseVersion: operation.baseVersion || null,
    prevHash: prevHash || null,
    newOwnerId: operation.newOwnerId || null,
    eventHash: null,
    signature: null
  };

  event.eventHash = computeEventHash(event);
  return event;
}

function signDomainEvent(event, signingSecretKey) {
  if (!signingSecretKey) {
    return { ...event };
  }

  const unsigned = { ...event, signature: null };
  const eventHash = computeEventHash(unsigned);
  const signature = nacl.sign.detached(
    naclUtil.decodeUTF8(eventHash),
    signingSecretKey
  );

  return {
    ...unsigned,
    eventHash,
    signature: naclUtil.encodeBase64(signature)
  };
}

function verifyDomainEventSignature(event, signingPublicKey) {
  if (!event || !event.eventHash) {
    return { ok: false, reason: 'missing-event-hash' };
  }

  const recomputed = computeEventHash({ ...event, signature: null });
  if (recomputed !== event.eventHash) {
    return { ok: false, reason: 'event-hash-mismatch' };
  }

  if (!event.signature) {
    return { ok: true, unsigned: true };
  }

  if (!signingPublicKey) {
    return { ok: false, reason: 'missing-public-key' };
  }

  const keyBytes = typeof signingPublicKey === 'string'
    ? naclUtil.decodeBase64(signingPublicKey)
    : signingPublicKey;

  const valid = nacl.sign.detached.verify(
    naclUtil.decodeUTF8(event.eventHash),
    naclUtil.decodeBase64(event.signature),
    keyBytes
  );

  return valid ? { ok: true } : { ok: false, reason: 'invalid-signature' };
}

function verifyDomainEvent(event, { signingPublicKey, supportedVersions } = {}) {
  if (!event || typeof event !== 'object') {
    return { ok: false, reason: 'invalid-event' };
  }

  const versions = supportedVersions || [DOMAIN_EVENT_SCHEMA_VERSION];
  if (!versions.includes(event.schemaVersion)) {
    return { ok: false, reason: 'unsupported-schema-version', schemaVersion: event.schemaVersion };
  }

  if (!event.eventId || !event.groupId || !event.publisherId || !event.kind) {
    return { ok: false, reason: 'missing-required-fields' };
  }

  return verifyDomainEventSignature(event, signingPublicKey);
}

function createEmptyView(collections = []) {
  const view = new Map();
  for (const name of collections) {
    view.set(name, new Map());
  }
  return view;
}

function ensureCollectionView(view, collectionName) {
  if (!view.has(collectionName)) {
    view.set(collectionName, new Map());
  }
  return view.get(collectionName);
}

function applyDomainEventToView(view, event, { collectionsFilter } = {}) {
  if (!event || !event.collectionName) {
    return { applied: false, reason: 'invalid-event' };
  }

  if (Array.isArray(collectionsFilter) && collectionsFilter.length > 0
    && !collectionsFilter.includes(event.collectionName)) {
    return { applied: false, reason: 'collection-filtered' };
  }

  const collection = ensureCollectionView(view, event.collectionName);

  if (event.kind === 'record:created') {
    if (collection.has(event.id)) {
      return { applied: false, reason: 'already-exists' };
    }
    collection.set(event.id, {
      id: event.id,
      ownerId: event.publisherId,
      data: { ...(event.payload || {}) },
      hash: computeContentHash(event.payload || {}),
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      deletedAt: null,
      version: 1
    });
    return { applied: true, kind: event.kind };
  }

  const current = collection.get(event.id);
  if (!current || current.deletedAt) {
    if (event.kind === 'record:removed') {
      return { applied: false, reason: 'not-found' };
    }
    return { applied: false, reason: 'missing-record' };
  }

  if (event.kind === 'record:updated') {
    if (typeof event.baseVersion === 'number' && current.version !== event.baseVersion) {
      return { applied: false, reason: 'version-conflict', currentVersion: current.version };
    }
    current.data = { ...current.data, ...(event.payload || {}) };
    current.hash = computeContentHash(current.data);
    current.updatedAt = event.timestamp;
    current.version += 1;
    return { applied: true, kind: event.kind };
  }

  if (event.kind === 'record:removed') {
    if (typeof event.baseVersion === 'number' && current.version !== event.baseVersion) {
      return { applied: false, reason: 'version-conflict', currentVersion: current.version };
    }
    current.deletedAt = event.timestamp;
    current.version += 1;
    return { applied: true, kind: event.kind };
  }

  if (event.kind === 'ownership:transferred') {
    if (typeof event.baseVersion === 'number' && current.version !== event.baseVersion) {
      return { applied: false, reason: 'version-conflict', currentVersion: current.version };
    }
    current.ownerId = event.newOwnerId;
    current.updatedAt = event.timestamp;
    current.version += 1;
    return { applied: true, kind: event.kind };
  }

  return { applied: false, reason: 'unknown-kind' };
}

function verifyEventChain(events, { genesisHash = null } = {}) {
  if (!Array.isArray(events) || events.length === 0) {
    return { ok: true, length: 0 };
  }

  let expectedPrev = genesisHash;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    const prevHash = event.prevHash || null;

    if (prevHash !== expectedPrev) {
      return {
        ok: false,
        reason: 'chain-break',
        index,
        expectedPrev,
        actualPrev: prevHash
      };
    }

    const hashCheck = verifyDomainEventSignature(event, null);
    if (!hashCheck.ok) {
      return { ok: false, reason: hashCheck.reason, index };
    }

    expectedPrev = event.eventHash;
  }

  return { ok: true, length: events.length, lastHash: expectedPrev };
}

function buildCheckpoint(groupId, events, { publisherId } = {}) {
  const chain = verifyEventChain(events);
  return {
    schemaVersion: DOMAIN_EVENT_SCHEMA_VERSION,
    groupId,
    publisherId: publisherId || null,
    lastEventHash: chain.lastHash || null,
    recordCount: events.length,
    timestamp: Date.now()
  };
}

module.exports = {
  DOMAIN_EVENT_SCHEMA_VERSION,
  OPERATION_KIND_TO_EVENT_KIND,
  computeEventHash,
  operationToDomainEvent,
  signDomainEvent,
  verifyDomainEvent,
  verifyDomainEventSignature,
  createEmptyView,
  applyDomainEventToView,
  verifyEventChain,
  buildCheckpoint
};
