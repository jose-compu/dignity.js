const { runStress } = require('../../scripts/stress-peer-group');

const runStressTests = process.env.RUN_STRESS_TESTS === '1';

(runStressTests ? describe : describe.skip)('PeerGroup scale stress', () => {
  jest.setTimeout(120000);

  test('tier A: 100 subscribers in-memory', async () => {
    const summary = await runStress({
      subscribers: 100,
      publishers: 1,
      fanout: 3,
      maxHops: 8,
      publishCount: 1,
      bootstrapChain: true
    });

    expect(summary.deliveryRatio).toBeGreaterThanOrEqual(0.9);
    expect(summary.deliveredCount).toBeGreaterThanOrEqual(90);
  });

  test('tier B: 50 subscribers with 2 publishers and live cap', async () => {
    const summary = await runStress({
      subscribers: 50,
      publishers: 2,
      fanout: 3,
      maxHops: 8,
      liveCap: 20,
      publishCount: 1,
      bootstrapChain: true
    });

    expect(summary.deliveryRatio).toBeGreaterThanOrEqual(0.8);
    expect(summary.liveDelivered + summary.bulkDelivered).toBeGreaterThan(0);
  });

  test('tier C: domain events with 20 subscribers', async () => {
    const summary = await runStress({
      subscribers: 20,
      publishers: 1,
      fanout: 2,
      maxHops: 6,
      liveCap: 10,
      domainEvents: true,
      bootstrapChain: true
    });

    expect(summary.deliveryRatio).toBeGreaterThanOrEqual(0.7);
  });
});
