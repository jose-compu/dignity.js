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
  },
  {
    id: 'app-error-panel',
    group: 'apps',
    title: 'Host error panel',
    description: 'attachErrorPanel subscribes to applog, apperror, and apprpcerror; bootstrap auto-captures iframe errors.',
    code: `const {
  DignityP2P,
  DignityQueryReplica,
  DignityAppHost,
  attachErrorPanel,
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

await publisher.joinPeerGroup('feed:errors', {
  role: 'publisher',
  fanout: 2,
  domainEvents: true
});

const replica = new DignityQueryReplica(reader, {
  groupId: 'feed:errors',
  collections: ['posts'],
  publisherId: 'publisher'
});
await replica.start({ bootstrapPeerIds: ['publisher'] });
await helpers.sleep(30);

const manifest = validateDignityAppManifest({
  id: 'error-demo',
  title: 'Error demo',
  collections: ['posts'],
  forwardConsoleLog: true
}).manifest;

const container = document.createElement('div');
container.hidden = true;
document.body.appendChild(container);
helpers.onCleanup(() => container.remove());

const host = new DignityAppHost({ manifest, replica });
const panel = attachErrorPanel(host, container);
helpers.onCleanup(() => {
  panel.destroy();
  host.unmount();
});

const errors = [];
host.on('apperror', (e) => errors.push(e));

host.mount(container, '<html><body><script>dignity.ready().then(function() { dignity.error(\\'demo error\\', \\'stack\\'); console.error(\\'captured\\'); });<\\/script></body></html>');

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('handshake timeout')), 8000);
  host.on('ready', () => {
    clearTimeout(timer);
    resolve();
  });
});

await helpers.sleep(80);
log('apperror events:', errors.length);
log('panel mounted:', Boolean(container.querySelector('.dignity-app-panel--errors')));

await replica.stop();
await publisher.stop();
await reader.stop();`
  },
  {
    id: 'propose-update',
    group: 'core',
    title: 'Delegated move proposals',
    description: 'Non-owner sends proposeUpdate; owner accepts or rejects with proposalresult (#13).',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const host = new DignityP2P({
  nodeId: 'host',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
const joiner = new DignityP2P({
  nodeId: 'joiner',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security
});
helpers.track(host, joiner);
await host.start();
await joiner.start();

await host.create('games', { board: [], turn: 'joiner' }, {
  id: 'g1',
  broadcastScope: 'room:game'
});

const proposals = [];
host.on('proposal', (p) => proposals.push(p));

const results = [];
joiner.on('proposalresult', (r) => results.push(r));

const { proposalId } = await joiner.proposeUpdate('games', 'g1', {
  board: ['X'],
  turn: 'host'
});
await helpers.sleep(40);

log('proposal received:', proposals[0]?.proposalId === proposalId);

await host.acceptProposal(proposals[0], { broadcastScope: 'room:game' });
await helpers.sleep(40);

log('board after accept:', host.read('games', 'g1').data.board);
log('joiner result ok:', results.some((r) => r.ok));

await host.stop();
await joiner.stop();`
  },
  {
    id: 'verification-policies',
    group: 'v013',
    title: 'Verification policies — strict reject',
    description: 'v0.13.0: registerVerification binds collection logic; strict policy rejects remote hash drift.',
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

// Same semver, different rule objects → different verificationHash
alice.registerVerification('scores', {
  code: { min: 0 },
  version: '1.0.0',
  policy: 'strict'
});
bob.registerVerification('scores', {
  code: { min: 100 },
  version: '1.0.0',
  policy: 'strict'
});

const rejected = [];
bob.on('policyrejected', (e) => rejected.push(e));

await alice.create('scores', { points: 5 }, {
  id: 's1',
  broadcastScope: 'room:verify'
});
await helpers.sleep(40);

log('bob accepted record?', bob.read('scores', 's1') !== null);
log('policy rejections:', rejected.length);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'reflective-logic-hashing',
    group: 'v013',
    title: 'Reflective logic hashing',
    description: 'v0.13.0 (#123): fingerprint nested functions with reflective: true — detects tampered business logic.',
    code: `const { DignityP2P, hashReflectiveLogic, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const rulesV1 = {
  currency: 'USD',
  validate(record) {
    return record.data.amount >= 0;
  }
};
const rulesV2 = {
  currency: 'USD',
  validate(record) {
    return record.data.amount >= 999;
  }
};

const hash1 = hashReflectiveLogic(rulesV1, { policy: 'strict' });
const hash2 = hashReflectiveLogic(rulesV2, { policy: 'strict' });
log('hash1 path:', hash1.fingerprintList[0]?.path);
log('hashes differ?', hash1.hash !== hash2.hash);

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob);
await alice.start();
await bob.start();

alice.registerVerification('ledger', {
  code: rulesV1,
  reflective: true,
  version: '0.13.0',
  policy: 'strict'
});
bob.registerVerification('ledger', {
  code: rulesV2,
  reflective: true,
  version: '0.13.0',
  policy: 'strict'
});

await alice.create('ledger', { amount: 10 }, { id: 'a1', broadcastScope: 'room:reflective' });
await helpers.sleep(40);
log('bob accepted?', bob.read('ledger', 'a1') !== null);

await alice.stop();
await bob.stop();`
  },
  {
    id: 'publisher-official-version',
    group: 'v013',
    title: 'Publisher official version (decentralized)',
    description: 'v0.13.0 (#123): trust official dapp 0.N.M + hash per publisherId — no central registry.',
    code: `const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = dignity;

const hub = new InMemoryNetworkHub();
const security = helpers.fastSecurity();

const rules = {
  max: 100,
  validate(record) {
    return record.data.points <= 100;
  }
};

const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });
const carol = new DignityP2P({ nodeId: 'carol', networkAdapter: new InMemoryNetworkAdapter(hub), security });
helpers.track(alice, bob, carol);
await alice.start();
await bob.start();
await carol.start();

// Publisher declares official timeline-demo 0.13.0
alice.registerPublisherVerification('alice', 'posts', {
  code: rules,
  reflective: true,
  version: '0.13.0',
  dappId: 'timeline-demo',
  policy: 'strict'
});

// Bob opts in: alice is the official publisher for posts
bob.registerPublisherVerification('alice', 'posts', {
  code: rules,
  reflective: true,
  version: '0.13.0',
  policy: 'strict'
});

await alice.joinDiscovery('room:official');
await bob.joinDiscovery('room:official', { bootstrapPeerIds: ['alice'] });
await helpers.sleep(40);

const meta = bob.listPeers('room:official', { includeSelf: false })[0]?.metadata?.officialPublishers?.alice?.posts;
log('advertised version:', meta?.verificationVersion);
log('reflective?', meta?.reflective);

await alice.create('posts', { text: 'official write' }, {
  id: 'p1',
  broadcastScope: 'room:official'
});
await helpers.sleep(40);
log('bob replicated?', bob.read('posts', 'p1')?.data?.text);

// Carol is not a trusted official publisher for posts
const carolRejected = [];
bob.on('policyrejected', (e) => carolRejected.push(e));
await carol.create('posts', { text: 'impostor' }, {
  id: 'p2',
  broadcastScope: 'room:official'
});
await helpers.sleep(40);
log('carol write accepted?', bob.read('posts', 'p2') !== null);
log('bob rejections:', carolRejected.length);

await alice.stop();
await bob.stop();
await carol.stop();`
  },
  {
    id: 'identity-create-restore',
    group: 'v140',
    title: 'Identity — create and restore',
    description: 'v1.1.0+: derive Ed25519/Curve25519 keys from credentials; export and restore 48-word mnemonics.',
    code: `const { deriveKeyPairFromCredentials, keyPairToPublicBundle, exportIdentityMnemonic, importIdentityMnemonic } = dignity;

// Create identity from credentials
const keyPair = await deriveKeyPairFromCredentials({
  username: 'alice',
  password: 'secure-password-123'
});

const bundle = keyPairToPublicBundle(keyPair);
log('public key:', bundle.signingPublicKey.slice(0, 16) + '...');
log('encryption key:', bundle.encryptionPublicKey.slice(0, 16) + '...');

// Export as 48-word mnemonic
const mnemonic = await exportIdentityMnemonic(keyPair);
log('word count:', mnemonic.split(' ').length);
log('first 3 words:', mnemonic.split(' ').slice(0, 3).join(' '));

// Restore from mnemonic
const restored = await importIdentityMnemonic(mnemonic);
const restoredBundle = keyPairToPublicBundle(restored);

log('restore matches?', restoredBundle.signingPublicKey === bundle.signingPublicKey);`
  },
  {
    id: 'signed-data-verification',
    group: 'v140',
    title: 'Signed data — sign and verify',
    description: 'Sign arbitrary data with Ed25519 identity; use signDomainEvent for signing and verifyDomainEvent for verification.',
    code: `const { deriveKeyPairFromCredentials, keyPairToPublicBundle, signDomainEvent, verifyDomainEvent } = dignity;

// Create identity
const alice = await deriveKeyPairFromCredentials({ username: 'alice', password: 'pass' });
const bundle = keyPairToPublicBundle(alice);

// Create unsigned event
const event = {
  schemaVersion: '1.0.0',
  eventId: 'evt-1',
  groupId: 'transfer-group',
  publisherId: 'alice',
  kind: 'update',
  collectionName: 'transfers',
  id: 'transfer-123',
  payload: { action: 'transfer', amount: 100, to: 'bob' },
  timestamp: Date.now(),
  baseVersion: null,
  prevHash: null,
  newOwnerId: null,
  verificationHash: null,
  verificationVersion: null,
  eventHash: null,
  signature: null
};

// Sign event
const signed = signDomainEvent(event, alice.signing.secretKey);
log('signature included:', !!signed.signature);
log('event hash:', signed.eventHash.slice(0, 20) + '...');

// Verify signature with correct public key
const valid = verifyDomainEvent(signed, bundle.signingPublicKey);
log('signature valid:', valid);

// Tamper with data
const tampered = { ...signed, payload: { ...signed.payload, amount: 999 } };
const tamperedValid = verifyDomainEvent(tampered, bundle.signingPublicKey);
log('tampered signature valid:', tamperedValid);`
  },
  {
    id: 'data-layer-basics',
    group: 'v140',
    title: 'Data layer — CRUD operations',
    description: 'Create, read, update, delete records with P2P replication.',
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

// Create
const created = await alice.create('tasks', {
  title: 'Learn dignity.js',
  done: false
}, { id: 'task1' });
log('created version:', created.version);

await helpers.sleep(30);

// Read on another peer
const onBob = bob.read('tasks', 'task1');
log('bob sees:', onBob?.data.title);

// Update
const updated = await alice.update('tasks', 'task1', {
  title: 'Learn dignity.js',
  done: true
});
log('updated version:', updated.version);

await helpers.sleep(30);
log('bob sees done:', bob.read('tasks', 'task1')?.data.done);

// List
const list = bob.list('tasks');
log('bob task count:', list.length);

// Delete
await alice.remove('tasks', 'task1');
await helpers.sleep(30);
log('bob after delete:', bob.read('tasks', 'task1'));

await alice.stop();
await bob.stop();`
  },
  {
    id: 'live-stream-public',
    group: 'v140',
    title: 'Live stream — public broadcaster',
    description: 'v1.4.0 (#152): signed media chunks over in-memory signaling; broadcaster → viewer → relay.',
    code: `const {
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle,
  createInMemoryStreamSignalingBus,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  decodeMediaChunkPayload
} = dignity;

const keyPair = await deriveKeyPairFromCredentials({ username: 'broadcaster', password: 'demo' });
const { signingPublicKey } = keyPairToPublicBundle(keyPair);
const signingSecretKey = keyPair.signing.secretKey;

const bus = createInMemoryStreamSignalingBus();

const broadcaster = createPublicStreamBroadcaster({
  sessionId: 'demo-stream',
  broadcasterId: 'broadcaster-1',
  signingSecretKey,
  signingPublicKey,
  bus,
  initialViewerIds: ['viewer-1', 'relay-1']
});

const viewer = createPublicStreamViewer({
  viewerId: 'viewer-1',
  sessionId: 'demo-stream',
  broadcasterId: 'broadcaster-1',
  broadcasterSigningPublicKey: signingPublicKey,
  bus
});

createPublicStreamRelay({
  relayId: 'relay-1',
  upstreamId: 'broadcaster-1',
  sessionId: 'demo-stream',
  broadcasterSigningPublicKey: signingPublicKey,
  broadcasterId: 'broadcaster-1',
  bus,
  downstreamViewerIds: ['viewer-2']
});

const viewer2 = createPublicStreamViewer({
  viewerId: 'viewer-2',
  sessionId: 'demo-stream',
  broadcasterId: 'broadcaster-1',
  broadcasterSigningPublicKey: signingPublicKey,
  bus
});

broadcaster.announce();
viewer.requestJoin();
viewer2.requestJoin();

await helpers.sleep(50);

const chunk = broadcaster.publishChunk(new TextEncoder().encode('video-frame-data'));
await helpers.sleep(50);

log('viewer joined:', viewer.joined);
log('viewer2 joined:', viewer2.joined);
log('viewer chunks:', viewer.chunks.length);
log('viewer2 chunks (via relay):', viewer2.chunks.length);

const decoded = decodeMediaChunkPayload(viewer.chunks[0]);
log('payload:', new TextDecoder().decode(decoded));

broadcaster.close();`
  },
  {
    id: 'stream-access-modes',
    group: 'v140',
    title: 'Stream access — validation',
    description: 'v1.4.0 (#152): validateStreamAccessConfig for public, private-single, private-list, and combined modes.',
    code: `const { STREAM_ACCESS_MODES, validateStreamAccessConfig, createStreamSession, canJoinStream, deriveKeyPairFromCredentials, keyPairToPublicBundle } = dignity;

// Generate identity keys for examples
const alice = await deriveKeyPairFromCredentials({ username: 'alice', password: 'pass' });
const bob = await deriveKeyPairFromCredentials({ username: 'bob', password: 'pass' });
const carol = await deriveKeyPairFromCredentials({ username: 'carol', password: 'pass' });

const aliceId = keyPairToPublicBundle(alice).signingPublicKey;
const bobId = keyPairToPublicBundle(bob).signingPublicKey;
const carolId = keyPairToPublicBundle(carol).signingPublicKey;

// Public mode
const publicRecipients = validateStreamAccessConfig(STREAM_ACCESS_MODES.PUBLIC, {});
log('public recipients:', publicRecipients.length);

// Private single recipient
const singleRecipients = validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_SINGLE, {
  privateRecipients: [aliceId]
});
log('single recipient count:', singleRecipients.length);

// Private list (multiple recipients)
const listRecipients = validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_LIST, {
  privateRecipients: [aliceId, bobId]
});
log('list recipients:', listRecipients.length);

// Combined public + private
const combinedRecipients = validateStreamAccessConfig(STREAM_ACCESS_MODES.COMBINED, {
  privateRecipients: [carolId]
});
log('combined recipients:', combinedRecipients.length);

// Create sessions and check access
const publicSession = createStreamSession({
  sessionId: 'pub-stream',
  broadcasterId: 'broadcaster-1',
  mode: STREAM_ACCESS_MODES.PUBLIC
});

const privateSession = createStreamSession({
  sessionId: 'priv-stream',
  broadcasterId: 'broadcaster-2',
  mode: STREAM_ACCESS_MODES.PRIVATE_LIST,
  privateRecipients: [aliceId, bobId]
});

log('alice can join public:', canJoinStream(publicSession, aliceId));
log('alice can join private:', canJoinStream(privateSession, aliceId));
log('carol can join private:', canJoinStream(privateSession, carolId));

// Invalid mode throws
try {
  validateStreamAccessConfig('invalid-mode', {});
  log('ERROR: should have thrown');
} catch (err) {
  log('invalid mode caught:', err.message.includes('Unknown stream access mode'));
}`
  },
  {
    id: 'webrtc-signaling-bus',
    group: 'v140',
    title: 'WebRTC signaling — stream bus',
    description: 'v1.4.0 (#152): WebRTCStreamSignalingBus routes stream messages over in-memory adapter.',
    code: `const { InMemoryNetworkHub, InMemoryNetworkAdapter, createWebRTCStreamSignalingBus } = dignity;

const hub = new InMemoryNetworkHub();
const adapter1 = new InMemoryNetworkAdapter(hub);
const adapter2 = new InMemoryNetworkAdapter(hub);

await adapter1.start('broadcaster');
await adapter2.start('viewer');

const bus1 = createWebRTCStreamSignalingBus(adapter1, 'broadcaster');
const bus2 = createWebRTCStreamSignalingBus(adapter2, 'viewer');

const received = [];
bus2.subscribe('viewer', (msg) => {
  received.push(msg);
  log('viewer received:', msg.type);
});

await bus1.send('broadcaster', 'viewer', {
  type: 'stream:announce',
  sessionId: 'test-session',
  broadcasterId: 'broadcaster'
});

await helpers.sleep(50);

log('messages received:', received.length);
log('from:', received[0]?.fromPeerId);
log('session:', received[0]?.sessionId);

// Fanout to multiple viewers
await adapter1.start('viewer2');
const adapter3 = new InMemoryNetworkAdapter(hub);
await adapter3.start('viewer2');
const bus3 = createWebRTCStreamSignalingBus(adapter3, 'viewer2');

const received2 = [];
bus3.subscribe('viewer2', (msg) => received2.push(msg));

await bus1.fanout('broadcaster', ['viewer', 'viewer2'], {
  type: 'stream:media-chunk',
  sequence: 1
});

await helpers.sleep(50);

log('viewer got fanout:', received.length > 1);
log('viewer2 got fanout:', received2.length > 0);

bus1.destroy();
bus2.destroy();
bus3.destroy();`
  },
  {
    id: 'stream-private-chunks',
    group: 'v180',
    title: 'Private stream chunks — seal',
    description: 'v1.8.0 package (#152): sealPrivateMediaChunk and openPrivateMediaChunk for private-single and private-list.',
    code: `const {
  STREAM_ACCESS_MODES,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle,
  sealPrivateMediaChunk,
  openPrivateMediaChunk,
  verifyMediaChunk
} = dignity;

const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc', password: 'demo' });
const alice = await deriveKeyPairFromCredentials({ username: 'alice', password: 'demo' });
const spectator = await deriveKeyPairFromCredentials({ username: 'spec', password: 'demo' });

const bcBundle = keyPairToPublicBundle(broadcaster);
const aliceBundle = keyPairToPublicBundle(alice);
const specBundle = keyPairToPublicBundle(spectator);

const chunk = sealPrivateMediaChunk({
  accessMode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
  sessionId: 'demo-priv',
  broadcasterId: 'bc',
  plaintextBytes: new TextEncoder().encode('sealed-frame'),
  signingSecretKey: broadcaster.signing.secretKey,
  signingPublicKey: bcBundle.signingPublicKey,
  broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
  broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
  recipientPublicBundles: [aliceBundle]
});

log('chunk signed:', verifyMediaChunk(chunk, 'demo-priv'));

const plain = openPrivateMediaChunk(chunk, {
  recipientEncryptionSecretKey: alice.encryption.secretKey,
  recipientSigningPublicKey: aliceBundle.signingPublicKey
});
log('recipient plaintext:', new TextDecoder().decode(plain));

let spectatorFailed = false;
try {
  openPrivateMediaChunk(chunk, {
    recipientEncryptionSecretKey: spectator.encryption.secretKey,
    recipientSigningPublicKey: specBundle.signingPublicKey
  });
} catch (err) {
  spectatorFailed = true;
}
log('spectator decrypt failed:', spectatorFailed);`
  },
  {
    id: 'stream-combined-rotation',
    group: 'v180',
    title: 'Combined stream + sender-key rotation',
    description: 'v1.8.0 package (#152): combined public/private session, private layer for allowlist, epoch rotation on removal.',
    code: `const {
  STREAM_ACCESS_MODES,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle,
  createSignedMediaChunk,
  decodeMediaChunkPayload,
  verifyMediaChunk,
  createPrivateSenderKeyEpoch,
  rotatePrivateSenderKeyEpoch,
  sealPrivateMediaChunk,
  openPrivateMediaChunk
} = dignity;

const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc', password: 'demo' });
const alice = await deriveKeyPairFromCredentials({ username: 'alice', password: 'demo' });
const bob = await deriveKeyPairFromCredentials({ username: 'bob', password: 'demo' });
const spectator = await deriveKeyPairFromCredentials({ username: 'spec', password: 'demo' });

const bcBundle = keyPairToPublicBundle(broadcaster);
const aliceBundle = keyPairToPublicBundle(alice);
const bobBundle = keyPairToPublicBundle(bob);
const specBundle = keyPairToPublicBundle(spectator);

const sessionId = 'demo-combined';
const encryptOpts = {
  broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
  broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey
};

const publicChunk = createSignedMediaChunk({
  sessionId,
  broadcasterId: 'origin',
  payloadBytes: new TextEncoder().encode('public-audio'),
  signingSecretKey: broadcaster.signing.secretKey,
  signingPublicKey: bcBundle.signingPublicKey,
  layerId: 'public'
});
log('spectator public:', new TextDecoder().decode(decodeMediaChunkPayload(publicChunk)));

const privateChunk = sealPrivateMediaChunk({
  accessMode: STREAM_ACCESS_MODES.COMBINED,
  sessionId,
  broadcasterId: 'origin',
  plaintextBytes: new TextEncoder().encode('private-video'),
  signingSecretKey: broadcaster.signing.secretKey,
  signingPublicKey: bcBundle.signingPublicKey,
  recipientPublicBundles: [aliceBundle, bobBundle],
  layerId: 'private',
  ...encryptOpts
});
log('private signed:', verifyMediaChunk(privateChunk, sessionId));

const alicePriv = openPrivateMediaChunk(privateChunk, {
  recipientEncryptionSecretKey: alice.encryption.secretKey,
  recipientSigningPublicKey: aliceBundle.signingPublicKey
});
log('alice private:', new TextDecoder().decode(alicePriv));

let spectatorPrivateFailed = false;
try {
  openPrivateMediaChunk(privateChunk, {
    recipientEncryptionSecretKey: spectator.encryption.secretKey,
    recipientSigningPublicKey: specBundle.signingPublicKey
  });
} catch (err) {
  spectatorPrivateFailed = true;
}
log('spectator private failed:', spectatorPrivateFailed);

const epoch1 = createPrivateSenderKeyEpoch({
  recipientPublicBundles: [aliceBundle, bobBundle],
  ...encryptOpts
});
const epoch2 = rotatePrivateSenderKeyEpoch(epoch1, {
  removeRecipientSigningPublicKey: bobBundle.signingPublicKey,
  recipientPublicBundles: [aliceBundle],
  ...encryptOpts
});

const chunkAfterRemoval = sealPrivateMediaChunk({
  accessMode: STREAM_ACCESS_MODES.PRIVATE_LIST,
  sessionId: 'demo-rot',
  broadcasterId: 'origin',
  plaintextBytes: new TextEncoder().encode('after-removal'),
  signingSecretKey: broadcaster.signing.secretKey,
  signingPublicKey: bcBundle.signingPublicKey,
  recipientPublicBundles: [aliceBundle],
  privateSenderKeyEpoch: epoch2,
  ...encryptOpts
});

let bobAfterRemovalFailed = false;
try {
  openPrivateMediaChunk(chunkAfterRemoval, {
    recipientEncryptionSecretKey: bob.encryption.secretKey,
    recipientSigningPublicKey: bobBundle.signingPublicKey
  });
} catch (err) {
  bobAfterRemovalFailed = true;
}
log('bob after rotation failed:', bobAfterRemovalFailed);`
  },
  {
    id: 'stream-framed-chunks',
    group: 'v190',
    title: 'Framed stream chunks (Annex-B / fMP4)',
    description: 'v1.9.0 package (#152): parseAnnexBAccessUnits and parseFmp4Fragments; keyframe on signed media chunks.',
    code: `const {
  parseAnnexBAccessUnits,
  parseFmp4Fragments,
  createSignedMediaChunk,
  verifyMediaChunk,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = dignity;

const annexBytes = new Uint8Array([
  0, 0, 0, 1, 0x65, 0x88, 0x84, 0x00, 0x10,
  0, 0, 0, 1, 0x41, 0x9a, 0x24, 0x11
]);
const fmp4Bytes = new Uint8Array([
  0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0, 105, 115, 111, 109,
  105, 115, 111, 50, 0, 0, 0, 52, 109, 111, 111, 118, 0, 0, 0, 44, 116, 114, 97, 107,
  0, 0, 0, 36, 109, 100, 105, 97, 0, 0, 0, 28, 109, 100, 104, 100, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 3, 232, 0, 0, 3, 232, 0, 0, 0, 84, 109, 111, 111, 102, 0, 0,
  0, 16, 109, 102, 104, 100, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 60, 116, 114, 97, 102,
  0, 0, 0, 12, 116, 102, 104, 100, 0, 0, 0, 0, 0, 0, 0, 16, 116, 102, 100, 116, 0, 0,
  0, 0, 0, 0, 11, 184, 0, 0, 0, 24, 116, 114, 117, 110, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 12, 109, 100, 97, 116, 1, 2, 3, 4
]);

const annexFrames = parseAnnexBAccessUnits(annexBytes);
log('annex frames:', annexFrames.length);
log('first keyframe:', annexFrames[0].keyframe);
log('first timestampMs:', annexFrames[0].timestampMs);

const fmp4Frames = parseFmp4Fragments(fmp4Bytes);
log('fmp4 init keyframe:', fmp4Frames[0].keyframe);
log('fmp4 fragment timestampMs:', fmp4Frames[1].timestampMs);

const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc', password: 'demo' });
const bundle = keyPairToPublicBundle(broadcaster);
const signed = createSignedMediaChunk({
  sessionId: 'framed-demo',
  broadcasterId: 'origin',
  payloadBytes: annexFrames[0].payloadBytes,
  signingSecretKey: broadcaster.signing.secretKey,
  signingPublicKey: bundle.signingPublicKey,
  sequence: 0,
  timestampMs: annexFrames[0].timestampMs,
  mimeType: annexFrames[0].mimeType,
  keyframe: annexFrames[0].keyframe
});
log('signed keyframe:', signed.keyframe);
log('verify:', verifyMediaChunk(signed, 'framed-demo'));`
  },
  {
    id: 'stream-adaptive-layers',
    group: 'v110',
    title: 'Adaptive layers (signed ladder + reports)',
    description: 'v1.10.0 (#152): rendition ladders, bandwidth estimator, hysteresis layer selector.',
    code: `const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  createSignedMediaChunk,
  verifyMediaChunk,
  createReceiverReport,
  createBandwidthEstimator,
  createLayerSelector,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = dignity;

function layerMbps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) / 1000;
}

const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc', password: 'demo' });
const bundle = keyPairToPublicBundle(broadcaster);

for (const layerId of ['L0', 'L1', 'L2']) {
  const chunk = createSignedMediaChunk({
    sessionId: 'adaptive-demo',
    broadcasterId: 'origin',
    payloadBytes: new TextEncoder().encode('frame-' + layerId),
    signingSecretKey: broadcaster.signing.secretKey,
    signingPublicKey: bundle.signingPublicKey,
    layerId,
    profile: RENDITION_PROFILE_HD720,
    keyframe: layerId === 'L0'
  });
  verifyMediaChunk(chunk, 'adaptive-demo');
  log('signed', layerId, 'kbps:', chunk.rendition.videoBitrateKbps);
}

const headroom = 1.2;
const l0Bps = layerMbps('L0') * 1e6 * headroom;
const l1Bps = layerMbps('L1') * 1e6 * headroom;
const l2Bps = layerMbps('L2') * 1e6 * headroom;

const estimator = createBandwidthEstimator({
  floorBps: l0Bps,
  ceilingBps: l2Bps,
  quietGainBps: 80000,
  initialEstimateBps: l2Bps
});
const selector = createLayerSelector({ profile: RENDITION_PROFILE_HD720 });

const steps = [
  { ts: 0, bytes: Math.floor(l2Bps / 8), loss: 0, delay: 0 },
  { ts: 1000, bytes: Math.floor(l1Bps / 8) - 1000, loss: 0, delay: 0 },
  { ts: 1200, bytes: Math.floor(l0Bps / 8) - 5000, loss: 0, delay: 0 },
  { ts: 1500, bytes: Math.floor(l0Bps / 8) - 8000, loss: 0, delay: 0 },
  { ts: 2000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
  { ts: 3500, bytes: Math.floor(l2Bps / 8), loss: 0, delay: 0 }
];

let prev = steps[0].ts;
for (const step of steps) {
  const intervalMs = step.ts - prev || 1000;
  prev = step.ts;
  const report = createReceiverReport({
    sessionId: 'adaptive-demo',
    viewerId: 'viewer-1',
    layerId: selector.getLayerId(),
    timestampMs: step.ts,
    intervalMs,
    bytesReceived: step.bytes,
    packetsReceived: 1000,
    packetsLost: step.loss,
    interarrivalDelayMs: step.delay
  });
  const estimateBps = estimator.observe(report);
  const layer = selector.selectLayer({ estimateBps, nowMs: step.ts });
  log('selected layer:', layer, 'at', step.ts);
}`
  },
  {
    id: 'stream-relay-degrade',
    group: 'v111',
    title: 'Relay per-child layers + playout buffer',
    description: 'v1.11.0 (#152): relay layer policy, enhancement drops first, playout buffer before step-down.',
    code: `const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  createInMemoryStreamSignalingBus,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  createRelayLayerPolicy,
  createReceiverReport,
  createPlayoutBuffer,
  createBandwidthEstimator,
  createLayerSelector,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = dignity;

function layerBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * 1.2;
}

const bus = createInMemoryStreamSignalingBus();
const broadcasterCreds = await deriveKeyPairFromCredentials({ username: 'relay-bc', password: 'demo' });
const bundle = keyPairToPublicBundle(broadcasterCreds);

const l0Bps = layerBps('L0');
const l1Bps = layerBps('L1');
const l2Bps = layerBps('L2');
const policy = createRelayLayerPolicy({
  profile: RENDITION_PROFILE_HD720,
  floorBps: l0Bps,
  ceilingBps: l2Bps,
  quietGainBps: 80000,
  initialEstimateBps: l2Bps
});

const broadcaster = createPublicStreamBroadcaster({
  sessionId: 'relay-degrade-demo',
  broadcasterId: 'origin',
  signingSecretKey: broadcasterCreds.signing.secretKey,
  signingPublicKey: bundle.signingPublicKey,
  bus,
  initialViewerIds: ['relay-1']
});

const relay = createPublicStreamRelay({
  relayId: 'relay-1',
  upstreamId: 'origin',
  sessionId: 'relay-degrade-demo',
  broadcasterSigningPublicKey: bundle.signingPublicKey,
  broadcasterId: 'origin',
  bus,
  downstreamViewerIds: ['child-a', 'child-b'],
  relayLayerPolicy: policy,
  relayChildOptions: {
    'child-a': { initialEstimateBps: l2Bps },
    'child-b': { initialEstimateBps: l2Bps }
  }
});

createPublicStreamViewer({
  viewerId: 'child-a',
  sessionId: 'relay-degrade-demo',
  broadcasterId: 'origin',
  broadcasterSigningPublicKey: bundle.signingPublicKey,
  bus
});
createPublicStreamViewer({
  viewerId: 'child-b',
  sessionId: 'relay-degrade-demo',
  broadcasterId: 'origin',
  broadcasterSigningPublicKey: bundle.signingPublicKey,
  bus
});

void relay;

const playout = createPlayoutBuffer({ raiseStepMs: 50 });
const estimator = createBandwidthEstimator({ floorBps: l0Bps, ceilingBps: l2Bps, initialEstimateBps: l2Bps });
const selector = createLayerSelector({ profile: RENDITION_PROFILE_HD720 });

const steps = [
  { ts: 0, bytes: Math.floor(l2Bps / 8), loss: 0, delay: 0 },
  { ts: 1000, bytes: Math.floor(l1Bps / 8) - 1000, loss: 0, delay: 0 },
  { ts: 1200, bytes: Math.floor(l0Bps / 8) - 5000, loss: 0, delay: 6 },
  { ts: 1500, bytes: Math.floor(l0Bps / 8) - 8000, loss: 50, delay: 12 }
];

let prev = steps[0].ts;
for (const step of steps) {
  const intervalMs = step.ts - prev || 1000;
  prev = step.ts;
  relay.observeChildReport('child-b', createReceiverReport({
    sessionId: 'relay-degrade-demo',
    viewerId: 'child-b',
    layerId: policy.getChildLayer('child-b') || 'L2',
    timestampMs: step.ts,
    intervalMs,
    bytesReceived: step.bytes,
    packetsReceived: 1000,
    packetsLost: step.loss,
    interarrivalDelayMs: step.delay
  }));
  const viewerReport = createReceiverReport({
    sessionId: 'relay-degrade-demo',
    viewerId: 'viewer-b',
    layerId: selector.getLayerId(),
    timestampMs: step.ts,
    intervalMs,
    bytesReceived: step.bytes,
    packetsReceived: 1000,
    packetsLost: step.loss,
    interarrivalDelayMs: step.delay
  });
  const target = playout.observeReport(viewerReport);
  const estimateBps = estimator.observe(viewerReport);
  playout.selectLayerWithBufferGuard(selector, { estimateBps, nowMs: step.ts });
  log('child A layer:', relay.getChildLayer('child-a'));
  log('child B layer:', relay.getChildLayer('child-b'));
  log('buffer target:', target, 'ms');
}`
  },
  {
    id: 'stream-simulcast-load',
    group: 'v112',
    title: 'Simulcast publish + relay load trace',
    description: 'v1.12.0 (#152): origin publishes L0–L2 per tick; relay picks one layer per child; viewer matches relay.',
    code: `const {
  RENDITION_PROFILE_HD720,
  resolveRendition,
  createInMemoryStreamSignalingBus,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  createRelayLayerPolicy,
  createPlayoutBuffer,
  createBandwidthEstimator,
  createLayerSelector,
  runSimulcastLoadTrace,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = dignity;

function layerBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * 1.2;
}

const bus = createInMemoryStreamSignalingBus();
const creds = await deriveKeyPairFromCredentials({ username: 'simulcast-demo', password: 'demo' });
const bundle = keyPairToPublicBundle(creds);
const l0Bps = layerBps('L0');
const l1Bps = layerBps('L1');
const l2Bps = layerBps('L2');
const policy = createRelayLayerPolicy({
  profile: RENDITION_PROFILE_HD720,
  floorBps: l0Bps,
  ceilingBps: l2Bps,
  quietGainBps: 80000,
  initialEstimateBps: l2Bps
});

const broadcaster = createPublicStreamBroadcaster({
  sessionId: 'simulcast-demo',
  broadcasterId: 'origin',
  signingSecretKey: creds.signing.secretKey,
  signingPublicKey: bundle.signingPublicKey,
  bus,
  initialViewerIds: ['relay-1']
});

const relay = createPublicStreamRelay({
  relayId: 'relay-1',
  upstreamId: 'origin',
  sessionId: 'simulcast-demo',
  broadcasterSigningPublicKey: bundle.signingPublicKey,
  broadcasterId: 'origin',
  bus,
  downstreamViewerIds: ['child-a', 'child-b'],
  relayLayerPolicy: policy,
  relayChildOptions: {
    'child-a': { initialEstimateBps: l2Bps },
    'child-b': { initialEstimateBps: l2Bps }
  }
});

const viewerA = createPublicStreamViewer({
  viewerId: 'child-a',
  sessionId: 'simulcast-demo',
  broadcasterId: 'origin',
  broadcasterSigningPublicKey: bundle.signingPublicKey,
  bus
});
const viewerB = createPublicStreamViewer({
  viewerId: 'child-b',
  sessionId: 'simulcast-demo',
  broadcasterId: 'origin',
  broadcasterSigningPublicKey: bundle.signingPublicKey,
  bus
});

broadcaster.announce();
viewerA.requestJoin();
viewerB.requestJoin();

const result = runSimulcastLoadTrace({
  bus,
  broadcaster,
  relay,
  viewerHealthy: viewerA,
  viewerDegraded: viewerB,
  viewerSelectorDegraded: createLayerSelector({ profile: RENDITION_PROFILE_HD720 }),
  playoutDegraded: createPlayoutBuffer({ raiseStepMs: 50 }),
  estimatorDegraded: createBandwidthEstimator({ floorBps: l0Bps, ceilingBps: l2Bps, initialEstimateBps: l2Bps }),
  degradedChildId: 'child-b',
  healthyChildId: 'child-a',
  sessionId: 'simulcast-demo',
  l0Bps,
  l1Bps,
  l2Bps
});

for (const line of result.logLines) {
  log(line);
}
log('healthy relay layer:', result.relayLayerHealthy);`
  },
  {
    id: 'stream-ingest-mpegts',
    group: 'v113',
    title: 'MPEG-TS demux (browser-safe)',
    description: 'v1.13.0 (#152): demux embedded H.264 MPEG-TS sample; reports access units and keyframes.',
    code: `const { demuxMpegTs } = dignity;
const b64 = 'R0AAEAAAsA0AAcEAAAABAQAAAAAA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9HQQAQAAKwEgABwQAA4AAAABsBAQAAAAAAAP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0dBARAAAAHgABmAgAUhAAW/IQAAAAFliIQAEAAAAAFBmiQR////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';
const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const frames = demuxMpegTs(raw);
const keyframes = frames.filter((f) => f.keyframe).length;
log('access units:', frames.length);
log('keyframes:', keyframes);
log('first timestampMs:', frames[0]?.timestampMs ?? 'none');`
  },
  {
    id: 'stream-scale-sim',
    group: 'v114',
    title: 'Scale simulation (10M fan-out model)',
    description: 'v1.14.0 (#152): seeded analytic hops + discrete relay stall sample; one signed chunk verify.',
    code: `const { runScaleSimulation } = dignity;
const result = runScaleSimulation({ profile: 'ci', childAssignment: 'uniform' });
const row10M = result.targets.find((t) => t.viewers === 10000000);
log('viewers:', row10M.viewers);
log('hops:', row10M.hops);
log('chunk verified:', result.chunk.verified);
log('claim:', result.claim.status);
if (result.claim.failedChecks) {
  log('failed checks:', result.claim.failedChecks.join(', '));
}
log('stall rate:', result.stall.stallRate);`
  },
  {
    id: 'stream-capacity-relays',
    group: 'v116',
    title: 'Capacity-aware relay children',
    description: 'v1.16.0 (#152): uplink ÷ forward layer bitrate child budgets on a mixed-uplink tree.',
    code: `const { assignRelayChildren, RENDITION_PROFILE_HD720, layerRequiredBps, DEFAULT_HEADROOM_FACTOR } = dignity;
const forwardBps = layerRequiredBps(RENDITION_PROFILE_HD720, 'L1', DEFAULT_HEADROOM_FACTOR);
const peers = [
  { id: 'leaf-5m', uplinkBps: 5_000_000 },
  { id: 'relay-20m', uplinkBps: 20_000_000 },
  { id: 'relay-50m', uplinkBps: 50_000_000 },
  { id: 'super-1g', uplinkBps: 1_000_000_000 }
];
const budgets = assignRelayChildren({ peers, forwardLayerBps: forwardBps, maxDegree: 16 });
for (const row of budgets) {
  log(row.peerId, 'childBudget:', row.childBudget);
}`
  }
];
