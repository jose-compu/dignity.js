const fs = require('fs');
const path = require('path');

const {
  runScaleSimulation,
  DEFAULT_SEED,
  PEER_CAP,
  analyticHops,
  interiorRelays,
  repairMs,
  pathBreakProbability
} = require('../../src/streaming/scale-simulation');

const CI_BENCHMARK = path.join(__dirname, '../../docs/benchmarks/scale-simulation.json');

describe('runScaleSimulation', () => {
  test('same seed and profile returns deep-equal output', () => {
    const a = runScaleSimulation({ seed: DEFAULT_SEED, profile: 'ci' });
    const b = runScaleSimulation({ seed: DEFAULT_SEED, profile: 'ci' });
    expect(a).toEqual(b);
  });

  test('matches committed ci benchmark JSON', () => {
    const live = runScaleSimulation({ seed: DEFAULT_SEED, profile: 'ci' });
    const committed = JSON.parse(fs.readFileSync(CI_BENCHMARK, 'utf8'));
    expect(live).toEqual(committed);
  });

  test('hop table matches design doc', () => {
    expect(analyticHops(10_000, 8)).toBe(5);
    expect(analyticHops(1_000_000, 12)).toBe(6);
    expect(analyticHops(10_000_000, 16)).toBe(6);

    const result = runScaleSimulation({ seed: DEFAULT_SEED, profile: 'ci' });
    const row10M = result.targets.find((t) => t.viewers === 10_000_000);
    expect(row10M.hops).toBe(6);
    expect(row10M.degree).toBe(16);
  });

  test('interior relay formula at 10M degree 16', () => {
    expect(interiorRelays(10_000_000, 16)).toBeCloseTo(666666.6, 4);
    const result = runScaleSimulation();
    expect(result.interiorRelays).toBeCloseTo(666666.6, 4);
  });

  test('repair series and depth-6 sibling budget with seed 1520714', () => {
    expect(repairMs(6)).toBe(1480);
    expect(pathBreakProbability(6)).toBeCloseTo(1 - (1 - 0.001) ** 6, 10);

    const result = runScaleSimulation({ seed: DEFAULT_SEED, profile: 'ci' });
    const depth6 = result.repair.series.find((row) => row.depth === 6);
    expect(depth6.repairMs).toBe(1480);
    expect(depth6.withinSiblingOverlapBudget).toBe(true);
  });

  test('origin required bps and claim checks at 10M scale row', () => {
    const result = runScaleSimulation({ seed: DEFAULT_SEED, profile: 'ci' });
    expect(result.origin.degree).toBe(16);
    expect(result.origin.covers).toBe(true);
    expect(result.claim.status === 'topology' || result.claim.status === 'qualified').toBe(true);
    if (result.claim.status === 'qualified') {
      expect(Array.isArray(result.claim.failedChecks)).toBe(true);
      expect(result.claim.failedChecks.length).toBeGreaterThan(0);
    }
  });

  test('chunk verify passes and tampered payload fails', () => {
    const result = runScaleSimulation();
    expect(result.chunk.verified).toBe(true);
    expect(result.chunk.tamperedVerified).toBe(false);
  });

  test('ci profile constructs at most 256 peers', () => {
    const result = runScaleSimulation({ profile: 'ci' });
    expect(result.stall.peersConstructed).toBeLessThanOrEqual(PEER_CAP.ci);
  });

  test('rejects unknown profile', () => {
    expect(() => runScaleSimulation({ profile: 'prod' })).toThrow(/profile must be/);
  });

  test('analytic edge cases for hops and path break', () => {
    expect(analyticHops(1, 16)).toBe(0);
    expect(pathBreakProbability(0)).toBe(0);
    expect(repairMs(0)).toBe(1000);
  });

  test('output JSON shape has no timestamp fields at top level', () => {
    const result = runScaleSimulation();
    expect(result).toEqual(
      expect.objectContaining({
        seed: DEFAULT_SEED,
        profile: 'ci',
        targets: expect.any(Array),
        repair: expect.any(Object),
        stall: expect.any(Object),
        origin: expect.any(Object),
        chunk: expect.any(Object),
        claim: expect.any(Object)
      })
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/timestamp/i);
  });
});