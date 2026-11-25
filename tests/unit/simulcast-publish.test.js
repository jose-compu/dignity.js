const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  DEFAULT_HEADROOM_FACTOR,
  verifyMediaChunk,
  createInMemoryStreamSignalingBus,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  createRelayLayerPolicy,
  createReceiverReport,
  createPlayoutBuffer,
  createBandwidthEstimator,
  createLayerSelector,
  normalizeSimulcastLayers,
  createLayerSequenceTracker,
  runSimulcastLoadTrace,
  STREAM_ACCESS_MODES,
  createStreamSession
} = require('../../src/streaming');
const { createNodeStreamOrigin } = require('../../src/streaming/node-stream-origin');

function testKeyPair(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

function layerBitrateBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * DEFAULT_HEADROOM_FACTOR;
}

describe('simulcast publish', () => {
  test('normalizeSimulcastLayers accepts array and map', () => {
    const bytes = naclUtil.decodeUTF8('x');
    const fromArray = normalizeSimulcastLayers([
      { layerId: 'L0', data: bytes, keyframe: true },
      { layerId: 'L1', payloadBytes: bytes }
    ]);
    expect(fromArray).toHaveLength(2);
    expect(fromArray[0].layerId).toBe('L0');
    expect(fromArray[0].keyframe).toBe(true);

    const fromMap = normalizeSimulcastLayers({
      layers: {
        L2: { data: bytes },
        L0: { payloadBytes: bytes, keyframe: true }
      }
    });
    expect(fromMap.map((l) => l.layerId).sort()).toEqual(['L0', 'L2']);
  });

  test('per-layer sequence numbers are independent and gap-free', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('simulcast-seq');
    const broadcaster = createPublicStreamBroadcaster({
      sessionId: 'simulcast-seq',
      broadcasterId: 'origin',
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      initialViewerIds: ['viewer']
    });
    const viewer = createPublicStreamViewer({
      viewerId: 'viewer',
      sessionId: 'simulcast-seq',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });

    broadcaster.publishSimulcastTick(
      [
        { layerId: 'L0', payloadBytes: naclUtil.decodeUTF8('a0'), keyframe: true },
        { layerId: 'L1', payloadBytes: naclUtil.decodeUTF8('a1') },
        { layerId: 'L2', payloadBytes: naclUtil.decodeUTF8('a2') }
      ],
      { timestampMs: 100, profile: RENDITION_PROFILE_HD720 }
    );
    broadcaster.publishSimulcastTick(
      [
        { layerId: 'L1', payloadBytes: naclUtil.decodeUTF8('b1') },
        { layerId: 'L2', payloadBytes: naclUtil.decodeUTF8('b2') }
      ],
      { timestampMs: 200, profile: RENDITION_PROFILE_HD720 }
    );

    const byLayer = { L0: [], L1: [], L2: [] };
    for (const chunk of viewer.chunks) {
      byLayer[chunk.layerId].push(chunk.sequence);
      expect(verifyMediaChunk(chunk, 'simulcast-seq')).toBe(true);
    }
    expect(byLayer.L0).toEqual([0]);
    expect(byLayer.L1).toEqual([0, 1]);
    expect(byLayer.L2).toEqual([0, 1]);
    expect(broadcaster.getLayerSequence('L1')).toBe(2);
  });

  test('tampering one layer rendition fails only that chunk', () => {
    const keys = testKeyPair('simulcast-tamper');
    const bus = createInMemoryStreamSignalingBus();
    const broadcaster = createPublicStreamBroadcaster({
      sessionId: 'simulcast-tamper',
      broadcasterId: 'origin',
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus
    });
    const chunks = broadcaster.publishSimulcastTick(
      ['L0', 'L1', 'L2'].map((layerId) => ({
        layerId,
        payloadBytes: naclUtil.decodeUTF8(layerId),
        keyframe: layerId === 'L0'
      })),
      { profile: RENDITION_PROFILE_HD720, timestampMs: 1 }
    );
    for (const chunk of chunks) {
      expect(verifyMediaChunk(chunk, 'simulcast-tamper')).toBe(true);
    }
    chunks[1].rendition.videoBitrateKbps -= 1;
    expect(() => verifyMediaChunk(chunks[1])).toThrow(/signature/i);
    expect(verifyMediaChunk(chunks[0], 'simulcast-tamper')).toBe(true);
    expect(verifyMediaChunk(chunks[2], 'simulcast-tamper')).toBe(true);
  });

  test('runSimulcastLoadTrace aligns relay and viewer on degraded child', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('simulcast-trace');
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
      sessionId: 'simulcast-trace',
      broadcasterId: 'origin',
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      initialViewerIds: ['relay']
    });
    const relay = createPublicStreamRelay({
      relayId: 'relay',
      upstreamId: 'origin',
      sessionId: 'simulcast-trace',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      broadcasterId: 'origin',
      bus,
      downstreamViewerIds: ['child-a', 'child-b'],
      relayLayerPolicy: policy,
      relayChildOptions: {
        'child-a': { initialEstimateBps: l2Bps },
        'child-b': { initialEstimateBps: l2Bps }
      }
    });
    const viewerHealthy = createPublicStreamViewer({
      viewerId: 'child-a',
      sessionId: 'simulcast-trace',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });
    const viewerDegraded = createPublicStreamViewer({
      viewerId: 'child-b',
      sessionId: 'simulcast-trace',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });

    const result = runSimulcastLoadTrace({
      bus,
      broadcaster,
      relay,
      viewerHealthy,
      viewerDegraded,
      viewerSelectorDegraded: createLayerSelector({ profile: RENDITION_PROFILE_HD720 }),
      playoutDegraded: createPlayoutBuffer({ raiseStepMs: 50 }),
      estimatorDegraded: createBandwidthEstimator({
        floorBps: l0Bps,
        ceilingBps: l2Bps,
        initialEstimateBps: l2Bps
      }),
      degradedChildId: 'child-b',
      healthyChildId: 'child-a',
      sessionId: 'simulcast-trace',
      l0Bps,
      l1Bps,
      l2Bps,
      payloadForLayer: (layerId) => naclUtil.decodeUTF8(`tick-${layerId}`)
    });

    expect(result.publishedLayerIds).toEqual(['L0', 'L1', 'L2']);
    expect(result.relayLayerDegraded).toBe(result.viewerLayerDegraded);
    expect(['L0', 'L1', 'L2']).toContain(result.relayLayerHealthy);
    expect(result.logLines).toEqual(
      expect.arrayContaining(['published layers: L0 L1 L2', expect.stringMatching(/^relay forwards: L/)])
    );
  });

  test('NodeStreamOrigin publishes three chunks per simulcast tick', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-simulcast');
    const session = createStreamSession({
      sessionId: 'node-simulcast',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });
    const chunks = [];
    bus.subscribe('viewer', (envelope) => {
      if (envelope.messageType === 'stream:media-chunk' && envelope.chunk) {
        chunks.push(envelope.chunk);
      }
    });

    let emitted;
    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      directViewerIds: ['viewer'],
      mediaIngest: {
        stop() {},
        async *frames() {
          if (emitted) {
            return;
          }
          emitted = true;
          yield {
            timestampMs: 42,
            profile: RENDITION_PROFILE_HD720,
            layers: [
              { layerId: 'L0', data: naclUtil.decodeUTF8('l0'), keyframe: true },
              { layerId: 'L1', data: naclUtil.decodeUTF8('l1') },
              { layerId: 'L2', data: naclUtil.decodeUTF8('l2') }
            ]
          };
        }
      }
    });

    bus.send('viewer', 'origin', {
      messageType: 'stream:join-request',
      sessionId: session.sessionId,
      viewerId: 'viewer'
    });
    await origin.start();
    expect(chunks).toHaveLength(3);
    expect(chunks.map((c) => c.layerId).sort()).toEqual(['L0', 'L1', 'L2']);
    expect(chunks.every((c) => c.timestampMs === 42)).toBe(true);
    for (const chunk of chunks) {
      expect(verifyMediaChunk(chunk, session.sessionId)).toBe(true);
    }
  });
});

describe('createLayerSequenceTracker', () => {
  test('tracks sequences per layer independently', () => {
    const tracker = createLayerSequenceTracker();
    expect(tracker.next('L0')).toBe(0);
    expect(tracker.next('L1')).toBe(0);
    expect(tracker.next('L0')).toBe(1);
    expect(tracker.peek('L2')).toBe(0);
    expect(tracker.snapshot().get('L0')).toBe(2);
  });
});