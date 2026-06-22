const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  DignityQueryReplica,
  operationToDomainEvent
} = require('../../src');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

describe('DignityQueryReplica', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'replica-test' });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('replica hydrates view from domain events', async () => {
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

    await publisher.joinPeerGroup('feed:pub', {
      role: 'publisher',
      tiered: true,
      liveCap: 10,
      fanout: 2,
      maxActivePeers: 4
    });

    const replica = new DignityQueryReplica(subscriber, {
      groupId: 'feed:pub',
      collections: ['posts'],
      publisherId: 'publisher'
    });
    await replica.start({ bootstrapPeerIds: ['publisher'] });
    await fastSleep(30);

    await publisher.create('posts', { text: 'replica hello' }, {
      id: 'p1',
      peerGroupId: 'feed:pub'
    });

    expect(await fastWaitFor(() => replica.read('posts', 'p1') !== null)).toBe(true);
    expect(replica.read('posts', 'p1').data.text).toBe('replica hello');
    expect(replica.getViewStats().eventCount).toBeGreaterThan(0);

    await replica.stop();
    await publisher.stop();
    await subscriber.stop();
  });

  test('verifyChain passes for ordered events', async () => {
    const view = require('../../src/cqrs/domain-events').createEmptyView(['posts']);
    const replica = new (require('../../src/cqrs/query-replica'))(
      { on() {}, off() {}, joinPeerGroup: async () => {}, leavePeerGroup: async () => {} },
      { groupId: 'g', collections: ['posts'] }
    );
    replica.view = view;

    const first = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { text: 'a' }
    }, { publisherId: 'pub', groupId: 'g', eventIdGenerator: () => 'e1' });

    const second = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 1,
      payload: { text: 'b' }
    }, { publisherId: 'pub', groupId: 'g', prevHash: first.eventHash, eventIdGenerator: () => 'e2' });

    replica.ingestEvent(first, { skipChainCheck: true });
    replica.ingestEvent(second);

    expect(replica.verifyChain().ok).toBe(true);
  });
});
