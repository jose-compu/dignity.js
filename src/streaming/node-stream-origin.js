/**
 * Node.js console origin for public live streams (#152 milestone 4).
 * @experimental
 */

const { STREAM_ACCESS_MODES } = require('./access-modes');
const { PublicStreamBroadcaster } = require('./public-stream-path');

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
   */
  constructor({
    session,
    signingSecretKey,
    signingPublicKey,
    bus,
    mediaIngest,
    dataChannelTransport,
    dataChannelPeerIds = [],
    directViewerIds = []
  }) {
    if (session.mode !== STREAM_ACCESS_MODES.PUBLIC) {
      throw new Error('NodeStreamOrigin requires public access mode');
    }
    if (!mediaIngest || typeof mediaIngest.frames !== 'function') {
      throw new TypeError('mediaIngest must expose frames()');
    }

    this.mediaIngest = mediaIngest;
    this.dataChannelTransport = dataChannelTransport;
    this.dataChannelPeerIds = [...dataChannelPeerIds];
    this._running = false;
    this.broadcaster = new PublicStreamBroadcaster({
      session,
      signingSecretKey,
      signingPublicKey,
      bus,
      directViewerIds
    });
  }

  async start() {
    if (this._running) {
      return;
    }
    this._running = true;
    this.broadcaster.announce();

    for await (const frame of this.mediaIngest.frames()) {
      if (!this._running) {
        break;
      }
      const chunk = this.broadcaster.publishChunk(frame.payloadBytes, {
        mimeType: frame.mimeType,
        timestampMs: frame.timestampMs,
        layerId: frame.layerId
      });
      if (this.dataChannelTransport) {
        await this.dataChannelTransport.sendChunk(this.dataChannelPeerIds, chunk);
      }
    }
  }

  stop() {
    this._running = false;
    if (this.mediaIngest && typeof this.mediaIngest.stop === 'function') {
      this.mediaIngest.stop();
    }
    this.broadcaster.close();
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
  createNodeStreamOrigin
};