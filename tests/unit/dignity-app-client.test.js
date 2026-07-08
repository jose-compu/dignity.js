/**
 * @jest-environment jsdom
 */

if (typeof MessageChannel === 'undefined') {
  const { MessageChannel } = require('worker_threads');
  global.MessageChannel = MessageChannel;
}

const {
  createDignityAppClient,
  connectDignityAppClient,
  buildClientBootstrapScript,
  HANDSHAKE_TYPE
} = require('../../src/apps/client');
const { createHostRpcHandler } = require('../../src/apps/bridge');
const { validateDignityAppManifest } = require('../../src/apps/manifest');

describe('Dignity App client SDK', () => {
  const manifest = validateDignityAppManifest({
    id: 'demo',
    title: 'Demo',
    collections: ['posts']
  }).manifest;

  test('createDignityAppClient query and list over MessageChannel', async () => {
    const channel = new MessageChannel();
    const replica = {
      list() {
        return [{ id: 'p1', data: { text: 'hi' } }];
      }
    };

    const handler = createHostRpcHandler({ manifest, replica });
    channel.port1.onmessage = async (event) => {
      const response = await handler.handle(event.data);
      channel.port1.postMessage(response);
    };
    channel.port1.start();

    const client = createDignityAppClient(channel.port2);
    channel.port2.start();

    const ready = await client.ready();
    expect(ready.appId).toBe('demo');

    const rows = await client.query({ collection: 'posts' });
    expect(rows).toHaveLength(1);

    const all = await client.list('posts');
    expect(all).toHaveLength(1);
  });

  test('buildClientBootstrapScript is self-contained', () => {
    const script = buildClientBootstrapScript();
    expect(script).toContain('window.dignity');
    expect(script).toContain('dignity-app-handshake');
    expect(script).toContain('error: function');
    expect(script).toContain('installCapture');
    expect(script).not.toContain('require(');
  });

  test('buildClientBootstrapScript honors forwardConsoleLog manifest flag', () => {
    const off = buildClientBootstrapScript({ forwardConsoleLog: false });
    const on = buildClientBootstrapScript({ forwardConsoleLog: true });
    expect(off).toContain('FORWARD_LOG = false');
    expect(on).toContain('FORWARD_LOG = true');
  });

  test('createDignityAppClient requires MessagePort', () => {
    expect(() => createDignityAppClient(null)).toThrow('MessagePort');
  });

  test('client surfaces RPC errors', async () => {
    const channel = new MessageChannel();
    const handler = createHostRpcHandler({ manifest, replica: null });
    channel.port1.onmessage = async (event) => {
      channel.port1.postMessage(await handler.handle(event.data));
    };
    channel.port1.start();

    const client = createDignityAppClient(channel.port2);
    channel.port2.start();

    await expect(client.query({ collection: 'posts' })).rejects.toThrow('Query replica is not attached');
  });

  test('client log, error, and runStoredCommand RPC methods', async () => {
    const channel = new MessageChannel();
    const logs = [];
    const errors = [];
    const handler = createHostRpcHandler({
      manifest,
      replica: { list: () => [] },
      onLog: (p) => logs.push(p),
      onError: (p) => errors.push(p)
    });
    channel.port1.onmessage = async (event) => {
      channel.port1.postMessage(await handler.handle(event.data));
    };
    channel.port1.start();

    const client = createDignityAppClient(channel.port2);
    channel.port2.start();

    await client.log('hello', { n: 1 });
    await client.error('oops', 'stack');

    expect(logs[0].message).toBe('hello');
    expect(errors[0].message).toBe('oops');
  });

  test('client ignores malformed port responses', async () => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      if (!event.data?.rpcId) {
        return;
      }
      channel.port1.postMessage({ rpcId: event.data.rpcId, ok: true, result: { appId: 'demo' } });
    };
    channel.port1.start();

    const client = createDignityAppClient(channel.port2);
    channel.port2.start();

    channel.port2.postMessage(null);
    channel.port2.postMessage({ noRpcId: true });
    channel.port2.postMessage({ rpcId: 'unknown' });

    const ready = await client.ready();
    expect(ready.appId).toBe('demo');
  });

  test('client rejects RPC with error envelope', async () => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      channel.port1.postMessage({
        rpcId: event.data.rpcId,
        ok: false,
        error: { code: 'denied' }
      });
    };
    channel.port1.start();

    const client = createDignityAppClient(channel.port2);
    channel.port2.start();

    await expect(client.ready()).rejects.toThrow('RPC failed');
  });

  test('connectDignityAppClient resolves on parent handshake', async () => {
    const channel = new MessageChannel();
    const connectPromise = connectDignityAppClient({ timeoutMs: 3000 });

    window.dispatchEvent(new MessageEvent('message', {
      data: { type: HANDSHAKE_TYPE },
      ports: [channel.port1]
    }));

    const client = await connectPromise;
    expect(typeof client.query).toBe('function');
  });

  test('connectDignityAppClient rejects handshake without port', async () => {
    const connectPromise = connectDignityAppClient({ timeoutMs: 3000 });

    window.dispatchEvent(new MessageEvent('message', {
      data: { type: HANDSHAKE_TYPE }
    }));

    await expect(connectPromise).rejects.toThrow('missing MessagePort');
  });

  test('connectDignityAppClient ignores unrelated postMessage', async () => {
    const channel = new MessageChannel();
    const connectPromise = connectDignityAppClient({ timeoutMs: 3000 });

    window.dispatchEvent(new MessageEvent('message', { data: { type: 'other' } }));
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: HANDSHAKE_TYPE },
      ports: [channel.port1]
    }));

    const client = await connectPromise;
    expect(client).toBeTruthy();
  });

  test('connectDignityAppClient times out without handshake', async () => {
    await expect(connectDignityAppClient({ timeoutMs: 50 })).rejects.toThrow('handshake timed out');
  }, 10000);

  test('client runStoredCommand over MessageChannel', async () => {
    const {
      DignityP2P,
      InMemoryNetworkHub,
      InMemoryNetworkAdapter
    } = require('../../src');
    const { fastTestSecurity } = require('../helpers/fast-security');

    const hub = new InMemoryNetworkHub();
    const publisher = new DignityP2P({
      nodeId: 'pub',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: fastTestSecurity({ powEnabled: false })
    });
    await publisher.start();
    await publisher.joinPeerGroup('feed:app', { role: 'publisher' });
    await publisher.create('posts', { upvotes: 0 }, { id: 'p1', peerGroupId: 'feed:app' });

    const cmdManifest = validateDignityAppManifest({
      id: 'demo',
      title: 'Demo',
      collections: ['posts'],
      peerGroupId: 'feed:app',
      storedCommands: [{
        id: 'upvote',
        collection: 'posts',
        kind: 'update',
        allowedFields: ['upvotes']
      }]
    }).manifest;

    const channel = new MessageChannel();
    const handler = createHostRpcHandler({ manifest: cmdManifest, node: publisher });
    channel.port1.onmessage = async (event) => {
      channel.port1.postMessage(await handler.handle(event.data));
    };
    channel.port1.start();

    const client = createDignityAppClient(channel.port2);
    channel.port2.start();

    const result = await client.runStoredCommand('upvote', { id: 'p1', patch: { upvotes: 3 } });
    expect(result).toBeTruthy();
    expect(publisher.read('posts', 'p1').data.upvotes).toBe(3);

    await publisher.stop();
  });

  test('client onmessage ignores host responses without rpcId', async () => {
    const channel = new MessageChannel();
    const client = createDignityAppClient(channel.port2);
    channel.port2.start();
    channel.port1.start();
    channel.port1.postMessage(null);

    channel.port1.onmessage = (event) => {
      channel.port1.postMessage({ rpcId: event.data.rpcId, ok: true, result: { appId: 'demo' } });
    };

    const ready = await client.ready();
    expect(ready.appId).toBe('demo');
  });
});
