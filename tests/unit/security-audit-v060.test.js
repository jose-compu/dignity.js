const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  MessageSecurityService
} = require('../../src');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

describe('security audit v0.6.0', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'audit-v060' });
  const securedPresenceSecurity = fastTestSecurity({
    appPassword: 'audit-v060',
    signingEnabled: true,
    encryptionEnabled: true
  });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('gossip operations bind actorId to authenticated sender', async () => {
    const owner = new DignityP2P({ nodeId: 'owner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const victim = new DignityP2P({ nodeId: 'victim', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const follower = new DignityP2P({ nodeId: 'follower', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const warnings = [];

    follower.on('warning', (event) => warnings.push(event));

    await owner.start();
    await victim.start();
    await follower.start();

    await owner.joinPeerGroup('feed:audit', { fanout: 1, maxActivePeers: 2 });
    await victim.joinPeerGroup('feed:audit', { fanout: 1, maxActivePeers: 2 });
    await follower.joinPeerGroup('feed:audit', { bootstrapPeerIds: ['owner'], fanout: 1, maxActivePeers: 2 });

    await owner.create('counters', { value: 1 }, { id: 'c1' });
    await owner.publishRecordToPeerGroup('feed:audit', 'counters', 'c1', { fanout: 1 });
    expect(await fastWaitFor(() => follower.read('counters', 'c1') !== null)).toBe(true);

    const forgedOperation = {
      opId: 'forged-op-1',
      kind: 'update',
      collectionName: 'counters',
      id: 'c1',
      actorId: 'owner',
      ownerId: 'owner',
      collaboratorIds: [],
      timestamp: Date.now(),
      payload: { value: 666 },
      baseVersion: 1
    };

    await victim.publishToPeerGroup('feed:audit', 'operation', forgedOperation, { fanout: 1 });
    await fastSleep(30);

    expect(follower.read('counters', 'c1').data.value).toBe(1);
    expect(warnings.some((event) => event.type === 'gossip-operation-actor-mismatch')).toBe(true);

    await owner.stop();
    await victim.stop();
    await follower.stop();
  });

  test('gossip ignores messages for groups that were not joined', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const outsider = new DignityP2P({ nodeId: 'outsider', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const received = [];

    outsider.on('peergroupmessage', (event) => received.push(event));

    await publisher.start();
    await outsider.start();

    await publisher.joinPeerGroup('feed:joined', { fanout: 1, maxActivePeers: 2 });
    await publisher.publishToPeerGroup('feed:joined', 'timeline:ping', { seq: 1 }, { fanout: 1 });

    await fastSleep(30);

    expect(received).toHaveLength(0);

    await publisher.stop();
    await outsider.stop();
  });

  test('gossip rejects snapshots with forged ownership on existing records', async () => {
    const owner = new DignityP2P({ nodeId: 'owner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const attacker = new DignityP2P({ nodeId: 'attacker', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const follower = new DignityP2P({ nodeId: 'follower', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const warnings = [];

    follower.on('warning', (event) => warnings.push(event));

    await owner.start();
    await attacker.start();
    await follower.start();

    await owner.joinPeerGroup('feed:own', { fanout: 1, maxActivePeers: 2 });
    await attacker.joinPeerGroup('feed:own', { fanout: 1, maxActivePeers: 2 });
    await follower.joinPeerGroup('feed:own', { bootstrapPeerIds: ['owner'], fanout: 1, maxActivePeers: 2 });

    await owner.create('posts', { text: 'mine' }, { id: 'p1' });
    await owner.publishRecordToPeerGroup('feed:own', 'posts', 'p1', { fanout: 1 });
    expect(await fastWaitFor(() => follower.read('posts', 'p1') !== null)).toBe(true);

    const record = follower.read('posts', 'p1');
    const forged = {
      ...record,
      ownerId: 'attacker',
      version: record.version + 1,
      data: { text: 'stolen' },
      hash: record.hash
    };

    await attacker.publishToPeerGroup('feed:own', 'record:snapshot', {
      collectionName: 'posts',
      record: forged
    }, { fanout: 1 });

    await fastSleep(30);

    expect(follower.read('posts', 'p1').ownerId).toBe('owner');
    expect(follower.read('posts', 'p1').data.text).toBe('mine');
    expect(warnings.some((event) => event.type === 'ownership-mismatch')).toBe(true);

    await owner.stop();
    await attacker.stop();
    await follower.stop();
  });

  test('presence leave cannot evict arbitrary peers', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security: securedPresenceSecurity });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security: securedPresenceSecurity });

    await alice.start();
    await bob.start();

    await alice.joinDiscovery('room:audit');
    await bob.joinDiscovery('room:audit', { bootstrapPeerIds: ['alice'] });
    expect(await fastWaitFor(() => alice.listPeers('room:audit', { includeSelf: false }).length > 0)).toBe(true);

    const bobService = bob.securityService;
    const spoofLeave = await bobService.secureOutgoingMessage({
      messageType: 'presence:leave',
      payload: {
        scope: 'room:audit',
        peerId: 'alice',
        leftAt: Date.now()
      },
      securityContext: { broadcastScope: 'room:audit' }
    });

    await alice.handleIncomingMessage(spoofLeave);

    expect(alice.listPeers('room:audit', { includeSelf: true }).map((entry) => entry.peerId)).toContain('alice');

    await alice.stop();
    await bob.stop();
  });

  test('presence announce is ignored for scopes that were not joined', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security: securedPresenceSecurity });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security: securedPresenceSecurity });

    await alice.start();
    await bob.start();

    const announce = await bob.securityService.secureOutgoingMessage({
      messageType: 'presence:announce',
      payload: {
        scope: 'room:unjoined',
        peerId: 'bob',
        metadata: { role: 'spy' },
        ttlMs: 999999,
        announcedAt: Date.now()
      },
      securityContext: { broadcastScope: 'room:unjoined' }
    });

    await alice.handleIncomingMessage(announce);

    expect(alice.listPeers('room:unjoined')).toEqual([]);

    await alice.stop();
    await bob.stop();
  });

  test('rejects broadcast envelopes with out-of-range kdfIterations', async () => {
    const baseOptions = {
      appPassword: 'audit-v060',
      kdfIterations: 100000,
      powEnabled: false,
      signingEnabled: false
    };

    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: baseOptions
    });

    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: baseOptions
    });

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'timeline:test',
      payload: { ok: true },
      securityContext: { broadcastScope: 'default' }
    });

    envelope.security.encryption.kdfIterations = 1000;

    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow('Invalid kdfIterations');
  });

  test('appliedOperations cache is bounded', () => {
    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { ...security, maxAppliedOperations: 3 }
    });

    for (let index = 0; index < 5; index += 1) {
      alice.applyOperation({
        opId: `op-${index}`,
        kind: 'create',
        collectionName: 'items',
        id: `item-${index}`,
        actorId: 'alice',
        ownerId: 'alice',
        timestamp: Date.now() + index,
        payload: { n: index }
      });
    }

    expect(alice.appliedOperations.size).toBeLessThanOrEqual(3);
    expect(alice.appliedOperations.has('op-0')).toBe(false);
    expect(alice.appliedOperations.has('op-4')).toBe(true);
  });
});
