import React, { useEffect, useId, useState } from 'react';
import { generateGameId } from '../lib/links.js';
import {
  formatGameStatus,
  formatRoleLabel,
  listLocalGames,
  sessionResumeHash
} from '../lib/localGames.js';
import { importSeatKeyBackup } from '../lib/playerKeys.js';
import {
  buildResumeHashFromCheckpoint,
  parsePortableCheckpointBundle
} from '../lib/resumeCheckpoint.js';

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
  const [seatBackupValue, setSeatBackupValue] = useState('');
  const [checkpointBundleValue, setCheckpointBundleValue] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [activeGames, setActiveGames] = useState([]);
  const [finishedGames, setFinishedGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const nicknameInputId = useId();
  const pasteLinkId = useId();
  const seatBackupId = useId();
  const checkpointBundleId = useId();

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

  function handleImportSeatBackup() {
    setImportMessage('');
    setImportError('');
    try {
      const imported = importSeatKeyBackup(seatBackupValue);
      setImportMessage(`Imported ${imported.seat} seat keys for game ${imported.gameId}. Open a resume link for that game on this device.`);
      setSeatBackupValue('');
    } catch (error) {
      setImportError(error?.message || 'Invalid seat key backup');
    }
  }

  function handleImportCheckpointBundle() {
    setImportMessage('');
    setImportError('');
    try {
      const checkpoint = parsePortableCheckpointBundle(checkpointBundleValue);
      const hash = buildResumeHashFromCheckpoint(checkpoint);
      if (!hash) {
        setImportError('Checkpoint is too large for an inline resume link. Paste the resume URL from the device that created it, or use a smaller game state.');
        return;
      }
      onOpenGame(hash);
      setCheckpointBundleValue('');
    } catch (error) {
      setImportError(error?.message || 'Invalid portable checkpoint bundle');
    }
  }

  return (
    <div className="lobby-layout">
      <section className="lobby lobby__top">
        <div className="lobby__hero">
          <p className="eyebrow">dignity.js v0.11.0 · decentralized demo</p>
          <h1>3D Chess on dignity.js</h1>
          <p>
            Peer-to-peer chess over PeerJS signaling, scoped broadcast encryption,
            dual-signed resume links, and scalable spectator feeds via PeerGroup gossip.
          </p>
          <label className="lobby__nickname" htmlFor={nicknameInputId}>
            Your nickname
            <input
              id={nicknameInputId}
              value={nickname}
              onChange={(event) => onNicknameChange(event.target.value)}
              placeholder="Nickname"
              maxLength={32}
              autoComplete="nickname"
            />
          </label>
          <button type="button" className="primary" onClick={() => onCreate(generateGameId())}>
            Start new game
          </button>
        </div>

        <div className="lobby__join">
          <h2>Join from link</h2>
          <p>Paste a host, opponent, spectator, or dual-signed resume link. Resume links restore signed game state from the URL when possible.</p>
          <label htmlFor={pasteLinkId}>Game link</label>
          <textarea
            id={pasteLinkId}
            rows={4}
            value={pasteValue}
            onChange={(event) => setPasteValue(event.target.value)}
            placeholder="https://…/chess/#game=…&role=join…"
            aria-label="Paste a host, opponent, spectator, or resume link"
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

        <div className="lobby__import panel">
          <h2>Cross-device resume</h2>
          <p>
            Resume links restore the board. Your signing keys stay on the original device unless you import a seat key backup below.
            For large checkpoints, import the portable bundle exported from the Resume panel.
          </p>

          <label htmlFor={seatBackupId}>Seat key backup</label>
          <textarea
            id={seatBackupId}
            rows={3}
            value={seatBackupValue}
            onChange={(event) => setSeatBackupValue(event.target.value)}
            placeholder="Paste base64 seat key backup from the Resume panel"
            aria-label="Seat key backup for cross-device resume"
          />
          <button
            type="button"
            className="secondary"
            disabled={!seatBackupValue.trim()}
            onClick={handleImportSeatBackup}
          >
            Import seat keys
          </button>

          <label htmlFor={checkpointBundleId}>Portable checkpoint bundle</label>
          <textarea
            id={checkpointBundleId}
            rows={4}
            value={checkpointBundleValue}
            onChange={(event) => setCheckpointBundleValue(event.target.value)}
            placeholder='{"kind":"dignity-chess-checkpoint",…}'
            aria-label="Portable dual-signed checkpoint bundle"
          />
          <button
            type="button"
            className="secondary"
            disabled={!checkpointBundleValue.trim()}
            onClick={handleImportCheckpointBundle}
          >
            Import checkpoint and open resume
          </button>

          {importMessage ? <p className="notice" role="status">{importMessage}</p> : null}
          {importError ? <p className="error-inline" role="alert">{importError}</p> : null}
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
