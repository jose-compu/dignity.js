/**
 * Node.js chess-lite example (in-memory peers, no WebRTC).
 *
 * Run: npm run example:chess
 *
 * Demonstrates:
 * - Credential-derived signing keys (deriveKeyPairFromCredentials)
 * - Room discovery and scoped broadcast
 * - Replicated match state (create / update / read)
 * - Owner authorization on moves
 *
 * For the browser 3D demo (PeerJS, dual-signed resume, IndexedDB), see:
 *   docs/chess/   — rebuild with: npm run build:chess
 */
const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  deriveKeyPairFromCredentials
} = require('../src');

const ROOM_PASSWORD = 'chess-lite-room-secret';
const HOST_USERNAME = 'alice';
const HOST_PASSWORD = 'host-pass-demo';
const JOINER_USERNAME = 'bob';
const JOINER_PASSWORD = 'joiner-pass-demo';

function initialBoard() {
  return {
    whiteKing: 'e1',
    blackKing: 'e8',
    whitePawnA: 'a2',
    blackPawnA: 'a7'
  };
}

async function buildNode({ nodeId, username, password, hub }) {
  const keyPair = await deriveKeyPairFromCredentials({
    username,
    password,
    pepper: `chess-lite:${nodeId}`,
    kdfIterations: 10000
  });

  return new DignityP2P({
    nodeId,
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: ROOM_PASSWORD,
      powTargetMs: 100,
      keyPair
    }
  });
}

async function runDemo() {
  const hub = new InMemoryNetworkHub();
  const scope = 'room:chess-lite';

  console.log('Signing keys derived from username + password (pepper: chess-lite:<nodeId>)');
  console.log(`  host:   ${HOST_USERNAME}`);
  console.log(`  joiner: ${JOINER_USERNAME}`);
  console.log(`  room broadcast password: ${ROOM_PASSWORD}\n`);

  const host = await buildNode({
    nodeId: 'host',
    username: HOST_USERNAME,
    password: HOST_PASSWORD,
    hub
  });

  await host.start();
  await host.joinDiscovery(scope, {
    metadata: { nickname: 'host', role: 'owner' },
    heartbeatIntervalMs: 100000,
    ttlMs: 30000
  });

  // Host creates before joiner is online — joiner never receives the create op.
  await host.create(
    'matches',
    {
      type: 'chess-lite',
      board: initialBoard(),
      moveHistory: [],
      status: 'waiting'
    },
    { id: 'match-1', broadcastScope: scope }
  );

  const joiner = await buildNode({
    nodeId: 'joiner',
    username: JOINER_USERNAME,
    password: JOINER_PASSWORD,
    hub
  });

  await joiner.start();
  await joiner.joinDiscovery(scope, {
    metadata: { nickname: 'joiner', role: 'player' },
    bootstrapPeerIds: ['host'],
    heartbeatIntervalMs: 100000,
    ttlMs: 30000
  });

  console.log('\nJoiner before snapshot:', joiner.read('matches', 'match-1'));

  const warnings = [];
  joiner.on('warning', (event) => warnings.push(event));

  await host.update(
    'matches',
    'match-1',
    { status: 'playing', blackPlayerId: 'joiner' },
    {
      broadcastScope: scope,
      collaborators: ['host', 'joiner']
    }
  );

  console.log('\nJoiner after update (still missing create):', joiner.read('matches', 'match-1'));
  console.log('Orphan warnings:', warnings.filter((event) => event.type === 'orphan-operation').length);

  await host.pushRecordSnapshot('matches', 'match-1', {
    broadcastScope: scope,
    connectToPeers: ['joiner']
  });

  const scriptedMoves = [
    { from: 'a2', to: 'a4', piece: 'whitePawnA' },
    { from: 'a7', to: 'a5', piece: 'blackPawnA' }
  ];

  for (const move of scriptedMoves) {
    const match = host.read('matches', 'match-1');
    const board = { ...match.data.board, [move.piece]: move.to };
    const moveHistory = [...match.data.moveHistory, move];

    await host.update(
      'matches',
      'match-1',
      {
        board,
        moveHistory,
        lastMove: move
      },
      { broadcastScope: scope }
    );
  }

  const hostState = host.read('matches', 'match-1');
  const joinerState = joiner.read('matches', 'match-1');

  console.log('\nHost state:');
  console.log(JSON.stringify(hostState.data, null, 2));

  console.log('\nJoiner replicated state (after snapshot + moves):');
  console.log(JSON.stringify(joinerState.data, null, 2));

  await host.leaveDiscovery(scope);
  await joiner.leaveDiscovery(scope);
  await host.stop();
  await joiner.stop();
}

runDemo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
