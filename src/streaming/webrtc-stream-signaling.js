/**
 * WebRTC-based signaling transport for live streaming sessions.
 * Uses existing PeerJS connections as signaling channels.
 * @experimental
 */

const SIGNALING_MESSAGE_PREFIX = '__streaming_signaling__:';

class WebRTCStreamSignalingBus {
  /**
   * @param {import('../network/peerjs-network')|import('../network/in-memory-network').InMemoryNetworkAdapter} networkAdapter
   * @param {string} localPeerId
   */
  constructor(networkAdapter, localPeerId) {
    this.networkAdapter = networkAdapter;
    this.localPeerId = localPeerId;
    this._handlers = new Map();
    this._networkHandler = this._onNetworkMessage.bind(this);
    
    if (typeof networkAdapter.on === 'function') {
      networkAdapter.on('message', this._networkHandler);
    } else if (typeof networkAdapter.onMessage === 'function') {
      networkAdapter.onMessage(this._networkHandler);
    } else {
      throw new Error('Network adapter does not support message handlers');
    }
  }

  _onNetworkMessage(message) {
    if (typeof message !== 'object' || !message.__streaming_signaling__) {
      return;
    }
    const handlers = this._handlers.get(this.localPeerId) || [];
    for (const handler of handlers) {
      handler({
        fromPeerId: message.__sender__ || 'unknown',
        toPeerId: this.localPeerId,
        timestamp: Date.now(),
        ...message.payload
      });
    }
  }

  subscribe(peerId, handler) {
    if (!this._handlers.has(peerId)) {
      this._handlers.set(peerId, []);
    }
    this._handlers.get(peerId).push(handler);
  }

  async send(fromPeerId, toPeerId, message) {
    if (fromPeerId !== this.localPeerId) {
      throw new Error('Can only send from local peer ID');
    }
    const envelope = {
      __streaming_signaling__: true,
      __sender__: fromPeerId,
      payload: message
    };
    
    if (typeof this.networkAdapter.send === 'function') {
      await this.networkAdapter.send(toPeerId, envelope);
    } else if (typeof this.networkAdapter.sendToPeers === 'function') {
      await this.networkAdapter.sendToPeers(envelope, [toPeerId]);
    } else {
      throw new Error('Network adapter does not support send operations');
    }
  }

  async fanout(fromPeerId, peerIds, message) {
    const unique = [...new Set(peerIds)];
    for (const peerId of unique) {
      if (peerId !== fromPeerId) {
        await this.send(fromPeerId, peerId, message);
      }
    }
  }

  destroy() {
    if (typeof this.networkAdapter.off === 'function') {
      this.networkAdapter.off('message', this._networkHandler);
    } else if (typeof this.networkAdapter.offMessage === 'function') {
      this.networkAdapter.offMessage(this._networkHandler);
    }
    this._handlers.clear();
  }
}

class WebRTCDataChannelTransport {
  /**
   * @param {import('../network/peerjs-network')|import('../network/in-memory-network').InMemoryNetworkAdapter} networkAdapter
   */
  constructor(networkAdapter) {
    this.networkAdapter = networkAdapter;
    this._chunkHandlers = new Set();
    this._networkHandler = this._onNetworkMessage.bind(this);
    
    if (typeof networkAdapter.on === 'function') {
      networkAdapter.on('message', this._networkHandler);
    } else if (typeof networkAdapter.onMessage === 'function') {
      networkAdapter.onMessage(this._networkHandler);
    } else {
      throw new Error('Network adapter does not support message handlers');
    }
  }

  _onNetworkMessage(message) {
    if (typeof message !== 'object' || !message.__streaming_chunk__) {
      return;
    }
    for (const handler of this._chunkHandlers) {
      handler(message.__sender__ || 'unknown', message.chunk);
    }
  }

  onChunk(handler) {
    this._chunkHandlers.add(handler);
    return () => {
      this._chunkHandlers.delete(handler);
    };
  }

  async sendChunk(toPeerIds, chunk) {
    const unique = [...new Set(toPeerIds)];
    const envelope = {
      __streaming_chunk__: true,
      __sender__: this.networkAdapter.nodeId,
      chunk
    };
    
    if (typeof this.networkAdapter.send === 'function') {
      for (const peerId of unique) {
        await this.networkAdapter.send(peerId, envelope);
      }
    } else if (typeof this.networkAdapter.sendToPeers === 'function') {
      await this.networkAdapter.sendToPeers(envelope, unique);
    } else {
      throw new Error('Network adapter does not support send operations');
    }
  }

  destroy() {
    if (typeof this.networkAdapter.off === 'function') {
      this.networkAdapter.off('message', this._networkHandler);
    } else if (typeof this.networkAdapter.offMessage === 'function') {
      this.networkAdapter.offMessage(this._networkHandler);
    }
    this._chunkHandlers.clear();
  }
}

function createWebRTCStreamSignalingBus(networkAdapter, localPeerId) {
  return new WebRTCStreamSignalingBus(networkAdapter, localPeerId);
}

function createWebRTCDataChannelTransport(networkAdapter) {
  return new WebRTCDataChannelTransport(networkAdapter);
}

module.exports = {
  WebRTCStreamSignalingBus,
  WebRTCDataChannelTransport,
  createWebRTCStreamSignalingBus,
  createWebRTCDataChannelTransport
};
