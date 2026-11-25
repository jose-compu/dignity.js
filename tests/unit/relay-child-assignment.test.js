const {
  assignRelayChildBudget,
  selectRelayChildren,
  assignRelayChildren
} = require('../../src/streaming/relay-child-assignment');

describe('assignRelayChildBudget', () => {
  test('floors low uplink and zero uplink to leaf', () => {
    expect(assignRelayChildBudget({ uplinkBps: 0, forwardLayerBps: 500_000, maxDegree: 16 })).toBe(0);
    expect(assignRelayChildBudget({ uplinkBps: 400_000, forwardLayerBps: 500_000, maxDegree: 16 })).toBe(0);
  });

  test('divides uplink by forward bitrate and caps at maxDegree', () => {
    expect(assignRelayChildBudget({ uplinkBps: 10_000_000, forwardLayerBps: 1_000_000, maxDegree: 16 })).toBe(10);
    expect(assignRelayChildBudget({ uplinkBps: 100_000_000, forwardLayerBps: 1_000_000, maxDegree: 16 })).toBe(16);
  });

  test('rejects invalid forward bitrate', () => {
    expect(assignRelayChildBudget({ uplinkBps: 5_000_000, forwardLayerBps: 0, maxDegree: 16 })).toBe(0);
  });

  test('maxDegree zero yields no children', () => {
    expect(assignRelayChildBudget({ uplinkBps: 10_000_000, forwardLayerBps: 1, maxDegree: 0 })).toBe(0);
  });
});

describe('selectRelayChildren', () => {
  test('returns first N ids deterministically', () => {
    expect(selectRelayChildren(['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
    expect(selectRelayChildren(['a', 'b', 'c'], 0)).toEqual([]);
  });

  test('requires an array of child ids', () => {
    expect(() => selectRelayChildren(null, 1)).toThrow(/childIds must be an array/);
  });
});

describe('assignRelayChildren', () => {
  test('requires peers array and string ids', () => {
    expect(() => assignRelayChildren({ peers: null, forwardLayerBps: 1 })).toThrow(/peers must be an array/);
    expect(() =>
      assignRelayChildren({ peers: [{ id: 7, uplinkBps: 1 }], forwardLayerBps: 1 })
    ).toThrow(/string id/);
  });

  test('maps peers to budgets in order', () => {
    const rows = assignRelayChildren({
      peers: [
        { id: 'low', uplinkBps: 400_000 },
        { id: 'mid', uplinkBps: 8_000_000 },
        { id: 'high', uplinkBps: 80_000_000 }
      ],
      forwardLayerBps: 2_000_000,
      maxDegree: 16
    });
    expect(rows.map((r) => r.childBudget)).toEqual([0, 4, 16]);
  });
});