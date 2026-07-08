/**
 * @jest-environment jsdom
 */

if (typeof MessageChannel === 'undefined') {
  const { MessageChannel } = require('worker_threads');
  global.MessageChannel = MessageChannel;
}

const { DignityAppHost } = require('../../src/apps/host');
const { attachErrorPanel, ensurePanelStyles } = require('../../src/apps/error-panel');
const { validateDignityAppManifest } = require('../../src/apps/manifest');
const EventEmitter = require('../../src/utils/event-emitter');

describe('Dignity App error panel (#106)', () => {
  const manifest = validateDignityAppManifest({
    id: 'demo',
    title: 'Demo',
    collections: ['posts']
  }).manifest;

  test('attachErrorPanel requires host and container', () => {
    expect(() => attachErrorPanel(null, null)).toThrow('host and container');
    expect(() => attachErrorPanel(new EventEmitter(), null)).toThrow('host and container');
  });

  test('auto-expands on apperror and tracks log entries', () => {
    const host = new EventEmitter();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const panel = attachErrorPanel(host, container, { maxEntries: 5 });
    const errorPanel = container.querySelector('.dignity-app-panel--errors');
    const logPanel = container.querySelector('.dignity-app-panel--logs');
    expect(errorPanel.hidden).toBe(true);

    host.emit('applog', { message: 'hello from app' });
    host.emit('applog', { message: 'second log' });
    host.emit('apperror', { message: 'boom', type: 'runtime' });

    expect(errorPanel.hidden).toBe(false);
    expect(logPanel.textContent).toContain('App log (2)');
    expect(errorPanel.textContent).toContain('App errors (1)');
    expect(errorPanel.textContent).toContain('boom');

    host.emit('apprpcerror', { code: 'query-failed', message: 'Query replica missing' });
    expect(errorPanel.textContent).toContain('App errors (2)');

    const errorToggle = errorPanel.querySelector('.dignity-app-panel__toggle');
    const errorBody = errorPanel.querySelector('.dignity-app-panel__body');
    expect(errorBody.hidden).toBe(false);
    errorToggle.click();
    expect(errorBody.hidden).toBe(true);
    errorToggle.click();
    expect(errorBody.hidden).toBe(false);

    const logToggle = logPanel.querySelector('.dignity-app-panel__toggle');
    const logBody = logPanel.querySelector('.dignity-app-panel__body');
    logToggle.click();
    expect(logBody.hidden).toBe(false);
    logToggle.click();
    expect(logBody.hidden).toBe(true);

    panel.destroy();
    document.body.removeChild(container);
  });

  test('trims entries when maxEntries exceeded and formats fallback payloads', () => {
    const host = new EventEmitter();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const panel = attachErrorPanel(host, container, { maxEntries: 1 });
    const errorPanel = container.querySelector('.dignity-app-panel--errors');

    host.emit('apperror', { reason: 'first' });
    host.emit('apperror', { reason: 'second' });
    expect(errorPanel.textContent).toContain('App errors (1)');
    expect(errorPanel.textContent).toContain('second');

    host.emit('apprpcerror', { code: 'rpc-only' });
    expect(errorPanel.textContent).toContain('rpc-only');

    host.emit('applog', { type: 'custom', foo: 'bar' });
    expect(container.querySelector('.dignity-app-panel--logs').textContent).toContain('custom');

    panel.destroy();
    document.body.removeChild(container);
  });

  test('ensurePanelStyles is idempotent', () => {
    ensurePanelStyles(document);
    ensurePanelStyles(document);
    expect(document.getElementById('dignity-app-error-panel-styles')).toBeTruthy();
    ensurePanelStyles(null);
  });

  test('host.rpc emits apprpcerror on failure', async () => {
    const host = new DignityAppHost({ manifest, replica: null, document });
    host._openChannel();

    const errors = [];
    host.on('apprpcerror', (e) => errors.push(e));

    const clientPort = host.channel.port2;
    clientPort.start();
    clientPort.postMessage({ rpcId: 'r1', method: 'ready', params: {} });
    await new Promise((resolve) => host.on('ready', resolve));

    await expect(host.rpc('query', { collection: 'posts' })).rejects.toThrow();
    expect(errors[0].method).toBe('query');
  });
});
