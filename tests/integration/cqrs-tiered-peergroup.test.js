const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  DignityQueryReplica,
  electBulkRelays
} = require('../../src');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

describe('CQRS tiered PeerGroup integration', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'cqrs-integration' });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('live cap assigns bulk tier for overflow joiners', async () => {
    const publisher = new DignityP2P({
      nodeId: 'publisher',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await publisher.start();
    await publisher.joinPeerGroup('feed:alice', {
      role: 'publisher',
      tiered: true,
      liveCap: 2,
      fanout: 2,
      maxActivePeers: 4
    });

    const subs = [];
    for (let i = 0; i < 3; i += 1) {
      const node = new DignityP2P({
        nodeId: `sub-${i}`,
        networkAdapter: new InMemoryNetworkAdapter(hub),
        security
      });
      await node.start();
      await node.joinPeerGroup('feed:alice', {
        role: 'subscriber',
        tiered: true,
        liveCap: 2,
        tierMode: 'auto',
        bootstrapPeerIds: ['publisher'],
        fanout: 2,
        maxActivePeers: 4
      });
      subs.push(node);
    }

    await fastSleep(50);

    const tiers = subs.map((node) => node.getPeerGroupConfig('feed:alice').peerGroupTier);
    expect(tiers.filter((t) => t === 'live')).toHaveLength(2);
    expect(tiers.filter((t) => t === 'bulk')).toHaveLength(1);

    for (const node of subs) {
      await node.stop();
    }
    await publisher.stop();
  });

  test('domain events propagate to live subscriber via gossip', async () => {
    const publisher = new DignityP2P({
      nodeId: 'publisher',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    const liveSub = new DignityP2P({
      nodeId: 'live-sub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });

    await publisher.start();
    await liveSub.start();

    await publisher.joinPeerGroup('feed:news', {
      role: 'publisher',
      tiered: true,
      liveCap: 10,
      fanout: 2,
      maxActivePeers: 4
    });
    await liveSub.joinPeerGroup('feed:news', {
      role: 'subscriber',
      tiered: true,
      liveCap: 10,
      bootstrapPeerIds: ['publisher'],
      fanout: 2,
      maxActivePeers: 4,
      commandCapable: false
    });

    await fastSleep(30);

    const events = [];
    liveSub.on('domainevent', (event) => events.push(event));

    await publisher.create('articles', { title: 'CQRS' }, {
      id: 'a1',
      peerGroupId: 'feed:news'
    });

    expect(await fastWaitFor(() => events.length > 0)).toBe(true);
    expect(events[0].kind).toBe('record:created');

    await publisher.stop();
    await liveSub.stop();
  });

  test('bulk relay election picks bulk tier peers', async () => {
    const peers = [
      { peerId: 'b-bulk', metadata: { peerGroupTier: 'bulk' } },
      { peerId: 'a-bulk', metadata: { peerGroupTier: 'bulk' } },
      { peerId: 'live-1', metadata: { peerGroupTier: 'live' } }
    ];

    expect(electBulkRelays(peers, { count: 2 })).toEqual(['a-bulk', 'b-bulk']);
  });

  test('replica read path end-to-end', async () => {
    const publisher = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    const reader = new DignityP2P({
      nodeId: 'reader',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });

    await publisher.start();
    await reader.start();

    await publisher.joinPeerGroup('feed:e2e', {
      role: 'publisher',
      tiered: true,
      fanout: 2,
      maxActivePeers: 4
    });

    const replica = new DignityQueryReplica(reader, {
      groupId: 'feed:e2e',
      collections: ['items'],
      publisherId: 'pub'
    });
    await replica.start({ bootstrapPeerIds: ['pub'] });
    await fastSleep(30);

    await publisher.create('items', { value: 42 }, { id: 'i1', peerGroupId: 'feed:e2e' });

    expect(await fastWaitFor(() => replica.read('items', 'i1') !== null)).toBe(true);
    expect(replica.list('items')).toHaveLength(1);

    await replica.stop();
    await publisher.stop();
    await reader.stop();
  });

  test('rejects unsigned domain events when signing is enabled', async () => {
    const signingSecurity = fastTestSecurity({
      appPassword: 'signed-domain-events',
      signingEnabled: true,
      encryptionEnabled: false,
      powEnabled: false
    });

    const publisher = new DignityP2P({
      nodeId: 'publisher',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: signingSecurity
    });
    const subscriber = new DignityP2P({
      nodeId: 'subscriber',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: signingSecurity
    });

    await publisher.start();
    await subscriber.start();

    subscriber.registerPeerPublicKey('publisher', publisher.getPublicKey());

    await publisher.joinPeerGroup('feed:signed', {
      role: 'publisher',
      publisherId: 'publisher',
      tiered: true,
      fanout: 2,
      maxActivePeers: 4
    });
    await subscriber.joinPeerGroup('feed:signed', {
      role: 'subscriber',
      publisherId: 'publisher',
      tiered: true,
      bootstrapPeerIds: ['publisher'],
      fanout: 2,
      maxActivePeers: 4,
      commandCapable: false
    });

    const warnings = [];
    subscriber.on('warning', (event) => warnings.push(event));

    const { operationToDomainEvent } = require('../../src/cqrs/domain-events');
    const forged = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'forged',
      timestamp: Date.now(),
      payload: { text: 'bad' }
    }, { publisherId: 'publisher', groupId: 'feed:signed', eventIdGenerator: () => 'forged-evt' });

    subscriber.ingestRemoteDomainEvent(forged, { groupId: 'feed:signed', publisherId: 'publisher' });

    expect(warnings.some((w) => w.reason === 'unsigned-event')).toBe(true);
    expect(subscriber.domainEventLogs.get('feed:signed') || []).toHaveLength(0);

    await publisher.stop();
    await subscriber.stop();
  });

  test('rejects domain events from wrong publisher id', async () => {
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

    await subscriber.joinPeerGroup('feed:bound', {
      role: 'subscriber',
      publisherId: 'publisher',
      tiered: true,
      commandCapable: false
    });

    const warnings = [];
    subscriber.on('warning', (event) => warnings.push(event));

    const { operationToDomainEvent } = require('../../src/cqrs/domain-events');
    const wrongPublisher = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'x',
      timestamp: Date.now(),
      payload: {}
    }, { publisherId: 'attacker', groupId: 'feed:bound', eventIdGenerator: () => 'evt-wrong' });

    subscriber.ingestRemoteDomainEvent(wrongPublisher, { groupId: 'feed:bound' });

    expect(warnings.some((w) => w.reason === 'publisher-mismatch')).toBe(true);

    await publisher.stop();
    await subscriber.stop();
  });
});
