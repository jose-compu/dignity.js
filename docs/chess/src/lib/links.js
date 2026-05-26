export function randomToken(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, length);
}

const CHESS_LEGENDS = [
  'Fischer', 'Spassky', 'Karpov', 'Kasparov', 'Carlsen', 'Anand', 'Tal', 'Botvinnik',
  'Capablanca', 'Alekhine', 'Morphy', 'Anderssen', 'Lasker', 'Petrosian', 'Korchnoi',
  'Polgar', 'Nepo', 'Ding', 'Aronian', 'Kramnik', 'Smyslov', 'Euwe', 'Bronstein',
  'Larsen', 'Steinitz', 'Rubinstein', 'Reshevsky', 'Ivanchuk', 'Firouzja', 'Giri'
];

const MATCH_NICKNAMES = [
  'Immortal', 'Evergreen', 'Opera', 'Century', 'Candidates'
];

const CLASSIC_YEARS = [1858, 1927, 1972, 1985, 2013, 2016, 2021, 2023];

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickTwoDifferent(items) {
  const first = pickRandom(items);
  let second = pickRandom(items);
  while (second === first) {
    second = pickRandom(items);
  }
  return [first, second];
}

/** Human-readable game id from famous player names (URL-safe). */
export function generateGameId() {
  const style = Math.random();
  const [white, black] = pickTwoDifferent(CHESS_LEGENDS);

  if (style < 0.45) {
    return `${white}-${black}`;
  }
  if (style < 0.75) {
    return `${white}-vs-${black}`;
  }
  if (style < 0.9) {
    return `${pickRandom(CHESS_LEGENDS)}-${pickRandom(CLASSIC_YEARS)}`;
  }
  return `${pickRandom(MATCH_NICKNAMES)}-${pickRandom(CHESS_LEGENDS)}`;
}

export function parseRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  const params = Object.fromEntries(new URLSearchParams(hash));
  return {
    gameId: params.game || null,
    role: params.role || 'host',
    roomKey: params.room || null,
    hostPeer: params.host || null,
    joinToken: params.join || null,
    watchToken: params.watch || null,
    resumeToken: params.resume || null,
    checkpoint: params.checkpoint || null,
    checkpointRef: params.checkpointRef || null
  };
}

export function buildLinks({ gameId, roomKey, hostPeer, joinToken, watchToken, resumeToken, resumeLink }) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const common = `game=${encodeURIComponent(gameId)}&room=${encodeURIComponent(roomKey)}`;
  const hostParam = hostPeer ? `&host=${encodeURIComponent(hostPeer)}` : '';

  const resume = resumeLink
    || `${base}#${common}&role=resume&resume=${encodeURIComponent(resumeToken || '')}${hostParam}`;

  return {
    host: `${base}#${common}&role=host&resume=${encodeURIComponent(resumeToken || '')}${hostParam}`,
    join: `${base}#${common}&role=join&join=${encodeURIComponent(joinToken)}${hostParam}`,
    watch: `${base}#${common}&role=watch&watch=${encodeURIComponent(watchToken)}${hostParam}`,
    resume
  };
}

export function withHostPeerInHash(hostPeer) {
  if (!hostPeer || typeof window === 'undefined') {
    return;
  }

  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  if (params.get('host') === hostPeer) {
    return;
  }

  params.set('host', hostPeer);
  window.history.replaceState(null, '', `#${params.toString()}`);
}

export function scopeForGame(gameId) {
  return `room:chess:${gameId}`;
}

export function nodeIdForRole(role, gameId) {
  const suffix = randomToken(4);
  const gameBit = gameId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
  const roleBit = role === 'host' ? 'h' : role === 'join' ? 'j' : role === 'watch' ? 'w' : 'r';
  return `c${gameBit}${roleBit}${suffix}`.slice(0, 16);
}

export function hostPeerFromRoute(route, game, localNodeId) {
  return route.hostPeer || game?.data?.whitePlayerId || (route.role === 'host' ? localNodeId : null);
}

export async function connectToRoomPeer(node, remotePeerId) {
  if (!node?.connectToPeer || !remotePeerId || remotePeerId === node.nodeId) {
    return { ok: false, reason: 'missing-node-or-self' };
  }

  try {
    await node.connectToPeer(remotePeerId);
    const stats = node.getConnectionStats?.() || { openCount: 0, peerIds: [] };
    const open = stats.peerIds.includes(remotePeerId) || stats.openCount > 0;
    return { ok: true, open, stats };
  } catch (error) {
    return {
      ok: false,
      reason: 'connect-failed',
      message: error?.message || String(error)
    };
  }
}
