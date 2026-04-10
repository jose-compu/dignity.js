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

  const host = new DignityP2P({
    nodeId: 'host',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: 'demo-shared-password',
      powTargetMs: 100
    }
  });

  const observer = new DignityP2P({
    nodeId: 'observer',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: 'demo-shared-password',
      powTargetMs: 100
    }
  });

  await host.start();
  await observer.start();
  await host.joinDiscovery('room:chess-lite', {
    metadata: { nickname: 'host', role: 'owner' },
    heartbeatIntervalMs: 100000,
    ttlMs: 30000
  });
  await observer.joinDiscovery('room:chess-lite', {
    metadata: { nickname: 'observer', role: 'viewer' },
    heartbeatIntervalMs: 100000,
    ttlMs: 30000
  });

  console.log(
    '\nPeers visible from host in room:chess-lite:',
    host.listPeers('room:chess-lite', { includeSelf: false }).map((peer) => peer.peerId)
  );

  await host.create(
    'matches',
    {
      type: 'chess-lite',
      board: initialBoard(),
      moveHistory: []
    },
    { id: 'match-1', broadcastScope: 'room:chess-lite' }
  );

  const scriptedMoves = [
    { from: 'a2', to: 'a4', piece: 'whitePawnA' },
    { from: 'a7', to: 'a5', piece: 'blackPawnA' },
    { from: 'e1', to: 'e2', piece: 'whiteKing' }
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
      { broadcastScope: 'room:chess-lite' }
    );
  }

  const hostState = host.read('matches', 'match-1');
  const observerState = observer.read('matches', 'match-1');

  console.log('\nHost state:');
  console.log(JSON.stringify(hostState.data, null, 2));

  console.log('\nObserver replicated state:');
  console.log(JSON.stringify(observerState.data, null, 2));

  await host.leaveDiscovery('room:chess-lite');
  await observer.leaveDiscovery('room:chess-lite');
  await host.stop();
  await observer.stop();
}

runDemo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
