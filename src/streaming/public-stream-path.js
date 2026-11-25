/**
 * Minimal public-mode browser origin viewer path over a pluggable signaling bus (#152).
 * No WebRTC wiring; peers exchange signed chunk messages through injectable transport.
 * @experimental
 */

const { STREAM_ACCESS_MODES } = require('./access-modes');
const { createStreamSession } = require('./stream-session');
const {
  createSignedMediaChunk,
  verifyMediaChunk
} = require('./media-chunk');

const STREAM_MESSAGE_TYPES = Object.freeze({
  JOIN_OFFER: 'stream:join-offer',
  JOIN_REQUEST: 'stream:join-request',
  JOIN_ACCEPT: 'stream:join-accept',
  JOIN_REJECT: 'stream:join-reject',
  MEDIA_CHUNK: 'stream:media-chunk'
});

/**
 * In-memory signaling fan-out for tests and demos.
 */
class InMemoryStreamSignalingBus {
  constructor() {
    /** @type {Map<string, function[]>} */
    this._listeners = new Map();
  }

  /**
   * @param {string} peerId
   * @param {(message: object) => void} handler
   */
  subscribe(peerId, handler) {
    if (!this._listeners.has(peerId)) {
      this._listeners.set(peerId, []);
    }
    this._listeners.get(peerId).push(handler);
  }

  /**
   * @param {string} fromPeerId
   * @param {string} toPeerId
   * @param {object} message
   */
  send(fromPeerId, toPeerId, message) {
    const envelope = {
      fromPeerId,
      toPeerId,
      timestamp: Date.now(),
      ...message
    };
    const handlers = this._listeners.get(toPeerId) || [];
    for (const handler of handlers) {
      handler(envelope);
    }
  }

  /**
   * @param {string} fromPeerId
   * @param {string[]} peerIds
   * @param {object} message
   */
  fanout(fromPeerId, peerIds, message) {
    const unique = [...new Set(peerIds)];
    for (const peerId of unique) {
      if (peerId !== fromPeerId) {
        this.send(fromPeerId, peerId, message);
      }
    }
  }
}

class PublicStreamBroadcaster {
  /**
   * @param {Object} options
   * @param {import('./stream-session').StreamSession} options.session
   * @param {Uint8Array} options.signingSecretKey
   * @param {string} options.signingPublicKey
   * @param {InMemoryStreamSignalingBus} options.bus
   * @param {string[]} [options.directViewerIds]
   */
  constructor({ session, signingSecretKey, signingPublicKey, bus, directViewerIds = [] }) {
    if (session.mode !== STREAM_ACCESS_MODES.PUBLIC) {
      throw new Error('PublicStreamBroadcaster requires public access mode');
    }
    this.session = session;
    this.signingSecretKey = signingSecretKey;
    this.signingPublicKey = signingPublicKey;
    this.bus = bus;
    this.directViewerIds = [...directViewerIds];
    this.sequence = 0;
    this.pendingJoin = new Map();

    this._onBusMessage = this._onBusMessage.bind(this);
    this.bus.subscribe(session.broadcasterId, this._onBusMessage);
  }

  announce() {
    this.bus.fanout(this.session.broadcasterId, this.directViewerIds, {
      messageType: STREAM_MESSAGE_TYPES.JOIN_OFFER,
      session: this.session.toJSON(),
      signingPublicKey: this.signingPublicKey
    });
  }

  /**
   * @param {Uint8Array} payloadBytes
   * @param {Object} [chunkMeta]
   */
  publishChunk(payloadBytes, chunkMeta = {}) {
    const chunk = createSignedMediaChunk({
      sessionId: this.session.sessionId,
      broadcasterId: this.session.broadcasterId,
      payloadBytes,
      signingSecretKey: this.signingSecretKey,
      signingPublicKey: this.signingPublicKey,
      sequence: this.sequence,
      timestampMs: chunkMeta.timestampMs,
      layerId: chunkMeta.layerId,
      mimeType: chunkMeta.mimeType,
      keyframe: chunkMeta.keyframe
    });
    this.sequence += 1;

    const downstream = [...this.directViewerIds];
    this.bus.fanout(this.session.broadcasterId, downstream, {
      messageType: STREAM_MESSAGE_TYPES.MEDIA_CHUNK,
      chunk
    });
    return chunk;
  }

  _onBusMessage(envelope) {
    if (envelope.messageType !== STREAM_MESSAGE_TYPES.JOIN_REQUEST) {
      return;
    }
    const viewerId = envelope.viewerId;
    if (!viewerId || typeof viewerId !== 'string') {
      return;
    }
    if (envelope.sessionId !== this.session.sessionId) {
      return;
    }

    if (this.session.canJoin(viewerId)) {
      this.pendingJoin.set(viewerId, viewerId);
      this.bus.send(this.session.broadcasterId, viewerId, {
        messageType: STREAM_MESSAGE_TYPES.JOIN_ACCEPT,
        sessionId: this.session.sessionId,
        broadcasterId: this.session.broadcasterId,
        signingPublicKey: this.signingPublicKey
      });
    } else {
      this.bus.send(this.session.broadcasterId, viewerId, {
        messageType: STREAM_MESSAGE_TYPES.JOIN_REJECT,
        sessionId: this.session.sessionId,
        reason: 'access-denied'
      });
    }
  }

  close() {
    this.pendingJoin.clear();
  }
}

class PublicStreamViewer {
  /**
   * @param {Object} options
   * @param {string} options.viewerId
   * @param {string} options.sessionId
   * @param {string} options.broadcasterId
   * @param {string} options.broadcasterSigningPublicKey
   * @param {InMemoryStreamSignalingBus} options.bus
   */
  constructor({
    viewerId,
    sessionId,
    broadcasterId,
    broadcasterSigningPublicKey,
    bus
  }) {
    this.viewerId = viewerId;
    this.sessionId = sessionId;
    this.broadcasterId = broadcasterId;
    this.broadcasterSigningPublicKey = broadcasterSigningPublicKey;
    this.bus = bus;
    this.joined = false;
    this.chunks = [];

    this._onBusMessage = this._onBusMessage.bind(this);
    this.bus.subscribe(viewerId, this._onBusMessage);
  }

  requestJoin() {
    this.bus.send(this.viewerId, this.broadcasterId, {
      messageType: STREAM_MESSAGE_TYPES.JOIN_REQUEST,
      sessionId: this.sessionId,
      viewerId: this.viewerId
    });
  }

  /**
   * @param {object} envelope
   */
  _onBusMessage(envelope) {
    if (envelope.sessionId && envelope.sessionId !== this.sessionId) {
      return;
    }

    if (envelope.messageType === STREAM_MESSAGE_TYPES.JOIN_ACCEPT) {
      this.joined = true;
      if (envelope.signingPublicKey) {
        this.broadcasterSigningPublicKey = envelope.signingPublicKey;
      }
      return;
    }

    if (envelope.messageType === STREAM_MESSAGE_TYPES.JOIN_REJECT) {
      this.joined = false;
      return;
    }

    if (envelope.messageType === STREAM_MESSAGE_TYPES.MEDIA_CHUNK && envelope.chunk) {
      verifyMediaChunk(envelope.chunk, this.sessionId);
      if (envelope.chunk.broadcasterId !== this.broadcasterId) {
        throw new Error('Unexpected broadcaster for media chunk');
      }
      if (envelope.chunk.signingPublicKey !== this.broadcasterSigningPublicKey) {
        throw new Error('Unexpected signing key for media chunk');
      }
      this.chunks.push(envelope.chunk);
    }
  }
}

class PublicStreamRelay {
  /**
   * One-hop relay: subscribes to upstream chunks, verifies, forwards to downstream viewers.
   * @param {Object} options
   * @param {string} options.relayId
   * @param {string} options.upstreamId
   * @param {string} options.sessionId
   * @param {string} options.broadcasterSigningPublicKey
   * @param {string} options.broadcasterId
   * @param {InMemoryStreamSignalingBus} options.bus
   * @param {string[]} options.downstreamViewerIds
   */
  constructor({
    relayId,
    upstreamId,
    sessionId,
    broadcasterSigningPublicKey,
    broadcasterId,
    bus,
    downstreamViewerIds
  }) {
    this.relayId = relayId;
    this.upstreamId = upstreamId;
    this.sessionId = sessionId;
    this.broadcasterSigningPublicKey = broadcasterSigningPublicKey;
    this.broadcasterId = broadcasterId;
    this.bus = bus;
    this.downstreamViewerIds = [...downstreamViewerIds];

    this._onBusMessage = this._onBusMessage.bind(this);
    this.bus.subscribe(relayId, this._onBusMessage);
  }

  _onBusMessage(envelope) {
    if (envelope.messageType !== STREAM_MESSAGE_TYPES.MEDIA_CHUNK || !envelope.chunk) {
      return;
    }
    const chunk = envelope.chunk;
    if (chunk.sessionId !== this.sessionId) {
      return;
    }
    verifyMediaChunk(chunk, this.sessionId);
    this.bus.fanout(this.relayId, this.downstreamViewerIds, {
      messageType: STREAM_MESSAGE_TYPES.MEDIA_CHUNK,
      chunk
    });
  }
}

/**
 * @param {Object} options
 * @param {string} options.sessionId
 * @param {string} options.broadcasterId
 * @param {Uint8Array} options.signingSecretKey
 * @param {string} options.signingPublicKey
 * @param {InMemoryStreamSignalingBus} options.bus
 * @param {string[]} [options.initialViewerIds]
 */
function createPublicStreamBroadcaster(options) {
  const session = createStreamSession({
    sessionId: options.sessionId,
    broadcasterId: options.broadcasterId,
    mode: STREAM_ACCESS_MODES.PUBLIC
  });
  return new PublicStreamBroadcaster({
    session,
    signingSecretKey: options.signingSecretKey,
    signingPublicKey: options.signingPublicKey,
    bus: options.bus,
    directViewerIds: options.initialViewerIds
  });
}

function createPublicStreamViewer(options) {
  return new PublicStreamViewer(options);
}

function createPublicStreamRelay(options) {
  return new PublicStreamRelay(options);
}

function createInMemoryStreamSignalingBus() {
  return new InMemoryStreamSignalingBus();
}

module.exports = {
  STREAM_MESSAGE_TYPES,
  InMemoryStreamSignalingBus,
  PublicStreamBroadcaster,
  PublicStreamViewer,
  PublicStreamRelay,
  createPublicStreamBroadcaster,
  createPublicStreamViewer,
  createPublicStreamRelay,
  createInMemoryStreamSignalingBus
};