const SESSIONS_KEY = 'dignity-chess-sessions';
const PLAYER_KEYS_KEY = 'dignity-chess-player-keys-v1';
const COLLECTION = 'chess-matches';
const DB_NAME = 'dignity';
const STORE_NAME = 'records';

export function loadLocalGameSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function saveLocalGameSession(session) {
  if (!session?.gameId || !session?.roomKey) {
    return;
  }

  const sessions = loadLocalGameSessions();
  const index = sessions.findIndex((entry) => entry.gameId === session.gameId);
  const next = {
    ...sessions[index],
    ...session,
    updatedAt: session.updatedAt ?? Date.now()
  };

  if (index >= 0) {
    sessions[index] = next;
  } else {
    sessions.unshift(next);
  }

  const trimmed = sessions
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 40);

  localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));

  if (session.resumeLink) {
    localStorage.setItem(`dignity-chess-resume-link:${session.gameId}`, session.resumeLink);
  }
}

function loadChessRecordsFromIndexedDB() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => resolve([]);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve([]);
        return;
      }

      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const records = (getAll.result || []).filter(
          (record) => record.collection === COLLECTION && !record.deletedAt
        );
        resolve(records);
        db.close();
      };

      getAll.onerror = () => {
        resolve([]);
        db.close();
      };
    };
  });
}

function parseRoomKeyFromHash(hash) {
  if (!hash) {
    return null;
  }

  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalized);
  return params.get('room') || null;
}

export function recoverRoomKeyForGame(gameId) {
  const savedLink = localStorage.getItem(`dignity-chess-resume-link:${gameId}`);
  const fromResume = parseRoomKeyFromHash(savedLink);
  if (fromResume) {
    return fromResume;
  }

  const session = loadLocalGameSessions().find((entry) => entry.gameId === gameId);
  if (session?.roomKey) {
    return session.roomKey;
  }

  return null;
}

function loadPlayerKeySeats(gameId) {
  try {
    const raw = localStorage.getItem(PLAYER_KEYS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const entry = parsed?.[gameId];
    if (!entry || typeof entry !== 'object') {
      return { white: false, black: false };
    }

    return {
      white: Boolean(entry.white),
      black: Boolean(entry.black)
    };
  } catch (_error) {
    return { white: false, black: false };
  }
}

function inferRoleFromRecord(record, existingSession) {
  if (existingSession?.role) {
    return existingSession.role;
  }

  const seats = loadPlayerKeySeats(record.id);
  if (seats.white && !seats.black) {
    return 'host';
  }
  if (seats.black && !seats.white) {
    return 'join';
  }
  if (record.ownerId && record.data?.whitePlayerId === record.ownerId) {
    return 'host';
  }
  if (record.data?.blackPlayerId && record.data.blackPlayerId !== record.data.whitePlayerId) {
    return 'resume';
  }

  return 'resume';
}

function sessionFromRecord(record, existingSession) {
  if (!record?.id) {
    return null;
  }

  const data = record.data || {};
  const roomKey = data.roomKey || existingSession?.roomKey || recoverRoomKeyForGame(record.id);
  if (!roomKey) {
    return null;
  }

  return {
    gameId: record.id,
    roomKey,
    role: inferRoleFromRecord(record, existingSession),
    hostPeer: data.whitePlayerId || existingSession?.hostPeer || null,
    joinToken: data.joinToken || existingSession?.joinToken || null,
    watchToken: data.watchToken || existingSession?.watchToken || null,
    resumeToken: data.resumeToken || existingSession?.resumeToken || null,
    joinTokenUsed: Boolean(data.joinTokenUsed),
    nickname: existingSession?.nickname || data.whiteNickname || data.blackNickname || null,
    status: data.status || existingSession?.status || 'waiting',
    winner: data.winner ?? existingSession?.winner ?? null,
    moveCount: Array.isArray(data.moveHistory) ? data.moveHistory.length : existingSession?.moveCount || 0,
    whitePlayerId: data.whitePlayerId || existingSession?.whitePlayerId || null,
    blackPlayerId: data.blackPlayerId || existingSession?.blackPlayerId || null,
    updatedAt: record.updatedAt || existingSession?.updatedAt || Date.now()
  };
}

function mergeSessionWithRecord(session, record) {
  if (!record?.data) {
    return session;
  }

  const data = record.data;

  return {
    ...session,
    roomKey: session.roomKey || data.roomKey || recoverRoomKeyForGame(session.gameId),
    role: session.role || inferRoleFromRecord(record, session),
    hostPeer: session.hostPeer || data.whitePlayerId || null,
    joinToken: session.joinToken || data.joinToken || null,
    watchToken: session.watchToken || data.watchToken || null,
    resumeToken: session.resumeToken || data.resumeToken || null,
    joinTokenUsed: session.joinTokenUsed ?? Boolean(data.joinTokenUsed),
    status: data.status || session.status || 'waiting',
    winner: data.winner ?? session.winner ?? null,
    moveCount: Array.isArray(data.moveHistory) ? data.moveHistory.length : session.moveCount || 0,
    whitePlayerId: data.whitePlayerId || session.whitePlayerId || null,
    blackPlayerId: data.blackPlayerId || session.blackPlayerId || null,
    updatedAt: record.updatedAt || session.updatedAt || Date.now()
  };
}

function sortByUpdatedAt(games) {
  return [...games].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function buildGameListFromSources(sessions, records) {
  const recordById = new Map(records.map((record) => [record.id, record]));
  const sessionById = new Map();

  for (const session of sessions) {
    const merged = mergeSessionWithRecord(session, recordById.get(session.gameId));
    if (merged?.gameId && merged?.roomKey) {
      sessionById.set(merged.gameId, merged);
    }
  }

  for (const record of records) {
    if (sessionById.has(record.id)) {
      continue;
    }

    const recovered = sessionFromRecord(record, null);
    if (recovered) {
      sessionById.set(recovered.gameId, recovered);
    }
  }

  const merged = sortByUpdatedAt([...sessionById.values()]);
  const active = merged.filter((game) => game.status === 'waiting' || game.status === 'playing');
  const finished = merged.filter((game) => game.status === 'finished');

  return { active, finished };
}

export async function listLocalGames() {
  const sessions = loadLocalGameSessions();
  const records = await loadChessRecordsFromIndexedDB();
  return buildGameListFromSources(sessions, records);
}

export function sessionResumeHash(session) {
  const savedLink = localStorage.getItem(`dignity-chess-resume-link:${session.gameId}`);
  if (savedLink) {
    const hashIndex = savedLink.indexOf('#');
    return hashIndex >= 0 ? savedLink.slice(hashIndex + 1) : savedLink;
  }

  let role = session.role || 'resume';
  if (role === 'join' && (!session.joinToken || session.joinTokenUsed)) {
    role = 'resume';
  }
  if (role === 'watch' && !session.watchToken) {
    role = 'resume';
  }
  if (!['host', 'join', 'watch', 'resume'].includes(role)) {
    role = 'resume';
  }

  const params = new URLSearchParams({
    game: session.gameId,
    room: session.roomKey,
    role,
    resume: session.resumeToken || ''
  });

  if (session.hostPeer) {
    params.set('host', session.hostPeer);
  }
  if (session.checkpointRef) {
    params.set('checkpointRef', session.checkpointRef);
  }
  if (role === 'host' && session.joinToken) {
    params.set('join', session.joinToken);
  }
  if (role === 'host' && session.watchToken) {
    params.set('watch', session.watchToken);
  }
  if (role === 'join' && session.joinToken) {
    params.set('join', session.joinToken);
  }
  if (role === 'watch' && session.watchToken) {
    params.set('watch', session.watchToken);
  }

  return params.toString();
}

export function formatGameStatus(game) {
  if (game.status === 'waiting') {
    return 'Waiting for opponent';
  }
  if (game.status === 'playing') {
    return `${game.moveCount || 0} move(s) · in progress`;
  }
  if (game.winner === 'draw') {
    return 'Draw';
  }
  if (game.winner === 'w') {
    return 'White wins';
  }
  if (game.winner === 'b') {
    return 'Black wins';
  }
  return 'Finished';
}

export function formatRoleLabel(game) {
  if (game.role === 'host') {
    return 'You · White (host)';
  }
  if (game.role === 'join') {
    return 'You · Black';
  }
  if (game.role === 'watch') {
    return 'Spectator';
  }
  return 'Resume';
}
