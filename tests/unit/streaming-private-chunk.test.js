const {
  STREAM_ACCESS_MODES,
  sealPrivateMediaChunk,
  openPrivateMediaChunk,
  createPrivateSenderKeyEpoch,
  rotatePrivateSenderKeyEpoch,
  createSignedMediaChunk,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle,
  RENDITION_PROFILE_HD720,
  MEDIA_CHUNK_VERSION
} = require('../../src/index');

describe('private media chunks', () => {
  test('recipient decrypts single and list modes; spectator cannot; verifyMediaChunk accepts sealed chunk', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'alice', password: 'p2' });
    const bob = await deriveKeyPairFromCredentials({ username: 'bob', password: 'p3' });
    const spectator = await deriveKeyPairFromCredentials({ username: 'spec', password: 'p4' });

    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);
    const bobBundle = keyPairToPublicBundle(bob);

    const plaintext = new TextEncoder().encode('private-frame');

    const singleChunk = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      sessionId: 'priv-1',
      broadcasterId: 'bc-1',
      plaintextBytes: plaintext,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle]
    });

    expect(verifyMediaChunk(singleChunk, 'priv-1')).toBe(true);

    const openedSingle = openPrivateMediaChunk(singleChunk, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    expect(new TextDecoder().decode(openedSingle)).toBe('private-frame');

    expect(() =>
      openPrivateMediaChunk(singleChunk, {
        recipientEncryptionSecretKey: spectator.encryption.secretKey,
        recipientSigningPublicKey: keyPairToPublicBundle(spectator).signingPublicKey
      })
    ).toThrow(/not authorized/i);

    const listChunk = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.PRIVATE_LIST,
      sessionId: 'priv-list',
      broadcasterId: 'bc-1',
      plaintextBytes: plaintext,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle, bobBundle]
    });

    expect(verifyMediaChunk(listChunk)).toBe(true);

    const openedBob = openPrivateMediaChunk(listChunk, {
      recipientEncryptionSecretKey: bob.encryption.secretKey,
      recipientSigningPublicKey: bobBundle.signingPublicKey
    });
    expect(new TextDecoder().decode(openedBob)).toBe('private-frame');
  });

  test('combined mode: public chunk readable; listed recipient opens private layer; spectator private open fails', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc2', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'alice2', password: 'p2' });
    const spectator = await deriveKeyPairFromCredentials({ username: 'spec2', password: 'p3' });

    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);

    const sessionId = 'combined-1';
    const publicPlain = new TextEncoder().encode('public-feed-bytes');
    const privatePlain = new TextEncoder().encode('private-track-bytes');

    const publicChunk = createSignedMediaChunk({
      sessionId,
      broadcasterId: 'bc-origin',
      payloadBytes: publicPlain,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      layerId: 'public'
    });

    expect(verifyMediaChunk(publicChunk, sessionId)).toBe(true);
    expect(decodeMediaChunkPayload(publicChunk)).toEqual(publicPlain);

    const privateChunk = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.COMBINED,
      sessionId,
      broadcasterId: 'bc-origin',
      plaintextBytes: privatePlain,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle],
      layerId: 'private'
    });

    expect(verifyMediaChunk(privateChunk, sessionId)).toBe(true);

    const opened = openPrivateMediaChunk(privateChunk, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    expect(new TextDecoder().decode(opened)).toBe('private-track-bytes');

    expect(() =>
      openPrivateMediaChunk(privateChunk, {
        recipientEncryptionSecretKey: spectator.encryption.secretKey,
        recipientSigningPublicKey: keyPairToPublicBundle(spectator).signingPublicKey
      })
    ).toThrow(/not authorized/i);

    expect(verifyMediaChunk(privateChunk)).toBe(true);
  });

  test('sender-key epoch rotation drops removed recipient on later chunks only', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc3', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'alice3', password: 'p2' });
    const bob = await deriveKeyPairFromCredentials({ username: 'bob3', password: 'p3' });

    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);
    const bobBundle = keyPairToPublicBundle(bob);

    const encryptOpts = {
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey
    };

    const epoch1 = createPrivateSenderKeyEpoch({
      recipientPublicBundles: [aliceBundle, bobBundle],
      ...encryptOpts
    });

    const plaintext = (n) => new TextEncoder().encode(`frame-${n}`);

    const chunk1 = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.PRIVATE_LIST,
      sessionId: 'rot-1',
      broadcasterId: 'bc-origin',
      plaintextBytes: plaintext(1),
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      recipientPublicBundles: [aliceBundle, bobBundle],
      privateSenderKeyEpoch: epoch1,
      sequence: 1,
      ...encryptOpts
    });

    const epoch2 = rotatePrivateSenderKeyEpoch(epoch1, {
      removeRecipientSigningPublicKey: bobBundle.signingPublicKey,
      recipientPublicBundles: [aliceBundle],
      ...encryptOpts
    });

    const chunk2 = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.PRIVATE_LIST,
      sessionId: 'rot-1',
      broadcasterId: 'bc-origin',
      plaintextBytes: plaintext(2),
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      recipientPublicBundles: [aliceBundle],
      privateSenderKeyEpoch: epoch2,
      sequence: 2,
      ...encryptOpts
    });

    expect(chunk1.senderKeyEpoch).toBe(1);
    expect(chunk2.senderKeyEpoch).toBe(2);

    const aliceOpen1 = openPrivateMediaChunk(chunk1, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    const bobOpen1 = openPrivateMediaChunk(chunk1, {
      recipientEncryptionSecretKey: bob.encryption.secretKey,
      recipientSigningPublicKey: bobBundle.signingPublicKey
    });
    expect(new TextDecoder().decode(aliceOpen1)).toBe('frame-1');
    expect(new TextDecoder().decode(bobOpen1)).toBe('frame-1');

    const aliceOpen2 = openPrivateMediaChunk(chunk2, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    expect(new TextDecoder().decode(aliceOpen2)).toBe('frame-2');

    expect(() =>
      openPrivateMediaChunk(chunk2, {
        recipientEncryptionSecretKey: bob.encryption.secretKey,
        recipientSigningPublicKey: bobBundle.signingPublicKey
      })
    ).toThrow(/not authorized/i);
  });

  test('sealed chunk carries signed rendition on version 3', async () => {
    const broadcaster = await deriveKeyPairFromCredentials({ username: 'bc-rend', password: 'p1' });
    const alice = await deriveKeyPairFromCredentials({ username: 'alice-rend', password: 'p2' });
    const bcBundle = keyPairToPublicBundle(broadcaster);
    const aliceBundle = keyPairToPublicBundle(alice);
    const plaintext = new TextEncoder().encode('sealed-rendition');

    const chunk = sealPrivateMediaChunk({
      accessMode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
      sessionId: 'rend-priv',
      broadcasterId: 'bc',
      plaintextBytes: plaintext,
      signingSecretKey: broadcaster.signing.secretKey,
      signingPublicKey: bcBundle.signingPublicKey,
      broadcasterEncryptionSecretKey: broadcaster.encryption.secretKey,
      broadcasterEncryptionPublicKey: bcBundle.encryptionPublicKey,
      recipientPublicBundles: [aliceBundle],
      layerId: 'L1',
      profile: RENDITION_PROFILE_HD720,
      keyframe: true
    });

    expect(chunk.version).toBe(MEDIA_CHUNK_VERSION);
    expect(chunk.rendition).toMatchObject({ profile: RENDITION_PROFILE_HD720, videoBitrateKbps: 1800 });
    expect(verifyMediaChunk(chunk)).toBe(true);
    const opened = openPrivateMediaChunk(chunk, {
      recipientEncryptionSecretKey: alice.encryption.secretKey,
      recipientSigningPublicKey: aliceBundle.signingPublicKey
    });
    expect(new TextDecoder().decode(opened)).toBe('sealed-rendition');
  });
});