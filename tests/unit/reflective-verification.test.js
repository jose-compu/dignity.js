const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  hashReflectiveLogic,
  validateDignityAppManifest,
  executeStoredCommand
} = require('../../src');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('reflective verification integration (#123)', () => {
  let hub;
  let alice;
  let bob;
  const security = fastTestSecurity({ appPassword: 'reflective-test', powEnabled: false });

  const businessRules = {
    currency: 'USD',
    validatePost(record) {
      return typeof record.data.text === 'string';
    }
  };

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

  test('reflective registerVerification detects nested function drift', async () => {
    const tampered = {
      currency: 'USD',
      validatePost(record) {
        return typeof record.data.text === 'number';
      }
    };

    alice.registerVerification('posts', {
      code: businessRules,
      version: '0.13.0',
      policy: 'strict',
      reflective: true
    });
    bob.registerVerification('posts', {
      code: tampered,
      version: '0.13.0',
      policy: 'strict',
      reflective: true
    });

    const rejected = [];
    bob.on('policyrejected', (e) => rejected.push(e));

    await alice.create('posts', { text: 'hello' }, {
      id: 'p1',
      broadcastScope: 'room:reflective'
    });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(bob.read('posts', 'p1')).toBeNull();
    expect(rejected.length).toBeGreaterThan(0);
  });

  test('publisher reflective registration advertises logicFingerprints', async () => {
    const summary = alice.registerPublisherVerification('alice', 'posts', {
      code: businessRules,
      version: '0.13.0',
      dappId: 'timeline-demo',
      policy: 'strict',
      reflective: true
    });

    expect(summary.reflective).toBe(true);
    expect(summary.logicFingerprints[0].path).toBe('$.validatePost');

    await alice.joinDiscovery('room:reflective-meta');
    await bob.joinDiscovery('room:reflective-meta', { bootstrapPeerIds: ['alice'] });
    await new Promise((resolve) => setTimeout(resolve, 40));

    const meta = bob.listPeers('room:reflective-meta', { includeSelf: false })[0]
      ?.metadata?.officialPublishers?.alice?.posts;
    expect(meta.reflective).toBe(true);
    expect(meta.verificationVersion).toBe('0.13.0');
  });

  test('stored command with storedLogic registry enforces reflective hash', async () => {
    const reflective = hashReflectiveLogic(businessRules, { policy: 'advisory' });

    alice.registerPublisherVerification('alice', 'posts', {
      code: businessRules,
      version: '0.13.0',
      dappId: 'timeline-demo',
      policy: 'advisory',
      reflective: true
    });
    await alice.joinPeerGroup('feed:reflective', { role: 'publisher', domainEvents: true });

    const validated = validateDignityAppManifest({
      id: 'timeline-demo',
      title: 'Timeline',
      publisherId: 'alice',
      collections: ['posts'],
      peerGroupId: 'feed:reflective',
      storedLogic: {
        'create-post': {
          version: '0.13.0',
          hash: reflective.hash
        }
      },
      storedCommands: [{
        id: 'create-post',
        kind: 'create',
        collection: 'posts',
        allowedFields: ['text'],
        logicRef: 'create-post'
      }]
    });
    expect(validated.ok).toBe(true);

    const ok = await executeStoredCommand(alice, validated.manifest, 'create-post', {
      data: { text: 'hello reflective' }
    });
    expect(ok.ok).toBe(true);
    expect(alice.read('posts', ok.result.id).data.text).toBe('hello reflective');
  });
});
