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

class BrowserIncompatiblePeer {
  constructor() {
    this.handlers = {};
    setTimeout(() => {
      if (this.handlers.error) {
        this.handlers.error({ type: 'browser-incompatible' });
      }
    }, 0);
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }
}

class GenericErrorPeer {
  constructor() {
    this.handlers = {};
    setTimeout(() => {
      if (this.handlers.error) {
        this.handlers.error({ type: 'network' });
      }
    }, 0);
  }

  on(event, handler) {
    this.handlers[event] = handler;
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

  test('throws for missing url', () => {
    expect(() => new PeerJSSignalingProvider({})).toThrow('PeerJS signaling provider requires a url');
  });

  test('parses peerjs urls with sensible defaults', () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs'
    });

    expect(provider.parsePeerJsServerUrl()).toEqual({
      secure: true,
      host: 'peerjs.92k.de',
      port: 443,
      path: '/',
      key: 'peerjs'
    });
  });

  test('connect delegates to websocket fallback in non-webrtc runtime', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs'
    });
    const fallback = {
      connect: jest.fn(async () => undefined),
      onMessage: jest.fn(),
      send: jest.fn(async () => undefined),
      disconnect: jest.fn(async () => undefined)
    };
    provider.useWebSocketFallback = jest.fn(() => fallback);
    const originalRtcPeerConnection = globalThis.RTCPeerConnection;
    delete globalThis.RTCPeerConnection;

    try {
      await provider.connect();
      expect(fallback.connect).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.RTCPeerConnection = originalRtcPeerConnection;
    }
  });

  test('connect falls back when peerjs reports browser-incompatible', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: BrowserIncompatiblePeer
    });
    provider.isCustomPeerImpl = false;
    const fallback = {
      connect: jest.fn(async () => undefined),
      onMessage: jest.fn(),
      send: jest.fn(async () => undefined),
      disconnect: jest.fn(async () => undefined)
    };
    provider.useWebSocketFallback = jest.fn(() => fallback);

    await provider.connect();
    expect(fallback.connect).toHaveBeenCalledTimes(1);
  });

  test('connect rejects on generic peerjs connection errors', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: GenericErrorPeer
    });

    await expect(provider.connect()).rejects.toThrow(
      'Unable to connect to signaling url wss://peerjs.92k.de/peerjs?key=peerjs'
    );
  });

  test('throws if opening peer connection without active peer', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    await expect(provider.openConnection('peer-x')).rejects.toThrow('PeerJS is not connected');
  });

  test('send broadcasts to open connections when target is omitted', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });
    provider.peer = { destroy: jest.fn() };
    const openConnection = { open: true, send: jest.fn(), close: jest.fn() };
    const closedConnection = { open: false, send: jest.fn(), close: jest.fn() };
    provider.connections.set('open-peer', openConnection);
    provider.connections.set('closed-peer', closedConnection);

    await provider.send({ type: 'announce' });

    expect(openConnection.send).toHaveBeenCalledWith({ type: 'announce' });
    expect(closedConnection.send).not.toHaveBeenCalled();
  });

  test('onMessage/send/disconnect delegate to existing fallback provider', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs'
    });
    const fallback = {
      connect: jest.fn(async () => undefined),
      onMessage: jest.fn(),
      send: jest.fn(async () => undefined),
      disconnect: jest.fn(async () => undefined)
    };
    provider.fallbackProvider = fallback;
    const handler = jest.fn();

    provider.onMessage(handler);
    await provider.send({ type: 'x' });
    await provider.disconnect();

    expect(fallback.onMessage).toHaveBeenCalledWith(handler);
    expect(fallback.send).toHaveBeenCalledWith({ type: 'x' });
    expect(fallback.disconnect).toHaveBeenCalledTimes(1);
    expect(provider.fallbackProvider).toBeNull();
  });

  test('disconnect closes connections and destroys peer', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });
    const connection = { open: true, close: jest.fn() };
    provider.connections.set('p', connection);
    const peer = { destroy: jest.fn() };
    provider.peer = peer;
    provider.peerId = 'peer-id';

    await provider.disconnect();

    expect(connection.close).toHaveBeenCalledTimes(1);
    expect(peer.destroy).toHaveBeenCalledTimes(1);
    expect(provider.connections.size).toBe(0);
    expect(provider.peer).toBeNull();
    expect(provider.peerId).toBeNull();
  });

  test('send throws when peer is null and no fallback', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    await expect(provider.send({ type: 'x' })).rejects.toThrow('Signaling socket is not open');
  });

  test('openConnection returns cached open connection', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });
    provider.peer = { connect: jest.fn(), destroy: jest.fn() };

    const cached = { open: true, send: jest.fn() };
    provider.connections.set('remote-1', cached);

    const result = await provider.openConnection('remote-1');
    expect(result).toBe(cached);
    expect(provider.peer.connect).not.toHaveBeenCalled();
  });

  test('attachConnectionHandlers removes connection on close', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    const conn = new MockDataConnection('peer-a');
    provider.attachConnectionHandlers(conn);

    expect(provider.connections.has('peer-a')).toBe(true);

    conn.handlers.close();
    expect(provider.connections.has('peer-a')).toBe(false);
  });

  test('useWebSocketFallback creates fallback provider once', () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    const fb1 = provider.useWebSocketFallback();
    const fb2 = provider.useWebSocketFallback();

    expect(fb1).toBe(fb2);
    expect(fb1.url).toBe('wss://peerjs.92k.de/peerjs?key=peerjs');
  });

  test('connect rejects when PeerImpl is null and no fallback', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });
    provider.isCustomPeerImpl = true;
    provider.PeerImpl = null;

    await expect(provider.connect()).rejects.toThrow('PeerJS implementation is not available');
  });

  test('connect falls back then fallback also fails', async () => {
    class FailFallbackPeer {
      constructor() {
        this.handlers = {};
        setTimeout(() => {
          if (this.handlers.error) {
            this.handlers.error({ type: 'browser-incompatible' });
          }
        }, 0);
      }
      on(event, handler) { this.handlers[event] = handler; }
    }

    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: FailFallbackPeer
    });
    provider.isCustomPeerImpl = true;
    provider.useWebSocketFallback = jest.fn(() => ({
      connect: jest.fn(async () => { throw new Error('fallback fail'); })
    }));

    await expect(provider.connect()).rejects.toThrow('Unable to connect to signaling url');
  });

  test('parsePeerJsServerUrl handles ws:// and explicit port', () => {
    const provider = new PeerJSSignalingProvider({
      url: 'ws://localhost:9000/mypath?key=mykey',
      PeerImpl: MockPeer
    });

    const parsed = provider.parsePeerJsServerUrl();
    expect(parsed).toEqual({
      secure: false,
      host: 'localhost',
      port: 9000,
      path: '/mypath/',
      key: 'mykey'
    });
  });

  test('parsePeerJsServerUrl uses default port and key', () => {
    const provider = new PeerJSSignalingProvider({
      url: 'ws://example.com/',
      PeerImpl: MockPeer
    });

    const parsed = provider.parsePeerJsServerUrl();
    expect(parsed.port).toBe(80);
    expect(parsed.key).toBe('peerjs');
  });

  class NeverOpenPeer {
    constructor() {
      this.handlers = {};
    }

    on(event, handler) {
      this.handlers[event] = handler;
    }
  }

  class NeverOpenConnectionPeer {
    constructor(id) {
      this.id = id;
      this.handlers = {};
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

    destroy() {}
  }

  test('connect rejects when peer open times out', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: NeverOpenPeer,
      connectTimeoutMs: 20
    });

    await expect(provider.connect()).rejects.toThrow('Unable to connect to signaling url');
  });

  test('openConnection rejects when remote peer never opens', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: NeverOpenConnectionPeer,
      connectTimeoutMs: 20
    });

    await provider.connect();
    await expect(provider.openConnection('remote-peer')).rejects.toThrow(
      'Unable to connect peer remote-peer via wss://peerjs.92k.de/peerjs?key=peerjs'
    );
  });

  test('connect uses real websocket fallback for browser-incompatible peer', async () => {
    class MockWs {
      static OPEN = 1;

      constructor() {
        setTimeout(() => {
          this.readyState = MockWs.OPEN;
          if (this.onopen) {
            this.onopen();
          }
        }, 0);
      }

      send() {}
      close() {}
    }

    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: BrowserIncompatiblePeer,
      WebSocketImpl: MockWs,
      connectTimeoutMs: 1000
    });
    provider.isCustomPeerImpl = false;

    await provider.connect();
    expect(provider.fallbackProvider).not.toBeNull();
    expect(provider.fallbackProvider.socket).not.toBeNull();
  });

  test('disconnect is no-op when peer and fallback are null', async () => {
    const provider = new PeerJSSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      PeerImpl: MockPeer
    });

    await provider.disconnect();
    expect(provider.peer).toBeNull();
    expect(provider.connections.size).toBe(0);
  });
});
