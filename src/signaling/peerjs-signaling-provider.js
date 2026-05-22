const WebSocketSignalingProvider = require('./websocket-signaling-provider');
const parsePeerJsServerUrl = require('./parse-peerjs-url');

class PeerJSSignalingProvider {
  constructor({ id, url, PeerImpl, WebSocketImpl, priority = 0, connectTimeoutMs = 10000 }) {
    if (!url) {
      throw new Error('PeerJS signaling provider requires a url');
    }

    this.id = id || url;
    this.url = url;
    this.priority = priority;
    this.isCustomPeerImpl = Boolean(PeerImpl);
    this.PeerImpl = PeerImpl || this.resolvePeerImplementation();
    this.WebSocketImpl = WebSocketImpl;
    this.connectTimeoutMs = connectTimeoutMs;
    this.peer = null;
    this.peerId = null;
    this.connections = new Map();
    this.messageHandlers = new Set();
    this.fallbackProvider = null;
  }

  resolvePeerImplementation() {
    try {
      const peerjs = require('peerjs');
      return peerjs.Peer || peerjs;
    } catch (error) {
      return null;
    }
  }

  parsePeerJsServerUrl() {
    return parsePeerJsServerUrl(this.url);
  }

  shouldUseWebSocketFallback() {
    return !this.isCustomPeerImpl && typeof globalThis.RTCPeerConnection !== 'function';
  }

  useWebSocketFallback() {
    if (!this.fallbackProvider) {
      this.fallbackProvider = new WebSocketSignalingProvider({
        id: `${this.id}-ws-fallback`,
        url: this.url,
        WebSocketImpl: this.WebSocketImpl,
        priority: this.priority
      });
    }
    return this.fallbackProvider;
  }

  async connect() {
    if (this.shouldUseWebSocketFallback()) {
      await this.useWebSocketFallback().connect();
      return;
    }

    if (!this.PeerImpl) {
      throw new Error('PeerJS implementation is not available');
    }

    const server = this.parsePeerJsServerUrl();
    const peerId = `dignityjs_${Math.random().toString(36).slice(2, 12)}`;

    await new Promise((resolve, reject) => {
      const peer = new this.PeerImpl(peerId, {
        host: server.host,
        port: server.port,
        path: server.path,
        secure: server.secure,
        key: server.key
      });

      const timeout = setTimeout(() => {
        reject(new Error(`Unable to connect to signaling url ${this.url}`));
      }, this.connectTimeoutMs);

      peer.on('open', () => {
        clearTimeout(timeout);
        this.peer = peer;
        this.peerId = peerId;
        resolve();
      });

      peer.on('connection', (connection) => {
        this.attachConnectionHandlers(connection);
      });

      peer.on('error', async (error) => {
        clearTimeout(timeout);
        if (error && error.type === 'browser-incompatible') {
          try {
            await this.useWebSocketFallback().connect();
            resolve();
            return;
          } catch (fallbackError) {
            reject(new Error(`Unable to connect to signaling url ${this.url}`));
            return;
          }
        }
        reject(new Error(`Unable to connect to signaling url ${this.url}`));
      });
    });
  }

  attachConnectionHandlers(connection) {
    const remoteId = connection.peer;
    this.connections.set(remoteId, connection);

    connection.on('data', (payload) => {
      for (const handler of this.messageHandlers) {
        handler(payload);
      }
    });

    connection.on('close', () => {
      this.connections.delete(remoteId);
    });
  }

  async openConnection(remotePeerId) {
    if (!this.peer) {
      throw new Error('PeerJS is not connected');
    }

    const existing = this.connections.get(remotePeerId);
    if (existing && existing.open) {
      return existing;
    }

    return await new Promise((resolve, reject) => {
      const connection = this.peer.connect(remotePeerId, { reliable: true, serialization: 'json' });
      const timeout = setTimeout(() => {
        reject(new Error(`Unable to connect peer ${remotePeerId} via ${this.url}`));
      }, this.connectTimeoutMs);

      connection.on('open', () => {
        clearTimeout(timeout);
        this.attachConnectionHandlers(connection);
        resolve(connection);
      });

      connection.on('error', () => {
        clearTimeout(timeout);
        reject(new Error(`Unable to connect peer ${remotePeerId} via ${this.url}`));
      });
    });
  }

  onMessage(handler) {
    if (this.fallbackProvider) {
      this.fallbackProvider.onMessage(handler);
      return;
    }
    this.messageHandlers.add(handler);
  }

  async send(message) {
    if (this.fallbackProvider) {
      await this.fallbackProvider.send(message);
      return;
    }

    if (!this.peer) {
      throw new Error(`Signaling socket is not open for ${this.url}`);
    }

    if (message && message.to) {
      const connection = await this.openConnection(message.to);
      connection.send(message);
      return;
    }

    for (const connection of this.connections.values()) {
      if (connection.open) {
        connection.send(message);
      }
    }
  }

  async disconnect() {
    if (this.fallbackProvider) {
      await this.fallbackProvider.disconnect();
      this.fallbackProvider = null;
      return;
    }

    for (const connection of this.connections.values()) {
      if (typeof connection.close === 'function') {
        connection.close();
      }
    }
    this.connections.clear();

    if (this.peer && typeof this.peer.destroy === 'function') {
      this.peer.destroy();
    }
    this.peer = null;
    this.peerId = null;
  }
}

module.exports = PeerJSSignalingProvider;
