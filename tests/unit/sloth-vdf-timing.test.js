const VDF = require('../../src/security/vdf');

jest.setTimeout(180000);

describe('Sloth VDF timing calibration', () => {
  test('measures local runtime and recommends powSteps for ~1000ms target', async () => {
    const targetMs = 1000;
    const challenge = 'ab'.repeat(32);
    const warmupSteps = 2n;

    await VDF.compute(challenge, warmupSteps);

    const candidates = [2, 4, 8, 12, 16, 24, 32, 48, 64];
    const samplesPerCandidate = 2;
    const measurements = [];

    for (const stepCount of candidates) {
      const timings = [];

      for (let sample = 0; sample < samplesPerCandidate; sample += 1) {
        const start = process.hrtime.bigint();
        await VDF.compute(challenge, BigInt(stepCount));
        const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
        timings.push(elapsedMs);
      }

      const avgMs = timings.reduce((sum, ms) => sum + ms, 0) / timings.length;
      measurements.push({
        steps: stepCount,
        avgMs,
        msPerStep: avgMs / stepCount
      });
    }

    const closest = measurements.reduce((best, current) => {
      if (!best) {
        return current;
      }

      const bestDelta = Math.abs(best.avgMs - targetMs);
      const currentDelta = Math.abs(current.avgMs - targetMs);
      return currentDelta < bestDelta ? current : best;
    }, null);

    const avgMsPerStep =
      measurements.reduce((sum, m) => sum + m.msPerStep, 0) / measurements.length;
    const estimatedSteps = Math.max(1, Math.round(targetMs / avgMsPerStep));

    console.log('\n[Sloth calibration] targetMs=', targetMs);
    console.table(
      measurements.map((m) => ({
        steps: m.steps,
        avgMs: Number(m.avgMs.toFixed(2)),
        msPerStep: Number(m.msPerStep.toFixed(2))
      }))
    );
    console.log(
      `[Sloth calibration] closestMeasured=${closest.steps} steps (${closest.avgMs.toFixed(2)}ms), estimatedPowSteps=${estimatedSteps}`
    );

    expect(estimatedSteps).toBeGreaterThan(0);
    expect(closest).not.toBeNull();
  });
});
