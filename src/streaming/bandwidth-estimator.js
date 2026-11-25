/**
 * Sender-side bandwidth estimate from receiver reports (#152 milestone 5).
 * @experimental
 */

const LOSS_THRESHOLD = 0.02;
const DECREASE_FACTOR = 0.85;

/**
 * @param {Object} options
 * @param {number} options.floorBps
 * @param {number} options.ceilingBps
 * @param {number} [options.quietGainBps]
 * @param {number} [options.initialEstimateBps]
 */
function createBandwidthEstimator({
  floorBps,
  ceilingBps,
  quietGainBps = 50_000,
  initialEstimateBps
}) {
  if (typeof floorBps !== 'number' || !Number.isFinite(floorBps) || floorBps < 0) {
    throw new TypeError('floorBps must be a non-negative finite number');
  }
  if (typeof ceilingBps !== 'number' || !Number.isFinite(ceilingBps) || ceilingBps < floorBps) {
    throw new TypeError('ceilingBps must be a finite number >= floorBps');
  }
  if (typeof quietGainBps !== 'number' || !Number.isFinite(quietGainBps) || quietGainBps < 0) {
    throw new TypeError('quietGainBps must be a non-negative finite number');
  }

  let estimateBps =
    typeof initialEstimateBps === 'number' && Number.isFinite(initialEstimateBps)
      ? initialEstimateBps
      : ceilingBps;
  estimateBps = Math.max(floorBps, Math.min(ceilingBps, estimateBps));

  /** @type {number | null} */
  let previousTimestampMs = null;
  /** @type {number | null} */
  let previousInterarrivalDelayMs = null;

  /**
   * @param {import('./receiver-report').ReceiverReport} report
   * @returns {number} updated estimate in bits per second
   */
  function observe(report) {
    if (!report || typeof report !== 'object') {
      throw new TypeError('report must be an object');
    }

    const measuredBps = Math.floor((report.bytesReceived * 8 * 1000) / report.intervalMs);
    const totalPackets = report.packetsReceived + report.packetsLost;
    const lossRate = totalPackets > 0 ? report.packetsLost / totalPackets : 0;

    let delayTrendPositive = false;
    if (previousTimestampMs !== null && previousInterarrivalDelayMs !== null) {
      const elapsed = report.timestampMs - previousTimestampMs;
      if (elapsed > 0 && report.interarrivalDelayMs > previousInterarrivalDelayMs) {
        delayTrendPositive = true;
      }
    }
    previousTimestampMs = report.timestampMs;
    previousInterarrivalDelayMs = report.interarrivalDelayMs;

    if (lossRate > LOSS_THRESHOLD || delayTrendPositive) {
      estimateBps = Math.floor(estimateBps * DECREASE_FACTOR);
    } else {
      estimateBps += quietGainBps;
    }

    estimateBps = Math.min(estimateBps, measuredBps, ceilingBps);
    estimateBps = Math.max(estimateBps, floorBps);
    return estimateBps;
  }

  function getEstimateBps() {
    return estimateBps;
  }

  return {
    observe,
    getEstimateBps
  };
}

module.exports = {
  LOSS_THRESHOLD,
  DECREASE_FACTOR,
  createBandwidthEstimator
};