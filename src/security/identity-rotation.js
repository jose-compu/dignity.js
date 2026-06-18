const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('./message-security-service');
const {
  deriveKeyPairFromCredentials,
  deriveColdRecoverySigningKey,
  keyPairToPublicBundle
} = require('./derive-key-pair');

const ROTATION_TYPES = new Set(['compromise-recovery', 'password-change']);

function utf8ToBytes(value) {
  return naclUtil.decodeUTF8(value);
}

function normalizePublicKeyBundle(publicKey) {
  if (!publicKey || !publicKey.signingPublicKey || !publicKey.encryptionPublicKey) {
    throw new Error('Public key bundle requires signingPublicKey and encryptionPublicKey');
  }
  return {
    signingPublicKey: publicKey.signingPublicKey,
    encryptionPublicKey: publicKey.encryptionPublicKey
  };
}

function buildIdentityRotationPayload({
  username,
  fromGeneration,
  toGeneration,
  previousPublicKey,
  nextPublicKey,
  rotationKind,
  reason,
  timestamp
}) {
  if (!username) {
    throw new Error('Identity rotation requires username');
  }
  if (!ROTATION_TYPES.has(rotationKind)) {
    throw new Error(`Identity rotation kind must be one of: ${[...ROTATION_TYPES].join(', ')}`);
  }
  if (toGeneration !== fromGeneration + 1) {
    throw new Error('Identity rotation must advance generation by exactly 1');
  }

  return {
    version: 1,
    type: 'identity:rotate',
    username,
    fromGeneration,
    toGeneration,
    previousPublicKey: normalizePublicKeyBundle(previousPublicKey),
    nextPublicKey: normalizePublicKeyBundle(nextPublicKey),
    rotationKind,
    reason: reason || '',
    timestamp: typeof timestamp === 'number' ? timestamp : Date.now()
  };
}

function signIdentityRotationPayload(payload, signingSecretKey) {
  const message = utf8ToBytes(stableStringify(payload));
  const signature = nacl.sign.detached(message, signingSecretKey);
  return naclUtil.encodeBase64(signature);
}

function verifyDetachedSignature(payload, signatureBase64, signingPublicKeyBase64) {
  const message = utf8ToBytes(stableStringify(payload));
  const signatureBytes = naclUtil.decodeBase64(signatureBase64);
  const signingPublicKey = naclUtil.decodeBase64(signingPublicKeyBase64);
  return nacl.sign.detached.verify(message, signatureBytes, signingPublicKey);
}

function createIdentityRotation({
  username,
  fromGeneration,
  toGeneration,
  previousPublicKey,
  nextKeyPair,
  rotationKind,
  reason,
  timestamp,
  coldRecoverySigningSecretKey
}) {
  if (!nextKeyPair || !nextKeyPair.signing || !nextKeyPair.signing.secretKey) {
    throw new Error('Identity rotation requires nextKeyPair with signing secret');
  }

  const payload = buildIdentityRotationPayload({
    username,
    fromGeneration,
    toGeneration,
    previousPublicKey,
    nextPublicKey: keyPairToPublicBundle(nextKeyPair),
    rotationKind,
    reason,
    timestamp
  });

  const rotation = {
    ...payload,
    signature: signIdentityRotationPayload(payload, nextKeyPair.signing.secretKey)
  };

  if (coldRecoverySigningSecretKey) {
    rotation.recoverySignature = signIdentityRotationPayload(
      payload,
      coldRecoverySigningSecretKey
    );
  }

  return rotation;
}

function buildColdRecoveryEnrollmentPayload({ username, recoveryPublicKey, timestamp }) {
  if (!username) {
    throw new Error('Cold recovery enrollment requires username');
  }
  if (!recoveryPublicKey) {
    throw new Error('Cold recovery enrollment requires recoveryPublicKey');
  }

  return {
    version: 1,
    type: 'identity:cold-enroll',
    username,
    recoveryPublicKey,
    timestamp: typeof timestamp === 'number' ? timestamp : Date.now()
  };
}

function createColdRecoveryEnrollment({
  username,
  coldRecoverySigningSecretKey,
  recoveryPublicKey,
  timestamp
}) {
  if (!coldRecoverySigningSecretKey) {
    throw new Error('Cold recovery enrollment requires cold recovery signing secret');
  }
  if (!recoveryPublicKey) {
    throw new Error('Cold recovery enrollment requires recoveryPublicKey');
  }

  const payload = buildColdRecoveryEnrollmentPayload({
    username,
    recoveryPublicKey,
    timestamp
  });

  return {
    ...payload,
    signature: signIdentityRotationPayload(payload, coldRecoverySigningSecretKey)
  };
}

function verifyColdRecoveryEnrollment(enrollment) {
  if (!enrollment || enrollment.type !== 'identity:cold-enroll' || enrollment.version !== 1) {
    return { ok: false, error: 'invalid-enrollment-shape' };
  }

  if (!enrollment.signature || !enrollment.recoveryPublicKey) {
    return { ok: false, error: 'missing-enrollment-fields' };
  }

  const { signature, ...payload } = enrollment;
  const verified = verifyDetachedSignature(payload, signature, enrollment.recoveryPublicKey);

  if (!verified) {
    return { ok: false, error: 'invalid-enrollment-signature' };
  }

  return { ok: true, enrollment };
}

function verifyIdentityRotation(rotation, options = {}) {
  if (!rotation || rotation.type !== 'identity:rotate' || rotation.version !== 1) {
    return { ok: false, error: 'invalid-rotation-shape' };
  }

  if (!rotation.signature || !rotation.nextPublicKey || !rotation.previousPublicKey) {
    return { ok: false, error: 'missing-rotation-fields' };
  }

  if (rotation.toGeneration !== rotation.fromGeneration + 1) {
    return { ok: false, error: 'invalid-generation-step' };
  }

  if (!ROTATION_TYPES.has(rotation.rotationKind)) {
    return { ok: false, error: 'invalid-rotation-kind' };
  }

  const { signature, recoverySignature, ...payload } = rotation;
  const verified = verifyDetachedSignature(payload, signature, rotation.nextPublicKey.signingPublicKey);

  if (!verified) {
    return { ok: false, error: 'invalid-signature' };
  }

  const requiredRecoveryPublicKey = options.requiredRecoveryPublicKey || null;
  if (requiredRecoveryPublicKey) {
    if (!recoverySignature) {
      return { ok: false, error: 'missing-recovery-signature' };
    }

    const recoveryVerified = verifyDetachedSignature(
      payload,
      recoverySignature,
      requiredRecoveryPublicKey
    );

    if (!recoveryVerified) {
      return { ok: false, error: 'invalid-recovery-signature' };
    }
  }

  if (rotation.previousPublicKey.signingPublicKey === rotation.nextPublicKey.signingPublicKey) {
    return { ok: false, error: 'unchanged-signing-key' };
  }

  return { ok: true, rotation };
}

async function resolveColdRecoverySigningSecretKey({
  username,
  coldPassword,
  pepper,
  kdfIterations
}) {
  if (!coldPassword) {
    return null;
  }

  const coldRecovery = await deriveColdRecoverySigningKey({
    username,
    coldPassword,
    pepper,
    kdfIterations
  });
  return coldRecovery.signing.secretKey;
}

/**
 * Same username + password, next generation (key #2, #3, …).
 * Optional coldPassword co-signs the rotation so a stolen primary password
 * cannot lock out the legitimate user after cold recovery is enrolled.
 */
async function revokeAndRotateIdentity({
  username,
  password,
  coldPassword,
  currentGeneration = 1,
  reason = 'compromise-recovery',
  pepper = '',
  kdfIterations,
  timestamp
} = {}) {
  const currentKeyPair = await deriveKeyPairFromCredentials({
    username,
    password,
    generation: currentGeneration,
    pepper,
    kdfIterations
  });
  const nextGeneration = currentGeneration + 1;
  const nextKeyPair = await deriveKeyPairFromCredentials({
    username,
    password,
    generation: nextGeneration,
    pepper,
    kdfIterations
  });

  const coldRecoverySigningSecretKey = await resolveColdRecoverySigningSecretKey({
    username,
    coldPassword,
    pepper,
    kdfIterations
  });

  const rotation = createIdentityRotation({
    username,
    fromGeneration: currentGeneration,
    toGeneration: nextGeneration,
    previousPublicKey: keyPairToPublicBundle(currentKeyPair),
    nextKeyPair,
    rotationKind: 'compromise-recovery',
    reason,
    timestamp,
    coldRecoverySigningSecretKey
  });

  return {
    rotation,
    currentKeyPair,
    nextKeyPair,
    nextGeneration,
    coldRecoveryUsed: Boolean(coldRecoverySigningSecretKey)
  };
}

/**
 * Password change: signed with new-password gen N+1 keys.
 * Optional coldPassword prevents an attacker who stole the old primary password
 * from rotating the identity away from the legitimate user.
 */
async function rotateIdentityPassword({
  username,
  currentPassword,
  newPassword,
  coldPassword,
  currentGeneration = 1,
  reason = 'password-change',
  pepper = '',
  kdfIterations,
  timestamp
} = {}) {
  const currentKeyPair = await deriveKeyPairFromCredentials({
    username,
    password: currentPassword,
    generation: currentGeneration,
    pepper,
    kdfIterations
  });
  const nextGeneration = currentGeneration + 1;
  const nextKeyPair = await deriveKeyPairFromCredentials({
    username,
    password: newPassword,
    generation: nextGeneration,
    pepper,
    kdfIterations
  });

  const coldRecoverySigningSecretKey = await resolveColdRecoverySigningSecretKey({
    username,
    coldPassword,
    pepper,
    kdfIterations
  });

  const rotation = createIdentityRotation({
    username,
    fromGeneration: currentGeneration,
    toGeneration: nextGeneration,
    previousPublicKey: keyPairToPublicBundle(currentKeyPair),
    nextKeyPair,
    rotationKind: 'password-change',
    reason,
    timestamp,
    coldRecoverySigningSecretKey
  });

  return {
    rotation,
    currentKeyPair,
    nextKeyPair,
    nextGeneration,
    coldRecoveryUsed: Boolean(coldRecoverySigningSecretKey)
  };
}

async function enrollColdRecoveryPassword({
  username,
  coldPassword,
  pepper = '',
  kdfIterations,
  timestamp
} = {}) {
  const coldRecovery = await deriveColdRecoverySigningKey({
    username,
    coldPassword,
    pepper,
    kdfIterations
  });

  const enrollment = createColdRecoveryEnrollment({
    username,
    coldRecoverySigningSecretKey: coldRecovery.signing.secretKey,
    recoveryPublicKey: coldRecovery.recoveryPublicKey,
    timestamp
  });

  return {
    enrollment,
    recoveryPublicKey: coldRecovery.recoveryPublicKey,
    coldRecovery
  };
}

function shouldApplyIdentityRotation(currentState, rotation, options = {}) {
  const requiredRecoveryPublicKey = options.enrolledRecoveryPublicKey
    || (currentState && currentState.recoveryPublicKey)
    || null;

  const verified = verifyIdentityRotation(rotation, { requiredRecoveryPublicKey });
  if (!verified.ok) {
    return { apply: false, reason: verified.error };
  }

  if (currentState && rotation.toGeneration <= currentState.generation) {
    return { apply: false, reason: 'stale-generation' };
  }

  if (
    currentState
    && currentState.publicKey
    && currentState.publicKey.signingPublicKey !== rotation.previousPublicKey.signingPublicKey
  ) {
    return { apply: false, reason: 'previous-key-mismatch' };
  }

  return { apply: true, rotation: verified.rotation };
}

module.exports = {
  createIdentityRotation,
  createColdRecoveryEnrollment,
  verifyIdentityRotation,
  verifyColdRecoveryEnrollment,
  revokeAndRotateIdentity,
  rotateIdentityPassword,
  enrollColdRecoveryPassword,
  shouldApplyIdentityRotation,
  keyPairToPublicBundle,
  buildIdentityRotationPayload,
  buildColdRecoveryEnrollmentPayload,
  signIdentityRotationPayload
};
