import { spectatorPeerGroupForGame } from './links.js';

export const SPECTATOR_FEED_COLLECTION = 'chess-matches';

export async function joinSpectatorFeed(node, gameId, options = {}) {
  if (!node?.joinPeerGroup) {
    return null;
  }

  const groupId = spectatorPeerGroupForGame(gameId);
  return node.joinPeerGroup(groupId, {
    fanout: 3,
    maxActivePeers: 6,
    maxHops: 6,
    ...options,
    metadata: {
      role: 'spectator',
      ...(options.metadata || {})
    }
  });
}

export async function leaveSpectatorFeed(node, gameId) {
  if (!node?.leavePeerGroup) {
    return;
  }

  await node.leavePeerGroup(spectatorPeerGroupForGame(gameId));
}

export async function publishSpectatorSnapshot(node, gameId, options = {}) {
  if (!node?.publishRecordToPeerGroup) {
    return null;
  }

  const groupId = spectatorPeerGroupForGame(gameId);
  try {
    return await node.publishRecordToPeerGroup(
      groupId,
      SPECTATOR_FEED_COLLECTION,
      gameId,
      { fanout: options.fanout ?? 3 }
    );
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[chess-spectator-feed] publish failed', error);
    }
    return null;
  }
}
