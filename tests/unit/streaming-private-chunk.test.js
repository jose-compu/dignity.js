const {
  STREAM_ACCESS_MODES,
  sealPrivateMediaChunk,
  openPrivateMediaChunk,
  verifyMediaChunk,
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
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
});