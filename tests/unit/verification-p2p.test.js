const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('DignityP2P verification integration (#115–#117)', () => {
  let hub;
  let alice;
  let bob;

  beforeEach(async () => {
    hub = new InMemoryNetworkHub();
    const security = fastTestSecurity({ appPassword: 'verification-test' });

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

  test('registerVerification embeds hash in operations and rejects strict mismatch', async () => {
    const codeV1 = { maxScore: 10 };
    const codeV2 = { maxScore: 20 };

    alice.registerVerification('games', {
      code: codeV1,
      version: '1.0.0',
      policy: 'strict'
    });
    bob.registerVerification('games', {
      code: codeV2,
      version: '1.0.0',
      policy: 'strict'
    });

    const mismatches = [];
    bob.on('verificationmismatch', (e) => mismatches.push(e));
    const rejected = [];
    bob.on('policyrejected', (e) => rejected.push(e));
    const warnings = [];
    bob.on('warning', (e) => warnings.push(e));

    await alice.create('games', { score: 1 }, {
      id: 'g1',
      broadcastScope: 'room:verification'
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(bob.read('games', 'g1')).toBeNull();
    expect(rejected.length).toBeGreaterThan(0);
    expect(
      mismatches.length > 0
      || warnings.some((w) => w.type === 'verification-version-spoof')
    ).toBe(true);
  });

  test('advisory policy accepts mismatched remote operations with warning', async () => {
    alice.registerVerification('games', {
      code: { max: 1 },
      version: '1.0.0',
      policy: 'advisory'
    });
    bob.registerVerification('games', {
      code: { max: 2 },
      version: '1.0.0',
      policy: 'advisory'
    });

    const warnings = [];
    bob.on('warning', (e) => warnings.push(e));

    await alice.create('games', { score: 1 }, {
      id: 'g2',
      broadcastScope: 'room:verification-advisory'
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(bob.read('games', 'g2')).toBeTruthy();
    expect(warnings.some((w) => w.type === 'verification-hash-mismatch')).toBe(true);
  });

  test('joinDiscovery advertises verification metadata', async () => {
    alice.registerVerification('posts', {
      code: 'read-only',
      version: '1.0.0'
    });

    await alice.joinDiscovery('room:verification-meta');
    await bob.joinDiscovery('room:verification-meta', { bootstrapPeerIds: ['alice'] });
    await new Promise((resolve) => setTimeout(resolve, 40));

    const peers = bob.listPeers('room:verification-meta', { includeSelf: false });
    expect(peers[0]?.metadata?.verification?.posts?.verificationVersion).toBe('1.0.0');
  });

  test('registerVerification validates inputs and updates discovery metadata', async () => {
    await alice.joinDiscovery('room:verification-register', { metadata: { app: 'v1' } });

    expect(() => alice.registerVerification('', { code: 'x' })).toThrow('collectionName');
    expect(() => alice.registerVerification('games', {})).toThrow('code');

    const summary = alice.registerVerification('games', { code: 'rules-v1', version: '2.0.0' });
    expect(summary.verificationVersion).toBe('2.0.0');
    expect(alice.getVerificationEntry('games').hash).toBe(summary.verificationHash);

    const self = alice.listPeers('room:verification-register', { includeSelf: true })[0];
    expect(self.metadata.verification.games.verificationVersion).toBe('2.0.0');
  });

  test('patch-only policy accepts same major.minor over the wire', async () => {
    const code = { max: 100 };

    alice.registerVerification('scores', { code, version: '1.2.0', policy: 'patch-only' });
    bob.registerVerification('scores', { code: { max: 999 }, version: '1.2.5', policy: 'patch-only' });

    await alice.create('scores', { points: 1 }, {
      id: 's1',
      broadcastScope: 'room:patch-only'
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(bob.read('scores', 's1')).toBeTruthy();
  });

  test('restoreRecord rejects verification mismatch under strict policy', async () => {
    alice.registerVerification('ledger', { code: 'v1', version: '1.0.0' });
    bob.registerVerification('ledger', { code: 'v2', version: '1.0.0', policy: 'strict' });

    const aliceEntry = alice.getVerificationEntry('ledger');
    const rejected = [];
    bob.on('policyrejected', (e) => rejected.push(e));

    const applied = bob.restoreRecord('ledger', {
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

    expect(applied).toBe(false);
    expect(rejected.length).toBeGreaterThan(0);
  });

  test('attachVerificationMetadata is a no-op without registry entry', () => {
    const target = { collectionName: 'unknown', id: 'x' };
    expect(alice.attachVerificationMetadata(target)).toBe(target);
    expect(target.verificationHash).toBeUndefined();
  });
});
