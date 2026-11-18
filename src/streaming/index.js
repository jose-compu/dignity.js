/**
 * Experimental live streaming API (#152).
 * v1.3.0 adds signed public-mode chunk path over injectable signaling; no WebRTC tracks yet.
 * @experimental
 */

const accessModes = require('./access-modes');
const streamSession = require('./stream-session');
const mediaChunk = require('./media-chunk');
const publicStreamPath = require('./public-stream-path');

module.exports = {
  ...accessModes,
  ...streamSession,
  ...mediaChunk,
  ...publicStreamPath,
  STREAMING_API_EXPERIMENTAL: true
};