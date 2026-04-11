const WebSocketSignalingProvider = require('../../src/signaling/websocket-signaling-provider');

class MockWebSocket {
  static OPEN = 1;
  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.closed = false;

    MockWebSocket.instances.push(this);

    setTimeout(() => {
      if (url.includes('fail')) {
        if (this.onerror) {
          this.onerror(new Error('connection failed'));
        }
        return;
      }

      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }

  send(payload) {
    this.sent.push(payload);
  }

  close() {
    this.closed = true;
    this.readyState = 3;
  }
}

describe('WebSocketSignalingProvider', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
  });

  test('connects and sends messages', async () => {
    const provider = new WebSocketSignalingProvider({
      id: 'ws-a',
      url: 'wss://ok.example',
      WebSocketImpl: MockWebSocket
    });

    await provider.connect();
    await provider.send({ type: 'offer', from: 'alice' });

    const socket = MockWebSocket.instances[0];
    expect(socket.sent[0]).toBe(JSON.stringify({ type: 'offer', from: 'alice' }));
  });

  test('dispatches parsed and raw incoming messages', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://ok.example',
      WebSocketImpl: MockWebSocket
    });
    const handler = jest.fn();
    provider.onMessage(handler);

    await provider.connect();

    const socket = MockWebSocket.instances[0];
    socket.onmessage({ data: '{"kind":"signal"}' });
    socket.onmessage({ data: 'raw-data' });

    expect(handler).toHaveBeenNthCalledWith(1, { kind: 'signal' });
    expect(handler).toHaveBeenNthCalledWith(2, 'raw-data');
  });

  test('rejects connection failures', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://fail.example',
      WebSocketImpl: MockWebSocket
    });

    await expect(provider.connect()).rejects.toThrow('Unable to connect to signaling url wss://fail.example');
  });

  test('throws when socket is not open', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://ok.example',
      WebSocketImpl: MockWebSocket
    });

    await expect(provider.send({ type: 'x' })).rejects.toThrow('Signaling socket is not open');
  });

  test('disconnect closes active socket', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://ok.example',
      WebSocketImpl: MockWebSocket
    });

    await provider.connect();
    const socket = MockWebSocket.instances[0];

    await provider.disconnect();

    expect(socket.closed).toBe(true);
    expect(provider.socket).toBeNull();
  });

  test('builds peerjs connection urls with id and token', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://peerjs.92k.de/peerjs?key=peerjs',
      WebSocketImpl: MockWebSocket
    });

    await provider.connect();
    const socket = MockWebSocket.instances[0];

    expect(socket.url).toContain('wss://peerjs.92k.de/peerjs?key=peerjs');
    expect(socket.url).toMatch(/[?&]id=dignityjs_[a-z0-9]{10}/);
    expect(socket.url).toMatch(/[?&]token=[a-z0-9]{10}/);
  });

  test('throws for missing url', () => {
    expect(() => new WebSocketSignalingProvider({})).toThrow('WebSocket signaling provider requires a url');
  });

  test('throws when WebSocket implementation is unavailable', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://ok.example',
      WebSocketImpl: MockWebSocket
    });
    provider.WebSocketImpl = null;

    await expect(provider.connect()).rejects.toThrow('WebSocket implementation is not available');
  });

  test('disconnect is no-op when socket is null', async () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://ok.example',
      WebSocketImpl: MockWebSocket
    });

    await provider.disconnect();
    expect(provider.socket).toBeNull();
  });

  test('returns url unchanged for non-peerjs hosts', () => {
    const provider = new WebSocketSignalingProvider({
      url: 'wss://custom-server.example/signaling',
      WebSocketImpl: MockWebSocket
    });

    const built = provider.buildConnectionUrl();
    expect(built).toBe('wss://custom-server.example/signaling');
  });
});
