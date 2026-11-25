const { createLayerSelector, DEFAULT_HEADROOM_FACTOR } = require('../../src/streaming/layer-selector');
const { RENDITION_PROFILE_HD720, resolveRendition } = require('../../src/streaming/rendition-ladder');

function layerBitrateBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * DEFAULT_HEADROOM_FACTOR;
}

describe('layer selector', () => {
  test('hysteresis: hold L2 on short dip, step down, slow upgrade', () => {
    const selector = createLayerSelector({
      profile: RENDITION_PROFILE_HD720,
      initialLayerId: 'L2'
    });

    const l2Bps = layerBitrateBps('L2');
    const l1Bps = layerBitrateBps('L1');
    const l0Bps = layerBitrateBps('L0');

    expect(selector.selectLayer({ estimateBps: l2Bps, nowMs: 0 })).toBe('L2');

    // Short dip below L1 — still L2 within downgrade hold
    expect(selector.selectLayer({ estimateBps: l1Bps - 1, nowMs: 50 })).toBe('L2');
    expect(selector.selectLayer({ estimateBps: l1Bps - 1, nowMs: 199 })).toBe('L2');

    // After downgrade hold — one step to L1
    expect(selector.selectLayer({ estimateBps: l1Bps - 1, nowMs: 250 })).toBe('L1');

    // Further below L0 threshold — step to L0
    expect(selector.selectLayer({ estimateBps: l0Bps - 1, nowMs: 500 })).toBe('L0');
    expect(selector.selectLayer({ estimateBps: l0Bps - 1, nowMs: 750 })).toBe('L0');

    // Recovery to L2 affordability — upgrade hold keeps L0 until 1000 ms elapses on pending target
    expect(selector.selectLayer({ estimateBps: l2Bps, nowMs: 800 })).toBe('L0');
    expect(selector.selectLayer({ estimateBps: l2Bps, nowMs: 1599 })).toBe('L0');
    expect(selector.selectLayer({ estimateBps: l2Bps, nowMs: 1800 })).toBe('L1');

    expect(selector.selectLayer({ estimateBps: l2Bps, nowMs: 2799 })).toBe('L1');
    expect(selector.selectLayer({ estimateBps: l2Bps, nowMs: 2800 })).toBe('L2');
  });
});