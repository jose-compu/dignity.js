/**
 * Native Node WebRTC peer integration (optional node-datachannel or werift).
 * Run: RUN_NODE_WEBRTC_TESTS=1 npm test -- tests/integration/node-webrtc-peer-native.test.js
 */

const {
  createNodeWebRTCPeerFactory,
  NODE_WEBRTC_PEER_LIBRARY_MISSING
} = require('../../src/streaming/node-webrtc-peer');
const { createWebRTCDataChannelTransport } = require('../../src/streaming/webrtc-stream-signaling');
const { createSignedMediaChunk, verifyMediaChunk } = require('../../src/streaming/media-chunk');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

const RUN = process.env.RUN_NODE_WEBRTC_TESTS === '1';

function signingKeys(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

(RUN ? describe : describe.skip)('native Node WebRTC peer integration', () => {
  let factory;
  let skippedReason;

  beforeAll(async () => {
    try {
      factory = await createNodeWebRTCPeerFactory({ backend: 'auto' });
    } catch (err) {
      if (err && err.code === NODE_WEBRTC_PEER_LIBRARY_MISSING) {
        skippedReason = err.message;
        return;
      }
      throw err;
    }
  });

  afterAll(async () => {
    if (factory) {
      await factory.close();
    }
  });

  test('two peers exchange a signed media chunk', async () => {
    if (skippedReason) {
      // eslint-disable-next-line no-console
      console.warn(`Skipping native assertion: ${skippedReason}`);
      return;
    }
    expect(factory.backend.name).toMatch(/node-datachannel|werift/);

    const adapterA = await factory.createNetworkAdapter('origin-native');
    const adapterB = await factory.createNetworkAdapter('viewer-native');
    await adapterA.connectToPeer('viewer-native');

    const transportA = createWebRTCDataChannelTransport(adapterA);
    const transportB = createWebRTCDataChannelTransport(adapterB);
    const keys = signingKeys('native-dc-int');
    const received = [];
    transportB.onChunk((senderId, chunk) => {
      received.push({ senderId, chunk });
    });

    const chunk = createSignedMediaChunk({
      sessionId: 'native-sess',
      broadcasterId: 'origin-native',
      payloadBytes: new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      sequence: 7,
      timestampMs: 42,
      keyframe: true
    });

    await transportA.sendChunk(['viewer-native'], chunk);
    await new Promise((r) => setTimeout(r, 250));

    expect(received.length).toBeGreaterThanOrEqual(1);
    expect(received[0].senderId).toBe('origin-native');
    expect(verifyMediaChunk(received[0].chunk, 'native-sess')).toBe(true);

    transportA.destroy();
    transportB.destroy();
    await adapterA.stop();
    await adapterB.stop();
  }, 30000);
});