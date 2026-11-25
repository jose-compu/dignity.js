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
const mediaFraming = require('./media-framing');
const renditionLadder = require('./rendition-ladder');
const receiverReport = require('./receiver-report');
const bandwidthEstimator = require('./bandwidth-estimator');
const layerSelector = require('./layer-selector');
const playoutBuffer = require('./playout-buffer');
const relayLayerPolicy = require('./relay-layer-policy');
const simulcastPublish = require('./simulcast-publish');
const scaleSimulation = require('./scale-simulation');
const { demuxMpegTs, MpegTsDemuxer, ptsToTimestampMs } = require('./ingest/mpegts-demuxer');

module.exports = {
  ...accessModes,
  ...streamSession,
  ...mediaChunk,
  ...privateMediaChunk,
  ...privateSenderKeyEpoch,
  ...publicStreamPath,
  ...webrtcSignaling,
  ...mediaFraming,
  ...renditionLadder,
  ...receiverReport,
  ...bandwidthEstimator,
  ...layerSelector,
  ...playoutBuffer,
  ...relayLayerPolicy,
  ...simulcastPublish,
  ...scaleSimulation,
  demuxMpegTs,
  MpegTsDemuxer,
  ptsToTimestampMs,
  STREAMING_API_EXPERIMENTAL: true
};