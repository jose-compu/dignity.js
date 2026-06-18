const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { deriveKeyPairFromCredentials } = require('../../src/security/derive-key-pair');
const { MessageSecurityService } = require('../../src/security/message-security-service');

function publicKeyBundle(keyPair) {
  return {
    signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
    encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
  };
}

describe('deriveKeyPairFromCredentials', () => {
  test('same username and password produce identical key pairs', async () => {
    const first = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'strong-secret',
      kdfIterations: 1000
    });
    const second = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'strong-secret',
      kdfIterations: 1000
    });

    expect(publicKeyBundle(first)).toEqual(publicKeyBundle(second));
  });

  test('different passwords produce different key pairs', async () => {
    const a = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'password-a',
      kdfIterations: 1000
    });
    const b = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'password-b',
      kdfIterations: 1000
    });

    expect(publicKeyBundle(a)).not.toEqual(publicKeyBundle(b));
  });

  test('different usernames produce different key pairs', async () => {
    const a = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'same-password',
      kdfIterations: 1000
    });
    const b = await deriveKeyPairFromCredentials({
      username: 'bob',
      password: 'same-password',
      kdfIterations: 1000
    });

    expect(publicKeyBundle(a)).not.toEqual(publicKeyBundle(b));
  });

  test('integrates with MessageSecurityService sign and direct encrypt', async () => {
    const aliceKeys = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'room-secret',
      kdfIterations: 1000
    });
    const bobKeys = await deriveKeyPairFromCredentials({
      username: 'bob',
      password: 'room-secret',
      kdfIterations: 1000
    });

    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        appPassword: 'broadcast-shared',
        powEnabled: false,
        keyPair: aliceKeys
      }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: {
        appPassword: 'broadcast-shared',
        powEnabled: false,
        keyPair: bobKeys
      }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());
    alice.registerPeerPublicKey('bob', bob.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'operation',
      payload: { move: 'e4' },
      targetId: 'bob'
    });
    const decrypted = await bob.decryptIncomingMessage(envelope);

    expect(decrypted.payload).toEqual({ move: 'e4' });
    expect(decrypted.senderId).toBe('alice');
  });

  test('requires username and password', async () => {
    await expect(deriveKeyPairFromCredentials({ password: 'x' }))
      .rejects.toThrow('requires username');
    await expect(deriveKeyPairFromCredentials({ username: 'alice' }))
      .rejects.toThrow('requires password');
  });
});
