const {
  NODE_WEBRTC_PEER_LIBRARY_MISSING,
  NodeWebRTCPeerLibraryMissingError,
  createNodeWebRTCPeerFactory,
  createFakeNodeWebRTCBackend
} = require('../../src/streaming/node-webrtc-peer');
const { createWebRTCDataChannelTransport: createTransport } = require('../../src/streaming/webrtc-stream-signaling');
const { createSignedMediaChunk } = require('../../src/streaming/media-chunk');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

// Re-export is only on node bundle; tests use source modules directly.
const { createNodeWebRTCPeerFactory: createFromStreaming } = require('../../src/streaming/node-webrtc-peer');

function signingKeys(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

describe('node WebRTC peer factory', () => {
  test('missing optional library throws typed error', async () => {
    await expect(
      createNodeWebRTCPeerFactory({
        backend: 'node-datachannel',
        loadModule: async () => {
          throw new Error('Cannot find package');
        }
      })
    ).rejects.toMatchObject({
      code: NODE_WEBRTC_PEER_LIBRARY_MISSING,
      name: 'NodeWebRTCPeerLibraryMissingError'
    });
    await expect(
      createNodeWebRTCPeerFactory({
        backend: 'auto',
        loadModule: async (id) => {
          throw new Error(`missing ${id}`);
        }
      })
    ).rejects.toMatchObject({
      code: NODE_WEBRTC_PEER_LIBRARY_MISSING
    });
  });

  test('fake backend WHIP peerFactory returns answer SDP', async () => {
    const fake = createFakeNodeWebRTCBackend();
    const factory = await createNodeWebRTCPeerFactory({ testBackend: fake });
    const peerFactory = factory.createWhipPeerFactory();
    const peer = await peerFactory('v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n', { resourceId: 'r1' });
    expect(peer.answerSdp).toContain('fake-answer-sdp');
    expect(typeof peer.onFrame).toBe('function');
    expect(typeof peer.close).toBe('function');
    await factory.close();
  });

  test('signed chunk round trip over fake native data channel', async () => {
    const fake = createFakeNodeWebRTCBackend();
    const factory = await createFromStreaming({ testBackend: fake });
    const adapterOrigin = await factory.createNetworkAdapter('origin');
    const adapterViewer = await factory.createNetworkAdapter('viewer-1');
    await adapterOrigin.connectToPeer('viewer-1');

    const transportOrigin = createTransport(adapterOrigin);
    const transportViewer = createTransport(adapterViewer);
    const keys = signingKeys('webrtc-fake-dc');
    const received = [];
    transportViewer.onChunk((senderId, chunk) => {
      received.push({ senderId, chunk });
    });

    const chunk = createSignedMediaChunk({
      sessionId: 'sess-dc',
      broadcasterId: 'origin',
      payloadBytes: new Uint8Array([1, 2, 3, 4]),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      sequence: 0,
      timestampMs: 10,
      keyframe: true
    });

    await transportOrigin.sendChunk(['viewer-1'], chunk);
    await new Promise((r) => setTimeout(r, 5));

    expect(received).toHaveLength(1);
    expect(received[0].senderId).toBe('origin');
    expect(received[0].chunk.sequence).toBe(0);

    transportOrigin.destroy();
    transportViewer.destroy();
    await factory.close();
  });
});

describe('node bundle export surface', () => {
  test('dignity.js/node exports createNodeWebRTCPeerFactory', () => {
    const nodeApi = require('../../src/node');
    expect(nodeApi.createNodeWebRTCPeerFactory).toBeDefined();
    expect(nodeApi.NODE_WEBRTC_PEER_LIBRARY_MISSING).toBe(NODE_WEBRTC_PEER_LIBRARY_MISSING);
  });
});