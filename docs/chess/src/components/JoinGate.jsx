import React, { useId, useState } from 'react';

const ROLE_COPY = {
  host: {
    title: 'Start game',
    action: 'Start as White',
    hint: 'Enter your username and password to derive your signing keys. Same credentials restore your seat on any device.'
  },
  join: {
    title: 'Join as opponent',
    action: 'Join as Black',
    hint: 'Use the username and password shared by the host for this game room. Your display nickname is shown to other players.'
  },
  watch: {
    title: 'Watch game',
    action: 'Enter as spectator',
    hint: 'Spectators need a username and password for encrypted mesh access. Pick a display name for the spectator list.'
  },
  resume: {
    title: 'Resume game',
    action: 'Reconnect',
    hint: 'Enter the same username and password used when you first played. Import a seat key backup in the lobby if you changed devices without credentials.'
  }
};

export default function JoinGate({
  route,
  defaultNickname,
  defaultUsername,
  defaultPassword,
  onConfirm,
  onBack
}) {
  const [name, setName] = useState(defaultNickname);
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState(defaultPassword);
  const nicknameInputId = useId();
  const usernameInputId = useId();
  const passwordInputId = useId();
  const copy = ROLE_COPY[route.role] || ROLE_COPY.resume;

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    const trimmedUsername = username.trim();
    if (!trimmed || !trimmedUsername || !password) {
      return;
    }
    onConfirm({
      nickname: trimmed,
      username: trimmedUsername,
      password
    });
  }

  const canSubmit = Boolean(name.trim() && username.trim() && password);

  return (
    <section className="join-gate">
      <div className="join-gate__card panel">
        <p className="eyebrow">Game {route.gameId}</p>
        <h2 id="join-gate-title">{copy.title}</h2>
        <p id="join-gate-hint">{copy.hint}</p>

        <form onSubmit={handleSubmit} aria-labelledby="join-gate-title">
          <label className="join-gate__field" htmlFor={usernameInputId}>
            Username
            <input
              id={usernameInputId}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              autoFocus
              maxLength={64}
              autoComplete="username"
              aria-describedby="join-gate-hint"
            />
          </label>

          <label className="join-gate__field" htmlFor={passwordInputId}>
            Password
            <input
              id={passwordInputId}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              maxLength={128}
              autoComplete="current-password"
            />
          </label>

          <label className="join-gate__field" htmlFor={nicknameInputId}>
            Display nickname
            <input
              id={nicknameInputId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nickname"
              maxLength={32}
              autoComplete="nickname"
            />
          </label>

          <div className="join-gate__actions">
            <button type="button" className="ghost" onClick={onBack}>← Back</button>
            <button
              type="submit"
              className="primary"
              disabled={!canSubmit}
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
