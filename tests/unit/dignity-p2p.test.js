const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../../src');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(condition, timeoutMs = 2500, intervalMs = 50) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (condition()) {
      return true;
    }
    await sleep(intervalMs);
  }
  return false;
}

describe('DignityP2P', () => {
  let hub;
  let defaultSecurity;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    defaultSecurity = {
      appPassword: 'test-app-password',
      powTargetMs: 5
    };
  });

  test('creates, reads, updates and deletes owned objects', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();

    const created = await alice.create('notes', { title: 'First note' }, { id: 'n1' });
    expect(created).toMatchObject({
      id: 'n1',
      ownerId: 'alice',
      data: { title: 'First note' },
      version: 1
    });

    const updated = await alice.update('notes', 'n1', { title: 'Updated note' });
    expect(updated).toMatchObject({
      id: 'n1',
      data: { title: 'Updated note' },
      version: 2
    });

    await alice.remove('notes', 'n1');
    expect(alice.read('notes', 'n1')).toBeNull();

    await alice.stop();
  });

  test('rejects updates by non-owner', async () => {
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

    await alice.create('documents', { text: 'original' }, { id: 'doc-1' });

    await expect(bob.update('documents', 'doc-1', { text: 'tampered' })).rejects.toThrow(
      'Only owner alice or collaborators can update object doc-1'
    );

    await alice.stop();
    await bob.stop();
  });

  test('replicates operations across peers and keeps owner restrictions', async () => {
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

    await alice.create('tasks', { title: 'ship v0.1.0' }, { id: 'task-1' });

    expect(bob.read('tasks', 'task-1')).toMatchObject({
      id: 'task-1',
      ownerId: 'alice',
      data: { title: 'ship v0.1.0' }
    });

    await alice.update('tasks', 'task-1', { status: 'in-progress' });
    expect(bob.read('tasks', 'task-1').data).toMatchObject({
      title: 'ship v0.1.0',
      status: 'in-progress'
    });

    await expect(bob.remove('tasks', 'task-1')).rejects.toThrow('Only owner alice can delete object task-1');

    await alice.remove('tasks', 'task-1');
    expect(bob.read('tasks', 'task-1')).toBeNull();

    await alice.stop();
    await bob.stop();
  });

  test('lists deleted objects only when includeDeleted is enabled', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('notes', { title: 'A' }, { id: 'note-a' });
    await alice.remove('notes', 'note-a');

    expect(alice.list('notes')).toEqual([]);

    const withDeleted = alice.list('notes', { includeDeleted: true });
    expect(withDeleted).toHaveLength(1);
    expect(withDeleted[0]).toMatchObject({
      id: 'note-a',
      ownerId: 'alice',
      version: 2
    });

    await alice.stop();
  });

  test('ignores duplicate operations by opId', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();

    const createOperation = {
      opId: 'op-1',
      kind: 'create',
      collectionName: 'items',
      id: 'item-1',
      actorId: 'alice',
      ownerId: 'alice',
      timestamp: 1,
      payload: { value: 'hello' }
    };

    const firstApply = alice.applyOperation(createOperation);
    const secondApply = alice.applyOperation(createOperation);

    expect(firstApply).toBe(true);
    expect(secondApply).toBe(false);
    expect(alice.read('items', 'item-1')).toMatchObject({ data: { value: 'hello' } });

    await alice.stop();
  });

  test('rejects stale version updates from remote operations', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await alice.create('docs', { title: 'v1' }, { id: 'doc-1' });
    await alice.update('docs', 'doc-1', { title: 'v2' });

    const staleUpdate = {
      opId: 'stale-op',
      kind: 'update',
      collectionName: 'docs',
      id: 'doc-1',
      actorId: 'alice',
      timestamp: 3,
      baseVersion: 1,
      payload: { title: 'stale-write' }
    };

    const applied = alice.applyOperation(staleUpdate);

    expect(applied).toBe(false);
    expect(alice.read('docs', 'doc-1')).toMatchObject({
      data: { title: 'v2' },
      version: 2
    });

    await alice.stop();
  });

  test('supports direct encrypted messages between peers', async () => {
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
    const carol = new DignityP2P({
      nodeId: 'carol',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    await alice.start();
    await bob.start();
    await carol.start();

    alice.registerPeerPublicKey('bob', bob.getPublicKey());
    bob.registerPeerPublicKey('alice', alice.getPublicKey());
    carol.registerPeerPublicKey('alice', alice.getPublicKey());

    const bobMessageHandler = jest.fn();
    const carolMessageHandler = jest.fn();
    bob.on('message', bobMessageHandler);
    carol.on('message', carolMessageHandler);

    await alice.sendDirectMessage('bob', 'dm', { text: 'private hello' });

    expect(bobMessageHandler).toHaveBeenCalledTimes(1);
    expect(bobMessageHandler.mock.calls[0][0]).toMatchObject({
      senderId: 'alice',
      targetId: 'bob',
      type: 'dm',
      payload: { text: 'private hello' }
    });
    expect(carolMessageHandler).not.toHaveBeenCalled();

    await alice.stop();
    await bob.stop();
    await carol.stop();
  });

  test('replicates only to peers with same team broadcast password', async () => {
    const teamSecurity = {
      appPassword: 'fallback-password',
      broadcastPasswords: {
        'coop:red': 'red-team-password',
        'coop:blue': 'blue-team-password'
      },
      powTargetMs: 5
    };

    const redTeamMismatchedSecurity = {
      appPassword: 'fallback-password',
      broadcastPasswords: {
        'coop:red': 'wrong-password'
      },
      powTargetMs: 5
    };

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: teamSecurity
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: teamSecurity
    });
    const mallory = new DignityP2P({
      nodeId: 'mallory',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: redTeamMismatchedSecurity
    });

    const mallorySecurityErrors = jest.fn();
    mallory.on('securityerror', mallorySecurityErrors);

    await alice.start();
    await bob.start();
    await mallory.start();

    await alice.create(
      'matches',
      { id: 'coop-1', team: 'red', status: 'started' },
      { id: 'coop-1', broadcastScope: 'coop:red' }
    );

    expect(bob.read('matches', 'coop-1')).toMatchObject({
      ownerId: 'alice',
      data: { id: 'coop-1', team: 'red', status: 'started' }
    });
    expect(mallory.read('matches', 'coop-1')).toBeNull();
    expect(mallorySecurityErrors).toHaveBeenCalled();

    await alice.stop();
    await bob.stop();
    await mallory.stop();
  });

  test('bans peer when signature is invalid and ignores later messages while banned', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: {
        ...defaultSecurity,
        banDurationMs: 60 * 60 * 1000
      }
    });

    await alice.start();
    await bob.start();

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const tamperedEnvelope = await alice.securityService.secureOutgoingMessage({
      messageType: 'operation',
      payload: {
        opId: 'tampered-op',
        kind: 'create',
        collectionName: 'notes',
        id: 'bad-1',
        actorId: 'alice',
        ownerId: 'alice',
        timestamp: Date.now(),
        payload: { title: 'bad' }
      }
    });
    const originalSignature = tamperedEnvelope.security.signing.signature;
    tamperedEnvelope.security.signing.signature =
      (originalSignature[0] === 'A' ? 'B' : 'A') + originalSignature.slice(1);

    await bob.handleIncomingMessage(tamperedEnvelope);

    expect(bob.isPeerBanned('alice')).toBe(true);
    expect(bob.getBanInfo('alice')).toMatchObject({ reason: 'INVALID_SIGNATURE' });

    await alice.create('notes', { title: 'should-not-arrive' }, { id: 'n-ban' });
    expect(bob.read('notes', 'n-ban')).toBeNull();

    await alice.stop();
    await bob.stop();
  });

  test('removes ban after configured duration', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: {
        ...defaultSecurity,
        banDurationMs: 30
      }
    });

    await alice.start();
    await bob.start();
    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const tamperedPow = await alice.securityService.secureOutgoingMessage({
      messageType: 'operation',
      payload: {
        opId: 'pow-bad-op',
        kind: 'create',
        collectionName: 'notes',
        id: 'bad-2',
        actorId: 'alice',
        ownerId: 'alice',
        timestamp: Date.now(),
        payload: { title: 'pow-bad' }
      }
    });
    const originalChallenge = tamperedPow.security.pow.challenge;
    tamperedPow.security.pow.challenge =
      (originalChallenge[0] === 'a' ? 'b' : 'a') + originalChallenge.slice(1);

    await bob.handleIncomingMessage(tamperedPow);
    expect(bob.isPeerBanned('alice')).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 45));
    expect(bob.isPeerBanned('alice')).toBe(false);

    await alice.stop();
    await bob.stop();
  });

  test('discovers peers inside the same room scope', async () => {
    const teamSecurity = {
      appPassword: 'fallback-password',
      powEnabled: false,
      broadcastPasswords: {
        'room:alpha': 'alpha-password',
        'room:beta': 'beta-password'
      },
      powTargetMs: 5
    };

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: teamSecurity
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: teamSecurity
    });
    const carol = new DignityP2P({
      nodeId: 'carol',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: teamSecurity
    });

    await alice.start();
    await bob.start();
    await carol.start();

    await alice.joinDiscovery('room:alpha', { metadata: { nick: 'alice' }, ttlMs: 1000, heartbeatIntervalMs: 100000 });
    await bob.joinDiscovery('room:alpha', { metadata: { nick: 'bob' }, ttlMs: 1000, heartbeatIntervalMs: 100000 });
    await carol.joinDiscovery('room:beta', { metadata: { nick: 'carol' }, ttlMs: 1000, heartbeatIntervalMs: 100000 });
    await alice.announcePresence('room:alpha');

    const discovered = await waitFor(
      () => bob.listPeers('room:alpha', { includeSelf: false }).some((peer) => peer.peerId === 'alice'),
      3000,
      60
    );

    const peersFromBobAlpha = bob.listPeers('room:alpha', { includeSelf: false });
    const peersFromCarolBeta = carol.listPeers('room:beta', { includeSelf: false });

    expect(discovered).toBe(true);
    expect(peersFromBobAlpha.map((peer) => peer.peerId)).toContain('alice');
    expect(peersFromCarolBeta.map((peer) => peer.peerId)).not.toContain('alice');

    await alice.stop();
    await bob.stop();
    await carol.stop();
  }, 20000);

  test('leaveDiscovery removes peer presence for other peers in the room', async () => {
    const discoverySecurity = {
      ...defaultSecurity,
      powEnabled: false
    };

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: discoverySecurity
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: discoverySecurity
    });

    await alice.start();
    await bob.start();

    await alice.joinDiscovery('main', { ttlMs: 1000, heartbeatIntervalMs: 100000 });
    await bob.joinDiscovery('main', { ttlMs: 1000, heartbeatIntervalMs: 100000 });

    const discovered = await waitFor(
      () => bob.listPeers('main', { includeSelf: false }).some((peer) => peer.peerId === 'alice'),
      3000,
      60
    );
    expect(discovered).toBe(true);

    await alice.leaveDiscovery('main');

    expect(bob.listPeers('main', { includeSelf: false }).map((peer) => peer.peerId)).not.toContain('alice');

    await alice.stop();
    await bob.stop();
  }, 15000);

  test('requires nodeId in constructor', () => {
    expect(() => new DignityP2P({ networkAdapter: new InMemoryNetworkAdapter(new InMemoryNetworkHub()) }))
      .toThrow('DignityP2P requires nodeId');
  });

  test('requires networkAdapter in constructor', () => {
    expect(() => new DignityP2P({ nodeId: 'x' }))
      .toThrow('DignityP2P requires networkAdapter');
  });

  test('create rejects duplicate non-deleted object', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await alice.create('items', { v: 1 }, { id: 'dup' });
    await expect(alice.create('items', { v: 2 }, { id: 'dup' })).rejects.toThrow('already exists');

    await alice.stop();
  });

  test('update rejects when object does not exist', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await expect(alice.update('items', 'missing', { v: 1 })).rejects.toThrow('does not exist');

    await alice.stop();
  });

  test('remove rejects when object does not exist', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await expect(alice.remove('items', 'missing')).rejects.toThrow('does not exist');

    await alice.stop();
  });

  test('applyOperation ignores null or missing opId', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    expect(alice.applyOperation(null)).toBe(false);
    expect(alice.applyOperation({})).toBe(false);
  });

  test('applyOperation ignores update from non-owner', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    alice.applyOperation({
      opId: 'c1', kind: 'create', collectionName: 'x', id: 'x1',
      actorId: 'alice', ownerId: 'alice', timestamp: 1, payload: { v: 1 }
    });

    const result = alice.applyOperation({
      opId: 'u1', kind: 'update', collectionName: 'x', id: 'x1',
      actorId: 'bob', timestamp: 2, payload: { v: 2 }
    });

    expect(result).toBe(false);
  });

  test('applyOperation ignores unknown operation kind', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    alice.applyOperation({
      opId: 'c1', kind: 'create', collectionName: 'x', id: 'x1',
      actorId: 'alice', ownerId: 'alice', timestamp: 1, payload: {}
    });

    const result = alice.applyOperation({
      opId: 'weird', kind: 'merge', collectionName: 'x', id: 'x1',
      actorId: 'alice', timestamp: 2, payload: {}
    });

    expect(result).toBe(false);
  });

  test('applyOperation ignores update/delete on deleted object', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    alice.applyOperation({
      opId: 'c1', kind: 'create', collectionName: 'x', id: 'x1',
      actorId: 'alice', ownerId: 'alice', timestamp: 1, payload: {}
    });
    alice.applyOperation({
      opId: 'd1', kind: 'delete', collectionName: 'x', id: 'x1',
      actorId: 'alice', timestamp: 2, baseVersion: 1
    });

    const result = alice.applyOperation({
      opId: 'u1', kind: 'update', collectionName: 'x', id: 'x1',
      actorId: 'alice', timestamp: 3, payload: { v: 2 }
    });

    expect(result).toBe(false);
  });

  test('unbanPeer removes ban and emits event', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    alice.banPeer('bad-peer', 60000, 'test');
    expect(alice.isPeerBanned('bad-peer')).toBe(true);

    const handler = jest.fn();
    alice.on('peerunbanned', handler);
    alice.unbanPeer('bad-peer');

    expect(alice.isPeerBanned('bad-peer')).toBe(false);
    expect(handler).toHaveBeenCalledWith({ peerId: 'bad-peer' });

    await alice.stop();
  });

  test('handleIncomingMessage processes raw operation payloads', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await alice.handleIncomingMessage({
      opId: 'raw-1', kind: 'create', collectionName: 'raw', id: 'r1',
      actorId: 'alice', ownerId: 'alice', timestamp: 1, payload: { v: 1 }
    });

    expect(alice.read('raw', 'r1')).toMatchObject({ data: { v: 1 } });
    await alice.stop();
  });

  test('listPeers returns empty when scope has no presence map', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    expect(alice.listPeers('nonexistent')).toEqual([]);
  });

  test('announcePresence throws when scope not joined', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await expect(alice.announcePresence('not-joined')).rejects.toThrow('has not been joined');

    await alice.stop();
  });

  test('leaveDiscovery is no-op for unjoined scope', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await expect(alice.leaveDiscovery('never-joined')).resolves.toBeUndefined();

    await alice.stop();
  });

  test('banPeer is no-op for null peerId', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    alice.banPeer(null);
    expect(alice.bannedPeers.size).toBe(0);
  });

  test('getCollection requires collectionName', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    expect(() => alice.getCollection('')).toThrow('collectionName is required');
    expect(() => alice.getCollection(null)).toThrow('collectionName is required');
  });

  test('list with includeDeleted returns active and deleted records', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    await alice.create('notes', { title: 'active' }, { id: 'active-1' });
    await alice.create('notes', { title: 'gone' }, { id: 'deleted-1' });
    await alice.remove('notes', 'deleted-1');

    const records = alice.list('notes', { includeDeleted: true });
    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'active-1', data: { title: 'active' } }),
        expect.objectContaining({ id: 'deleted-1', deletedAt: expect.any(Number) })
      ])
    );

    await alice.stop();
  });

  test('stop emits warning when leaveDiscovery fails', async () => {
    const adapter = new InMemoryNetworkAdapter(hub);
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: adapter,
      security: defaultSecurity
    });
    await alice.start();
    await alice.joinDiscovery('main');

    const warningHandler = jest.fn();
    alice.on('warning', warningHandler);
    adapter.broadcast = jest.fn(async () => {
      throw new Error('network down');
    });

    await alice.stop();

    expect(warningHandler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'presence-leave-failed', scope: 'main' })
    );
  });

  test('joinDiscovery clears previous heartbeat timer when rejoining scope', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    const clearSpy = jest.spyOn(global, 'clearInterval');
    await alice.joinDiscovery('room', { heartbeatIntervalMs: 5000 });
    await alice.joinDiscovery('room', { heartbeatIntervalMs: 8000 });

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();

    await alice.stop();
  });

  test('emits warning when presence heartbeat fails', async () => {
    jest.useFakeTimers();

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    const warningHandler = jest.fn();
    alice.on('warning', warningHandler);

    await alice.joinDiscovery('room', { heartbeatIntervalMs: 1000 });

    alice.announcePresence = jest.fn(async () => {
      throw new Error('heartbeat failed');
    });

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(warningHandler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'presence-heartbeat-failed', scope: 'room' })
    );

    jest.useRealTimers();
    await alice.stop();
  });

  test('ignores presence announce without peerId', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    alice.securityService.decryptIncomingMessage = jest.fn(async () => ({
      messageType: 'presence:announce',
      senderId: null,
      payload: { scope: 'main', metadata: { nickname: 'ghost' } }
    }));

    await alice.handleIncomingMessage({ encrypted: true });

    expect(alice.listPeers('main', { includeSelf: false })).toEqual([]);

    await alice.stop();
  });

  test('emits warning when presence handshake fails', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();
    await alice.joinDiscovery('main');

    alice.announcePresence = jest.fn(async () => {
      throw new Error('handshake failed');
    });

    const warningHandler = jest.fn();
    alice.on('warning', warningHandler);

    alice.securityService.decryptIncomingMessage = jest.fn(async () => ({
      messageType: 'presence:announce',
      senderId: 'bob',
      payload: {
        scope: 'main',
        peerId: 'bob',
        metadata: { nickname: 'bob' },
        ttlMs: 45000,
        announcedAt: Date.now()
      }
    }));

    await alice.handleIncomingMessage({ encrypted: true });

    expect(warningHandler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'presence-handshake-failed', scope: 'main' })
    );

    await alice.stop();
  });

  test('applyOperation ignores create when active object already exists', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });

    const baseOp = {
      kind: 'create',
      collectionName: 'games',
      id: 'g1',
      actorId: 'alice',
      ownerId: 'alice',
      timestamp: 1,
      payload: { score: 0 }
    };

    expect(alice.applyOperation({ ...baseOp, opId: 'op-1' })).toBe(true);
    expect(alice.applyOperation({ ...baseOp, opId: 'op-2', payload: { score: 1 } })).toBe(false);
  });

  test('emits message event for custom decrypted payloads', async () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity
    });
    await alice.start();

    const handler = jest.fn();
    alice.on('message', handler);

    alice.securityService.decryptIncomingMessage = jest.fn(async () => ({
      senderId: 'bob',
      targetId: 'alice',
      messageType: 'chat',
      payload: { text: 'hello' }
    }));

    await alice.handleIncomingMessage({ encrypted: true });

    expect(handler).toHaveBeenCalledWith({
      senderId: 'bob',
      targetId: 'alice',
      type: 'chat',
      payload: { text: 'hello' }
    });

    await alice.stop();
  });

  test('getBanInfo clears expired bans', () => {
    let fakeNow = 1000;
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: defaultSecurity,
      now: () => fakeNow
    });

    alice.banPeer('bad-peer', 500, 'test');
    expect(alice.getBanInfo('bad-peer')).not.toBeNull();

    fakeNow += 600;
    expect(alice.getBanInfo('bad-peer')).toBeNull();
    expect(alice.isPeerBanned('bad-peer')).toBe(false);
  });

  test('presence entries expire by ttl', async () => {
    let fakeNow = 1000;
    const now = () => fakeNow;
    const security = {
      ...defaultSecurity,
      presenceTtlMs: 20
    };

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security,
      now
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security,
      now
    });

    await alice.start();
    await bob.start();

    await alice.joinDiscovery('main', { ttlMs: 20, heartbeatIntervalMs: 100000 });
    await bob.joinDiscovery('main', { ttlMs: 1000, heartbeatIntervalMs: 100000 });

    expect(bob.listPeers('main', { includeSelf: false }).map((peer) => peer.peerId)).toContain('alice');

    fakeNow += 30;
    expect(bob.listPeers('main', { includeSelf: false }).map((peer) => peer.peerId)).not.toContain('alice');

    await alice.stop();
    await bob.stop();
  });
});
