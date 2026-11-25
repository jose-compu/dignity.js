/**
 * Viewer-side adaptive layer selection with hysteresis (#152 milestone 5).
 * @experimental
 */

const { resolveRendition, LAYER_IDS } = require('./rendition-ladder');

const DEFAULT_HEADROOM_FACTOR = 1.2;
const DEFAULT_DOWNGRADE_HOLD_MS = 200;
const DEFAULT_UPGRADE_HOLD_MS = 1000;

/**
 * @param {'hd720' | 'fhd1080'} profile
 * @param {string} layerId
 * @returns {number}
 */
function layerRequiredBps(profile, layerId, headroomFactor) {
  const rendition = resolveRendition(profile, layerId);
  return (rendition.videoBitrateKbps + rendition.audioBitrateKbps) * 1000 * headroomFactor;
}

/**
 * @param {'hd720' | 'fhd1080'} profile
 * @param {number} estimateBps
 * @param {number} headroomFactor
 * @returns {string}
 */
function highestAffordableLayer(profile, estimateBps, headroomFactor) {
  let chosen = LAYER_IDS[0];
  for (const layerId of LAYER_IDS) {
    if (estimateBps >= layerRequiredBps(profile, layerId, headroomFactor)) {
      chosen = layerId;
    }
  }
  return chosen;
}

/**
 * @param {Object} options
 * @param {'hd720' | 'fhd1080'} options.profile
 * @param {number} [options.headroomFactor]
 * @param {number} [options.downgradeHoldMs]
 * @param {number} [options.upgradeHoldMs]
 * @param {string} [options.initialLayerId]
 * @param {boolean} [options.waitForKeyframeOnUpgrade]
 */
function createLayerSelector({
  profile,
  headroomFactor = DEFAULT_HEADROOM_FACTOR,
  downgradeHoldMs = DEFAULT_DOWNGRADE_HOLD_MS,
  upgradeHoldMs = DEFAULT_UPGRADE_HOLD_MS,
  initialLayerId = 'L2',
  waitForKeyframeOnUpgrade = false
}) {
  if (typeof profile !== 'string') {
    throw new TypeError('profile must be a string');
  }
  resolveRendition(profile, initialLayerId);

  let currentLayerId = initialLayerId;
  /** @type {string | null} */
  let pendingTarget = null;
  /** @type {number | null} */
  let pendingSinceMs = null;
  const keyframeSeen = Object.fromEntries(LAYER_IDS.map((id) => [id, false]));

  function layerIndex(layerId) {
    return LAYER_IDS.indexOf(layerId);
  }

  function stepToward(current, target) {
    const ci = layerIndex(current);
    const ti = layerIndex(target);
    if (ci === ti) {
      return current;
    }
    if (ti > ci) {
      return LAYER_IDS[ci + 1];
    }
    return LAYER_IDS[ci - 1];
  }

  /**
   * @param {Object} input
   * @param {number} input.estimateBps
   * @param {number} input.nowMs
   * @param {Partial<Record<'L0' | 'L1' | 'L2', boolean>>} [input.keyframeByLayer]
   * @returns {string}
   */
  function selectLayer({ estimateBps, nowMs, keyframeByLayer }) {
    if (typeof estimateBps !== 'number' || !Number.isFinite(estimateBps)) {
      throw new TypeError('estimateBps must be a finite number');
    }
    if (typeof nowMs !== 'number' || !Number.isFinite(nowMs)) {
      throw new TypeError('nowMs must be a finite number');
    }

    if (keyframeByLayer && typeof keyframeByLayer === 'object') {
      for (const layerId of LAYER_IDS) {
        if (keyframeByLayer[layerId]) {
          keyframeSeen[layerId] = true;
        }
      }
    }

    const affordable = highestAffordableLayer(profile, estimateBps, headroomFactor);
    if (affordable === currentLayerId) {
      pendingTarget = null;
      pendingSinceMs = null;
      return currentLayerId;
    }

    const isDowngrade = layerIndex(affordable) < layerIndex(currentLayerId);
    const holdMs = isDowngrade ? downgradeHoldMs : upgradeHoldMs;

    if (pendingTarget !== affordable) {
      pendingTarget = affordable;
      pendingSinceMs = nowMs;
    }

    if (pendingSinceMs !== null && nowMs - pendingSinceMs < holdMs) {
      return currentLayerId;
    }

    const next = stepToward(currentLayerId, pendingTarget);
    if (next === currentLayerId) {
      return currentLayerId;
    }

    const isUpgrade = layerIndex(next) > layerIndex(currentLayerId);
    if (isUpgrade && waitForKeyframeOnUpgrade && !keyframeSeen[next]) {
      return currentLayerId;
    }

    currentLayerId = next;
    if (currentLayerId === pendingTarget) {
      pendingTarget = null;
      pendingSinceMs = null;
    } else {
      pendingSinceMs = nowMs;
    }
    return currentLayerId;
  }

  function getLayerId() {
    return currentLayerId;
  }

  return {
    selectLayer,
    getLayerId,
    highestAffordableLayer: (estimateBps) => highestAffordableLayer(profile, estimateBps, headroomFactor)
  };
}

module.exports = {
  DEFAULT_HEADROOM_FACTOR,
  DEFAULT_DOWNGRADE_HOLD_MS,
  DEFAULT_UPGRADE_HOLD_MS,
  layerRequiredBps,
  highestAffordableLayer,
  createLayerSelector
};