import React, { useEffect, useState } from 'react';
import { generateGameId } from '../lib/links.js';
import {
  formatGameStatus,
  formatRoleLabel,
  listLocalGames,
  sessionResumeHash
} from '../lib/localGames.js';

function GameList({ title, games, emptyText, onOpen }) {
  if (!games.length) {
    return (
      <section className="lobby__games panel">
        <h2>{title}</h2>
        <p className="muted">{emptyText}</p>
      </section>
    );
  }

  return (
    <section className="lobby__games panel">
      <h2>{title}</h2>
      <ul className="game-list">
        {games.map((game) => (
          <li key={game.gameId} className="game-list__item">
            <div className="game-list__meta">
              <strong>{game.gameId}</strong>
              <span className="muted">{formatRoleLabel(game)}</span>
              <span>{formatGameStatus(game)}</span>
              <span className="muted">
                {new Date(game.updatedAt || Date.now()).toLocaleString()}
              </span>
            </div>
            <button type="button" className="secondary" onClick={() => onOpen(game)}>
              {game.status === 'finished' ? 'Review' : 'Continue'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Lobby({
  nickname,
  onNicknameChange,
  onCreate,
  onJoinPaste,
  onOpenGame
}) {
  const [pasteValue, setPasteValue] = useState('');
  const [activeGames, setActiveGames] = useState([]);
  const [finishedGames, setFinishedGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  async function refreshGames() {
    setLoadingGames(true);
    try {
      const { active, finished } = await listLocalGames();
      setActiveGames(active);
      setFinishedGames(finished.slice(0, 12));
    } finally {
      setLoadingGames(false);
    }
  }

  useEffect(() => {
    refreshGames();
    window.addEventListener('focus', refreshGames);
    return () => window.removeEventListener('focus', refreshGames);
  }, []);

  function handleOpenGame(game) {
    onOpenGame(sessionResumeHash(game));
  }

  return (
    <div className="lobby-layout">
      <section className="lobby lobby__top">
        <div className="lobby__hero">
          <p className="eyebrow">Decentralized demo</p>
          <h1>3D Chess on dignity.js</h1>
          <p>
            Peer-to-peer chess over Cloudflare PeerJS signaling, encrypted room scopes,
            IndexedDB persistence, and React hooks.
          </p>
          <label className="lobby__nickname">
            Your nickname
            <input
              value={nickname}
              onChange={(event) => onNicknameChange(event.target.value)}
              placeholder="Nickname"
              maxLength={32}
            />
          </label>
          <button type="button" className="primary" onClick={() => onCreate(generateGameId())}>
            Start new game
          </button>
        </div>

        <div className="lobby__join">
          <h2>Join from link</h2>
          <p>Paste a host, opponent, spectator, or dual-signed resume link. Resume links restore signed game state from the URL when possible.</p>
          <textarea
            rows={4}
            value={pasteValue}
            onChange={(event) => setPasteValue(event.target.value)}
            placeholder="https://…/chess/#game=…&role=join…"
          />
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!pasteValue.trim()) {
                return;
              }
              onJoinPaste(pasteValue.trim());
            }}
          >
            Open link
          </button>
        </div>
      </section>

      <section className="lobby__history">
        <div className="lobby__history-head">
          <h2>Your games on this device</h2>
          <button type="button" className="ghost" onClick={refreshGames} disabled={loadingGames}>
            Refresh
          </button>
        </div>

        {loadingGames ? (
          <p className="muted">Loading saved games…</p>
        ) : (
          <div className="lobby__history-grid">
            <GameList
              title="Active"
              games={activeGames}
              emptyText="No active games. Start one or join from a link."
              onOpen={handleOpenGame}
            />
            <GameList
              title="Finished"
              games={finishedGames}
              emptyText="No finished games yet."
              onOpen={handleOpenGame}
            />
          </div>
        )}
      </section>
    </div>
  );
}
