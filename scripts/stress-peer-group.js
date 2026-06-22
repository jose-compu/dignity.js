#!/usr/bin/env node
/**
 * PeerGroup gossip stress harness (issue #76, #81).
 *
 * Usage:
 *   node scripts/stress-peer-group.js --subscribers 1000 --fanout 3 --maxHops 64
 *   node scripts/stress-peer-group.js --publishers 2 --liveCap 50 --domainEvents
 *   RUN_STRESS_TESTS=1 npm run test:stress-peer-group
 */
const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../src');
const { fastTestSecurity, fastSleep } = require('../tests/helpers/fast-security');

function parseArgs(argv) {
  const options = {
    subscribers: 100,
    publishers: 1,
    fanout: 3,
    maxHops: 64,
    publishCount: 1,
    bootstrapChain: true,
    liveCap: 5000,
    bulkOnly: false,
    domainEvents: false,
    json: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--subscribers') {
      options.subscribers = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--publishers') {
      options.publishers = Number(argv[index + 1]);
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
    } else if (arg === '--liveCap') {
      options.liveCap = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--bulkOnly') {
      options.bulkOnly = true;
    } else if (arg === '--domainEvents') {
      options.domainEvents = true;
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
  const publisherIds = Array.from({ length: options.publishers }, (_, index) => `pub-${index}`);
  const subscriberIds = Array.from({ length: options.subscribers }, (_, index) => `sub-${index}`);
  const allNodeIds = [...publisherIds, ...subscriberIds];
  const nodes = new Map();
  const receivedAt = new Map(subscriberIds.map((id) => [id, null]));
  const receivedTier = new Map(subscriberIds.map((id) => [id, null]));
  const duplicateCounts = new Map(subscriberIds.map((id) => [id, 0]));
  const chainVerifyPass = new Map(subscriberIds.map((id) => [id, null]));
  const warnings = [];

  const startedAt = Date.now();
  const tiered = options.liveCap > 0 || options.bulkOnly || options.domainEvents;

  for (const id of allNodeIds) {
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
      if (!subscriberIds.includes(id)) {
        return;
      }
      if (receivedAt.get(id) !== null) {
        duplicateCounts.set(id, duplicateCounts.get(id) + 1);
        return;
      }
      receivedAt.set(id, Date.now());
      const config = node.getPeerGroupConfig('stress:feed');
      receivedTier.set(id, config?.peerGroupTier || 'unknown');
    });
    node.on('domainevent', () => {
      if (!subscriberIds.includes(id)) {
        return;
      }
      const log = node.domainEventLogs?.get?.('stress:feed') || [];
      if (log.length > 0) {
        const { verifyEventChain } = require('../src/cqrs/domain-events');
        chainVerifyPass.set(id, verifyEventChain(log).ok);
      }
    });
    await node.start();
    nodes.set(id, node);
  }

  const joinStartedAt = Date.now();

  for (let pubIndex = 0; pubIndex < publisherIds.length; pubIndex += 1) {
    const id = publisherIds[pubIndex];
    await nodes.get(id).joinPeerGroup(`stress:feed`, {
      role: 'publisher',
      tiered,
      liveCap: options.liveCap,
      fanout: options.fanout,
      maxActivePeers: Math.max(8, options.fanout * 2),
      maxHops: options.maxHops,
      domainEvents: options.domainEvents
    });
  }

  await Promise.all(subscriberIds.map((id, index) => {
    const bootstrapPeerIds = options.bootstrapChain
      ? [publisherIds[0], ...(index > 0 ? [subscriberIds[index - 1]] : [])]
      : [publisherIds[0]];
    return nodes.get(id).joinPeerGroup('stress:feed', {
      role: 'subscriber',
      tiered,
      liveCap: options.liveCap,
      tierMode: options.bulkOnly ? 'bulk' : 'auto',
      bootstrapPeerIds,
      fanout: options.fanout,
      maxActivePeers: Math.max(8, options.fanout * 2),
      maxHops: options.maxHops,
      commandCapable: !options.domainEvents
    });
  }));
  const joinDurationMs = Date.now() - joinStartedAt;

  await fastSleep(Math.min(100, Math.max(20, Math.floor(options.subscribers / 20))));

  const publishStartedAt = Date.now();
  const publisher = nodes.get(publisherIds[0]);

  if (options.domainEvents) {
    await publisher.create('stress', { seq: 1, note: 'domain-event stress' }, {
      id: 'stress-1',
      peerGroupId: 'stress:feed'
    });
  } else {
    for (let publishIndex = 0; publishIndex < options.publishCount; publishIndex += 1) {
      await publisher.publishToPeerGroup('stress:feed', 'timeline:stress', { seq: 1 }, {
        fanout: options.fanout,
        maxHops: options.maxHops
      });
      if (tiered) {
        await publisher.publishPeerGroupBulk('stress:feed', 'timeline:stress', { seq: 1 }, {
          fanout: options.fanout,
          maxHops: options.maxHops
        });
      }
    }
  }

  const publishDurationMs = Date.now() - publishStartedAt;

  const deadline = Date.now() + Math.max(5000, options.subscribers * 30);
  while (Date.now() < deadline) {
    const delivered = subscriberIds.filter((id) => receivedAt.get(id) !== null).length;
    const domainDelivered = options.domainEvents
      ? subscriberIds.filter((id) => {
        const log = nodes.get(id).domainEventLogs?.get?.('stress:feed') || [];
        return log.length > 0;
      }).length
      : delivered;

    if (options.domainEvents ? domainDelivered >= subscriberIds.length : delivered >= subscriberIds.length) {
      break;
    }
    await fastSleep(25);
  }

  const deliveryTimes = subscriberIds
    .map((id) => receivedAt.get(id))
    .filter((value) => value !== null)
    .map((value) => value - publishStartedAt)
    .sort((a, b) => a - b);

  const liveDelivered = subscriberIds.filter((id) => receivedTier.get(id) === 'live' && receivedAt.get(id)).length;
  const bulkDelivered = subscriberIds.filter((id) => receivedTier.get(id) === 'bulk' && receivedAt.get(id)).length;
  const deliveredCount = options.domainEvents
    ? subscriberIds.filter((id) => (nodes.get(id).domainEventLogs?.get?.('stress:feed') || []).length > 0).length
    : deliveryTimes.length;
  const deliveryRatio = deliveredCount / subscriberIds.length;
  const peakSeenGossip = Math.max(...allNodeIds.map((id) => nodes.get(id).getPeerGroupStats().seenGossipCount));
  const peakOpenConnections = Math.max(...allNodeIds.map((id) => nodes.get(id).getPeerGroupStats().openConnectionCount));
  const heapUsedMb = process.memoryUsage().heapUsed / (1024 * 1024);
  const duplicateGossipEvents = [...duplicateCounts.values()].reduce((sum, count) => sum + count, 0);
  const chainPassCount = [...chainVerifyPass.values()].filter((value) => value === true).length;

  for (const node of nodes.values()) {
    await node.stop();
  }

  const summary = {
    subscribers: options.subscribers,
    publishers: options.publishers,
    fanout: options.fanout,
    maxHops: options.maxHops,
    liveCap: options.liveCap,
    domainEvents: options.domainEvents,
    publishCount: options.publishCount,
    bootstrapChain: options.bootstrapChain,
    deliveryRatio,
    deliveredCount,
    liveDelivered,
    bulkDelivered,
    chainVerifyPassRate: options.domainEvents ? chainPassCount / subscriberIds.length : null,
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
