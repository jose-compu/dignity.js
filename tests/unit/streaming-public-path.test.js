const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createSignedMediaChunk,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  MEDIA_CHUNK_VERSION,
  MEDIA_CHUNK_VERSION_KEYFRAME,
  MEDIA_CHUNK_VERSION_LEGACY,
  RENDITION_PROFILE_HD720,
  resolveRendition,
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
    expect(chunk.version).toBe(MEDIA_CHUNK_VERSION_KEYFRAME);
    expect(chunk.keyframe).toBe(false);
  });

  test('720p L1 rendition is signed on version 3 chunks', () => {
    const keys = testKeyPair('rendition-stream');
    const payload = naclUtil.decodeUTF8('layered-frame');
    const rendition = resolveRendition(RENDITION_PROFILE_HD720, 'L1');
    const chunk = createSignedMediaChunk({
      sessionId: 'live-rendition',
      broadcasterId: 'alice',
      payloadBytes: payload,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      layerId: 'L1',
      profile: RENDITION_PROFILE_HD720
    });
    expect(chunk.version).toBe(MEDIA_CHUNK_VERSION);
    expect(chunk.rendition).toMatchObject({
      profile: RENDITION_PROFILE_HD720,
      videoBitrateKbps: 1800
    });
    expect(verifyMediaChunk(chunk, 'live-rendition')).toBe(true);
    chunk.rendition.videoBitrateKbps = 1700;
    try {
      verifyMediaChunk(chunk);
      throw new Error('expected verify to fail');
    } catch (err) {
      expect(err.code).toBe('INVALID_MEDIA_CHUNK_SIGNATURE');
    }
  });

  test('keyframe is signed and tampering fails verification', () => {
    const keys = testKeyPair('keyframe-stream');
    const chunk = createSignedMediaChunk({
      sessionId: 'live-kf',
      broadcasterId: 'alice',
      payloadBytes: naclUtil.decodeUTF8('frame'),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      keyframe: true
    });
    expect(chunk.keyframe).toBe(true);
    expect(verifyMediaChunk(chunk)).toBe(true);
    chunk.keyframe = false;
    expect(() => verifyMediaChunk(chunk)).toThrow(/signature/i);
  });

  test('version 1 chunks from 1.8.0 still verify', () => {
    const keys = testKeyPair('legacy-v1');
    const payload = naclUtil.decodeUTF8('legacy');
    const chunk = createSignedMediaChunk({
      sessionId: 'legacy',
      broadcasterId: 'bc',
      payloadBytes: payload,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey
    });
    chunk.version = MEDIA_CHUNK_VERSION_LEGACY;
    delete chunk.keyframe;
    const { stableStringify } = require('../../src/security/message-security-service');
    const { payloadFingerprint } = require('../../src/streaming/media-chunk');
    const naclUtil2 = require('tweetnacl-util');
    const signingPayload = stableStringify({
      version: MEDIA_CHUNK_VERSION_LEGACY,
      sessionId: chunk.sessionId,
      broadcasterId: chunk.broadcasterId,
      sequence: chunk.sequence,
      timestampMs: chunk.timestampMs,
      layerId: chunk.layerId,
      mimeType: chunk.mimeType,
      payloadFingerprint: chunk.payloadFingerprint
    });
    const signature = nacl.sign.detached(naclUtil2.decodeUTF8(signingPayload), keys.signingSecretKey);
    chunk.signatureBase64 = naclUtil2.encodeBase64(signature);
    expect(verifyMediaChunk(chunk)).toBe(true);
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