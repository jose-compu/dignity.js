const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../../src');
const { fastTestSecurity, fastWaitFor } = require('../helpers/fast-security');

describe('security hardening v0.7.0', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'hardening-v070' });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('emits warning when default appPassword is used', async () => {
    const node = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub)
    });
    const warnings = [];
    node.on('warning', (event) => warnings.push(event));

    await node.start();

    expect(warnings.some((event) => event.type === 'default-app-password')).toBe(true);
    await node.stop();
  });

  test('seenGossipIds cache is bounded', () => {
    const node = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { ...security, maxSeenGossipIds: 3, gossipIdTtlMs: 60000 }
    });

    for (let index = 0; index < 5; index += 1) {
      node.markSeenGossip(`gossip-${index}`);
    }

    expect(node.getPeerGroupStats().seenGossipCount).toBeLessThanOrEqual(3);
  });

  test('publishToPeerGroup enforces optional rate limit', async () => {
    const node = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { ...security, gossipPublishMinIntervalMs: 1000 }
    });

    await node.start();
    await node.joinPeerGroup('feed:limited');

    await node.publishToPeerGroup('feed:limited', 'timeline:test', { seq: 1 });
    await expect(node.publishToPeerGroup('feed:limited', 'timeline:test', { seq: 2 }))
      .rejects.toMatchObject({ code: 'GOSSIP_RATE_LIMIT' });

    await node.stop();
  });

  test('direct mesh snapshots reject tampered content hashes', async () => {
    const aliceHub = new InMemoryNetworkHub();
    const bobHub = new InMemoryNetworkHub();
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(aliceHub), security });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(bobHub), security });
    const warnings = [];
    bob.on('warning', (event) => warnings.push(event));

    await alice.start();
    await bob.start();

    alice.registerPeerPublicKey('bob', bob.getPublicKey());
    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const record = await alice.create('games', { move: 'e4' }, { id: 'g1' });
    const tampered = {
      ...record,
      data: { move: 'd4' },
      hash: record.hash
    };

    const envelope = await alice.securityService.secureOutgoingMessage({
      messageType: 'record:snapshot',
      payload: { collectionName: 'games', record: tampered },
      targetId: 'bob'
    });

    await bob.handleIncomingMessage(envelope);

    expect(bob.read('games', 'g1')).toBeNull();
    expect(warnings.some((event) => event.type === 'content-hash-mismatch')).toBe(true);

    await alice.stop();
    await bob.stop();
  });

  test('valid pushRecordSnapshot still restores matching hashes', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await alice.start();
    await bob.start();

    await alice.create('items', { value: 1 }, { id: 'item-1' });
    await alice.pushRecordSnapshot('items', 'item-1', { connectToPeers: ['bob'] });

    expect(await fastWaitFor(() => bob.read('items', 'item-1') !== null)).toBe(true);

    await alice.stop();
    await bob.stop();
  });
});
