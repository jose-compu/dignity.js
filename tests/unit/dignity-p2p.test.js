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
      'Only owner alice can update object doc-1'
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
