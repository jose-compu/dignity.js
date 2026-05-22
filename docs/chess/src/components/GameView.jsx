import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import {
  useDignity,
  useObject,
  usePeers,
  useDiscovery,
} from '../../../../src/react/index.js';
import { createDignityConfig, attachPersistence } from '../lib/dignitySetup.js';
import { buildLinks, randomToken, scopeForGame, withHostPeerInHash, connectToRoomPeer, hostPeerFromRoute } from '../lib/links.js';
import {
  attachNodeDebugListeners,
  connectionSnapshot,
  dumpJoinState,
  installGlobalDebug,
  p2pError,
  p2pLog,
  p2pWarn
} from '../lib/p2pDebug.js';
import { saveLocalGameSession } from '../lib/localGames.js';
import {
  playCaptureSound,
  playCheckSound,
  playGameStartSound,
  playMoveSound,
  resumeAudio
} from '../lib/audio.js';
import Board3D from './Board3D.jsx';
import LinkPanel from './LinkPanel.jsx';
import MovePanel from './MovePanel.jsx';

const COLLECTION = 'chess-matches';
const START_FEN = new Chess().fen();

function canResume(route, game) {
  return route.resumeToken && game?.data?.resumeToken === route.resumeToken;
}

function canWatch(route, game) {
  return route.watchToken && game?.data?.watchToken === route.watchToken;
}

function canJoin(route, game) {
  return (
    route.role === 'join'
    && route.joinToken
    && game?.data?.joinToken === route.joinToken
    && !game?.data?.joinTokenUsed
  );
}

export default function GameView({ route, nodeId, nickname, onBack }) {
  const scope = scopeForGame(route.gameId);
  const roomKey = route.roomKey;

  p2pLog('GameView mount', { role: route.role, nodeId, gameId: route.gameId, hostPeer: route.hostPeer });

  const dignityConfig = useMemo(
    () => createDignityConfig({
      nodeId,
      roomKey,
      scope,
      role: route.role
    }),
    [nodeId, roomKey, scope, route.role]
  );

  const { node, status, error } = useDignity(dignityConfig);
  const game = useObject(node, COLLECTION, route.gameId);
  const [roomConnected, setRoomConnected] = useState(route.role === 'host');
  const [connectionCount, setConnectionCount] = useState(0);
  const [notice, setNotice] = useState('');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [creating, setCreating] = useState(false);
  const creatingRef = React.useRef(false);

  const remoteHostPeer = hostPeerFromRoute(route, game, node?.nodeId);

  useEffect(() => {
    if (!node) {
      return undefined;
    }

    return attachNodeDebugListeners(node, {
      role: route.role,
      scope,
      gameId: route.gameId,
      collection: COLLECTION
    });
  }, [node, route.role, scope, route.gameId]);

  useEffect(() => {
    if (status === 'error' && error) {
      p2pError('dignity start failed', error);
    } else if (status === 'running') {
      p2pLog('dignity running', connectionSnapshot(node));
    }
  }, [status, error, node]);

  useEffect(() => {
    if (!node || status !== 'running' || route.role === 'host') {
      if (route.role === 'host') {
        setRoomConnected(true);
      }
      return undefined;
    }

    if (!remoteHostPeer) {
      p2pWarn('joiner missing host peer target', { routeHost: route.hostPeer, whitePlayerId: game?.data?.whitePlayerId });
      setRoomConnected(false);
      return undefined;
    }

    let cancelled = false;

    async function maintainHostConnection() {
      if (cancelled) {
        return;
      }

      const result = await connectToRoomPeer(node, remoteHostPeer);
      if (!cancelled) {
        setRoomConnected(result.ok);
        setConnectionCount(node.networkAdapter?.getOpenConnectionCount?.() || 0);
        if (result.ok) {
          p2pLog('connected to host peer', { host: remoteHostPeer, open: result.open });
        } else {
          p2pWarn('host connect attempt failed', { host: remoteHostPeer, ...result });
        }
      }
    }

    maintainHostConnection();
    const timer = setInterval(maintainHostConnection, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [node, status, route.role, remoteHostPeer, route.hostPeer, game?.data?.whitePlayerId]);

  const discoveryOptions = useMemo(
    () => {
      if (!node || status !== 'running') {
        return null;
      }

      if (route.role !== 'host' && !remoteHostPeer) {
        return null;
      }

      return {
        metadata: {
          nickname,
          role: route.role,
          joinToken: route.joinToken || null
        },
        bootstrapPeerIds: route.role !== 'host' && remoteHostPeer ? [remoteHostPeer] : [],
        heartbeatIntervalMs: 12000,
        ttlMs: 45000
      };
    },
    [node, status, route.role, route.joinToken, remoteHostPeer, nickname]
  );

  const { joined } = useDiscovery(node, scope, discoveryOptions);
  const peers = usePeers(node, scope, { includeSelf: false });

  useEffect(() => {
    if (joined) {
      p2pLog('discovery joined', { scope, role: route.role, metadata: discoveryOptions?.metadata });
    }
  }, [joined, scope, route.role, discoveryOptions]);

  useEffect(() => {
    if (peers.length) {
      p2pLog('peers updated', peers.map((p) => ({
        id: p.peerId,
        role: p.metadata?.role,
        nick: p.metadata?.nickname
      })));
    }
  }, [peers]);

  useEffect(() => {
    if (!node || route.role !== 'host') {
      return undefined;
    }

    peers.forEach((peer) => {
      connectToRoomPeer(node, peer.peerId).then((result) => {
        if (!result.ok) {
          p2pWarn('host connect to peer failed', { peer: peer.peerId, ...result });
        }
      });
    });

    const timer = setInterval(() => {
      setConnectionCount(node.networkAdapter?.getOpenConnectionCount?.() || 0);
    }, 2000);

    return () => clearInterval(timer);
  }, [node, route.role, peers]);

  const ensureHostGame = useCallback(async () => {
    if (!node || route.role !== 'host' || creatingRef.current) {
      return node?.read(COLLECTION, route.gameId) || null;
    }

    const existing = node.read(COLLECTION, route.gameId);
    if (existing) {
      return existing;
    }

    creatingRef.current = true;
    setCreating(true);

    const joinToken = route.joinToken || randomToken();
    const watchToken = route.watchToken || randomToken();
    const resumeToken = route.resumeToken || randomToken();

    try {
      await node.create(
        COLLECTION,
        {
          fen: START_FEN,
          status: 'waiting',
          whitePlayerId: node.nodeId,
          blackPlayerId: null,
          joinToken,
          joinTokenUsed: false,
          watchToken,
          resumeToken,
          moveHistory: [],
          turn: 'w',
          winner: null,
          createdBy: nickname
        },
        {
          id: route.gameId,
          broadcastScope: scope
        }
      );
      p2pLog('game created on host', { gameId: route.gameId, whitePlayerId: node.nodeId, joinToken: `${joinToken.slice(0, 6)}…` });
      setNotice('Game created. Share the opponent link to start.');
      playGameStartSound();
    } catch (createError) {
      p2pError('game create failed', createError);
      setNotice(createError.message);
      return null;
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }

    return node.read(COLLECTION, route.gameId);
  }, [node, route.role, route.gameId, route.joinToken, route.watchToken, route.resumeToken, scope, nickname]);

  const chess = useMemo(() => {
    const instance = new Chess();
    if (game?.data?.fen) {
      instance.load(game.data.fen);
    }
    return instance;
  }, [game?.data?.fen, game?.version]);

  const myColor = useMemo(() => {
    if (!node || !game) {
      return null;
    }
    if (game.data.whitePlayerId === node.nodeId) {
      return 'w';
    }
    if (game.data.blackPlayerId === node.nodeId) {
      return 'b';
    }
    if (route.role === 'watch' || (route.role === 'join' && !game.data.joinTokenUsed)) {
      return null;
    }
    return null;
  }, [node, game, route.role]);

  const isSpectator = route.role === 'watch' || (route.role !== 'host' && route.role !== 'join' && !myColor);
  const roleBadge = route.role === 'join'
    ? (myColor === 'b' ? 'Black' : 'Joining…')
    : route.role === 'host'
      ? (myColor === 'w' ? 'White' : 'Host')
      : isSpectator
        ? 'Spectator'
        : myColor === 'w'
          ? 'White'
          : myColor === 'b'
            ? 'Black'
            : route.role;
  const canMove = Boolean(
    myColor
    && game?.data?.status === 'playing'
    && game.data.turn === myColor
    && !isSpectator
  );

  useEffect(() => {
    if (!node) {
      return undefined;
    }

    let persistence;
    attachPersistence(node).then((instance) => {
      persistence = instance;
    });

    return () => {
      persistence?.detach?.();
    };
  }, [node]);

  useEffect(() => {
    if (!node || route.role !== 'host') {
      return;
    }

    withHostPeerInHash(node.nodeId);
  }, [node, route.role]);

  useEffect(() => {
    if (!node) {
      return;
    }

    peers.forEach((peer) => {
      if (route.role === 'host') {
        connectToRoomPeer(node, peer.peerId);
      }
    });
  }, [node, route.role, peers]);

  useEffect(() => {
    if (!node || status !== 'running' || route.role !== 'host') {
      return;
    }

    if (node.read(COLLECTION, route.gameId)) {
      return;
    }

    ensureHostGame();
  }, [node, status, route.role, route.gameId, ensureHostGame]);

  const completeJoin = useCallback(async (joinerPeerId, joinToken) => {
    if (!node || route.role !== 'host') {
      return;
    }

    let current = node.read(COLLECTION, route.gameId);
    if (!current) {
      p2pLog('completeJoin: creating missing host game before accept');
      current = await ensureHostGame();
    }

    if (!current || current.data.joinTokenUsed || current.data.joinToken !== joinToken) {
      p2pWarn('completeJoin skipped', {
        hasGame: Boolean(current),
        joinTokenUsed: current?.data?.joinTokenUsed,
        tokenMatch: current?.data?.joinToken === joinToken,
        joinerPeerId
      });
      return;
    }

    p2pLog('completeJoin accepting', { joinerPeerId, joinToken: `${joinToken.slice(0, 6)}…` });
    const connectResult = await connectToRoomPeer(node, joinerPeerId);
    if (!connectResult.ok) {
      p2pWarn('completeJoin connect to joiner failed', connectResult);
    }

    await node.updateWithRetry(COLLECTION, route.gameId, (existing) => ({
      ...existing.data,
      blackPlayerId: joinerPeerId,
      joinTokenUsed: true,
      status: 'playing'
    }), {
      collaborators: [current.data.whitePlayerId, joinerPeerId],
      broadcastScope: scope,
      connectToPeers: [joinerPeerId]
    });

    await node.pushRecordSnapshot(COLLECTION, route.gameId, {
      broadcastScope: scope,
      connectToPeers: [joinerPeerId]
    });
    p2pLog('completeJoin snapshot pushed', { joinerPeerId, gameId: route.gameId });

    setNotice('Opponent joined. Game started.');
    p2pLog('completeJoin done — game playing', { blackPlayerId: joinerPeerId });
    playGameStartSound();
  }, [node, route.role, route.gameId, scope, ensureHostGame]);

  useEffect(() => {
    if (!node || route.role !== 'host') {
      return;
    }

    const current = node.read(COLLECTION, route.gameId);
    if (!current || current.data.joinTokenUsed) {
      return;
    }

    peers.forEach((peer) => {
      if (peer.metadata?.role === 'join' && peer.metadata?.joinToken === current.data.joinToken) {
        completeJoin(peer.peerId, peer.metadata.joinToken);
      }
    });
  }, [peers, node, route.role, route.gameId, completeJoin]);

  useEffect(() => {
    if (!node || route.role !== 'host') {
      return undefined;
    }

    const handleMessage = async (message) => {
      if (message.type !== 'claim-seat') {
        return;
      }

      p2pLog('host received claim-seat', message);

      let current = node.read(COLLECTION, route.gameId);
      if (!current) {
        p2pLog('claim-seat: host game missing, creating now');
        current = await ensureHostGame();
      }

      if (!current || current.data.joinTokenUsed) {
        p2pWarn('claim-seat ignored', {
          hasGame: Boolean(current),
          joinTokenUsed: current?.data?.joinTokenUsed
        });
        return;
      }

      const joinToken = message.payload?.joinToken;
      const joinerPeerId = message.payload?.peerId || message.senderId;
      if (joinToken === current.data.joinToken) {
        await completeJoin(joinerPeerId, joinToken);
      } else {
        p2pWarn('claim-seat token mismatch', {
          expected: `${current.data.joinToken?.slice(0, 6)}…`,
          got: `${joinToken?.slice(0, 6)}…`
        });
      }
    };

    node.on('message', handleMessage);
    return () => node.off('message', handleMessage);
  }, [node, route.role, route.gameId, completeJoin, ensureHostGame]);

  useEffect(() => {
    if (!node || route.role !== 'join' || !route.joinToken || status !== 'running' || !joined) {
      return undefined;
    }

    const current = node.read(COLLECTION, route.gameId);
    if (current?.data?.blackPlayerId === node.nodeId) {
      return undefined;
    }
    if (current?.data?.joinTokenUsed && current.data.blackPlayerId !== node.nodeId) {
      return undefined;
    }

    let cancelled = false;

    async function requestSeat() {
      if (cancelled) {
        return;
      }

      const connectResult = await connectToRoomPeer(node, remoteHostPeer);
      p2pLog('joiner requestSeat', {
        host: remoteHostPeer,
        connect: connectResult,
        links: node.networkAdapter?.getOpenConnectionCount?.() || 0
      });

      try {
        await node.broadcastMessage('claim-seat', {
          joinToken: route.joinToken,
          peerId: node.nodeId,
          nickname
        }, {
          broadcastScope: scope,
          connectToPeers: remoteHostPeer ? [remoteHostPeer] : []
        });
        p2pLog('claim-seat broadcast sent', { scope, joinToken: `${route.joinToken.slice(0, 6)}…` });
      } catch (broadcastError) {
        p2pError('claim-seat broadcast failed', {
          message: broadcastError?.message,
          connectResult
        });
      }
    }

    requestSeat();
    setNotice('Connected to host. Requesting Black…');

    const timer = setInterval(requestSeat, 4000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [
    node,
    route.role,
    route.joinToken,
    route.gameId,
    status,
    joined,
    remoteHostPeer,
    nickname,
    scope
  ]);

  useEffect(() => {
    if (!game) {
      return;
    }

    if (route.role === 'join' && game.data.blackPlayerId === node?.nodeId) {
      setNotice('You joined as Black.');
    }
  }, [game, route.role, node]);

  useEffect(() => {
    if (!node) {
      return undefined;
    }

    const dump = () => dumpJoinState({
      route,
      node,
      nodeId,
      scope,
      status,
      error,
      joined,
      roomConnected,
      connectionCount,
      remoteHostPeer,
      peers,
      game,
      myColor
    });

    installGlobalDebug(dump);
    dump();

    const timer = setInterval(() => {
      if (game?.data?.status === 'playing') {
        return;
      }
      dump();
    }, 5000);

    return () => clearInterval(timer);
  }, [
    node,
    nodeId,
    route,
    scope,
    status,
    error,
    joined,
    roomConnected,
    connectionCount,
    remoteHostPeer,
    peers,
    game,
    myColor
  ]);

  useEffect(() => {
    if (!node || !route.gameId || !route.roomKey) {
      return;
    }

    saveLocalGameSession({
      gameId: route.gameId,
      roomKey: route.roomKey,
      role: route.role,
      hostPeer: route.hostPeer || (route.role === 'host' ? node.nodeId : null),
      joinToken: route.joinToken,
      watchToken: route.watchToken,
      resumeToken: route.resumeToken || game?.data?.resumeToken || null,
      nickname,
      localNodeId: node.nodeId,
      status: game?.data?.status || 'waiting',
      winner: game?.data?.winner ?? null,
      moveCount: game?.data?.moveHistory?.length || 0,
      whitePlayerId: game?.data?.whitePlayerId || null,
      blackPlayerId: game?.data?.blackPlayerId || null,
      updatedAt: game?.updatedAt || Date.now()
    });
  }, [node, route, game, nickname]);

  const regenerateResumeLink = useCallback(async () => {
    if (!node || !game) {
      return;
    }

    const resumeToken = randomToken();
    await node.updateWithRetry(COLLECTION, route.gameId, (current) => ({
      ...current.data,
      resumeToken
    }), { broadcastScope: scope });

    const links = buildLinks({
      gameId: route.gameId,
      roomKey,
      hostPeer: node.nodeId,
      joinToken: game.data.joinToken,
      watchToken: game.data.watchToken,
      resumeToken
    });
    await navigator.clipboard.writeText(links.resume);
    setNotice('New resume link copied.');
  }, [node, game, route.gameId, roomKey, scope]);

  const applyMove = useCallback(async (from, to) => {
    if (!node || !game || !canMove) {
      return;
    }

    await resumeAudio();
    const attempt = new Chess(game.data.fen);
    const move = attempt.move({ from, to, promotion: 'q' });
    if (!move) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    const nextHistory = [...(game.data.moveHistory || []), move.san];
    const patch = {
      fen: attempt.fen(),
      moveHistory: nextHistory,
      lastMove: { from, to, san: move.san },
      turn: attempt.turn(),
      status: attempt.isGameOver() ? 'finished' : 'playing',
      winner: attempt.isCheckmate()
        ? (attempt.turn() === 'w' ? 'b' : 'w')
        : attempt.isDraw() ? 'draw' : null
    };

    const peerTargets = [game.data.blackPlayerId, game.data.whitePlayerId]
      .filter((peerId) => peerId && peerId !== node.nodeId);

    await node.updateWithRetry(COLLECTION, route.gameId, (current) => ({
      ...current.data,
      ...patch
    }), {
      broadcastScope: scope,
      connectToPeers: peerTargets
    });

    if (move.captured) {
      playCaptureSound();
    } else {
      playMoveSound();
    }
    if (attempt.inCheck()) {
      playCheckSound();
    }

    setSelectedSquare(null);
    setLegalTargets([]);
  }, [node, game, canMove, route.gameId, scope]);

  const handleSquareClick = useCallback((square) => {
    if (!canMove) {
      return;
    }

    if (selectedSquare && legalTargets.includes(square)) {
      applyMove(selectedSquare, square);
      return;
    }

    const piece = chess.get(square);
    if (!piece || piece.color !== myColor) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    const moves = chess.moves({ square, verbose: true });
    setSelectedSquare(square);
    setLegalTargets(moves.map((move) => move.to));
  }, [canMove, selectedSquare, legalTargets, chess, myColor, applyMove]);

  if (!roomKey) {
    return <p className="error">Missing room key in link.</p>;
  }

  if (route.role === 'join' && !remoteHostPeer) {
    return (
      <section className="panel error-panel">
        <h2>Invalid opponent link</h2>
        <p>
          This join link is missing the host peer id. Ask the host to copy a fresh opponent link
          from the Share links panel (links generated after the host connects).
        </p>
        <button type="button" onClick={onBack}>Back</button>
      </section>
    );
  }

  if (route.role === 'join' && game && game.data.joinTokenUsed && game.data.blackPlayerId !== node?.nodeId) {
    return (
      <section className="panel error-panel">
        <h2>Join link expired</h2>
        <p>This opponent link was already used. Request a resume link from a player.</p>
        <button type="button" onClick={onBack}>Back</button>
      </section>
    );
  }

  if (route.role === 'watch' && game && !canWatch(route, game) && route.watchToken) {
    return (
      <section className="panel error-panel">
        <h2>Invalid spectator link</h2>
        <button type="button" onClick={onBack}>Back</button>
      </section>
    );
  }

  if (route.role === 'resume' && game && !canResume(route, game)) {
    return (
      <section className="panel error-panel">
        <h2>Invalid resume link</h2>
        <button type="button" onClick={onBack}>Back</button>
      </section>
    );
  }

  return (
    <div className="game-layout">
      <header className="game-header">
        <button type="button" className="ghost" onClick={onBack}>← Lobby</button>
        <div>
          <h2>Game {route.gameId}</h2>
          <p className="status-line">
            Network: {status}
            {joined ? ' · in room' : roomConnected ? ' · connecting room…' : ' · waiting for host peer…'}
            {remoteHostPeer ? ` · host ${remoteHostPeer}` : ''}
            {connectionCount ? ` · ${connectionCount} link(s)` : ''}
            {error ? ` · ${error.message}` : ''}
          </p>
        </div>
        <div className="badge">{roleBadge}</div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {route.role === 'host' && route.joinToken && route.watchToken ? (
        <LinkPanel
          prominent
          audience="host"
          gameId={route.gameId}
          roomKey={roomKey}
          hostPeer={node?.nodeId}
          game={game}
          joinToken={route.joinToken}
          watchToken={route.watchToken}
          resumeToken={route.resumeToken}
          onRegenerateResume={game ? regenerateResumeLink : undefined}
        />
      ) : null}

      {route.role === 'join' && myColor === 'b' && game ? (
        <LinkPanel
          prominent
          audience="player"
          gameId={route.gameId}
          roomKey={roomKey}
          hostPeer={remoteHostPeer}
          game={game}
          watchToken={route.watchToken}
          resumeToken={route.resumeToken}
        />
      ) : null}

      <div className="game-grid">
        <Board3D
          fen={game?.data?.fen || START_FEN}
          selectedSquare={selectedSquare}
          legalTargets={legalTargets}
          onSquareClick={handleSquareClick}
          orientation={myColor || 'w'}
          interactive={canMove}
        />

        <aside className="side-panel">
          <MovePanel
            chess={chess}
            canMove={canMove}
            myColor={myColor}
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            onSquareClick={handleSquareClick}
            gameStatus={game?.data?.status || 'waiting'}
            turn={game?.data?.turn || 'w'}
            roomConnected={roomConnected}
            connectionCount={connectionCount}
          />

          <section className="panel">
            <h3>Players</h3>
            <ul>
              <li>White: {game?.data?.whitePlayerId || '—'}</li>
              <li>Black: {game?.data?.blackPlayerId || 'waiting…'}</li>
            </ul>
            <h4>Peers ({peers.length})</h4>
            <ul>
              {peers.map((peer) => (
                <li key={peer.peerId}>
                  {peer.metadata?.nickname || peer.peerId}
                  {' '}
                  <span className="muted">({peer.metadata?.role || 'peer'})</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel moves">
            <h3>Moves</h3>
            <ol>
              {(game?.data?.moveHistory || []).map((move) => (
                <li key={move}>{move}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
