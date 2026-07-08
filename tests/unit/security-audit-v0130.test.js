const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  createHostRpcHandler,
  validateDignityAppManifest,
  executeStoredCommand,
  hashVerificationCode
} = require('../../src');
const { fastTestSecurity, fastWaitFor } = require('../helpers/fast-security');

describe('security audit v0.13.0', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'audit-v0130' });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('proposal handler ignores proposerId spoofing', async () => {
    const owner = new DignityP2P({ nodeId: 'owner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const attacker = new DignityP2P({ nodeId: 'attacker', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const proposals = [];

    owner.on('proposal', (p) => proposals.push(p));

    await owner.start();
    await attacker.start();
    await owner.create('games', { score: 0 }, { id: 'g1' });

    await attacker.sendDirectMessage('owner', 'proposal', {
      proposalId: 'prop-forged',
      collection: 'games',
      id: 'g1',
      patch: { score: 99 },
      proposerId: 'owner',
      baseVersion: 1
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(proposals).toHaveLength(0);
    expect(owner.read('games', 'g1').data.score).toBe(0);

    await owner.stop();
    await attacker.stop();
  });

  test('proposal handler rejects non-object patches', async () => {
    const owner = new DignityP2P({ nodeId: 'owner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const joiner = new DignityP2P({ nodeId: 'joiner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const proposals = [];

    owner.on('proposal', (p) => proposals.push(p));

    await owner.start();
    await joiner.start();
    await owner.create('games', { score: 0 }, { id: 'g1' });

    await joiner.sendDirectMessage('owner', 'proposal', {
      proposalId: 'prop-bad-patch',
      collection: 'games',
      id: 'g1',
      patch: ['not-an-object'],
      proposerId: 'joiner',
      baseVersion: 1
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(proposals).toHaveLength(0);

    await owner.stop();
    await joiner.stop();
  });

  test('stored commands reject dangerous patch keys', async () => {
    const node = new DignityP2P({ nodeId: 'pub', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await node.start();
    await node.joinPeerGroup('feed:audit-apps', { role: 'publisher', domainEvents: true });

    const { manifest } = validateDignityAppManifest({
      id: 'audit',
      title: 'Audit',
      collections: ['posts'],
      peerGroupId: 'feed:audit-apps',
      storedCommands: [{
        id: 'upvote',
        kind: 'update',
        collection: 'posts',
        allowedFields: ['upvotes']
      }]
    });

    await node.create('posts', { upvotes: 0 }, { id: 'p1', peerGroupId: 'feed:audit-apps' });

    const outcome = await executeStoredCommand(node, manifest, 'upvote', {
      id: 'p1',
      patch: JSON.parse('{"__proto__":{"polluted":true},"upvotes":1}')
    });

    expect(outcome.ok).toBe(false);
    expect(outcome.reason).toBe('field-not-allowed');
    expect(node.read('posts', 'p1').data.upvotes).toBe(0);

    await node.stop();
  });

  test('bridge RPC denies undeclared collections', async () => {
    const { manifest } = validateDignityAppManifest({
      id: 'reader',
      title: 'Reader',
      collections: ['posts']
    });

    const handler = createHostRpcHandler({
      manifest,
      replica: { list: () => [{ id: 'p1', data: { text: 'hi' } }] }
    });

    const response = await handler.handle({
      rpcId: 'r1',
      method: 'query',
      params: { collection: 'secrets' }
    });

    expect(response.ok).toBe(false);
    expect(response.error.code).toBe('collection-denied');
  });

  test('verification policy is bound into hash preventing silent downgrade', () => {
    const code = 'function validate() { return true; }';
    const strict = hashVerificationCode(code, { policy: 'strict' });
    const advisory = hashVerificationCode(code, { policy: 'advisory' });
    expect(strict).not.toBe(advisory);
  });

  test('domain events from unexpected publisher are rejected', async () => {
    const publisher = new DignityP2P({ nodeId: 'publisher', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const subscriber = new DignityP2P({ nodeId: 'subscriber', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const warnings = [];

    subscriber.on('warning', (e) => warnings.push(e));

    await publisher.start();
    await subscriber.start();

    await publisher.joinPeerGroup('feed:audit-cqrs', {
      role: 'publisher',
      publisherId: 'publisher',
      domainEvents: true
    });
    await subscriber.joinPeerGroup('feed:audit-cqrs', {
      role: 'subscriber',
      publisherId: 'publisher',
      domainEvents: true,
      bootstrapPeerIds: ['publisher']
    });

    const forgedEvent = {
      schemaVersion: 1,
      eventId: 'evt-forged',
      groupId: 'feed:audit-cqrs',
      publisherId: 'evil-publisher',
      kind: 'record:created',
      collectionName: 'posts',
      id: 'p-evil',
      payload: { text: 'bad' },
      timestamp: Date.now(),
      baseVersion: null,
      prevHash: null,
      newOwnerId: null,
      eventHash: 'sha512:deadbeef',
      signature: null
    };

    const applied = subscriber.ingestRemoteDomainEvent(forgedEvent, { groupId: 'feed:audit-cqrs' });
    expect(applied).toBe(false);
    expect(warnings.some((w) => w.type === 'domain-event-rejected' && w.reason === 'publisher-mismatch')).toBe(true);

    await publisher.stop();
    await subscriber.stop();
  });

  test('strict verification rejects cross-web hash drift on mesh operations', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await alice.start();
    await bob.start();

    alice.registerVerification('ledger', {
      code: { currency: 'USD' },
      version: '1.0.0',
      policy: 'strict'
    });
    bob.registerVerification('ledger', {
      code: { currency: 'EUR' },
      version: '1.0.0',
      policy: 'strict'
    });

    await alice.create('ledger', { balance: 1 }, {
      id: 'a1',
      broadcastScope: 'room:audit-verification'
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(bob.read('ledger', 'a1')).toBeNull();

    await alice.stop();
    await bob.stop();
  });
});
