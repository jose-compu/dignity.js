const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createStreamSession,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  createPublicStreamViewer,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  RENDITION_PROFILE_HD720,
  MEDIA_CHUNK_VERSION,
  createWebRTCDataChannelTransport,
  openPrivateMediaChunk
} = require('../../src/streaming');
const { deriveKeyPairFromCredentials, keyPairToPublicBundle } = require('../../src');
const { InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src/network/in-memory-network');
const { EventEmitter } = require('events');
const { createFileMediaIngest, createFfmpegMediaIngest } = require('../../src/streaming/node-media-ingest');
const { createNodeStreamOrigin } = require('../../src/streaming/node-stream-origin');
const {
  createNodeWebRTCPeerFactory,
  createFakeNodeWebRTCBackend
} = require('../../src/streaming/node-webrtc-peer');
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(__dirname, '../fixtures/stream-origin-chunks.bin');
const annexFixturePath = path.join(__dirname, '../fixtures/h264-annexb-access-units.bin');

function testKeyPair(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  const enc = nacl.box.keyPair.fromSecretKey(nacl.hash(naclUtil.decodeUTF8(`${label}-enc`)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey),
    encryptionSecretKey: enc.secretKey,
    encryptionPublicKey: naclUtil.encodeBase64(enc.publicKey)
  };
}

function bundleFromKeys(keys) {
  return {
    signingPublicKey: keys.signingPublicKey,
    encryptionPublicKey: keys.encryptionPublicKey
  };
}

function createChunkCollector(viewerId, bus) {
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

describe('node stream origin', () => {
  test('origin publishes verified chunks to PublicStreamViewer', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-origin');
    const session = createStreamSession({
      sessionId: 'node-pub',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-1',
      sessionId: 'node-pub',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: 8 }),
      directViewerIds: ['viewer-1']
    });

    viewer.requestJoin();
    await origin.start();

    expect(viewer.chunks.length).toBeGreaterThan(0);
    for (const chunk of viewer.chunks) {
      expect(verifyMediaChunk(chunk, 'node-pub')).toBe(true);
    }
    const payload = Buffer.concat(viewer.chunks.map((c) => Buffer.from(decodeMediaChunkPayload(c))));
    expect(payload.equals(fs.readFileSync(fixturePath))).toBe(true);
  });

  test('origin webrtc option forwards signed chunk via native factory', async () => {
    const fake = createFakeNodeWebRTCBackend();
    const factory = await createNodeWebRTCPeerFactory({ testBackend: fake });
    const viewerAdapter = await factory.createNetworkAdapter('viewer-webrtc');
    const transportViewer = createWebRTCDataChannelTransport(viewerAdapter);
    const received = [];
    transportViewer.onChunk((_, chunk) => received.push(chunk));

    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-webrtc-origin');
    const session = createStreamSession({
      sessionId: 'node-webrtc',
      broadcasterId: 'origin-webrtc',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: 16 }),
      webrtc: { factory, peerIds: ['viewer-webrtc'] }
    });

    const publish = origin.start();
    await publish;
    await new Promise((r) => setTimeout(r, 20));

    expect(received.length).toBeGreaterThan(0);
    expect(verifyMediaChunk(received[0], 'node-webrtc')).toBe(true);
    transportViewer.destroy();
    await factory.close();
  });

  test('origin forwards sealed chunk over WebRTCDataChannelTransport', async () => {
    const hub = new InMemoryNetworkHub();
    const originAdapter = new InMemoryNetworkAdapter(hub);
    const viewerAdapter = new InMemoryNetworkAdapter(hub);
    await originAdapter.start('origin');
    await viewerAdapter.start('viewer-1');

    const bus = createInMemoryStreamSignalingBus();
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'dc-bc', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'dc-alice', password: 'p2' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);

    const session = createStreamSession({
      sessionId: 'node-dc',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      privateRecipients: [aliceBundle.signingPublicKey]
    });

    const transportOrigin = createWebRTCDataChannelTransport(originAdapter);
    const transportViewer = createWebRTCDataChannelTransport(viewerAdapter);
    const received = [];
    transportViewer.onChunk((senderId, chunk) => {
      received.push({ senderId, chunk });
    });

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle],
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: fixturePath.length }),
      dataChannelTransport: transportOrigin,
      dataChannelPeerIds: ['viewer-1'],
      directViewerIds: [aliceBundle.signingPublicKey]
    });

    const publishPromise = origin.start();
    await publishPromise;

    await new Promise((r) => setTimeout(r, 30));

    expect(received).toHaveLength(1);
    expect(received[0].senderId).toBe('origin');
    expect(verifyMediaChunk(received[0].chunk, 'node-dc')).toBe(true);
    const opened = openPrivateMediaChunk(received[0].chunk, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    expect(Buffer.from(opened).equals(fs.readFileSync(fixturePath))).toBe(true);
    transportOrigin.destroy();
    transportViewer.destroy();
  });

  test('private-single: listed recipient opens bytes; spectator not authorized; payload not plaintext', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'ps-bc', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'ps-alice', password: 'p2' });
    const spectator = await deriveKeyPairFromCredentials({ username: 'ps-spec', password: 'p3' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);

    const session = createStreamSession({
      sessionId: 'node-ps',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      privateRecipients: [aliceBundle.signingPublicKey]
    });

    const aliceView = createChunkCollector(aliceBundle.signingPublicKey, bus);
    const specView = createChunkCollector(keyPairToPublicBundle(spectator).signingPublicKey, bus);

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle],
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: 16 }),
      directViewerIds: [aliceBundle.signingPublicKey, keyPairToPublicBundle(spectator).signingPublicKey]
    });

    aliceView.requestJoin('origin', session.sessionId);
    specView.requestJoin('origin', session.sessionId);
    await origin.start();

    expect(aliceView.chunks.length).toBeGreaterThan(0);
    for (const chunk of aliceView.chunks) {
      expect(verifyMediaChunk(chunk, session.sessionId)).toBe(true);
      expect(Buffer.from(decodeMediaChunkPayload(chunk)).equals(fs.readFileSync(fixturePath))).toBe(false);
    }

    const opened = Buffer.concat(
      aliceView.chunks.map((c) =>
        Buffer.from(
          openPrivateMediaChunk(c, {
            recipientEncryptionSecretKey: alice.encryption.secretKey,
            recipientSigningPublicKey: aliceBundle.signingPublicKey
          })
        )
      )
    );
    expect(opened.equals(fs.readFileSync(fixturePath))).toBe(true);

    expect(() =>
      openPrivateMediaChunk(aliceView.chunks[0], {
        recipientEncryptionSecretKey: spectator.encryption.secretKey,
        recipientSigningPublicKey: keyPairToPublicBundle(spectator).signingPublicKey
      })
    ).toThrow(/not authorized/i);

    expect(specView.chunks.length).toBeGreaterThan(0);
  });

  test('private-list: both listed open, third fails; invalid bundle count throws', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'pl-bc', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'pl-alice', password: 'p2' });
    const bob = await deriveKeyPairFromCredentials({ username: 'pl-bob', password: 'p3' });
    const carol = await deriveKeyPairFromCredentials({ username: 'pl-carol', password: 'p4' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);
    const bobBundle = keyPairToPublicBundle(bob);
    const carolBundle = keyPairToPublicBundle(carol);

    const session = createStreamSession({
      sessionId: 'node-pl',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_LIST,
      privateRecipients: [aliceBundle.signingPublicKey, bobBundle.signingPublicKey]
    });

    const bus = createInMemoryStreamSignalingBus();

    expect(() =>
      createNodeStreamOrigin({
        session,
        signingSecretKey: broadcaster.signing.secretKey,
        signingPublicKey: bcBundle.signingPublicKey,
        broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
        broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
        recipientPublicBundles: [aliceBundle],
        bus,
        mediaIngest: createFileMediaIngest({ filePath: fixturePath })
      })
    ).toThrow(/length/i);

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle, bobBundle],
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: fixturePath.length }),
      directViewerIds: [aliceBundle.signingPublicKey, bobBundle.signingPublicKey, carolBundle.signingPublicKey]
    });

    const aliceView = createChunkCollector(aliceBundle.signingPublicKey, bus);
    const bobView = createChunkCollector(bobBundle.signingPublicKey, bus);
    aliceView.requestJoin('origin', session.sessionId);
    bobView.requestJoin('origin', session.sessionId);
    await origin.start();

    const fileBytes = fs.readFileSync(fixturePath);
    const aliceOpened = openPrivateMediaChunk(aliceView.chunks[0], {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    const bobOpened = openPrivateMediaChunk(bobView.chunks[0], {
      recipientEncryptionSecretKey: bob.encryption.secretKey,
      recipientSigningPublicKey: bobBundle.signingPublicKey
    });
    expect(Buffer.from(aliceOpened).equals(fileBytes)).toBe(true);
    expect(Buffer.from(bobOpened).equals(fileBytes)).toBe(true);

    expect(() =>
      openPrivateMediaChunk(aliceView.chunks[0], {
        recipientEncryptionSecretKey: carol.encryption.secretKey,
        recipientSigningPublicKey: carolBundle.signingPublicKey
      })
    ).toThrow(/not authorized/i);
  });

  test('combined: public layer decodes to file; only allowlist opens private layer', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'cb-bc', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'cb-alice', password: 'p2' });
    const spectator = await deriveKeyPairFromCredentials({ username: 'cb-spec', password: 'p3' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);
    const specBundle = keyPairToPublicBundle(spectator);

    const session = createStreamSession({
      sessionId: 'node-cb',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.COMBINED,
      privateRecipients: [aliceBundle.signingPublicKey]
    });

    const bus = createInMemoryStreamSignalingBus();
    const spectatorView = createChunkCollector(specBundle.signingPublicKey, bus);
    const aliceView = createChunkCollector(aliceBundle.signingPublicKey, bus);

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle],
      bus,
      mediaIngest: createFileMediaIngest({ filePath: fixturePath, chunkBytes: fixturePath.length }),
      directViewerIds: [specBundle.signingPublicKey, aliceBundle.signingPublicKey]
    });

    spectatorView.requestJoin('origin', session.sessionId);
    aliceView.requestJoin('origin', session.sessionId);
    await origin.start();

    const fileBytes = fs.readFileSync(fixturePath);
    const publicChunks = spectatorView.chunks.filter((c) => c.layerId === 'public');
    const privateChunks = spectatorView.chunks.filter((c) => c.layerId === 'private');
    expect(publicChunks).toHaveLength(1);
    expect(privateChunks).toHaveLength(1);
    expect(Buffer.from(decodeMediaChunkPayload(publicChunks[0])).equals(fileBytes)).toBe(true);

    expect(() =>
      openPrivateMediaChunk(privateChunks[0], {
        recipientEncryptionSecretKey: spectator.encryption.secretKey,
        recipientSigningPublicKey: specBundle.signingPublicKey
      })
    ).toThrow(/not authorized/i);

    const alicePrivate = aliceView.chunks.find((c) => c.layerId === 'private');
    const opened = openPrivateMediaChunk(alicePrivate, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    expect(Buffer.from(opened).equals(fileBytes)).toBe(true);
  });

  test('rotateRecipients: removed key opens before rotation, fails after; remaining key still opens', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'rot-bc', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'rot-alice', password: 'p2' });
    const bob = await deriveKeyPairFromCredentials({ username: 'rot-bob', password: 'p3' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);
    const bobBundle = keyPairToPublicBundle(bob);

    const session = createStreamSession({
      sessionId: 'node-rot',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_LIST,
      privateRecipients: [aliceBundle.signingPublicKey, bobBundle.signingPublicKey]
    });

    const bus = createInMemoryStreamSignalingBus();
    const aliceView = createChunkCollector(aliceBundle.signingPublicKey, bus);
    const bobView = createChunkCollector(bobBundle.signingPublicKey, bus);

    const fileBytes = fs.readFileSync(fixturePath);

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle, bobBundle],
      bus,
      mediaIngest: {
        kind: 'file',
        filePath: fixturePath,
        chunkBytes: 4,
        stop() {},
        async *frames() {
          const half = Math.ceil(fileBytes.length / 2);
          yield { payloadBytes: fileBytes.subarray(0, half) };
          origin.rotateRecipients(bobBundle.signingPublicKey);
          yield { payloadBytes: fileBytes.subarray(half) };
        }
      },
      directViewerIds: [aliceBundle.signingPublicKey, bobBundle.signingPublicKey]
    });

    aliceView.requestJoin('origin', session.sessionId);
    bobView.requestJoin('origin', session.sessionId);
    await origin.start();

    expect(aliceView.chunks).toHaveLength(2);
    expect(bobView.chunks).toHaveLength(2);

    openPrivateMediaChunk(bobView.chunks[0], {
      recipientEncryptionSecretKey: bob.encryption.secretKey,
      recipientSigningPublicKey: bobBundle.signingPublicKey
    });

    expect(() =>
      openPrivateMediaChunk(bobView.chunks[1], {
        recipientEncryptionSecretKey: bob.encryption.secretKey,
        recipientSigningPublicKey: bobBundle.signingPublicKey
      })
    ).toThrow(/not authorized/i);

    openPrivateMediaChunk(aliceView.chunks[1], {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
  });

  test('private session without encryption keys throws at construction', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-private');
    const session = createStreamSession({
      sessionId: 'node-priv',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      privateRecipients: ['bob-signing']
    });

    expect(() =>
      createNodeStreamOrigin({
        session,
        signingSecretKey: keys.signingSecretKey,
        signingPublicKey: keys.signingPublicKey,
        bus,
        mediaIngest: createFileMediaIngest({ filePath: fixturePath })
      })
    ).toThrow(/recipientPublicBundles|broadcasterEncryption/);
  });

  test('ffmpeg-framed origin publishes timestampMs and keyframe on public chunks', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-framed-pub');
    const session = createStreamSession({
      sessionId: 'node-framed',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });
    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-framed',
      sessionId: 'node-framed',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });

    const annexBytes = fs.readFileSync(annexFixturePath);
    const stdout = new EventEmitter();
    const fakeChild = new EventEmitter();
    fakeChild.stdout = stdout;
    fakeChild.stderr = new EventEmitter();
    fakeChild.kill = jest.fn();
    fakeChild.exitCode = null;
    fakeChild.killed = false;
    const spawn = jest.fn(() => {
      process.nextTick(() => {
        stdout.emit('data', annexBytes);
        fakeChild.emit('close', 0);
      });
      return fakeChild;
    });

    const ingest = createFfmpegMediaIngest({ filePath: annexFixturePath, format: 'annexb', spawn });
    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest: ingest,
      directViewerIds: ['viewer-framed']
    });

    viewer.requestJoin();
    await origin.start();

    expect(viewer.chunks[0].keyframe).toBe(true);
    expect(viewer.chunks[0].timestampMs).toBe(0);
    expect(viewer.chunks[1].keyframe).toBe(false);
    expect(viewer.chunks[1].timestampMs).toBe(33);
  });

  test('ffmpeg-framed private origin publishes keyframe on sealed chunk', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-framed-priv-bc');
    const bob = testKeyPair('node-framed-priv-bob');
    const session = createStreamSession({
      sessionId: 'node-framed-priv',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      privateRecipients: [bob.signingPublicKey]
    });
    const collector = createChunkCollector('bob-viewer', bus);
    const annexBytes = fs.readFileSync(annexFixturePath);
    const stdout = new EventEmitter();
    const fakeChild = new EventEmitter();
    fakeChild.stdout = stdout;
    fakeChild.stderr = new EventEmitter();
    fakeChild.kill = jest.fn();
    const spawn = jest.fn(() => {
      process.nextTick(() => {
        stdout.emit('data', annexBytes);
        fakeChild.emit('close', 0);
      });
      return fakeChild;
    });

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      broadcasterEncryptionSecretKey: keys.encryptionSecretKey,
      broadcasterEncryptionPublicKey: keys.encryptionPublicKey,
      recipientPublicBundles: [bundleFromKeys(bob)],
      bus,
      mediaIngest: createFfmpegMediaIngest({ filePath: annexFixturePath, format: 'annexb', spawn }),
      directViewerIds: ['bob-viewer']
    });

    collector.requestJoin('origin', session.sessionId);
    await origin.start();
    expect(collector.chunks[0].keyframe).toBe(true);
    expect(verifyMediaChunk(collector.chunks[0])).toBe(true);
  });

  test('stop kills ffmpeg child when present', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-stop');
    const session = createStreamSession({
      sessionId: 'node-stop',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const fakeChild = { kill: jest.fn(), killed: false, exitCode: null };
    const mediaIngest = {
      kind: 'ffmpeg',
      child: fakeChild,
      stop() {
        fakeChild.kill('SIGTERM');
      },
      async *frames() {
        yield { payloadBytes: new Uint8Array([1, 2, 3]) };
      }
    };

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest
    });

    origin.stop();
    expect(fakeChild.kill).toHaveBeenCalledWith('SIGTERM');
  });

  test('file ingest publishes rendition metadata on version 3 chunks', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-rendition');
    const session = createStreamSession({
      sessionId: 'node-rendition',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });

    const viewer = createPublicStreamViewer({
      viewerId: 'viewer-1',
      sessionId: 'node-rendition',
      broadcasterId: 'origin',
      broadcasterSigningPublicKey: keys.signingPublicKey,
      bus
    });

    const mediaIngest = {
      kind: 'file',
      stop() {},
      async *frames() {
        yield {
          payloadBytes: new Uint8Array([0xaa, 0xbb]),
          mimeType: 'application/octet-stream',
          timestampMs: 500,
          layerId: 'L1',
          keyframe: true,
          profile: RENDITION_PROFILE_HD720
        };
      }
    };

    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      mediaIngest,
      directViewerIds: ['viewer-1']
    });

    viewer.requestJoin();
    await origin.start();

    expect(viewer.chunks).toHaveLength(1);
    expect(viewer.chunks[0].version).toBe(MEDIA_CHUNK_VERSION);
    expect(viewer.chunks[0].rendition).toMatchObject({
      profile: RENDITION_PROFILE_HD720,
      videoBitrateKbps: 1800
    });
    expect(verifyMediaChunk(viewer.chunks[0])).toBe(true);
  });

  test('requires mediaIngest or ingest with frames()', () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-no-ingest');
    const session = createStreamSession({
      sessionId: 'no-ingest',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });
    expect(() =>
      createNodeStreamOrigin({
        session,
        signingSecretKey: keys.signingSecretKey,
        signingPublicKey: keys.signingPublicKey,
        bus
      })
    ).toThrow(/mediaIngest or ingest/);
  });

  test('accepts ingest adapter alias instead of mediaIngest', async () => {
    const bus = createInMemoryStreamSignalingBus();
    const keys = testKeyPair('node-ingest-alias');
    const session = createStreamSession({
      sessionId: 'node-ingest',
      broadcasterId: 'origin',
      mode: STREAM_ACCESS_MODES.PUBLIC
    });
    const collector = createChunkCollector('viewer-1', bus);
    const ingest = {
      kind: 'mpegts',
      stop() {},
      async *frames() {
        yield {
          payloadBytes: new Uint8Array([1, 2, 3]),
          mimeType: 'video/h264',
          timestampMs: 42,
          keyframe: true
        };
      }
    };
    const origin = createNodeStreamOrigin({
      session,
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      bus,
      ingest,
      directViewerIds: ['viewer-1']
    });
    collector.requestJoin('origin', 'node-ingest');
    await origin.start();
    expect(collector.chunks).toHaveLength(1);
    expect(collector.chunks[0].timestampMs).toBe(42);
    expect(collector.chunks[0].keyframe).toBe(true);
  });
});