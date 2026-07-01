#!/usr/bin/env node
/**
 * Reproducible in-memory benchmarks (#92).
 *
 * Usage:
 *   node scripts/run-benchmarks.js
 *   node scripts/run-benchmarks.js --write docs/benchmarks/results.json
 *   node scripts/run-benchmarks.js --quick   # smoke tier only (CI)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const GOSSIP_TIERS = [
  {
    name: 'gossip-100',
    subscribers: 100,
    publishers: 1,
    fanout: 3,
    maxHops: 8,
    publishCount: 1,
    bootstrapChain: true
  },
  {
    name: 'gossip-tiered-50',
    subscribers: 50,
    publishers: 2,
    fanout: 3,
    maxHops: 8,
    liveCap: 20,
    publishCount: 1,
    bootstrapChain: true
  }
];

const QUICK_GOSSIP_TIERS = [GOSSIP_TIERS[0]];

const INDEXEDDB_RECORD_COUNTS = [100, 1000, 2000];
const QUICK_INDEXEDDB_RECORD_COUNTS = [100];

function parseArgs(argv) {
  const options = { write: null, quick: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--write') {
      options.write = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--quick') {
      options.quick = true;
    }
  }
  return options;
}

async function benchmarkGossip(tiers) {
  const worker = path.join(__dirname, 'benchmark-gossip-tier.js');
  const results = [];

  for (const tier of tiers) {
    const proc = spawnSync(process.execPath, [worker, JSON.stringify(tier)], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024
    });

    if (proc.status !== 0) {
      throw new Error(proc.stderr || proc.stdout || `benchmark-gossip-tier failed for ${tier.name}`);
    }

    results.push(JSON.parse(proc.stdout.trim()));
  }

  return results;
}

async function benchmarkIndexedDBHydration(recordCounts) {
  require('fake-indexeddb/auto');
  const {
    DignityP2P,
    InMemoryNetworkHub,
    InMemoryNetworkAdapter,
    IndexedDBPersistence
  } = require('../src');

  const results = [];
  for (const count of recordCounts) {
    const dbName = `dignity-bench-hydrate-${count}-${Date.now()}`;
    const hub = new InMemoryNetworkHub();
    const writer = new DignityP2P({
      nodeId: 'bench-writer',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { powEnabled: false, signingEnabled: false, encryptionEnabled: false }
    });
    const persistence = new IndexedDBPersistence({ dbName });
    await writer.start();
    await persistence.attach(writer);

    for (let i = 0; i < count; i += 1) {
      await writer.create('bench', { index: i, payload: `record-${i}` }, { id: `r-${i}` });
    }
    await persistence.detach();
    await writer.stop();

    const reader = new DignityP2P({
      nodeId: 'bench-reader',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { powEnabled: false, signingEnabled: false, encryptionEnabled: false }
    });
    const restorePersistence = new IndexedDBPersistence({ dbName });
    await reader.start();
    await restorePersistence.attach(reader);

    const hydrateStartedAt = Date.now();
    await restorePersistence.hydrate();
    const hydrateMs = Date.now() - hydrateStartedAt;
    const restored = reader.list('bench').length;

    await restorePersistence.detach();
    await reader.stop();

    results.push({
      name: `indexeddb-hydrate-${count}`,
      recordCount: count,
      hydrateMs,
      recordsRestored: restored,
      msPerRecord: Number((hydrateMs / count).toFixed(3))
    });
  }
  return results;
}

async function runAllBenchmarks({ quick }) {
  const gossipTiers = quick ? QUICK_GOSSIP_TIERS : GOSSIP_TIERS;
  const recordCounts = quick ? QUICK_INDEXEDDB_RECORD_COUNTS : INDEXEDDB_RECORD_COUNTS;

  const gossip = await benchmarkGossip(gossipTiers);
  const indexeddb = await benchmarkIndexedDBHydration(recordCounts);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      quick
    },
    notes: [
      'Gossip benchmarks use InMemoryNetworkAdapter (simulated epidemic relay, not real WebRTC).',
      'Audience sizes: 100 plain gossip + 50 tiered CQRS (liveCap 20). 10k WebRTC peers not simulated in one process.',
      'heapUsedMb is process heap after the run (Node may retain allocated pages).',
      'IndexedDB hydration uses fake-indexeddb in Node; browser timings may differ.'
    ],
    gossip,
    indexeddb
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = await runAllBenchmarks(options);

  const json = JSON.stringify(report, null, 2);
  if (options.write) {
    const outPath = path.resolve(options.write);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${json}\n`, 'utf8');
    console.log(`Wrote ${outPath}`);
  } else {
    console.log(json);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runAllBenchmarks,
  benchmarkGossip,
  benchmarkIndexedDBHydration,
  GOSSIP_TIERS,
  INDEXEDDB_RECORD_COUNTS
};
