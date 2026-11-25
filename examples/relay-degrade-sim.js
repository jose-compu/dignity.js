#!/usr/bin/env node
/**
 * Relay per-child layer degradation simulation (#152 milestone 5).
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  createSignedMediaChunk,
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
  DEFAULT_HEADROOM_FACTOR
} = require('../src/streaming');

function signingKeys(label) {
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

function main() {
  const bus = createInMemoryStreamSignalingBus();
  const keys = signingKeys('relay-degrade-sim');
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
    sessionId: 'relay-degrade-sim',
    broadcasterId: 'origin',
    signingSecretKey: keys.signingSecretKey,
    signingPublicKey: keys.signingPublicKey,
    bus,
    initialViewerIds: ['relay-1']
  });

  const relay = createPublicStreamRelay({
    relayId: 'relay-1',
    upstreamId: 'origin',
    sessionId: 'relay-degrade-sim',
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

  const viewerA = createPublicStreamViewer({
    viewerId: 'child-a',
    sessionId: 'relay-degrade-sim',
    broadcasterId: 'origin',
    broadcasterSigningPublicKey: keys.signingPublicKey,
    bus
  });
  const viewerB = createPublicStreamViewer({
    viewerId: 'child-b',
    sessionId: 'relay-degrade-sim',
    broadcasterId: 'origin',
    broadcasterSigningPublicKey: keys.signingPublicKey,
    bus
  });

  const playout = createPlayoutBuffer({ initialTargetDelayMs: 80, raiseStepMs: 50 });
  const viewerEstimator = createBandwidthEstimator({
    floorBps: l0Bps,
    ceilingBps: l2Bps,
    initialEstimateBps: l2Bps
  });
  const viewerSelector = createLayerSelector({ profile: RENDITION_PROFILE_HD720 });

  broadcaster.announce();
  viewerA.requestJoin();
  viewerB.requestJoin();

  const childBScript = [
    { ts: 0, bytes: Math.floor(l2Bps / 8), loss: 0, delay: 0 },
    { ts: 1000, bytes: Math.floor(l1Bps / 8) - 1000, loss: 0, delay: 0 },
    { ts: 1200, bytes: Math.floor(l0Bps / 8) - 5000, loss: 0, delay: 5 },
    { ts: 1500, bytes: Math.floor(l0Bps / 8) - 8000, loss: 0, delay: 8 },
    { ts: 2000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
    { ts: 3500, bytes: Math.floor(l2Bps / 8), loss: 0, delay: 0 }
  ];

  let prevTs = childBScript[0].ts;
  for (const step of childBScript) {
    const intervalMs = step.ts - prevTs || 1000;
    prevTs = step.ts;
    const report = createReceiverReport({
      sessionId: 'relay-degrade-sim',
      viewerId: 'child-b',
      layerId: relay.getChildLayer('child-b') || 'L2',
      timestampMs: step.ts,
      intervalMs,
      bytesReceived: step.bytes,
      packetsReceived: 1000,
      packetsLost: step.loss,
      interarrivalDelayMs: step.delay
    });
    relay.observeChildReport('child-b', report);

    const viewReport = createReceiverReport({
      sessionId: 'relay-degrade-sim',
      viewerId: 'viewer-b',
      layerId: viewerSelector.getLayerId(),
      timestampMs: step.ts,
      intervalMs,
      bytesReceived: step.bytes,
      packetsReceived: 1000,
      packetsLost: step.loss,
      interarrivalDelayMs: step.delay
    });
    const target = playout.observeReport(viewReport);
    const estimateBps = viewerEstimator.observe(viewReport);
    const layer = playout.selectLayerWithBufferGuard(viewerSelector, {
      estimateBps,
      nowMs: step.ts
    });

    console.log(`child A layer: ${relay.getChildLayer('child-a')}`);
    console.log(`child B layer: ${relay.getChildLayer('child-b')}`);
    console.log(`buffer target: ${target} ms`);
    console.log(`viewer B selected layer: ${layer}`);
  }

  for (const layerId of ['L0', 'L1', 'L2']) {
    const chunk = broadcaster.publishChunk(naclUtil.decodeUTF8(`burst-${layerId}`), {
      layerId,
      profile: RENDITION_PROFILE_HD720,
      keyframe: layerId === 'L0',
      timestampMs: 4000
    });
    verifyMediaChunk(chunk, 'relay-degrade-sim');
  }

  console.log('child-a layers received:', viewerA.chunks.map((c) => c.layerId).join(','));
  console.log('child-b layers received:', viewerB.chunks.map((c) => c.layerId).join(','));
}

main();