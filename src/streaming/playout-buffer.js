/**
 * Viewer-side jitter / playout buffer with congestion-aware target delay (#152 milestone 5).
 * @experimental
 */

const { LOSS_THRESHOLD } = require('./bandwidth-estimator');
const { LAYER_IDS } = require('./rendition-ladder');

const DEFAULT_INITIAL_TARGET_DELAY_MS = 80;
const DEFAULT_MAX_TARGET_DELAY_MS = 2000;
const DEFAULT_RAISE_STEP_MS = 60;

/**
 * @param {Object} [options]
 * @param {number} [options.initialTargetDelayMs]
 * @param {number} [options.maxTargetDelayMs]
 * @param {number} [options.raiseStepMs]
 */
function createPlayoutBuffer(options = {}) {
  const initialTargetDelayMs = options.initialTargetDelayMs ?? DEFAULT_INITIAL_TARGET_DELAY_MS;
  const maxTargetDelayMs = options.maxTargetDelayMs ?? DEFAULT_MAX_TARGET_DELAY_MS;
  const raiseStepMs = options.raiseStepMs ?? DEFAULT_RAISE_STEP_MS;

  let targetDelayMs = initialTargetDelayMs;
  let stepDownPermitted = true;

  /** @type {Array<{ chunk: object, timestampMs: number, sequence: number }>} */
  const pending = [];

  /** @type {number | null} */
  let previousReportTimestampMs = null;
  /** @type {number | null} */
  let previousInterarrivalDelayMs = null;

  /**
   * @param {import('./receiver-report').ReceiverReport} report
   * @returns {number} updated target delay in milliseconds
   */
  function observeReport(report) {
    if (!report || typeof report !== 'object') {
      throw new TypeError('report must be an object');
    }

    const totalPackets = report.packetsReceived + report.packetsLost;
    const lossRate = totalPackets > 0 ? report.packetsLost / totalPackets : 0;

    let delayTrendPositive = false;
    if (previousReportTimestampMs !== null && previousInterarrivalDelayMs !== null) {
      const elapsed = report.timestampMs - previousReportTimestampMs;
      if (elapsed > 0 && report.interarrivalDelayMs > previousInterarrivalDelayMs) {
        delayTrendPositive = true;
      }
    }
    previousReportTimestampMs = report.timestampMs;
    previousInterarrivalDelayMs = report.interarrivalDelayMs;

    if (lossRate > LOSS_THRESHOLD || delayTrendPositive) {
      targetDelayMs = Math.min(maxTargetDelayMs, targetDelayMs + raiseStepMs);
      stepDownPermitted = true;
    }
    return targetDelayMs;
  }

  function mayStepDownLayer() {
    return stepDownPermitted;
  }

  function notifyLayerStepDown() {
    stepDownPermitted = false;
  }

  function getTargetDelayMs() {
    return targetDelayMs;
  }

  /**
   * @param {object} chunk signed media chunk envelope
   */
  function push(chunk) {
    if (!chunk || typeof chunk !== 'object') {
      throw new TypeError('chunk must be an object');
    }
    pending.push({
      chunk,
      timestampMs: typeof chunk.timestampMs === 'number' ? chunk.timestampMs : 0,
      sequence: typeof chunk.sequence === 'number' ? chunk.sequence : 0
    });
    pending.sort((a, b) => a.timestampMs - b.timestampMs || a.sequence - b.sequence);
  }

  /**
   * @param {number} playoutNowMs injected clock
   * @returns {object[]}
   */
  function drainReady(playoutNowMs) {
    if (typeof playoutNowMs !== 'number' || !Number.isFinite(playoutNowMs)) {
      throw new TypeError('playoutNowMs must be a finite number');
    }
    const cutoff = playoutNowMs - targetDelayMs;
    const ready = [];
    while (pending.length > 0 && pending[0].timestampMs <= cutoff) {
      ready.push(pending.shift().chunk);
    }
    return ready;
  }

  function layerIndex(layerId) {
    const i = LAYER_IDS.indexOf(layerId);
    return i >= 0 ? i : 0;
  }

  /**
   * Layer step-down is blocked until a congestion signal raised the playout target.
   * @param {ReturnType<import('./layer-selector').createLayerSelector>} selector
   * @param {{ estimateBps: number, nowMs: number, keyframeByLayer?: object }} input
   * @returns {string}
   */
  function selectLayerWithBufferGuard(selector, input) {
    const current = selector.getLayerId();
    const affordable = selector.highestAffordableLayer(input.estimateBps);
    const isDowngrade = layerIndex(affordable) < layerIndex(current);
    if (isDowngrade && !mayStepDownLayer()) {
      return current;
    }
    const next = selector.selectLayer(input);
    if (layerIndex(next) < layerIndex(current)) {
      notifyLayerStepDown();
    }
    return next;
  }

  return {
    observeReport,
    mayStepDownLayer,
    notifyLayerStepDown,
    getTargetDelayMs,
    push,
    drainReady,
    selectLayerWithBufferGuard
  };
}

module.exports = {
  DEFAULT_INITIAL_TARGET_DELAY_MS,
  DEFAULT_MAX_TARGET_DELAY_MS,
  DEFAULT_RAISE_STEP_MS,
  createPlayoutBuffer
};