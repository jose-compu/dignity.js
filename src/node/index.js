/**
 * Node-only streaming entry (`dignity.js/node`). Not bundled in browser builds.
 * @experimental
 */

const mediaIngest = require('../streaming/node-media-ingest');
const streamOrigin = require('../streaming/node-stream-origin');
const ingestAdapters = require('../streaming/ingest');

module.exports = {
  ...mediaIngest,
  ...streamOrigin,
  ...ingestAdapters
};