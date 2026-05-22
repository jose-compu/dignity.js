/**
 * @jest-environment jsdom
 */

require('fake-indexeddb/auto');

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

const { renderHook, act, waitFor } = require('@testing-library/react');
const React = require('react');
const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  IndexedDBPersistence
} = require('../../src');
const { useDignity, useCollection, usePeers } = require('../../src/react');

describe('IndexedDBPersistence', () => {
  let hub;
  let defaultSecurity;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    defaultSecurity = {
      appPassword: 'test-app-password',
      powTargetMs: 5
    };
  });

  test('persists and hydrates object state across node restarts', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-restart' });

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);
    await alice.create('notes', { title: 'persist me' }, { id: 'n1' });
    await persistence.persistRecord('notes', 'n1');
    await persistence.detach();
    await alice.stop();

    const restored = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const restoredPersistence = new IndexedDBPersistence({ dbName: 'dignity-test-restart' });

    await restored.start();
    await restoredPersistence.attach(restored);

    expect(restored.read('notes', 'n1')).toMatchObject({
      id: 'n1',
      data: { title: 'persist me' },
      version: 1
    });

    await restoredPersistence.clear();
    await restoredPersistence.detach();
    await restored.stop();
  });

  test('persists tombstones for deleted objects', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-delete' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);
    await alice.create('notes', { title: 'temporary' }, { id: 'n2' });
    await alice.remove('notes', 'n2');
    await persistence.persistRecord('notes', 'n2');
    await persistence.detach();
    await alice.stop();

    const restored = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const restoredPersistence = new IndexedDBPersistence({ dbName: 'dignity-test-delete' });

    await restored.start();
    await restoredPersistence.attach(restored);

    expect(restored.read('notes', 'n2')).toBeNull();
    expect(restored.list('notes', { includeDeleted: true })).toEqual([
      expect.objectContaining({ id: 'n2', deletedAt: expect.any(Number) })
    ]);

    await restoredPersistence.clear();
    await restoredPersistence.detach();
    await restored.stop();
  });

  test('limits persistence to configured collections', async () => {
    const persistence = new IndexedDBPersistence({
      dbName: 'dignity-test-collections',
      collections: ['games']
    });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);
    await alice.create('games', { score: 1 }, { id: 'g1' });
    await alice.create('notes', { title: 'skip' }, { id: 'n1' });
    await persistence.persistRecord('games', 'g1');
    await persistence.persistRecord('notes', 'n1');
    await persistence.detach();
    await alice.stop();

    const restored = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const restoredPersistence = new IndexedDBPersistence({
      dbName: 'dignity-test-collections',
      collections: ['games']
    });

    await restored.start();
    await restoredPersistence.attach(restored);

    expect(restored.read('games', 'g1')).not.toBeNull();
    expect(restored.read('notes', 'n1')).toBeNull();

    await restoredPersistence.clear();
    await restoredPersistence.detach();
    await restored.stop();
  });

  test('auto-persists on change events without manual persistRecord calls', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-auto' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);
    await alice.create('notes', { title: 'auto saved' }, { id: 'auto-1' });
    await persistence.detach();
    await alice.stop();

    const restored = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const restoredPersistence = new IndexedDBPersistence({ dbName: 'dignity-test-auto' });

    await restored.start();
    await restoredPersistence.attach(restored);

    expect(restored.read('notes', 'auto-1')).toMatchObject({
      data: { title: 'auto saved' }
    });

    await restoredPersistence.clear();
    await restoredPersistence.detach();
    await restored.stop();
  });

  test('persistRecord removes storage entry when object is missing locally', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-delete-key' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);
    await alice.create('notes', { title: 'temp' }, { id: 'gone' });
    await persistence.persistRecord('notes', 'gone');
    alice.getCollection('notes').delete('gone');

    await persistence.persistRecord('notes', 'gone');
    await persistence.detach();
    await alice.stop();

    const restored = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const restoredPersistence = new IndexedDBPersistence({ dbName: 'dignity-test-delete-key' });

    await restored.start();
    await restoredPersistence.attach(restored);

    expect(restored.read('notes', 'gone')).toBeNull();

    await restoredPersistence.clear();
    await restoredPersistence.detach();
    await restored.stop();
  });

  test('persistChange ignores malformed events', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-malformed' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);

    expect(() => persistence.persistChange(null)).not.toThrow();
    expect(() => persistence.persistChange({ collection: 'notes' })).not.toThrow();

    await persistence.detach();
    await alice.stop();
  });

  test('persistChange emits warning when persistence fails', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-warning' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);

    const warningHandler = jest.fn();
    alice.on('warning', warningHandler);
    jest.spyOn(persistence, 'persistRecord').mockRejectedValue(new Error('disk full'));

    persistence.persistChange({ collection: 'notes', id: 'n1' });

    await waitFor(() => {
      expect(warningHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'persistence-failed',
          collection: 'notes',
          id: 'n1'
        })
      );
    });

    await persistence.detach();
    await alice.stop();
  });

  test('rejects attach and hydrate without a node', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-no-node' });

    await expect(persistence.attach(null)).rejects.toThrow('requires a DignityP2P node');
    await expect(persistence.hydrate()).rejects.toThrow('requires an attached node');
  });

  test('rejects openDb when IndexedDB is unavailable', async () => {
    const persistence = new IndexedDBPersistence({ indexedDB: null });

    await expect(persistence.openDb()).rejects.toThrow('IndexedDB is not available');
  });

  test('serializeRecord returns null for missing records', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-serialize' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);

    expect(persistence.serializeRecord('notes', 'missing')).toBeNull();

    await persistence.detach();
    await alice.stop();
  });

  test('hydrate skips records when local state is newer', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-stale-hydrate' });
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await persistence.attach(alice);
    await alice.create('scores', { value: 5 }, { id: 's1' });
    await alice.update('scores', 's1', { value: 10 });
    await persistence.persistRecord('scores', 's1');

    alice.restoreRecord('scores', {
      id: 's1',
      ownerId: 'alice',
      data: { value: 1 },
      createdAt: 1,
      updatedAt: 1,
      deletedAt: null,
      version: 1
    });

    expect(alice.read('scores', 's1').data).toEqual({ value: 10 });

    await persistence.detach();
    await alice.stop();
  });

  test('hydrate skips stored records outside configured collections', async () => {
    const writer = new IndexedDBPersistence({ dbName: 'dignity-test-hydrate-filter' });
    const seed = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await seed.start();
    await writer.attach(seed);
    await seed.create('notes', { title: 'skip-on-hydrate' }, { id: 'n-skip' });
    await writer.persistRecord('notes', 'n-skip');
    await writer.detach();
    await seed.stop();

    const restored = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const reader = new IndexedDBPersistence({
      dbName: 'dignity-test-hydrate-filter',
      collections: ['games']
    });

    await restored.start();
    await reader.attach(restored);

    expect(restored.read('notes', 'n-skip')).toBeNull();

    await reader.clear();
    await reader.detach();
    await restored.stop();
  });

  test('detach clears listeners without throwing', async () => {
    const persistence = new IndexedDBPersistence({ dbName: 'dignity-test-detach' });

    await expect(persistence.detach()).resolves.toBeUndefined();
  });
});

describe('React hooks', () => {
  let hub;
  let nodeConfig;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    nodeConfig = {
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: {
        appPassword: 'test-app-password',
        powTargetMs: 5
      }
    };
  });

  test('useDignity starts a node and exposes lifecycle status', async () => {
    const { result, unmount } = renderHook(() => useDignity(nodeConfig));

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.node).toBeInstanceOf(DignityP2P);
    expect(result.current.error).toBeNull();

    unmount();
  });

  test('useCollection reacts to change events', async () => {
    const node = new DignityP2P(nodeConfig);
    await node.start();

    const { result } = renderHook(() => useCollection(node, 'notes'));

    expect(result.current).toEqual([]);

    await act(async () => {
      await node.create('notes', { title: 'hook note' }, { id: 'n1' });
    });

    expect(result.current).toEqual([
      expect.objectContaining({ id: 'n1', data: { title: 'hook note' } })
    ]);

    await node.stop();
  });

  test('usePeers tracks discovery presence', async () => {
    const alice = new DignityP2P({ ...nodeConfig, nodeId: 'alice' });
    const bob = new DignityP2P({
      ...nodeConfig,
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub)
    });

    await alice.start();
    await bob.start();
    await alice.joinDiscovery('room', { metadata: { nickname: 'alice' } });

    const { result: alicePeers } = renderHook(() => usePeers(alice, 'room', { includeSelf: false }));

    expect(alicePeers.current).toEqual([]);

    await act(async () => {
      await bob.joinDiscovery('room', { metadata: { nickname: 'bob' } });
    });

    await waitFor(() => {
      expect(alicePeers.current.map((peer) => peer.peerId)).toContain('bob');
    });

    await alice.stop();
    await bob.stop();
  });

  test('useDignity stays idle when config is null', () => {
    const { result } = renderHook(() => useDignity(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.node).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('useDignity surfaces start errors', async () => {
    const startSpy = jest.spyOn(DignityP2P.prototype, 'start').mockRejectedValue(new Error('start failed'));

    const { result } = renderHook(() => useDignity(nodeConfig));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.error).toMatchObject({ message: 'start failed' });

    startSpy.mockRestore();
  });

  test('useCollection returns empty arrays for missing node or collection', () => {
    const { result: noNode } = renderHook(() => useCollection(null, 'notes'));
    expect(noNode.current).toEqual([]);

    const node = new DignityP2P(nodeConfig);
    const { result: noCollection } = renderHook(() => useCollection(node, null));
    expect(noCollection.current).toEqual([]);
  });

  test('usePeers returns empty array when node is null', () => {
    const { result } = renderHook(() => usePeers(null, 'room'));
    expect(result.current).toEqual([]);
  });

  test('usePeers can include self when configured', async () => {
    const alice = new DignityP2P({ ...nodeConfig, nodeId: 'alice' });
    await alice.start();
    await alice.joinDiscovery('room', { metadata: { nickname: 'alice' } });

    const { result } = renderHook(() => usePeers(alice, 'room', { includeSelf: true }));

    await waitFor(() => {
      expect(result.current.map((peer) => peer.peerId)).toContain('alice');
    });

    await alice.stop();
  });
});
