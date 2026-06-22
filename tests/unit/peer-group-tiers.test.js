const {
  DEFAULT_LIVE_CAP,
  assignPeerGroupTier,
  filterPeersByTier,
  countLivePeers
} = require('../../src/cqrs/peer-group-tiers');

describe('peer group tiers', () => {
  test('DEFAULT_LIVE_CAP is 5000', () => {
    expect(DEFAULT_LIVE_CAP).toBe(5000);
  });

  test('assignPeerGroupTier puts publisher in live tier', () => {
    expect(assignPeerGroupTier({ joinIndex: 9999, role: 'publisher' })).toBe('live');
  });

  test('assignPeerGroupTier auto assigns live under cap', () => {
    expect(assignPeerGroupTier({ joinIndex: 0, liveCap: 5, requestedTier: null })).toBe('live');
    expect(assignPeerGroupTier({ joinIndex: 4, liveCap: 5, requestedTier: null })).toBe('live');
    expect(assignPeerGroupTier({ joinIndex: 5, liveCap: 5, requestedTier: null })).toBe('bulk');
  });

  test('requested live tier downgrades when cap exceeded', () => {
    expect(assignPeerGroupTier({ joinIndex: 10, liveCap: 5, requestedTier: 'live' })).toBe('bulk');
  });

  test('filterPeersByTier filters presence metadata', () => {
    const peers = [
      { peerId: 'a', metadata: { peerGroupTier: 'live' } },
      { peerId: 'b', metadata: { peerGroupTier: 'bulk' } }
    ];

    expect(filterPeersByTier(peers, 'live')).toHaveLength(1);
    expect(filterPeersByTier(peers, 'live')[0].peerId).toBe('a');
    expect(countLivePeers(peers)).toBe(1);
  });
});
