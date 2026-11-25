/**
 * Node.js console origin for live streams (#152 milestone 4).
 * @experimental
 */

const { STREAM_ACCESS_MODES } = require('./access-modes');
const { PublicStreamBroadcaster, STREAM_MESSAGE_TYPES } = require('./public-stream-path');
const { createSignedMediaChunk } = require('./media-chunk');
const { sealPrivateMediaChunk } = require('./private-media-chunk');
const {
  createPrivateSenderKeyEpoch,
  rotatePrivateSenderKeyEpoch
} = require('./private-sender-key-epoch');

const PRIVATE_MODES = new Set([
  STREAM_ACCESS_MODES.PRIVATE_SINGLE,
  STREAM_ACCESS_MODES.PRIVATE_LIST,
  STREAM_ACCESS_MODES.COMBINED
]);

/**
 * @param {import('./stream-session').StreamSession} session
 * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} recipientPublicBundles
 */
function assertRecipientBundlesMatchSession(session, recipientPublicBundles) {
  if (!Array.isArray(recipientPublicBundles)) {
    throw new TypeError('recipientPublicBundles must be an array');
  }
  const expected = [...session.privateRecipients].sort();
  const got = recipientPublicBundles.map((b) => b.signingPublicKey.trim()).sort();
  if (expected.length !== got.length) {
    throw new Error(
      `recipientPublicBundles length (${got.length}) must match session privateRecipients (${expected.length})`
    );
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i] !== got[i]) {
      throw new Error('recipientPublicBundles signing keys must match session privateRecipients');
    }
  }
}

class PrivateNodeStreamBroadcaster {
  /**
   * @param {Object} options
   * @param {import('./stream-session').StreamSession} options.session
   * @param {Uint8Array} options.signingSecretKey
   * @param {string} options.signingPublicKey
   * @param {Uint8Array} options.broadcasterEncryptionSecretKey
   * @param {string} options.broadcasterEncryptionPublicKey
   * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} options.recipientPublicBundles
   * @param {import('./public-stream-path').InMemoryStreamSignalingBus} options.bus
   * @param {string[]} [options.directViewerIds]
   */
  constructor({
    session,
    signingSecretKey,
    signingPublicKey,
    broadcasterEncryptionSecretKey,
    broadcasterEncryptionPublicKey,
    recipientPublicBundles,
    bus,
    directViewerIds = []
  }) {
    if (!PRIVATE_MODES.has(session.mode)) {
      throw new Error('PrivateNodeStreamBroadcaster requires a private or combined access mode');
    }
    if (!(broadcasterEncryptionSecretKey instanceof Uint8Array)) {
      throw new TypeError('broadcasterEncryptionSecretKey must be a Uint8Array');
    }
    if (typeof broadcasterEncryptionPublicKey !== 'string' || broadcasterEncryptionPublicKey.trim() === '') {
      throw new TypeError('broadcasterEncryptionPublicKey must be a non-empty string');
    }

    assertRecipientBundlesMatchSession(session, recipientPublicBundles);

    this.session = session;
    this.signingSecretKey = signingSecretKey;
    this.signingPublicKey = signingPublicKey;
    this.broadcasterEncryptionSecretKey = broadcasterEncryptionSecretKey;
    this.broadcasterEncryptionPublicKey = broadcasterEncryptionPublicKey;
    this.recipientPublicBundles = recipientPublicBundles.map((b) => ({
      signingPublicKey: b.signingPublicKey.trim(),
      encryptionPublicKey: b.encryptionPublicKey.trim()
    }));
    this.bus = bus;
    this.directViewerIds = [...directViewerIds];
    this.sequence = 0;
    this.pendingJoin = new Map();
    this._senderKeyEpoch = createPrivateSenderKeyEpoch({
      recipientPublicBundles: this.recipientPublicBundles,
      broadcasterEncryptionSecretKey: this.broadcasterEncryptionSecretKey,
      broadcasterEncryptionPublicKey: this.broadcasterEncryptionPublicKey
    });

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
   * @returns {import('./media-chunk').SignedMediaChunk[]}
   */
  publishFrame(payloadBytes, chunkMeta = {}) {
    const chunks = [];
    const encryptOpts = {
      broadcasterEncryptionSecretKey: this.broadcasterEncryptionSecretKey,
      broadcasterEncryptionPublicKey: this.broadcasterEncryptionPublicKey
    };

    if (this.session.mode === STREAM_ACCESS_MODES.COMBINED) {
      const publicChunk = createSignedMediaChunk({
        sessionId: this.session.sessionId,
        broadcasterId: this.session.broadcasterId,
        payloadBytes,
        signingSecretKey: this.signingSecretKey,
        signingPublicKey: this.signingPublicKey,
        sequence: this.sequence,
        timestampMs: chunkMeta.timestampMs,
        layerId: chunkMeta.layerId || 'public',
        mimeType: chunkMeta.mimeType
      });
      this.sequence += 1;
      chunks.push(publicChunk);
    }

    const privateChunk = sealPrivateMediaChunk({
      accessMode: this.session.mode,
      sessionId: this.session.sessionId,
      broadcasterId: this.session.broadcasterId,
      plaintextBytes: payloadBytes,
      signingSecretKey: this.signingSecretKey,
      signingPublicKey: this.signingPublicKey,
      recipientPublicBundles: this.recipientPublicBundles,
      privateSenderKeyEpoch: this._senderKeyEpoch,
      sequence: this.sequence,
      timestampMs: chunkMeta.timestampMs,
      layerId: this.session.mode === STREAM_ACCESS_MODES.COMBINED ? 'private' : chunkMeta.layerId,
      mimeType: chunkMeta.mimeType,
      ...encryptOpts
    });
    this.sequence += 1;
    chunks.push(privateChunk);

    this._fanoutChunks(chunks);
    return chunks;
  }

  /**
   * @param {string} removeRecipientSigningPublicKey
   */
  rotateRecipients(removeRecipientSigningPublicKey) {
    const removed = removeRecipientSigningPublicKey.trim();
    const remaining = this.recipientPublicBundles.filter((b) => b.signingPublicKey !== removed);
    if (remaining.length === this.recipientPublicBundles.length) {
      throw new Error('removeRecipientSigningPublicKey is not on the current recipient roster');
    }
    if (remaining.length === 0) {
      throw new Error('cannot rotate away the last private recipient');
    }

    this._senderKeyEpoch = rotatePrivateSenderKeyEpoch(this._senderKeyEpoch, {
      removeRecipientSigningPublicKey: removed,
      recipientPublicBundles: remaining,
      broadcasterEncryptionSecretKey: this.broadcasterEncryptionSecretKey,
      broadcasterEncryptionPublicKey: this.broadcasterEncryptionPublicKey
    });
    this.recipientPublicBundles = remaining;
  }

  /**
   * @param {import('./media-chunk').SignedMediaChunk[]} chunks
   */
  _fanoutChunks(chunks) {
    const downstream = [...this.directViewerIds];
    for (const chunk of chunks) {
      this.bus.fanout(this.session.broadcasterId, downstream, {
        messageType: STREAM_MESSAGE_TYPES.MEDIA_CHUNK,
        chunk
      });
    }
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

class NodeStreamOrigin {
  /**
   * @param {Object} options
   * @param {import('./stream-session').StreamSession} options.session
   * @param {Uint8Array} options.signingSecretKey
   * @param {string} options.signingPublicKey
   * @param {import('./public-stream-path').InMemoryStreamSignalingBus} options.bus
   * @param {import('./node-media-ingest').ReturnType<typeof import('./node-media-ingest').createFileMediaIngest>} options.mediaIngest
   * @param {import('./webrtc-stream-signaling').WebRTCDataChannelTransport} [options.dataChannelTransport]
   * @param {string[]} [options.dataChannelPeerIds]
   * @param {string[]} [options.directViewerIds]
   * @param {Uint8Array} [options.broadcasterEncryptionSecretKey]
   * @param {string} [options.broadcasterEncryptionPublicKey]
   * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} [options.recipientPublicBundles]
   */
  constructor({
    session,
    signingSecretKey,
    signingPublicKey,
    bus,
    mediaIngest,
    dataChannelTransport,
    dataChannelPeerIds = [],
    directViewerIds = [],
    broadcasterEncryptionSecretKey,
    broadcasterEncryptionPublicKey,
    recipientPublicBundles
  }) {
    if (!mediaIngest || typeof mediaIngest.frames !== 'function') {
      throw new TypeError('mediaIngest must expose frames()');
    }

    this.mediaIngest = mediaIngest;
    this.dataChannelTransport = dataChannelTransport;
    this.dataChannelPeerIds = [...dataChannelPeerIds];
    this._running = false;
    this.session = session;

    if (session.mode === STREAM_ACCESS_MODES.PUBLIC) {
      this.broadcaster = new PublicStreamBroadcaster({
        session,
        signingSecretKey,
        signingPublicKey,
        bus,
        directViewerIds
      });
      this._privateBroadcaster = null;
    } else if (PRIVATE_MODES.has(session.mode)) {
      if (!(broadcasterEncryptionSecretKey instanceof Uint8Array)) {
        throw new TypeError('broadcasterEncryptionSecretKey is required for private and combined stream modes');
      }
      if (typeof broadcasterEncryptionPublicKey !== 'string' || broadcasterEncryptionPublicKey.trim() === '') {
        throw new TypeError('broadcasterEncryptionPublicKey is required for private and combined stream modes');
      }
      if (!recipientPublicBundles) {
        throw new TypeError('recipientPublicBundles is required for private and combined stream modes');
      }
      this.broadcaster = null;
      this._privateBroadcaster = new PrivateNodeStreamBroadcaster({
        session,
        signingSecretKey,
        signingPublicKey,
        broadcasterEncryptionSecretKey,
        broadcasterEncryptionPublicKey,
        recipientPublicBundles,
        bus,
        directViewerIds
      });
    } else {
      throw new Error(`Unsupported stream access mode: ${session.mode}`);
    }
  }

  /**
   * @param {string} removeRecipientSigningPublicKey
   */
  rotateRecipients(removeRecipientSigningPublicKey) {
    if (!this._privateBroadcaster) {
      throw new Error('rotateRecipients is only available for private and combined stream modes');
    }
    this._privateBroadcaster.rotateRecipients(removeRecipientSigningPublicKey);
  }

  async start() {
    if (this._running) {
      return;
    }
    this._running = true;

    if (this.broadcaster) {
      this.broadcaster.announce();
    } else {
      this._privateBroadcaster.announce();
    }

    for await (const frame of this.mediaIngest.frames()) {
      if (!this._running) {
        break;
      }
      const chunkMeta = {
        mimeType: frame.mimeType,
        timestampMs: frame.timestampMs,
        layerId: frame.layerId
      };

      if (this.broadcaster) {
        const chunk = this.broadcaster.publishChunk(frame.payloadBytes, chunkMeta);
        if (this.dataChannelTransport) {
          await this.dataChannelTransport.sendChunk(this.dataChannelPeerIds, chunk);
        }
      } else {
        const chunks = this._privateBroadcaster.publishFrame(frame.payloadBytes, chunkMeta);
        if (this.dataChannelTransport) {
          for (const chunk of chunks) {
            await this.dataChannelTransport.sendChunk(this.dataChannelPeerIds, chunk);
          }
        }
      }
    }
  }

  stop() {
    this._running = false;
    if (this.mediaIngest && typeof this.mediaIngest.stop === 'function') {
      this.mediaIngest.stop();
    }
    if (this.broadcaster) {
      this.broadcaster.close();
    }
    if (this._privateBroadcaster) {
      this._privateBroadcaster.close();
    }
  }
}

/**
 * @param {ConstructorParameters<typeof NodeStreamOrigin>[0]} options
 */
function createNodeStreamOrigin(options) {
  return new NodeStreamOrigin(options);
}

module.exports = {
  NodeStreamOrigin,
  createNodeStreamOrigin,
  PrivateNodeStreamBroadcaster,
  assertRecipientBundlesMatchSession
};