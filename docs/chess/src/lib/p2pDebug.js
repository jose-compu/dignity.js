const PREFIX = '[chess-p2p]';

function ts() {
  return new Date().toISOString().slice(11, 23);
}

export function p2pLog(label, detail) {
  if (detail === undefined) {
    console.log(`${PREFIX} ${ts()} ${label}`);
    return;
  }
  console.log(`${PREFIX} ${ts()} ${label}`, detail);
}

export function p2pWarn(label, detail) {
  if (detail === undefined) {
    console.warn(`${PREFIX} ${ts()} ${label}`);
    return;
  }
  console.warn(`${PREFIX} ${ts()} ${label}`, detail);
}

export function p2pError(label, detail) {
  if (detail === undefined) {
    console.error(`${PREFIX} ${ts()} ${label}`);
    return;
  }
  console.error(`${PREFIX} ${ts()} ${label}`, detail);
}

export function connectionSnapshot(node) {
  const adapter = node?.networkAdapter;
  if (!adapter) {
    return { adapter: 'none' };
  }

  const openIds = [];
  if (adapter.connections instanceof Map) {
    for (const [peerId, conn] of adapter.connections.entries()) {
      if (conn?.open) {
        openIds.push(peerId);
      }
    }
  }

  return {
    signalingUrl: adapter.url || null,
    localPeerId: adapter.nodeId || node?.nodeId || null,
    openConnectionCount: node?.getConnectionStats?.()?.openCount ?? adapter.getOpenConnectionCount?.() ?? openIds.length,
    openPeerIds: node?.getConnectionStats?.()?.peerIds ?? openIds,
    peerJsReady: Boolean(adapter.peer)
  };
}

export function attachNodeDebugListeners(node, context = {}) {
  if (!node || node.__chessDebugAttached) {
    return () => undefined;
  }

  node.__chessDebugAttached = true;
  const role = context.role || '?';

  p2pLog(`debug attached (${role})`, {
    nodeId: node.nodeId,
    scope: context.scope,
    gameId: context.gameId
  });

  const handlers = {
    warning: (event) => p2pWarn('node warning', event),
    securityerror: (event) => p2pError('security error', {
      senderId: event?.senderId,
      code: event?.error?.code,
      message: event?.error?.message
    }),
    messageignored: (event) => p2pWarn('message ignored', event),
    peerdiscovered: (event) => p2pLog('peer discovered', event),
    peerleft: (event) => p2pLog('peer left', event),
    peerbanned: (event) => p2pError('peer banned', event),
    conflict: (event) => p2pWarn('sync conflict', event),
    change: (event) => {
      if (event?.collection === context.collection) {
        p2pLog('game record changed', {
          id: event.id,
          kind: event.kind,
          version: event.version
        });
      }
    },
    message: (event) => {
      if (event?.type === 'claim-seat' || event?.type === 'operation') {
        p2pLog('incoming message', {
          type: event.type,
          senderId: event.senderId,
          payload: event.payload
        });
      }
    }
  };

  for (const [eventName, handler] of Object.entries(handlers)) {
    node.on(eventName, handler);
  }

  if (node.networkAdapter?.peer) {
    const peer = node.networkAdapter.peer;
    peer.on('error', (err) => {
      p2pError('PeerJS error', {
        type: err?.type,
        message: err?.message || String(err)
      });
    });
    peer.on('disconnected', () => p2pWarn('PeerJS disconnected from signaling server'));
    peer.on('close', () => p2pWarn('PeerJS peer closed'));
    peer.on('connection', (conn) => {
      p2pLog('PeerJS inbound connection', { from: conn.peer });
      conn.on('open', () => p2pLog('PeerJS data channel open (inbound)', { peer: conn.peer }));
      conn.on('close', () => p2pWarn('PeerJS data channel closed (inbound)', { peer: conn.peer }));
      conn.on('error', (err) => p2pError('PeerJS data channel error (inbound)', {
        peer: conn.peer,
        message: err?.message || String(err)
      }));
    });
  }

  return () => {
    for (const [eventName, handler] of Object.entries(handlers)) {
      node.off(eventName, handler);
    }
    delete node.__chessDebugAttached;
  };
}

export function dumpJoinState({
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
}) {
  const snap = connectionSnapshot(node);
  const payload = {
    role: route.role,
    localNodeId: nodeId,
    nodeRunningId: node?.nodeId,
    hostPeerTarget: remoteHostPeer,
    routeHostParam: route.hostPeer,
    gameId: route.gameId,
    scope,
    dignityStatus: status,
    dignityError: error?.message || null,
    joinedDiscovery: joined,
    roomConnected,
    connectionCount,
    peerJs: snap,
    peers: peers.map((p) => ({
      peerId: p.peerId,
      role: p.metadata?.role,
      nickname: p.metadata?.nickname,
      joinToken: p.metadata?.joinToken ? `${p.metadata.joinToken.slice(0, 6)}…` : null
    })),
    game: game ? {
      status: game.data?.status,
      whitePlayerId: game.data?.whitePlayerId,
      blackPlayerId: game.data?.blackPlayerId,
      joinTokenUsed: game.data?.joinTokenUsed,
      joinTokenMatch: route.joinToken === game.data?.joinToken,
      version: game.version
    } : null,
    myColor,
    webrtc: typeof RTCPeerConnection !== 'undefined' ? 'available' : 'missing'
  };

  p2pLog('STATE SNAPSHOT', payload);
  return payload;
}

export function installGlobalDebug(dumpFn) {
  if (typeof window === 'undefined') {
    return;
  }
  window.__chessP2pDump = dumpFn;
  p2pLog('manual dump: run __chessP2pDump() in console');
}
