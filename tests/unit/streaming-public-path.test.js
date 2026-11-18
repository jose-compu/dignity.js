const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createSignedMediaChunk,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  createInMemoryStreamSignalingBus,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  STREAM_ACCESS_MODES
} = require('../../src/streaming');
const { createStreamSession } = require('../../src/streaming/stream-session');

function testKeyPair(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

describe('streaming media chunks (experimental)', () => {
  test('createSignedMediaChunk and verify round-trip', () => {
    const keys = testKeyPair('alice-stream');
    const payload = naclUtil.decodeUTF8('fake-encoded-frame-bytes');

    const chunk = createSignedMediaChunk({
      sessionId: 'live-1',
      broadcasterId: 'alice',
      payloadBytes: payload,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      sequence: 3,
      mimeType: 'video/webm;codecs=vp9'
    });

    expect(verifyMediaChunk(chunk, 'live-1')).toBe(true);
    expect(decodeMediaChunkPayload(chunk)).toEqual(payload);
  });

  test('rejects tampered payload', () => {
    const keys = testKeyPair('bob-stream');
    const chunk = createSignedMediaChunk({
      sessionId: 'live-2',
      broadcasterId: 'bob',
      payloadBytes: naclUtil.decodeUTF8('aaaa'),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey
    });

    chunk.payloadBase64 = naclUtil.encodeBase64(naclUtil.decodeUTF8('bbbb'));
    expect(() => verifyMediaChunk(chunk)).toThrow(/fingerprint/);
  });
});

describe('public stream path (experimental)', () => {
  test('broadcaster viewer handshake and direct chunks', () => {
    const bus = createInMemoryStreamSignalingBus();
    const aliceKeys = testKeyPair('alice-origin');
    const broadcaster = createPublicStreamBroadcaster({
      sessionId: 'pub-session',
      broadcasterId: 'alice',
      signingSecretKey: aliceKeys.signingSecretKey,
      signingPublicKey: aliceKeys.signingPublicKey,
      bus,
      initialViewerIds: ['relay-1', 'viewer-1']
    });

    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-1',
      sessionId: 'pub-session',
      broadcasterId: 'alice',
      broadcasterSigningPublicKey: aliceKeys.signingPublicKey,
      bus
    });

    broadcaster.announce();
    viewer.requestJoin();
    expect(viewer.joined).toBe(true);

    broadcaster.publishChunk(naclUtil.decodeUTF8('chunk-one'));
    broadcaster.publishChunk(naclUtil.decodeUTF8('chunk-two'));

    expect(viewer.chunks).toHaveLength(2);
    expect(viewer.chunks[0].sequence).toBe(0);
    expect(viewer.chunks[1].sequence).toBe(1);
  });

  test('relay forwards verified chunks one hop', () => {
    const bus = createInMemoryStreamSignalingBus();
    const aliceKeys = testKeyPair('alice-relay-origin');

    const broadcaster = createPublicStreamBroadcaster({
      sessionId: 'relay-session',
      broadcasterId: 'alice',
      signingSecretKey: aliceKeys.signingSecretKey,
      signingPublicKey: aliceKeys.signingPublicKey,
      bus,
      initialViewerIds: ['relay-1']
    });

    createPublicStreamRelay({
      relayId: 'relay-1',
      upstreamId: 'alice',
      sessionId: 'relay-session',
      broadcasterSigningPublicKey: aliceKeys.signingPublicKey,
      broadcasterId: 'alice',
      bus,
      downstreamViewerIds: ['viewer-2']
    });

    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-2',
      sessionId: 'relay-session',
      broadcasterId: 'alice',
      broadcasterSigningPublicKey: aliceKeys.signingPublicKey,
      bus
    });

    broadcaster.announce();
    viewer.requestJoin();
    broadcaster.publishChunk(naclUtil.decodeUTF8('via-relay'));

    expect(viewer.chunks).toHaveLength(1);
    expect(naclUtil.encodeUTF8(decodeMediaChunkPayload(viewer.chunks[0]))).toBe('via-relay');
  });

  test('non-public session cannot use public broadcaster helper', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('private-origin');
    const session = createStreamSession({
      sessionId: 'priv',
      broadcasterId: 'alice',
      mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      privateRecipients: ['bob']
    });
    expect(() => new (require('../../src/streaming/public-stream-path').PublicStreamBroadcaster)({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus
    })).toThrow(/public/);
  });
});