#!/usr/bin/env node
/**
 * Public stream origin from Node.js using a fixture file (no ffmpeg required).
 * @experimental (#152 milestone 4)
 */

const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createStreamSession,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  createPublicStreamViewer,
  verifyMediaChunk,
  decodeMediaChunkPayload
} = require('../src/streaming');
const { createFileMediaIngest, createNodeStreamOrigin } = require('../src/node');

const fixturePath = path.join(__dirname, '../tests/fixtures/stream-origin-chunks.bin');

function signingKeys(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

async function main() {
  const bus = createInMemoryStreamSignalingBus();
  const keys = signingKeys('node-stream-example');
  const session = createStreamSession({
    sessionId: 'node-example',
    broadcasterId: 'node-origin',
    mode: STREAM_ACCESS_MODES.PUBLIC
  });

  const viewer = createPublicStreamViewer({
    viewerId: 'viewer-local',
    sessionId: session.sessionId,
    broadcasterId: session.broadcasterId,
    broadcasterSigningPublicKey: keys.signingPublicKey,
    bus
  });

  const ingest = createFileMediaIngest({ filePath: fixturePath, chunkBytes: 8 });
  console.log(`Ingest mode: ${ingest.kind} (fixture: ${fixturePath}; no ffmpeg)`);

  const origin = createNodeStreamOrigin({
    session,
    signingSecretKey: keys.signingSecretKey,
    signingPublicKey: keys.signingPublicKey,
    bus,
    mediaIngest: ingest,
    directViewerIds: ['viewer-local']
  });

  viewer.requestJoin();
  await origin.start();

  const payloads = viewer.chunks.map((chunk) => {
    if (!verifyMediaChunk(chunk, session.sessionId)) {
      throw new Error(`chunk ${chunk.sequence} failed verification`);
    }
    return Buffer.from(decodeMediaChunkPayload(chunk));
  });

  const joined = Buffer.concat(payloads);
  const expected = fs.readFileSync(fixturePath);
  if (!joined.equals(expected)) {
    throw new Error('decoded viewer payload does not match fixture bytes');
  }

  console.log(`Verified ${viewer.chunks.length} signed chunk(s); payload matches fixture (${expected.length} bytes).`);
  origin.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});