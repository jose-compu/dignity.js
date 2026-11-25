#!/usr/bin/env node
/**
 * Simulcast origin publish + relay layer policy + viewer layer selector (#152 v1.12.0).
 */

const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  createInMemoryStreamSignalingBus,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  createRelayLayerPolicy,
  createPlayoutBuffer,
  createBandwidthEstimator,
  createLayerSelector,
  runSimulcastLoadTrace,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = require('../src');

function layerBitrateBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * 1.2;
}

async function main() {
  const bus = createInMemoryStreamSignalingBus();
  const creds = await deriveKeyPairFromCredentials({ username: 'simulcast-load', password: 'demo' });
  const bundle = keyPairToPublicBundle(creds);
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
    sessionId: 'simulcast-load',
    broadcasterId: 'origin',
    signingSecretKey: creds.signing.secretKey,
    signingPublicKey: bundle.signingPublicKey,
    bus,
    initialViewerIds: ['relay-1']
  });

  const relay = createPublicStreamRelay({
    relayId: 'relay-1',
    upstreamId: 'origin',
    sessionId: 'simulcast-load',
    broadcasterSigningPublicKey: bundle.signingPublicKey,
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
    sessionId: 'simulcast-load',
    broadcasterId: 'origin',
    broadcasterSigningPublicKey: bundle.signingPublicKey,
    bus
  });
  const viewerDegraded = createPublicStreamViewer({
    viewerId: 'child-b',
    sessionId: 'simulcast-load',
    broadcasterId: 'origin',
    broadcasterSigningPublicKey: bundle.signingPublicKey,
    bus
  });

  broadcaster.announce();
  viewerHealthy.requestJoin();
  viewerDegraded.requestJoin();

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
    sessionId: 'simulcast-load',
    l0Bps,
    l1Bps,
    l2Bps
  });

  for (const line of result.logLines) {
    console.log(line);
  }
  console.log('healthy child relay layer:', result.relayLayerHealthy);
  console.log('degraded child relay layer:', result.relayLayerDegraded);
}

main();