const { DEFAULT_CLOUDFLARE_SIGNALING_URLS } = require('../signaling/default-signaling-config');
const parsePeerJsServerUrl = require('../signaling/parse-peerjs-url');

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
    connectTimeoutMs = 12000
  } = {}) {
    this.urls = urls || (url ? [url] : [...DEFAULT_CLOUDFLARE_SIGNALING_URLS]);
    this.url = this.urls[0];
    this.PeerImpl = resolvePeerImplementation(PeerImpl);
    this.connectTimeoutMs = connectTimeoutMs;
    this.nodeId = null;
    this.peer = null;
    this.connections = new Map();
    this.pendingConnections = new Map();
    this.messageHandlers = new Set();
  }

  async start(nodeId) {
    if (!nodeId) {
      throw new Error('PeerJSNetworkAdapter requires nodeId on start');
    }

    if (!this.PeerImpl) {
      throw new Error('PeerJS implementation is not available');
    }

    if (this.peer) {
      await this.stop();
    }

    let lastError;
    for (const candidateUrl of this.urls) {
      try {
        await this.startWithUrl(nodeId, candidateUrl);
        this.url = candidateUrl;
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to connect PeerJS network adapter');
  }

  async startWithUrl(nodeId, url) {
    this.nodeId = nodeId;
    const server = parsePeerJsServerUrl(url);

    await new Promise((resolve, reject) => {
      const peer = new this.PeerImpl(nodeId, {
        host: server.host,
        port: server.port,
        path: server.path,
        secure: server.secure,
        key: server.key
      });

      const timeout = setTimeout(() => {
        peer.destroy?.();
        reject(new Error(`Unable to connect PeerJS network adapter to ${url}`));
      }, this.connectTimeoutMs);

      peer.on('open', () => {
        clearTimeout(timeout);
        this.peer = peer;
        resolve();
      });

      peer.on('connection', (connection) => {
        this.attachConnectionHandlers(connection);
      });

      peer.on('error', (error) => {
        clearTimeout(timeout);
        peer.destroy?.();
        reject(error || new Error(`Unable to connect PeerJS network adapter to ${url}`));
      });
    });
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
    for (const connection of this.connections.values()) {
      if (typeof connection.close === 'function') {
        connection.close();
      }
    }

    this.connections.clear();
    this.pendingConnections.clear();

    if (this.peer && typeof this.peer.destroy === 'function') {
      this.peer.destroy();
    }

    this.peer = null;
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
