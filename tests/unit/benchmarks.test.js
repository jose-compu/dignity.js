const fs = require('fs');
const path = require('path');
const { runAllBenchmarks } = require('../../scripts/run-benchmarks');

const resultsPath = path.join(__dirname, '../../docs/benchmarks/results.json');

describe('benchmarks (#92)', () => {
  jest.setTimeout(120000);

  test('quick benchmark harness produces valid report', async () => {
    const report = await runAllBenchmarks({ quick: true });

    expect(report.schemaVersion).toBe(1);
    expect(report.gossip).toHaveLength(1);
    expect(report.indexeddb).toHaveLength(1);
    expect(report.gossip[0].deliveryRatio).toBeGreaterThan(0.8);
    expect(report.gossip[0].medianDeliveryMs).toBeGreaterThanOrEqual(0);
    expect(report.indexeddb[0].recordsRestored).toBe(100);
    expect(report.indexeddb[0].hydrateMs).toBeGreaterThanOrEqual(0);
  });

  test('checked-in results.json matches schema', () => {
    expect(fs.existsSync(resultsPath)).toBe(true);
    const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    expect(report.schemaVersion).toBe(1);
    expect(Array.isArray(report.gossip)).toBe(true);
    expect(Array.isArray(report.indexeddb)).toBe(true);
    expect(report.gossip.length).toBeGreaterThanOrEqual(2);
    expect(report.indexeddb.length).toBeGreaterThanOrEqual(3);

    for (const row of report.gossip) {
      expect(row.subscribers).toBeGreaterThan(0);
      expect(row.medianDeliveryMs).toBeGreaterThanOrEqual(0);
      expect(row.heapUsedMb).toBeGreaterThan(0);
    }

    for (const row of report.indexeddb) {
      expect(row.recordCount).toBeGreaterThan(0);
      expect(row.recordsRestored).toBe(row.recordCount);
    }
  });
});
