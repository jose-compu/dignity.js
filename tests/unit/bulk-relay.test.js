const {
  DEFAULT_BULK_RELAY_COUNT,
  electBulkRelays,
  isBulkRelay,
  applyBulkRelayFlags
} = require('../../src/cqrs/bulk-relay');

describe('bulk-relay', () => {
  test('electBulkRelays picks bulk tier peers sorted and capped', () => {
    const peers = [
      { peerId: 'z-bulk', metadata: { peerGroupTier: 'bulk' } },
      { peerId: 'a-bulk', metadata: { peerGroupTier: 'bulk' } },
      { peerId: 'live-1', metadata: { peerGroupTier: 'live' } },
      { peerId: 'm-bulk', metadata: { peerGroupTier: 'bulk' } }
    ];

    expect(electBulkRelays(peers, { count: 2 })).toEqual(['a-bulk', 'm-bulk']);
    expect(electBulkRelays(peers, { count: 0 })).toEqual([]);
    expect(DEFAULT_BULK_RELAY_COUNT).toBe(3);
  });

  test('electBulkRelays accepts string peer ids', () => {
    expect(electBulkRelays([{ peerId: 'b', metadata: { peerGroupTier: 'bulk' } }]))
      .toEqual(['b']);
  });

  test('isBulkRelay reads metadata flag', () => {
    expect(isBulkRelay({ bulkRelay: true })).toBe(true);
    expect(isBulkRelay({ bulkRelay: false })).toBe(false);
    expect(isBulkRelay(null)).toBe(false);
  });

  test('applyBulkRelayFlags marks relay peers', () => {
    const peers = [
      { peerId: 'a', metadata: { role: 'sub' } },
      { peerId: 'b', metadata: {} }
    ];
    const flagged = applyBulkRelayFlags(peers, ['b']);
    expect(flagged[0].metadata.bulkRelay).toBe(false);
    expect(flagged[1].metadata.bulkRelay).toBe(true);
  });

  test('electBulkRelays handles tier on peer root and negative count', () => {
    const peers = [
      { peerId: 'z', peerGroupTier: 'bulk' },
      { peerId: 'a', metadata: { peerGroupTier: 'bulk' } }
    ];
    expect(electBulkRelays(peers, { count: -1 })).toEqual([]);
    expect(electBulkRelays(peers)).toEqual(['a', 'z']);
  });

  test('applyBulkRelayFlags preserves peers without metadata', () => {
    const flagged = applyBulkRelayFlags([{ peerId: 'solo' }], []);
    expect(flagged[0].metadata).toEqual({ bulkRelay: false });
  });
});
