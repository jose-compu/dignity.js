const { validateDignityAppManifest } = require('../../src/apps/manifest');
const {
  createHostRpcHandler,
  filterRecords
} = require('../../src/apps/bridge');
const { collectionAllowed } = require('../../src/apps/manifest');

describe('Dignity App bridge RPC', () => {
  const manifest = validateDignityAppManifest({
    id: 'timeline',
    title: 'Timeline',
    collections: ['posts'],
    storedCommands: [{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]
  }).manifest;

  const replica = {
    list(collection) {
      if (collection !== 'posts') {
        return [];
      }
      return [
        { id: 'p1', ownerId: 'alice', data: { text: 'hello', upvotes: 2 } },
        { id: 'p2', ownerId: 'bob', data: { text: 'other', upvotes: 0 } }
      ];
    }
  };

  test('filterRecords matches ownerId and data fields', () => {
    const records = [
      { id: 'a', ownerId: 'alice', data: { tag: 'news' } },
      { id: 'b', ownerId: 'bob', data: { tag: 'news' } }
    ];
    expect(filterRecords(records, { ownerId: 'alice' })).toHaveLength(1);
    expect(filterRecords(records, { tag: 'news' })).toHaveLength(2);
  });

  test('query restricted to manifest collections', async () => {
    const handler = createHostRpcHandler({ manifest, replica });
    const ok = await handler.handle({
      rpcId: '1',
      method: 'query',
      params: { collection: 'posts', filter: { ownerId: 'alice' } }
    });
    expect(ok.ok).toBe(true);
    expect(ok.result.records).toHaveLength(1);

    const denied = await handler.handle({
      rpcId: '2',
      method: 'query',
      params: { collection: 'secrets' }
    });
    expect(denied.ok).toBe(false);
    expect(denied.error.code).toBe('collection-denied');
  });

  test('unknown method rejected', async () => {
    const handler = createHostRpcHandler({ manifest, replica });
    const response = await handler.handle({ rpcId: 'x', method: 'deleteAll' });
    expect(response.ok).toBe(false);
    expect(response.error.code).toBe('unknown-method');
  });

  test('malformed envelope rejected', async () => {
    const handler = createHostRpcHandler({ manifest, replica });
    const response = await handler.handle({ method: 'ready' });
    expect(response.ok).toBe(false);
    expect(response.error.code).toBe('invalid-envelope');
  });

  test('ready returns manifest metadata', async () => {
    const handler = createHostRpcHandler({ manifest, replica });
    const response = await handler.handle({ rpcId: 'r1', method: 'ready' });
    expect(response.ok).toBe(true);
    expect(response.result.appId).toBe('timeline');
    expect(collectionAllowed(manifest, 'posts')).toBe(true);
  });

  test('log and error forward to host callbacks', async () => {
    const logs = [];
    const errors = [];
    const handler = createHostRpcHandler({
      manifest,
      replica,
      onLog: (p) => logs.push(p),
      onError: (p) => errors.push(p)
    });

    await handler.handle({ rpcId: 'l1', method: 'log', params: { message: 'hi' } });
    await handler.handle({ rpcId: 'e1', method: 'error', params: { message: 'boom' } });

    expect(logs[0].message).toBe('hi');
    expect(errors[0].message).toBe('boom');
  });

  test('list and query limit', async () => {
    const handler = createHostRpcHandler({ manifest, replica });
    const listed = await handler.handle({ rpcId: 'l', method: 'list', params: { collection: 'posts' } });
    expect(listed.result.records).toHaveLength(2);

    const limited = await handler.handle({
      rpcId: 'q',
      method: 'query',
      params: { collection: 'posts', limit: 1 }
    });
    expect(limited.result.records).toHaveLength(1);
  });

  test('rejects when replica or node missing', async () => {
    const noReplica = createHostRpcHandler({ manifest, replica: null });
    expect((await noReplica.handle({ rpcId: '1', method: 'query', params: { collection: 'posts' } })).error.code)
      .toBe('no-replica');

    const noNode = createHostRpcHandler({ manifest, replica });
    expect((await noNode.handle({
      rpcId: '2',
      method: 'runStoredCommand',
      params: { commandId: 'upvote', args: {} }
    })).error.code).toBe('no-node');
  });

  test('filterRecords passes through without filter', () => {
    const records = [{ id: 'a' }];
    expect(filterRecords(records, null)).toBe(records);
  });

  test('filterRecords matches top-level record fields', () => {
    const records = [
      { id: 'a', ownerId: 'alice', data: {} },
      { id: 'b', ownerId: 'bob', data: {} }
    ];
    expect(filterRecords(records, { id: 'a' })).toHaveLength(1);
    expect(filterRecords(records, { id: 'missing' })).toHaveLength(0);
  });

  test('filterRecords rejects non-matching data fields', () => {
    const records = [{ id: 'a', data: { tag: 'news' } }];
    expect(filterRecords(records, { tag: 'sports' })).toHaveLength(0);
  });

  test('createHostRpcHandler requires manifest', () => {
    expect(() => createHostRpcHandler()).toThrow('requires manifest');
  });

  test('runStoredCommand forwards to publisher node', async () => {
    const {
      DignityP2P,
      InMemoryNetworkHub,
      InMemoryNetworkAdapter
    } = require('../../src');
    const { fastTestSecurity } = require('../helpers/fast-security');

    const hub = new InMemoryNetworkHub();
    const publisher = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: fastTestSecurity({ powEnabled: false })
    });
    await publisher.start();
    await publisher.joinPeerGroup('feed:app', { role: 'publisher' });
    await publisher.create('posts', { upvotes: 0 }, { id: 'p1', peerGroupId: 'feed:app' });

    const handler = createHostRpcHandler({ manifest, replica, node: publisher });
    const ok = await handler.handle({
      rpcId: 'cmd-1',
      method: 'runStoredCommand',
      params: { commandId: 'upvote', args: { id: 'p1', patch: { upvotes: 2 } } }
    });
    expect(ok.ok).toBe(true);
    expect(publisher.read('posts', 'p1').data.upvotes).toBe(2);

    const denied = await handler.handle({
      rpcId: 'cmd-2',
      method: 'runStoredCommand',
      params: { commandId: 'upvote', args: { id: 'p1', patch: { title: 'x' } } }
    });
    expect(denied.ok).toBe(false);

    await publisher.stop();
  });

  test('handle catches replica errors', async () => {
    const handler = createHostRpcHandler({
      manifest,
      replica: { list() { throw new Error('replica down'); } }
    });
    const response = await handler.handle({
      rpcId: 'err',
      method: 'list',
      params: { collection: 'posts' }
    });
    expect(response.ok).toBe(false);
    expect(response.error.message).toBe('replica down');
  });
});
