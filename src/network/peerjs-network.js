const { DEFAULT_CLOUDFLARE_SIGNALING_URLS } = require('../signaling/default-signaling-config');
const parsePeerJsServerUrl = require('../signaling/parse-peerjs-url');

const DEFAULT_START_ATTEMPTS = 4;
const DEFAULT_START_RETRY_DELAYS_MS = Object.freeze([250, 500, 1000]);

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isFatalSignalingError(error) {
  const type = String(error?.type || '');
  const message = String(error?.message || error || '');
  return /unavailable-id|invalid-key/i.test(type)
    || /unavailable-id|invalid-key|is taken|invalid api key/i.test(message);
}

function resolvePeerImplementation(PeerImpl) {
  if (PeerImpl) {
    return PeerImpl;
  }

  try {
    const peerjs = require('peerjs');
    return peerjs.Peer || peerjs;
  } catch (error) {
    return null;
  }
}

class PeerJSNetworkAdapter {
  constructor({
    url,
    urls,
    PeerImpl,
    connectTimeoutMs = 12000,
    iceServers = null,
    peerOptions = null,
    startAttempts = DEFAULT_START_ATTEMPTS,
    startRetryDelaysMs = DEFAULT_START_RETRY_DELAYS_MS,
    reconnectBaseDelayMs = 500,
    reconnectMaxDelayMs = 15000
  } = {}) {
    this.urls = urls || (url ? [url] : [...DEFAULT_CLOUDFLARE_SIGNALING_URLS]);
    this.url = this.urls[0];
    this.PeerImpl = resolvePeerImplementation(PeerImpl);
    this.connectTimeoutMs = connectTimeoutMs;
    this.iceServers = iceServers;
    this.peerOptions = peerOptions;
    this.startAttempts = startAttempts;
    this.startRetryDelaysMs = startRetryDelaysMs;
    this.reconnectBaseDelayMs = reconnectBaseDelayMs;
    this.reconnectMaxDelayMs = reconnectMaxDelayMs;
    this.nodeId = null;
    this.peer = null;
    this.connections = new Map();
    this.pendingConnections = new Map();
    this.messageHandlers = new Set();
    this._stopped = false;
    this._session = 0;
    this._reconnectAttempt = 0;
    this._reconnectTimer = null;
    this._reconnectInflight = false;
  }

  async start(nodeId) {
    if (!nodeId) {
      throw new Error('PeerJSNetworkAdapter requires nodeId on start');
    }

    if (!this.PeerImpl) {
      throw new Error('PeerJS implementation is not available');
    }

    this._session += 1;
    const session = this._session;
    this._stopped = false;
    this._reconnectAttempt = 0;
    this._clearReconnectTimer();
    this._destroyPeer();

    let lastError;
    for (const candidateUrl of this.urls) {
      for (let attempt = 1; attempt <= this.startAttempts; attempt += 1) {
        if (this._stopped || this._session !== session) {
          throw new Error('PeerJS network adapter stopped');
        }
        try {
          await this.startWithUrl(nodeId, candidateUrl);
          if (this._stopped || this._session !== session) {
            this._destroyPeer();
            throw new Error('PeerJS network adapter stopped');
          }
          this.url = candidateUrl;
          return;
        } catch (error) {
          lastError = error;
          if (isFatalSignalingError(error) || attempt >= this.startAttempts) {
            break;
          }
          const delay = this.startRetryDelaysMs[attempt - 1] ?? 1000;
          if (delay > 0) {
            await wait(delay);
          }
        }
      }
    }

    throw lastError || new Error('Unable to connect PeerJS network adapter');
  }

  async startWithUrl(nodeId, url) {
    this.nodeId = nodeId;
    const server = parsePeerJsServerUrl(url);

    await new Promise((resolve, reject) => {
      const peerConfig = {
        host: server.host,
        port: server.port,
        path: server.path,
        secure: server.secure,
        key: server.key,
        ...(this.peerOptions && typeof this.peerOptions === 'object' ? this.peerOptions : {})
      };

      if (Array.isArray(this.iceServers) && this.iceServers.length > 0) {
        peerConfig.config = {
          ...(peerConfig.config && typeof peerConfig.config === 'object' ? peerConfig.config : {}),
          iceServers: this.iceServers
        };
      }

      const peer = new this.PeerImpl(nodeId, peerConfig);
      let opened = false;

      const timeout = setTimeout(() => {
        peer.destroy?.();
        reject(new Error(`Unable to connect PeerJS network adapter to ${url}`));
      }, this.connectTimeoutMs);

      const onStartupError = (error) => {
        if (opened) {
          return;
        }
        clearTimeout(timeout);
        peer.destroy?.();
        reject(error || new Error(`Unable to connect PeerJS network adapter to ${url}`));
      };

      const onRuntimeError = () => {
        // A dead dial or a dropped socket must not destroy the Peer.
        // WebRTC links stay up, and disconnect schedules a signaling reconnect.
      };

      peer.on('open', () => {
        if (opened) {
          return;
        }
        opened = true;
        clearTimeout(timeout);
        if (typeof peer.off === 'function') {
          peer.off('error', onStartupError);
        }
        peer.on('error', onRuntimeError);
        this.peer = peer;
        resolve();
      });

      peer.on('connection', (connection) => {
        this.attachConnectionHandlers(connection);
      });

      peer.on('error', onStartupError);
      peer.on('disconnected', () => {
        if (!opened || this._stopped || this.peer !== peer) {
          return;
        }
        this._scheduleReconnect();
      });
    });
  }

  _clearReconnectTimer() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  _destroyPeer() {
    const peer = this.peer;
    this.peer = null;
    if (peer && typeof peer.destroy === 'function') {
      peer.destroy();
    }
  }

  _scheduleReconnect() {
    if (this._stopped || this._reconnectTimer || this._reconnectInflight) {
      return;
    }
    const session = this._session;
    const delay = Math.min(
      this.reconnectMaxDelayMs,
      this.reconnectBaseDelayMs * (2 ** this._reconnectAttempt)
    );
    this._reconnectAttempt += 1;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this._stopped || this._session !== session) {
        return;
      }
      this._reconnectSignaling(session).catch(() => undefined);
    }, delay);
  }

  async _reconnectSignaling(session) {
    if (this._stopped || this._session !== session || this._reconnectInflight) {
      return;
    }
    this._reconnectInflight = true;
    try {
      const peer = this.peer;
      if (peer && !peer.destroyed && peer.disconnected && typeof peer.reconnect === 'function') {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            cleanup();
            reject(new Error('PeerJS reconnect timeout'));
          }, Math.min(this.connectTimeoutMs, 8000));
          const onOpen = () => {
            cleanup();
            resolve();
          };
          function cleanup() {
            clearTimeout(timer);
            if (typeof peer.off === 'function') {
              peer.off('open', onOpen);
            }
          }
          peer.on('open', onOpen);
          try {
            peer.reconnect();
          } catch (error) {
            cleanup();
            reject(error);
          }
        });
        if (!this._stopped && this._session === session) {
          this._reconnectAttempt = 0;
        }
        return;
      }
      if (!this._stopped && this._session === session && this.nodeId) {
        this._reconnectInflight = false;
        await this.start(this.nodeId);
      }
    } catch (error) {
      if (!this._stopped && !this.peer) {
        this._scheduleReconnect();
      }
    } finally {
      this._reconnectInflight = false;
    }
  }

  attachConnectionHandlers(connection) {
    const remoteId = connection.peer;
    if (!remoteId) {
      return;
    }

    this.connections.set(remoteId, connection);

    connection.on('data', (payload) => {
      const deliveries = [];
      for (const handler of this.messageHandlers) {
        deliveries.push(handler(payload));
      }
      return Promise.all(deliveries);
    });

    connection.on('close', () => {
      this.connections.delete(remoteId);
    });
  }

  async connectToPeer(remotePeerId) {
    if (!remotePeerId || remotePeerId === this.nodeId) {
      return null;
    }

    const existing = this.connections.get(remotePeerId);
    if (existing && existing.open) {
      return existing;
    }

    if (this.pendingConnections.has(remotePeerId)) {
      return this.pendingConnections.get(remotePeerId);
    }

    if (!this.peer) {
      throw new Error('PeerJS network adapter has not been started');
    }

    const pending = new Promise((resolve, reject) => {
      const connection = this.peer.connect(remotePeerId, {
        reliable: true,
        serialization: 'json'
      });

      if (!connection || typeof connection.on !== 'function') {
        reject(new Error(`PeerJS connect() returned no DataConnection for ${remotePeerId}`));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Unable to connect to peer ${remotePeerId}`));
      }, this.connectTimeoutMs);

      connection.on('open', () => {
        clearTimeout(timeout);
        this.attachConnectionHandlers(connection);
        resolve(connection);
      });

      connection.on('error', () => {
        clearTimeout(timeout);
        reject(new Error(`Unable to connect to peer ${remotePeerId}`));
      });
    }).finally(() => {
      this.pendingConnections.delete(remotePeerId);
    });

    this.pendingConnections.set(remotePeerId, pending);
    return pending;
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
  }

  offMessage(handler) {
    this.messageHandlers.delete(handler);
  }

  async broadcast(message) {
    if (!this.peer) {
      throw new Error('PeerJS network adapter has not been started');
    }

    const deliveries = [];
    for (const connection of this.connections.values()) {
      if (connection.open) {
        deliveries.push(connection.send(message));
      }
    }

    await Promise.all(deliveries);
  }

  async sendToPeers(message, peerIds = []) {
    if (!this.peer) {
      throw new Error('PeerJS network adapter has not been started');
    }

    const targets = new Set((peerIds || []).filter(Boolean));
    if (targets.size === 0) {
      return;
    }

    const deliveries = [];
    for (const [peerId, connection] of this.connections.entries()) {
      if (targets.has(peerId) && connection.open) {
        deliveries.push(connection.send(message));
      }
    }

    await Promise.all(deliveries);
  }

  async disconnectPeer(remotePeerId) {
    const connection = this.connections.get(remotePeerId);
    if (connection && typeof connection.close === 'function') {
      connection.close();
    }
    this.connections.delete(remotePeerId);
  }

  getOpenConnectionCount() {
    return this.listOpenPeerIds().length;
  }

  listOpenPeerIds() {
    const ids = [];
    for (const [peerId, connection] of this.connections.entries()) {
      if (connection.open) {
        ids.push(peerId);
      }
    }
    return ids;
  }

  isConnectedTo(remotePeerId) {
    const connection = this.connections.get(remotePeerId);
    return Boolean(connection && connection.open);
  }

  async stop() {
    this._stopped = true;
    this._session += 1;
    this._clearReconnectTimer();
    for (const connection of this.connections.values()) {
      if (typeof connection.close === 'function') {
        connection.close();
      }
    }

    this.connections.clear();
    this.pendingConnections.clear();

    this._destroyPeer();
    this.nodeId = null;
  }
}

function createPeerJSNetworkAdapter(options = {}) {
  return new PeerJSNetworkAdapter(options);
}

module.exports = {
  PeerJSNetworkAdapter,
  createPeerJSNetworkAdapter,
  parsePeerJsServerUrl
};
