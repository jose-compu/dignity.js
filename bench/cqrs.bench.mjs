import { bench, describe } from 'vitest';
import { require, seededRandom } from './helpers.mjs';

const nacl = require('tweetnacl');
const {
  operationToDomainEvent,
  signDomainEvent,
  verifyDomainEvent,
  verifyEventChain,
  buildCheckpoint,
  createEmptyView,
  applyDomainEventToView
} = require('../src/cqrs/domain-events');
const { selectFanoutPeers } = require('../src/gossip/peer-group');
const { electBulkRelays } = require('../src/cqrs/bulk-relay');
const { assignPeerGroupTier, filterPeersByTier } = require('../src/cqrs/peer-group-tiers');

const signingKeyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(32).fill(3));

function buildOperations(count) {
  const operations = [];
  for (let i = 0; i < count; i += 1) {
    const recordIndex = i % 50;
    const kind = i < 50 ? 'create' : 'update';
    operations.push({
      kind,
      collectionName: 'moves',
      id: `rec-${recordIndex}`,
      timestamp: 1_700_000_000_000 + i,
      baseVersion: kind === 'update' ? Math.floor(i / 50) : null,
      payload: { index: i, san: `e${i % 8}`, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }
    });
  }
  return operations;
}

function buildChain(operations) {
  const events = [];
  let prevHash = null;
  operations.forEach((operation, index) => {
    const event = operationToDomainEvent(operation, {
      publisherId: 'alice',
      groupId: 'feed:alice',
      prevHash,
      eventIdGenerator: () => `evt-${index}`
    });
    events.push(event);
    prevHash = event.eventHash;
  });
  return events;
}

const operations = buildOperations(200);
const chain = buildChain(operations);
const signedEvent = signDomainEvent(chain[0], signingKeyPair.secretKey);
const signingPublicKey = signingKeyPair.publicKey;

describe('domain events', () => {
  bench('build hash-linked chain (200 events)', () => {
    buildChain(operations);
  });

  bench('signDomainEvent', () => {
    signDomainEvent(chain[0], signingKeyPair.secretKey);
  });

  bench('verifyDomainEvent (signed)', () => {
    verifyDomainEvent(signedEvent, { signingPublicKey });
  });

  bench('verifyEventChain (200 events)', () => {
    verifyEventChain(chain);
  });

  bench('buildCheckpoint (200 events)', () => {
    buildCheckpoint('feed:alice', chain, { publisherId: 'alice' });
  });

  bench('project chain into view (200 events)', () => {
    const view = createEmptyView(['moves']);
    for (const event of chain) {
      applyDomainEventToView(view, event);
    }
  });
});

describe('peer group helpers', () => {
  const peers = Array.from({ length: 1000 }, (_, i) => ({
    peerId: `peer-${String(i).padStart(4, '0')}`,
    metadata: {
      peerGroupTier: assignPeerGroupTier({ joinIndex: i, liveCap: 100 })
    }
  }));
  const connectedPeerIds = peers.filter((_, i) => i % 7 === 0).map((peer) => peer.peerId);
  const excludePeerIds = ['peer-0001', 'peer-0002', 'peer-0003'];

  bench('selectFanoutPeers (1000 peers)', () => {
    selectFanoutPeers({
      peers,
      count: 8,
      excludePeerIds,
      connectedPeerIds,
      randomFn: seededRandom(7)
    });
  });

  bench('filterPeersByTier + electBulkRelays (1000 peers)', () => {
    filterPeersByTier(peers, 'live');
    electBulkRelays(peers, { count: 3 });
  });
});
