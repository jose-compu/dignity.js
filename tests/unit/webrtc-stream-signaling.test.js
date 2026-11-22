const {
  createWebRTCStreamSignalingBus,
  createWebRTCDataChannelTransport
} = require('../../src/streaming/webrtc-stream-signaling');
const { InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src/network/in-memory-network');

describe('WebRTC stream signaling', () => {
  test('signaling bus routes stream messages', async () => {
    const hub = new InMemoryNetworkHub();
    const adapter1 = new InMemoryNetworkAdapter(hub);
    const adapter2 = new InMemoryNetworkAdapter(hub);

    await adapter1.start('peer1');
    await adapter2.start('peer2');

    const bus1 = createWebRTCStreamSignalingBus(adapter1, 'peer1');
    const bus2 = createWebRTCStreamSignalingBus(adapter2, 'peer2');

    const received = [];
    bus2.subscribe('peer2', (msg) => {
      received.push(msg);
    });

    await bus1.send('peer1', 'peer2', { type: 'test', data: 'hello' });

    await new Promise((r) => setTimeout(r, 50));

    expect(received).toHaveLength(1);
    expect(received[0].fromPeerId).toBe('peer1');
    expect(received[0].toPeerId).toBe('peer2');
    expect(received[0].type).toBe('test');
    expect(received[0].data).toBe('hello');

    bus1.destroy();
    bus2.destroy();
  });

  test('signaling bus fanout to multiple peers', async () => {
    const hub = new InMemoryNetworkHub();
    const adapters = [
      new InMemoryNetworkAdapter(hub),
      new InMemoryNetworkAdapter(hub),
      new InMemoryNetworkAdapter(hub)
    ];

    await adapters[0].start('broadcaster');
    await adapters[1].start('viewer1');
    await adapters[2].start('viewer2');

    const busBroadcaster = createWebRTCStreamSignalingBus(adapters[0], 'broadcaster');
    const busViewer1 = createWebRTCStreamSignalingBus(adapters[1], 'viewer1');
    const busViewer2 = createWebRTCStreamSignalingBus(adapters[2], 'viewer2');

    const received1 = [];
    const received2 = [];

    busViewer1.subscribe('viewer1', (msg) => received1.push(msg));
    busViewer2.subscribe('viewer2', (msg) => received2.push(msg));

    await busBroadcaster.fanout('broadcaster', ['viewer1', 'viewer2'], {
      type: 'announce',
      sessionId: 'test-session'
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(received1).toHaveLength(1);
    expect(received2).toHaveLength(1);
    expect(received1[0].type).toBe('announce');
    expect(received2[0].type).toBe('announce');

    busBroadcaster.destroy();
    busViewer1.destroy();
    busViewer2.destroy();
  });

  test('data channel transport sends chunks', async () => {
    const hub = new InMemoryNetworkHub();
    const adapter1 = new InMemoryNetworkAdapter(hub);
    const adapter2 = new InMemoryNetworkAdapter(hub);

    await adapter1.start('broadcaster');
    await adapter2.start('viewer');

    const transport1 = createWebRTCDataChannelTransport(adapter1);
    const transport2 = createWebRTCDataChannelTransport(adapter2);

    const receivedChunks = [];
    transport2.onChunk((senderId, chunk) => {
      receivedChunks.push({ senderId, chunk });
    });

    const mockChunk = {
      version: 1,
      sessionId: 'test-session',
      broadcasterId: 'broadcaster',
      sequence: 1,
      timestampMs: Date.now(),
      payloadHash: 'abc123',
      signature: 'sig456',
      signingPublicKey: 'pubkey789'
    };

    await transport1.sendChunk(['viewer'], mockChunk);

    await new Promise((r) => setTimeout(r, 50));

    expect(receivedChunks).toHaveLength(1);
    expect(receivedChunks[0].senderId).toBe('broadcaster');
    expect(receivedChunks[0].chunk.sessionId).toBe('test-session');
    expect(receivedChunks[0].chunk.sequence).toBe(1);

    transport1.destroy();
    transport2.destroy();
  });

  test('transport filters non-chunk messages', async () => {
    const hub = new InMemoryNetworkHub();
    const adapter1 = new InMemoryNetworkAdapter(hub);
    const adapter2 = new InMemoryNetworkAdapter(hub);

    await adapter1.start('peer1');
    await adapter2.start('peer2');

    const transport2 = createWebRTCDataChannelTransport(adapter2);

    const receivedChunks = [];
    transport2.onChunk((senderId, chunk) => {
      receivedChunks.push({ senderId, chunk });
    });

    await adapter1.sendToPeers({ type: 'regular', data: 'not a chunk' }, ['peer2']);

    await new Promise((r) => setTimeout(r, 50));

    expect(receivedChunks).toHaveLength(0);

    transport2.destroy();
  });
});
