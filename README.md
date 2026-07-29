# dignity.js

![dignity.js logo](./docs/assets/dignity-logo.png)

[![docs](https://img.shields.io/badge/docs-online-5B7FFF)](https://jose-compu.github.io/dignity.js/)
[![npm version](https://img.shields.io/npm/v/dignity.js?color=cb3837&label=npm)](https://www.npmjs.com/package/dignity.js)
[![npm downloads](https://img.shields.io/npm/dm/dignity.js?color=blue)](https://www.npmjs.com/package/dignity.js)
[![CI](https://github.com/jose-compu/dignity.js/actions/workflows/ci.yml/badge.svg)](https://github.com/jose-compu/dignity.js/actions/workflows/ci.yml)
![tests](https://img.shields.io/badge/tests-530%2B%20passing-brightgreen)
![coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![license](https://img.shields.io/badge/license-Apache%202.0-black)

<p align="center">
  <a href="#highlights">Highlights</a> ·
  <a href="#install">Install</a> ·
  <a href="#tutorial">Tutorial</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#peergroup-gossip-scalable-pubsub">PeerGroups</a> ·
  <a href="#credential-derived-identity-keys">Identity</a> ·
  <a href="#record-content-hashes">Hashes</a> ·
  <a href="#security-model">Security</a> ·
  <a href="#dignity-apps-v0130">Apps</a> ·
  <a href="#verification-policies-v0130">Verification</a> ·
  <a href="#docs-and-examples">Docs</a> ·
  <a href="#development">Dev</a>
</p>

<p align="center">
  <strong>Docs:</strong>
  <a href="https://jose-compu.github.io/dignity.js/">Site</a> ·
  <a href="https://jose-compu.github.io/dignity.js/#tutorial">Tutorial</a> ·
  <a href="https://jose-compu.github.io/dignity.js/#api-reference">API</a> ·
  <a href="https://jose-compu.github.io/dignity.js/playground/">Playground</a> ·
  <a href="https://jose-compu.github.io/dignity.js/chess/">Chess</a> ·
  <a href="https://jose-compu.github.io/dignity.js/tictactoe/">Tic-tac-toe</a> ·
  <a href="https://jose-compu.github.io/dignity.js/apps/">Apps registry</a> ·
  <a href="./docs/api-reference.md">API (MD)</a> ·
  <a href="./docs/production-runbook.md">Production</a> ·
  <a href="./docs/api-stability.md">API stability</a> ·
  <a href="./docs/threat-model.md">Threat model</a> ·
  <a href="./docs/browser-compatibility.md">Browsers</a> ·
  <a href="./TUTORIAL.md">Tutorial (MD)</a>
</p>

The Scalable Data Layer of the Decentralized Browser Application Ecosystem.

`dignity.js` lets many browsers synchronize shared objects with ownership rules and built-in anti-abuse + privacy controls.

## Highlights

- Familiar object operations over P2P replication: `create`, `read`, `list`, `update`, `remove`
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
- **PeerGroup gossip** — scalable PubSub for high-fanout feeds (spectators, timelines); default `maxHops: 64`
- **CQRS tiers (v0.8+)** — live core (5k cap) + bulk tail per publisher; signed domain events on every write
- **v1.1.0** — BIP39-style identity mnemonic export/import (#130), optional passphrase-encrypted backup
- **v1.0.0** — Stable public API (#94), threat model (#96), openapi normalization (#126), chess credential login (#128)
- **v0.14.0** — TypeScript definitions (#14), production deployment runbook (#95), API consistency audit (#124)
- **v0.13.0** — Verification code hashing (#115), optional semver versioning (#116), compatibility policies (#117), security audit v0.7–v0.13 (#122)
- **v0.12.0** — Dignity Apps error panel + console capture (#106), timeline example app (#107), apps registry (#109), delegated move proposals (#13)
- **v0.11.0** — Dignity Apps: sandboxed iframe host, MessageChannel RPC bridge, read-only query API, stored commands (#100, #102–#105)
- **v0.10.1** — README logo PNG aspect-ratio fix (export from SVG)
- **v0.10.0** — cross-device chess resume, portable checkpoints, browser tic-tac-toe demo, PeerJS ICE/TURN docs, Playwright e2e smoke
- **`DignityQueryReplica`** — read-only materialized views with hash-chain verification
- Credential-derived keys, identity rotation, cold-recovery co-sign (v0.7+), and BIP39-style mnemonic backup (v1.1+)
- Browser-first: published npm package includes IIFE, ESM, and CJS builds

## Install

```bash
npm install dignity.js
```

## Tutorial

**New to dignity.js?** Start with [TUTORIAL.md](./TUTORIAL.md) — short lessons from two in-memory peers through verification policies, browser PeerJS, PeerGroup spectators, and Dignity Apps. The [docs site tutorial](https://jose-compu.github.io/dignity.js/#tutorial) covers the same path.

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
  maxActivePeers: 8,
  maxHops: 64   // default since v0.8.0
});

await node.publishRecordToPeerGroup('feed:alice', 'posts', 'post-1');
await node.leavePeerGroup('feed:alice');
```

Inner gossip message types: `operation`, `record:snapshot`, `domain:event`, `domain:checkpoint`, and app-defined payloads (via `peergroupmessage` events).

Small collaborations (chess players, document co-editing) should keep using direct `connectToPeers` mesh. Large read-only audiences (chess spectators, public timelines) should use PeerGroup gossip. See the [docs PeerGroup section](https://jose-compu.github.io/dignity.js/#peer-groups).

### CQRS tiers, domain events, and query replicas (v0.8+)

For audiences above ~5 000 subscribers per publisher, use the command/query split:

- **Command path** — publisher writes locally; signed domain events auto-publish on `create` / `update` / `remove`.
- **Live tier** — first `liveCap` subscribers (default 5 000) receive real-time gossip.
- **Bulk tier** — overflow subscribers receive batched updates via bulk relays.
- **Query path** — `DignityQueryReplica` maintains local materialized views from the event stream.

```js
const { DignityP2P, DignityQueryReplica } = require('dignity.js');

// Publisher
await publisher.joinPeerGroup('feed:alice', {
  role: 'publisher',
  tiered: true,
  liveCap: 5000,
  domainEvents: true
});
await publisher.create('posts', { text: 'hello' }, { id: 'p1', peerGroupId: 'feed:alice' });

// Read-only replica (no command capability)
const replica = new DignityQueryReplica(reader, {
  groupId: 'feed:alice',
  collections: ['posts'],
  publisherId: 'alice'
});
await replica.start({ bootstrapPeerIds: ['alice'] });
replica.read('posts', 'p1');
replica.verifyChain(); // hash-chain consistency
```

Default `maxHops` is **64** (was 6 in v0.7.x), sufficient for epidemic spread at fanout 3 without per-group tuning.

**Publisher options:** `role: 'publisher'`, `tiered: true`, `liveCap` (default 5000), `domainEvents: true`, `peerGroupId` on CRUD to auto-publish events.

**Subscriber / replica options:** `role: 'subscriber'`, `tierMode: 'auto' | 'live' | 'bulk'`, `commandCapable: false` on read-only nodes, `publisherId` to filter events.

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

### Recovery phrase backup (v1.1.0, #130)

Export any `keyPair` (random or credential-derived) as a BIP39-style **48-word** English phrase encoding the 32-byte Ed25519 seed plus the 32-byte Curve25519 secret. This is a portable offline backup — complementary to username/password derive and cold-recovery co-sign.

```js
const {
  exportIdentityMnemonic,
  importIdentityMnemonic,
  exportIdentityMnemonicEncrypted,
  importIdentityMnemonicEncrypted
} = require('dignity.js');

const phrase = await exportIdentityMnemonic(keyPair);
// store offline / paper — anyone with the phrase controls the identity

const restored = await importIdentityMnemonic(phrase);

// Optional: passphrase-encrypted blob for password managers
const encrypted = await exportIdentityMnemonicEncrypted(keyPair, {
  passphrase: 'vault-passphrase'
});
const fromVault = await importIdentityMnemonicEncrypted(encrypted, {
  passphrase: 'vault-passphrase'
});
```

| Mechanism | Use when |
|-----------|----------|
| `deriveKeyPairFromCredentials` | Same username/password must recreate keys on any device |
| `exportIdentityMnemonic` | Paper / offline backup of an existing keyPair |
| Encrypted mnemonic | Clipboard or password-manager storage of that backup |
| Cold recovery password | Prevent rotation lockout after primary password theft |

UI guidance: blur phrases by default; warn that possession of the phrase (or phrase + passphrase) is full identity control. See [`docs/threat-model.md`](./docs/threat-model.md).

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
// Or: await node.enrollAndBroadcastColdRecovery({ username: 'alice', coldPassword: '...' });

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

await publisherNode.update('chess-matches', gameId, { blackPlayerId: joinerId, status: 'playing' }, {
  collaborators: [hostId, joinerId],
  broadcastScope: scope
});

await publisherNode.pushRecordSnapshot('chess-matches', gameId, {
  broadcastScope: scope,
  connectToPeers: [joinerId]
});
```

The joiner applies the snapshot via `restoreRecord`, then subsequent move updates replicate normally.

### ICE/TURN for production browsers

Public STUN servers help with NAT but many deployments need a **TURN relay** (corporate VPN, symmetric NAT, UDP filtering). Pass `iceServers` when creating the network adapter:

```js
const { createPeerJSNetworkAdapter } = require('dignity.js');

const networkAdapter = createPeerJSNetworkAdapter({
  urls: ['wss://your-signaling.example/peerjs?key=peerjs'],
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
});
```

**Reconnect:** If signaling drops mid-session, call `await adapter.stop()` then `await adapter.start(nodeId)` and re-run `connectToPeer` for each remote peer. If messages stop but signaling looks healthy, verify open data channels with `getConnectionStats()` and push a fresh snapshot after reconnect.

See [docs/browser-compatibility.md](./docs/browser-compatibility.md#peerjs-ice-turn) for troubleshooting.

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup, tests, and PR expectations.

**Good first issues:** [issues labeled `good first issue`](https://github.com/jose-compu/dignity.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

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

## Dignity Apps (v0.13.0)

Self-contained HTML apps in a sandboxed iframe, inspired by [Datasette Apps](https://datasette.io/blog/2026/datasette-apps/). Track: [#100](https://github.com/jose-compu/dignity.js/issues/100).

**Threat boundaries:**

- Apps run in an iframe with `sandbox="allow-scripts"` + immutable CSP — no parent DOM, cookies, or `localStorage`.
- Data access only via a parent **MessageChannel** bridge; no signing keys or mesh credentials in the iframe.
- **Read:** `dignity.query` / `dignity.list` backed by `DignityQueryReplica` (collections allowlisted in manifest).
- **Write:** only **stored commands** pre-declared in the app manifest — no arbitrary CRUD.
- External `fetch` blocked unless origin is listed in `allowedCspOrigins` (https only; no localhost).

```js
const {
  DignityP2P,
  DignityQueryReplica,
  DignityAppHost,
  validateDignityAppManifest
} = require('dignity.js');

const { manifest } = validateDignityAppManifest({
  id: 'timeline-demo',
  title: 'Event timeline',
  collections: ['posts'],
  peerGroupId: 'feed:alice',
  allowedCspOrigins: ['https://cdn.example.com'],
  storedCommands: [{
    id: 'create-post',
    kind: 'create',
    collection: 'posts',
    allowedFields: ['text']
  }]
}).manifest;

// Parent page: publisher node + read-only replica + sandboxed host
const replica = new DignityQueryReplica(subscriberNode, {
  groupId: 'feed:alice',
  collections: ['posts'],
  publisherId: 'alice'
});
await replica.start({ bootstrapPeerIds: ['alice'] });

const host = new DignityAppHost({ manifest, replica, node: publisherNode });
host.on('applog', (e) => console.log('[app]', e.message));
const { attachErrorPanel } = require('dignity.js');
attachErrorPanel(host, document.getElementById('app-shell'));
host.mount(document.getElementById('app-frame'), appHtmlString);

// Inside the iframe (bootstrap injected by host):
// const dignity = await connectDignityAppClient();
// await dignity.ready();
// const posts = await dignity.query({ collection: 'posts' });
// await dignity.runStoredCommand('create-post', { text: 'Hello' });
```

Sandbox: `allow-scripts` only (no `allow-same-origin`, no top-navigation/forms/popups). Host emits `ready`, `applog`, `apperror`, and `apprpcerror`. Bootstrap auto-captures `console.error`, `window.onerror`, and `unhandledrejection` into the host error panel (`attachErrorPanel`). Apps registry and timeline demo: `docs/apps/`.

### Turn-based games: delegated move proposals (#13)

Keep a single record owner (the game host) and let joiners send signed move proposals instead of transferring ownership each turn:

```js
// Joiner on their turn:
await joiner.proposeUpdate('games', gameId, { board, nextPlayer: hostId }, {
  connectToPeers: [hostId]
});

// Host validates and applies:
node.on('proposal', async (proposal) => {
  if (!isValidMove(proposal)) {
    await node.rejectProposal(proposal, 'invalid-move');
    return;
  }
  await node.acceptProposal(proposal, { broadcastScope: roomScope });
});

joiner.on('proposalresult', (result) => {
  if (!result.ok) console.warn('move rejected:', result.reason);
});
```

See `docs/tictactoe/` for a full PeerJS demo. `transferOwnership` remains available when you want to hand off the record entirely.

## Migration to v1.1.0

v1.1.0 adds mnemonic backup helpers and is a non-breaking minor on the v1.0 stable API. Bump your dependency; no code changes required unless you adopt the new exports. See [`docs/api-stability.md`](./docs/api-stability.md). Full 0.7 → 1.0 notes: issue #97.

## TypeScript (v0.14.0+)

Type definitions ship with the package (`types/index.d.ts`, `dignity.js/react` → `types/react.d.ts`).

```ts
import {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  type CompatibilityPolicy
} from 'dignity.js';

const node = new DignityP2P({
  nodeId: 'alice',
  networkAdapter: new InMemoryNetworkAdapter(new InMemoryNetworkHub()),
  security: { powEnabled: false }
});
```

Smoke example: [`examples/typescript-consumer/`](./examples/typescript-consumer/).

## Verification policies (v0.13.0)

Bind each collection to canonical validation logic so peers loaded from different webs cannot silently diverge (#115–#117). Full guide: [docs — verification policies](https://jose-compu.github.io/dignity.js/#verification-policies).

```js
const { hashReflectiveLogic } = require('dignity.js');

const rules = {
  currency: 'USD',
  maxAmount: 1000,
  validate(record) { return record.data.amount <= 1000; }
};

const { hash } = hashReflectiveLogic(rules, { policy: 'strict' });

node.registerVerification('ledger', {
  code: rules,
  reflective: true,   // fingerprint nested functions via AST canonicalization (#123)
  version: '1.2.0',
  policy: 'patch-only'
});

node.on('verificationmismatch', (e) => {
  console.warn('hash drift', e.localHash, e.remoteHash);
});

node.on('policyrejected', (e) => {
  console.warn('rejected by policy', e.policy, e.reason);
});
```

Policies default to `advisory` (warn-only). Use `strict` for high-integrity state (balances, game moves). Presence metadata advertises registered versions at join time.

### Decentralized trust: official publisher versions

There is **no central version registry**. Each peer opts in to which **publisher** (`peerId`) ships the official dapp semver (`0.N.M`) and logic hash for a collection. Trust flows from signed mesh identity + publisher-scoped verification — the same model as CQRS `publisherId` on PeerGroups.

```js
// Publisher declares official dapp 0.13.0 logic for this collection
alice.registerPublisherVerification('alice', 'posts', {
  code: businessRulesObject,   // reflective hash in #123
  version: '0.13.0',
  dappId: 'timeline-demo',
  policy: 'strict'
});

// Subscriber trusts alice as the official publisher for posts
bob.registerPublisherVerification('alice', 'posts', {
  code: businessRulesObject,
  version: '0.13.0',
  policy: 'strict'
});

// Ingest from alice uses alice:posts registry; other senders fall back to local policy
```

Dignity App manifests may pin `dappVersion` + `logicHash` + `publisherId`. Stored commands refuse execution unless the host publisher's registered hash matches — fully P2P, no npm or central server required. Track: [#123](https://github.com/jose-compu/dignity.js/issues/123).

## Docs and Examples

- **Documentation:** [jose-compu.github.io/dignity.js](https://jose-compu.github.io/dignity.js/)
- **API reference:** [`docs/api-reference.md`](./docs/api-reference.md) (generated from `openapi-like.json`)
- **API stability (v1.x):** [`docs/api-stability.md`](./docs/api-stability.md) (#94)
- **Threat model (v1.1):** [`docs/threat-model.md`](./docs/threat-model.md) (#96, #130)
- **Browser compatibility:** [`docs/browser-compatibility.md`](./docs/browser-compatibility.md) (#91)
- **Production runbook:** [`docs/production-runbook.md`](./docs/production-runbook.md) (#95)
- **Benchmarks:** [`docs/benchmarks/results.json`](./docs/benchmarks/results.json) — `npm run benchmark` (#92)
- Docs site source: `docs/index.html` (local: `npm run docs:dev`)
- **3D Chess demo:** `docs/chess/` — PeerJS mesh, username/password seat keys, dual-signed resume links, IndexedDB → [local chess demo](http://127.0.0.1:4173/chess/) when `docs:dev` is running
- **Browser tic-tac-toe:** `docs/tictactoe/` — PeerJS onboarding + delegated move proposals → [local tictactoe](http://127.0.0.1:4173/tictactoe/) when `docs:dev` is running
- **Dignity Apps registry:** `docs/apps/` — searchable app index + timeline read-only demo
- API metadata: `docs/openapi-like.json`
- **Examples index:** [`examples/README.md`](./examples/README.md) (#132)
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
