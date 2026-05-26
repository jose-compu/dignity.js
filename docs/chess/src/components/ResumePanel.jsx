import React, { useEffect, useMemo, useState } from 'react';
import {
  buildCheckpointDraft,
  enrichCheckpointPlayerMetadata,
  signCheckpoint,
  isCheckpointFullySigned,
  buildResumeLink,
  validateCheckpointForResume
} from '../lib/resumeCheckpoint.js';
import { exportSeatKeyBackup } from '../lib/playerKeys.js';

const STEPS = {
  idle: 'Ask both players to co-sign the current position before leaving.',
  proposed: 'Waiting for your opponent to review and sign the checkpoint.',
  incoming: 'Your opponent proposed pausing here. Review and sign to continue later.',
  ready: 'Both players signed this checkpoint. Copy the resume link below.'
};

export default function ResumePanel({
  game,
  gameId,
  roomKey,
  scope,
  node,
  keyPair,
  nickname,
  mySeat,
  remotePeerId,
  pendingProposal,
  finalizedCheckpoint,
  onPropose,
  onAcceptProposal,
  onDeclineProposal,
  onFinalized
}) {
  const [busy, setBusy] = useState(false);
  const [resumeLink, setResumeLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [seatBackup, setSeatBackup] = useState('');

  const phase = useMemo(() => {
    if (finalizedCheckpoint && isCheckpointFullySigned(finalizedCheckpoint)) {
      return 'ready';
    }
    if (pendingProposal?.fromSeat && pendingProposal.fromSeat !== mySeat) {
      return 'incoming';
    }
    if (pendingProposal?.fromSeat === mySeat) {
      return 'proposed';
    }
    return 'idle';
  }, [finalizedCheckpoint, pendingProposal, mySeat]);

  useEffect(() => {
    if (!finalizedCheckpoint || !isCheckpointFullySigned(finalizedCheckpoint)) {
      setResumeLink('');
      return undefined;
    }

    let cancelled = false;

    buildResumeLink(finalizedCheckpoint).then((link) => {
      if (!cancelled) {
        setResumeLink(link);
        onFinalized?.(finalizedCheckpoint, link);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [finalizedCheckpoint, onFinalized]);

  useEffect(() => {
    if (mySeat && gameId) {
      setSeatBackup(exportSeatKeyBackup(gameId, mySeat) || '');
    }
  }, [mySeat, gameId]);

  async function handlePropose() {
    if (!node || !game || !mySeat || busy) {
      return;
    }

    setBusy(true);
    try {
      const draft = enrichCheckpointPlayerMetadata(
        buildCheckpointDraft({
          gameId,
          roomKey,
          scope,
          game,
          seat: mySeat,
          nickname,
          publicKey: node.getPublicKey(),
          peerId: node.nodeId
        }),
        game
      );

      const signed = signCheckpoint(draft, keyPair, mySeat);

      await onPropose?.(signed, remotePeerId);
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept() {
    if (!node || !pendingProposal?.checkpoint || busy) {
      return;
    }

    setBusy(true);
    try {
      const enriched = enrichCheckpointPlayerMetadata(pendingProposal.checkpoint, game);
      const signed = signCheckpoint(enriched, keyPair, mySeat);

      await onAcceptProposal?.(signed, remotePeerId);
    } finally {
      setBusy(false);
    }
  }

  async function copyResumeLink() {
    if (!resumeLink) {
      return;
    }

    await navigator.clipboard.writeText(resumeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const validation = finalizedCheckpoint
    ? validateCheckpointForResume(finalizedCheckpoint)
    : null;

  return (
    <section className="panel resume-panel">
      <div className="resume-panel__head">
        <h3>Resume later</h3>
        <span className="resume-panel__phase">{phase}</span>
      </div>

      <p className="resume-panel__hint">{STEPS[phase]}</p>

      {phase === 'idle' ? (
        <button
          type="button"
          className="secondary"
          disabled={!game || game.data.status !== 'playing' || !remotePeerId || busy}
          onClick={handlePropose}
        >
          {busy ? 'Signing…' : 'Propose pause & co-sign checkpoint'}
        </button>
      ) : null}

      {phase === 'proposed' ? (
        <p className="notice">Checkpoint sent to opponent. They must sign the same position to finalize the resume link.</p>
      ) : null}

      {phase === 'incoming' ? (
        <div className="resume-panel__actions">
          <p>
            <strong>{pendingProposal.checkpoint?.proposer?.nickname || 'Opponent'}</strong>
            {' '}
            signed move {pendingProposal.checkpoint?.moveHistory?.length || 0} and wants to pause here.
          </p>
          <div className="resume-panel__buttons">
            <button type="button" className="primary" disabled={busy} onClick={handleAccept}>
              {busy ? 'Signing…' : 'Sign & finalize resume link'}
            </button>
            <button type="button" className="ghost" disabled={busy} onClick={onDeclineProposal}>
              Decline
            </button>
          </div>
        </div>
      ) : null}

      {phase === 'ready' && resumeLink ? (
        <div className="resume-panel__ready">
          <label>Dual-signed resume link</label>
          <input readOnly value={resumeLink} onFocus={(event) => event.target.select()} />
          <div className="resume-panel__buttons">
            <button type="button" onClick={copyResumeLink}>
              {copied ? 'Copied' : 'Copy resume link'}
            </button>
          </div>
          {validation?.ok ? (
            <p className="muted">
              Both signatures verified. Game state travels in the link when short enough; otherwise this browser keeps a checkpoint ref in IndexedDB.
            </p>
          ) : (
            <p className="error-inline">Checkpoint validation failed: {validation?.reason}</p>
          )}
        </div>
      ) : null}

      {seatBackup ? (
        <details className="resume-panel__backup">
          <summary>Seat key backup (optional, same device or manual transfer)</summary>
          <p className="muted">
            Resume links restore the board. Your signing keys stay on this device unless you copy this backup.
          </p>
          <textarea readOnly rows={3} value={seatBackup} onFocus={(event) => event.target.select()} />
        </details>
      ) : null}
    </section>
  );
}
