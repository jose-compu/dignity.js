const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  DignityQueryReplica,
  validateDignityAppManifest
} = require('../../src');
const { createHostRpcHandler } = require('../../src/apps/bridge');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

describe('Dignity Apps e2e', () => {
  test('publisher writes, replica hydrates, bridge query returns data', async () => {
    const hub = new InMemoryNetworkHub();
    const security = fastTestSecurity({ appPassword: 'apps-e2e', powEnabled: false });

    const publisher = new DignityP2P({
      nodeId: 'publisher',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    const subscriber = new DignityP2P({
      nodeId: 'subscriber',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });

    await publisher.start();
    await subscriber.start();

    await publisher.joinPeerGroup('feed:timeline', {
      role: 'publisher',
      fanout: 2,
      maxActivePeers: 4
    });

    const replica = new DignityQueryReplica(subscriber, {
      groupId: 'feed:timeline',
      collections: ['posts'],
      publisherId: 'publisher'
    });
    await replica.start({ bootstrapPeerIds: ['publisher'] });
    await fastSleep(30);

    await publisher.create('posts', { text: 'timeline post' }, {
      id: 'p1',
      peerGroupId: 'feed:timeline'
    });

    expect(await fastWaitFor(() => replica.read('posts', 'p1') !== null)).toBe(true);

    const manifest = validateDignityAppManifest({
      id: 'timeline',
      title: 'Timeline',
      collections: ['posts'],
      peerGroupId: 'feed:timeline'
    }).manifest;

    const handler = createHostRpcHandler({ manifest, replica });
    const response = await handler.handle({
      rpcId: 'e2e-1',
      method: 'query',
      params: { collection: 'posts' }
    });

    expect(response.ok).toBe(true);
    expect(response.result.records).toHaveLength(1);
    expect(response.result.records[0].data.text).toBe('timeline post');

    await replica.stop();
    await publisher.stop();
    await subscriber.stop();
  });
});
