#!/usr/bin/env node
/**
 * Private-list stream origin from Node.js using a fixture file (no ffmpeg required).
 * @experimental (#152 milestone 4)
 */

const fs = require('fs');
const path = require('path');
const {
  createStreamSession,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  verifyMediaChunk,
  openPrivateMediaChunk
} = require('../src/streaming');
const { deriveKeyPairFromCredentials, keyPairToPublicBundle } = require('../src');
const { createFileMediaIngest, createNodeStreamOrigin } = require('../src/node');

const fixturePath = path.join(__dirname, '../tests/fixtures/stream-origin-chunks.bin');

function createChunkViewer(viewerId, bus) {
  const chunks = [];
  bus.subscribe(viewerId, (envelope) => {
    if (envelope.messageType === 'stream:media-chunk' && envelope.chunk) {
      chunks.push(envelope.chunk);
    }
  });
  return {
    chunks,
    requestJoin(broadcasterId, sessionId) {
      bus.send(viewerId, broadcasterId, {
        messageType: 'stream:join-request',
        sessionId,
        viewerId
      });
    }
  };
}

async function main() {
  const bus = createInMemoryStreamSignalingBus();
  const broadcaster = await deriveKeyPairFromCredentials({ username: 'node-private-bc', password: 'demo' });
  const alice = await deriveKeyPairFromCredentials({ username: 'node-private-alice', password: 'demo' });
  const bcBundle = keyPairToPublicBundle(broadcaster);
  const aliceBundle = keyPairToPublicBundle(alice);

  const session = createStreamSession({
    sessionId: 'node-private-example',
    broadcasterId: 'node-origin',
    mode: STREAM_ACCESS_MODES.PRIVATE_LIST,
    privateRecipients: [aliceBundle.signingPublicKey]
  });

  const viewer = createChunkViewer(aliceBundle.signingPublicKey, bus);
  const ingest = createFileMediaIngest({ filePath: fixturePath, chunkBytes: 8 });
  console.log(`Ingest mode: ${ingest.kind} (fixture: ${fixturePath}; no ffmpeg)`);

  const origin = createNodeStreamOrigin({
    session,
    signingSecretKey: broadcaster.signing.secretKey,
    signingPublicKey: bcBundle.signingPublicKey,
    broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
    broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
    recipientPublicBundles: [aliceBundle],
    bus,
    mediaIngest: ingest,
    directViewerIds: [aliceBundle.signingPublicKey]
  });

  viewer.requestJoin('node-origin', session.sessionId);
  await origin.start();

  const payloads = viewer.chunks.map((chunk) => {
    if (!verifyMediaChunk(chunk, session.sessionId)) {
      throw new Error(`chunk ${chunk.sequence} failed verification`);
    }
    return Buffer.from(
      openPrivateMediaChunk(chunk, {
        recipientEncryptionSecretKey: alice.encryption.secretKey,
        recipientSigningPublicKey: aliceBundle.signingPublicKey
      })
    );
  });

  const joined = Buffer.concat(payloads);
  const expected = fs.readFileSync(fixturePath);
  if (!joined.equals(expected)) {
    throw new Error('opened viewer payload does not match fixture bytes');
  }

  console.log(
    `Verified ${viewer.chunks.length} sealed chunk(s); recipient opened payload (${expected.length} bytes).`
  );
  origin.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});