const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../../src');

describe('DignityP2P concurrency', () => {
  let hub;
  let defaultSecurity;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    defaultSecurity = {
      appPassword: 'test-app-password',
      powTargetMs: 5
    };
  });

  test('update throws VERSION_CONFLICT when expectedVersion mismatches', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('scores', { value: 1 }, { id: 's1' });
    await alice.update('scores', 's1', { value: 2 });

    const conflictHandler = jest.fn();
    alice.on('conflict', conflictHandler);

    await expect(
      alice.update('scores', 's1', { value: 3 }, { expectedVersion: 1 })
    ).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });

    expect(conflictHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'update',
        collection: 'scores',
        id: 's1',
        expectedVersion: 1,
        currentVersion: 2,
        phase: 'local'
      })
    );

    await alice.stop();
  });

  test('emits conflict when remote update has stale baseVersion', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await bob.start();

    await alice.create('boards', { cells: [0] }, { id: 'b1' });
    await alice.update('boards', 'b1', { cells: [1] });

    const conflictHandler = jest.fn();
    bob.on('conflict', conflictHandler);

    const staleUpdate = {
      opId: 'stale-update',
      kind: 'update',
      collectionName: 'boards',
      id: 'b1',
      actorId: 'alice',
      timestamp: Date.now(),
      baseVersion: 1,
      payload: { cells: [2] }
    };

    bob.applyOperation(staleUpdate);

    expect(conflictHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'update',
        collection: 'boards',
        id: 'b1',
        expectedVersion: 1,
        currentVersion: 2,
        phase: 'remote'
      })
    );
    expect(bob.read('boards', 'b1').data).toEqual({ cells: [1] });

    await alice.stop();
    await bob.stop();
  });

  test('updateWithRetry resolves concurrent read-modify-write loops', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('counters', { count: 0 }, { id: 'c1' });

    let patchCalls = 0;
    const updated = await alice.updateWithRetry('counters', 'c1', (current) => {
      patchCalls += 1;
      if (patchCalls === 1) {
        alice.applyOperation({
          opId: 'race-update',
          kind: 'update',
          collectionName: 'counters',
          id: 'c1',
          actorId: 'alice',
          timestamp: Date.now(),
          baseVersion: current.version,
          payload: { count: 99 }
        });
      }

      return { count: current.data.count + 1 };
    });

    expect(updated.data).toEqual({ count: 100 });
    expect(updated.version).toBe(3);
    expect(patchCalls).toBe(2);

    await alice.stop();
  });

  test('updateWithRetry throws when object does not exist', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();

    await expect(
      alice.updateWithRetry('counters', 'missing', () => ({ count: 1 }))
    ).rejects.toThrow('Object missing does not exist in counters');

    await alice.stop();
  });

  test('updateWithRetry throws after maxAttempts is exhausted', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('counters', { count: 0 }, { id: 'c1' });

    const updateSpy = jest.spyOn(alice, 'update').mockImplementation(async () => {
      const error = new Error('Version conflict on counters/c1: expected 1, current 2');
      error.code = 'VERSION_CONFLICT';
      throw error;
    });

    await expect(
      alice.updateWithRetry('counters', 'c1', () => ({ count: 1 }), { maxAttempts: 2 })
    ).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });

    expect(updateSpy).toHaveBeenCalledTimes(2);
    updateSpy.mockRestore();

    await alice.stop();
  });

  test('restoreRecord rejects invalid payloads and stale versions', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    expect(alice.restoreRecord('notes', null)).toBe(false);
    expect(alice.restoreRecord('notes', {})).toBe(false);

    await alice.start();
    await alice.create('notes', { title: 'current' }, { id: 'n1' });
    await alice.update('notes', 'n1', { title: 'v2' });

    expect(alice.restoreRecord('notes', {
      id: 'n1',
      ownerId: 'alice',
      data: { title: 'old' },
      createdAt: 1,
      updatedAt: 1,
      deletedAt: null,
      version: 1
    })).toBe(false);

    expect(alice.read('notes', 'n1').data).toEqual({ title: 'v2' });

    expect(alice.restoreRecord('notes', {
      id: 'n2',
      ownerId: 'alice',
      data: { title: 'restored' },
      createdAt: 10,
      updatedAt: 10,
      deletedAt: null,
      version: 1
    })).toBe(true);

    expect(alice.read('notes', 'n2').data).toEqual({ title: 'restored' });

    await alice.stop();
  });

  test('updateWithRetry throws when maxAttempts is zero', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('counters', { count: 0 }, { id: 'c1' });

    await expect(
      alice.updateWithRetry('counters', 'c1', () => ({ count: 1 }), { maxAttempts: 0 })
    ).rejects.toThrow('Unable to update counters/c1 after 0 attempts');

    await alice.stop();
  });

  test('emits conflict when remote delete has stale baseVersion', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('items', { name: 'a' }, { id: 'i1' });
    await alice.update('items', 'i1', { name: 'b' });

    const conflictHandler = jest.fn();
    alice.on('conflict', conflictHandler);

    alice.applyOperation({
      opId: 'stale-delete',
      kind: 'delete',
      collectionName: 'items',
      id: 'i1',
      actorId: 'alice',
      timestamp: Date.now(),
      baseVersion: 1
    });

    expect(conflictHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'delete',
        phase: 'remote',
        expectedVersion: 1,
        currentVersion: 2
      })
    );
    expect(alice.read('items', 'i1').data).toEqual({ name: 'b' });

    await alice.stop();
  });
});
