/**
 * Live playground examples — browser-safe, in-memory mesh, PoW disabled for speed.
 * User code receives: dignity (namespace), log (...args), helpers.
 */
export const PLAYGROUND_DEMOS = [
  {
    id: 'two-peers-crud',
    title: 'Two peers — create & read',
    description: 'Wire alice and bob through InMemoryNetworkHub; replicate one object.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const alice = new DignityP2P({
  nodeId: 'alice',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
const bob = new DignityP2P({
  nodeId: 'bob',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});

helpers.track(alice, bob);
await alice.start();
await bob.start();

await alice.create('notes', { title: 'hello decentralized world' }, { id: 'note-1' });
await helpers.sleep(30);

const onBob = bob.read('notes', 'note-1');
log('bob.read:', JSON.stringify(onBob?.data));

await alice.stop();
await bob.stop();`
  },
  {
    id: 'room-discovery',
    title: 'Room discovery — list peers',
    description: 'joinDiscovery on a shared scope and list who is in the room.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const carol = new DignityP2P({ nodeId: 'carol', networkAdapter: new InMemoryNetworkAdapter(hub), security });

helpers.track(alice, bob, carol);
await alice.start();
await bob.start();
await carol.start();

await alice.joinDiscovery('lobby', { metadata: { nickname: 'Alice' } });
await bob.joinDiscovery('lobby', { metadata: { nickname: 'Bob' } });
await carol.joinDiscovery('lobby', { metadata: { nickname: 'Carol' } });
await helpers.sleep(40);

const peers = alice.listPeers('lobby', { includeSelf: false });
log('Peers in lobby:', peers.map((p) => p.peerId).join(', '));
log('Count:', peers.length);

await alice.leaveDiscovery('lobby');
await bob.leaveDiscovery('lobby');
await carol.leaveDiscovery('lobby');
await alice.stop();
await bob.stop();
await carol.stop();`
  },
  {
    id: 'ownership',
    title: 'Ownership — only owner updates',
    description: 'Bob cannot update alice-owned record; alice can.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);
await alice.start();
await bob.start();

await alice.create('games', { score: 0 }, { id: 'g1' });
await helpers.sleep(20);

let bobError = null;
try {
  await bob.update('games', 'g1', { score: 99 });
} catch (err) {
  bobError = err.message;
}
log('bob update rejected:', bobError || 'unexpected success');

await alice.update('games', 'g1', { score: 10 });
await helpers.sleep(20);
log('after alice update:', bob.read('games', 'g1')?.data);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'collaborators',
    title: 'Collaborators — shared edit rights',
    description: 'Owner grants bob collaborator access on one record.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);
await alice.start();
await bob.start();

await alice.create('docs', { body: 'draft' }, { id: 'd1', collaborators: ['bob'] });
await helpers.sleep(20);

await bob.update('docs', 'd1', { body: 'edited by bob' });
await helpers.sleep(20);

log('alice sees:', alice.read('docs', 'd1')?.data);
log('bob sees:', bob.read('docs', 'd1')?.data);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'direct-message',
    title: 'Direct messaging — encrypted DM',
    description: 'Register peer keys and send a direct message.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity({ signingEnabled: true, encryptionEnabled: true });

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);

let received = null;
bob.on('message', (event) => {
  if (event.senderId === 'alice' && event.type === 'chat') {
    received = event.payload;
  }
});

await alice.start();
await bob.start();

alice.registerPeerPublicKey('bob', bob.getPublicKey());
bob.registerPeerPublicKey('alice', alice.getPublicKey());

await alice.sendDirectMessage('bob', 'chat', { text: 'private hello' });
await helpers.sleep(40);

log('bob received:', received);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'content-hash',
    title: 'Content hash — record.hash',
    description: 'Each record exposes a sha512 digest over canonical data.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const node = new DignityP2P({ nodeId: 'solo', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(node);
await node.start();

const created = await node.create('notes', { title: 'hash me' }, { id: 'n1' });
log('hash prefix:', created.hash?.slice(0, 12) + '...');
log('full hash:', created.hash);

const updated = await node.update('notes', 'n1', { title: 'hash me v2' });
log('hash changed:', updated.hash !== created.hash);

await node.stop();`
  },
  {
    id: 'concurrency',
    title: 'Concurrency — expectedVersion conflict',
    description: 'Stale baseVersion is rejected; listen for conflict events.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);

const conflicts = [];
bob.on('conflict', (event) => conflicts.push(event));

await alice.start();
await bob.start();

const record = await alice.create('scores', { points: 0 }, { id: 's1', collaborators: ['bob'] });
await helpers.sleep(20);

await bob.update('scores', 's1', { points: 5 });
await helpers.sleep(20);

let staleError = null;
try {
  await alice.update('scores', 's1', { points: 1 }, { expectedVersion: record.version });
} catch (err) {
  staleError = err.message;
}

log('stale write error:', staleError || 'none');
log('conflict events on bob:', conflicts.length);
log('final score:', bob.read('scores', 's1')?.data);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'scoped-passwords',
    title: 'Scoped broadcast passwords',
    description: 'Different broadcastScope values use different team passwords.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();

const red = new DignityP2P({
  nodeId: 'red-1',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security: helpers.fastSecurity({
    appPassword: 'fallback',
    broadcastPasswords: { 'team:red': 'red-secret', 'team:blue': 'blue-secret' }
  })
});
const blue = new DignityP2P({
  nodeId: 'blue-1',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security: helpers.fastSecurity({
    appPassword: 'fallback',
    broadcastPasswords: { 'team:red': 'red-secret', 'team:blue': 'blue-secret' }
  })
});
helpers.track(red, blue);
await red.start();
await blue.start();

await red.create('flags', { team: 'red' }, { id: 'f1', broadcastScope: 'team:red' });
await blue.create('flags', { team: 'blue' }, { id: 'f2', broadcastScope: 'team:blue' });
await helpers.sleep(40);

log('red sees own:', !!red.read('flags', 'f1'));
log('red sees blue flag:', !!red.read('flags', 'f2'));
log('blue sees red flag:', !!blue.read('flags', 'f1'));

await red.stop();
await blue.stop();`
  },
  {
    id: 'credential-keys',
    title: 'Credential-derived keys',
    description: 'Derive the same signing/encryption keys from username + password.',
    code: `const { deriveKeyPairFromCredentials, keyPairToPublicBundle } = dignity;

const opts = { username: 'alice', password: 'user-secret', kdfIterations: 1000 };

const first = await deriveKeyPairFromCredentials(opts);
const second = await deriveKeyPairFromCredentials(opts);

const a = keyPairToPublicBundle(first);
const b = keyPairToPublicBundle(second);

log('same signing key:', a.signingPublicKey === b.signingPublicKey);
log('same encryption key:', a.encryptionPublicKey === b.encryptionPublicKey);
log('generation:', first.generation);

const gen2 = await deriveKeyPairFromCredentials({ ...opts, generation: 2 });
log('gen2 differs:', keyPairToPublicBundle(gen2).signingPublicKey !== a.signingPublicKey);`
  },
  {
    id: 'identity-rotation',
    title: 'Identity rotation — peer adopts new keys',
    description: 'Rotate generation, adopt keys locally, broadcast to a peer.',
    code: `const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle,
  revokeAndRotateIdentity
} = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity({ signingEnabled: true, encryptionEnabled: true });

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);

const gen1 = await deriveKeyPairFromCredentials({
  username: 'alice',
  password: 'secret',
  generation: 1,
  kdfIterations: 1000
});

const rotationResult = await revokeAndRotateIdentity({
  username: 'alice',
  password: 'secret',
  currentGeneration: 1,
  kdfIterations: 1000,
  reason: 'demo rotation'
});

await alice.start();
await bob.start();

await alice.adoptDerivedIdentityKeyPair(gen1, { generation: 1 });
bob.registerPeerPublicKey('alice', keyPairToPublicBundle(gen1), { generation: 1 });
log('bob gen before:', bob.getPeerIdentityGeneration('alice'));

// Broadcast while alice still signs with gen-1 keys; then adopt gen-2 locally.
await alice.broadcastIdentityRotation(rotationResult.rotation, { broadcastScope: 'identity:alice' });
await alice.adoptDerivedIdentityKeyPair(rotationResult.nextKeyPair, { generation: 2 });
await helpers.sleep(50);

log('bob gen after:', bob.getPeerIdentityGeneration('alice'));
log('keys upgraded:', bob.getPeerIdentityState('alice')?.publicKey?.signingPublicKey
  === keyPairToPublicBundle(rotationResult.nextKeyPair).signingPublicKey);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'cqrs-replica',
    title: 'CQRS — publisher + query replica',
    description: 'Domain events from a tiered PeerGroup hydrate a read-only DignityQueryReplica.',
    code: `const { DignityP2P, DignityQueryReplica, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const publisher = new DignityP2P({
  nodeId: 'publisher',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
const reader = new DignityP2P({
  nodeId: 'reader',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});

helpers.track(publisher, reader);
await publisher.start();
await reader.start();

await publisher.joinPeerGroup('feed:demo', {
  role: 'publisher',
  tiered: true,
  liveCap: 100,
  domainEvents: true,
  fanout: 2,
  maxActivePeers: 4
});

const replica = new DignityQueryReplica(reader, {
  groupId: 'feed:demo',
  collections: ['posts'],
  publisherId: 'publisher'
});
await replica.start({ bootstrapPeerIds: ['publisher'] });
await helpers.sleep(40);

await publisher.create('posts', { text: 'CQRS demo post' }, {
  id: 'p1',
  peerGroupId: 'feed:demo'
});
await helpers.sleep(60);

const record = replica.read('posts', 'p1');
log('replica read:', JSON.stringify(record?.data));
log('chain ok:', replica.verifyChain().ok);
log('stats:', JSON.stringify(replica.getViewStats()));

await replica.stop();
await publisher.stop();
await reader.stop();`
  },
  {
    id: 'transfer-ownership',
    group: 'patterns',
    title: 'Transfer ownership (turn-based moves)',
    description: 'Hand off record owner each turn — pattern used by the browser tic-tac-toe demo.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);
await alice.start();
await bob.start();

await alice.joinDiscovery('room:ttt', { metadata: { role: 'host' } });
await bob.joinDiscovery('room:ttt', { metadata: { role: 'join' }, bootstrapPeerIds: ['alice'] });
await helpers.sleep(30);

await alice.create('games', {
  board: ['X', null, null, null, null, null, null, null, null],
  turn: 'alice',
  status: 'playing'
}, { id: 'ttt-1', broadcastScope: 'room:ttt' });
await helpers.sleep(30);

log('owner after create:', alice.read('games', 'ttt-1')?.ownerId);

await alice.update('games', 'ttt-1', {
  board: ['X', 'O', null, null, null, null, null, null, null],
  turn: 'bob'
}, { broadcastScope: 'room:ttt' });
await alice.transferOwnership('games', 'ttt-1', 'bob', {
  broadcastScope: 'room:ttt',
  keepAsCollaborator: false
});
await helpers.sleep(30);

log('owner after handoff:', bob.read('games', 'ttt-1')?.ownerId);
log('bob can update:', bob.read('games', 'ttt-1')?.ownerId === 'bob');

let aliceRejected = null;
try {
  await alice.update('games', 'ttt-1', { turn: 'alice' });
} catch (err) {
  aliceRejected = err.message;
}
log('alice update rejected:', aliceRejected || 'unexpected');

await alice.stop();
await bob.stop();`
  },
  {
    id: 'late-joiner-snapshot',
    group: 'patterns',
    title: 'Late joiner snapshot',
    description: 'pushRecordSnapshot catches up a peer that missed the initial create (PeerJS pattern).',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const host = new DignityP2P({ nodeId: 'host', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const joiner = new DignityP2P({ nodeId: 'joiner', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(host, joiner);
await host.start();
await joiner.start();

await host.create('matches', { fen: 'start', move: 0 }, { id: 'g1', broadcastScope: 'room:chess' });
await helpers.sleep(20);

log('joiner before snapshot:', joiner.read('matches', 'g1'));

await host.pushRecordSnapshot('matches', 'g1', {
  broadcastScope: 'room:chess',
  connectToPeers: ['joiner']
});
await helpers.sleep(40);

const restored = joiner.read('matches', 'g1');
log('joiner after snapshot:', restored?.data);
log('hash present:', Boolean(restored?.hash));

await host.stop();
await joiner.stop();`
  },
  {
    id: 'peerjs-ice-config',
    group: 'patterns',
    title: 'PeerJS iceServers config',
    description: 'Create a PeerJS network adapter with custom STUN/TURN — used in production browser demos.',
    code: `const { createPeerJSNetworkAdapter } = dignity;

const adapter = createPeerJSNetworkAdapter({
  urls: ['wss://your-signaling.example/peerjs?key=peerjs'],
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  connectTimeoutMs: 12000
});

log('signaling urls:', adapter.urls);
log('iceServers:', JSON.stringify(adapter.iceServers));
log('See docs/browser-compatibility.md#peerjs-ice-turn for deployment notes.');
log('Live demos: docs/chess/ and docs/tictactoe/');`
  },
  {
    id: 'app-manifest',
    group: 'apps',
    title: 'App manifest validation',
    description: 'Declare collections, CSP origins, and pre-approved stored write commands.',
    code: `const { validateDignityAppManifest } = dignity;

const result = validateDignityAppManifest({
  id: 'timeline',
  title: 'Event timeline',
  collections: ['posts'],
  peerGroupId: 'feed:alice',
  allowedCspOrigins: ['https://cdn.example.com'],
  storedCommands: [{
    id: 'create-post',
    collection: 'posts',
    kind: 'create',
    allowedFields: ['text']
  }, {
    id: 'upvote',
    collection: 'posts',
    kind: 'update',
    allowedFields: ['upvotes']
  }]
});

log('valid:', result.ok);
log('collections:', result.manifest.collections.join(', '));
log('connect-src:', result.manifest.allowedCspOrigins[0]);
log('stored commands:', result.manifest.storedCommands.map((c) => c.id).join(', '));`
  },
  {
    id: 'app-csp',
    group: 'apps',
    title: 'Sandbox CSP policy',
    description: 'Immutable Content-Security-Policy for iframe apps — https allowlist only.',
    code: `const { buildAppCsp, validateDignityAppManifest } = dignity;

const { manifest } = validateDignityAppManifest({
  id: 'reader',
  title: 'Reader',
  collections: ['posts'],
  allowedCspOrigins: ['https://cdn.example.com']
});

const csp = buildAppCsp(manifest);
log(csp);
log('blocks localhost:', !csp.includes('localhost'));
log('allows CDN:', csp.includes('https://cdn.example.com'));`
  },
  {
    id: 'app-bridge-query',
    group: 'apps',
    title: 'App query over bridge',
    description: 'Publisher writes domain events; replica hydrates; RPC query returns read-only data.',
    code: `const {
  DignityP2P,
  DignityQueryReplica,
  createHostRpcHandler,
  validateDignityAppManifest,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const publisher = new DignityP2P({
  nodeId: 'publisher',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
const reader = new DignityP2P({
  nodeId: 'reader',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
helpers.track(publisher, reader);
await publisher.start();
await reader.start();

await publisher.joinPeerGroup('feed:timeline', {
  role: 'publisher',
  fanout: 2,
  maxActivePeers: 4,
  domainEvents: true
});

const replica = new DignityQueryReplica(reader, {
  groupId: 'feed:timeline',
  collections: ['posts'],
  publisherId: 'publisher'
});
await replica.start({ bootstrapPeerIds: ['publisher'] });
await helpers.sleep(30);

await publisher.create('posts', { text: 'from publisher' }, {
  id: 'p1',
  peerGroupId: 'feed:timeline'
});
await helpers.sleep(40);

const manifest = validateDignityAppManifest({
  id: 'timeline',
  title: 'Timeline',
  collections: ['posts'],
  peerGroupId: 'feed:timeline'
}).manifest;

const bridge = createHostRpcHandler({ manifest, replica });
const response = await bridge.handle({
  rpcId: 'q1',
  method: 'query',
  params: { collection: 'posts', filter: { ownerId: 'publisher' } }
});

log('rpc ok:', response.ok);
log('records:', JSON.stringify(response.result.records.map((r) => r.data)));

await replica.stop();
await publisher.stop();
await reader.stop();`
  },
  {
    id: 'app-stored-command',
    group: 'apps',
    title: 'Stored command writes',
    description: 'Sandboxed apps may only run manifest-declared create/update/delete commands.',
    code: `const {
  DignityP2P,
  executeStoredCommand,
  validateDignityAppManifest,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const publisher = new DignityP2P({
  nodeId: 'publisher',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
helpers.track(publisher);
await publisher.start();
await publisher.joinPeerGroup('feed:app', { role: 'publisher' });

const manifest = validateDignityAppManifest({
  id: 'social',
  title: 'Social',
  collections: ['posts'],
  peerGroupId: 'feed:app',
  storedCommands: [{
    id: 'upvote',
    collection: 'posts',
    kind: 'update',
    allowedFields: ['upvotes']
  }]
}).manifest;

await publisher.create('posts', { upvotes: 0, text: 'hi' }, {
  id: 'p1',
  peerGroupId: 'feed:app'
});

const ok = await executeStoredCommand(publisher, manifest, 'upvote', {
  id: 'p1',
  patch: { upvotes: 1 }
});
log('stored command ok:', ok.ok);

const blocked = await executeStoredCommand(publisher, manifest, 'upvote', {
  id: 'p1',
  patch: { text: 'hacked' }
});
log('disallowed field rejected:', blocked.reason);

log('upvotes:', publisher.read('posts', 'p1')?.data.upvotes);

await publisher.stop();`
  },
  {
    id: 'app-sandbox-host',
    group: 'apps',
    title: 'Sandboxed iframe host',
    description: 'DignityAppHost injects CSP, opens MessageChannel, and serves query RPC to the iframe.',
    code: `const {
  DignityP2P,
  DignityQueryReplica,
  DignityAppHost,
  validateDignityAppManifest,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const publisher = new DignityP2P({
  nodeId: 'publisher',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
const reader = new DignityP2P({
  nodeId: 'reader',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
helpers.track(publisher, reader);
await publisher.start();
await reader.start();

await publisher.joinPeerGroup('feed:app', {
  role: 'publisher',
  fanout: 2,
  domainEvents: true
});

const replica = new DignityQueryReplica(reader, {
  groupId: 'feed:app',
  collections: ['posts'],
  publisherId: 'publisher'
});
await replica.start({ bootstrapPeerIds: ['publisher'] });
await helpers.sleep(30);

await publisher.create('posts', { text: 'sandboxed read' }, {
  id: 'p1',
  peerGroupId: 'feed:app'
});
await helpers.sleep(40);

const manifest = validateDignityAppManifest({
  id: 'reader',
  title: 'Reader',
  collections: ['posts'],
  allowedCspOrigins: ['https://cdn.example.com']
}).manifest;

const container = document.createElement('div');
container.hidden = true;
document.body.appendChild(container);
helpers.onCleanup(() => {
  container.remove();
});

const host = new DignityAppHost({ manifest, replica });
helpers.onCleanup(() => host.unmount());

host.mount(container, '<html><head></head><body><p>App</p></body></html>');

const iframe = container.querySelector('iframe');
log('sandbox:', iframe.getAttribute('sandbox'));
log('csp injected:', iframe.srcdoc.includes('Content-Security-Policy'));

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('handshake timeout')), 8000);
  host.on('ready', () => {
    clearTimeout(timer);
    resolve();
  });
});

const rows = await host.rpc('query', { collection: 'posts' });
log('host query rows:', rows.length);
log('first post:', rows[0]?.data?.text);

await replica.stop();
await publisher.stop();
await reader.stop();`
  }
];
