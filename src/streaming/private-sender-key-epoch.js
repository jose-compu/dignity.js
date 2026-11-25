/**
 * Sender-key epoch state for private/combined stream tracks (#152).
 * @experimental
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

/**
 * @param {Uint8Array} senderKey
 * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} bundles
 * @param {Uint8Array} broadcasterEncryptionSecretKey
 * @param {string} broadcasterEncryptionPublicKey
 * @returns {Array<{
 *   recipientSigningPublicKey: string;
 *   wrapNonceBase64: string;
 *   wrappedSenderKeyBase64: string;
 *   senderEncryptionPublicKey: string;
 * }>}
 */
function wrapSenderKeyForRecipients(
  senderKey,
  bundles,
  broadcasterEncryptionSecretKey,
  broadcasterEncryptionPublicKey
) {
  if (!(senderKey instanceof Uint8Array) || senderKey.length !== nacl.secretbox.keyLength) {
    throw new TypeError('senderKey must be a secretbox key Uint8Array');
  }
  if (!(broadcasterEncryptionSecretKey instanceof Uint8Array)) {
    throw new TypeError('broadcasterEncryptionSecretKey must be a Uint8Array');
  }
  if (typeof broadcasterEncryptionPublicKey !== 'string' || broadcasterEncryptionPublicKey.trim() === '') {
    throw new TypeError('broadcasterEncryptionPublicKey must be a non-empty string');
  }

  return bundles.map((bundle) => {
    const wrapNonce = nacl.randomBytes(nacl.box.nonceLength);
    const wrapped = nacl.box(
      senderKey,
      wrapNonce,
      naclUtil.decodeBase64(bundle.encryptionPublicKey),
      broadcasterEncryptionSecretKey
    );
    if (!wrapped) {
      throw new Error(`Failed to wrap sender key for recipient ${bundle.signingPublicKey}`);
    }
    return {
      recipientSigningPublicKey: bundle.signingPublicKey,
      wrapNonceBase64: naclUtil.encodeBase64(wrapNonce),
      wrappedSenderKeyBase64: naclUtil.encodeBase64(wrapped),
      senderEncryptionPublicKey: broadcasterEncryptionPublicKey.trim()
    };
  });
}

/**
 * @typedef {Object} PrivateSenderKeyEpoch
 * @property {number} epoch
 * @property {Uint8Array} senderKey
 * @property {Array<Object>} senderKeyWraps
 * @property {string[]} recipientSigningPublicKeys
 */

/**
 * @param {Object} options
 * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} options.recipientPublicBundles
 * @param {Uint8Array} options.broadcasterEncryptionSecretKey
 * @param {string} options.broadcasterEncryptionPublicKey
 * @param {number} [options.epoch=1]
 * @returns {PrivateSenderKeyEpoch}
 */
function createPrivateSenderKeyEpoch({
  recipientPublicBundles,
  broadcasterEncryptionSecretKey,
  broadcasterEncryptionPublicKey,
  epoch = 1
}) {
  if (!Array.isArray(recipientPublicBundles) || recipientPublicBundles.length === 0) {
    throw new TypeError('recipientPublicBundles must be a non-empty array');
  }
  if (typeof epoch !== 'number' || !Number.isInteger(epoch) || epoch < 1) {
    throw new TypeError('epoch must be a positive integer');
  }

  const senderKey = nacl.randomBytes(nacl.secretbox.keyLength);
  const senderKeyWraps = wrapSenderKeyForRecipients(
    senderKey,
    recipientPublicBundles,
    broadcasterEncryptionSecretKey,
    broadcasterEncryptionPublicKey
  );
  const recipientSigningPublicKeys = recipientPublicBundles.map((b) => b.signingPublicKey.trim());

  return Object.freeze({
    epoch,
    senderKey,
    senderKeyWraps,
    recipientSigningPublicKeys: Object.freeze([...recipientSigningPublicKeys])
  });
}

/**
 * @param {PrivateSenderKeyEpoch} currentEpoch
 * @param {Object} options
 * @param {string} options.removeRecipientSigningPublicKey
 * @param {Array<{ signingPublicKey: string; encryptionPublicKey: string }>} options.recipientPublicBundles Remaining roster (must not include removed id)
 * @param {Uint8Array} options.broadcasterEncryptionSecretKey
 * @param {string} options.broadcasterEncryptionPublicKey
 * @returns {PrivateSenderKeyEpoch}
 */
function rotatePrivateSenderKeyEpoch(
  currentEpoch,
  {
    removeRecipientSigningPublicKey,
    recipientPublicBundles,
    broadcasterEncryptionSecretKey,
    broadcasterEncryptionPublicKey
  }
) {
  if (!currentEpoch || typeof currentEpoch !== 'object') {
    throw new TypeError('currentEpoch must be a PrivateSenderKeyEpoch');
  }
  if (typeof removeRecipientSigningPublicKey !== 'string' || removeRecipientSigningPublicKey.trim() === '') {
    throw new TypeError('removeRecipientSigningPublicKey must be a non-empty string');
  }
  const removed = removeRecipientSigningPublicKey.trim();
  if (!currentEpoch.recipientSigningPublicKeys.includes(removed)) {
    const error = new Error('Recipient to remove is not in the current sender-key epoch roster');
    error.code = 'PRIVATE_SENDER_KEY_EPOCH_RECIPIENT_NOT_LISTED';
    throw error;
  }
  if (!Array.isArray(recipientPublicBundles) || recipientPublicBundles.length === 0) {
    throw new TypeError('recipientPublicBundles must be a non-empty array after rotation');
  }
  for (const bundle of recipientPublicBundles) {
    if (bundle.signingPublicKey.trim() === removed) {
      throw new Error('recipientPublicBundles must not include the removed recipient');
    }
  }

  return createPrivateSenderKeyEpoch({
    epoch: currentEpoch.epoch + 1,
    recipientPublicBundles,
    broadcasterEncryptionSecretKey,
    broadcasterEncryptionPublicKey
  });
}

module.exports = {
  wrapSenderKeyForRecipients,
  createPrivateSenderKeyEpoch,
  rotatePrivateSenderKeyEpoch
};