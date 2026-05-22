const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../src');

function initialBoard() {
  return {
    whiteKing: 'e1',
    blackKing: 'e8',
    whitePawnA: 'a2',
    blackPawnA: 'a7'
  };
}

async function runDemo() {
  const hub = new InMemoryNetworkHub();
  const scope = 'room:chess-lite';

  const host = new DignityP2P({
    nodeId: 'host',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: 'demo-shared-password',
      powTargetMs: 100
    }
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

  const joiner = new DignityP2P({
    nodeId: 'joiner',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: 'demo-shared-password',
      powTargetMs: 100
    }
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
