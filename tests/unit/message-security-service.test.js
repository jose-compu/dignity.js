const { MessageSecurityService, deriveBroadcastKey, legacyBroadcastKey } = require('../../src/security/message-security-service');
const naclUtil = require('tweetnacl-util');
const nacl = require('tweetnacl');

describe('MessageSecurityService', () => {
  test('encrypts and decrypts broadcast messages with shared password', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'hello room' }
    });

    const received = await bob.decryptIncomingMessage(envelope);
    expect(received.payload).toEqual({ text: 'hello room' });
  });

  test('rejects broadcast decryption with wrong app password', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared-a', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared-b', powTargetMs: 5 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'hello room' }
    });

    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow();
  });

  test('encrypts direct messages using recipient public key', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    alice.registerPeerPublicKey('bob', bob.getPublicKey());
    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'dm',
      targetId: 'bob',
      payload: { text: 'secret' }
    });

    const received = await bob.decryptIncomingMessage(envelope);
    expect(received.payload).toEqual({ text: 'secret' });
  });

  test('ignores direct messages for other peers', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const carol = new MessageSecurityService({
      nodeId: 'carol',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    alice.registerPeerPublicKey('bob', bob.getPublicKey());
    bob.registerPeerPublicKey('alice', alice.getPublicKey());
    carol.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'dm',
      targetId: 'bob',
      payload: { text: 'bob only' }
    });

    const ignored = await carol.decryptIncomingMessage(envelope);
    expect(ignored.ignored).toBe(true);
  });

  test('supports disabling signing, encryption and pow', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        enabled: true,
        signingEnabled: false,
        encryptionEnabled: false,
        powEnabled: false,
        appPassword: 'shared'
      }
    });

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'event',
      payload: { plain: true }
    });

    expect(envelope.payload).toEqual({ plain: true });
    expect(envelope.security.encryption.enabled).toBe(false);
    expect(envelope.security.signing.enabled).toBe(false);
    expect(envelope.security.pow.enabled).toBe(false);
  });

  test('rejects tampered signatures', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'hello' }
    });

    envelope.payload = envelope.payload.slice(0, -4) + 'AAAA';

    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow();
  });

  test('supports different broadcast passwords per scope', async () => {
    const teamPasswords = {
      'team:red': 'red-secret',
      'team:blue': 'blue-secret'
    };

    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'fallback', broadcastPasswords: teamPasswords, powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'fallback', broadcastPasswords: teamPasswords, powTargetMs: 5 }
    });
    const carol = new MessageSecurityService({
      nodeId: 'carol',
      options: {
        appPassword: 'fallback',
        broadcastPasswords: { 'team:red': 'wrong-secret' },
        powTargetMs: 5
      }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());
    carol.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'team-update',
      payload: { squad: 'red', objective: 'capture-flag' },
      securityContext: { broadcastScope: 'team:red' }
    });

    const bobMessage = await bob.decryptIncomingMessage(envelope);
    expect(bobMessage.payload).toEqual({ squad: 'red', objective: 'capture-flag' });
    expect(envelope.security.encryption.scope).toBe('team:red');

    await expect(carol.decryptIncomingMessage(envelope)).rejects.toThrow('Unable to decrypt broadcast payload');
  });

  test('binds PoW proof to canonical message hash', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'hello hash-bound pow' }
    });

    expect(envelope.security.pow.messageHash).toBeDefined();
    expect(envelope.security.pow.challenge).toBe(envelope.security.pow.messageHash);

    const received = await bob.decryptIncomingMessage(envelope);
    expect(received.payload).toEqual({ text: 'hello hash-bound pow' });
  });

  test('constructor requires nodeId', () => {
    expect(() => new MessageSecurityService({})).toThrow('requires nodeId');
  });

  test('resolvePeerPublicKey detects mismatch between trusted and fallback', () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    alice.registerPeerPublicKey('bob', bob.getPublicKey());

    const mismatchedKey = {
      signingPublicKey: 'AAAA',
      encryptionPublicKey: 'BBBB'
    };

    expect(() => alice.resolvePeerPublicKey('bob', mismatchedKey)).toThrow('Public key mismatch');
  });

  test('resolvePeerPublicKey returns fallback when no trusted key', () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    const resolved = alice.resolvePeerPublicKey('bob', bob.getPublicKey());
    expect(resolved).toEqual(bob.getPublicKey());
  });

  test('resolvePeerPublicKey returns null when no key at all', () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    expect(alice.resolvePeerPublicKey('unknown', null)).toBeNull();
  });

  test('passes through payload when security is disabled', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { enabled: false, appPassword: 'shared' }
    });

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'event',
      payload: { raw: true }
    });

    expect(envelope.payload).toEqual({ raw: true });
    expect(envelope.security).toBeUndefined();

    const result = await alice.decryptIncomingMessage(envelope);
    expect(result.payload).toEqual({ raw: true });
  });

  test('decryptIncomingMessage rejects invalid envelope', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    await expect(alice.decryptIncomingMessage(null)).rejects.toThrow('invalid');
  });

  test('resolveBroadcastPassword uses custom resolver when provided', () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        appPassword: 'fallback',
        resolveBroadcastPassword: ({ scope }) => scope === 'vip' ? 'vip-secret' : null,
        powTargetMs: 5
      }
    });

    expect(alice.resolveBroadcastPassword('vip')).toBe('vip-secret');
    expect(alice.resolveBroadcastPassword('other')).toBe('fallback');
  });

  test('determinePowSteps returns existing bigint calibration', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powSteps: 10 }
    });

    alice.calibratedPowSteps = 42n;
    const steps = await alice.determinePowSteps();
    expect(steps).toBe(42n);
  });

  test('rejects PoW when messageHash is tampered', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'pow tamper check' }
    });

    const originalHash = envelope.security.pow.messageHash;
    envelope.security.pow.messageHash = `${originalHash.slice(0, -1)}${originalHash.endsWith('0') ? '1' : '0'}`;

    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow('PoW challenge mismatch');
  });

  test('normalizePeerPublicKey rejects non-object input', () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    expect(() => alice.registerPeerPublicKey('bad', 'string-key')).toThrow('must be an object');
  });

  test('normalizePeerPublicKey rejects missing fields', () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    expect(() => alice.registerPeerPublicKey('bad', { signingPublicKey: 'x' })).toThrow('missing');
  });

  test('encryptPayload throws for unknown target peer', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    await expect(
      alice.secureOutgoingMessage({
        messageType: 'dm',
        targetId: 'stranger',
        payload: { text: 'hi' }
      })
    ).rejects.toThrow('Missing public key for target peer');
  });

  test('decryptPayload returns raw payload when encryption disabled', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        enabled: true,
        encryptionEnabled: false,
        signingEnabled: false,
        powEnabled: false,
        appPassword: 'shared'
      }
    });

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'event',
      payload: { raw: true }
    });

    const result = await alice.decryptIncomingMessage(envelope);
    expect(result.payload).toEqual({ raw: true });
  });

  test('decryptPayload throws for unsupported encryption mode', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    const fakeEnvelope = {
      version: 1,
      senderId: 'x',
      senderPublicKey: alice.getPublicKey(),
      messageType: 'event',
      timestamp: Date.now(),
      payload: 'AAAA',
      security: {
        encryption: { enabled: true, mode: 'unknown' },
        signing: { enabled: false },
        pow: { enabled: false }
      }
    };

    await expect(alice.decryptIncomingMessage(fakeEnvelope)).rejects.toThrow('Unsupported encryption mode');
  });

  test('verifySignature throws when sender public key is missing', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        enabled: true,
        signingEnabled: true,
        encryptionEnabled: false,
        powEnabled: false,
        appPassword: 'shared'
      }
    });

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'event',
      payload: { x: 1 }
    });

    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: {
        enabled: true,
        signingEnabled: true,
        encryptionEnabled: false,
        powEnabled: false,
        appPassword: 'shared'
      }
    });

    envelope.senderPublicKey = null;
    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow('Missing public key for sender');
  });

  test('determinePowSteps calibrates via probe when powSteps is not a number', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powSteps: undefined, powTargetMs: 50 }
    });
    alice.calibratedPowSteps = undefined;

    const steps = await alice.determinePowSteps();
    expect(typeof steps).toBe('bigint');
    expect(steps >= 1n).toBe(true);
  });

  test('constructor loads trustedPeerKeys from options', () => {
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        appPassword: 'shared',
        powTargetMs: 5,
        trustedPeerKeys: { bob: bob.getPublicKey() }
      }
    });

    expect(alice.resolvePeerPublicKey('bob', null)).toEqual(bob.getPublicKey());
  });

  test('verifyPow throws when VDF verification fails', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powSteps: 2 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powSteps: 2 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'vdf fail test' }
    });

    envelope.security.pow.proof = 'deadbeef';

    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow();
  });

  test('stableStringify handles arrays', async () => {
    const { stableStringify } = require('../../src/security/message-security-service');
    expect(stableStringify([1, 'a', null])).toBe('[1,"a",null]');
  });

  test('broadcast encryption uses PBKDF2 KDF by default', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5 }
    });

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'pbkdf2 test' }
    });

    expect(envelope.security.encryption.kdf).toBe('pbkdf2');
    expect(envelope.security.encryption.kdfIterations).toBe(100000);
  });

  test('custom kdfIterations is respected', async () => {
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: { appPassword: 'shared', powTargetMs: 5, kdfIterations: 5000 }
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: { appPassword: 'shared', powTargetMs: 5, kdfIterations: 5000 }
    });

    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'chat',
      payload: { text: 'custom iterations' }
    });

    expect(envelope.security.encryption.kdfIterations).toBe(5000);

    const received = await bob.decryptIncomingMessage(envelope);
    expect(received.payload).toEqual({ text: 'custom iterations' });
  });

  test('decrypts legacy messages without kdf field using single-hash fallback', async () => {
    const password = 'shared-legacy';
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: {
        appPassword: password,
        signingEnabled: false,
        powEnabled: false
      }
    });

    const payload = { text: 'from old version' };
    const plainText = naclUtil.decodeUTF8(JSON.stringify(payload));
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const salt = nacl.randomBytes(16);
    const key = legacyBroadcastKey(password, salt);
    const encrypted = nacl.secretbox(plainText, nonce, key);

    const legacyEnvelope = {
      version: 1,
      senderId: 'old-peer',
      senderPublicKey: alice.getPublicKey(),
      targetId: null,
      messageType: 'chat',
      timestamp: Date.now(),
      payload: naclUtil.encodeBase64(encrypted),
      security: {
        encryption: {
          enabled: true,
          mode: 'broadcast',
          scope: 'default',
          nonce: naclUtil.encodeBase64(nonce),
          salt: naclUtil.encodeBase64(salt)
        },
        signing: { enabled: false },
        pow: { enabled: false }
      }
    };

    const received = await alice.decryptIncomingMessage(legacyEnvelope);
    expect(received.payload).toEqual({ text: 'from old version' });
  });

  test('deriveBroadcastKey produces 32-byte key', async () => {
    const salt = nacl.randomBytes(16);
    const key = await deriveBroadcastKey('test-password', salt, 1000);

    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBe(32);
  });

  test('deriveBroadcastKey uses Node crypto when subtle is unavailable', async () => {
    const originalCrypto = globalThis.crypto;
    globalThis.crypto = { subtle: undefined };

    try {
      const salt = new Uint8Array(16).fill(7);
      const key = await deriveBroadcastKey('node-password', salt, 1000);
      expect(key).toHaveLength(32);
      expect(Buffer.from(key).equals(Buffer.from(legacyBroadcastKey('node-password', salt)))).toBe(false);
    } finally {
      globalThis.crypto = originalCrypto;
    }
  });

  test('deriveBroadcastKey falls back to legacy hash when pbkdf2 is unavailable', async () => {
    const crypto = require('crypto');
    const originalCrypto = globalThis.crypto;
    const pbkdf2Spy = jest.spyOn(crypto, 'pbkdf2Sync').mockImplementation(() => {
      throw new Error('pbkdf2 unavailable');
    });
    globalThis.crypto = { subtle: undefined };

    try {
      const salt = new Uint8Array(16).fill(3);
      const key = await deriveBroadcastKey('fallback-password', salt, 1000);
      expect(Buffer.from(key).equals(Buffer.from(legacyBroadcastKey('fallback-password', salt)))).toBe(true);
    } finally {
      pbkdf2Spy.mockRestore();
      globalThis.crypto = originalCrypto;
    }
  });

  test('decryptPayload throws when direct ciphertext cannot be opened', async () => {
    const disabledPow = {
      appPassword: 'shared',
      powEnabled: false,
      signingEnabled: false
    };
    const alice = new MessageSecurityService({
      nodeId: 'alice',
      options: disabledPow
    });
    const bob = new MessageSecurityService({
      nodeId: 'bob',
      options: disabledPow
    });

    alice.registerPeerPublicKey('bob', bob.getPublicKey());
    bob.registerPeerPublicKey('alice', alice.getPublicKey());

    const envelope = await alice.secureOutgoingMessage({
      messageType: 'dm',
      targetId: 'bob',
      payload: { text: 'secret' }
    });

    envelope.payload = envelope.payload.slice(0, -4).concat('XXXX');

    await expect(bob.decryptIncomingMessage(envelope)).rejects.toThrow('Unable to decrypt direct payload');
  });

  test('deriveBroadcastKey differs from legacy single-hash', async () => {
    const salt = nacl.randomBytes(16);
    const pbkdf2Key = await deriveBroadcastKey('same-password', salt, 1000);
    const legacyKey = legacyBroadcastKey('same-password', salt);

    expect(Buffer.from(pbkdf2Key).equals(Buffer.from(legacyKey))).toBe(false);
  });
});
