#!/usr/bin/env node
/**
 * Run one gossip stress tier in an isolated process (avoids heap growth across tiers).
 * Usage: node scripts/benchmark-gossip-tier.js '{"name":"gossip-100",...}'
 */
const { runStress } = require('./stress-peer-group');

async function main() {
  const tier = JSON.parse(process.argv[2] || '{}');
  const startedAt = Date.now();
  const summary = await runStress({
    subscribers: tier.subscribers,
    publishers: tier.publishers,
    fanout: tier.fanout,
    maxHops: tier.maxHops,
    liveCap: tier.liveCap,
    publishCount: tier.publishCount,
    bootstrapChain: tier.bootstrapChain
  });

  const result = {
    name: tier.name,
    subscribers: tier.subscribers,
    deliveryRatio: summary.deliveryRatio,
    medianDeliveryMs: summary.medianDeliveryMs,
    p90DeliveryMs: summary.timeTo90PctMs,
    p99DeliveryMs: summary.timeTo99PctMs,
    joinDurationMs: summary.joinDurationMs,
    heapUsedMb: summary.heapUsedMb,
    heapPerSubscriberKb: Number(((summary.heapUsedMb * 1024) / tier.subscribers).toFixed(2)),
    peakSeenGossip: summary.peakSeenGossip,
    peakOpenConnections: summary.peakOpenConnections,
    durationMs: Date.now() - startedAt,
    nodeCount: tier.subscribers + tier.publishers
  };

  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
