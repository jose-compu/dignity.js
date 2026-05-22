import {
  DignityP2P,
  createPeerJSNetworkAdapter,
  IndexedDBPersistence,
  DEFAULT_CLOUDFLARE_SIGNALING_URLS
} from '../../../../src/index.js';

export function createDignityConfig({ nodeId, roomKey, scope, nickname, role }) {
  const networkAdapter = createPeerJSNetworkAdapter({
    urls: DEFAULT_CLOUDFLARE_SIGNALING_URLS
  });

  if (typeof console !== 'undefined') {
    console.log('[chess-p2p] signaling urls', DEFAULT_CLOUDFLARE_SIGNALING_URLS);
    console.log('[chess-p2p] dignity config', { nodeId, scope, role, roomKeyLen: roomKey?.length });
  }

  return {
    nodeId,
    networkAdapter,
    security: {
      appPassword: roomKey,
      powTargetMs: 250,
      broadcastPasswords: {
        [scope]: roomKey,
        default: roomKey
      },
      resolveBroadcastScope: () => scope,
      discoveryHeartbeatMs: 12000,
      presenceTtlMs: 36000
    },
    __meta: { nickname, role, scope, roomKey }
  };
}

export async function attachPersistence(node, collections = ['chess-matches']) {
  const persistence = new IndexedDBPersistence({ collections });
  await persistence.attach(node);
  return persistence;
}

export { DignityP2P, IndexedDBPersistence };
