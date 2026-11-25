const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createStreamSession,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  createPublicStreamViewer,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  createWebRTCDataChannelTransport
} = require('../../src/streaming');
const { InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src/network/in-memory-network');
const { createFileMediaIngest } = require('../../src/streaming/node-media-ingest');
const { createNodeStreamOrigin } = require('../../src/streaming/node-stream-origin');
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(__dirname, '../fixtures/stream-origin-chunks.bin');

function testKeyPair(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

describe('node stream origin', () => {
  test('origin publishes verified chunks to PublicStreamViewer', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-origin');
    const session = createStreamSession({
      sessionId: 'node-pub',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-1',
      sessionId: 'node-pub',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: 8 }),
      directViewerIds: ['viewer-1']
    });

    viewer.requestJoin();
    await origin.start();

    expect(viewer.chunks.length).toBeGreaterThan(0);
    for (const chunk of viewer.chunks) {
      expect(verifyMediaChunk(chunk, 'node-pub')).toBe(true);
    }
    const payload = Buffer.concat(viewer.chunks.map((c) => Buffer.from(decodeMediaChunkPayload(c))));
    expect(payload.equals(fs.readFileSync(fixturePath))).toBe(true);
  });

  test('origin forwards the same chunk over WebRTCDataChannelTransport', async () => {
    const hub = new InMemoryNetworkHub();
    const originAdapter = new InMemoryNetworkAdapter(hub);
    const viewerAdapter = new InMemoryNetworkAdapter(hub);
    await originAdapter.start('origin');
    await viewerAdapter.start('viewer-1');

    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-origin-dc');
    const session = createStreamSession({
      sessionId: 'node-dc',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const transportOrigin = createWebRTCDataChannelTransport(originAdapter);
    const transportViewer = createWebRTCDataChannelTransport(viewerAdapter);
    const received = [];
    transportViewer.onChunk((senderId, chunk) => {
      received.push({ senderId, chunk });
    });

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: fixturePath.length }),
      dataChannelTransport: transportOrigin,
      dataChannelPeerIds: ['viewer-1'],
      directViewerIds: []
    });

    const publishPromise = origin.start();
    await publishPromise;

    await new Promise((r) => setTimeout(r, 30));

    expect(received).toHaveLength(1);
    expect(received[0].senderId).toBe('origin');
    expect(verifyMediaChunk(received[0].chunk, 'node-dc')).toBe(true);
    transportOrigin.destroy();
    transportViewer.destroy();
  });

  test('non-public session throws', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-private');
    const session = createStreamSession({
      sessionId: 'node-priv',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      privateRecipients: ['bob']
    });

    expect(() =>
      createNodeStreamOrigin({
        session,
        signingSecretKey: keys.signingSecretKey,
        signingPublicKey: keys.signingPublicKey,
        bus,
        mediaIngest: createFileMediaIngest({ filePath: fixturePath })
      })
    ).toThrow(/public/);
  });

  test('stop kills ffmpeg child when present', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-stop');
    const session = createStreamSession({
      sessionId: 'node-stop',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const fakeChild = { kill: jest.fn(), killed: false, exitCode: null };
    const mediaIngest = {
      kind: 'ffmpeg',
      child: fakeChild,
      stop() {
        fakeChild.kill('SIGTERM');
      },
      async *frames() {
        yield { payloadBytes: new Uint8Array([1, 2, 3]) };
      }
    };

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest
    });

    origin.stop();
    expect(fakeChild.kill).toHaveBeenCalledWith('SIGTERM');
  });
});