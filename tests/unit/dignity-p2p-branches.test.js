const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../../src');
const {
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = require('../../src/security/derive-key-pair');
const {
  revokeAndRotateIdentity,
  enrollColdRecoveryPassword
} = require('../../src/security/identity-rotation');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('DignityP2P branch coverage', () => {
  let hub;
  let security;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    security = fastTestSecurity({ appPassword: 'branch-test', powEnabled: false });
  });

  function createNode(nodeId, adapter = new InMemoryNetworkAdapter(hub)) {
    return new DignityP2P({
      nodeId,
      networkAdapter: adapter,
      security
    });
  }

  test('stop emits warning when peer group leave fails', async () => {
    const node = createNode('alice');
    await node.start();
    await node.joinPeerGroup('feed:fail', { fanout: 1, maxActivePeers: 2 });

    const warnings = [];
    node.on('warning', (event) => warnings.push(event));
    jest.spyOn(node, 'leavePeerGroup').mockRejectedValue(new Error('leave failed'));

    await node.stop();

    expect(warnings.some((event) => event.type === 'peer-group-leave-failed')).toBe(true);
  });

  test('identity helpers emit events and support broadcast flows', async () => {
    const node = createNode('alice');
    await node.start();

    const gen1 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 1,
      kdfIterations: 500
    });
    const gen2 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 2,
      kdfIterations: 500
    });

    const rotated = [];
    node.on('identityrotated', (event) => rotated.push(event));
    const applied = node.applyPeerIdentityRotation('bob', createRotation(gen1, gen2));
    expect(applied.applied).toBe(true);
    expect(rotated[0].peerId).toBe('bob');

    const enrolled = await enrollColdRecoveryPassword({
      username: 'alice',
      coldPassword: 'cold',
      kdfIterations: 500
    });
    const coldEvents = [];
    node.on('coldrecoveryenrolled', (event) => coldEvents.push(event));
    const enrollResult = node.applyPeerColdRecoveryEnrollment('carol', enrolled.enrollment);
    expect(enrollResult.applied).toBe(true);
    expect(coldEvents[0].peerId).toBe('carol');

    await node.enrollAndBroadcastColdRecovery({
      username: 'alice',
      coldPassword: 'cold2',
      kdfIterations: 500,
      broadcastOptions: { broadcastScope: 'identity:alice' }
    });

    const broadcastRotation = await node.revokeAndRotateDerivedIdentity({
      username: 'alice',
      password: 'secret',
      currentGeneration: 1,
      kdfIterations: 500,
      broadcast: true,
      broadcastOptions: { broadcastScope: 'identity:alice' }
    });
    expect(broadcastRotation.rotation.toGeneration).toBe(2);

    const passwordRotation = await node.rotateDerivedIdentityPassword({
      username: 'alice',
      currentPassword: 'old',
      newPassword: 'new',
      currentGeneration: 2,
      kdfIterations: 500,
      broadcast: true,
      broadcastOptions: { broadcastScope: 'identity:alice' }
    });
    expect(passwordRotation.rotation.rotationKind).toBe('password-change');

    await node.adoptDerivedIdentityKeyPair(gen2, { generation: 2 });
    await expect(node.adoptDerivedIdentityKeyPair(null)).rejects
      .toThrow('requires a derived keyPair');

    await node.deriveAndAdoptIdentity({
      username: 'alice',
      password: 'secret',
      generation: 2,
      kdfIterations: 500
    });

    await node.stop();
  });

  test('trustPeerPublicKey and connectToPeer edge cases', async () => {
    const node = createNode('alice');
    await node.start();

    expect(node.trustPeerPublicKey(null, {})).toBe(false);
    expect(node.trustPeerFromMetadata('bob', null)).toBe(false);

    const gen1 = await deriveKeyPairFromCredentials({
      username: 'bob',
      password: 'secret',
      kdfIterations: 500
    });
    jest.spyOn(node, 'registerPeerPublicKey').mockImplementation(() => {
      throw new Error('registration failed');
    });
    expect(node.trustPeerPublicKey('bob', keyPairToPublicBundle(gen1))).toBe(false);

    expect(await node.connectToPeer(null)).toBeNull();
    expect(await node.connectToPeer('alice')).toBeNull();

    const bareAdapter = {
      start: async () => {},
      stop: async () => {},
      broadcast: async () => {},
      onMessage() {},
      offMessage() {}
    };
    const bareNode = new DignityP2P({
      nodeId: 'bare',
      networkAdapter: bareAdapter,
      security
    });
    await bareNode.start();
    await expect(bareNode.connectToPeer('peer')).rejects
      .toThrow('does not support connectToPeer');
    await bareNode.stop();

    await node.stop();
  });

  test('gossip normalization and checkpoint dispatch', async () => {
    const node = createNode('alice');
    await node.start();
    await node.joinPeerGroup('feed:gossip', { fanout: 1, maxActivePeers: 2 });

    const warnings = [];
    node.on('warning', (event) => warnings.push(event));
    expect(node.normalizeGossipOperation({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      actorId: 'forged'
    }, 'publisher')).toBeNull();
    expect(warnings.some((event) => event.type === 'gossip-operation-actor-mismatch')).toBe(true);

    const checkpointMessages = [];
    node.on('peergroupmessage', (event) => checkpointMessages.push(event));
    await node.dispatchPeerGroupInnerMessage('domain:checkpoint', { ok: true }, {
      groupId: 'feed:gossip',
      senderId: 'publisher'
    });
    expect(checkpointMessages[0].type).toBe('domain:checkpoint');

    await node.stop();
  });

  test('restoreRecord rejects missing hash when configured', async () => {
    const node = createNode('alice');
    await node.start();

    const warnings = [];
    node.on('warning', (event) => warnings.push(event));
    const applied = node.restoreRecord('notes', {
      id: 'n1',
      ownerId: 'alice',
      data: { text: 'hello' },
      createdAt: 1,
      updatedAt: 1,
      deletedAt: null,
      version: 1
    }, { rejectOnHashMismatch: true, via: 'test' });

    expect(applied).toBe(false);
    expect(warnings.some((event) => event.type === 'content-hash-missing')).toBe(true);
    await expect(node.pushRecordSnapshot('notes', 'missing')).rejects
      .toThrow('does not exist');

    await node.stop();
  });

  test('incoming cold enrollment rejection emits warning', async () => {
    const alice = createNode('alice');
    const bob = createNode('bob');
    await alice.start();
    await bob.start();

    const warnings = [];
    bob.on('warning', (event) => warnings.push(event));

    await alice.broadcastMessage('identity:cold-enroll', {
      type: 'identity:cold-enroll',
      version: 1,
      username: 'alice',
      recoveryPublicKey: 'invalid',
      signature: 'invalid'
    }, { broadcastScope: 'identity:alice' });

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(warnings.some((event) => event.type === 'cold-recovery-enrollment-rejected')).toBe(true);

    await alice.stop();
    await bob.stop();
  });

  test('update with connectToPeers false skips replication resolution', async () => {
    const node = createNode('alice');
    await node.start();
    await node.create('notes', { text: 'a' }, { id: 'n1' });

    await node.update('notes', 'n1', { text: 'b' }, { connectToPeers: false });
    expect(node.read('notes', 'n1').data.text).toBe('b');

    await node.stop();
  });

  test('applyPeerIdentityRotation returns false for stale generation', async () => {
    const node = createNode('bob');
    await node.start();

    const { rotation } = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'secret',
      currentGeneration: 1,
      kdfIterations: 500
    });

    node.registerPeerPublicKey('alice', rotation.nextPublicKey, { generation: 2 });
    const result = node.applyPeerIdentityRotation('alice', rotation);
    expect(result.applied).toBe(false);
    expect(result.reason).toBe('stale-generation');

    await node.stop();
  });

  test('transferOwnership and getRecordPeerIds guard rails', async () => {
    const node = createNode('alice');
    await node.start();

    expect(node.getRecordPeerIds('notes', 'missing')).toEqual([]);
    await expect(node.transferOwnership('notes', 'missing', 'bob')).rejects
      .toThrow('Object missing does not exist');
    await expect(node.transferOwnership('notes', 'n1', '')).rejects
      .toThrow('newOwnerId is required');

    await node.create('notes', { text: 'owned' }, { id: 'n1' });
    const foreign = node.getCollection('notes').get('n1');
    node.getCollection('notes').set('n1', { ...foreign, ownerId: 'someone-else' });
    await expect(node.transferOwnership('notes', 'n1', 'bob')).rejects
      .toThrow('Only owner');

    await node.stop();
  });

  test('publishPeerGroupBulk requires publisher role', async () => {
    const node = createNode('alice');
    await node.start();
    await node.joinPeerGroup('feed:bulk', { role: 'subscriber', fanout: 1, maxActivePeers: 2 });

    await expect(node.publishPeerGroupBulk('feed:bulk', 'event', { x: 1 }))
      .rejects.toThrow('Only publisher can bulk-publish');

    await node.stop();
  });

  test('canUpdateRecord and normalizeGossipOperation null guards', async () => {
    const node = createNode('alice');
    await node.start();
    await node.create('notes', { x: 1 }, { id: 'n1' });
    const record = node.getCollection('notes').get('n1');

    expect(node.canUpdateRecord(record, null)).toBe(false);
    expect(node.canUpdateRecord(null, 'alice')).toBe(false);
    expect(node.normalizeGossipOperation(null, 'alice')).toBeNull();

    await node.stop();
  });
});

function createRotation(previousKeyPair, nextKeyPair) {
  const { createIdentityRotation } = require('../../src/security/identity-rotation');
  return createIdentityRotation({
    username: 'bob',
    fromGeneration: 1,
    toGeneration: 2,
    previousPublicKey: keyPairToPublicBundle(previousKeyPair),
    nextKeyPair,
    rotationKind: 'compromise-recovery'
  });
}
