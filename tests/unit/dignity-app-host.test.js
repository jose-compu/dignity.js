/**
 * @jest-environment jsdom
 */

if (typeof MessageChannel === 'undefined') {
  const { MessageChannel } = require('worker_threads');
  global.MessageChannel = MessageChannel;
}

const { DignityAppHost, DEFAULT_SANDBOX } = require('../../src/apps/host');
const { validateDignityAppManifest } = require('../../src/apps/manifest');
const { prepareSandboxedAppHtml } = require('../../src/apps/csp');

describe('DignityAppHost', () => {
  const manifest = validateDignityAppManifest({
    id: 'demo',
    title: 'Demo App',
    collections: ['posts'],
    allowedCspOrigins: ['https://cdn.example.com']
  }).manifest;

  const replica = {
    list() {
      return [{ id: 'p1', ownerId: 'alice', data: { text: 'hello' } }];
    }
  };

  test('mount uses sandbox allow-scripts only and injects CSP meta first in head', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    const container = document.createElement('div');
    document.body.appendChild(container);

    host.mount(container, '<html><head><title>App</title></head><body><p>Hi</p></body></html>');

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute('sandbox')).toBe(DEFAULT_SANDBOX);
    expect(iframe.srcdoc).toContain('Content-Security-Policy');
    expect(iframe.srcdoc).toContain('https://cdn.example.com');
    expect(iframe.srcdoc.indexOf('Content-Security-Policy')).toBeLessThan(iframe.srcdoc.indexOf('<title>'));

    host.unmount();
    document.body.removeChild(container);
  });

  test('RPC before channel ready throws', async () => {
    const host = new DignityAppHost({ manifest, replica, document });
    await expect(host.rpc('query', { collection: 'posts' })).rejects.toThrow('channel is not ready');
  });

  test('handshake establishes channel and query returns replica data', async () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();

    const clientPort = host.channel.port2;
    clientPort.start();

    const readyPromise = new Promise((resolve) => host.on('ready', resolve));
    clientPort.postMessage({ rpcId: 'r1', method: 'ready', params: {} });
    await readyPromise;

    expect(host.isChannelReady()).toBe(true);

    const records = await host.rpc('query', { collection: 'posts' });
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('p1');
  });

  test('channel invalidated on iframe reload', async () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();

    const clientPort = host.channel.port2;
    clientPort.start();
    clientPort.postMessage({ rpcId: 'r1', method: 'ready', params: {} });
    await new Promise((resolve) => host.on('ready', resolve));

    expect(host.isChannelReady()).toBe(true);
    host._invalidateChannel();
    expect(host.isChannelReady()).toBe(false);
  });

  test('forwards CSP violation postMessage as apperror', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    const errors = [];
    host.on('apperror', (e) => errors.push(e));

    host._onWindowMessage({
      data: {
        type: 'dignity-app-csp-violation',
        blockedURI: 'https://evil.example',
        violatedDirective: 'connect-src'
      }
    });

    expect(errors[0].type).toBe('csp-violation');
    expect(errors[0].blockedURI).toBe('https://evil.example');
  });

  test('prepareSandboxedAppHtml is used by host mount', () => {
    const html = prepareSandboxedAppHtml('<html><head></head><body></body></html>', manifest);
    expect(html).toContain('securitypolicyviolation');
  });

  test('rejects invalid manifest', () => {
    expect(() => new DignityAppHost({ manifest: { id: '' }, document })).toThrow('Invalid Dignity App manifest');
  });

  test('accepts pre-validated manifest with schemaVersion', () => {
    const host = new DignityAppHost({ manifest: { ...manifest, schemaVersion: 1 }, replica, document });
    expect(host.manifest.id).toBe('demo');
  });

  test('mount requires document and container', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host.document = null;
    expect(() => host.mount(document.createElement('div'), '<html></html>')).toThrow('requires a DOM document');

    const host2 = new DignityAppHost({ manifest, replica, document });
    expect(() => host2.mount(null, '<html></html>')).toThrow('requires a container element');
  });

  test('rpc propagates handler errors', async () => {
    const host = new DignityAppHost({ manifest, replica: null, document });
    host._openChannel();
    host.channelReady = true;

    await expect(host.rpc('query', { collection: 'posts' })).rejects.toThrow('Query replica is not attached');
  });

  test('rpc returns non-list results', async () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();
    host.channelReady = true;

    const result = await host.rpc('ready', {});
    expect(result.appId).toBe('demo');
  });

  test('mount without head prepends bootstrap script', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    const container = document.createElement('div');
    host.mount(container, '<p>no head</p>');
    expect(container.querySelector('iframe').srcdoc).toContain('window.dignity');
    host.unmount();
  });

  test('iframe load posts handshake MessagePort', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();
    const posted = [];
    host.iframe = {
      contentWindow: {
        postMessage(msg, origin, ports) {
          posted.push({ msg, origin, ports });
        }
      }
    };

    host._onIframeLoad();
    expect(posted[0].msg.type).toBe('dignity-app-handshake');
    expect(posted[0].ports[0]).toBe(host.channel.port2);
  });

  test('_onIframeLoad no-ops when contentWindow is missing', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();
    host.iframe = { contentWindow: null };
    expect(() => host._onIframeLoad()).not.toThrow();
  });

  test('_onIframeLoad is no-op without iframe or channel', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    expect(() => host._onIframeLoad()).not.toThrow();
    host.iframe = {};
    expect(() => host._onIframeLoad()).not.toThrow();
  });

  test('_openChannel throws when MessageChannel is unavailable', () => {
    const saved = global.MessageChannel;
    delete global.MessageChannel;
    const host = new DignityAppHost({ manifest, replica, document });
    expect(() => host._openChannel()).toThrow('MessageChannel is not available');
    global.MessageChannel = saved;
  });

  test('emits applog when iframe client sends log RPC', async () => {
    const host = new DignityAppHost({ manifest, replica, document });
    const logs = [];
    host.on('applog', (e) => logs.push(e));
    host._openChannel();

    const clientPort = host.channel.port2;
    clientPort.start();
    clientPort.postMessage({ rpcId: 'log-1', method: 'log', params: { message: 'from app' } });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(logs[0].message).toBe('from app');
  });

  test('_prepareHtml prepends bootstrap when html has no head tag', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    const out = host._prepareHtml('<p>bare fragment</p>');
    expect(out).toContain('window.dignity');
    expect(out).toContain('<p>bare fragment</p>');
  });

  test('unmount tolerates detached iframe', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host.iframe = document.createElement('iframe');
    expect(() => host.unmount()).not.toThrow();
  });

  test('_invalidateChannel swallows port.close errors', () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();
    host.hostPort.close = () => {
      throw new Error('already closed');
    };
    expect(() => host._invalidateChannel()).not.toThrow();
  });

  test('rpc uses default error message when handler omits text', async () => {
    const host = new DignityAppHost({ manifest, replica, document });
    host._openChannel();
    host.channelReady = true;
    host.rpcHandler.handle = async () => ({ ok: false, error: { code: 'x' } });
    await expect(host.rpc('ready', {})).rejects.toThrow('RPC failed');
  });
});
