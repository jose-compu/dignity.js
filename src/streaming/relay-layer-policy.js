/**
 * Per-downstream relay layer policy from child receiver reports (#152 milestone 5).
 * @experimental
 */

const { createBandwidthEstimator } = require('./bandwidth-estimator');
const { createLayerSelector, DEFAULT_HEADROOM_FACTOR } = require('./layer-selector');
const { LAYER_IDS, RENDITION_PROFILE_HD720 } = require('./rendition-ladder');

/**
 * @param {object} chunk
 * @returns {'L0' | 'L1' | 'L2'}
 */
function chunkLayerId(chunk) {
  if (chunk && typeof chunk.layerId === 'string' && chunk.layerId.trim() !== '') {
    return /** @type {'L0' | 'L1' | 'L2'} */ (chunk.layerId.trim());
  }
  if (chunk && chunk.rendition && typeof chunk.rendition.layerId === 'string') {
    return /** @type {'L0' | 'L1' | 'L2'} */ (chunk.rendition.layerId.trim());
  }
  return 'L0';
}

function layerIndex(layerId) {
  const i = LAYER_IDS.indexOf(layerId);
  return i >= 0 ? i : 0;
}

/**
 * @param {Object} options
 * @param {'hd720' | 'fhd1080'} [options.profile]
 * @param {number} [options.headroomFactor]
 * @param {number} options.floorBps
 * @param {number} options.ceilingBps
 * @param {number} [options.quietGainBps]
 * @param {number} [options.initialEstimateBps]
 * @param {number} [options.downgradeHoldMs]
 * @param {number} [options.upgradeHoldMs]
 * @param {string} [options.initialLayerId]
 */
function createRelayLayerPolicy({
  profile = RENDITION_PROFILE_HD720,
  headroomFactor = DEFAULT_HEADROOM_FACTOR,
  floorBps,
  ceilingBps,
  quietGainBps,
  initialEstimateBps,
  downgradeHoldMs,
  upgradeHoldMs,
  initialLayerId = 'L2'
}) {
  if (typeof floorBps !== 'number' || !Number.isFinite(floorBps)) {
    throw new TypeError('floorBps must be a finite number');
  }
  if (typeof ceilingBps !== 'number' || !Number.isFinite(ceilingBps)) {
    throw new TypeError('ceilingBps must be a finite number');
  }

  /** @type {Map<string, { estimator: ReturnType<createBandwidthEstimator>, selector: ReturnType<createLayerSelector> }>} */
  const children = new Map();

  /**
   * @param {string} childId
   * @param {Object} [childOptions]
   * @param {number} [childOptions.floorBps]
   * @param {number} [childOptions.ceilingBps]
   * @param {number} [childOptions.quietGainBps]
   * @param {number} [childOptions.initialEstimateBps]
   * @param {string} [childOptions.initialLayerId]
   */
  function registerChild(childId, childOptions = {}) {
    if (typeof childId !== 'string' || childId.trim() === '') {
      throw new TypeError('childId must be a non-empty string');
    }
    const floor = childOptions.floorBps ?? floorBps;
    const ceiling = childOptions.ceilingBps ?? ceilingBps;
    const estimator = createBandwidthEstimator({
      floorBps: floor,
      ceilingBps: ceiling,
      quietGainBps: childOptions.quietGainBps ?? quietGainBps,
      initialEstimateBps: childOptions.initialEstimateBps ?? initialEstimateBps ?? ceiling
    });
    const selector = createLayerSelector({
      profile,
      headroomFactor,
      downgradeHoldMs,
      upgradeHoldMs,
      initialLayerId: childOptions.initialLayerId ?? initialLayerId
    });
    children.set(childId.trim(), { estimator, selector });
    return selector.getLayerId();
  }

  /**
   * @param {string} childId
   * @param {import('./receiver-report').ReceiverReport} report
   */
  function observeChildReport(childId, report) {
    const state = children.get(childId);
    if (!state) {
      throw new Error(`Unknown relay child: ${childId}`);
    }
    const estimateBps = state.estimator.observe(report);
    const layerId = state.selector.selectLayer({
      estimateBps,
      nowMs: report.timestampMs
    });
    return { estimateBps, layerId };
  }

  /**
   * @param {string} childId
   * @returns {string | null}
   */
  function getChildLayer(childId) {
    const state = children.get(childId);
    return state ? state.selector.getLayerId() : null;
  }

  /**
   * Enhancement layers (L2, L1) drop before base L0 keyframes are withheld.
   * @param {string} childId
   * @param {object} chunk
   */
  function shouldForwardToChild(childId, chunk) {
    const state = children.get(childId);
    if (!state) {
      return true;
    }
    const targetLayer = state.selector.getLayerId();
    const layer = chunkLayerId(chunk);
    if (layer === 'L0' && chunk.keyframe === true) {
      return true;
    }
    return layerIndex(layer) <= layerIndex(targetLayer);
  }

  return {
    registerChild,
    observeChildReport,
    getChildLayer,
    shouldForwardToChild,
    chunkLayerId
  };
}

module.exports = {
  createRelayLayerPolicy,
  chunkLayerId
};