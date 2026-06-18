const { runStress } = require('../../scripts/stress-peer-group');

const runStressTests = process.env.RUN_STRESS_TESTS === '1';

(runStressTests ? describe : describe.skip)('PeerGroup scale stress', () => {
  jest.setTimeout(120000);

  test('tier A: 100 subscribers in-memory', async () => {
    const summary = await runStress({
      subscribers: 100,
      fanout: 3,
      maxHops: 8,
      publishCount: 1,
      bootstrapChain: true
    });

    expect(summary.deliveryRatio).toBeGreaterThanOrEqual(0.9);
    expect(summary.deliveredCount).toBeGreaterThanOrEqual(90);
  });
});
