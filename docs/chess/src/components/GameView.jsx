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
  createFreshKeyPair,
  findPlayerKeyPairByPublicKey,
  keyPairToPublicBundle,
  loadPlayerKeyPair,
  savePlayerKeyRecord
} from '../lib/playerKeys.js';
import {
  buildResumeLink,
  checkpointSeatForPublicKey,
  gamePatchFromCheckpoint,
  isCheckpointFullySigned,
  resolveCheckpointFromRoute,
  validateCheckpointForResume
} from '../lib/resumeCheckpoint.js';
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
import ResumePanel from './ResumePanel.jsx';

const COLLECTION = 'chess-matches';
const START_FEN = new Chess().fen();

function canResume(route, game, routeCheckpoint) {
  if (routeCheckpoint) {
    return validateCheckpointForResume(routeCheckpoint).ok;
  }
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

  const [routeCheckpoint, setRouteCheckpoint] = useState(null);
  const [resumeSeat, setResumeSeat] = useState(null);
  const [keyPair, setKeyPair] = useState(() => {
    if (route.role === 'host') {
      return loadPlayerKeyPair(route.gameId, 'white') || createFreshKeyPair();
    }
    if (route.role === 'join') {
      return loadPlayerKeyPair(route.gameId, 'black') || createFreshKeyPair();
    }
    return createFreshKeyPair();
  });
  const [pendingProposal, setPendingProposal] = useState(null);
  const [finalizedCheckpoint, setFinalizedCheckpoint] = useState(null);
  const [resumeLink, setResumeLink] = useState('');
  const restoredFromCheckpointRef = React.useRef(false);

  useEffect(() => {
    let cancelled = false;
    resolveCheckpointFromRoute(route).then((checkpoint) => {
      if (!cancelled) {
        setRouteCheckpoint(checkpoint);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [route.checkpoint, route.checkpointRef, route.gameId, route.roomKey]);

  useEffect(() => {
    if (route.role !== 'resume' || !routeCheckpoint) {
      return;
    }

    const whiteKeys = findPlayerKeyPairByPublicKey(routeCheckpoint.white?.publicKey);
    const blackKeys = findPlayerKeyPairByPublicKey(routeCheckpoint.black?.publicKey);

    if (whiteKeys) {
      setKeyPair(whiteKeys);
      setResumeSeat('white');
      return;
    }

    if (blackKeys) {
      setKeyPair(blackKeys);
      setResumeSeat('black');
      return;
    }

    setResumeSeat(null);
  }, [route.role, routeCheckpoint]);

  const dignityConfig = useMemo(
    () => createDignityConfig({
      nodeId,
      roomKey,
      scope,
      role: route.role,
      keyPair
    }),
    [nodeId, roomKey, scope, route.role, keyPair]
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

  const discoveryOptions = useMemo(
    () => {
      if (!node || status !== 'running') {
        return null;
      }

      if (route.role !== 'host' && route.role !== 'resume' && !hostPeerFromRoute(route, game, node.nodeId)) {
        return null;
      }

      const bootstrapHost = hostPeerFromRoute(route, game, node.nodeId);

      return {
        metadata: {
          nickname,
          role: route.role,
          joinToken: route.joinToken || null,
          signingPublicKey: keyPair ? keyPairToPublicBundle(keyPair).signingPublicKey : null,
          seat: route.role === 'host' ? 'white' : route.role === 'join' ? 'black' : resumeSeat
        },
        bootstrapPeerIds: route.role !== 'host' && bootstrapHost ? [bootstrapHost] : [],
        heartbeatIntervalMs: 12000,
        ttlMs: 45000
      };
    },
    [node, status, route, game, nickname, keyPair, resumeSeat]
  );

  const { joined } = useDiscovery(node, scope, discoveryOptions);
  const peers = usePeers(node, scope, { includeSelf: false });

  const remoteHostPeer = useMemo(() => {
    if (route.role === 'resume' && routeCheckpoint && resumeSeat === 'black') {
      const targetKey = routeCheckpoint.white?.publicKey?.signingPublicKey;
      const matched = peers.find((peer) => peer.metadata?.signingPublicKey === targetKey);
      if (matched) {
        return matched.peerId;
      }
    }

    if (route.role === 'resume' && resumeSeat === 'white' && node?.nodeId) {
      return node.nodeId;
    }

    return hostPeerFromRoute(route, game, node?.nodeId);
  }, [route, routeCheckpoint, resumeSeat, peers, game, node?.nodeId]);

  useEffect(() => {
    if (!node || status !== 'running') {
      return undefined;
    }

    const isLocalHost = route.role === 'host' || (route.role === 'resume' && resumeSeat === 'white');
    if (isLocalHost) {
      setRoomConnected(true);
      return undefined;
    }

    if (!remoteHostPeer) {
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
      }
    }

    maintainHostConnection();
    const timer = setInterval(maintainHostConnection, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [node, status, route.role, resumeSeat, remoteHostPeer]);

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
          whiteNickname: nickname,
          blackNickname: null,
          whitePublicKey: node.getPublicKey(),
          blackPublicKey: null,
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
    const fen = game?.data?.fen || routeCheckpoint?.fen;
    if (fen) {
      instance.load(fen);
    }
    return instance;
  }, [game?.data?.fen, game?.version, routeCheckpoint?.fen]);

  const myColor = useMemo(() => {
    if (!node || !game) {
      return null;
    }
    if (resumeSeat === 'white' || game.data.whitePlayerId === node.nodeId) {
      return 'w';
    }
    if (resumeSeat === 'black' || game.data.blackPlayerId === node.nodeId) {
      return 'b';
    }
    if (routeCheckpoint && keyPair) {
      const seat = checkpointSeatForPublicKey(routeCheckpoint, keyPairToPublicBundle(keyPair));
      if (seat === 'white') {
        return 'w';
      }
      if (seat === 'black') {
        return 'b';
      }
    }
    if (route.role === 'watch' || (route.role === 'join' && !game.data.joinTokenUsed)) {
      return null;
    }
    return null;
  }, [node, game, route.role, routeCheckpoint, keyPair, resumeSeat]);

  const mySeat = useMemo(() => {
    if (myColor === 'w') {
      return 'white';
    }
    if (myColor === 'b') {
      return 'black';
    }
    if (resumeSeat) {
      return resumeSeat;
    }
    if (route.role === 'host') {
      return 'white';
    }
    if (route.role === 'join') {
      return 'black';
    }
    return null;
  }, [myColor, resumeSeat, route.role]);

  const remotePlayerPeer = useMemo(() => {
    if (!game?.data) {
      return null;
    }
    if (mySeat === 'white') {
      return game.data.blackPlayerId;
    }
    if (mySeat === 'black') {
      return game.data.whitePlayerId;
    }
    return null;
  }, [game, mySeat]);

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
    if (!node || (route.role !== 'host' && !(route.role === 'resume' && resumeSeat === 'white'))) {
      return;
    }

    withHostPeerInHash(node.nodeId);
  }, [node, route.role, resumeSeat]);

  useEffect(() => {
    if (!node) {
      return;
    }

    const isHostSide = route.role === 'host' || (route.role === 'resume' && resumeSeat === 'white');
    if (!isHostSide) {
      return;
    }

    peers.forEach((peer) => {
      connectToRoomPeer(node, peer.peerId);
    });
  }, [node, route.role, resumeSeat, peers]);

  useEffect(() => {
    if (!node || status !== 'running' || route.role !== 'host') {
      return;
    }

    if (node.read(COLLECTION, route.gameId)) {
      return;
    }

    ensureHostGame();
  }, [node, status, route.role, route.gameId, ensureHostGame]);

  const completeJoin = useCallback(async (joinerPeerId, joinToken, joinerMeta = {}) => {
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
      blackNickname: joinerMeta.nickname || existing.data.blackNickname || 'Black',
      blackPublicKey: joinerMeta.publicKey || existing.data.blackPublicKey || null,
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
    if (!node) {
      return undefined;
    }

    const handleResumeMessages = async (message) => {
      if (message.type === 'resume-checkpoint-proposal') {
        setPendingProposal({
          fromSeat: message.payload?.fromSeat,
          checkpoint: message.payload?.checkpoint,
          fromPeer: message.senderId
        });
        setNotice('Your opponent proposed pausing here. Review the Resume panel.');
        return;
      }

      if (message.type === 'resume-checkpoint-final') {
        const checkpoint = message.payload?.checkpoint;
        if (isCheckpointFullySigned(checkpoint)) {
          setFinalizedCheckpoint(checkpoint);
          setPendingProposal(null);
          const link = await buildResumeLink(checkpoint);
          setResumeLink(link);
          setNotice('Dual-signed resume link is ready.');
        }
        return;
      }

      const isHostSide = route.role === 'host' || (route.role === 'resume' && resumeSeat === 'white');
      if (message.type === 'resume-rejoin' && isHostSide) {
        const expectedKey = game?.data?.blackPublicKey?.signingPublicKey
          || routeCheckpoint?.black?.publicKey?.signingPublicKey;
        if (message.payload?.publicKey?.signingPublicKey !== expectedKey) {
          return;
        }

        await node.updateWithRetry(COLLECTION, route.gameId, (existing) => ({
          ...existing.data,
          blackPlayerId: message.payload.peerId || message.senderId,
          blackNickname: message.payload.nickname || existing.data.blackNickname || 'Black',
          blackPublicKey: message.payload.publicKey || existing.data.blackPublicKey,
          joinTokenUsed: true,
          status: existing.data.status === 'waiting' ? 'playing' : existing.data.status
        }), {
          broadcastScope: scope,
          connectToPeers: [message.payload.peerId || message.senderId]
        });
        setNotice('Black rejoined from signed resume link.');
      }
    };

    node.on('message', handleResumeMessages);
    return () => node.off('message', handleResumeMessages);
  }, [node, route.role, route.gameId, resumeSeat, routeCheckpoint, game, scope]);

  useEffect(() => {
    if (!node || status !== 'running' || !routeCheckpoint || resumeSeat !== 'white') {
      return;
    }
    if (restoredFromCheckpointRef.current) {
      return;
    }

    let cancelled = false;

    async function restoreCheckpoint() {
      const patch = gamePatchFromCheckpoint(routeCheckpoint, node.nodeId, 'white');
      const existing = node.read(COLLECTION, route.gameId);
      if (existing) {
        await node.updateWithRetry(COLLECTION, route.gameId, () => patch, { broadcastScope: scope });
      } else {
        await node.create(COLLECTION, patch, { id: route.gameId, broadcastScope: scope });
      }

      if (!cancelled) {
        restoredFromCheckpointRef.current = true;
        withHostPeerInHash(node.nodeId);
        setNotice('Restored signed checkpoint as White.');
      }
    }

    restoreCheckpoint().catch((restoreError) => {
      p2pError('checkpoint restore failed', restoreError);
      setNotice(restoreError.message);
    });

    return () => {
      cancelled = true;
    };
  }, [node, status, routeCheckpoint, resumeSeat, route.gameId, scope]);

  useEffect(() => {
    if (!node || status !== 'running' || route.role !== 'resume' || resumeSeat !== 'black' || !joined) {
      return undefined;
    }
    if (!remoteHostPeer) {
      return undefined;
    }

    let cancelled = false;

    async function resumeRejoin() {
      if (cancelled) {
        return;
      }

      await connectToRoomPeer(node, remoteHostPeer);
      await node.sendDirectMessage(remoteHostPeer, 'resume-rejoin', {
        peerId: node.nodeId,
        nickname,
        publicKey: node.getPublicKey(),
        checkpointId: routeCheckpoint?.createdAt || null
      });
    }

    resumeRejoin();
    const timer = setInterval(resumeRejoin, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [node, status, route.role, resumeSeat, joined, remoteHostPeer, nickname, routeCheckpoint]);

  useEffect(() => {
    if (mySeat && keyPair && route.gameId) {
      savePlayerKeyRecord(route.gameId, mySeat, keyPair, nickname);
    }
  }, [mySeat, keyPair, route.gameId, nickname]);

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
        await completeJoin(joinerPeerId, joinToken, {
          nickname: message.payload?.nickname,
          publicKey: message.payload?.publicKey
        });
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
          nickname,
          publicKey: node.getPublicKey()
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
      resumeLink: resumeLink || null,
      checkpointRef: route.checkpointRef || null,
      nickname,
      localNodeId: node.nodeId,
      status: game?.data?.status || 'waiting',
      winner: game?.data?.winner ?? null,
      moveCount: game?.data?.moveHistory?.length || 0,
      whitePlayerId: game?.data?.whitePlayerId || null,
      blackPlayerId: game?.data?.blackPlayerId || null,
      updatedAt: game?.updatedAt || Date.now()
    });
  }, [node, route, game, nickname, resumeLink]);

  const handleProposeCheckpoint = useCallback(async (checkpoint, remotePeerId) => {
    if (!node) {
      return;
    }

    setPendingProposal({ fromSeat: mySeat, checkpoint, fromPeer: node.nodeId });
    if (remotePeerId) {
      await node.sendDirectMessage(remotePeerId, 'resume-checkpoint-proposal', {
        fromSeat: mySeat,
        checkpoint
      });
    }
    setNotice('Checkpoint signed. Waiting for opponent to co-sign.');
  }, [node, mySeat]);

  const handleAcceptCheckpoint = useCallback(async (checkpoint, remotePeerId) => {
    if (!node) {
      return;
    }

    setFinalizedCheckpoint(checkpoint);
    setPendingProposal(null);
    const link = await buildResumeLink(checkpoint);
    setResumeLink(link);
    if (remotePeerId) {
      await node.sendDirectMessage(remotePeerId, 'resume-checkpoint-final', { checkpoint });
    }
    setNotice('Dual-signed resume link is ready.');
  }, [node]);

  const handleFinalizedCheckpoint = useCallback((checkpoint, link) => {
    setResumeLink(link);
    if (!node) {
      return;
    }

    saveLocalGameSession({
      gameId: route.gameId,
      roomKey: route.roomKey,
      role: route.role,
      resumeLink: link,
      checkpointRef: route.checkpointRef || null,
      status: game?.data?.status || 'playing',
      updatedAt: Date.now()
    });
  }, [node, route.gameId, route.roomKey, route.role, route.checkpointRef, game]);

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

  if (route.role === 'resume' && routeCheckpoint && validateCheckpointForResume(routeCheckpoint).ok && resumeSeat === null) {
    return (
      <section className="panel error-panel">
        <h2>Seat keys not found on this device</h2>
        <p>
          This resume link carries a valid dual-signed checkpoint, but this browser does not have your
          player signing keys. Open the link on the device that played, or import a seat key backup
          from the Resume panel before leaving.
        </p>
        <button type="button" onClick={onBack}>Back</button>
      </section>
    );
  }

  if (route.role === 'resume' && routeCheckpoint && !validateCheckpointForResume(routeCheckpoint).ok) {
    return (
      <section className="panel error-panel">
        <h2>Invalid signed checkpoint</h2>
        <p>The resume link checkpoint failed signature validation.</p>
        <button type="button" onClick={onBack}>Back</button>
      </section>
    );
  }

  if (route.role === 'resume' && !routeCheckpoint && game && !canResume(route, game, routeCheckpoint)) {
    return (
      <section className="panel error-panel">
        <h2>Invalid resume link</h2>
        <p>Use a dual-signed resume link generated after both players co-sign the checkpoint.</p>
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
          resumeLink={resumeLink}
          onRegenerateResume={game ? regenerateResumeLink : undefined}
        />
      ) : null}

      {mySeat && game?.data?.status === 'playing' ? (
        <ResumePanel
          game={game}
          gameId={route.gameId}
          roomKey={roomKey}
          scope={scope}
          node={node}
          keyPair={keyPair}
          nickname={nickname}
          mySeat={mySeat}
          remotePeerId={remotePlayerPeer}
          pendingProposal={pendingProposal}
          finalizedCheckpoint={finalizedCheckpoint}
          onPropose={handleProposeCheckpoint}
          onAcceptProposal={handleAcceptCheckpoint}
          onDeclineProposal={() => setPendingProposal(null)}
          onFinalized={handleFinalizedCheckpoint}
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
          resumeLink={resumeLink}
        />
      ) : null}

      <div className="game-grid">
        <Board3D
          fen={game?.data?.fen || routeCheckpoint?.fen || START_FEN}
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
            gameStatus={game?.data?.status || routeCheckpoint?.status || 'waiting'}
            turn={game?.data?.turn || routeCheckpoint?.turn || 'w'}
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
              {(game?.data?.moveHistory || routeCheckpoint?.moveHistory || []).map((move) => (
                <li key={move}>{move}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
