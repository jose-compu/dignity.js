const {
  createPlayoutBuffer,
  createLayerSelector,
  createReceiverReport,
  DEFAULT_HEADROOM_FACTOR
} = require('../../src/streaming');
const { RENDITION_PROFILE_HD720, resolveRendition } = require('../../src/streaming/rendition-ladder');

function layerBitrateBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * DEFAULT_HEADROOM_FACTOR;
}

describe('playout buffer', () => {
  test('orders chunks by timestampMs then sequence', () => {
    const buffer = createPlayoutBuffer({ initialTargetDelayMs: 0 });
    buffer.push({ sequence: 2, timestampMs: 100 });
    buffer.push({ sequence: 0, timestampMs: 50 });
    buffer.push({ sequence: 1, timestampMs: 100 });
    const ready = buffer.drainReady(100);
    expect(ready.map((c) => c.sequence)).toEqual([0, 1, 2]);
  });

  test('raises target on loss before layer step-down is allowed', () => {
    const buffer = createPlayoutBuffer({ initialTargetDelayMs: 100, raiseStepMs: 40 });
    const selector = createLayerSelector({ profile: RENDITION_PROFILE_HD720, initialLayerId: 'L2' });
    const l2Bps = layerBitrateBps('L2');
    const l0Bps = layerBitrateBps('L0');

    buffer.notifyLayerStepDown();
    expect(buffer.mayStepDownLayer()).toBe(false);
    let layer = buffer.selectLayerWithBufferGuard(selector, { estimateBps: l0Bps - 1, nowMs: 0 });
    expect(layer).toBe('L2');

    const report = createReceiverReport({
      sessionId: 'buf',
      viewerId: 'v1',
      layerId: 'L2',
      timestampMs: 50,
      intervalMs: 1000,
      bytesReceived: 1000,
      packetsReceived: 100,
      packetsLost: 10,
      interarrivalDelayMs: 0
    });
    const target = buffer.observeReport(report);
    expect(target).toBe(140);
    expect(buffer.mayStepDownLayer()).toBe(true);

    buffer.selectLayerWithBufferGuard(selector, { estimateBps: l0Bps - 1, nowMs: 100 });
    layer = buffer.selectLayerWithBufferGuard(selector, { estimateBps: l0Bps - 1, nowMs: 350 });
    expect(layer).toBe('L1');
  });
});