const { PeerJSNetworkAdapter, createPeerJSNetworkAdapter } = require('../../src');

class MockDataConnection {
  constructor(peerId) {
    this.peer = peerId;
    this.open = false;
    this.handlers = {};
    this.remote = null;
    this.sent = [];
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  send(payload) {
    this.sent.push(payload);
    if (this.remote && this.remote.handlers.data) {
      this.remote.handlers.data(payload);
    }
  }

  close() {
    this.open = false;
    if (this.handlers.close) {
      this.handlers.close();
    }
  }
}

class MockPeer {
  static peers = new Map();
  static lastPeerOptions = null;
  static failOpen = false;
  static openError = null;
  static openDelayMs = 0;

  constructor(id, options) {
    this.id = id;
    this.options = options;
    MockPeer.lastPeerOptions = options;
    this.handlers = {};
    MockPeer.peers.set(id, this);

    setTimeout(() => {
      if (MockPeer.failOpen) {
        if (this.handlers.error) {
          this.handlers.error(MockPeer.openError || new Error('open failed'));
        }
        return;
      }
      if (this.handlers.open) {
        this.handlers.open(id);
      }
    }, MockPeer.openDelayMs);
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
    MockPeer.lastPeerOptions = null;
    MockPeer.failOpen = false;
    MockPeer.openError = null;
    MockPeer.openDelayMs = 0;
  });

  test('createPeerJSNetworkAdapter factory', () => {
    const adapter = createPeerJSNetworkAdapter({ url: 'wss://x/peerjs' });
    expect(adapter).toBeInstanceOf(PeerJSNetworkAdapter);
  });

  test('passes iceServers and peerOptions to Peer constructor', async () => {
    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000,
      iceServers,
      peerOptions: { config: { iceTransportPolicy: 'relay' } }
    });

    await adapter.start('alice');
    expect(MockPeer.lastPeerOptions.config.iceServers).toEqual(iceServers);
    expect(MockPeer.lastPeerOptions.config.iceTransportPolicy).toBe('relay');
    await adapter.stop();
  });

  test('start requires nodeId and PeerImpl', async () => {
    const adapter = new PeerJSNetworkAdapter({ PeerImpl: MockPeer });
    await expect(adapter.start('')).rejects.toThrow('requires nodeId');
    adapter.PeerImpl = null;
    await expect(adapter.start('alice')).rejects.toThrow('not available');
  });

  test('fails over to second signaling url', async () => {
    let attempts = 0;
    class FailOncePeer extends MockPeer {
      constructor(id, options) {
        super(id, options);
        attempts += 1;
        if (attempts === 1) {
          MockPeer.failOpen = true;
        } else {
          MockPeer.failOpen = false;
        }
      }
    }

    const adapter = new PeerJSNetworkAdapter({
      urls: ['wss://bad.example/peerjs', 'wss://peerjs.92k.de/peerjs?key=peerjs'],
      PeerImpl: FailOncePeer,
      connectTimeoutMs: 500
    });

    await adapter.start('alice');
    expect(adapter.url).toContain('peerjs.92k.de');
    await adapter.stop();
  });

  test('connects peers and delivers broadcast and targeted messages', async () => {
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
    const handler = (message) => bobMessages.push(message);
    bob.onMessage(handler);

    await alice.start('alice');
    await bob.start('bob');
    await alice.connectToPeer('bob');

    await new Promise((resolve) => setTimeout(resolve, 15));
    await alice.broadcast({ hello: 'world' });
    await alice.sendToPeers({ ping: 1 }, ['bob']);

    expect(bobMessages).toEqual([{ hello: 'world' }, { ping: 1 }]);

    expect(await alice.connectToPeer('bob')).toBeTruthy();
    expect(await alice.connectToPeer(null)).toBeNull();
    expect(await alice.connectToPeer('alice')).toBeNull();
    expect(alice.isConnectedTo('bob')).toBe(true);
    expect(alice.listOpenPeerIds()).toContain('bob');
    expect(alice.getOpenConnectionCount()).toBeGreaterThan(0);

    bob.offMessage(handler);
    await alice.disconnectPeer('bob');
    expect(alice.isConnectedTo('bob')).toBe(false);

    await alice.stop();
    await bob.stop();
  });

  test('broadcast and sendToPeers require started peer', async () => {
    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });
    await expect(adapter.broadcast({})).rejects.toThrow('not been started');
    await expect(adapter.sendToPeers({}, ['x'])).rejects.toThrow('not been started');
  });

  test('sendToPeers no-ops on empty peer list', async () => {
    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });
    await adapter.start('solo');
    await adapter.sendToPeers({ x: 1 }, []);
    await adapter.sendToPeers({ x: 1 }, [null, '']);
    await adapter.stop();
  });

  test('connectToPeer before start throws', async () => {
    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });
    await expect(adapter.connectToPeer('bob')).rejects.toThrow('not been started');
  });

  test('restart stops existing peer before reconnecting', async () => {
    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });
    await adapter.start('alice');
    await adapter.start('alice');
    expect(adapter.nodeId).toBe('alice');
    await adapter.stop();
  });

  test('incoming connection without peer id is ignored', async () => {
    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer,
      connectTimeoutMs: 1000
    });
    await adapter.start('alice');
    adapter.attachConnectionHandlers({ peer: null });
    adapter.attachConnectionHandlers({
      peer: 'ghost',
      open: true,
      on(event, handler) {
        if (event === 'data') {
          this.handlers = { data: handler };
        }
        if (event === 'close') {
          this.handlers = { ...(this.handlers || {}), close: handler };
        }
      },
      handlers: {}
    });
    await adapter.stop();
  });

  test('connect timeout rejects', async () => {
    class NeverOpenPeer {
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
      connect() {
        return { on() {}, open: false };
      }
      destroy() {
        MockPeer.peers.delete(this.id);
      }
    }

    const adapter = new PeerJSNetworkAdapter({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: NeverOpenPeer,
      connectTimeoutMs: 30
    });
    await adapter.start('alice');
    await expect(adapter.connectToPeer('missing')).rejects.toThrow('Unable to connect');
    await adapter.stop();
  });
});
