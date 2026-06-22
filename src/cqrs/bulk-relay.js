const { getPeerTier } = require('./peer-group-tiers');

const DEFAULT_BULK_RELAY_COUNT = 3;

function electBulkRelays(peers, { count = DEFAULT_BULK_RELAY_COUNT } = {}) {
  const bulkPeers = peers
    .filter((peer) => getPeerTier(peer) === 'bulk')
    .map((peer) => peer.peerId || peer)
    .filter(Boolean)
    .sort();

  return bulkPeers.slice(0, Math.max(0, count));
}

function isBulkRelay(metadata) {
  return metadata?.bulkRelay === true;
}

function applyBulkRelayFlags(peers, relayPeerIds) {
  const relaySet = new Set(relayPeerIds);
  return peers.map((peer) => ({
    ...peer,
    metadata: {
      ...(peer.metadata || {}),
      bulkRelay: relaySet.has(peer.peerId)
    }
  }));
}

module.exports = {
  DEFAULT_BULK_RELAY_COUNT,
  electBulkRelays,
  isBulkRelay,
  applyBulkRelayFlags
};
