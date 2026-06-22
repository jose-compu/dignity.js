const {
  PEER_GROUP_SCOPE_PREFIX,
  DEFAULT_PEER_GROUP_OPTIONS,
  peerGroupScope,
  parsePeerGroupScope,
  shufflePeerIds,
  selectFanoutPeers
} = require('../../src/gossip/peer-group');

describe('peer-group helpers', () => {
  test('peerGroupScope requires groupId', () => {
    expect(() => peerGroupScope('')).toThrow('peerGroupScope requires groupId');
  });

  test('parsePeerGroupScope extracts group id', () => {
    expect(parsePeerGroupScope('gossip:feed:alice')).toBe('feed:alice');
    expect(parsePeerGroupScope('room:chess')).toBeNull();
    expect(parsePeerGroupScope(null)).toBeNull();
  });

  test('DEFAULT_PEER_GROUP_OPTIONS exposes sane defaults', () => {
    expect(DEFAULT_PEER_GROUP_OPTIONS).toEqual({
      fanout: 3,
      maxActivePeers: 8,
      maxHops: 64,
      relayEnabled: true
    });
    expect(PEER_GROUP_SCOPE_PREFIX).toBe('gossip:');
  });

  test('shufflePeerIds returns permutation with same elements', () => {
    const input = ['a', 'b', 'c', 'd'];
    const shuffled = shufflePeerIds(input, () => 0.99);
    expect(shuffled.sort()).toEqual(input.sort());
  });

  test('selectFanoutPeers excludes sender and caps count', () => {
    const selected = selectFanoutPeers({
      peers: [{ peerId: 'a' }, { peerId: 'b' }, { peerId: 'c' }],
      count: 2,
      excludePeerIds: ['b'],
      randomFn: () => 0
    });

    expect(selected).toHaveLength(2);
    expect(selected).not.toContain('b');
  });

  test('selectFanoutPeers returns empty array for zero count', () => {
    expect(selectFanoutPeers({ peers: [{ peerId: 'a' }], count: 0 })).toEqual([]);
  });
});
