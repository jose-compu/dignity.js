const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

async function startNodes(hub, ids, security) {
  const nodes = new Map();
  for (const id of ids) {
    const node = new DignityP2P({
      nodeId: id,
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    nodes.set(id, node);
  }
  return nodes;
}

async function stopNodes(nodes) {
  for (const node of nodes.values()) {
    await node.stop();
  }
}

describe('PeerGroup gossip e2e', () => {
  const security = fastTestSecurity({ appPassword: 'e2e-gossip' });
  let hub;

  jest.setTimeout(15000);

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('epidemic spread reaches many subscribers in a single group', async () => {
    const nodeIds = Array.from({ length: 5 }, (_, index) => `fan-${index}`);
    const nodes = await startNodes(hub, nodeIds, security);

    await Promise.all(nodeIds.map((id, index) => {
      const node = nodes.get(id);
      const bootstrapPeerIds = index > 0 ? [nodeIds[index - 1]] : undefined;
      return node.joinPeerGroup('feed:viral', {
        bootstrapPeerIds,
        fanout: 3,
        maxActivePeers: 8,
        maxHops: 10,
        metadata: { role: 'subscriber' }
      });
    }));

    await fastSleep(20);

    const publisher = nodes.get('fan-0');
    const receivedGossip = new Map(nodeIds.map((id) => [id, 0]));
    for (const [id, node] of nodes.entries()) {
      node.on('peergroupmessage', (event) => {
        if (event.type === 'timeline:viral' && event.payload?.seq === 1) {
          receivedGossip.set(id, receivedGossip.get(id) + 1);
        }
      });
    }

    await publisher.publishToPeerGroup('feed:viral', 'timeline:viral', { seq: 1 }, { fanout: 3 });

    const subscriberIds = nodeIds.slice(1);
    expect(await fastWaitFor(
      () => subscriberIds.every((id) => receivedGossip.get(id) > 0),
      3000
    )).toBe(true);
    expect(receivedGossip.get('fan-4')).toBeGreaterThan(0);

    await stopNodes(nodes);
  });

  test('multiplexed groups isolate feeds on one subscriber node', async () => {
    const publisherA = new DignityP2P({ nodeId: 'pub-a', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const publisherB = new DignityP2P({ nodeId: 'pub-b', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const reader = new DignityP2P({ nodeId: 'reader', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await publisherA.start();
    await publisherB.start();
    await reader.start();

    await Promise.all([
      publisherA.joinPeerGroup('feed:alice', { fanout: 1, maxActivePeers: 2 }),
      publisherB.joinPeerGroup('feed:bob', { fanout: 1, maxActivePeers: 2 }),
      reader.joinPeerGroup('feed:alice', { bootstrapPeerIds: ['pub-a'], fanout: 1, maxActivePeers: 2 }),
      reader.joinPeerGroup('feed:bob', { bootstrapPeerIds: ['pub-b'], fanout: 1, maxActivePeers: 2 })
    ]);

    await publisherA.create('posts', { author: 'alice', n: 1 }, { id: 'a1' });
    await publisherB.create('posts', { author: 'bob', n: 2 }, { id: 'b1' });

    await Promise.all([
      publisherA.publishRecordToPeerGroup('feed:alice', 'posts', 'a1', { fanout: 1 }),
      publisherB.publishRecordToPeerGroup('feed:bob', 'posts', 'b1', { fanout: 1 })
    ]);

    expect(await fastWaitFor(() => reader.read('posts', 'a1') !== null)).toBe(true);
    expect(await fastWaitFor(() => reader.read('posts', 'b1') !== null)).toBe(true);

    expect(reader.getPeerGroupStats().joinedGroups.sort()).toEqual(['feed:alice', 'feed:bob']);
    expect(reader.read('posts', 'a1').data.author).toBe('alice');
    expect(reader.read('posts', 'b1').data.author).toBe('bob');

    await publisherA.stop();
    await publisherB.stop();
    await reader.stop();
  });

  test('chess-style split: players use direct mesh, spectators use gossip only', async () => {
    const COLLECTION = 'chess-matches';
    const GAME_ID = 'Fischer-Spassky';
    const SPECTATOR_GROUP = `spectate:chess:${GAME_ID}`;
    const ROOM_SCOPE = `room:chess:${GAME_ID}`;

    const white = new DignityP2P({ nodeId: 'white-host', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const black = new DignityP2P({ nodeId: 'black-join', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const spectatorA = new DignityP2P({ nodeId: 'spec-a', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const spectatorB = new DignityP2P({ nodeId: 'spec-b', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await Promise.all([white, black, spectatorA, spectatorB].map((node) => node.start()));

    await white.joinDiscovery(ROOM_SCOPE, { metadata: { role: 'host', seat: 'white' } });
    await black.joinDiscovery(ROOM_SCOPE, {
      metadata: { role: 'join', seat: 'black' },
      bootstrapPeerIds: ['white-host']
    });

    await Promise.all([
      white.joinPeerGroup(SPECTATOR_GROUP, { metadata: { role: 'publisher' }, fanout: 1, maxActivePeers: 3 }),
      spectatorA.joinPeerGroup(SPECTATOR_GROUP, {
        bootstrapPeerIds: ['white-host'],
        metadata: { role: 'spectator' },
        fanout: 1,
        maxActivePeers: 3
      }),
      spectatorB.joinPeerGroup(SPECTATOR_GROUP, {
        bootstrapPeerIds: ['white-host'],
        metadata: { role: 'spectator' },
        fanout: 1,
        maxActivePeers: 3
      })
    ]);

    await white.create(COLLECTION, {
      fen: 'startpos',
      status: 'playing',
      whitePlayerId: 'white-host',
      blackPlayerId: 'black-join',
      moveHistory: []
    }, { id: GAME_ID, broadcastScope: ROOM_SCOPE, connectToPeers: ['black-join'] });

    await white.update(COLLECTION, GAME_ID, {
      fen: 'after-e4',
      moveHistory: ['e4']
    }, {
      broadcastScope: ROOM_SCOPE,
      connectToPeers: ['black-join'],
      collaborators: ['white-host', 'black-join']
    });

    await white.publishRecordToPeerGroup(SPECTATOR_GROUP, COLLECTION, GAME_ID, { fanout: 1 });

    expect(await fastWaitFor(() => black.read(COLLECTION, GAME_ID) !== null)).toBe(true);
    expect(black.read(COLLECTION, GAME_ID).data.moveHistory).toEqual(['e4']);

    expect(await fastWaitFor(() => spectatorA.read(COLLECTION, GAME_ID) !== null)).toBe(true);
    expect(await fastWaitFor(() => spectatorB.read(COLLECTION, GAME_ID) !== null)).toBe(true);
    expect(spectatorA.read(COLLECTION, GAME_ID).data.moveHistory).toEqual(['e4']);
    expect(spectatorB.read(COLLECTION, GAME_ID).data.moveHistory).toEqual(['e4']);

    const whiteConnections = white.getConnectionStats().openCount;
    expect(whiteConnections).toBeLessThanOrEqual(white.globalMaxOpenConnections);

    await Promise.all([white, black, spectatorA, spectatorB].map((node) => node.stop()));
  });

  test('gossip operation updates propagate to followers', async () => {
    const owner = new DignityP2P({ nodeId: 'owner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const follower = new DignityP2P({ nodeId: 'follower', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await owner.start();
    await follower.start();

    await owner.joinPeerGroup('feed:ops', { fanout: 1, maxActivePeers: 2 });
    await follower.joinPeerGroup('feed:ops', { bootstrapPeerIds: ['owner'], fanout: 1, maxActivePeers: 2 });

    await owner.create('counters', { value: 1 }, { id: 'c1' });
    await owner.publishRecordToPeerGroup('feed:ops', 'counters', 'c1', { fanout: 1 });
    expect(await fastWaitFor(() => follower.read('counters', 'c1') !== null)).toBe(true);

    const operation = {
      opId: 'op-gossip-1',
      kind: 'update',
      collectionName: 'counters',
      id: 'c1',
      actorId: 'owner',
      ownerId: 'owner',
      collaboratorIds: [],
      timestamp: Date.now(),
      payload: { value: 99 },
      baseVersion: 1
    };

    await owner.publishToPeerGroup('feed:ops', 'operation', operation, { fanout: 1 });

    expect(await fastWaitFor(() => follower.read('counters', 'c1')?.data?.value === 99)).toBe(true);
    expect(follower.read('counters', 'c1').data.value).toBe(99);
    expect(follower.read('counters', 'c1').version).toBe(2);

    await owner.stop();
    await follower.stop();
  });

  test('custom peergroupmessage events reach subscribers', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const subscriber = new DignityP2P({ nodeId: 'subscriber', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await publisher.start();
    await subscriber.start();

    await publisher.joinPeerGroup('feed:events', { fanout: 1, maxActivePeers: 2 });
    await subscriber.joinPeerGroup('feed:events', { bootstrapPeerIds: ['publisher'], fanout: 1, maxActivePeers: 2 });

    const received = [];
    subscriber.on('peergroupmessage', (event) => received.push(event));

    await publisher.publishToPeerGroup('feed:events', 'timeline:ping', { seq: 42 }, { fanout: 1 });

    expect(await fastWaitFor(() => received.length > 0)).toBe(true);
    expect(received[0]).toMatchObject({
      groupId: 'feed:events',
      type: 'timeline:ping',
      payload: { seq: 42 }
    });

    await publisher.stop();
    await subscriber.stop();
  });
});
