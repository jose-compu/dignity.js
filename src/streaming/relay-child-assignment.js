/**
 * Capacity-aware relay child budgets (#152 milestone 8).
 * @experimental
 */

/**
 * Child slots a relay can serve from uplink ÷ forwarded layer bitrate, capped and floored.
 * @param {Object} options
 * @param {number} options.uplinkBps advertised or estimated uplink capacity
 * @param {number} options.forwardLayerBps bitrate (incl. headroom) of the layer this relay forwards
 * @param {number} [options.maxDegree] configured max fan-out (default 16)
 * @returns {number} integer child budget in [0, maxDegree]; 0 means leaf-only
 */
function assignRelayChildBudget({ uplinkBps, forwardLayerBps, maxDegree = 16 }) {
  if (!Number.isFinite(uplinkBps) || uplinkBps <= 0) {
    return 0;
  }
  if (!Number.isFinite(forwardLayerBps) || forwardLayerBps <= 0) {
    return 0;
  }
  const max = Math.max(0, Math.floor(maxDegree));
  if (max === 0) {
    return 0;
  }
  const raw = Math.floor(uplinkBps / forwardLayerBps);
  return Math.min(max, Math.max(0, raw));
}

/**
 * Attach the first `budget` candidate children (deterministic slice).
 * @param {string[]} childIds ordered attach candidates
 * @param {number} budget from {@link assignRelayChildBudget}
 * @returns {string[]}
 */
function selectRelayChildren(childIds, budget) {
  if (!Array.isArray(childIds)) {
    throw new TypeError('childIds must be an array');
  }
  if (!Number.isFinite(budget) || budget <= 0) {
    return [];
  }
  const n = Math.min(childIds.length, Math.floor(budget));
  return childIds.slice(0, n);
}

/**
 * Per-relay child budgets for a peer list (stable peer order).
 * @param {Object} options
 * @param {Array<{ id: string, uplinkBps: number }>} options.peers
 * @param {number} options.forwardLayerBps
 * @param {number} [options.maxDegree]
 * @returns {Array<{ peerId: string, uplinkBps: number, childBudget: number }>}
 */
function assignRelayChildren({ peers, forwardLayerBps, maxDegree = 16 }) {
  if (!Array.isArray(peers)) {
    throw new TypeError('peers must be an array');
  }
  return peers.map((peer) => {
    if (!peer || typeof peer.id !== 'string') {
      throw new TypeError('each peer needs a string id');
    }
    const uplinkBps = Number(peer.uplinkBps);
    return {
      peerId: peer.id,
      uplinkBps,
      childBudget: assignRelayChildBudget({ uplinkBps, forwardLayerBps, maxDegree })
    };
  });
}

module.exports = {
  assignRelayChildBudget,
  selectRelayChildren,
  assignRelayChildren
};