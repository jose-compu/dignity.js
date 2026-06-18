const naclUtil = require('tweetnacl-util');
const {
  deriveKeyPairFromCredentials,
  keyPairToPublicBundle
} = require('../../src/security/derive-key-pair');
const {
  verifyIdentityRotation,
  revokeAndRotateIdentity,
  rotateIdentityPassword,
  enrollColdRecoveryPassword,
  verifyColdRecoveryEnrollment
} = require('../../src/security/identity-rotation');
const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../../src');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('identity rotation', () => {
  test('generation bumps produce different keys for same username and password', async () => {
    const gen1 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 1,
      kdfIterations: 1000
    });
    const gen2 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 2,
      kdfIterations: 1000
    });

    expect(keyPairToPublicBundle(gen1)).not.toEqual(keyPairToPublicBundle(gen2));
  });

  test('revokeAndRotateIdentity signs succession with next-generation key', async () => {
    const { rotation, nextKeyPair } = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'secret',
      currentGeneration: 1,
      kdfIterations: 1000,
      reason: 'left browser open on public PC'
    });

    expect(rotation.fromGeneration).toBe(1);
    expect(rotation.toGeneration).toBe(2);
    expect(rotation.rotationKind).toBe('compromise-recovery');
    expect(verifyIdentityRotation(rotation).ok).toBe(true);
    expect(rotation.nextPublicKey).toEqual(keyPairToPublicBundle(nextKeyPair));
  });

  test('stolen generation-1 key cannot forge generation-2 rotation', async () => {
    const gen1 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 1,
      kdfIterations: 1000
    });
    const legit = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'secret',
      currentGeneration: 1,
      kdfIterations: 1000
    });

    const forged = { ...legit.rotation };
    const payload = { ...forged };
    delete payload.signature;
    const nacl = require('tweetnacl');
    forged.signature = naclUtil.encodeBase64(
      nacl.sign.detached(
        naclUtil.decodeUTF8(require('../../src/security/message-security-service').stableStringify(payload)),
        gen1.signing.secretKey
      )
    );

    expect(verifyIdentityRotation(forged).ok).toBe(false);
  });

  test('rotateIdentityPassword links old password epoch to new password epoch', async () => {
    const { rotation, nextKeyPair } = await rotateIdentityPassword({
      username: 'alice',
      currentPassword: 'old-secret',
      newPassword: 'new-secret',
      currentGeneration: 2,
      kdfIterations: 1000
    });

    expect(rotation.fromGeneration).toBe(2);
    expect(rotation.toGeneration).toBe(3);
    expect(rotation.rotationKind).toBe('password-change');
    expect(verifyIdentityRotation(rotation).ok).toBe(true);
    expect(rotation.nextPublicKey).toEqual(keyPairToPublicBundle(nextKeyPair));
  });

  test('peers apply broadcast identity rotation and reject downgrades', async () => {
    const hub = new InMemoryNetworkHub();
    const security = fastTestSecurity({ appPassword: 'rotation-test', powEnabled: false });

    const alice = new DignityP2P({
      nodeId: 'alice',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    const bob = new DignityP2P({
      nodeId: 'bob',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });

    const gen1 = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'secret',
      generation: 1,
      kdfIterations: 1000
    });
    const rotationResult = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'secret',
      currentGeneration: 1,
      kdfIterations: 1000
    });

    await alice.start();
    await bob.start();

    bob.registerPeerPublicKey('alice', keyPairToPublicBundle(gen1), { generation: 1 });
    expect(bob.getPeerIdentityGeneration('alice')).toBe(1);

    await alice.adoptDerivedIdentityKeyPair(rotationResult.nextKeyPair, { generation: 2 });
    await alice.broadcastIdentityRotation(rotationResult.rotation, {
      broadcastScope: 'identity:alice'
    });

    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(bob.getPeerIdentityGeneration('alice')).toBe(2);
    expect(bob.getPeerIdentityState('alice').publicKey).toEqual(
      keyPairToPublicBundle(rotationResult.nextKeyPair)
    );

    expect(() => {
      bob.registerPeerPublicKey('alice', keyPairToPublicBundle(gen1), { generation: 1 });
    }).toThrow('Refusing older identity generation');

    await alice.stop();
    await bob.stop();
  });

  test('cold recovery enrollment blocks rotation signed with primary password only', async () => {
    const { enrollment, recoveryPublicKey } = await enrollColdRecoveryPassword({
      username: 'alice',
      coldPassword: 'cold-vault-secret',
      kdfIterations: 1000
    });

    expect(verifyColdRecoveryEnrollment(enrollment).ok).toBe(true);

    const attackerRotation = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'primary-secret',
      currentGeneration: 1,
      kdfIterations: 1000
    });

    const { MessageSecurityService } = require('../../src/security/message-security-service');
    const svc = new MessageSecurityService({ nodeId: 'bob', options: { enabled: false } });
    svc.registerPeerRecoveryPublicKey('alice', recoveryPublicKey);

    expect(() => svc.applyIdentityRotation('alice', attackerRotation.rotation))
      .toThrow(/missing-recovery-signature/);
  });

  test('cold recovery co-sign allows legitimate rotation after enrollment', async () => {
    const enrolled = await enrollColdRecoveryPassword({
      username: 'alice',
      coldPassword: 'cold-vault-secret',
      kdfIterations: 1000
    });

    const legit = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'primary-secret',
      coldPassword: 'cold-vault-secret',
      currentGeneration: 1,
      kdfIterations: 1000
    });

    expect(legit.coldRecoveryUsed).toBe(true);
    expect(verifyIdentityRotation(legit.rotation, {
      requiredRecoveryPublicKey: enrolled.recoveryPublicKey
    }).ok).toBe(true);

    const { MessageSecurityService } = require('../../src/security/message-security-service');
    const svc = new MessageSecurityService({ nodeId: 'bob', options: { enabled: false } });
    svc.registerPeerRecoveryPublicKey('alice', enrolled.recoveryPublicKey);

    const applied = svc.applyIdentityRotation('alice', legit.rotation);
    expect(applied.applied).toBe(true);
    expect(applied.toGeneration).toBe(2);
  });

  test('applyIdentityRotation rejects replay of same generation step', async () => {
    const { rotation } = await revokeAndRotateIdentity({
      username: 'alice',
      password: 'secret',
      currentGeneration: 1,
      kdfIterations: 1000
    });
    const { MessageSecurityService } = require('../../src/security/message-security-service');
    const svc = new MessageSecurityService({
      nodeId: 'bob',
      options: { enabled: false }
    });

    const first = svc.applyIdentityRotation('alice', rotation);
    expect(first.applied).toBe(true);

    const replay = svc.applyIdentityRotation('alice', rotation);
    expect(replay.applied).toBe(false);
    expect(replay.reason).toBe('stale-generation');
  });
});
