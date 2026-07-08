const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  hashVerificationCode,
  validateDignityAppManifest,
  executeStoredCommand
} = require('../../src');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('publisher-scoped decentralized verification (#123)', () => {
  let hub;
  let alice;
  let bob;
  const security = fastTestSecurity({ appPassword: 'publisher-trust-test', powEnabled: false });

  beforeEach(async () => {
    hub = new InMemoryNetworkHub();
    alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await alice.start();
    await bob.start();
  });

  afterEach(async () => {
    await alice.stop();
    await bob.stop();
  });

  test('registerPublisherVerification advertises officialPublishers in discovery', async () => {
    const rules = { max: 100 };
    alice.registerPublisherVerification('alice', 'posts', {
      code: rules,
      version: '0.13.0',
      dappId: 'timeline-demo',
      policy: 'strict'
    });

    await alice.joinDiscovery('room:official');
    await bob.joinDiscovery('room:official', { bootstrapPeerIds: ['alice'] });
    await new Promise((resolve) => setTimeout(resolve, 40));

    const peers = bob.listPeers('room:official', { includeSelf: false });
    const official = peers[0]?.metadata?.officialPublishers?.alice?.posts;
    expect(official.verificationVersion).toBe('0.13.0');
    expect(official.dappId).toBe('timeline-demo');
    expect(official.verificationHash).toMatch(/^sha512:/);
  });

  test('subscriber trusts official publisher hash, rejects impostor sender', async () => {
    const officialRules = { currency: 'USD' };
    const rogueRules = { currency: 'EUR' };

    alice.registerPublisherVerification('alice', 'ledger', {
      code: officialRules,
      version: '1.0.0',
      policy: 'strict'
    });
    bob.registerPublisherVerification('alice', 'ledger', {
      code: officialRules,
      version: '1.0.0',
      policy: 'strict'
    });

    const aliceEntry = alice.getPublisherVerificationEntry('alice', 'ledger');
    const accepted = bob.restoreRecord('ledger', {
      id: 'l1',
      ownerId: 'alice',
      data: { amount: 1 },
      createdAt: 1,
      updatedAt: 1,
      deletedAt: null,
      version: 1,
      verificationHash: aliceEntry.hash,
      verificationVersion: '1.0.0'
    }, { senderId: 'alice' });
    expect(accepted).toBe(true);

    const rejected = [];
    bob.on('policyrejected', (e) => rejected.push(e));
    const rogueEntry = hashVerificationCode(rogueRules, { policy: 'strict' });
    const denied = bob.restoreRecord('ledger', {
      id: 'l2',
      ownerId: 'carol',
      data: { amount: 2 },
      createdAt: 1,
      updatedAt: 1,
      deletedAt: null,
      version: 1,
      verificationHash: rogueEntry,
      verificationVersion: '1.0.0'
    }, { senderId: 'carol' });
    expect(denied).toBe(false);
    expect(rejected.length).toBeGreaterThan(0);
  });

  test('stored commands reject when manifest official dapp hash does not match publisher registry', async () => {
    const rules = { allowText: true };
    const logicHash = hashVerificationCode(rules, { policy: 'advisory' });

    const validated = validateDignityAppManifest({
      id: 'timeline-demo',
      title: 'Timeline',
      collections: ['posts'],
      publisherId: 'alice',
      dappVersion: '0.13.0',
      logicHash: 'sha512:' + '0'.repeat(128),
      storedCommands: [{
        id: 'create-post',
        kind: 'create',
        collection: 'posts',
        allowedFields: ['text']
      }]
    });
    expect(validated.ok).toBe(true);
    const manifest = validated.manifest;

    await alice.joinPeerGroup('feed:timeline', { role: 'publisher', domainEvents: true });

    const result = await executeStoredCommand(alice, manifest, 'create-post', {
      data: { text: 'hello' }
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('official-dapp-not-registered');

    alice.registerPublisherVerification('alice', 'posts', {
      code: rules,
      version: '0.13.0',
      dappId: 'timeline-demo',
      policy: 'advisory'
    });

    const mismatch = await executeStoredCommand(alice, manifest, 'create-post', {
      data: { text: 'hello' }
    });
    expect(mismatch.ok).toBe(false);
    expect(mismatch.reason).toBe('official-dapp-hash-mismatch');

    const fixed = validateDignityAppManifest({
      id: manifest.id,
      title: manifest.title,
      collections: manifest.collections,
      publisherId: manifest.publisherId,
      dappVersion: manifest.dappVersion,
      logicHash,
      storedCommands: manifest.storedCommands
    });
    expect(fixed.ok).toBe(true);
    const ok = await executeStoredCommand(alice, fixed.manifest, 'create-post', {
      data: { text: 'hello' }
    });
    expect(ok.ok).toBe(true);
  });
});
