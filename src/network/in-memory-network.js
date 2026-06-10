class InMemoryNetworkHub {
  constructor() {
    this.adapters = new Map();
  }

  register(adapter) {
    this.adapters.set(adapter.nodeId, adapter);
  }

  unregister(nodeId) {
    this.adapters.delete(nodeId);
  }

  async broadcast(senderId, message) {
    const deliveries = [];
    for (const [nodeId, adapter] of this.adapters.entries()) {
      if (nodeId !== senderId) {
        deliveries.push(adapter.receive(message));
      }
    }
    await Promise.all(deliveries);
  }

  async sendToPeers(senderId, message, peerIds = []) {
    const targets = new Set((peerIds || []).filter((peerId) => peerId && peerId !== senderId));
    const deliveries = [];

    for (const [nodeId, adapter] of this.adapters.entries()) {
      if (nodeId !== senderId && targets.has(nodeId)) {
        deliveries.push(adapter.receive(message));
      }
    }

    await Promise.all(deliveries);
  }
}

class InMemoryNetworkAdapter {
  constructor(hub) {
    if (!hub) {
      throw new Error('InMemoryNetworkAdapter requires an InMemoryNetworkHub');
    }

    this.hub = hub;
    this.nodeId = null;
    this.messageHandlers = new Set();
    this.connectedPeers = new Set();
  }

  async start(nodeId) {
    this.nodeId = nodeId;
    this.hub.register(this);
  }

  async stop() {
    if (this.nodeId) {
      this.hub.unregister(this.nodeId);
    }

    this.nodeId = null;
    this.connectedPeers.clear();
  }

  async connectToPeer(remotePeerId) {
    if (!remotePeerId || remotePeerId === this.nodeId) {
      return;
    }
    this.connectedPeers.add(remotePeerId);
  }

  async broadcast(message) {
    if (!this.nodeId) {
      throw new Error('Network adapter has not been started');
    }

    await this.hub.broadcast(this.nodeId, message);
  }

  async sendToPeers(message, peerIds = []) {
    if (!this.nodeId) {
      throw new Error('Network adapter has not been started');
    }

    await this.hub.sendToPeers(this.nodeId, message, peerIds);
  }

  listOpenPeerIds() {
    return [...this.connectedPeers];
  }

  getOpenConnectionCount() {
    return this.connectedPeers.size;
  }

  isConnectedTo(remotePeerId) {
    return this.connectedPeers.has(remotePeerId);
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
  }

  offMessage(handler) {
    this.messageHandlers.delete(handler);
  }

  async receive(message) {
    const deliveries = [];
    for (const handler of this.messageHandlers) {
      deliveries.push(handler(message));
    }
    await Promise.all(deliveries);
  }
}

module.exports = {
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
};
