const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('../../src/security/message-security-service');
const {
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = require('../../src/security/derive-key-pair');
const {
  buildIdentityRotationPayload,
  buildColdRecoveryEnrollmentPayload,
  createIdentityRotation,
  createColdRecoveryEnrollment,
  verifyIdentityRotation,
  verifyColdRecoveryEnrollment,
  shouldApplyIdentityRotation
} = require('../../src/security/identity-rotation');

describe('identity rotation validation branches', () => {
  test('buildIdentityRotationPayload rejects invalid input', () => {
    expect(() => buildIdentityRotationPayload({
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: {},
      nextPublicKey: {},
      rotationKind: 'compromise-recovery'
    })).toThrow('requires username');

    expect(() => buildIdentityRotationPayload({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: {},
      nextPublicKey: {},
      rotationKind: 'unknown'
    })).toThrow('Identity rotation kind must be one of');

    expect(() => buildIdentityRotationPayload({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 3,
      previousPublicKey: {
        signingPublicKey: 'a',
        encryptionPublicKey: 'b'
      },
      nextPublicKey: {
        signingPublicKey: 'c',
        encryptionPublicKey: 'd'
      },
      rotationKind: 'compromise-recovery'
    })).toThrow('advance generation by exactly 1');

    expect(() => buildIdentityRotationPayload({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: { signingPublicKey: 'only-signing' },
      nextPublicKey: {
        signingPublicKey: 'c',
        encryptionPublicKey: 'd'
      },
      rotationKind: 'compromise-recovery'
    })).toThrow('Public key bundle requires');
  });

  test('createIdentityRotation and cold enrollment require secrets', async () => {
    const keyPair = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      kdfIterations: 500
    });

    expect(() => createIdentityRotation({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: keyPairToPublicBundle(keyPair),
      nextKeyPair: null,
      rotationKind: 'compromise-recovery'
    })).toThrow('requires nextKeyPair');

    expect(() => buildColdRecoveryEnrollmentPayload({ recoveryPublicKey: 'x' }))
      .toThrow('requires username');
    expect(() => buildColdRecoveryEnrollmentPayload({ username: 'alice' }))
      .toThrow('requires recoveryPublicKey');

    expect(() => createColdRecoveryEnrollment({
      username: 'alice',
      recoveryPublicKey: 'abc'
    })).toThrow('requires cold recovery signing secret');
    expect(() => createColdRecoveryEnrollment({
      username: 'alice',
      coldRecoverySigningSecretKey: keyPair.signing.secretKey
    })).toThrow('requires recoveryPublicKey');
  });

  test('verifyColdRecoveryEnrollment covers rejection branches', async () => {
    expect(verifyColdRecoveryEnrollment(null).error).toBe('invalid-enrollment-shape');
    expect(verifyColdRecoveryEnrollment({ type: 'identity:cold-enroll', version: 2 }).error)
      .toBe('invalid-enrollment-shape');
    expect(verifyColdRecoveryEnrollment({
      type: 'identity:cold-enroll',
      version: 1,
      username: 'alice'
    }).error).toBe('missing-enrollment-fields');

    const tampered = {
      type: 'identity:cold-enroll',
      version: 1,
      username: 'alice',
      recoveryPublicKey: naclUtil.encodeBase64(nacl.sign.keyPair().publicKey),
      signature: naclUtil.encodeBase64(new Uint8Array(64))
    };
    expect(verifyColdRecoveryEnrollment(tampered).error).toBe('invalid-enrollment-signature');
  });

  test('verifyIdentityRotation covers rejection branches', async () => {
    const gen1 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 1,
      kdfIterations: 500
    });
    const gen2 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 2,
      kdfIterations: 500
    });

    expect(verifyIdentityRotation(null).error).toBe('invalid-rotation-shape');
    expect(verifyIdentityRotation({ type: 'identity:rotate', version: 1 }).error)
      .toBe('missing-rotation-fields');
    expect(verifyIdentityRotation({
      type: 'identity:rotate',
      version: 1,
      signature: 'x',
      previousPublicKey: keyPairToPublicBundle(gen1),
      nextPublicKey: keyPairToPublicBundle(gen2),
      fromGeneration: 1,
      toGeneration: 3,
      rotationKind: 'compromise-recovery'
    }).error).toBe('invalid-generation-step');
    expect(verifyIdentityRotation({
      type: 'identity:rotate',
      version: 1,
      signature: 'x',
      previousPublicKey: keyPairToPublicBundle(gen1),
      nextPublicKey: keyPairToPublicBundle(gen2),
      fromGeneration: 1,
      toGeneration: 2,
      rotationKind: 'bad-kind'
    }).error).toBe('invalid-rotation-kind');

    const payload = buildIdentityRotationPayload({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: keyPairToPublicBundle(gen1),
      nextPublicKey: keyPairToPublicBundle(gen2),
      rotationKind: 'compromise-recovery'
    });
    const badSig = { ...payload, signature: naclUtil.encodeBase64(new Uint8Array(64)) };
    expect(verifyIdentityRotation(badSig).error).toBe('invalid-signature');

    const signed = createIdentityRotation({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: keyPairToPublicBundle(gen1),
      nextKeyPair: gen2,
      rotationKind: 'compromise-recovery'
    });
    expect(verifyIdentityRotation(signed, {
      requiredRecoveryPublicKey: naclUtil.encodeBase64(nacl.sign.keyPair().publicKey)
    }).error).toBe('missing-recovery-signature');

    const sameKeyRotation = createIdentityRotation({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: keyPairToPublicBundle(gen2),
      nextKeyPair: gen2,
      rotationKind: 'compromise-recovery'
    });
    expect(verifyIdentityRotation(sameKeyRotation).error).toBe('unchanged-signing-key');

    const withRecovery = createIdentityRotation({
      username: 'alice',
      fromGeneration: 1,
      toGeneration: 2,
      previousPublicKey: keyPairToPublicBundle(gen1),
      nextKeyPair: gen2,
      rotationKind: 'compromise-recovery',
      coldRecoverySigningSecretKey: gen1.signing.secretKey
    });
    expect(verifyIdentityRotation(withRecovery, {
      requiredRecoveryPublicKey: naclUtil.encodeBase64(nacl.sign.keyPair().publicKey)
    }).error).toBe('invalid-recovery-signature');
  });

  test('shouldApplyIdentityRotation rejects previous key mismatch', async () => {
    const gen1 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 1,
      kdfIterations: 500
    });
    const gen2 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 2,
      kdfIterations: 500
    });
    const gen3 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 3,
      kdfIterations: 500
    });

    const rotation = createIdentityRotation({
      username: 'alice',
      fromGeneration: 2,
      toGeneration: 3,
      previousPublicKey: keyPairToPublicBundle(gen2),
      nextKeyPair: gen3,
      rotationKind: 'compromise-recovery'
    });

    const result = shouldApplyIdentityRotation({
      generation: 2,
      publicKey: keyPairToPublicBundle(gen1)
    }, rotation);

    expect(result.apply).toBe(false);
    expect(result.reason).toBe('previous-key-mismatch');
  });
});
