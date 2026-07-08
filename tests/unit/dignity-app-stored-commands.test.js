const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  validateDignityAppManifest
} = require('../../src');
const {
  executeStoredCommand,
  isPublisherCommandCapable,
  validateAllowedFields
} = require('../../src/apps/stored-commands');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('Dignity App stored commands', () => {
  let hub;
  let security;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    security = fastTestSecurity({ appPassword: 'stored-cmd-test', powEnabled: false });
  });

  function manifestWithCommands(storedCommands) {
    return validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      peerGroupId: 'feed:app',
      storedCommands
    }).manifest;
  }

  test('read-only manifest cannot execute stored commands', async () => {
    const manifest = validateDignityAppManifest({
      id: 'ro',
      title: 'Read only',
      collections: ['posts']
    }).manifest;

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });

    const warnings = [];
    node.on('warning', (e) => warnings.push(e));

    const result = await executeStoredCommand(node, manifest, 'upvote', { id: 'p1', patch: { score: 1 } });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('read-only-manifest');
    expect(warnings[0].type).toBe('stored-command-rejected');

    await node.stop();
  });

  test('rejects patches outside allowedFields', async () => {
    const manifest = manifestWithCommands([{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]);

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });
    await node.create('posts', { upvotes: 0, title: 'a' }, { id: 'p1', peerGroupId: 'feed:app' });

    const warnings = [];
    node.on('warning', (w) => warnings.push(w));

    const result = await executeStoredCommand(node, manifest, 'upvote', {
      id: 'p1',
      patch: { title: 'hacked' }
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('field-not-allowed');
    expect(warnings[0].reason).toBe('field-not-allowed');

    await node.stop();
  });

  test('rejects commands on subscriber-only node', async () => {
    const manifest = manifestWithCommands([{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]);

    const node = new DignityP2P({
      nodeId: 'sub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'subscriber', commandCapable: false });

    expect(isPublisherCommandCapable(node, manifest)).toBe(false);

    const result = await executeStoredCommand(node, manifest, 'upvote', {
      id: 'p1',
      patch: { upvotes: 1 }
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('not-command-capable');

    await node.stop();
  });

  test('happy path update via stored command on publisher', async () => {
    const manifest = manifestWithCommands([{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]);

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });
    await node.create('posts', { upvotes: 0 }, { id: 'p1', peerGroupId: 'feed:app' });

    const result = await executeStoredCommand(node, manifest, 'upvote', {
      id: 'p1',
      patch: { upvotes: 1 }
    });
    expect(result.ok).toBe(true);
    expect(node.read('posts', 'p1').data.upvotes).toBe(1);

    await node.stop();
  });

  test('rejects unknown command id', async () => {
    const manifest = manifestWithCommands([{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]);

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });

    const result = await executeStoredCommand(node, manifest, 'missing', { id: 'p1', patch: { upvotes: 1 } });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unknown-command');

    await node.stop();
  });

  test('create and delete stored commands on publisher', async () => {
    const manifest = manifestWithCommands([
      {
        id: 'new-post',
        collection: 'posts',
        kind: 'create',
        allowedFields: ['text']
      },
      {
        id: 'remove-post',
        collection: 'posts',
        kind: 'delete'
      }
    ]);

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });

    const created = await executeStoredCommand(node, manifest, 'new-post', {
      id: 'p2',
      data: { text: 'new' }
    });
    expect(created.ok).toBe(true);
    expect(node.read('posts', 'p2').data.text).toBe('new');

    const removed = await executeStoredCommand(node, manifest, 'remove-post', { id: 'p2' });
    expect(removed.ok).toBe(true);
    expect(node.read('posts', 'p2')).toBeNull();

    await node.stop();
  });

  test('rejects invalid args and unsupported command kind', async () => {
    const manifest = manifestWithCommands([
      {
        id: 'bad-create',
        collection: 'posts',
        kind: 'create',
        allowedFields: ['text']
      },
      {
        id: 'noop',
        collection: 'posts',
        kind: 'update',
        allowedFields: ['upvotes']
      }
    ]);
    manifest.storedCommands[1].kind = 'noop';

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });

    expect((await executeStoredCommand(node, manifest, 'bad-create', {})).reason).toBe('invalid-args');
    expect((await executeStoredCommand(node, manifest, 'bad-create', { data: { text: 'x', extra: 1 } })).reason)
      .toBe('field-not-allowed');
    expect((await executeStoredCommand(node, manifest, 'noop', { id: 'p1' })).reason).toBe('unsupported-kind');

    await node.stop();
  });

  test('isPublisherCommandCapable without manifest peerGroupId', async () => {
    const manifest = manifestWithCommands([{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]);
    delete manifest.peerGroupId;

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('other:group', { role: 'publisher' });

    expect(isPublisherCommandCapable(node, manifest)).toBe(true);

    await node.stop();
  });

  test('isPublisherCommandCapable handles missing node and wrong peer group', async () => {
    expect(isPublisherCommandCapable(null, {})).toBe(false);

    const manifest = manifestWithCommands([{
      id: 'upvote',
      collection: 'posts',
      kind: 'update',
      allowedFields: ['upvotes']
    }]);

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('other:group', { role: 'publisher' });

    expect(isPublisherCommandCapable(node, manifest)).toBe(false);

    await node.stop();
  });

  test('rejects update and delete without required args', async () => {
    const manifest = manifestWithCommands([
      {
        id: 'patch-post',
        collection: 'posts',
        kind: 'update',
        allowedFields: ['text']
      },
      {
        id: 'drop-post',
        collection: 'posts',
        kind: 'delete'
      }
    ]);

    const node = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    await node.start();
    await node.joinPeerGroup('feed:app', { role: 'publisher' });

    expect((await executeStoredCommand(node, manifest, 'patch-post', { id: 'p1' })).reason).toBe('invalid-args');
    expect((await executeStoredCommand(node, manifest, 'drop-post', {})).reason).toBe('invalid-args');

    await node.stop();
  });

  test('validateAllowedFields allows commands without field list', () => {
    expect(validateAllowedFields({ kind: 'update' }, { any: 'field' })).toBeNull();
    expect(validateAllowedFields({ allowedFields: ['a'] }, { b: 1 })).toBe('field-not-allowed');
  });
});
