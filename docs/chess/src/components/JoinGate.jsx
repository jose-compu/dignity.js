import React, { useId, useState } from 'react';

const ROLE_COPY = {
  host: {
    title: 'Start game',
    action: 'Start as White',
    hint: 'You will play White. Choose your name before connecting to the room.'
  },
  join: {
    title: 'Join as opponent',
    action: 'Join as Black',
    hint: 'Choose your name now — it cannot be changed after connecting without reconnecting.'
  },
  watch: {
    title: 'Watch game',
    action: 'Enter as spectator',
    hint: 'Pick a display name for the spectator list.'
  },
  resume: {
    title: 'Resume game',
    action: 'Reconnect',
    hint: 'This link carries a dual-signed checkpoint. Import your seat key backup in the lobby first when using a new device.'
  }
};

export default function JoinGate({ route, defaultNickname, onConfirm, onBack }) {
  const [name, setName] = useState(defaultNickname);
  const nicknameInputId = useId();
  const copy = ROLE_COPY[route.role] || ROLE_COPY.resume;

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <section className="join-gate">
      <div className="join-gate__card panel">
        <p className="eyebrow">Game {route.gameId}</p>
        <h2 id="join-gate-title">{copy.title}</h2>
        <p id="join-gate-hint">{copy.hint}</p>

        <form onSubmit={handleSubmit} aria-labelledby="join-gate-title">
          <label className="join-gate__field" htmlFor={nicknameInputId}>
            Your nickname
            <input
              id={nicknameInputId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nickname"
              autoFocus
              maxLength={32}
              autoComplete="nickname"
              aria-describedby="join-gate-hint"
            />
          </label>

          <div className="join-gate__actions">
            <button type="button" className="ghost" onClick={onBack}>← Back</button>
            <button
              type="submit"
              className="primary"
              disabled={!name.trim()}
              aria-label={`${copy.action} for game ${route.gameId}`}
            >
              {copy.action}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
