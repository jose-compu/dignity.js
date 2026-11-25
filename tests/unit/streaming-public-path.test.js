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
  createRelayLayerPolicy,
  createReceiverReport,
  DEFAULT_HEADROOM_FACTOR,
  STREAM_ACCESS_MODES,
  STREAM_MESSAGE_TYPES,
  sealPrivateMediaChunk,
} = require('../../src/streaming');
const { deriveKeyPairFromCredentials, keyPairToPublicBundle } = require('../../src/index');
const { createStreamSession } = require('../../src/streaming/stream-session');

function layerBitrateBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * DEFAULT_HEADROOM_FACTOR;
}

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

  test('relay applies per-child layers on scripted reports', () => {
    const bus = createInMemoryStreamSignalingBus();
    const aliceKeys = testKeyPair('relay-degrade-origin');
    const l0Bps = layerBitrateBps('L0');
    const l1Bps = layerBitrateBps('L1');
    const l2Bps = layerBitrateBps('L2');

    const policy = createRelayLayerPolicy({
      profile: RENDITION_PROFILE_HD720,
      floorBps: l0Bps,
      ceilingBps: l2Bps,
      quietGainBps: 80_000,
      initialEstimateBps: l2Bps
    });

    const broadcaster = createPublicStreamBroadcaster({
      sessionId: 'degrade-session',
      broadcasterId: 'alice',
      signingSecretKey: aliceKeys.signingSecretKey,
      signingPublicKey: aliceKeys.signingPublicKey,
      bus,
      initialViewerIds: ['relay-1']
    });

    const relay = createPublicStreamRelay({
      relayId: 'relay-1',
      upstreamId: 'alice',
      sessionId: 'degrade-session',
      broadcasterSigningPublicKey: aliceKeys.signingPublicKey,
      broadcasterId: 'alice',
      bus,
      downstreamViewerIds: ['child-a', 'child-b'],
      relayLayerPolicy: policy,
      relayChildOptions: {
        'child-a': { initialEstimateBps: l2Bps },
        'child-b': { initialEstimateBps: l2Bps }
      }
    });

    const viewerA = createPublicStreamViewer({
      viewerId: 'child-a',
      sessionId: 'degrade-session',
      broadcasterId: 'alice',
      broadcasterSigningPublicKey: aliceKeys.signingPublicKey,
      bus
    });
    const viewerB = createPublicStreamViewer({
      viewerId: 'child-b',
      sessionId: 'degrade-session',
      broadcasterId: 'alice',
      broadcasterSigningPublicKey: aliceKeys.signingPublicKey,
      bus
    });

    broadcaster.announce();
    viewerA.requestJoin();
    viewerB.requestJoin();

    const publishLayer = (layerId, keyframe = false, sequenceOffset = 0) =>
      broadcaster.publishChunk(naclUtil.decodeUTF8(`frame-${layerId}-${sequenceOffset}`), {
        layerId,
        profile: RENDITION_PROFILE_HD720,
        keyframe: keyframe || layerId === 'L0',
        timestampMs: 100 + sequenceOffset
      });

    publishLayer('L2', false, 0);
    publishLayer('L1', false, 1);
    publishLayer('L0', true, 2);

    expect(viewerA.chunks).toHaveLength(3);
    expect(viewerB.chunks).toHaveLength(3);

    relay.observeChildReport(
      'child-b',
      createReceiverReport({
        sessionId: 'degrade-session',
        viewerId: 'child-b',
        layerId: 'L2',
        timestampMs: 1000,
        intervalMs: 1000,
        bytesReceived: Math.floor(l1Bps / 8) - 2000,
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    relay.observeChildReport(
      'child-b',
      createReceiverReport({
        sessionId: 'degrade-session',
        viewerId: 'child-b',
        layerId: 'L1',
        timestampMs: 1250,
        intervalMs: 250,
        bytesReceived: Math.floor(l0Bps / 8) - 5000,
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    relay.observeChildReport(
      'child-b',
      createReceiverReport({
        sessionId: 'degrade-session',
        viewerId: 'child-b',
        layerId: 'L1',
        timestampMs: 1500,
        intervalMs: 250,
        bytesReceived: Math.floor(l0Bps / 8) - 8000,
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );

    viewerA.chunks.length = 0;
    viewerB.chunks.length = 0;
    publishLayer('L2', false, 3);
    publishLayer('L1', false, 4);
    publishLayer('L0', true, 5);

    expect(relay.getChildLayer('child-a')).toBe('L2');
    expect(relay.getChildLayer('child-b')).toBe('L0');
    expect(viewerA.chunks.map((c) => c.layerId).sort()).toEqual(['L0', 'L1', 'L2']);
    expect(viewerB.chunks.map((c) => c.layerId).sort()).toEqual(['L0']);
    for (const chunk of viewerB.chunks) {
      expect(verifyMediaChunk(chunk, 'degrade-session')).toBe(true);
    }
  });

  test('relay forwards sealed private chunk without opening payload', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'sealed-bc', password: 'demo' });
    const alice = await deriveKeyPairFromCredentials({ username: 'sealed-alice', password: 'demo' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);

    createPublicStreamRelay({
      relayId: 'relay-sealed',
      upstreamId: 'alice-origin',
      sessionId: 'sealed-relay',
      broadcasterSigningPublicKey: bcBundle.signingPublicKey,
      broadcasterId: 'alice-origin',
      bus,
      downstreamViewerIds: ['viewer-sealed']
    });

    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-sealed',
      sessionId: 'sealed-relay',
      broadcasterId: 'alice-origin',
      broadcasterSigningPublicKey: bcBundle.signingPublicKey,
      bus
    });

    const sealed = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      sessionId: 'sealed-relay',
      broadcasterId: 'alice-origin',
      plaintextBytes: naclUtil.decodeUTF8('sealed-frame'),
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle],
      layerId: 'L1',
      profile: RENDITION_PROFILE_HD720
    });

    expect(verifyMediaChunk(sealed, 'sealed-relay')).toBe(true);
    bus.send('alice-origin', 'relay-sealed', {
      messageType: STREAM_MESSAGE_TYPES.MEDIA_CHUNK,
      chunk: sealed
    });

    expect(viewer.chunks).toHaveLength(1);
    expect(viewer.chunks[0].layerId).toBe('L1');
    expect(viewer.chunks[0].secretboxNonceBase64).toBeDefined();
    expect(verifyMediaChunk(viewer.chunks[0], 'sealed-relay')).toBe(true);
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