#!/usr/bin/env node
/**
 * Node stream origin with optional native WebRTC data channels (#152 v1.18.0).
 * Requires an optional peer library: npm install node-datachannel (or werift).
 *
 * Run: npm run example:node-webrtc
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
const {
  createFileMediaIngest,
  createNodeStreamOrigin,
  createNodeWebRTCPeerFactory,
  NODE_WEBRTC_PEER_LIBRARY_MISSING
} = require('../src/node');

const fixturePath = path.join(__dirname, '../tests/fixtures/stream-origin-chunks.bin');

function signingKeys(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

async function main() {
  let factory;
  try {
    factory = await createNodeWebRTCPeerFactory({ backend: 'auto' });
  } catch (err) {
    if (err && err.code === NODE_WEBRTC_PEER_LIBRARY_MISSING) {
      console.error(err.message);
      console.error('Install one optional peer package, then re-run: npm install node-datachannel');
      process.exit(1);
    }
    throw err;
  }

  console.log(`Native WebRTC backend: ${factory.backend.name}`);

  const bus = createInMemoryStreamSignalingBus();
  const keys = signingKeys('node-webrtc-example');
  const session = createStreamSession({
    sessionId: 'node-webrtc-ex',
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

  const viewerAdapter = await factory.createNetworkAdapter('viewer-local');
  const ingest = createFileMediaIngest({ filePath: fixturePath, chunkBytes: 8 });

  const origin = createNodeStreamOrigin({
    session,
    signingSecretKey: keys.signingSecretKey,
    signingPublicKey: keys.signingPublicKey,
    bus,
    mediaIngest: ingest,
    directViewerIds: ['viewer-local'],
    webrtc: {
      factory,
      peerIds: ['viewer-local']
    }
  });

  await viewerAdapter.connectToPeer(session.broadcasterId);
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
    throw new Error('bus viewer payload does not match fixture bytes');
  }

  console.log(
    `Bus path verified ${viewer.chunks.length} chunk(s); signaling bus matches fixture (${expected.length} bytes).`
  );
  console.log(
    'WebRTC data channels are linked in-process; attach a browser viewer with the same peer IDs over your signaling fabric to receive signed chunks.'
  );

  origin.stop();
  await factory.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});