/**
 * Signed media chunk envelope for experimental public streaming (#152).
 * @experimental
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('../security/message-security-service');

const MEDIA_CHUNK_VERSION = 1;
const DEFAULT_LAYER_ID = 'L0';

function utf8ToBytes(value) {
  return naclUtil.decodeUTF8(value);
}

function payloadFingerprint(payloadBytes) {
  if (!(payloadBytes instanceof Uint8Array)) {
    throw new TypeError('payloadBytes must be a Uint8Array');
  }
  return naclUtil.encodeBase64(nacl.hash(payloadBytes));
}

function canonicalMediaChunkSigningPayload(fields) {
  return stableStringify({
    version: MEDIA_CHUNK_VERSION,
    sessionId: fields.sessionId,
    broadcasterId: fields.broadcasterId,
    sequence: fields.sequence,
    timestampMs: fields.timestampMs,
    layerId: fields.layerId,
    mimeType: fields.mimeType,
    payloadFingerprint: fields.payloadFingerprint
  });
}

/**
 * @typedef {Object} SignedMediaChunk
 * @property {number} version
 * @property {string} sessionId
 * @property {string} broadcasterId
 * @property {number} sequence
 * @property {number} timestampMs
 * @property {string} layerId
 * @property {string} mimeType
 * @property {string} payloadBase64
 * @property {string} payloadFingerprint
 * @property {string} signatureBase64
 * @property {string} signingPublicKey
 */

/**
 * @param {Object} options
 * @param {string} options.sessionId
 * @param {string} options.broadcasterId
 * @param {Uint8Array} options.payloadBytes
 * @param {Uint8Array} options.signingSecretKey Ed25519 secret key
 * @param {string} options.signingPublicKey Base64 Ed25519 public key
 * @param {number} [options.sequence]
 * @param {number} [options.timestampMs]
 * @param {string} [options.layerId]
 * @param {string} [options.mimeType]
 * @returns {SignedMediaChunk}
 */
function createSignedMediaChunk({
  sessionId,
  broadcasterId,
  payloadBytes,
  signingSecretKey,
  signingPublicKey,
  sequence = 0,
  timestampMs = Date.now(),
  layerId = DEFAULT_LAYER_ID,
  mimeType = 'application/octet-stream'
}) {
  if (typeof sessionId !== 'string' || sessionId.trim() === '') {
    throw new TypeError('sessionId must be a non-empty string');
  }
  if (typeof broadcasterId !== 'string' || broadcasterId.trim() === '') {
    throw new TypeError('broadcasterId must be a non-empty string');
  }
  if (!(signingSecretKey instanceof Uint8Array)) {
    throw new TypeError('signingSecretKey must be a Uint8Array');
  }
  if (typeof signingPublicKey !== 'string' || signingPublicKey.trim() === '') {
    throw new TypeError('signingPublicKey must be a non-empty string');
  }

  const fingerprint = payloadFingerprint(payloadBytes);
  const signingPayload = canonicalMediaChunkSigningPayload({
    sessionId: sessionId.trim(),
    broadcasterId: broadcasterId.trim(),
    sequence,
    timestampMs,
    layerId,
    mimeType,
    payloadFingerprint: fingerprint
  });

  const signature = nacl.sign.detached(utf8ToBytes(signingPayload), signingSecretKey);

  return {
    version: MEDIA_CHUNK_VERSION,
    sessionId: sessionId.trim(),
    broadcasterId: broadcasterId.trim(),
    sequence,
    timestampMs,
    layerId,
    mimeType,
    payloadBase64: naclUtil.encodeBase64(payloadBytes),
    payloadFingerprint: fingerprint,
    signatureBase64: naclUtil.encodeBase64(signature),
    signingPublicKey: signingPublicKey.trim(),
    experimental: true
  };
}

/**
 * @param {SignedMediaChunk} chunk
 * @param {string} [expectedSessionId]
 * @returns {boolean}
 */
function verifyMediaChunk(chunk, expectedSessionId) {
  if (!chunk || typeof chunk !== 'object') {
    throw new TypeError('chunk must be an object');
  }

  const payloadBytes = naclUtil.decodeBase64(chunk.payloadBase64);
  const recomputed = payloadFingerprint(payloadBytes);
  if (recomputed !== chunk.payloadFingerprint) {
    throw new Error('Media chunk payload fingerprint mismatch');
  }

  if (expectedSessionId && chunk.sessionId !== expectedSessionId) {
    throw new Error('Media chunk sessionId mismatch');
  }

  const signingPayload = canonicalMediaChunkSigningPayload({
    sessionId: chunk.sessionId,
    broadcasterId: chunk.broadcasterId,
    sequence: chunk.sequence,
    timestampMs: chunk.timestampMs,
    layerId: chunk.layerId,
    mimeType: chunk.mimeType,
    payloadFingerprint: chunk.payloadFingerprint
  });

  const ok = nacl.sign.detached.verify(
    utf8ToBytes(signingPayload),
    naclUtil.decodeBase64(chunk.signatureBase64),
    naclUtil.decodeBase64(chunk.signingPublicKey)
  );

  if (!ok) {
    const error = new Error('Invalid media chunk signature');
    error.code = 'INVALID_MEDIA_CHUNK_SIGNATURE';
    throw error;
  }

  return true;
}

/**
 * @param {SignedMediaChunk} chunk
 * @returns {Uint8Array}
 */
function decodeMediaChunkPayload(chunk) {
  verifyMediaChunk(chunk);
  return naclUtil.decodeBase64(chunk.payloadBase64);
}

module.exports = {
  MEDIA_CHUNK_VERSION,
  DEFAULT_LAYER_ID,
  createSignedMediaChunk,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  payloadFingerprint
};