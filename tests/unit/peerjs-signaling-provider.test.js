const PeerJSSignalingProvider = require('../../src/signaling/peerjs-signaling-provider');

class MockDataConnection {
  constructor(peerId) {
    this.peer = peerId;
    this.open = false;
    this.handlers = {};
    this.remote = null;
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  send(payload) {
    if (this.remote && this.remote.handlers.data) {
      this.remote.handlers.data(payload);
    }
  }

  close() {
    this.open = false;
    if (this.handlers.close) {
      this.handlers.close();
    }
    if (this.remote) {
      this.remote.open = false;
      if (this.remote.handlers.close) {
        this.remote.handlers.close();
      }
    }
  }
}

class MockPeer {
  static peers = new Map();

  constructor(id) {
    this.id = id;
    this.handlers = {};
    MockPeer.peers.set(id, this);
    setTimeout(() => {
      if (this.handlers.open) {
        this.handlers.open(id);
      }
    }, 0);
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  connect(remoteId) {
    const remotePeer = MockPeer.peers.get(remoteId);
    if (!remotePeer) {
      const missing = new MockDataConnection(remoteId);
      setTimeout(() => {
        if (missing.handlers.error) {
          missing.handlers.error(new Error('peer unavailable'));
        }
      }, 0);
      return missing;
    }

    const localConn = new MockDataConnection(remoteId);
    const remoteConn = new MockDataConnection(this.id);
    localConn.remote = remoteConn;
    remoteConn.remote = localConn;

    setTimeout(() => {
      localConn.open = true;
      remoteConn.open = true;
      if (remotePeer.handlers.connection) {
        remotePeer.handlers.connection(remoteConn);
      }
      if (localConn.handlers.open) {
        localConn.handlers.open();
      }
      if (remoteConn.handlers.open) {
        remoteConn.handlers.open();
      }
    }, 0);

    return localConn;
  }

  destroy() {
    MockPeer.peers.delete(this.id);
  }
}

describe('PeerJSSignalingProvider', () => {
  beforeEach(() => {
    MockPeer.peers = new Map();
  });

  test('connects and exchanges messages through PeerJS connections', async () => {
    const alice = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });
    const bob = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    const bobHandler = jest.fn();
    bob.onMessage(bobHandler);

    await alice.connect();
    await bob.connect();

    await alice.send({
      type: 'offer',
      to: bob.peerId,
      from: alice.peerId,
      sdp: 'fake'
    });

    expect(bobHandler).toHaveBeenCalledWith({
      type: 'offer',
      to: bob.peerId,
      from: alice.peerId,
      sdp: 'fake'
    });
  });

  test('fails when sending to unavailable peer id', async () => {
    const alice = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    await alice.connect();

    await expect(
      alice.send({
        type: 'offer',
        to: 'missing-peer',
        from: alice.peerId
      })
    ).rejects.toThrow('Unable to connect peer missing-peer via wss://peerjs.92k.de/peerjs?key=peerjs');
  });
});
