# dignity.js — Beginner Tutorial

This tutorial walks you through dignity.js from zero to a working multi-peer app. No prior P2P experience required.

**Time:** ~35 minutes  
**Version:** 0.10.0  
**Full docs:** [docs site](https://jose-compu.github.io/dignity.js/) · [README](./README.md)

---

## What you are building

dignity.js gives you a **REST-like API** that runs over peer-to-peer networks:

| REST idea | dignity.js |
|-----------|------------|
| `POST /notes` | `create('notes', data)` |
| `GET /notes/:id` | `read('notes', id)` |
| `PATCH /notes/:id` | `update('notes', id, patch)` |
| `DELETE /notes/:id` | `remove('notes', id)` |

Each browser (or Node process) is a **node**. Nodes replicate objects to each other with **ownership rules** and **encryption/signing enabled by default**.

---

## Prerequisites

- Node.js 18+
- Basic JavaScript (`async`/`await`)
- Two terminal tabs (for later steps)

```bash
npm install dignity.js
```

---

## Lesson 1 — Two peers, one shared note

Start with the **in-memory adapter**. It connects peers inside one process — perfect for learning and unit tests.

```js
const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('dignity.js');

async function main() {
  const hub = new InMemoryNetworkHub();

  const alice = new DignityP2P({
    nodeId: 'alice',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: { appPassword: 'my-team-secret', powSteps: 22 }
  });

  const bob = new DignityP2P({
    nodeId: 'bob',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: { appPassword: 'my-team-secret', powSteps: 22 }
  });

  await alice.start();
  await bob.start();

  // Alice creates a note; Bob receives it automatically
  await alice.create('notes', { title: 'Hello P2P' }, { id: 'note-1' });

  console.log(bob.read('notes', 'note-1'));
  // { id: 'note-1', ownerId: 'alice', data: { title: 'Hello P2P' }, version: 1, hash: 'sha512:...' }

  await alice.stop();
  await bob.stop();
}

main().catch(console.error);
```

**Key ideas:**

- `nodeId` — unique name for this peer
- `appPassword` — shared secret for broadcast encryption (share out-of-band with your team)
- `create` replicates to every peer on the same transport

Save as `lesson-1.js` and run: `node lesson-1.js`

---

## Lesson 2 — Rooms and discovery

Before collaborating, peers often need to **find each other** in a named room (scope).

```js
await alice.joinDiscovery('lobby', {
  metadata: { nickname: 'Alice' }
});

await bob.joinDiscovery('lobby', {
  metadata: { nickname: 'Bob' },
  bootstrapPeerIds: ['alice']   // optional: connect to Alice first
});

const peers = alice.listPeers('lobby', { includeSelf: false });
console.log(peers.map((p) => p.peerId)); // ['bob']

// Scope broadcasts so only lobby members decrypt
await alice.create('notes', { title: 'Scoped note' }, {
  id: 'note-2',
  broadcastScope: 'lobby'
});

await alice.leaveDiscovery('lobby');
await bob.leaveDiscovery('lobby');
```

**Key ideas:**

- `joinDiscovery(scope)` — announce presence in a room
- `listPeers(scope)` — who is online right now
- `broadcastScope` — ties encryption to that room's password

---

## Lesson 3 — Ownership and updates

Only the **owner** (who created the object) may update or delete it by default.

```js
await alice.create('games', { score: 0 }, { id: 'g1' });

// Alice can update
await alice.update('games', 'g1', { score: 10 });

// Bob cannot (silently rejected on Bob's node; Alice's record unchanged)
await bob.update('games', 'g1', { score: 999 });

console.log(alice.read('games', 'g1').data.score); // 10
```

Listen for changes on any node:

```js
alice.on('change', (event) => {
  console.log(event.kind, event.collection, event.id);
});
```

---

## Lesson 4 — Collaborators

Invite another peer to edit an object:

```js
await alice.create('docs', { body: 'draft' }, { id: 'd1' });

await alice.update('docs', 'd1', { body: 'shared draft' }, {
  collaborators: ['alice', 'bob']
});

// Bob can now update
await bob.update('docs', 'd1', { body: 'Bob edited this' });
```

---

## Lesson 5 — Versions and conflicts

Every update bumps `version`. Stale writes are rejected:

```js
try {
  await alice.update('games', 'g1', { score: 20 }, { expectedVersion: 1 });
} catch (error) {
  if (error.code === 'VERSION_CONFLICT') {
    console.log('Someone else updated first');
  }
}

// Or retry automatically:
await alice.updateWithRetry('games', 'g1', (current) => ({
  score: current.data.score + 1
}));
```

---

## Lesson 6 — Browser and real networks

The in-memory adapter is for **tests and learning**. Browser apps use **PeerJS** over WebRTC:

```js
const { DignityP2P, createPeerJSNetworkAdapter } = require('dignity.js');

const networkAdapter = await createPeerJSNetworkAdapter({
  nodeId: 'player-1',
  signaling: { /* PeerJS / Cloudflare config */ }
});

const node = new DignityP2P({ nodeId: 'player-1', networkAdapter, security });
await node.start();
```

Try the live demo: [docs/chess](https://jose-compu.github.io/dignity.js/chess/) (open two tabs).

---

## Lesson 7 — Small groups vs big audiences

dignity.js has two replication modes:

| Scenario | Mode | API |
|----------|------|-----|
| 2–8 players editing together | Direct mesh | `create` / `update` + `connectToPeers` |
| Thousands of spectators / followers | PeerGroup gossip | `joinPeerGroup` + `publishToPeerGroup` |

**Chess example:** players sync moves on a direct mesh; spectators subscribe via gossip:

```js
// Spectator joins a read-only feed
await spectator.joinPeerGroup('spectate:chess:game-42', {
  bootstrapPeerIds: ['white-host'],
  fanout: 3
});

// Host publishes board state to spectators
await white.publishRecordToPeerGroup('spectate:chess:game-42', 'chess-matches', 'game-42');
```

```js
// Spectator joins a read-only feed (default maxHops is 64 in v0.8+)
await spectator.joinPeerGroup('spectate:chess:game-42', {
  bootstrapPeerIds: ['white-host'],
  fanout: 3
});

// Host publishes board state to spectators
await white.publishRecordToPeerGroup('spectate:chess:game-42', 'chess-matches', 'game-42');
```

See the [PeerGroup docs](https://jose-compu.github.io/dignity.js/#peer-groups) for details.

---

## Lesson 8 — Big feeds with CQRS (v0.8+)

When one publisher has **thousands of followers**, use **tiers** and **domain events** instead of pushing full record snapshots to everyone.

| Piece | Role |
|-------|------|
| **Publisher** | Writes with `create` / `update` / `remove`; events auto-publish to the group |
| **Live tier** | First ~5 000 subscribers get real-time updates |
| **Bulk tier** | Everyone else gets batched updates |
| **Query replica** | Read-only node that builds a local view from events |

```js
const { DignityP2P, DignityQueryReplica, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('dignity.js');

const hub = new InMemoryNetworkHub();
const security = { appPassword: 'feed-secret', powEnabled: false, signingEnabled: false };

const publisher = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const reader = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });

await publisher.start();
await reader.start();

// Alice is the publisher (command path)
await publisher.joinPeerGroup('feed:alice', {
  role: 'publisher',
  tiered: true,
  domainEvents: true
});

// Bob is a read-only follower (query path)
const replica = new DignityQueryReplica(reader, {
  groupId: 'feed:alice',
  collections: ['posts'],
  publisherId: 'alice'
});
await replica.start({ bootstrapPeerIds: ['alice'] });

await publisher.create('posts', { text: 'Hello followers' }, {
  id: 'p1',
  peerGroupId: 'feed:alice'   // ties the write to the gossip group
});

console.log(replica.read('posts', 'p1'));  // local read, no call to Alice
console.log(replica.verifyChain().ok);       // hash chain OK
```

**Key ideas:**

- `peerGroupId` on `create` / `update` / `remove` — emit a signed domain event to that group
- `DignityQueryReplica` — `read` / `list` from a local materialized view
- `tiered: true` + `liveCap` — split live vs bulk subscribers when the audience grows

Try it in the browser: [live playground → CQRS demo](https://jose-compu.github.io/dignity.js/playground/).

---

## Lesson 9 — Persist across reloads (browser)

```js
const { IndexedDBPersistence } = require('dignity.js');

const persistence = new IndexedDBPersistence({
  dbName: 'my-app',
  collections: ['notes', 'games']
});

await node.start();
await persistence.attach(node);
// Records survive page refresh
```

---

## Cheat sheet

```js
// Lifecycle
await node.start();
await node.stop();

// Objects
await node.create(collection, data, { id, broadcastScope, collaborators });
node.read(collection, id);
node.list(collection);
await node.update(collection, id, patch, { expectedVersion });
await node.remove(collection, id);

// Discovery
await node.joinDiscovery(scope, { metadata, bootstrapPeerIds });
node.listPeers(scope);
await node.leaveDiscovery(scope);

// PeerGroup gossip (v0.6+)
await node.joinPeerGroup(groupId, { bootstrapPeerIds, fanout: 3, role: 'publisher' });
await node.publishRecordToPeerGroup(groupId, collection, id);
await node.leavePeerGroup(groupId);

// CQRS tiers + domain events (v0.8+)
await node.joinPeerGroup(groupId, { role: 'publisher', tiered: true, domainEvents: true });
await node.create(collection, data, { id, peerGroupId: groupId });
await node.publishPeerGroupBulk(groupId, 'domain:event', event);  // bulk tier only

const replica = new DignityQueryReplica(node, { groupId, collections: ['posts'], publisherId: 'alice' });
await replica.start({ bootstrapPeerIds: ['alice'] });
replica.read(collection, id);
replica.verifyChain();

// Events
node.on('change', handler);
node.on('domainevent', handler);
node.on('conflict', handler);
node.on('warning', handler);
```

---

## Next steps

| Resource | What it covers |
|----------|----------------|
| [docs/index.html](./docs/index.html) | Full docs site (CQRS, security, v0.10 reference) |
| [docs/api-reference.md](./docs/api-reference.md) | Generated API reference from `openapi-like.json` |
| [docs/browser-compatibility.md](./docs/browser-compatibility.md) | Supported browsers and platform requirements |
| [docs/benchmarks/results.json](./docs/benchmarks/results.json) | Gossip latency and IndexedDB hydration benchmarks |
| [docs/playground/](./docs/playground/) | Live in-browser demos, including CQRS replica |
| [examples/decentralized-tictactoe.js](./examples/decentralized-tictactoe.js) | Small multiplayer game (Node CLI) |
| [docs/tictactoe/](./docs/tictactoe/) | Browser tic-tac-toe (PeerJS onboarding demo) |
| [docs/chess/](./docs/chess/) | Full 3D chess + spectators + dual-signed resume |
| [README.md](./README.md) | Security model, React hooks, signaling |

## Common beginner mistakes

1. **Different `appPassword` per peer** — broadcasts fail to decrypt. Use the same password (or scoped `broadcastPasswords`).
2. **Forgetting `await node.start()`** — messages are never received.
3. **Using in-memory adapter in production** — switch to PeerJS for real browsers.
4. **Leaving default password** — set a strong `appPassword`; never ship `change-this-app-password`.
5. **Updating without checking ownership** — only owner/collaborators can `update`.
6. **Forgetting `peerGroupId` on writes** — domain events only auto-publish when the write is linked to a joined publisher group (v0.8+).

---

Questions or bugs: [GitHub Issues](https://github.com/jose-compu/dignity.js/issues)
