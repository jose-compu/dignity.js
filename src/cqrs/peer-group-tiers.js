const DEFAULT_LIVE_CAP = 5000;
const DEFAULT_BULK_INTERVAL_MS = 30000;

function assignPeerGroupTier({ joinIndex, liveCap = DEFAULT_LIVE_CAP, requestedTier, role }) {
  if (role === 'publisher') {
    return 'live';
  }

  if (requestedTier === 'live' || requestedTier === 'bulk') {
    if (requestedTier === 'live' && joinIndex >= liveCap) {
      return 'bulk';
    }
    return requestedTier;
  }

  return joinIndex < liveCap ? 'live' : 'bulk';
}

function getPeerTier(peer) {
  return peer?.metadata?.peerGroupTier || peer?.peerGroupTier || null;
}

function filterPeersByTier(peers, tier) {
  if (!tier) {
    return peers;
  }
  return peers.filter((peer) => getPeerTier(peer) === tier);
}

function countLivePeers(peers) {
  return peers.filter((peer) => getPeerTier(peer) === 'live').length;
}

function countBulkPeers(peers) {
  return peers.filter((peer) => getPeerTier(peer) === 'bulk').length;
}

module.exports = {
  DEFAULT_LIVE_CAP,
  DEFAULT_BULK_INTERVAL_MS,
  assignPeerGroupTier,
  getPeerTier,
  filterPeersByTier,
  countLivePeers,
  countBulkPeers
};
