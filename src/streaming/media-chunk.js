/**
 * Signed media chunk envelope for experimental public streaming (#152).
 * @experimental
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('../security/message-security-service');
const { resolveRendition, renditionMatchesLadder, AUDIO_LAYER_ID, resolveAudioRendition } = require('./rendition-ladder');

const MEDIA_CHUNK_VERSION = 3;
const MEDIA_CHUNK_VERSION_KEYFRAME = 2;
const MEDIA_CHUNK_VERSION_LEGACY = 1;
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
  const version =
    typeof fields.chunkVersion === 'number' ? fields.chunkVersion : MEDIA_CHUNK_VERSION;
  const payload = {
    version,
    sessionId: fields.sessionId,
    broadcasterId: fields.broadcasterId,
    sequence: fields.sequence,
    timestampMs: fields.timestampMs,
    layerId: fields.layerId,
    mimeType: fields.mimeType,
    payloadFingerprint: fields.payloadFingerprint
  };
  if (version >= MEDIA_CHUNK_VERSION_KEYFRAME) {
    payload.keyframe = Boolean(fields.keyframe);
  }
  if (version >= MEDIA_CHUNK_VERSION) {
    if (!fields.rendition || typeof fields.rendition !== 'object') {
      throw new TypeError('rendition must be provided for media chunk version 3');
    }
    payload.rendition = {
      profile: fields.rendition.profile,
      width: fields.rendition.width,
      height: fields.rendition.height,
      videoBitrateKbps: fields.rendition.videoBitrateKbps,
      audioBitrateKbps: fields.rendition.audioBitrateKbps
    };
  }
  return stableStringify(payload);
}

/**
 * @param {string} layerId
 * @param {{ profile: string, layerId: string, width: number, height: number, videoBitrateKbps: number, audioBitrateKbps: number }} rendition
 */
function assertLayerMatchesRendition(layerId, rendition) {
  if (layerId === AUDIO_LAYER_ID) {
    try {
      const expected = resolveAudioRendition(rendition.profile);
      if (
        expected.layerId !== rendition.layerId ||
        expected.audioBitrateKbps !== rendition.audioBitrateKbps
      ) {
        throw new Error('audio rendition mismatch');
      }
    } catch {
      throw new Error('rendition does not match audio track metadata');
    }
    return;
  }
  if (!renditionMatchesLadder(rendition)) {
    throw new Error('rendition does not match a known ladder row');
  }
  if (rendition.layerId !== layerId) {
    throw new Error('layerId must match rendition.layerId');
  }
}

function normalizeRenditionOption(rendition, profile, layerId) {
  if (rendition != null) {
    if (typeof rendition !== 'object') {
      throw new TypeError('rendition must be an object when provided');
    }
    assertLayerMatchesRendition(layerId, rendition);
    return rendition;
  }
  if (typeof profile === 'string' && profile.trim() !== '') {
    if (layerId === AUDIO_LAYER_ID) {
      return resolveAudioRendition(profile);
    }
    const resolved = resolveRendition(profile, layerId);
    return resolved;
  }
  return null;
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
 * @property {boolean} [keyframe]
 * @property {{ profile: string, width: number, height: number, videoBitrateKbps: number, audioBitrateKbps: number }} [rendition]
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
 * @param {boolean} [options.keyframe]
 * @param {string} [options.profile] hd720 | fhd1080 — builds signed rendition with layerId
 * @param {Object} [options.rendition] explicit ladder row (must match layerId)
 * @param {number} [options.chunkVersion] override envelope version (1, 2, or 3)
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
  mimeType = 'application/octet-stream',
  keyframe = false,
  profile,
  rendition,
  chunkVersion
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

  const resolvedRendition = normalizeRenditionOption(rendition, profile, layerId);
  let envelopeVersion = chunkVersion;
  if (envelopeVersion == null) {
    envelopeVersion = resolvedRendition ? MEDIA_CHUNK_VERSION : MEDIA_CHUNK_VERSION_KEYFRAME;
  }
  if (envelopeVersion >= MEDIA_CHUNK_VERSION && !resolvedRendition) {
    throw new TypeError('rendition or profile is required for media chunk version 3');
  }
  if (envelopeVersion < MEDIA_CHUNK_VERSION && resolvedRendition) {
    throw new TypeError('rendition requires media chunk version 3');
  }

  const fingerprint = payloadFingerprint(payloadBytes);
  const signingPayload = canonicalMediaChunkSigningPayload({
    sessionId: sessionId.trim(),
    broadcasterId: broadcasterId.trim(),
    sequence,
    timestampMs,
    layerId,
    mimeType,
    payloadFingerprint: fingerprint,
    keyframe,
    rendition: resolvedRendition,
    chunkVersion: envelopeVersion
  });

  const signature = nacl.sign.detached(utf8ToBytes(signingPayload), signingSecretKey);

  const chunk = {
    version: envelopeVersion,
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
    keyframe: Boolean(keyframe),
    experimental: true
  };
  if (resolvedRendition) {
    chunk.rendition = {
      profile: resolvedRendition.profile,
      width: resolvedRendition.width,
      height: resolvedRendition.height,
      videoBitrateKbps: resolvedRendition.videoBitrateKbps,
      audioBitrateKbps: resolvedRendition.audioBitrateKbps
    };
  }
  return chunk;
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

  const chunkVersion =
    typeof chunk.version === 'number' ? chunk.version : MEDIA_CHUNK_VERSION_LEGACY;
  const signingPayload = canonicalMediaChunkSigningPayload({
    sessionId: chunk.sessionId,
    broadcasterId: chunk.broadcasterId,
    sequence: chunk.sequence,
    timestampMs: chunk.timestampMs,
    layerId: chunk.layerId,
    mimeType: chunk.mimeType,
    payloadFingerprint: chunk.payloadFingerprint,
    chunkVersion,
    keyframe: chunk.keyframe,
    rendition: chunk.rendition
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

  if (chunkVersion >= MEDIA_CHUNK_VERSION) {
    if (!chunk.rendition || typeof chunk.rendition !== 'object') {
      throw new Error('Media chunk version 3 requires rendition metadata');
    }
    assertLayerMatchesRendition(chunk.layerId, { ...chunk.rendition, layerId: chunk.layerId });
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
  MEDIA_CHUNK_VERSION_KEYFRAME,
  MEDIA_CHUNK_VERSION_LEGACY,
  DEFAULT_LAYER_ID,
  createSignedMediaChunk,
  verifyMediaChunk,
  decodeMediaChunkPayload,
  payloadFingerprint,
  assertLayerMatchesRendition
};