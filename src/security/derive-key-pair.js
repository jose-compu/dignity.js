const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { deriveBroadcastKey, DEFAULT_SECURITY_OPTIONS } = require('./message-security-service');

const SIGNING_INFO = 'dignity-signing-v1';
const ENCRYPTION_INFO = 'dignity-encryption-v1';
const COLD_RECOVERY_INFO = 'dignity-cold-recovery-v1';

function utf8ToBytes(value) {
  return naclUtil.decodeUTF8(value);
}

function concatBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function buildColdRecoverySalt(username, pepper = '') {
  if (!username || typeof username !== 'string') {
    throw new Error('deriveColdRecoverySigningKey requires username');
  }

  const segments = ['dignity-cold-recovery-v1'];
  if (pepper) {
    segments.push(pepper);
  }
  segments.push(username, COLD_RECOVERY_INFO);
  return utf8ToBytes(segments.join('\0'));
}

async function deriveColdRecoverySigningKey({
  username,
  coldPassword,
  pepper = '',
  kdfIterations
} = {}) {
  if (!coldPassword || typeof coldPassword !== 'string') {
    throw new Error('deriveColdRecoverySigningKey requires coldPassword');
  }

  const salt = buildColdRecoverySalt(username, pepper);
  const iterations = typeof kdfIterations === 'number'
    ? kdfIterations
    : DEFAULT_SECURITY_OPTIONS.kdfIterations;
  const seed = await deriveBroadcastKey(coldPassword, salt, iterations);
  const signing = nacl.sign.keyPair.fromSeed(seed);

  return {
    signing,
    recoveryPublicKey: naclUtil.encodeBase64(signing.publicKey)
  };
}

function buildIdentitySalt(username, info, pepper = '', generation = 1) {
  if (!username || typeof username !== 'string') {
    throw new Error('deriveKeyPairFromCredentials requires username');
  }
  if (!info || typeof info !== 'string') {
    throw new Error('deriveKeyPairFromCredentials requires info label');
  }
  const normalizedGeneration = Number(generation);
  if (!Number.isInteger(normalizedGeneration) || normalizedGeneration < 1) {
    throw new Error('deriveKeyPairFromCredentials requires generation >= 1');
  }

  const segments = ['dignity-identity-v1'];
  if (pepper) {
    segments.push(pepper);
  }
  segments.push(username, `gen:${normalizedGeneration}`, info);
  return utf8ToBytes(segments.join('\0'));
}

async function deriveIdentitySeed({ password, username, info, pepper, generation, kdfIterations }) {
  if (!password || typeof password !== 'string') {
    throw new Error('deriveKeyPairFromCredentials requires password');
  }

  const salt = buildIdentitySalt(username, info, pepper, generation);
  const iterations = typeof kdfIterations === 'number'
    ? kdfIterations
    : DEFAULT_SECURITY_OPTIONS.kdfIterations;

  return deriveBroadcastKey(password, salt, iterations);
}

/**
 * Derive deterministic Ed25519 signing and Curve25519 box key pairs from
 * public username + private password. Same inputs yield the same keys across
 * runs and environments. Bump `generation` (2, 3, …) after compromise recovery;
 * see `identity-rotation.js` for signed revocation / password-change flows.
 */
async function deriveKeyPairFromCredentials({
  username,
  password,
  pepper = '',
  generation = 1,
  kdfIterations
} = {}) {
  const signingSeed = await deriveIdentitySeed({
    password,
    username,
    info: SIGNING_INFO,
    pepper,
    generation,
    kdfIterations
  });
  const encryptionSecret = await deriveIdentitySeed({
    password,
    username,
    info: ENCRYPTION_INFO,
    pepper,
    generation,
    kdfIterations
  });

  return {
    signing: nacl.sign.keyPair.fromSeed(signingSeed),
    encryption: nacl.box.keyPair.fromSecretKey(encryptionSecret),
    generation
  };
}

function keyPairToPublicBundle(keyPair) {
  return {
    signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
    encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
  };
}

module.exports = {
  deriveKeyPairFromCredentials,
  deriveColdRecoverySigningKey,
  keyPairToPublicBundle,
  buildIdentitySalt,
  buildColdRecoverySalt,
  SIGNING_INFO,
  ENCRYPTION_INFO,
  COLD_RECOVERY_INFO,
  concatBytes
};
