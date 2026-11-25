/**
 * Private stream media chunks (#152 milestone 3 slice).
 * Sender-key + secretbox payload; per-recipient box-wrapped keys; signed ciphertext for relays.
 * @experimental
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { STREAM_ACCESS_MODES, validateStreamAccessConfig } = require('./access-modes');
const { createSignedMediaChunk, verifyMediaChunk } = require('./media-chunk');
const { wrapSenderKeyForRecipients } = require('./private-sender-key-epoch');

const PRIVATE_CHUNK_ACCESS_MODES = new Set([
  STREAM_ACCESS_MODES.PRIVATE_SINGLE,
  STREAM_ACCESS_MODES.PRIVATE_LIST,
  STREAM_ACCESS_MODES.COMBINED
]);

/**
 * @typedef {import('./media-chunk').SignedMediaChunk & {
 *   accessMode?: string;
 *   secretboxNonceBase64?: string;
 *   senderKeyEpoch?: number;
 *   senderKeyWraps?: Array<{
 *     recipientSigningPublicKey: string;
 *     wrapNonceBase64: string;
 *     wrappedSenderKeyBase64: string;
 *     senderEncryptionPublicKey: string;
 *   }>;
 * }} PrivateSignedMediaChunk
 */

function normalizeRecipientBundles(recipientPublicBundles) {
  if (!Array.isArray(recipientPublicBundles) || recipientPublicBundles.length === 0) {
    throw new TypeError('recipientPublicBundles must be a non-empty array');
  }
  return recipientPublicBundles.map((bundle, index) => {
    if (!bundle || typeof bundle !== 'object') {
      throw new TypeError(`recipientPublicBundles[${index}] must be an object`);
    }
    const signingPublicKey = bundle.signingPublicKey;
    const encryptionPublicKey = bundle.encryptionPublicKey;
    if (typeof signingPublicKey !== 'string' || signingPublicKey.trim() === '') {
      throw new TypeError(`recipientPublicBundles[${index}].signingPublicKey must be a non-empty string`);
    }
    if (typeof encryptionPublicKey !== 'string' || encryptionPublicKey.trim() === '') {
      throw new TypeError(`recipientPublicBundles[${index}].encryptionPublicKey must be a non-empty string`);
    }
    return {
      signingPublicKey: signingPublicKey.trim(),
      encryptionPublicKey: encryptionPublicKey.trim()
    };
  });
}

/**
 * @param {Object} options
 * @param {'private-single' | 'private-list' | 'combined'} options.accessMode
 * @param {string} options.sessionId
 * @param {string} options.broadcasterId
 * @param {Uint8Array} options.plaintextBytes
 * @param {Uint8Array} options.signingSecretKey
 * @param {string} options.signingPublicKey
 * @param {Uint8Array} options.broadcasterEncryptionSecretKey
 * @param {string} options.broadcasterEncryptionPublicKey
 * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} options.recipientPublicBundles
 * @param {import('./private-sender-key-epoch').PrivateSenderKeyEpoch} [options.privateSenderKeyEpoch]
 * @param {number} [options.sequence]
 * @param {number} [options.timestampMs]
 * @param {string} [options.layerId]
 * @param {string} [options.mimeType]
 * @returns {PrivateSignedMediaChunk}
 */
function sealPrivateMediaChunk({
  accessMode,
  sessionId,
  broadcasterId,
  plaintextBytes,
  signingSecretKey,
  signingPublicKey,
  broadcasterEncryptionSecretKey,
  broadcasterEncryptionPublicKey,
  recipientPublicBundles,
  privateSenderKeyEpoch,
  sequence,
  timestampMs,
  layerId,
  mimeType
}) {
  if (!PRIVATE_CHUNK_ACCESS_MODES.has(accessMode)) {
    throw new Error(
      'sealPrivateMediaChunk supports only private-single, private-list, and combined access modes'
    );
  }
  if (!(plaintextBytes instanceof Uint8Array)) {
    throw new TypeError('plaintextBytes must be a Uint8Array');
  }
  if (!(broadcasterEncryptionSecretKey instanceof Uint8Array)) {
    throw new TypeError('broadcasterEncryptionSecretKey must be a Uint8Array');
  }
  if (typeof broadcasterEncryptionPublicKey !== 'string' || broadcasterEncryptionPublicKey.trim() === '') {
    throw new TypeError('broadcasterEncryptionPublicKey must be a non-empty string');
  }

  const bundles = normalizeRecipientBundles(recipientPublicBundles);
  const recipientIds = bundles.map((b) => b.signingPublicKey);
  validateStreamAccessConfig(accessMode, { privateRecipients: recipientIds });

  let senderKey;
  let senderKeyWraps;
  let senderKeyEpoch;

  if (privateSenderKeyEpoch != null) {
    if (typeof privateSenderKeyEpoch !== 'object') {
      throw new TypeError('privateSenderKeyEpoch must be an object when provided');
    }
    if (!(privateSenderKeyEpoch.senderKey instanceof Uint8Array)) {
      throw new TypeError('privateSenderKeyEpoch.senderKey must be a Uint8Array');
    }
    if (!Array.isArray(privateSenderKeyEpoch.senderKeyWraps)) {
      throw new TypeError('privateSenderKeyEpoch.senderKeyWraps must be an array');
    }
    senderKey = privateSenderKeyEpoch.senderKey;
    senderKeyWraps = privateSenderKeyEpoch.senderKeyWraps;
    senderKeyEpoch = privateSenderKeyEpoch.epoch;
  } else {
    senderKey = nacl.randomBytes(nacl.secretbox.keyLength);
    senderKeyWraps = wrapSenderKeyForRecipients(
      senderKey,
      bundles,
      broadcasterEncryptionSecretKey,
      broadcasterEncryptionPublicKey
    );
  }

  const secretboxNonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const ciphertext = nacl.secretbox(plaintextBytes, secretboxNonce, senderKey);
  if (!ciphertext) {
    throw new Error('Failed to seal private media chunk payload');
  }

  const signed = createSignedMediaChunk({
    sessionId,
    broadcasterId,
    payloadBytes: ciphertext,
    signingSecretKey,
    signingPublicKey,
    sequence,
    timestampMs,
    layerId,
    mimeType
  });

  const chunk = {
    ...signed,
    accessMode,
    secretboxNonceBase64: naclUtil.encodeBase64(secretboxNonce),
    senderKeyWraps
  };
  if (senderKeyEpoch != null) {
    chunk.senderKeyEpoch = senderKeyEpoch;
  }
  return chunk;
}

/**
 * @param {PrivateSignedMediaChunk} chunk
 * @param {Object} options
 * @param {Uint8Array} options.recipientEncryptionSecretKey
 * @param {string} options.recipientSigningPublicKey Listed recipient signing public key (base64)
 * @param {boolean} [options.verify=true]
 * @returns {Uint8Array}
 */
function openPrivateMediaChunk(chunk, { recipientEncryptionSecretKey, recipientSigningPublicKey, verify = true }) {
  if (!chunk || typeof chunk !== 'object') {
    throw new TypeError('chunk must be an object');
  }
  if (!(recipientEncryptionSecretKey instanceof Uint8Array)) {
    throw new TypeError('recipientEncryptionSecretKey must be a Uint8Array');
  }
  if (typeof recipientSigningPublicKey !== 'string' || recipientSigningPublicKey.trim() === '') {
    throw new TypeError('recipientSigningPublicKey must be a non-empty string');
  }

  const mode = chunk.accessMode;
  if (!PRIVATE_CHUNK_ACCESS_MODES.has(mode)) {
    throw new Error('chunk is not a private media chunk');
  }
  if (!chunk.secretboxNonceBase64 || !Array.isArray(chunk.senderKeyWraps)) {
    throw new Error('chunk is missing private media metadata');
  }

  if (verify) {
    verifyMediaChunk(chunk);
  }

  const wrap = chunk.senderKeyWraps.find(
    (entry) => entry.recipientSigningPublicKey === recipientSigningPublicKey.trim()
  );
  if (!wrap) {
    const error = new Error('Recipient is not authorized for this private media chunk');
    error.code = 'PRIVATE_MEDIA_RECIPIENT_NOT_LISTED';
    throw error;
  }

  const senderKey = nacl.box.open(
    naclUtil.decodeBase64(wrap.wrappedSenderKeyBase64),
    naclUtil.decodeBase64(wrap.wrapNonceBase64),
    naclUtil.decodeBase64(wrap.senderEncryptionPublicKey),
    recipientEncryptionSecretKey
  );
  if (!senderKey) {
    const error = new Error('Failed to unwrap sender key for recipient');
    error.code = 'PRIVATE_MEDIA_UNWRAP_FAILED';
    throw error;
  }

  const plaintext = nacl.secretbox.open(
    naclUtil.decodeBase64(chunk.payloadBase64),
    naclUtil.decodeBase64(chunk.secretboxNonceBase64),
    senderKey
  );
  if (!plaintext) {
    throw new Error('Failed to decrypt private media chunk payload');
  }

  return plaintext;
}

module.exports = {
  sealPrivateMediaChunk,
  openPrivateMediaChunk
};