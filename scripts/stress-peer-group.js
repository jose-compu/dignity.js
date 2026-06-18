#!/usr/bin/env node
/**
 * PeerGroup gossip stress harness (issue #76).
 *
 * Usage:
 *   node scripts/stress-peer-group.js --subscribers 1000 --fanout 3 --maxHops 6
 *   RUN_STRESS_TESTS=1 npm run test:stress-peer-group
 */
const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../src');
const { fastTestSecurity, fastSleep } = require('../tests/helpers/fast-security');

function parseArgs(argv) {
  const options = {
    subscribers: 100,
    fanout: 3,
    maxHops: 6,
    publishCount: 1,
    bootstrapChain: true,
    json: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--subscribers') {
      options.subscribers = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--fanout') {
      options.fanout = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--maxHops') {
      options.maxHops = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--publishCount') {
      options.publishCount = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--no-chain') {
      options.bootstrapChain = false;
    }
  }

  return options;
}

function percentile(sorted, p) {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

async function runStress(options) {
  const hub = new InMemoryNetworkHub();
  const security = fastTestSecurity({ appPassword: 'stress-peer-group' });
  const nodeIds = Array.from({ length: options.subscribers }, (_, index) => `sub-${index}`);
  const nodes = new Map();
  const receivedAt = new Map(nodeIds.map((id) => [id, null]));
  const duplicateCounts = new Map(nodeIds.map((id) => [id, 0]));
  const warnings = [];

  const startedAt = Date.now();

  for (let index = 0; index < nodeIds.length; index += 1) {
    const id = nodeIds[index];
    const node = new DignityP2P({
      nodeId: id,
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    node.on('warning', (event) => warnings.push({ nodeId: id, ...event }));
    node.on('peergroupmessage', (event) => {
      if (event.type !== 'timeline:stress') {
        return;
      }
      if (event.payload?.seq !== 1) {
        return;
      }
      if (receivedAt.get(id) !== null) {
        duplicateCounts.set(id, duplicateCounts.get(id) + 1);
        return;
      }
      receivedAt.set(id, Date.now());
    });
    await node.start();
    nodes.set(id, node);
  }

  const joinStartedAt = Date.now();
  await Promise.all(nodeIds.map((id, index) => {
    const bootstrapPeerIds = options.bootstrapChain && index > 0
      ? [nodeIds[index - 1]]
      : undefined;
    return nodes.get(id).joinPeerGroup('stress:feed', {
      bootstrapPeerIds,
      fanout: options.fanout,
      maxActivePeers: Math.max(8, options.fanout * 2),
      maxHops: options.maxHops,
      metadata: { role: 'subscriber' }
    });
  }));
  const joinDurationMs = Date.now() - joinStartedAt;

  await fastSleep(Math.min(50, Math.max(10, Math.floor(options.subscribers / 50))));

  const publishStartedAt = Date.now();
  const publisher = nodes.get(nodeIds[0]);
  for (let publishIndex = 0; publishIndex < options.publishCount; publishIndex += 1) {
    await publisher.publishToPeerGroup('stress:feed', 'timeline:stress', { seq: 1 }, {
      fanout: options.fanout,
      maxHops: options.maxHops
    });
  }
  const publishDurationMs = Date.now() - publishStartedAt;

  const deadline = Date.now() + Math.max(5000, options.subscribers * 20);
  while (Date.now() < deadline) {
    const delivered = nodeIds.filter((id) => receivedAt.get(id) !== null).length;
    if (delivered >= nodeIds.length) {
      break;
    }
    await fastSleep(25);
  }

  const deliveryTimes = nodeIds
    .map((id) => receivedAt.get(id))
    .filter((value) => value !== null)
    .map((value) => value - publishStartedAt)
    .sort((a, b) => a - b);

  const deliveredCount = deliveryTimes.length;
  const deliveryRatio = deliveredCount / nodeIds.length;
  const peakSeenGossip = Math.max(...nodeIds.map((id) => nodes.get(id).getPeerGroupStats().seenGossipCount));
  const peakOpenConnections = Math.max(...nodeIds.map((id) => nodes.get(id).getPeerGroupStats().openConnectionCount));
  const heapUsedMb = process.memoryUsage().heapUsed / (1024 * 1024);
  const duplicateGossipEvents = [...duplicateCounts.values()].reduce((sum, count) => sum + count, 0);

  for (const node of nodes.values()) {
    await node.stop();
  }

  const summary = {
    subscribers: options.subscribers,
    fanout: options.fanout,
    maxHops: options.maxHops,
    publishCount: options.publishCount,
    bootstrapChain: options.bootstrapChain,
    deliveryRatio,
    deliveredCount,
    joinDurationMs,
    publishDurationMs,
    totalDurationMs: Date.now() - startedAt,
    timeTo90PctMs: percentile(deliveryTimes, 90),
    timeTo99PctMs: percentile(deliveryTimes, 99),
    medianDeliveryMs: percentile(deliveryTimes, 50),
    peakSeenGossip,
    peakOpenConnections,
    heapUsedMb: Number(heapUsedMb.toFixed(2)),
    duplicateGossipEvents,
    warningCount: warnings.length,
    warnings: warnings.slice(0, 10)
  };

  return summary;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = await runStress(options);

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log('PeerGroup stress summary');
  console.log('------------------------');
  for (const [key, value] of Object.entries(summary)) {
    if (key === 'warnings') {
      continue;
    }
    console.log(`${key}: ${value}`);
  }
  if (summary.warnings.length > 0) {
    console.log('sample warnings:', summary.warnings);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runStress, parseArgs };
