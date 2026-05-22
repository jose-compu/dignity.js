const { PeerJSNetworkAdapter } = require('../../src');

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
    const localConn = new MockDataConnection(remoteId);
    if (!remotePeer) {
      setTimeout(() => {
        if (localConn.handlers.error) {
          localConn.handlers.error(new Error('peer unavailable'));
        }
      }, 0);
      return localConn;
    }

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
    }, 0);

    return localConn;
  }

  destroy() {
    MockPeer.peers.delete(this.id);
  }
}

describe('PeerJSNetworkAdapter', () => {
  beforeEach(() => {
    MockPeer.peers = new Map();
  });

  test('connects peers and delivers broadcast messages', async () => {
    const alice = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });
    const bob = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });

    const bobMessages = [];
    bob.onMessage((message) => bobMessages.push(message));

    await alice.start('alice');
    await bob.start('bob');
    await alice.connectToPeer('bob');

    await new Promise((resolve) => setTimeout(resolve, 10));
    await alice.broadcast({ hello: 'world' });

    expect(bobMessages).toEqual([{ hello: 'world' }]);
    await alice.stop();
    await bob.stop();
  });
});
