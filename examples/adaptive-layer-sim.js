#!/usr/bin/env node
/**
 * Adaptive layer simulation — signed ladder chunks + receiver reports (#152 milestone 5).
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  createSignedMediaChunk,
  verifyMediaChunk,
  createReceiverReport,
  createBandwidthEstimator,
  createLayerSelector
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
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000;
}

function main() {
  const keys = signingKeys('adaptive-layer-sim');
  for (const layerId of ['L0', 'L1', 'L2']) {
    const chunk = createSignedMediaChunk({
      sessionId: 'adaptive-sim',
      broadcasterId: 'origin',
      payloadBytes: naclUtil.decodeUTF8(`frame-${layerId}`),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      layerId,
      profile: RENDITION_PROFILE_HD720,
      keyframe: layerId === 'L0'
    });
    verifyMediaChunk(chunk, 'adaptive-sim');
    console.log(`signed ${layerId} rendition kbps:`, chunk.rendition.videoBitrateKbps);
  }

  const headroom = 1.2;
  const l0Req = layerBitrateBps('L0') * headroom;
  const l1Req = layerBitrateBps('L1') * headroom;
  const l2Req = layerBitrateBps('L2') * headroom;

  const estimator = createBandwidthEstimator({
    floorBps: l0Req,
    ceilingBps: l2Req,
    quietGainBps: 80_000,
    initialEstimateBps: l2Req
  });
  const selector = createLayerSelector({ profile: RENDITION_PROFILE_HD720 });

  const script = [
    { ts: 0, bytes: Math.floor(l2Req / 8), loss: 0, delay: 0 },
    { ts: 1000, bytes: Math.floor(l1Req / 8) - 1000, loss: 0, delay: 0 },
    { ts: 1200, bytes: Math.floor(l0Req / 8) - 5000, loss: 0, delay: 0 },
    { ts: 1500, bytes: Math.floor(l0Req / 8) - 8000, loss: 0, delay: 0 },
    { ts: 2000, bytes: Math.floor(l1Req / 8), loss: 0, delay: 0 },
    { ts: 3500, bytes: Math.floor(l2Req / 8), loss: 0, delay: 0 }
  ];

  let previousTs = script[0].ts;
  for (const step of script) {
    const intervalMs = step.ts - previousTs || 1000;
    previousTs = step.ts;
    const report = createReceiverReport({
      sessionId: 'adaptive-sim',
      viewerId: 'viewer-1',
      layerId: selector.getLayerId(),
      timestampMs: step.ts,
      intervalMs,
      bytesReceived: step.bytes,
      packetsReceived: 1000,
      packetsLost: step.loss,
      interarrivalDelayMs: step.delay
    });
    const estimateBps = estimator.observe(report);
    const layer = selector.selectLayer({ estimateBps, nowMs: step.ts });
    console.log(`t=${step.ts} estimateMbps=${(estimateBps / 1e6).toFixed(2)} selected layer: ${layer}`);
  }
}

main();