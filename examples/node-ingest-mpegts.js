/**
 * Node MPEG-TS ingest → signed public stream chunks (#152 v1.13.0).
 * Uses tests/fixtures/mpegts-h264.ts (no ffmpeg).
 *
 * Run: npm run example:ingest-mpegts
 */

const path = require('path');
const {
  createStreamSession,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  createPublicStreamViewer,
  verifyMediaChunk,
  decodeMediaChunkPayload
} = require('../src/streaming');
const { deriveKeyPairFromCredentials, keyPairToPublicBundle } = require('../src');
const { createMpegTsIngest, createNodeStreamOrigin } = require('../src/node');

async function main() {
  const fixturePath = path.join(__dirname, '../tests/fixtures/mpegts-h264.ts');
  const creds = await deriveKeyPairFromCredentials({ username: 'mpegts-demo', password: 'demo' });
  const bundle = keyPairToPublicBundle(creds);
  const bus = createInMemoryStreamSignalingBus();
  const session = createStreamSession({
    sessionId: 'mpegts-demo',
    broadcasterId: 'origin',
    mode: STREAM_ACCESS_MODES.PUBLIC
  });
  const ingest = createMpegTsIngest({ input: fixturePath });
  const origin = createNodeStreamOrigin({
    session,
    signingSecretKey: creds.signing.secretKey,
    signingPublicKey: bundle.signingPublicKey,
    bus,
    ingest,
    directViewerIds: ['viewer-1']
  });

  const viewer = createPublicStreamViewer({
    viewerId: 'viewer-1',
    sessionId: 'mpegts-demo',
    broadcasterId: 'origin',
    broadcasterSigningPublicKey: bundle.signingPublicKey,
    bus
  });
  viewer.requestJoin();
  await origin.start();

  console.log(`Verified chunks: ${viewer.chunks.length}`);
  for (const chunk of viewer.chunks) {
    console.log(
      `  seq=${chunk.sequence} keyframe=${chunk.keyframe} ts=${chunk.timestampMs} verify=${verifyMediaChunk(chunk)}`
    );
    void decodeMediaChunkPayload(chunk);
  }
  origin.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});