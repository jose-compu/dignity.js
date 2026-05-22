import React, { useEffect, useState } from 'react';
import { buildLinks } from '../lib/links';

export default function LinkPanel({
  gameId,
  roomKey,
  hostPeer,
  game,
  joinToken: joinTokenProp,
  watchToken: watchTokenProp,
  resumeToken: resumeTokenProp,
  onRegenerateResume,
  prominent = false,
  audience = 'host'
}) {
  const joinToken = game?.data?.joinToken || joinTokenProp;
  const watchToken = game?.data?.watchToken || watchTokenProp;
  const resumeToken = game?.data?.resumeToken || resumeTokenProp;
  const [copied, setCopied] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const isPlayer = audience === 'player';

  const links = buildLinks({
    gameId,
    roomKey,
    hostPeer,
    joinToken,
    watchToken,
    resumeToken
  });

  const joinExpired = Boolean(game?.data?.joinTokenUsed);
  const ready = isPlayer
    ? Boolean(hostPeer && watchToken && resumeToken)
    : Boolean(hostPeer && joinToken && watchToken && resumeToken);

  useEffect(() => {
    if (prominent && (joinExpired || isPlayer)) {
      setCollapsed(true);
    }
  }, [prominent, joinExpired, isPlayer]);

  async function copyLink(label, url) {
    if (!url) {
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  const panelClass = [
    'link-panel',
    prominent ? 'link-panel--prominent' : '',
    collapsed ? 'link-panel--collapsed' : ''
  ].filter(Boolean).join(' ');

  const summary = !ready
    ? (hostPeer ? 'Preparing share links…' : 'Waiting for host peer…')
    : isPlayer
      ? 'Spectator and resume links ready for your friends.'
      : joinExpired
        ? 'Opponent joined — spectator and resume links available.'
        : 'Opponent, spectator, and resume links ready.';

  return (
    <section className={panelClass}>
      <div className="link-panel__head">
        <h3>Share links</h3>
        <button
          type="button"
          className="ghost link-panel__toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {collapsed ? (
        <p className="link-panel__summary">{summary}</p>
      ) : null}

      <div className="link-panel__body">
        {!ready ? (
          <p className="link-panel__hint">
            {hostPeer
              ? 'Preparing share links…'
              : 'Connecting to host… links appear once the game syncs.'}
          </p>
        ) : (
          <>
            <p className="link-panel__hint">
              {isPlayer
                ? 'Invite friends to watch live with the spectator link.'
                : 'Send the opponent link to your friend. Spectators can watch without playing. The opponent link expires after the first join.'}
            </p>

            {!isPlayer ? (
              <div className="link-row">
                <label>Opponent {joinExpired ? '(expired)' : ''}</label>
                <input readOnly value={links.join} onFocus={(e) => e.target.select()} />
                <button type="button" disabled={joinExpired} onClick={() => copyLink('join', links.join)}>
                  {copied === 'join' ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : null}

            <div className="link-row">
              <label>Spectators</label>
              <input readOnly value={links.watch} onFocus={(e) => e.target.select()} />
              <button type="button" onClick={() => copyLink('watch', links.watch)}>
                {copied === 'watch' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="link-row">
              <label>Resume game</label>
              <input readOnly value={links.resume} onFocus={(e) => e.target.select()} />
              <button type="button" onClick={() => copyLink('resume', links.resume)}>
                {copied === 'resume' ? 'Copied' : 'Copy'}
              </button>
              {!isPlayer && onRegenerateResume ? (
                <button type="button" className="secondary" onClick={onRegenerateResume}>New resume link</button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
