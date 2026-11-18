/**
 * Experimental live streaming API skeleton (#152).
 * No media transport, encoding, or WebRTC tracks are implemented in v1.2.0.
 * @experimental
 */

const accessModes = require('./access-modes');
const streamSession = require('./stream-session');

module.exports = {
  ...accessModes,
  ...streamSession,
  STREAMING_API_EXPERIMENTAL: true
};