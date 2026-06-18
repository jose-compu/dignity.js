# dignity.js

![dignity.js logo](https://raw.githubusercontent.com/jose-compu/dignity.js/refs/heads/main/docs/assets/dignity-logo.png)

[![docs](https://img.shields.io/badge/docs-online-5B7FFF)](https://jose-compu.github.io/dignity.js/)
[![npm version](https://img.shields.io/npm/v/dignity.js?color=cb3837&label=npm)](https://www.npmjs.com/package/dignity.js)
[![npm downloads](https://img.shields.io/npm/dm/dignity.js?color=blue)](https://www.npmjs.com/package/dignity.js)
[![CI](https://github.com/jose-compu/dignity.js/actions/workflows/ci.yml/badge.svg)](https://github.com/jose-compu/dignity.js/actions/workflows/ci.yml)
![tests](https://img.shields.io/badge/tests-213%2B%20passing-brightgreen)
![coverage](https://img.shields.io/badge/coverage-92%25-brightgreen)
![license](https://img.shields.io/badge/license-Apache%202.0-black)

REST-like P2P object API for decentralized JavaScript applications.

`dignity.js` lets many browsers synchronize shared objects with ownership rules and built-in anti-abuse + privacy controls.

## Highlights

- REST-like API over P2P replication: `create`, `read`, `list`, `update`, `remove`
- Owner authorization model by default (only creator can update/delete)
- Security defaults enabled:
  - message signing (Ed25519)
  - broadcast encryption (shared password)
  - direct encryption (recipient public key)
  - Sloth VDF proof-of-work per message
  - default `powSteps: 22` (calibrated on this machine to about 1000ms)
  - automatic peer ban on invalid signature/PoW (`48h` default)
- Team/subapp scoped broadcast passwords (`broadcastScope` + `broadcastPasswords`)
- Optimistic concurrency helpers (`expectedVersion`, `updateWithRetry`, `conflict` events)
- PeerJS mesh bootstrap: connect before announce/broadcast, auto `publicKey` in presence
- Late-joiner sync via `pushRecordSnapshot` (full record catch-up when create was missed)
- Content hashes on active records via `record.hash` (`sha512:` over canonicalized `data`)
- Auto `connectToPeers` on create/update/delete replication (owner + collaborators)
- Optional IndexedDB persistence for browser reload survival
- Optional React hooks via `dignity.js/react`
- Browser-first: published npm package includes IIFE, ESM, and CJS builds

## Install

```bash
npm install dignity.js
```

## Tutorial

**New to dignity.js?** Start with [TUTORIAL.md](./TUTORIAL.md) — eight short lessons from two in-memory peers to browser PeerJS and PeerGroup spectators. The [docs site tutorial](https://jose-compu.github.io/dignity.js/#tutorial) covers the same path.

## Quick Start

```js
const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('dignity.js');

const hub = new InMemoryNetworkHub();

const alice = new DignityP2P({
  nodeId: 'alice',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security: {
    appPassword: 'shared-out-of-band-password',
    powSteps: 22
  }
});

const bob = new DignityP2P({
  nodeId: 'bob',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security: {
    appPassword: 'shared-out-of-band-password',
    powSteps: 22
  }
});

await alice.start();
await bob.start();

await alice.joinDiscovery('main', {
  metadata: { nickname: 'alice' }
});
await bob.joinDiscovery('main', {
  metadata: { nickname: 'bob' }
});

const visiblePeers = alice.listPeers('main', { includeSelf: false });
console.log('Peers in main room:', visiblePeers.map((peer) => peer.peerId));

await alice.create('notes', { title: 'hello decentralized world' }, {
  id: 'note-1',
  broadcastScope: 'main'
});
console.log(bob.read('notes', 'note-1'));

await alice.leaveDiscovery('main');
await bob.leaveDiscovery('main');
```

## Team / Subapp Scoped Passwords

Use a different broadcast password per cooperative team, room, or sub-application namespace.

```js
const node = new DignityP2P({
  nodeId: 'player-1',
  networkAdapter,
  security: {
    appPassword: 'fallback-password',
    broadcastPasswords: {
      'coop:red': 'red-team-secret',
      'coop:blue': 'blue-team-secret'
    },
    powSteps: 22,
    banDurationMs: 48 * 60 * 60 * 1000
  }
});

await node.create('matches', { mode: 'coop' }, {
  id: 'm-1',
  broadcastScope: 'coop:red'
});
```

Peers with a different password for `coop:red` cannot decrypt that broadcast traffic.

## PeerGroup Gossip (scalable PubSub)

For high-fanout object updates (millions of subscribers per published object), use multiplexed gossip groups. Each peer keeps a bounded number of active transports (`maxActivePeers` per group, `globalMaxOpenConnections` per node).

```js
// Follow 200 accounts = 200 joined groups, few connections each
await node.joinPeerGroup('feed:alice', {
  bootstrapPeerIds: ['publisher-peer-id'],
  fanout: 3,
  maxActivePeers: 8
});

await node.publishRecordToPeerGroup('feed:alice', 'posts', 'post-1');
await node.leavePeerGroup('feed:alice');
```

Small collaborations (chess players, document co-editing) should keep using direct `connectToPeers` mesh. Large read-only audiences (chess spectators, public timelines) should use PeerGroup gossip. See the [docs PeerGroup section](https://jose-compu.github.io/dignity.js/#peer-groups).

## Room / Team Discovery

Use scoped discovery to find active peers in a room (for example `main`, `team:red`, `raid-42`).

```js
await node.joinDiscovery('team:red', {
  metadata: { nickname: 'alice' },
  heartbeatIntervalMs: 15000,
  ttlMs: 45000
});

const peers = node.listPeers('team:red', { includeSelf: false });
await node.leaveDiscovery('team:red');
```

## Direct Secure Messaging

```js
alice.registerPeerPublicKey('bob', bob.getPublicKey());
bob.registerPeerPublicKey('alice', alice.getPublicKey());

await alice.sendDirectMessage('bob', 'dm', { text: 'private payload' });
```

## Credential-Derived Identity Keys

Regenerate the same signing and encryption keys from a public username plus private password (instead of persisting random keys in `localStorage`):

```js
const { deriveKeyPairFromCredentials, DignityP2P } = require('dignity.js');

const keyPair = await deriveKeyPairFromCredentials({
  username: 'alice',
  password: 'user-chosen-secret'
});

const alice = new DignityP2P({
  nodeId: 'alice',
  networkAdapter,
  security: {
    appPassword: 'shared-out-of-band-password',
    keyPair
  }
});
```

`appPassword` is for broadcast encryption and is separate from the identity password. Password strength affects offline brute-force resistance; compromising the identity password exposes signing keys retroactively.

### Compromise recovery (key #2, #3, …)

Bump `generation` after suspected private-key exposure. The rotation is signed with the **next** generation key (proves password knowledge); a stolen gen-1 private key alone cannot authorize gen-2.

```js
const { revokeAndRotateIdentity } = require('dignity.js');

// User suspects session on a public PC — rotate gen 1 → gen 2
const { rotation, nextKeyPair, nextGeneration } = await revokeAndRotateIdentity({
  username: 'alice',
  password: 'user-chosen-secret',
  currentGeneration: 1,
  reason: 'left browser open on public PC'
});

await node.adoptDerivedIdentityKeyPair(nextKeyPair, { generation: nextGeneration });
await node.broadcastIdentityRotation(rotation, { broadcastScope: 'identity:alice' });
```

Peers verify the signed `identity:rotate` message and upgrade trusted public keys; older generations are rejected.

### Password change

```js
const { rotateIdentityPassword } = require('dignity.js');

const { rotation, nextKeyPair, nextGeneration } = await rotateIdentityPassword({
  username: 'alice',
  currentPassword: 'old-secret',
  newPassword: 'new-secret',
  currentGeneration: 2
});

await node.adoptDerivedIdentityKeyPair(nextKeyPair, { generation: nextGeneration });
await node.broadcastIdentityRotation(rotation);
```

The succession is signed with keys derived from the **new** password. Attackers who only know the old password cannot forge the rotation.

### Cold recovery password (anti-lockout)

Store a **secondary cold password** offline (password manager, paper, bank vault). After enrollment, every identity rotation requires a **co-signature** from this cold key. An attacker who steals only the **primary** password cannot rotate your identity and lock you out.

```js
const { enrollColdRecoveryPassword } = require('dignity.js');

// One-time setup — broadcast so peers require cold co-sign on future rotations
const { enrollment } = await enrollColdRecoveryPassword({
  username: 'alice',
  coldPassword: 'separate-vault-secret-never-on-public-pc'
});
await node.broadcastColdRecoveryEnrollment(enrollment);

// Later: compromise recovery needs BOTH passwords
const { rotation, nextKeyPair, nextGeneration } = await revokeAndRotateIdentity({
  username: 'alice',
  password: 'primary-secret',
  coldPassword: 'separate-vault-secret-never-on-public-pc',
  currentGeneration: 1
});
```

| Secret | Use daily? | Can rotate identity alone? |
|--------|------------|----------------------------|
| Primary password | Yes | No (after cold enroll) |
| Cold password | No — vault only | Required co-sign for rotation |
| Stolen gen-N private key | — | No |

Cold password is **stable** across primary password changes and generation bumps (separate KDF domain). If both primary and cold are compromised, rotate both.

## Optimistic Concurrency

Updates carry a monotonic `version`. Remote peers reject stale operations when `baseVersion` does not match.

```js
node.on('conflict', (event) => {
  console.log('conflict', event.phase, event.expectedVersion, event.currentVersion);
});

await node.update('games', 'g1', { score: 10 }, { expectedVersion: 3 });

await node.updateWithRetry('games', 'g1', (current) => ({
  score: current.data.score + 1
}));
```

Use `expectedVersion` for fail-fast local writes. Use `updateWithRetry` for read-modify-write loops in fast multiplayer state.

## Record Content Hashes

Active records returned by `create`, `read`, `list`, `update`, and `pushRecordSnapshot` include a `hash` field:

```js
const record = await node.create('notes', { title: 'hello' }, { id: 'n1' });
console.log(record.hash); // sha512:...
```

Hash details:

- The algorithm is `sha512`, matching `tweetnacl.hash` in both browser and Node builds.
- The digest covers only `record.data`, not `id`, `ownerId`, timestamps, collaborators, or version.
- Data is canonicalized with `stableStringify`, so object key order does not affect the hash.
- Snapshot restore recomputes the digest locally; direct mesh and PeerGroup gossip snapshots are rejected on hash mismatch (warning `content-hash-mismatch`).
- Deleted tombstones returned by `list(collection, { includeDeleted: true })` intentionally omit `hash`.

## IndexedDB Persistence

Persist replicated collections across page reloads:

```js
const { DignityP2P, IndexedDBPersistence } = require('dignity.js');

const node = new DignityP2P({ nodeId, networkAdapter, security });
const persistence = new IndexedDBPersistence({
  dbName: 'my-app',
  collections: ['games', 'matches']
});

await node.start();
await persistence.attach(node);
```

## React Hooks

Optional React integration (`react >= 18` peer dependency):

```js
import { createElement } from 'react';
import { useDignity, useCollection, usePeers } from 'dignity.js/react';

function Room() {
  const { node, status } = useDignity(config);
  const games = useCollection(node, 'games');
  const peers = usePeers(node, 'room:chess', { includeSelf: false });

  return createElement('pre', null, JSON.stringify({ status, games, peers }, null, 2));
}
```

## Browser Usage

The published npm package includes pre-built bundles (IIFE, ESM, CJS) generated at publish time. The `dist/` folder is not checked into the repository.

```text
<script src="https://unpkg.com/dignity.js/dist/dignity.min.js"></script>
<script>
  const { DignityP2P } = DignityJS;
</script>
```

## Security Model

`dignity.js` provides two encryption modes:

- **Direct mode** (`targetId` set): true end-to-end encryption using X25519 key exchange between sender and recipient. Only the intended recipient can decrypt.
- **Broadcast mode** (no `targetId`): symmetric encryption using a shared password. All peers that know the password can decrypt all broadcast traffic in that scope. This is a **group shared-secret cipher**, not end-to-end encryption.

Broadcast encryption uses PBKDF2-SHA256 (default 100,000 iterations) with a random salt per message to derive the symmetric key. This protects against offline brute-force of weak passwords. The iteration count is configurable via `kdfIterations`.

Messages from peers running older versions that used the legacy single-hash KDF are still accepted and decrypted automatically (backward compatible).

**Important:** if the broadcast password leaks, all past captured traffic for that scope is retroactively decryptable. For sensitive data, use direct mode with per-peer public keys.

## Signaling Servers

Default signaling URLs include PeerJS-compatible public endpoints:

- `wss://peerjs.92k.de/peerjs?key=peerjs`
- `wss://0.peerjs.com/peerjs?key=peerjs`

You can also deploy your own server with [peerjs-server](https://github.com/peers/peerjs-server) and point `createDefaultSignalingPool` (or `WebSocketSignalingProvider`) to your own `wss://.../peerjs?key=...` URL.

Compatibility note:
- `dignity.js` now includes a dedicated `PeerJSSignalingProvider` backed by the official `peerjs` client for PeerJS protocol compatibility.
- In non-WebRTC runtimes (for example Node test runners), it automatically falls back to WebSocket transport checks for connectivity testing.

### PeerJS mesh bootstrap

Unlike the in-memory test adapter (which fan-outs to every registered node), **PeerJS only delivers messages over open data channels**. Discovery broadcasts do not reach anyone until at least one side has connected.

For browser apps (see the bundled 3D chess demo), pass a known peer id from your invite link:

```js
await node.joinDiscovery('room:my-game', {
  metadata: { nickname: 'alice', role: 'host' },
  bootstrapPeerIds: ['host-peer-id-from-link']
});

await node.broadcastMessage('claim-seat', payload, {
  broadcastScope: 'room:my-game',
  connectToPeers: ['host-peer-id-from-link']
});
```

Library helpers:

- `node.connectToPeer(peerId)` — open a PeerJS data channel
- `node.getConnectionStats()` — `{ openCount, peerIds }`
- `node.getRecordPeerIds(collection, id)` — owner + collaborators (for custom broadcasts)
- `node.joinDiscovery(scope, { bootstrapPeerIds })` — connect before the first presence announce
- `broadcastMessage(..., { connectToPeers })` — connect, then broadcast
- `node.pushRecordSnapshot(collection, id, options)` — send full record state to late joiners
- `create` / `update` / `remove` auto-connect to record peers when `connectToPeers` is omitted
- Presence metadata automatically includes `publicKey`; remote keys are trusted from presence and message envelopes (direct messages work without manual `registerPeerPublicKey`)

React: `useRoom(node, scope, options)` combines discovery, peers, and connection stats.

### Late joiners (missed create)

On PeerJS, a peer that comes online **after** the host creates an object never receives the initial `create` operation. Later `update` operations are ignored until that peer has a local copy of the record.

After accepting a joiner (or on `orphan-operation` warnings), push a full snapshot:

```js
node.on('warning', (event) => {
  if (event.type === 'orphan-operation') {
    // optional: request resync from owner
  }
});

await host.update('chess-matches', gameId, { blackPlayerId: joinerId, status: 'playing' }, {
  collaborators: [hostId, joinerId],
  broadcastScope: scope
});

await host.pushRecordSnapshot('chess-matches', gameId, {
  broadcastScope: scope,
  connectToPeers: [joinerId]
});
```

The joiner applies the snapshot via `restoreRecord`, then subsequent move updates replicate normally.

## Development

| Script | Purpose | Notes |
| --- | --- | --- |
| `npm test` | Run the full Jest suite with coverage. | Standard local validation before opening a PR or publishing. |
| `npm run test:unit` | Run the unit-test subset only. | Useful for faster local iteration. |
| `npm run test:stress-peer-group` | Run the in-memory PeerGroup scale test. | Opt-in; set `RUN_STRESS_TESTS=1` (100 subscribers). |
| `npm run stress:peer-group` | CLI stress harness with JSON metrics. | Example: `node scripts/stress-peer-group.js --subscribers 1000 --json`. |
| `npm run test:cloudflare-live` | Run the live Cloudflare signaling integration test. | Opt-in; set `RUN_CLOUDFLARE_LIVE_TESTS=1`. |
| `npm run test:pow-calibrate` | Run the Sloth VDF timing calibration test without coverage. | Opt-in; set `RUN_POW_CALIBRATE=1`. |
| `npm run build` | Build the published package bundles into `dist/`. | Run after changing library source files. |
| `npm run build:chess` | Rebuild the browser chess demo bundle only. | Used by the docs site and local chess demo. |
| `npm run docs:favicon` | Regenerate the docs favicon assets. | Docs maintenance helper. |
| `npm run docs:build` | Build the docs-specific assets. | Currently rebuilds the chess demo bundle. |
| `npm run docs:dev` | Start the local docs server. | Serves the main docs and chess demo; auto-builds chess if needed. |
| `npm run docs:serve` | Start the same local docs server via an alias. | Equivalent to `docs:dev`. |
| `npm run docs:stop` | Stop the background docs server from a previous run. | Useful if port `4173` is stuck. |
| `npm run docs:check` | Verify the generated docs assets exist. | Good quick check after docs asset generation. |
| `npm run example:tictactoe` | Run the Node tic-tac-toe example. | Demonstrates a minimal replicated game flow. |
| `npm run example:chess` | Run the Node chess example. | Demonstrates the lighter-weight chess sample. |
| `npm run prepublishOnly` | Run the publish gate locally. | Publish/CI-oriented hook; runs tests and build before `npm publish`. |

```bash
npm test
npm run build
npm run docs:dev          # docs + 3D chess at http://127.0.0.1:4173/
npm run docs:build        # rebuild chess bundle only
npm run example:tictactoe
npm run example:chess
npm run test:pow-calibrate
```

Local docs (auto-builds chess if `docs/chess/assets/chess-app.js` is missing):

```bash
npm run docs:dev
# Docs:  http://127.0.0.1:4173/
# Chess: http://127.0.0.1:4173/chess/
```

Use `DOCS_NO_OPEN=1 npm run docs:dev` to skip opening the browser, or `DOCS_PORT=8080` for another port.

If port 4173 is stuck from an old session:

```bash
npm run docs:stop
npm run docs:dev
```

If 4173 is busy, `docs:dev` auto-picks the next free port (4174, 4175, …) and prints the URLs.

## Contributing

New contributors can start with [CONTRIBUTING.md](./CONTRIBUTING.md) for local
setup, validation commands, docs preview steps, and the PR checklist.

Looking for a scoped first task? Browse issues labeled
[good first issue](https://github.com/jose-compu/dignity.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Docs and Examples

- **Documentation:** [jose-compu.github.io/dignity.js](https://jose-compu.github.io/dignity.js/)
- Docs site source: `docs/index.html` (local: `npm run docs:dev`)
- **3D Chess demo:** `docs/chess/` — PeerJS mesh, dual-signed resume links, IndexedDB → [local chess demo](http://127.0.0.1:4173/chess/) when `docs:dev` is running
- API metadata: `docs/openapi-like.json`
- Minimal demos:
  - `examples/decentralized-tictactoe.js`
  - `examples/decentralized-chess-lite.js`

## Publish

```bash
npm publish --access public
```

The `prepublishOnly` script runs tests and build automatically.

## License

Apache 2.0 — see [LICENSE](LICENSE).
