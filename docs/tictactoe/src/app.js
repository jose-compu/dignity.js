import {
  DignityP2P,
  createPeerJSNetworkAdapter,
  DEFAULT_CLOUDFLARE_SIGNALING_URLS
} from '../../../src/index.js';

const ROOM_PREFIX = 'room:tictactoe';
const COLLECTION = 'ttt-games';
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const state = {
  nickname: localStorage.getItem('ttt-nickname') || 'Player',
  route: parseRoute(),
  node: null,
  game: null,
  status: 'idle',
  error: '',
  hostLink: '',
  joinLink: '',
  joinerTimer: null
};

function parseRoute() {
  const params = Object.fromEntries(new URLSearchParams(window.location.hash.replace(/^#/, '')));
  return {
    gameId: params.game || null,
    role: params.role || 'lobby',
    roomKey: params.room || null,
    hostPeer: params.host || null
  };
}

function randomToken(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, length);
}

function scopeForGame(gameId) {
  return `${ROOM_PREFIX}:${gameId}`;
}

function detectWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell)) {
    return 'draw';
  }
  return null;
}

function render() {
  const root = document.getElementById('app');
  if (!root) {
    return;
  }

  if (state.route.role === 'lobby' || !state.route.gameId) {
    root.innerHTML = `
      <section class="ttt-card">
        <h1>Tic-tac-toe on dignity.js</h1>
        <p>PeerJS mesh demo with room discovery and owner-only move enforcement.</p>
        <label>
          Nickname
          <input id="nickname" value="${escapeHtml(state.nickname)}" maxlength="24" />
        </label>
        <div class="ttt-actions">
          <button type="button" class="primary" id="create-game">Start new game</button>
        </div>
        <label>
          Join from link
          <textarea id="join-link" rows="3" placeholder="Paste host or join link"></textarea>
        </label>
        <button type="button" class="secondary" id="open-link">Open link</button>
        ${state.error ? `<p class="ttt-error" role="alert">${escapeHtml(state.error)}</p>` : ''}
      </section>
    `;

    document.getElementById('nickname')?.addEventListener('change', (event) => {
      state.nickname = event.target.value.trim() || 'Player';
      localStorage.setItem('ttt-nickname', state.nickname);
    });
    document.getElementById('create-game')?.addEventListener('click', startHostGame);
    document.getElementById('open-link')?.addEventListener('click', () => {
      const raw = document.getElementById('join-link')?.value?.trim();
      if (!raw) {
        return;
      }
      const hashIndex = raw.indexOf('#');
      window.location.hash = hashIndex >= 0 ? raw.slice(hashIndex + 1) : raw;
      state.route = parseRoute();
      boot();
    });
    return;
  }

  const board = state.game?.data?.board || Array(9).fill(null);
  const winner = state.game?.data?.winner || detectWinner(board);
  const currentPlayer = state.game?.data?.nextPlayer;
  const myMark = state.route.role === 'host' ? 'X' : 'O';
  const canPlay = state.game?.data?.status === 'playing'
    && currentPlayer === state.node?.nodeId
    && state.game?.ownerId === state.node?.nodeId
    && !winner;

  root.innerHTML = `
    <section class="ttt-card">
      <p class="eyebrow">Game ${escapeHtml(state.route.gameId)} · ${escapeHtml(state.nickname)} (${myMark})</p>
      <h1>${state.status === 'connecting' ? 'Connecting…' : 'Tic-tac-toe'}</h1>
      <p class="ttt-status">${escapeHtml(statusMessage(winner, currentPlayer, myMark))}</p>
      <div class="ttt-grid" role="grid" aria-label="Tic-tac-toe board">
        ${board.map((mark, index) => `
          <button
            type="button"
            class="ttt-cell secondary"
            data-index="${index}"
            ${!canPlay || mark ? 'disabled' : ''}
            aria-label="Cell ${index + 1}${mark ? `, ${mark}` : ''}"
          >${mark || ''}</button>
        `).join('')}
      </div>
      ${state.error ? `<p class="ttt-error" role="alert">${escapeHtml(state.error)}</p>` : ''}
      ${state.hostLink ? `<p class="ttt-link"><strong>Invite link:</strong> ${escapeHtml(state.hostLink)}</p>` : ''}
      ${state.joinLink ? `<p class="ttt-link"><strong>Join link:</strong> ${escapeHtml(state.joinLink)}</p>` : ''}
      <div class="ttt-actions">
        <button type="button" class="ghost" id="back-lobby">← Lobby</button>
      </div>
    </section>
  `;

  root.querySelectorAll('.ttt-cell').forEach((button) => {
    button.addEventListener('click', () => playMove(Number(button.dataset.index)));
  });
  document.getElementById('back-lobby')?.addEventListener('click', () => {
    window.location.hash = '';
    teardown().then(() => {
      state.route = parseRoute();
      render();
    });
  });
}

function statusMessage(winner, currentPlayer, myMark) {
  if (winner === 'draw') {
    return 'Draw game.';
  }
  if (winner) {
    const youWon = (winner === 'X' && myMark === 'X') || (winner === 'O' && myMark === 'O');
    return youWon ? 'You win.' : 'You lose.';
  }
  if (!state.game) {
    return 'Waiting for game state…';
  }
  if (currentPlayer === state.node?.nodeId) {
    return 'Your turn.';
  }
  return 'Waiting for opponent…';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildLinks() {
  const base = `${window.location.origin}${window.location.pathname}`;
  const common = `game=${encodeURIComponent(state.route.gameId)}&room=${encodeURIComponent(state.route.roomKey)}`;
  const hostPeer = state.node?.nodeId ? `&host=${encodeURIComponent(state.node.nodeId)}` : '';
  return {
    host: `${base}#${common}&role=host${hostPeer}`,
    join: `${base}#${common}&role=join${hostPeer}`
  };
}

function startHostGame() {
  const gameId = `ttt-${randomToken(6)}`;
  const roomKey = randomToken(16);
  window.location.hash = `game=${encodeURIComponent(gameId)}&room=${encodeURIComponent(roomKey)}&role=host`;
  state.route = parseRoute();
  boot();
}

async function teardown() {
  if (state.joinerTimer) {
    clearInterval(state.joinerTimer);
    state.joinerTimer = null;
  }
  if (state.node) {
    await state.node.stop();
    state.node = null;
  }
  state.game = null;
  state.error = '';
  state.status = 'idle';
}

async function boot() {
  await teardown();
  state.status = 'connecting';
  state.error = '';
  render();

  const scope = scopeForGame(state.route.gameId);
  const nodeId = `${state.route.role === 'host' ? 'h' : 'j'}${randomToken(6)}`;
  const networkAdapter = createPeerJSNetworkAdapter({
    urls: DEFAULT_CLOUDFLARE_SIGNALING_URLS
  });

  const node = new DignityP2P({
    nodeId,
    networkAdapter,
    security: {
      appPassword: state.route.roomKey,
      powTargetMs: 200,
      broadcastPasswords: { [scope]: state.route.roomKey, default: state.route.roomKey },
      resolveBroadcastScope: () => scope
    }
  });

  node.on('change', () => {
    state.game = node.read(COLLECTION, state.route.gameId);
    render();
  });

  node.on('warning', (event) => {
    if (event.type === 'unauthorized-update') {
      state.error = 'Only the record owner can apply that move.';
      render();
    }
  });

  await node.start();
  state.node = node;

  await node.joinDiscovery(scope, {
    metadata: { nickname: state.nickname, role: state.route.role },
    bootstrapPeerIds: state.route.hostPeer ? [state.route.hostPeer] : []
  });

  if (state.route.role === 'host') {
    await node.create(COLLECTION, {
      board: Array(9).fill(null),
      nextPlayer: node.nodeId,
      players: { X: node.nodeId, O: null },
      status: 'playing',
      winner: null
    }, {
      id: state.route.gameId,
      broadcastScope: scope
    });
    const links = buildLinks();
    state.hostLink = links.host;
    state.joinLink = links.join;
    if (typeof history !== 'undefined') {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      params.set('host', node.nodeId);
      window.history.replaceState(null, '', `#${params.toString()}`);
    }

    const registerJoiner = async () => {
      const game = node.read(COLLECTION, state.route.gameId);
      if (!game || game.data.players?.O) {
        return;
      }
      const peers = node.listPeers(scope, { includeSelf: false });
      const joiner = peers.find((peer) => peer.metadata?.role === 'join');
      if (!joiner) {
        return;
      }
      await node.update(COLLECTION, state.route.gameId, {
        players: { ...game.data.players, O: joiner.peerId }
      }, {
        broadcastScope: scope,
        connectToPeers: [joiner.peerId]
      });
    };

    state.joinerTimer = setInterval(registerJoiner, 1000);
  } else {
    if (state.route.hostPeer) {
      await node.connectToPeer(state.route.hostPeer);
    }
    let attempts = 0;
    while (!node.read(COLLECTION, state.route.gameId) && attempts < 40) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      attempts += 1;
    }
    const existing = node.read(COLLECTION, state.route.gameId);
    if (!existing) {
      state.error = 'Could not load game from host. Check the link and try again.';
      state.status = 'error';
      render();
      return;
    }
  }

  state.game = node.read(COLLECTION, state.route.gameId);
  state.status = 'playing';
  render();
}

async function playMove(index) {
  const game = state.game;
  if (!game || !state.node) {
    return;
  }

  if (game.ownerId !== state.node.nodeId) {
    state.error = 'Only the record owner can move on this turn. Owner-only enforcement is active.';
    render();
    return;
  }

  const board = [...(game.data.board || Array(9).fill(null))];
  if (board[index]) {
    return;
  }

  const myMark = state.route.role === 'host' ? 'X' : 'O';
  board[index] = myMark;
  const winner = detectWinner(board);
  const opponentId = Object.entries(game.data.players || {}).find(([mark]) => mark !== myMark)?.[1];

  const patch = {
    board,
    nextPlayer: opponentId || game.data.nextPlayer,
    status: winner ? 'finished' : 'playing',
    winner: winner === 'draw' ? 'draw' : winner || null
  };

  state.error = '';
  const scope = scopeForGame(state.route.gameId);
  try {
    await state.node.update(COLLECTION, state.route.gameId, patch, {
      broadcastScope: scope,
      connectToPeers: [opponentId, state.route.hostPeer].filter(Boolean)
    });

    if (!winner && opponentId) {
      await state.node.transferOwnership(COLLECTION, state.route.gameId, opponentId, {
        broadcastScope: scope,
        connectToPeers: [opponentId],
        keepAsCollaborator: false
      });
    }
  } catch (error) {
    state.error = error?.message || 'Move rejected';
  }

  state.game = state.node.read(COLLECTION, state.route.gameId);
  render();
}

window.addEventListener('hashchange', () => {
  state.route = parseRoute();
  boot();
});

render();
if (state.route.gameId) {
  boot();
}
