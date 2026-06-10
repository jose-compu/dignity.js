const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  peerGroupScope,
  parsePeerGroupScope,
  selectFanoutPeers
} = require('../../src');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

describe('PeerGroup gossip', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'gossip-test' });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('peerGroupScope prefixes gossip namespace', () => {
    expect(peerGroupScope('feed:alice')).toBe('gossip:feed:alice');
  });

  test('selectFanoutPeers prefers connected peers', () => {
    const selected = selectFanoutPeers({
      peers: [{ peerId: 'a' }, { peerId: 'b' }, { peerId: 'c' }],
      count: 2,
      connectedPeerIds: ['c'],
      randomFn: () => 0
    });

    expect(selected).toHaveLength(2);
    expect(selected[0]).toBe('c');
  });

  test('joinPeerGroup tracks membership via scoped discovery', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();
    await alice.joinPeerGroup('feed:alice', { metadata: { role: 'publisher' } });

    expect(alice.getPeerGroupStats().joinedGroups).toContain('feed:alice');
    expect(alice.listPeerGroupMembers('feed:alice', { includeSelf: true })).toHaveLength(1);

    await alice.stop();
  });

  test('publishToPeerGroup delivers record snapshots with bounded fanout', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const relay = new DignityP2P({ nodeId: 'relay', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const subscriber = new DignityP2P({ nodeId: 'subscriber', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await publisher.start();
    await relay.start();
    await subscriber.start();

    await publisher.joinPeerGroup('feed:news', { metadata: { role: 'publisher' }, fanout: 1, maxActivePeers: 2 });
    await relay.joinPeerGroup('feed:news', { metadata: { role: 'relay' }, fanout: 1, maxActivePeers: 2 });
    await subscriber.joinPeerGroup('feed:news', {
      metadata: { role: 'subscriber' },
      bootstrapPeerIds: ['relay'],
      fanout: 1,
      maxActivePeers: 2
    });

    await publisher.create('posts', { text: 'hello gossip' }, { id: 'p1' });

    await publisher.publishRecordToPeerGroup('feed:news', 'posts', 'p1', { fanout: 1 });

    expect(await fastWaitFor(() => subscriber.read('posts', 'p1') !== null)).toBe(true);

    const record = subscriber.read('posts', 'p1');
    expect(record.data.text).toBe('hello gossip');
    expect(record.hash).toMatch(/^sha512:/);

    await publisher.stop();
    await relay.stop();
    await subscriber.stop();
  });

  test('gossip dedup prevents double-apply of same gossipId', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const subscriber = new DignityP2P({ nodeId: 'subscriber', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await publisher.start();
    await subscriber.start();

    await publisher.joinPeerGroup('dup:test', { fanout: 1, maxActivePeers: 2 });
    await subscriber.joinPeerGroup('dup:test', { bootstrapPeerIds: ['publisher'], fanout: 1, maxActivePeers: 2 });

    await publisher.create('items', { n: 1 }, { id: 'x1' });

    const gossipId = 'fixed-gossip-id';
    await publisher.publishRecordToPeerGroup('dup:test', 'items', 'x1', { fanout: 1, gossipId });
    await publisher.publishRecordToPeerGroup('dup:test', 'items', 'x1', { fanout: 1, gossipId });

    expect(await fastWaitFor(() => subscriber.read('items', 'x1') !== null)).toBe(true);

    const changes = [];
    subscriber.on('change', (event) => changes.push(event));

    await fastSleep(30);
    const snapshotChanges = changes.filter((event) => event.kind === 'snapshot');
    expect(snapshotChanges.length).toBeLessThanOrEqual(1);

    await publisher.stop();
    await subscriber.stop();
  });

  test('leavePeerGroup removes group from stats', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();
    await alice.joinPeerGroup('feed:tmp', { metadata: { role: 'subscriber' } });
    await alice.leavePeerGroup('feed:tmp');

    expect(alice.getPeerGroupStats().joinedGroups).not.toContain('feed:tmp');
    await alice.stop();
  });

  test('publishToPeerGroup throws when group not joined', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();

    await expect(
      alice.publishToPeerGroup('missing:group', 'timeline:ping', { ok: true })
    ).rejects.toThrow('has not been joined');

    await alice.stop();
  });

  test('publishRecordToPeerGroup throws for missing records', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();
    await alice.joinPeerGroup('feed:alice', { fanout: 1, maxActivePeers: 2 });

    await expect(
      alice.publishRecordToPeerGroup('feed:alice', 'posts', 'missing')
    ).rejects.toThrow('does not exist');

    await alice.stop();
  });

  test('gossip record snapshots reject tampered content hashes', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const warnings = [];

    await publisher.start();
    await publisher.joinPeerGroup('feed:integrity', { fanout: 1, maxActivePeers: 2 });
    await publisher.create('posts', { text: 'trusted post' }, { id: 'p1' });

    const subscriber = new DignityP2P({ nodeId: 'subscriber', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    subscriber.on('warning', (event) => warnings.push(event));
    await subscriber.start();
    await subscriber.joinPeerGroup('feed:integrity', { bootstrapPeerIds: ['publisher'], fanout: 1, maxActivePeers: 2 });
    await fastSleep(20);

    const validRecord = publisher.read('posts', 'p1');
    const tamperedRecord = {
      ...validRecord,
      data: { text: 'tampered post' },
      hash: validRecord.hash
    };

    await publisher.publishToPeerGroup('feed:integrity', 'record:snapshot', {
      collectionName: 'posts',
      record: tamperedRecord
    }, { fanout: 1 });

    await fastSleep(30);

    expect(subscriber.read('posts', 'p1')).toBeNull();
    expect(warnings.some((event) => event.type === 'content-hash-mismatch')).toBe(true);

    await publisher.publishRecordToPeerGroup('feed:integrity', 'posts', 'p1', { fanout: 1 });
    expect(await fastWaitFor(() => subscriber.read('posts', 'p1') !== null)).toBe(true);
    expect(subscriber.read('posts', 'p1').data.text).toBe('trusted post');
    expect(subscriber.read('posts', 'p1').hash).toMatch(/^sha512:/);

    await publisher.stop();
    await subscriber.stop();
  });

  test('relay disabled prevents further gossip propagation', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const relay = new DignityP2P({ nodeId: 'relay', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const tail = new DignityP2P({ nodeId: 'tail', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const relayEvents = [];
    const tailEvents = [];

    relay.on('peergroupmessage', (event) => relayEvents.push(event));
    tail.on('peergroupmessage', (event) => tailEvents.push(event));

    await publisher.start();
    await relay.start();
    await tail.start();

    await publisher.joinPeerGroup('feed:chain', { fanout: 1, maxActivePeers: 2, maxHops: 4 });
    await relay.joinPeerGroup('feed:chain', {
      bootstrapPeerIds: ['publisher'],
      fanout: 1,
      maxActivePeers: 2,
      relayEnabled: false
    });
    await tail.joinPeerGroup('feed:chain', { bootstrapPeerIds: ['relay'], fanout: 1, maxActivePeers: 2 });

    await fastSleep(20);

    // Force publisher fanout to relay only; otherwise fanout:1 may pick tail directly.
    jest.spyOn(publisher, 'selectPeerGroupFanout').mockReturnValue(['relay']);

    const publishResult = await publisher.publishToPeerGroup(
      'feed:chain',
      'timeline:relay-check',
      { seq: 1 },
      { fanout: 1 }
    );
    expect(publishResult.fanoutPeerIds).toEqual(['relay']);

    expect(await fastWaitFor(() => relayEvents.length > 0)).toBe(true);
    expect(relayEvents[0]).toMatchObject({
      groupId: 'feed:chain',
      type: 'timeline:relay-check',
      payload: { seq: 1 }
    });

    const tailReceived = await fastWaitFor(() => tailEvents.length > 0, 200);
    expect(tailReceived).toBe(false);

    await publisher.stop();
    await relay.stop();
    await tail.stop();
  });

  test('emits peergroupjoined and peergroupleft events', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const joined = [];
    const left = [];
    alice.on('peergroupjoined', (event) => joined.push(event));
    alice.on('peergroupleft', (event) => left.push(event));

    await alice.start();
    await alice.joinPeerGroup('feed:events', { fanout: 2 });
    await alice.leavePeerGroup('feed:events');
    await alice.stop();

    expect(joined[0].groupId).toBe('feed:events');
    expect(left[0].groupId).toBe('feed:events');
  });

  test('parsePeerGroupScope round-trips with peerGroupScope', () => {
    const groupId = 'spectate:chess:game-1';
    expect(parsePeerGroupScope(peerGroupScope(groupId))).toBe(groupId);
  });

  test('enforceConnectionBudget trims excess PeerJS connections', async () => {
    const adapter = new InMemoryNetworkAdapter(hub);
    const openPeers = Array.from({ length: 5 }, (_, index) => `peer-${index}`);
    adapter.listOpenPeerIds = () => openPeers;
    adapter.disconnectPeer = jest.fn(async () => undefined);

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: adapter,
      security: { ...security, globalMaxOpenConnections: 2 }
    });

    await alice.start();
    await alice.enforceConnectionBudget();

    expect(adapter.disconnectPeer).toHaveBeenCalledTimes(3);
    expect(adapter.disconnectPeer).toHaveBeenCalledWith('peer-0');

    await alice.stop();
  });

  test('sendToPeers on in-memory adapter targets only selected peers', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const carol = new DignityP2P({ nodeId: 'carol', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    const bobMessages = [];
    const carolMessages = [];

    await alice.start();
    await bob.start();
    await carol.start();

    bob.networkAdapter.onMessage((message) => bobMessages.push(message));
    carol.networkAdapter.onMessage((message) => carolMessages.push(message));

    await alice.networkAdapter.connectToPeer('bob');
    await alice.networkAdapter.sendToPeers({ hello: 'bob-only' }, ['bob']);

    expect(bobMessages).toHaveLength(1);
    expect(carolMessages).toHaveLength(0);

    await alice.stop();
    await bob.stop();
    await carol.stop();
  });
});
