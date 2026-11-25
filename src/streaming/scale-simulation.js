/**
 * Seeded analytic + discrete-event fan-out scale model (#152 milestone 7, v1.14.0).
 * @experimental
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

const { RENDITION_PROFILE_HD720, LAYER_IDS } = require('./rendition-ladder');
const { createSignedMediaChunk, verifyMediaChunk, decodeMediaChunkPayload } = require('./media-chunk');
const { createReceiverReport } = require('./receiver-report');
const { layerRequiredBps, DEFAULT_HEADROOM_FACTOR } = require('./layer-selector');
const { createRelayLayerPolicy } = require('./relay-layer-policy');
const { assignRelayChildBudget } = require('./relay-child-assignment');

const DEFAULT_SEED = 1520714;
const HEADROOM = DEFAULT_HEADROOM_FACTOR;

const SCALE_TARGET_N = 10_000_000;
const SCALE_TARGET_D = 16;

/** @type {Readonly<Record<string, number>>} */
const PEER_CAP = Object.freeze({
  ci: 256,
  offline: 4096
});

/** Design-doc planning targets (N, degree). */
const ANALYTIC_TARGETS = Object.freeze([
  { viewers: 10_000, degree: 8 },
  { viewers: 1_000_000, degree: 12 },
  { viewers: 10_000_000, degree: 16 }
]);

/**
 * Upload caps (assumption table). Mbps values are not measured distributions.
 * Leaves forward nothing; relays and super-peers are drawn from these buckets.
 */
const UPLOAD_CAP_ASSUMPTIONS_Mbps = Object.freeze({
  leaf: 0,
  relay: Object.freeze([5, 10, 20, 50]),
  superPeer: Object.freeze([100, 1000]),
  origin: 1000
});

const SIBLING_OVERLAP_BUDGET_MS = 4000;
const PATH_BREAK_PER_HEARTBEAT = 0.001;
const REPAIR_BASE_MS = 1000;
const REPAIR_PER_HOP_MS = 80;

const VIRTUAL_TICK_MS = 500;
const HEARTBEATS_PER_RELAY = 8;

/**
 * Mulberry32 PRNG — deterministic from 32-bit seed.
 * @param {number} seed
 */
function createPrng(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} viewers
 * @param {number} degree
 */
function analyticHops(viewers, degree) {
  if (viewers <= 1) {
    return 0;
  }
  return Math.ceil(Math.log(viewers) / Math.log(degree));
}

/**
 * Interior relays for a full leaf set (design doc).
 * @param {number} viewers
 * @param {number} degree
 */
function interiorRelays(viewers, degree) {
  if (degree <= 1) {
    return 0;
  }
  return (viewers - 1) / (degree - 1);
}

/**
 * @param {number} depth
 */
function repairMs(depth) {
  return REPAIR_BASE_MS + depth * REPAIR_PER_HOP_MS;
}

/**
 * @param {number} depth
 */
function pathBreakProbability(depth) {
  if (depth <= 0) {
    return 0;
  }
  return 1 - (1 - PATH_BREAK_PER_HEARTBEAT) ** depth;
}

function layerStackBps(profile) {
  let sum = 0;
  for (const layerId of LAYER_IDS) {
    sum += layerRequiredBps(profile, layerId, HEADROOM);
  }
  return sum;
}

function mbpsToBps(mbps) {
  return Math.round(mbps * 1_000_000);
}

/**
 * @param {() => number} next
 * @param {number} peerCap
 * @param {'uniform' | 'capacity'} childAssignment
 * @param {number} [forwardLayerBps] required when childAssignment is capacity
 */
function sampleRelays(next, peerCap, childAssignment = 'uniform', forwardLayerBps = 0) {
  const relayCapsMbps = UPLOAD_CAP_ASSUMPTIONS_Mbps.relay;
  const superCapsMbps = UPLOAD_CAP_ASSUMPTIONS_Mbps.superPeer;
  const relays = [];
  const relaySample = Math.min(peerCap, Math.max(32, Math.floor(peerCap / 2)));

  for (let i = 0; i < relaySample; i += 1) {
    const isSuper = next() < 0.08;
    const capMbps = isSuper
      ? superCapsMbps[Math.floor(next() * superCapsMbps.length)]
      : relayCapsMbps[Math.floor(next() * relayCapsMbps.length)];
    const capBps = mbpsToBps(capMbps);
    let childCount;
    if (childAssignment === 'capacity') {
      childCount = assignRelayChildBudget({
        uplinkBps: capBps,
        forwardLayerBps,
        maxDegree: SCALE_TARGET_D
      });
    } else {
      childCount = 1 + Math.floor(next() * SCALE_TARGET_D);
    }
    relays.push({
      id: `r${i}`,
      capBps,
      childCount,
      isSuper
    });
  }
  return relays;
}

/**
 * @param {ReturnType<typeof sampleRelays>} relays
 * @param {'uniform' | 'capacity'} childAssignment
 */
function summarizeFanOut(relays, childAssignment) {
  const forwarding = relays.filter((r) => r.childCount > 0);
  const leafOnlyRelayCount = relays.length - forwarding.length;
  let effectiveDegree = SCALE_TARGET_D;
  if (childAssignment === 'capacity') {
    if (forwarding.length === 0) {
      effectiveDegree = 1;
    } else {
      const totalChildren = forwarding.reduce((sum, relay) => sum + relay.childCount, 0);
      effectiveDegree = Math.max(1, Math.round(totalChildren / forwarding.length));
    }
  }
  const hopsAt10M = analyticHops(SCALE_TARGET_N, effectiveDegree);
  return {
    childAssignment,
    leafOnlyRelayCount,
    forwardingRelayCount: forwarding.length,
    effectiveDegree,
    hopsAt10M,
    interiorRelaysAt10M: interiorRelays(SCALE_TARGET_N, effectiveDegree)
  };
}

/**
 * @param {() => number} next
 * @param {ReturnType<typeof sampleRelays>} relays
 */
function simulateStalls(next, relays) {
  const profile = RENDITION_PROFILE_HD720;
  const l0 = layerRequiredBps(profile, 'L0', HEADROOM);
  const l1 = layerRequiredBps(profile, 'L1', HEADROOM);
  const l2 = layerRequiredBps(profile, 'L2', HEADROOM);

  let forwardChecks = 0;
  let stalls = 0;
  let virtualNowMs = VIRTUAL_TICK_MS;

  for (const relay of relays) {
    if (relay.childCount <= 0) {
      continue;
    }
    const policy = createRelayLayerPolicy({
      profile,
      floorBps: l0,
      ceilingBps: l2,
      quietGainBps: 80_000,
      initialEstimateBps: Math.min(relay.capBps, l2)
    });

    /** @type {string[]} */
    const childIds = [];
    for (let c = 0; c < relay.childCount; c += 1) {
      const childId = `${relay.id}-c${c}`;
      childIds.push(childId);
      const childEstimate = Math.max(
        l0,
        Math.min(l2, Math.floor(relay.capBps / Math.max(1, relay.childCount)) * (0.7 + next() * 0.5))
      );
      policy.registerChild(childId, { initialEstimateBps: childEstimate });
    }

    for (let beat = 0; beat < HEARTBEATS_PER_RELAY; beat += 1) {
      virtualNowMs += VIRTUAL_TICK_MS;
      /** @type {string[]} */
      const childLayers = [];
      for (const childId of childIds) {
        const bytesPerInterval = Math.max(
          1000,
          Math.floor((l0 + next() * (l2 - l0)) / 8 / (1000 / VIRTUAL_TICK_MS))
        );
        const report = createReceiverReport({
          sessionId: 'scale-sim',
          viewerId: childId,
          layerId: policy.getChildLayer(childId) ?? 'L0',
          timestampMs: virtualNowMs,
          intervalMs: VIRTUAL_TICK_MS,
          packetsReceived: 40 + Math.floor(next() * 20),
          packetsLost: Math.floor(next() * 3),
          bytesReceived: bytesPerInterval,
          interarrivalDelayMs: Math.floor(next() * 12)
        });
        const { layerId } = policy.observeChildReport(childId, report);
        childLayers.push(layerId);
      }

      const layerRank = (id) => LAYER_IDS.indexOf(id);
      const selectedLayer = childLayers.reduce(
        (best, id) => (layerRank(id) > layerRank(best) ? id : best),
        childLayers[0] ?? 'L0'
      );
      const requiredBps = layerRequiredBps(profile, selectedLayer, HEADROOM) * relay.childCount;
      forwardChecks += 1;
      if (relay.capBps < requiredBps) {
        stalls += 1;
      }
    }
  }

  const stallRate = forwardChecks === 0 ? 0 : stalls / forwardChecks;
  return {
    relaySampleSize: relays.length,
    forwardChecks,
    stalls,
    stallRate,
    peersConstructed: relays.length
  };
}

function buildRepairSeries() {
  const depths = [1, 2, 3, 4, 5, 6, 7, 8];
  return depths.map((depth) => ({
    depth,
    repairMs: repairMs(depth),
    withinSiblingOverlapBudget: repairMs(depth) <= SIBLING_OVERLAP_BUDGET_MS,
    pathBreakProbability: pathBreakProbability(depth)
  }));
}

function buildAnalyticTargets() {
  return ANALYTIC_TARGETS.map(({ viewers, degree }) => ({
    viewers,
    degree,
    hops: analyticHops(viewers, degree),
    interiorRelays: interiorRelays(viewers, degree)
  }));
}

function evaluateOriginCoverage(degree) {
  const profile = RENDITION_PROFILE_HD720;
  const originCapBps = mbpsToBps(UPLOAD_CAP_ASSUMPTIONS_Mbps.origin);
  const stackBps = layerStackBps(profile);
  const requiredBps = stackBps * degree;
  return {
    capBps: originCapBps,
    simulcastStackBps: stackBps,
    degree,
    requiredBps,
    covers: originCapBps >= requiredBps
  };
}

function runChunkVerifyCheck() {
  const keyPair = nacl.sign.keyPair();
  const signingPublicKey = naclUtil.encodeBase64(keyPair.publicKey);
  const payloadBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01]);

  const chunk = createSignedMediaChunk({
    sessionId: 'scale-sim-chunk',
    broadcasterId: 'origin',
    payloadBytes,
    signingSecretKey: keyPair.secretKey,
    signingPublicKey,
    sequence: 0,
    timestampMs: 0,
    layerId: 'L1',
    profile: RENDITION_PROFILE_HD720,
    keyframe: true
  });

  const forwarded = decodeMediaChunkPayload(chunk);
  const verified = verifyMediaChunk(chunk, 'scale-sim-chunk');

  const tamperedPayload = new Uint8Array(forwarded);
  tamperedPayload[0] ^= 0xff;
  const tampered = {
    ...chunk,
    payloadBase64: naclUtil.encodeBase64(tamperedPayload),
    payloadFingerprint: require('./media-chunk').payloadFingerprint(tamperedPayload)
  };

  let tamperedVerified = false;
  try {
    verifyMediaChunk(tampered, 'scale-sim-chunk');
    tamperedVerified = true;
  } catch {
    tamperedVerified = false;
  }

  return {
    verified: verified === true,
    tamperedVerified,
    forwardedByteLength: forwarded.byteLength
  };
}

/**
 * @param {Object} [options]
 * @param {number} [options.seed]
 * @param {'ci' | 'offline'} [options.profile]
 * @param {'uniform' | 'capacity'} [options.childAssignment] capacity default for scale sim only; public relay API stays uniform unless set
 */
function runScaleSimulation({
  seed = DEFAULT_SEED,
  profile: simProfile = 'ci',
  childAssignment = 'uniform'
} = {}) {
  if (!Object.prototype.hasOwnProperty.call(PEER_CAP, simProfile)) {
    throw new TypeError(`profile must be "ci" or "offline", got ${simProfile}`);
  }
  if (childAssignment !== 'uniform' && childAssignment !== 'capacity') {
    throw new TypeError(`childAssignment must be "uniform" or "capacity", got ${childAssignment}`);
  }

  const next = createPrng(seed >>> 0);
  const peerCap = PEER_CAP[simProfile];
  const renditionProfile = RENDITION_PROFILE_HD720;
  const typicalForwardBps = layerRequiredBps(renditionProfile, 'L1', HEADROOM);

  const targets = buildAnalyticTargets();
  const repair = {
    assumptions: {
      repairMsFormula: '1000 + h * 80',
      siblingOverlapBudgetMs: SIBLING_OVERLAP_BUDGET_MS,
      pathBreakPerHeartbeat: PATH_BREAK_PER_HEARTBEAT,
      uploadCapMbps: UPLOAD_CAP_ASSUMPTIONS_Mbps
    },
    series: buildRepairSeries()
  };

  const relays = sampleRelays(next, peerCap, childAssignment, typicalForwardBps);
  const stall = simulateStalls(next, relays);
  const fanOut = summarizeFanOut(relays, childAssignment);
  const origin = evaluateOriginCoverage(SCALE_TARGET_D);
  const chunk = runChunkVerifyCheck();

  const scaleRow = targets.find((t) => t.viewers === SCALE_TARGET_N && t.degree === SCALE_TARGET_D);
  const hopsAt10M =
    childAssignment === 'capacity'
      ? fanOut.hopsAt10M
      : scaleRow
        ? scaleRow.hops
        : analyticHops(SCALE_TARGET_N, SCALE_TARGET_D);
  const repairAtMaxDepth = repairMs(hopsAt10M);
  const failedChecks = [];

  if (childAssignment === 'uniform') {
    if (hopsAt10M !== 6) {
      failedChecks.push('hops');
    }
  } else if (childAssignment === 'capacity' && hopsAt10M > 6) {
    failedChecks.push('hops');
  }
  if (repairAtMaxDepth > SIBLING_OVERLAP_BUDGET_MS) {
    failedChecks.push('repair');
  }
  if (!origin.covers) {
    failedChecks.push('origin');
  }
  if (stall.stallRate !== 0) {
    failedChecks.push('stall');
  }

  /** @type {{ status: 'topology' | 'qualified', failedChecks?: string[] }} */
  const claim =
    failedChecks.length === 0
      ? { status: 'topology' }
      : { status: 'qualified', failedChecks };

  /** @type {Record<string, unknown>} */
  const result = {
    seed,
    profile: simProfile,
    targets,
    interiorRelays: interiorRelays(SCALE_TARGET_N, SCALE_TARGET_D),
    repair,
    stall,
    origin,
    chunk,
    claim
  };
  if (childAssignment !== 'uniform') {
    result.childAssignment = childAssignment;
    result.fanOut = fanOut;
  }
  return result;
}

module.exports = {
  DEFAULT_SEED,
  DEFAULT_SCALE_SIM_SEED: DEFAULT_SEED,
  PEER_CAP,
  UPLOAD_CAP_ASSUMPTIONS_Mbps,
  runScaleSimulation,
  sampleRelays,
  summarizeFanOut,
  analyticHops,
  interiorRelays,
  repairMs,
  pathBreakProbability
};