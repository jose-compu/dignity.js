const { createBandwidthEstimator, DECREASE_FACTOR } = require('../../src/streaming/bandwidth-estimator');
const { createReceiverReport } = require('../../src/streaming/receiver-report');

function report(fields) {
  return createReceiverReport({
    sessionId: 'live',
    viewerId: 'v1',
    layerId: 'L2',
    timestampMs: fields.timestampMs,
    intervalMs: fields.intervalMs ?? 1000,
    bytesReceived: fields.bytesReceived,
    packetsReceived: fields.packetsReceived ?? 1000,
    packetsLost: fields.packetsLost ?? 0,
    interarrivalDelayMs: fields.interarrivalDelayMs ?? 0
  });
}

describe('bandwidth estimator', () => {
  test('fixed script: high, congestion dip, floor, recovery', () => {
    const ceilingBps = 4_000_000;
    const floorBps = 400_000;
    const quietGainBps = 100_000;
    const estimator = createBandwidthEstimator({ floorBps, ceilingBps, quietGainBps, initialEstimateBps: ceilingBps });

    // High throughput — estimate tracks measured cap
    let est = estimator.observe(
      report({ timestampMs: 1000, bytesReceived: 500_000, interarrivalDelayMs: 2 })
    );
    expect(est).toBe(Math.min(ceilingBps, Math.floor((500_000 * 8 * 1000) / 1000)));

    est = estimator.observe(
      report({ timestampMs: 2000, bytesReceived: 500_000, interarrivalDelayMs: 1 })
    );
    const highMeasured = Math.floor((500_000 * 8 * 1000) / 1000);
    expect(est).toBe(Math.min(estimator.getEstimateBps(), highMeasured, ceilingBps));

    // Loss above 2% — multiplicative decrease
    const beforeCongestion = estimator.getEstimateBps();
    const congestedMeasured = Math.floor((200_000 * 8 * 1000) / 1000);
    est = estimator.observe(
      report({
        timestampMs: 3000,
        bytesReceived: 200_000,
        packetsReceived: 970,
        packetsLost: 30,
        interarrivalDelayMs: 1
      })
    );
    expect(est).toBe(
      Math.max(
        floorBps,
        Math.min(Math.floor(beforeCongestion * DECREASE_FACTOR), congestedMeasured, ceilingBps)
      )
    );

    // Quiet interval ramps toward measured throughput (capped)
    est = estimator.observe(
      report({
        timestampMs: 4000,
        bytesReceived: 60_000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    const measuredLow = Math.floor((60_000 * 8 * 1000) / 1000);
    expect(est).toBe(Math.min(estimator.getEstimateBps(), measuredLow, ceilingBps));
    expect(estimator.getEstimateBps()).toBeGreaterThanOrEqual(floorBps);

    // Recovery — sustained quiet high throughput
    est = estimator.observe(
      report({
        timestampMs: 5000,
        bytesReceived: 450_000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    const recoveryMeasured = Math.floor((450_000 * 8 * 1000) / 1000);
    expect(estimator.getEstimateBps()).toBe(Math.min(estimator.getEstimateBps(), recoveryMeasured, ceilingBps));
    expect(estimator.getEstimateBps()).toBeGreaterThan(500_000);
  });
});