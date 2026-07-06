const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  DOMAIN_EVENT_SCHEMA_VERSION,
  operationToDomainEvent,
  signDomainEvent,
  verifyDomainEvent,
  verifyDomainEventSignature,
  verifyEventChain,
  createEmptyView,
  applyDomainEventToView,
  computeEventHash,
  buildCheckpoint
} = require('../../src/cqrs/domain-events');

describe('domain events', () => {
  test('operationToDomainEvent maps create to record:created', () => {
    const operation = {
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1000,
      payload: { text: 'hello' }
    };

    const event = operationToDomainEvent(operation, {
      publisherId: 'alice',
      groupId: 'feed:alice',
      prevHash: null,
      eventIdGenerator: () => 'evt-1'
    });

    expect(event.schemaVersion).toBe(DOMAIN_EVENT_SCHEMA_VERSION);
    expect(event.kind).toBe('record:created');
    expect(event.eventId).toBe('evt-1');
    expect(event.eventHash).toMatch(/^sha512:/);
    expect(event.prevHash).toBeNull();
  });

  test('update event carries baseVersion', () => {
    const event = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2000,
      baseVersion: 2,
      payload: { text: 'updated' }
    }, {
      publisherId: 'alice',
      groupId: 'feed:alice',
      eventIdGenerator: () => 'evt-2'
    });

    expect(event.kind).toBe('record:updated');
    expect(event.baseVersion).toBe(2);
  });

  test('verifyEventChain detects broken chain', () => {
    const first = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e1' });

    const second = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 1,
      payload: { x: 1 }
    }, { publisherId: 'a', groupId: 'g', prevHash: 'wrong', eventIdGenerator: () => 'e2' });

    expect(verifyEventChain([first]).ok).toBe(true);
    expect(verifyEventChain([first, second]).ok).toBe(false);
  });

  test('applyDomainEventToView materializes records', () => {
    const view = createEmptyView(['posts']);
    const created = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { text: 'hi' }
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e1' });

    expect(applyDomainEventToView(view, created).applied).toBe(true);
    expect(view.get('posts').get('p1').data.text).toBe('hi');

    const updated = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 1,
      payload: { text: 'bye' }
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e2' });

    expect(applyDomainEventToView(view, updated).applied).toBe(true);
    expect(view.get('posts').get('p1').data.text).toBe('bye');
  });

  test('rejects unknown schema version', () => {
    const event = {
      schemaVersion: 99,
      eventId: 'x',
      groupId: 'g',
      publisherId: 'a',
      kind: 'record:created',
      eventHash: 'sha512:abc'
    };

    expect(verifyDomainEvent(event).ok).toBe(false);
  });

  test('computeEventHash is stable', () => {
    const event = operationToDomainEvent({
      kind: 'delete',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 3,
      baseVersion: 2
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e3' });

    expect(computeEventHash(event)).toBe(event.eventHash);
  });

  test('signDomainEvent without key leaves signature null', () => {
    const event = operationToDomainEvent({
      kind: 'create',
      collectionName: 'c',
      id: '1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e' });

    const signed = signDomainEvent(event, null);
    expect(signed.signature).toBeNull();
  });

  test('operationToDomainEvent requires publisher and group', () => {
    expect(() => operationToDomainEvent(null, { publisherId: 'a', groupId: 'g' }))
      .toThrow('requires operation');
    expect(() => operationToDomainEvent({ kind: 'noop' }, { publisherId: 'a', groupId: 'g' }))
      .toThrow('Unsupported operation kind');
  });

  test('sign and verify domain event signature', () => {
    const keys = nacl.sign.keyPair();
    const event = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { x: 1 }
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e1' });

    const signed = signDomainEvent(event, keys.secretKey);
    expect(verifyDomainEventSignature(signed, keys.publicKey).ok).toBe(true);
    expect(verifyDomainEvent(signed, { signingPublicKey: naclUtil.encodeBase64(keys.publicKey) }).ok).toBe(true);
  });

  test('verifyDomainEventSignature rejects tampered hash', () => {
    const event = operationToDomainEvent({
      kind: 'create',
      collectionName: 'c',
      id: '1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e' });
    event.eventHash = 'sha512:dead';
    expect(verifyDomainEventSignature(event, null).ok).toBe(false);
  });

  test('applyDomainEventToView handles delete transfer and conflicts', () => {
    const view = createEmptyView(['posts']);
    const created = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { text: 'hi' }
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e1' });
    applyDomainEventToView(view, created);

    const dup = { ...created, eventId: 'e1-dup' };
    expect(applyDomainEventToView(view, dup).reason).toBe('already-exists');

    const badUpdate = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 99,
      payload: { text: 'nope' }
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e2' });
    expect(applyDomainEventToView(view, badUpdate).reason).toBe('version-conflict');

    const transfer = operationToDomainEvent({
      kind: 'transfer-ownership',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 3,
      baseVersion: 1,
      newOwnerId: 'bob'
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e3' });
    expect(applyDomainEventToView(view, transfer).applied).toBe(true);
    expect(view.get('posts').get('p1').ownerId).toBe('bob');

    const removed = operationToDomainEvent({
      kind: 'delete',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 4,
      baseVersion: 2
    }, { publisherId: 'alice', groupId: 'g', eventIdGenerator: () => 'e4' });
    expect(applyDomainEventToView(view, removed).applied).toBe(true);
    expect(applyDomainEventToView(view, removed).reason).toBe('not-found');
  });

  test('applyDomainEventToView respects collection filter and unknown kinds', () => {
    const view = createEmptyView(['posts']);
    const event = operationToDomainEvent({
      kind: 'create',
      collectionName: 'comments',
      id: 'c1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e' });

    expect(applyDomainEventToView(view, event, { collectionsFilter: ['posts'] }).reason)
      .toBe('collection-filtered');
    expect(applyDomainEventToView(view, null).reason).toBe('invalid-event');

    const created = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e1' });
    applyDomainEventToView(view, created);

    const unknown = { ...created, kind: 'record:mystery', eventId: 'e2' };
    expect(applyDomainEventToView(view, unknown).reason).toBe('unknown-kind');
  });

  test('verifyEventChain handles empty chain and buildCheckpoint', () => {
    expect(verifyEventChain([]).ok).toBe(true);
    const event = operationToDomainEvent({
      kind: 'create',
      collectionName: 'c',
      id: '1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'pub', groupId: 'g', eventIdGenerator: () => 'e1' });
    const checkpoint = buildCheckpoint('g', [event], { publisherId: 'pub' });
    expect(checkpoint.groupId).toBe('g');
    expect(checkpoint.recordCount).toBe(1);
  });
});
