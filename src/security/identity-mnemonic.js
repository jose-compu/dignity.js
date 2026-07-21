const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const BIP39_ENGLISH = require('./bip39-english');
const { deriveBroadcastKey, DEFAULT_SECURITY_OPTIONS } = require('./message-security-service');

const EXPORT_PAYLOAD_LENGTH = 64;
const MNEMONIC_WORD_COUNT = 48;
const ENCRYPTED_KIND = 'dignity-identity-mnemonic-v1';
const ENCRYPTED_PREFIX = 'dignity-mnemonic-enc-v1:';
const WORD_INDEX = new Map(BIP39_ENGLISH.map((word, index) => [word, index]));

function bytesToBinary(bytes) {
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, '0')).join('');
}

function binaryToBytes(binary) {
  if (binary.length % 8 !== 0) {
    throw new Error('Invalid mnemonic binary length');
  }
  const bytes = new Uint8Array(binary.length / 8);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = parseInt(binary.slice(index * 8, (index + 1) * 8), 2);
  }
  return bytes;
}

async function sha256(bytes) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) {
    throw new Error('SHA-256 requires Web Crypto (crypto.subtle)');
  }
  return new Uint8Array(await subtle.digest('SHA-256', bytes));
}

function normalizeUnicode(value) {
  const text = String(value || '');
  return typeof text.normalize === 'function' ? text.normalize('NFC') : text;
}

function normalizeMnemonicPhrase(phrase) {
  return normalizeUnicode(phrase)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function assertKeyPair(keyPair) {
  if (
    !keyPair
    || !keyPair.signing
    || !keyPair.encryption
    || !(keyPair.signing.secretKey instanceof Uint8Array)
    || !(keyPair.encryption.secretKey instanceof Uint8Array)
  ) {
    throw new Error('exportIdentityMnemonic requires a keyPair with signing and encryption secret keys');
  }

  if (keyPair.signing.secretKey.length < 32 || keyPair.encryption.secretKey.length !== 32) {
    throw new Error('exportIdentityMnemonic requires 32-byte Ed25519 seed and Curve25519 secret');
  }
}

function exportPayloadFromKeyPair(keyPair) {
  assertKeyPair(keyPair);
  const payload = new Uint8Array(EXPORT_PAYLOAD_LENGTH);
  payload.set(keyPair.signing.secretKey.slice(0, 32), 0);
  payload.set(keyPair.encryption.secretKey, 32);
  return payload;
}

function keyPairFromExportPayload(payload) {
  if (!(payload instanceof Uint8Array) || payload.length !== EXPORT_PAYLOAD_LENGTH) {
    throw new Error('Invalid identity export payload');
  }

  return {
    signing: nacl.sign.keyPair.fromSeed(payload.slice(0, 32)),
    encryption: nacl.box.keyPair.fromSecretKey(payload.slice(32, 64))
  };
}

async function encodeMnemonicPhrase(payload) {
  if (!(payload instanceof Uint8Array) || payload.length !== EXPORT_PAYLOAD_LENGTH) {
    throw new Error('Invalid identity export payload');
  }

  const entropyBits = payload.length * 8;
  const digest = await sha256(payload);
  const checksumBits = bytesToBinary(digest).slice(0, entropyBits / 32);
  const bits = `${bytesToBinary(payload)}${checksumBits}`;
  const words = [];

  for (let index = 0; index < bits.length; index += 11) {
    const wordIndex = parseInt(bits.slice(index, index + 11), 2);
    const word = BIP39_ENGLISH[wordIndex];
    if (!word) {
      throw new Error('Failed to encode identity mnemonic');
    }
    words.push(word);
  }

  return words;
}

async function decodeMnemonicPhrase(wordsOrPhrase) {
  const normalized = Array.isArray(wordsOrPhrase)
    ? normalizeMnemonicPhrase(wordsOrPhrase.join(' '))
    : normalizeMnemonicPhrase(wordsOrPhrase);

  if (normalized.length !== MNEMONIC_WORD_COUNT) {
    throw new Error(`Recovery phrase must contain exactly ${MNEMONIC_WORD_COUNT} words`);
  }

  let bits = '';
  for (const word of normalized) {
    const wordIndex = WORD_INDEX.get(word);
    if (wordIndex === undefined) {
      throw new Error(`Unknown recovery word: ${word}`);
    }
    bits += wordIndex.toString(2).padStart(11, '0');
  }

  const entropyBits = EXPORT_PAYLOAD_LENGTH * 8;
  const checksumBits = entropyBits / 32;
  const entropyBinary = bits.slice(0, entropyBits);
  const checksumBinary = bits.slice(entropyBits, entropyBits + checksumBits);
  const payload = binaryToBytes(entropyBinary);
  const digest = await sha256(payload);
  const expectedChecksum = bytesToBinary(digest).slice(0, checksumBits);

  if (checksumBinary !== expectedChecksum) {
    throw new Error('Invalid recovery phrase checksum');
  }

  return payload;
}

/**
 * Encode signing seed (32) + encryption secret (32) as a BIP39-style 48-word phrase.
 * Anyone with the phrase can reconstruct the full identity keyPair.
 */
async function exportIdentityMnemonic(keyPair) {
  const words = await encodeMnemonicPhrase(exportPayloadFromKeyPair(keyPair));
  return words.join(' ');
}

/**
 * Restore a keyPair from a BIP39-style 48-word recovery phrase.
 * Normalizes case, whitespace, and NFC before decoding.
 */
async function importIdentityMnemonic(phrase) {
  const payload = await decodeMnemonicPhrase(phrase);
  return keyPairFromExportPayload(payload);
}

function resolveEncryptedPassphrase(options = {}) {
  const passphrase = options.passphrase;
  if (!passphrase || typeof passphrase !== 'string') {
    throw new Error('Encrypted mnemonic helpers require passphrase');
  }
  return passphrase;
}

function resolveKdfIterations(options = {}) {
  if (typeof options.kdfIterations === 'number') {
    if (!Number.isInteger(options.kdfIterations) || options.kdfIterations < 1) {
      throw new Error('kdfIterations must be a positive integer');
    }
    return options.kdfIterations;
  }
  return DEFAULT_SECURITY_OPTIONS.kdfIterations;
}

/**
 * Passphrase-encrypted backup of the same 64-byte identity payload.
 * Returns a compact string suitable for password-manager storage.
 */
async function exportIdentityMnemonicEncrypted(keyPair, options = {}) {
  const passphrase = resolveEncryptedPassphrase(options);
  const kdfIterations = resolveKdfIterations(options);
  const payload = exportPayloadFromKeyPair(keyPair);
  const salt = nacl.randomBytes(16);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const key = await deriveBroadcastKey(passphrase, salt, kdfIterations);
  const ciphertext = nacl.secretbox(payload, nonce, key);

  if (!ciphertext) {
    throw new Error('Failed to encrypt identity mnemonic payload');
  }

  const envelope = {
    kind: ENCRYPTED_KIND,
    kdfIterations,
    salt: naclUtil.encodeBase64(salt),
    nonce: naclUtil.encodeBase64(nonce),
    ciphertext: naclUtil.encodeBase64(ciphertext)
  };

  return `${ENCRYPTED_PREFIX}${naclUtil.encodeBase64(naclUtil.decodeUTF8(JSON.stringify(envelope)))}`;
}

/**
 * Decrypt a passphrase-protected identity mnemonic blob back to a keyPair.
 */
async function importIdentityMnemonicEncrypted(encrypted, options = {}) {
  const passphrase = resolveEncryptedPassphrase(options);
  if (!encrypted || typeof encrypted !== 'string') {
    throw new Error('importIdentityMnemonicEncrypted requires an encrypted blob string');
  }

  let json;
  if (encrypted.startsWith(ENCRYPTED_PREFIX)) {
    json = naclUtil.encodeUTF8(naclUtil.decodeBase64(encrypted.slice(ENCRYPTED_PREFIX.length)));
  } else {
    json = encrypted;
  }

  let envelope;
  try {
    envelope = JSON.parse(json);
  } catch (_error) {
    throw new Error('Invalid encrypted identity mnemonic blob');
  }

  if (!envelope || envelope.kind !== ENCRYPTED_KIND) {
    throw new Error('Unsupported encrypted identity mnemonic kind');
  }

  const salt = naclUtil.decodeBase64(envelope.salt);
  const nonce = naclUtil.decodeBase64(envelope.nonce);
  const ciphertext = naclUtil.decodeBase64(envelope.ciphertext);
  const kdfIterations = typeof envelope.kdfIterations === 'number'
    ? envelope.kdfIterations
    : DEFAULT_SECURITY_OPTIONS.kdfIterations;
  const key = await deriveBroadcastKey(passphrase, salt, kdfIterations);
  const payload = nacl.secretbox.open(ciphertext, nonce, key);

  if (!payload) {
    throw new Error('Failed to decrypt identity mnemonic (wrong passphrase or tampered blob)');
  }

  return keyPairFromExportPayload(payload);
}

module.exports = {
  EXPORT_PAYLOAD_LENGTH,
  MNEMONIC_WORD_COUNT,
  ENCRYPTED_KIND,
  ENCRYPTED_PREFIX,
  normalizeMnemonicPhrase,
  encodeMnemonicPhrase,
  decodeMnemonicPhrase,
  exportIdentityMnemonic,
  importIdentityMnemonic,
  exportIdentityMnemonicEncrypted,
  importIdentityMnemonicEncrypted
};
