const {
  verifyEventChain,
  operationToDomainEvent
} = require('../../src/cqrs/domain-events');

describe('view consistency hash chains', () => {
  test('tampered event hash fails verification', () => {
    const event = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: {}
    }, { publisherId: 'a', groupId: 'g', eventIdGenerator: () => 'e1' });

    const tampered = { ...event, eventHash: 'sha512:deadbeef' };
    expect(verifyEventChain([tampered]).ok).toBe(false);
  });

  test('out-of-order prevHash breaks chain', () => {
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
    }, { publisherId: 'a', groupId: 'g', prevHash: null, eventIdGenerator: () => 'e2' });

    expect(verifyEventChain([first, second]).ok).toBe(false);
  });
});
