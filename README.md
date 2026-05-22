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

## Development

```bash
npm test
npm run build
npm run docs:serve
npm run example:tictactoe
npm run example:chess
npm run test:pow-calibrate
```

## Docs and Examples

- Docs site source: `docs/index.html` (serve locally with `npm run docs:serve`)
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
