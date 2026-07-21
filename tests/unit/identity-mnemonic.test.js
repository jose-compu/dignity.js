const nacl = require('tweetnacl');

// Ensure Web Crypto exists for runtimes where Jest/Node omit globalThis.crypto.subtle
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  const { webcrypto } = require('crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true
  });
}

const {
  exportIdentityMnemonic,
  importIdentityMnemonic,
  exportIdentityMnemonicEncrypted,
  importIdentityMnemonicEncrypted,
  normalizeMnemonicPhrase,
  MNEMONIC_WORD_COUNT
} = require('../../src/security/identity-mnemonic');
const { keyPairToPublicBundle, deriveKeyPairFromCredentials } = require('../../src/security/derive-key-pair');

function freshKeyPair() {
  return {
    signing: nacl.sign.keyPair(),
    encryption: nacl.box.keyPair()
  };
}

describe('identity mnemonic (#130)', () => {
  test('round-trips a random keyPair through a 48-word BIP39-style phrase', async () => {
    const keyPair = freshKeyPair();
    const phrase = await exportIdentityMnemonic(keyPair);
    const words = phrase.split(' ');

    expect(words).toHaveLength(MNEMONIC_WORD_COUNT);
    expect(new Set(words).size).toBeGreaterThan(30);

    const restored = await importIdentityMnemonic(phrase);
    expect(keyPairToPublicBundle(restored)).toEqual(keyPairToPublicBundle(keyPair));
    expect(Array.from(restored.signing.secretKey)).toEqual(Array.from(keyPair.signing.secretKey));
    expect(Array.from(restored.encryption.secretKey)).toEqual(Array.from(keyPair.encryption.secretKey));
  });

  test('round-trips credential-derived keyPairs', async () => {
    const keyPair = await deriveKeyPairFromCredentials({
      username: 'alice',
      password: 'correct-horse',
      kdfIterations: 1000
    });

    const phrase = await exportIdentityMnemonic(keyPair);
    const restored = await importIdentityMnemonic(phrase);
    expect(keyPairToPublicBundle(restored)).toEqual(keyPairToPublicBundle(keyPair));
  });

  test('normalizes pasted phrases (case, whitespace, NFC)', async () => {
    const keyPair = freshKeyPair();
    const phrase = await exportIdentityMnemonic(keyPair);
    const words = phrase.split(' ');
    const messy = `  ${words.join('  ').toUpperCase()}  `;

    expect(normalizeMnemonicPhrase(messy)).toEqual(words);

    const restored = await importIdentityMnemonic(messy);
    expect(keyPairToPublicBundle(restored)).toEqual(keyPairToPublicBundle(keyPair));
  });

  test('rejects truncated and checksum-altered phrases', async () => {
    const keyPair = freshKeyPair();
    const words = (await exportIdentityMnemonic(keyPair)).split(' ');

    await expect(importIdentityMnemonic(words.slice(0, 24).join(' '))).rejects.toThrow(
      'Recovery phrase must contain exactly 48 words'
    );

    await expect(
      importIdentityMnemonic([...words.slice(0, 47), 'zebra'].join(' '))
    ).rejects.toThrow('Invalid recovery phrase checksum');

    await expect(
      importIdentityMnemonic([...words.slice(0, 47), 'notaword'].join(' '))
    ).rejects.toThrow('Unknown recovery word');
  });

  test('rejects invalid keyPair shapes on export', async () => {
    await expect(exportIdentityMnemonic(null)).rejects.toThrow('requires a keyPair');
    await expect(exportIdentityMnemonic({ signing: {}, encryption: {} })).rejects.toThrow(
      'requires a keyPair'
    );
  });

  test('passphrase-encrypted export/import round-trips', async () => {
    const keyPair = freshKeyPair();
    const encrypted = await exportIdentityMnemonicEncrypted(keyPair, {
      passphrase: 'vault-pass',
      kdfIterations: 1000
    });

    expect(encrypted.startsWith('dignity-mnemonic-enc-v1:')).toBe(true);

    const restored = await importIdentityMnemonicEncrypted(encrypted, {
      passphrase: 'vault-pass'
    });
    expect(keyPairToPublicBundle(restored)).toEqual(keyPairToPublicBundle(keyPair));
  });

  test('encrypted import rejects wrong passphrase', async () => {
    const keyPair = freshKeyPair();
    const encrypted = await exportIdentityMnemonicEncrypted(keyPair, {
      passphrase: 'right-pass',
      kdfIterations: 1000
    });

    await expect(
      importIdentityMnemonicEncrypted(encrypted, { passphrase: 'wrong-pass' })
    ).rejects.toThrow('Failed to decrypt identity mnemonic');
  });

  test('encrypted helpers require passphrase', async () => {
    const keyPair = freshKeyPair();
    await expect(exportIdentityMnemonicEncrypted(keyPair, {})).rejects.toThrow('require passphrase');
    await expect(importIdentityMnemonicEncrypted('x', {})).rejects.toThrow('require passphrase');
  });
});
