const EventEmitter = require('../utils/event-emitter');
const { validateDignityAppManifest } = require('./manifest');
const { prepareSandboxedAppHtml } = require('./csp');
const { createHostRpcHandler } = require('./bridge');
const { buildClientBootstrapScript, HANDSHAKE_TYPE } = require('./client');

const DEFAULT_SANDBOX = 'allow-scripts';

/**
 * Host page for sandboxed Dignity Apps (#102, #103).
 */
class DignityAppHost extends EventEmitter {
  /**
   * @param {object} options
   * @param {object} options.manifest - raw or validated manifest
   * @param {import('../cqrs/query-replica')|null} [options.replica]
   * @param {import('../core/dignity-p2p')|null} [options.node]
   * @param {Document} [options.document] - DOM document (default global)
   */
  constructor({ manifest, replica = null, node = null, document: doc = null } = {}) {
    super();

    const validated = manifest?.schemaVersion
      ? { ok: true, manifest }
      : validateDignityAppManifest(manifest);

    if (!validated.ok) {
      throw new Error(`Invalid Dignity App manifest: ${validated.reason}`);
    }

    this.manifest = validated.manifest;
    this.replica = replica;
    this.node = node;
    this.document = doc || (typeof document !== 'undefined' ? document : null);

    this.iframe = null;
    this.channel = null;
    this.hostPort = null;
    this.channelReady = false;
    this.rpcHandler = createHostRpcHandler({
      manifest: this.manifest,
      replica: this.replica,
      node: this.node,
      onLog: (payload) => this.emit('applog', payload),
      onError: (payload) => this.emit('apperror', payload)
    });

    this._onWindowMessage = this._onWindowMessage.bind(this);
    this._onIframeLoad = this._onIframeLoad.bind(this);
  }

  /**
   * Mount sandboxed app into a container element.
   * @param {HTMLElement} container
   * @param {string} appHtml - raw app HTML (CSP injected by host)
   */
  mount(container, appHtml) {
    if (!this.document) {
      throw new Error('DignityAppHost.mount requires a DOM document');
    }
    if (!container) {
      throw new Error('DignityAppHost.mount requires a container element');
    }

    this.unmount();

    this.iframe = this.document.createElement('iframe');
    this.iframe.setAttribute('sandbox', DEFAULT_SANDBOX);
    this.iframe.setAttribute('title', this.manifest.title);
    this.iframe.setAttribute('referrerpolicy', 'no-referrer');

    const prepared = this._prepareHtml(appHtml);
    this.iframe.srcdoc = prepared;

    this.iframe.addEventListener('load', this._onIframeLoad);
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this._onWindowMessage);
    }

    container.appendChild(this.iframe);
    this._openChannel();
  }

  /**
   * Remove iframe and invalidate channel.
   */
  unmount() {
    this._invalidateChannel();

    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this._onWindowMessage);
    }

    if (this.iframe) {
      this.iframe.removeEventListener('load', this._onIframeLoad);
      if (this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
      }
      this.iframe = null;
    }
  }

  /**
   * Whether RPC channel is ready for requests.
   * @returns {boolean}
   */
  isChannelReady() {
    return this.channelReady;
  }

  /**
   * Send RPC directly on host port (for tests).
   * @param {string} method
   * @param {object} params
   * @returns {Promise<*>}
   */
  async rpc(method, params = {}) {
    if (!this.channelReady || !this.hostPort) {
      throw new Error('Dignity App channel is not ready');
    }

    const rpcId = `host-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const response = await this.rpcHandler.handle({ rpcId, method, params });
    if (!response.ok) {
      const err = new Error(response.error?.message || 'RPC failed');
      err.code = response.error?.code;
      this.emit('apprpcerror', {
        method,
        code: err.code,
        message: err.message
      });
      throw err;
    }

    if (method === 'query' || method === 'list') {
      return response.result.records;
    }

    return response.result;
  }

  _prepareHtml(appHtml) {
    let html = prepareSandboxedAppHtml(appHtml, this.manifest);
    const bootstrap = buildClientBootstrapScript(this.manifest);
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `  ${bootstrap}\n</head>`);
    } else {
      html = `${bootstrap}${html}`;
    }
    return html;
  }

  _openChannel() {
    if (typeof MessageChannel === 'undefined') {
      throw new Error('MessageChannel is not available');
    }

    this._invalidateChannel();
    this.channel = new MessageChannel();
    this.hostPort = this.channel.port1;
    this.channelReady = false;

    this.hostPort.onmessage = async (event) => {
      const response = await this.rpcHandler.handle(event.data);
      this.hostPort.postMessage(response);
      if (!response.ok && ['query', 'list', 'runStoredCommand'].includes(event.data?.method)) {
        this.emit('apprpcerror', {
          method: event.data.method,
          code: response.error?.code,
          message: response.error?.message
        });
      }
      if (event.data?.method === 'ready' && response.ok) {
        this.channelReady = true;
        this.emit('ready', { appId: this.manifest.id });
      }
    };
    this.hostPort.start();
  }

  _invalidateChannel() {
    this.channelReady = false;
    const channel = this.channel;

    if (this.hostPort) {
      try {
        this.hostPort.onmessage = null;
        this.hostPort.close();
      } catch (error) {
        // ignore
      }
      this.hostPort = null;
    }

    if (channel) {
      try {
        channel.port2.onmessage = null;
        channel.port2.close();
      } catch (error) {
        // ignore — port2 may already be transferred or closed
      }
    }

    this.channel = null;
  }

  _onIframeLoad() {
    if (!this.iframe || !this.channel) {
      return;
    }

    const target = this.iframe.contentWindow;
    if (!target) {
      return;
    }

    target.postMessage({ type: HANDSHAKE_TYPE }, '*', [this.channel.port2]);
  }

  _onWindowMessage(event) {
    if (event.data?.type === 'dignity-app-csp-violation') {
      this.emit('apperror', {
        type: 'csp-violation',
        blockedURI: event.data.blockedURI,
        violatedDirective: event.data.violatedDirective,
        originalPolicy: event.data.originalPolicy
      });
    }
  }
}

module.exports = {
  DignityAppHost,
  DEFAULT_SANDBOX
};
