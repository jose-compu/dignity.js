const {
  encodeRtcpCongestionFeedback,
  decodeRtcpCongestionFeedback,
  rfc8888MetricsToReceiverReports,
} = require('../../src');
const { RTCP_PT_PSFB, RTCP_FMT_CCFB } = require('../../src/streaming/rtcp-rfc8888');
const { createBandwidthEstimator } = require('../../src');

describe('RFC 8888 RTCP congestion feedback', () => {
  const specVector = {
    senderSsrc: 0x01020304,
    sourceSsrc: 0x0a0b0c0d,
    metrics: [
      { ssrc: 0x11111111, received: true, ecn: 0, arrivalTimeOffset24: 0x001234 },
      { ssrc: 0x22222222, received: false, ecn: 2, arrivalTimeOffset24: 0 }
    ]
  };

  test('round-trips spec-style metric block', () => {
    const bytes = encodeRtcpCongestionFeedback(specVector);
    expect(bytes[0] & 0x1f).toBe(RTCP_FMT_CCFB);
    expect(bytes[1]).toBe(RTCP_PT_PSFB);
    const decoded = decodeRtcpCongestionFeedback(bytes);
    expect(decoded).not.toBeNull();
    expect(decoded.senderSsrc).toBe(specVector.senderSsrc);
    expect(decoded.sourceSsrc).toBe(specVector.sourceSsrc);
    expect(decoded.metrics).toHaveLength(2);
    expect(decoded.metrics[0].received).toBe(true);
    expect(decoded.metrics[0].ecn).toBe(0);
    expect(decoded.metrics[0].arrivalTimeOffset24).toBe(0x001234);
    expect(decoded.metrics[1].received).toBe(false);
    expect(decoded.metrics[1].ecn).toBe(2);
  });

  test('adapter feeds createBandwidthEstimator', () => {
    const reports = rfc8888MetricsToReceiverReports({
      metrics: specVector.metrics,
      sessionId: 's',
      viewerId: 'v',
      layerId: 'L1',
      intervalMs: 200,
      timestampMs: 1000,
      bytesPerReceivedPacket: 900
    });
    expect(reports).toHaveLength(1);
    const estimator = createBandwidthEstimator({ floorBps: 100_000, ceilingBps: 5_000_000 });
    const before = estimator.getEstimateBps();
    const after = estimator.observe(reports[0]);
    expect(after).toBeLessThanOrEqual(before + 1);
    expect(reports[0].packetsReceived).toBe(1);
    expect(reports[0].packetsLost).toBe(1);
  });
});