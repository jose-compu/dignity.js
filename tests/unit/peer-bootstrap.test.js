const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src');

describe('Peer bootstrap and key trust (chess lessons)', () => {
  const hub = new InMemoryNetworkHub();
  const defaultSecurity = {
    appPassword: 'room-password',
    powTargetMs: 5
  };

  test('joinDiscovery injects publicKey into presence metadata', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    const announceSpy = jest.spyOn(alice, 'announcePresence');
    await alice.joinDiscovery('room:game', { metadata: { nickname: 'alice' } });

    expect(announceSpy).toHaveBeenCalled();
    const room = alice.discoveryRooms.get('room:game');
    expect(room.metadata.publicKey).toEqual(alice.getPublicKey());
    expect(room.metadata.nickname).toBe('alice');

    await alice.stop();
  });

  test('joinDiscovery connects bootstrap peers before first announce', async () => {
    const connectCalls = [];
    const adapter = new InMemoryNetworkAdapter(hub);
    adapter.connectToPeer = jest.fn(async (peerId) => {
      connectCalls.push(peerId);
      return { peer: peerId, open: true };
    });

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: adapter,
      security: defaultSecurity
    });
    await alice.start();
    await alice.joinDiscovery('room:game', { bootstrapPeerIds: ['host-1', 'host-1'] });

    expect(connectCalls).toEqual(['host-1']);

    await alice.stop();
  });

  test('broadcastMessage can connect to peers before sending', async () => {
    const adapter = new InMemoryNetworkAdapter(hub);
    adapter.connectToPeer = jest.fn(async () => ({ peer: 'host-1', open: true }));
    adapter.broadcast = jest.fn(async () => undefined);

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: adapter,
      security: defaultSecurity
    });
    await alice.start();

    await alice.broadcastMessage('claim-seat', { joinToken: 'abc' }, {
      broadcastScope: 'room:game',
      connectToPeers: ['host-1']
    });

    expect(adapter.connectToPeer).toHaveBeenCalledWith('host-1');
    expect(adapter.broadcast).toHaveBeenCalled();

    await alice.stop();
  });

  test('trusts peer public keys from presence metadata automatically', async () => {
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

    const handler = jest.fn();
    alice.on('message', handler);

    await alice.joinDiscovery('room:game', { metadata: { nickname: 'alice' } });
    await bob.joinDiscovery('room:game', { metadata: { nickname: 'bob' } });
    await bob.sendDirectMessage('alice', 'hello', { text: 'hi' });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        senderId: 'bob',
        type: 'hello',
        payload: { text: 'hi' }
      })
    );

    await alice.stop();
    await bob.stop();
  });

  test('getConnectionStats delegates to adapter helpers', async () => {
    const adapter = new InMemoryNetworkAdapter(hub);
    adapter.getOpenConnectionCount = jest.fn(() => 2);
    adapter.listOpenPeerIds = jest.fn(() => ['a', 'b']);

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: adapter,
      security: defaultSecurity
    });
    await alice.start();

    expect(alice.getConnectionStats()).toEqual({ openCount: 2, peerIds: ['a', 'b'] });

    await alice.stop();
  });

  test('pushRecordSnapshot seeds late joiners missing the initial create', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.joinDiscovery('room:game');

    // Host creates before joiner is online — joiner never receives the create op.
    await alice.create('chess-matches', {
      fen: 'start',
      status: 'waiting'
    }, { id: 'game-1', broadcastScope: 'room:game' });

    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await bob.start();
    await bob.joinDiscovery('room:game', { bootstrapPeerIds: ['alice'] });

    expect(bob.read('chess-matches', 'game-1')).toBeNull();

    const changes = [];
    bob.on('change', (event) => changes.push(event));

    await alice.pushRecordSnapshot('chess-matches', 'game-1', {
      broadcastScope: 'room:game',
      connectToPeers: ['bob']
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const synced = bob.read('chess-matches', 'game-1');
    expect(synced).not.toBeNull();
    expect(synced.data.fen).toBe('start');
    expect(changes.some((event) => event.kind === 'snapshot')).toBe(true);

    await alice.update('chess-matches', 'game-1', { fen: 'after-move', status: 'playing' }, {
      broadcastScope: 'room:game',
      connectToPeers: ['bob']
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(bob.read('chess-matches', 'game-1').data.fen).toBe('after-move');

    await alice.stop();
    await bob.stop();
  });

  test('getRecordPeerIds returns owner and collaborators excluding self', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('games', { score: 0 }, {
      id: 'g1',
      collaborators: ['bob', 'carol']
    });

    expect(alice.getRecordPeerIds('games', 'g1')).toEqual(['bob', 'carol']);
    expect(alice.getRecordPeerIds('games', 'g1', { includeSelf: true })).toEqual(['alice', 'bob', 'carol']);

    await alice.stop();
  });

  test('update auto-connects to record peers when connectToPeers omitted', async () => {
    const adapter = new InMemoryNetworkAdapter(hub);
    adapter.connectToPeer = jest.fn(async (peerId) => ({ peer: peerId, open: true }));

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: adapter,
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('games', { score: 0 }, {
      id: 'g1',
      collaborators: ['bob']
    });

    adapter.connectToPeer.mockClear();

    await alice.update('games', 'g1', { score: 1 });

    expect(adapter.connectToPeer).toHaveBeenCalledWith('bob');

    await alice.stop();
  });

  test('orphan-operation warning when update arrives without local record', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('games', { score: 0 }, { id: 'g1' });
    await alice.update('games', 'g1', { score: 1 });

    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await bob.start();

    const warnings = [];
    bob.on('warning', (event) => warnings.push(event));

    await alice.update('games', 'g1', { score: 2 });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(bob.read('games', 'g1')).toBeNull();
    expect(warnings.some((event) => event.type === 'orphan-operation')).toBe(true);

    await alice.stop();
    await bob.stop();
  });
});
