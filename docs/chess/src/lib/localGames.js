const SESSIONS_KEY = 'dignity-chess-sessions';
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
    updatedAt: session.updatedAt || Date.now()
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

function mergeSessionWithRecord(session, record) {
  if (!record?.data) {
    return session;
  }

  return {
    ...session,
    status: record.data.status || session.status || 'waiting',
    winner: record.data.winner ?? session.winner ?? null,
    moveCount: Array.isArray(record.data.moveHistory) ? record.data.moveHistory.length : session.moveCount || 0,
    whitePlayerId: record.data.whitePlayerId || session.whitePlayerId || null,
    blackPlayerId: record.data.blackPlayerId || session.blackPlayerId || null,
    updatedAt: record.updatedAt || session.updatedAt || Date.now()
  };
}

export async function listLocalGames() {
  const sessions = loadLocalGameSessions();
  const records = await loadChessRecordsFromIndexedDB();
  const recordById = new Map(records.map((record) => [record.id, record]));

  const merged = sessions.map((session) => mergeSessionWithRecord(session, recordById.get(session.gameId)));

  const active = merged.filter((game) => game.status === 'waiting' || game.status === 'playing');
  const finished = merged.filter((game) => game.status === 'finished');

  return { active, finished };
}

export function sessionResumeHash(session) {
  const savedLink = localStorage.getItem(`dignity-chess-resume-link:${session.gameId}`);
  if (savedLink) {
    const hashIndex = savedLink.indexOf('#');
    return hashIndex >= 0 ? savedLink.slice(hashIndex + 1) : savedLink;
  }

  const role = session.role === 'host' ? 'host' : 'resume';
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
  if (session.role === 'host' && session.joinToken) {
    params.set('join', session.joinToken);
  }
  if (session.role === 'host' && session.watchToken) {
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
