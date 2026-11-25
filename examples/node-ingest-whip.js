/**
 * WHIP ingest endpoint sketch (#152 v1.13.0).
 * Plug a real WebRTC stack via peerFactory (werift, node-datachannel, etc.) — not bundled.
 *
 * Run: npm run example:ingest-whip
 */

const http = require('http');
const { createWhipIngest } = require('../src/node');

function fakePeerFactory(offerSdp, { resourceId }) {
  console.log(`WHIP session ${resourceId}, offer bytes: ${offerSdp.length}`);
  return {
    answerSdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
    onFrame(cb) {
      cb({
        payloadBytes: new Uint8Array([0, 0, 0, 1, 0x65, 0x10]),
        mimeType: 'video/h264',
        timestampMs: 0,
        keyframe: true
      });
    }
  };
}

const whip = createWhipIngest({
  mountPath: '/whip',
  peerFactory: fakePeerFactory
});

const server = http.createServer((req, res) => whip.handleRequest(req, res));
server.listen(8787, '127.0.0.1', () => {
  console.log('WHIP ingest listening on http://127.0.0.1:8787/whip');
  console.log('OBS: set WHIP server URL to that path (see examples/README.md).');
});

process.on('SIGINT', () => {
  whip.stop();
  server.close();
});