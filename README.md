# dignity.js

<p align="center">
  <img src="https://raw.githubusercontent.com/jose-compu/dignity.js/refs/heads/main/docs/assets/dignity-logo.svg" alt="dignity.js logo" width="860" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/dignity.js-decentralized%20object%20api-5B7FFF?style=for-the-badge" alt="dignity.js" />
  <img src="https://img.shields.io/badge/browser-first-00C2A8?style=for-the-badge" alt="browser-first" />
  <img src="https://img.shields.io/badge/security-default%20on-111827?style=for-the-badge" alt="security default on" />
</p>

<p align="center">
  <a href="https://jose-compu.github.io/dignity.js/"><img src="https://img.shields.io/badge/docs-online-5B7FFF" alt="documentation"></a>
  <a href="https://www.npmjs.com/package/dignity.js"><img src="https://img.shields.io/npm/v/dignity.js?color=cb3837&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/dignity.js"><img src="https://img.shields.io/npm/dm/dignity.js?color=blue" alt="npm downloads"></a>
  <a href="https://github.com/jose-compu/dignity.js/actions/workflows/ci.yml"><img src="https://github.com/jose-compu/dignity.js/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/tests-150%2B%20passing-brightgreen" alt="tests passing">
  <img src="https://img.shields.io/badge/coverage-99%25-brightgreen" alt="coverage">
  <img src="https://img.shields.io/badge/license-Apache%202.0-black" alt="license">
</p>

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
- Auto `connectToPeers` on create/update/delete replication (owner + collaborators)
- Optional IndexedDB persistence for browser reload survival
- Optional React hooks via `dignity.js/react`
- Browser-first: published npm package includes IIFE, ESM, and CJS builds

## Install

```bash
npm install dignity.js
```

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
import { useDignity, useCollection, usePeers } from 'dignity.js/react';

function Room() {
  const { node, status } = useDignity(config);
  const games = useCollection(node, 'games');
  const peers = usePeers(node, 'room:chess', { includeSelf: false });

  return <pre>{JSON.stringify({ status, games, peers }, null, 2)}</pre>;
}
```

## Browser Usage

The published npm package includes pre-built bundles (IIFE, ESM, CJS) generated at publish time. The `dist/` folder is not checked into the repository.

```html
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

## Docs and Examples

- **Documentation:** [jose-compu.github.io/dignity.js](https://jose-compu.github.io/dignity.js/)
- Docs site source: `docs/index.html` (local: `npm run docs:dev`)
- **3D Chess demo:** `docs/chess/` → [local chess demo](http://127.0.0.1:4173/chess/) when `docs:dev` is running
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
