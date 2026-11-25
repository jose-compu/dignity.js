#!/usr/bin/env node
/**
 * Node stream origin with ffmpeg-framed Annex-B/fMP4 output (mock or real ffmpeg).
 * @experimental (#152 milestone 4, v1.9.0 framing)
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createStreamSession,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  createPublicStreamViewer,
  verifyMediaChunk
} = require('../src/streaming');
const { createFfmpegMediaIngest, createNodeStreamOrigin } = require('../src/node');

const annexFixture = path.join(__dirname, '../tests/fixtures/h264-annexb-access-units.bin');

function signingKeys(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

function mockAnnexIngest(filePath) {
  const bytes = fs.readFileSync(filePath);
  const stdout = new EventEmitter();
  const fakeChild = new EventEmitter();
  fakeChild.stdout = stdout;
  fakeChild.stderr = new EventEmitter();
  fakeChild.kill = () => {};
  fakeChild.exitCode = null;
  fakeChild.killed = false;
  const spawn = () => {
    process.nextTick(() => {
      stdout.emit('data', bytes);
      fakeChild.emit('close', 0);
    });
    return fakeChild;
  };
  return createFfmpegMediaIngest({ filePath, format: 'annexb', spawn });
}

async function main() {
  const bus = createInMemoryStreamSignalingBus();
  const keys = signingKeys('node-framed-example');
  const session = createStreamSession({
    sessionId: 'node-framed',
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

  const ingest = mockAnnexIngest(annexFixture);
  console.log(`Ingest mode: ${ingest.kind} format=annexb (fixture; stdout framed as H.264 access units)`);

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

  for (const chunk of viewer.chunks) {
    verifyMediaChunk(chunk, session.sessionId);
    console.log(
      `chunk seq=${chunk.sequence} timestampMs=${chunk.timestampMs} keyframe=${chunk.keyframe} mime=${chunk.mimeType}`
    );
  }
  origin.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});