import React, { useEffect, useMemo, useState } from 'react';
import Lobby from './components/Lobby.jsx';
import JoinGate from './components/JoinGate.jsx';
import GameView from './components/GameView.jsx';
import { nodeIdForRole, parseRoute, randomToken, scopeForGame } from './lib/links.js';
import { saveLocalGameSession } from './lib/localGames.js';

const STORAGE_KEY = 'dignity-chess-name';
const STORAGE_USERNAME_KEY = 'dignity-chess-username';
const SESSION_PASSWORD_KEY = 'dignity-chess-password';

export default function App() {
  const [route, setRoute] = useState(() => parseRoute());
  const [draftNickname, setDraftNickname] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'Player'
  );
  const [draftUsername, setDraftUsername] = useState(
    () => localStorage.getItem(STORAGE_USERNAME_KEY) || ''
  );
  const [draftPassword, setDraftPassword] = useState(
    () => sessionStorage.getItem(SESSION_PASSWORD_KEY) || ''
  );
  const [sessionNickname, setSessionNickname] = useState(null);
  const [sessionUsername, setSessionUsername] = useState(null);
  const [sessionPassword, setSessionPassword] = useState(null);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activeSession = route.gameId && route.roomKey;

  const nodeId = useMemo(() => {
    if (!activeSession || !sessionNickname) {
      return null;
    }
    return nodeIdForRole(route.role, route.gameId);
  }, [activeSession, sessionNickname, route.role, route.gameId]);

  function persistCredentials({ nickname, username, password }) {
    const trimmedName = nickname.trim() || 'Player';
    const trimmedUsername = username.trim();
    localStorage.setItem(STORAGE_KEY, trimmedName);
    localStorage.setItem(STORAGE_USERNAME_KEY, trimmedUsername);
    if (password) {
      sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
    }
    setDraftNickname(trimmedName);
    setDraftUsername(trimmedUsername);
    setDraftPassword(password || '');
    setSessionNickname(trimmedName);
    setSessionUsername(trimmedUsername);
    setSessionPassword(password || '');
    return { nickname: trimmedName, username: trimmedUsername, password };
  }

  function startGame(gameId) {
    if (!draftUsername.trim() || !draftPassword) {
      return;
    }
    persistCredentials({
      nickname: draftNickname,
      username: draftUsername,
      password: draftPassword
    });
    const roomKey = randomToken(16);
    const joinToken = randomToken();
    const watchToken = randomToken();
    const resumeToken = randomToken();
    window.location.hash = [
      `game=${encodeURIComponent(gameId)}`,
      `room=${encodeURIComponent(roomKey)}`,
      'role=host',
      `join=${encodeURIComponent(joinToken)}`,
      `watch=${encodeURIComponent(watchToken)}`,
      `resume=${encodeURIComponent(resumeToken)}`
    ].join('&');
    setRoute(parseRoute());
    saveLocalGameSession({
      gameId,
      roomKey,
      role: 'host',
      joinToken,
      watchToken,
      resumeToken,
      nickname: draftNickname.trim() || 'Player',
      status: 'waiting',
      moveCount: 0,
      updatedAt: Date.now()
    });
  }

  function openSavedGame(hash) {
    window.location.hash = hash;
    setRoute(parseRoute());
    setSessionNickname(null);
    setSessionUsername(null);
    setSessionPassword(null);
  }

  function backToLobby() {
    window.location.hash = '';
    setRoute(parseRoute());
    setSessionNickname(null);
    setSessionUsername(null);
    setSessionPassword(null);
  }

  function openPastedLink(raw) {
    const hashIndex = raw.indexOf('#');
    window.location.hash = hashIndex >= 0 ? raw.slice(hashIndex + 1) : raw;
    setRoute(parseRoute());
    setSessionNickname(null);
    setSessionUsername(null);
    setSessionPassword(null);
  }

  return (
    <div className={`app-shell${activeSession && sessionNickname ? ' app-shell--game' : ''}`}>
      <header className="topbar">
        <a href="../index.html">dignity.js docs</a>
        {!activeSession ? (
          <span className="topbar__hint">Set username, password, and nickname in the lobby before starting or joining.</span>
        ) : sessionNickname ? (
          <span className="topbar__player">Playing as <strong>{sessionNickname}</strong> ({sessionUsername})</span>
        ) : null}
      </header>

      {!activeSession ? (
        <Lobby
          nickname={draftNickname}
          username={draftUsername}
          password={draftPassword}
          onNicknameChange={setDraftNickname}
          onUsernameChange={setDraftUsername}
          onPasswordChange={setDraftPassword}
          onCreate={startGame}
          onJoinPaste={openPastedLink}
          onOpenGame={openSavedGame}
        />
      ) : !sessionNickname ? (
        <JoinGate
          route={route}
          defaultNickname={draftNickname}
          defaultUsername={draftUsername}
          defaultPassword={draftPassword}
          onConfirm={persistCredentials}
          onBack={backToLobby}
        />
      ) : (
        <GameView
          route={route}
          nodeId={nodeId}
          nickname={sessionNickname}
          username={sessionUsername}
          password={sessionPassword}
          onBack={backToLobby}
        />
      )}

      <footer className="footer">
        Scope preview: {route.gameId ? scopeForGame(route.gameId) : '—'} · Cloudflare PeerJS · IndexedDB persistence
      </footer>
    </div>
  );
}
