/**
 * @jest-environment jsdom
 */

const {
  loadLocalGameSessions,
  saveLocalGameSession,
  buildGameListFromSources,
  sessionResumeHash,
  recoverRoomKeyForGame
} = require('../../docs/chess/src/lib/localGames.js');

const SESSIONS_KEY = 'dignity-chess-sessions';

beforeEach(() => {
  localStorage.clear();
});

describe('localGames', () => {
  test('lists active and finished games from local sessions', () => {
    const { active, finished } = buildGameListFromSources([
      {
        gameId: 'Fischer-Spassky',
        roomKey: 'room-1',
        role: 'host',
        status: 'playing',
        updatedAt: 100
      },
      {
        gameId: 'Karpov-Kasparov',
        roomKey: 'room-2',
        role: 'join',
        status: 'finished',
        winner: 'b',
        updatedAt: 200
      }
    ], []);

    expect(active).toHaveLength(1);
    expect(active[0].gameId).toBe('Fischer-Spassky');
    expect(finished).toHaveLength(1);
    expect(finished[0].gameId).toBe('Karpov-Kasparov');
  });

  test('discovers games from IndexedDB records when local session is missing', () => {
    const { active, finished } = buildGameListFromSources([], [{
      id: 'Tal-Botvinnik',
      data: {
        status: 'finished',
        winner: 'w',
        moveHistory: ['e4', 'e5'],
        roomKey: 'room-db',
        joinToken: 'join-1',
        watchToken: 'watch-1',
        resumeToken: 'resume-1',
        whitePlayerId: 'host-peer'
      },
      updatedAt: 500
    }]);

    expect(active).toHaveLength(0);
    expect(finished).toHaveLength(1);
    expect(finished[0].gameId).toBe('Tal-Botvinnik');
    expect(finished[0].roomKey).toBe('room-db');
    expect(finished[0].moveCount).toBe(2);
  });

  test('merges IndexedDB status into existing local session', () => {
    const { active } = buildGameListFromSources([
      {
        gameId: 'Carlsen-Anand',
        roomKey: 'room-3',
        role: 'host',
        status: 'waiting',
        updatedAt: 50
      }
    ], [{
      id: 'Carlsen-Anand',
      data: {
        status: 'playing',
        moveHistory: ['d4'],
        roomKey: 'room-3',
        whitePlayerId: 'host-peer'
      },
      updatedAt: 150
    }]);

    expect(active).toHaveLength(1);
    expect(active[0].status).toBe('playing');
    expect(active[0].moveCount).toBe(1);
  });

  test('recovers room key from saved resume link', () => {
    localStorage.setItem(
      'dignity-chess-resume-link:Morphy-Anderssen',
      'http://localhost/chess/#game=Morphy-Anderssen&room=room-resume&role=resume'
    );

    expect(recoverRoomKeyForGame('Morphy-Anderssen')).toBe('room-resume');
  });

  test('sessionResumeHash preserves join role when token is still valid', () => {
    const hash = sessionResumeHash({
      gameId: 'Euwe-Capablanca',
      roomKey: 'room-join',
      role: 'join',
      joinToken: 'join-live',
      watchToken: 'watch-live',
      resumeToken: 'resume-live',
      hostPeer: 'host-peer'
    });

    const params = new URLSearchParams(hash);
    expect(params.get('role')).toBe('join');
    expect(params.get('join')).toBe('join-live');
    expect(params.get('room')).toBe('room-join');
  });

  test('saveLocalGameSession trims to latest 40 entries', () => {
    for (let index = 0; index < 45; index += 1) {
      saveLocalGameSession({
        gameId: `game-${index}`,
        roomKey: `room-${index}`,
        role: 'host',
        updatedAt: index + 1
      });
    }

    expect(loadLocalGameSessions()).toHaveLength(40);
    expect(loadLocalGameSessions()[0].gameId).toBe('game-44');
  });
});
