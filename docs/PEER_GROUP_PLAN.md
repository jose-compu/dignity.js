# PeerGroup Gossip — v0.6.0 Implementation Plan

## Goal

Scale object-update distribution to **millions of subscribers** per published object while each peer keeps a **small, bounded** number of active transports.

Paradigm: decentralized Twitter — you follow 200 accounts (200 multiplexed gossip groups); a popular account can have millions of followers sharing relay load.

## Two replication modes

| Mode | Use case | API |
|------|----------|-----|
| **Direct mesh** | Chess players, small teams, owner+collaborators | `create` / `update` with `connectToPeers` (unchanged) |
| **PeerGroup gossip** | Spectators, public feeds, high-fanout read replicas | `joinPeerGroup` + `publishToPeerGroup` |

Apps can mix both on the same node.

## Architecture

```
Publisher --fanout=3--> Peer A --relay--> Peer D ...
              \-------> Peer B --relay--> Peer E ...
               \------> Peer C --relay--> Peer F ...
```

- **Presence**: each group reuses scoped `joinDiscovery('gossip:{groupId}')` for membership directory.
- **Transport**: `sendToPeers(envelope, peerIds)` — not full mesh broadcast.
- **Relay**: subscribers re-forward to `fanout` random peers until `maxHops`.
- **Dedup**: `gossipId` cache (TTL-bounded) stops infinite loops.
- **Connection budget**: `maxActivePeers` per group + `globalMaxOpenConnections` per node.

## Core API (DignityP2P)

```js
await node.joinPeerGroup('spectate:chess:game-1', {
  bootstrapPeerIds: [hostPeerId],
  fanout: 3,
  maxActivePeers: 8,
  maxHops: 6,
  metadata: { role: 'spectator' }
});

await node.publishToPeerGroup('spectate:chess:game-1', 'record:snapshot', {
  collectionName: 'chess-matches',
  record
}, { fanout: 3 });

await node.leavePeerGroup('spectate:chess:game-1');

node.listPeerGroupMembers('spectate:chess:game-1');
node.getPeerGroupStats(); // joined groups, seen gossip cache size, open connections
```

### Inner message types

Relayed inside `peer-group:gossip`:

- `operation` — replicated CRUD op
- `record:snapshot` — late-joiner catch-up
- App-defined types via `publishToPeerGroup`

## Security

- Group scoped encryption via existing `broadcastScope = gossip:{groupId}`.
- Signatures + PoW verified before relay (same `MessageSecurityService` path).
- Invalid gossip rejected; banned peers ignored.

## Chess demo (issue #55)

- **Players**: direct mesh between white/black (low latency).
- **Spectators**: `joinPeerGroup('spectate:chess:{gameId}')`.
- **Moves**: mover updates record on direct path; also `publishToPeerGroup` snapshot for spectators.
- **New spectator**: receives epidemic relay + host snapshot on join — host does not O(N) connect.

## Phased delivery

### Phase 1 (this branch) — MVP

- [x] `peer-group.js` helpers
- [ ] `sendToPeers` on PeerJS + in-memory adapters
- [ ] `joinPeerGroup` / `publishToPeerGroup` / relay handler on `DignityP2P`
- [ ] Unit tests (fanout, dedup, hops)
- [ ] Chess spectator integration
- [ ] Docs section + README

### Phase 2 — v0.6.x polish

- [ ] `subscribeObjectFeed(collection, id)` convenience wrapper
- [ ] Connection LRU trim (`disconnectPeer`)
- [ ] IndexedDB persistence of joined group ids
- [ ] React `usePeerGroup` hook
- [ ] Integration test with 50+ in-memory nodes

### Phase 3 — future

- [ ] Publisher-side rate limits
- [ ] Partial snapshot / delta feeds
- [ ] Cross-group fan-in metrics

## Defaults

| Option | Default | Rationale |
|--------|---------|-----------|
| `fanout` | 3 | Classic gossip fanout |
| `maxActivePeers` | 8 | Keeps local PeerJS channels small |
| `maxHops` | 6 | Covers large graphs with low diameter |
| `globalMaxOpenConnections` | 32 | Hard cap per node |
| `gossipIdTtlMs` | 5 min | Dedup window |

## Issues

- https://github.com/jose-compu/dignity.js/issues/54 — PeerGroup core feature
- https://github.com/jose-compu/dignity.js/issues/55 — Chess spectators
