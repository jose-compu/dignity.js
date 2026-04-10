const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../src');

function printBoard(cells) {
  const safe = cells.map((v) => (v === null ? ' ' : v));
  console.log(`\n ${safe[0]} | ${safe[1]} | ${safe[2]} `);
  console.log('---+---+---');
  console.log(` ${safe[3]} | ${safe[4]} | ${safe[5]} `);
  console.log('---+---+---');
  console.log(` ${safe[6]} | ${safe[7]} | ${safe[8]} `);
}

async function runDemo() {
  const hub = new InMemoryNetworkHub();

  const alice = new DignityP2P({
    nodeId: 'alice',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: 'demo-shared-password',
      powTargetMs: 100
    }
  });

  const bob = new DignityP2P({
    nodeId: 'bob',
    networkAdapter: new InMemoryNetworkAdapter(hub),
    security: {
      appPassword: 'demo-shared-password',
      powTargetMs: 100
    }
  });

  await alice.start();
  await bob.start();
  await alice.joinDiscovery('room:tictactoe', {
    metadata: { nickname: 'alice', role: 'host' },
    heartbeatIntervalMs: 100000,
    ttlMs: 30000
  });
  await bob.joinDiscovery('room:tictactoe', {
    metadata: { nickname: 'bob', role: 'guest' },
    heartbeatIntervalMs: 100000,
    ttlMs: 30000
  });

  console.log(
    '\nPeers visible from Alice in room:tictactoe:',
    alice.listPeers('room:tictactoe', { includeSelf: false }).map((peer) => peer.peerId)
  );

  await alice.create(
    'games',
    {
      type: 'tictactoe',
      board: Array(9).fill(null),
      nextPlayer: 'alice',
      players: ['alice', 'bob']
    },
    { id: 'ttt-1', broadcastScope: 'room:tictactoe' }
  );

  // Owner-updated canonical state for v0.1.0:
  // participants can propose moves, while owner commits official updates.
  const moves = [
    { actor: alice, playerId: 'alice', index: 0, mark: 'X' },
    { actor: alice, playerId: 'alice', index: 4, mark: 'O' },
    { actor: alice, playerId: 'alice', index: 8, mark: 'X' }
  ];

  for (const move of moves) {
    const game = move.actor.read('games', 'ttt-1');
    const board = [...game.data.board];
    board[move.index] = move.mark;

    const nextPlayer = move.playerId === 'alice' ? 'bob' : 'alice';
    await move.actor.update(
      'games',
      'ttt-1',
      {
        board,
        nextPlayer,
        lastMove: { by: move.playerId, index: move.index, mark: move.mark }
      },
      { broadcastScope: 'room:tictactoe' }
    );
  }

  try {
    await bob.update('games', 'ttt-1', { illegal: true });
  } catch (error) {
    console.log('\\nExpected owner rule:', error.message);
  }

  const finalFromAlice = alice.read('games', 'ttt-1');
  const finalFromBob = bob.read('games', 'ttt-1');

  console.log('\nFinal board from Alice node:');
  printBoard(finalFromAlice.data.board);

  console.log('\nReplicated board from Bob node:');
  printBoard(finalFromBob.data.board);

  await alice.leaveDiscovery('room:tictactoe');
  await bob.leaveDiscovery('room:tictactoe');
  await alice.stop();
  await bob.stop();
}

runDemo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
