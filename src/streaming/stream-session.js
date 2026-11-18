/**
 * Experimental stream session descriptor (signaling membership; WebRTC media wiring optional).
 * @experimental
 */

const {
  STREAM_ACCESS_MODES,
  normalizePrivateRecipients,
  validateStreamAccessConfig
} = require('./access-modes');

/**
 * @typedef {import('./access-modes').typeof STREAM_ACCESS_MODES[keyof typeof STREAM_ACCESS_MODES]} StreamAccessMode
 */

/**
 * @typedef {Object} StreamSessionOptions
 * @property {string} sessionId
 * @property {string} broadcasterId dignity.js identity id of the origin
 * @property {StreamAccessMode} mode
 * @property {string[]} [privateRecipients]
 * @property {Record<string, unknown>} [metadata]
 */

class StreamSession {
  /**
   * @param {StreamSessionOptions} options
   */
  constructor(options) {
    if (!options || typeof options !== 'object') {
      throw new TypeError('StreamSession options must be an object');
    }
    const { sessionId, broadcasterId, mode, privateRecipients, metadata } = options;

    if (typeof sessionId !== 'string' || sessionId.trim() === '') {
      throw new TypeError('sessionId must be a non-empty string');
    }
    if (typeof broadcasterId !== 'string' || broadcasterId.trim() === '') {
      throw new TypeError('broadcasterId must be a non-empty string');
    }

    this.sessionId = sessionId.trim();
    this.broadcasterId = broadcasterId.trim();
    this.mode = mode;
    this.metadata = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? { ...metadata }
      : {};

    const validatedRecipients = validateStreamAccessConfig(mode, { privateRecipients });
    this.privateRecipients = Object.freeze([...validatedRecipients]);
    this._privateSet = new Set(this.privateRecipients);
  }

  /**
   * Whether an identity may attach to this session (signaling membership, not decrypt capability).
   * Private-track decryption is enforced separately via session keys in the full design.
   * @param {string} identityId
   * @returns {boolean}
   */
  canJoin(identityId) {
    if (typeof identityId !== 'string' || identityId.trim() === '') {
      return false;
    }
    const id = identityId.trim();
    if (id === this.broadcasterId) {
      return true;
    }

    switch (this.mode) {
      case STREAM_ACCESS_MODES.PUBLIC:
      case STREAM_ACCESS_MODES.COMBINED:
        return true;
      case STREAM_ACCESS_MODES.PRIVATE_SINGLE:
      case STREAM_ACCESS_MODES.PRIVATE_LIST:
        return this._privateSet.has(id);
      default:
        return false;
    }
  }

  /**
   * Whether an identity is on the private allowlist (decrypt-capable in private/combined modes).
   * @param {string} identityId
   * @returns {boolean}
   */
  canDecryptPrivateTracks(identityId) {
    if (typeof identityId !== 'string' || identityId.trim() === '') {
      return false;
    }
    const id = identityId.trim();
    if (id === this.broadcasterId) {
      return true;
    }
    if (
      this.mode === STREAM_ACCESS_MODES.PRIVATE_SINGLE
      || this.mode === STREAM_ACCESS_MODES.PRIVATE_LIST
      || this.mode === STREAM_ACCESS_MODES.COMBINED
    ) {
      return this._privateSet.has(id);
    }
    return false;
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      broadcasterId: this.broadcasterId,
      mode: this.mode,
      privateRecipients: [...this.privateRecipients],
      metadata: { ...this.metadata },
      experimental: true
    };
  }
}

/**
 * Create a validated stream session descriptor.
 * @experimental
 * @param {StreamSessionOptions} options
 * @returns {StreamSession}
 */
function createStreamSession(options) {
  return new StreamSession(options);
}

/**
 * @experimental
 * @param {StreamSession} session
 * @param {string} identityId
 * @returns {boolean}
 */
function canJoinStream(session, identityId) {
  if (!(session instanceof StreamSession)) {
    throw new TypeError('session must be a StreamSession instance');
  }
  return session.canJoin(identityId);
}

module.exports = {
  StreamSession,
  createStreamSession,
  canJoinStream
};