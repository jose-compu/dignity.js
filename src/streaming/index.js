/**
 * Experimental live streaming API (#152).
 * v1.4.0 adds WebRTC signaling and data channel transport.
 * @experimental
 */

const accessModes = require('./access-modes');
const streamSession = require('./stream-session');
const mediaChunk = require('./media-chunk');
const publicStreamPath = require('./public-stream-path');
const webrtcSignaling = require('./webrtc-stream-signaling');
const privateMediaChunk = require('./private-media-chunk');
const privateSenderKeyEpoch = require('./private-sender-key-epoch');

module.exports = {
  ...accessModes,
  ...streamSession,
  ...mediaChunk,
  ...privateMediaChunk,
  ...privateSenderKeyEpoch,
  ...publicStreamPath,
  ...webrtcSignaling,
  STREAMING_API_EXPERIMENTAL: true
};