const PEER_GROUP_SCOPE_PREFIX = 'gossip:';

const DEFAULT_PEER_GROUP_OPTIONS = {
  fanout: 3,
  maxActivePeers: 8,
  maxHops: 64,
  relayEnabled: true
};

function peerGroupScope(groupId) {
  if (!groupId) {
    throw new Error('peerGroupScope requires groupId');
  }
  return `${PEER_GROUP_SCOPE_PREFIX}${groupId}`;
}

function parsePeerGroupScope(scope) {
  if (!scope || !scope.startsWith(PEER_GROUP_SCOPE_PREFIX)) {
    return null;
  }
  return scope.slice(PEER_GROUP_SCOPE_PREFIX.length);
}

function shufflePeerIds(peerIds, randomFn = Math.random) {
  const list = [...peerIds];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function selectFanoutPeers({
  peers,
  count,
  excludePeerIds = [],
  connectedPeerIds = [],
  randomFn = Math.random
}) {
  const excluded = new Set(excludePeerIds.filter(Boolean));
  const candidates = peers
    .map((entry) => entry.peerId || entry)
    .filter((peerId) => peerId && !excluded.has(peerId));

  const connected = new Set(connectedPeerIds.filter(Boolean));
  const preferred = candidates.filter((peerId) => connected.has(peerId));
  const others = candidates.filter((peerId) => !connected.has(peerId));

  const ordered = [
    ...shufflePeerIds(preferred, randomFn),
    ...shufflePeerIds(others, randomFn)
  ];

  return ordered.slice(0, Math.max(0, count));
}

module.exports = {
  PEER_GROUP_SCOPE_PREFIX,
  DEFAULT_PEER_GROUP_OPTIONS,
  peerGroupScope,
  parsePeerGroupScope,
  shufflePeerIds,
  selectFanoutPeers
};
