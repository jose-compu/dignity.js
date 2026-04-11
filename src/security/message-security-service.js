const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const VDF = require('./vdf');

const DEFAULT_SECURITY_OPTIONS = {
  enabled: true,
  signingEnabled: true,
  encryptionEnabled: true,
  powEnabled: true,
  powTargetMs: 1000,
  appPassword: 'change-this-app-password',
  broadcastPasswords: {},
  resolveBroadcastPassword: null,
  powSteps: 22,
  trustedPeerKeys: {},
  kdfIterations: 100000
};

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function concatBytes(a, b) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

function hash32(bytes) {
  return nacl.hash(bytes).slice(0, 32);
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function utf8ToBytes(value) {
  return naclUtil.decodeUTF8(value);
}

async function deriveBroadcastKey(password, salt, iterations) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;

  if (subtle) {
    const keyMaterial = await subtle.importKey(
      'raw',
      utf8ToBytes(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    return new Uint8Array(bits);
  }

  try {
    const { pbkdf2Sync } = require('crypto');
    return new Uint8Array(pbkdf2Sync(password, Buffer.from(salt), iterations, 32, 'sha256'));
  } catch (_ignored) {
    return hash32(concatBytes(utf8ToBytes(password), salt));
  }
}

function legacyBroadcastKey(password, salt) {
  return hash32(concatBytes(utf8ToBytes(password), salt));
}

function normalizePeerPublicKey(publicKey) {
  if (!publicKey || typeof publicKey !== 'object') {
    throw new Error('Public key must be an object with signingPublicKey and encryptionPublicKey');
  }

  if (!publicKey.signingPublicKey || !publicKey.encryptionPublicKey) {
    throw new Error('Public key object is missing signingPublicKey or encryptionPublicKey');
  }

  return {
    signingPublicKey: publicKey.signingPublicKey,
    encryptionPublicKey: publicKey.encryptionPublicKey
  };
}

class MessageSecurityService {
  constructor({ nodeId, options = {}, now } = {}) {
    if (!nodeId) {
      throw new Error('MessageSecurityService requires nodeId');
    }

    this.nodeId = nodeId;
    this.options = {
      ...DEFAULT_SECURITY_OPTIONS,
      ...options
    };
    this.now = now || (() => Date.now());

    const keyPair = options.keyPair || {
      signing: nacl.sign.keyPair(),
      encryption: nacl.box.keyPair()
    };

    this.signingSecretKey = keyPair.signing.secretKey;
    this.signingPublicKey = keyPair.signing.publicKey;
    this.encryptionSecretKey = keyPair.encryption.secretKey;
    this.encryptionPublicKey = keyPair.encryption.publicKey;

    this.publicKeyBundle = {
      signingPublicKey: naclUtil.encodeBase64(this.signingPublicKey),
      encryptionPublicKey: naclUtil.encodeBase64(this.encryptionPublicKey)
    };

    this.peerPublicKeys = new Map();
    for (const [peerId, peerKey] of Object.entries(this.options.trustedPeerKeys || {})) {
      this.peerPublicKeys.set(peerId, normalizePeerPublicKey(peerKey));
    }

    this.calibratedPowSteps = this.options.powSteps;
  }

  getPublicKey() {
    return { ...this.publicKeyBundle };
  }

  registerPeerPublicKey(peerId, publicKey) {
    this.peerPublicKeys.set(peerId, normalizePeerPublicKey(publicKey));
  }

  resolvePeerPublicKey(peerId, fallbackPublicKey) {
    const trusted = this.peerPublicKeys.get(peerId);
    const fallback = fallbackPublicKey ? normalizePeerPublicKey(fallbackPublicKey) : null;

    if (trusted && fallback) {
      const mismatch =
        trusted.signingPublicKey !== fallback.signingPublicKey ||
        trusted.encryptionPublicKey !== fallback.encryptionPublicKey;

      if (mismatch) {
        throw new Error(`Public key mismatch for peer ${peerId}`);
      }
    }

    return trusted || fallback || null;
  }

  buildEnvelopeBase({ messageType, payload, targetId = null }) {
    return {
      version: 1,
      senderId: this.nodeId,
      senderPublicKey: this.getPublicKey(),
      targetId,
      messageType,
      timestamp: this.now(),
      payload
    };
  }

  async secureOutgoingMessage({ messageType, payload, targetId = null, securityContext = {} }) {
    if (!this.options.enabled) {
      return this.buildEnvelopeBase({ messageType, payload, targetId });
    }

    const envelope = this.buildEnvelopeBase({ messageType, payload, targetId });
    const encryptionInfo = await this.encryptPayload({ payload, targetId, securityContext });
    envelope.payload = encryptionInfo.payload;
    envelope.security = {
      encryption: encryptionInfo.security,
      signing: { enabled: false },
      pow: { enabled: false }
    };

    if (this.options.powEnabled) {
      const pow = await this.generatePow(envelope);
      envelope.security.pow = {
        enabled: true,
        messageHash: pow.messageHash,
        challenge: pow.challenge,
        proof: pow.proof,
        steps: pow.steps,
        durationMs: pow.durationMs
      };
    }

    if (this.options.signingEnabled) {
      const signatureBase = this.canonicalSigningInput(envelope);
      const signature = nacl.sign.detached(
        naclUtil.decodeUTF8(signatureBase),
        this.signingSecretKey
      );

      envelope.security.signing = {
        enabled: true,
        algorithm: 'ed25519',
        signature: naclUtil.encodeBase64(signature)
      };
    }

    return envelope;
  }

  canonicalSigningInput(envelope) {
    return stableStringify({
      version: envelope.version,
      senderId: envelope.senderId,
      senderPublicKey: envelope.senderPublicKey,
      targetId: envelope.targetId,
      messageType: envelope.messageType,
      timestamp: envelope.timestamp,
      payload: envelope.payload,
      security: {
        encryption: envelope.security ? envelope.security.encryption : { enabled: false },
        pow: envelope.security ? envelope.security.pow : { enabled: false }
      }
    });
  }

  canonicalPowInput(envelope) {
    return stableStringify({
      version: envelope.version,
      senderId: envelope.senderId,
      senderPublicKey: envelope.senderPublicKey,
      targetId: envelope.targetId,
      messageType: envelope.messageType,
      timestamp: envelope.timestamp,
      payload: envelope.payload,
      security: {
        encryption: envelope.security ? envelope.security.encryption : { enabled: false }
      }
    });
  }

  computePowMessageHash(envelope) {
    return bytesToHex(hash32(utf8ToBytes(this.canonicalPowInput(envelope))));
  }

  async decryptIncomingMessage(envelope) {
    if (!this.options.enabled) {
      return {
        ignored: false,
        messageType: envelope.messageType,
        senderId: envelope.senderId,
        targetId: envelope.targetId,
        payload: envelope.payload
      };
    }

    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Incoming message is invalid');
    }

    if (envelope.targetId && envelope.targetId !== this.nodeId) {
      return { ignored: true };
    }

    if (envelope.security && envelope.security.pow && envelope.security.pow.enabled && this.options.powEnabled) {
      await this.verifyPow(envelope);
    }

    if (envelope.security && envelope.security.signing && envelope.security.signing.enabled && this.options.signingEnabled) {
      this.verifySignature(envelope);
    }

    const payload = await this.decryptPayload(envelope);

    return {
      ignored: false,
      messageType: envelope.messageType,
      senderId: envelope.senderId,
      targetId: envelope.targetId,
      payload
    };
  }

  resolveBroadcastPassword(scope) {
    const normalizedScope = scope || 'default';

    if (typeof this.options.resolveBroadcastPassword === 'function') {
      const resolved = this.options.resolveBroadcastPassword({
        scope: normalizedScope,
        nodeId: this.nodeId,
        defaultPassword: this.options.appPassword,
        broadcastPasswords: this.options.broadcastPasswords || {}
      });

      if (typeof resolved === 'string' && resolved.length > 0) {
        return resolved;
      }
    }

    const scopePassword = this.options.broadcastPasswords
      ? this.options.broadcastPasswords[normalizedScope]
      : null;

    if (typeof scopePassword === 'string' && scopePassword.length > 0) {
      return scopePassword;
    }

    return this.options.appPassword;
  }

  async encryptPayload({ payload, targetId, securityContext = {} }) {
    if (!this.options.encryptionEnabled) {
      return {
        payload,
        security: {
          enabled: false,
          mode: 'none'
        }
      };
    }

    const plainText = naclUtil.decodeUTF8(JSON.stringify(payload));

    if (targetId) {
      const recipientPublicKey = this.resolvePeerPublicKey(targetId, null);
      if (!recipientPublicKey) {
        throw new Error(`Missing public key for target peer ${targetId}`);
      }

      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const encrypted = nacl.box(
        plainText,
        nonce,
        naclUtil.decodeBase64(recipientPublicKey.encryptionPublicKey),
        this.encryptionSecretKey
      );

      return {
        payload: naclUtil.encodeBase64(encrypted),
        security: {
          enabled: true,
          mode: 'direct',
          nonce: naclUtil.encodeBase64(nonce),
          senderEncryptionPublicKey: this.publicKeyBundle.encryptionPublicKey
        }
      };
    }

    const scope = securityContext.broadcastScope || 'default';
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const salt = nacl.randomBytes(16);
    const password = this.resolveBroadcastPassword(scope);
    const iterations = this.options.kdfIterations || DEFAULT_SECURITY_OPTIONS.kdfIterations;
    const key = await deriveBroadcastKey(password, salt, iterations);
    const encrypted = nacl.secretbox(plainText, nonce, key);

    return {
      payload: naclUtil.encodeBase64(encrypted),
      security: {
        enabled: true,
        mode: 'broadcast',
        scope,
        nonce: naclUtil.encodeBase64(nonce),
        salt: naclUtil.encodeBase64(salt),
        kdf: 'pbkdf2',
        kdfIterations: iterations
      }
    };
  }

  async decryptPayload(envelope) {
    const encryption = envelope.security ? envelope.security.encryption : null;

    if (!encryption || !encryption.enabled || !this.options.encryptionEnabled) {
      return envelope.payload;
    }

    const encryptedBuffer = naclUtil.decodeBase64(envelope.payload);

    if (encryption.mode === 'broadcast') {
      const scope = encryption.scope || 'default';
      const password = this.resolveBroadcastPassword(scope);
      const salt = naclUtil.decodeBase64(encryption.salt);
      const nonce = naclUtil.decodeBase64(encryption.nonce);

      let key;
      if (encryption.kdf === 'pbkdf2') {
        const iterations = encryption.kdfIterations || DEFAULT_SECURITY_OPTIONS.kdfIterations;
        key = await deriveBroadcastKey(password, salt, iterations);
      } else {
        key = legacyBroadcastKey(password, salt);
      }

      const decrypted = nacl.secretbox.open(encryptedBuffer, nonce, key);

      if (!decrypted) {
        throw new Error('Unable to decrypt broadcast payload');
      }

      return JSON.parse(naclUtil.encodeUTF8(decrypted));
    }

    if (encryption.mode === 'direct') {
      const senderPublicKey = naclUtil.decodeBase64(encryption.senderEncryptionPublicKey);
      const nonce = naclUtil.decodeBase64(encryption.nonce);
      const decrypted = nacl.box.open(
        encryptedBuffer,
        nonce,
        senderPublicKey,
        this.encryptionSecretKey
      );

      if (!decrypted) {
        throw new Error('Unable to decrypt direct payload');
      }

      return JSON.parse(naclUtil.encodeUTF8(decrypted));
    }

    throw new Error(`Unsupported encryption mode: ${encryption.mode}`);
  }

  verifySignature(envelope) {
    const senderPublicKey = this.resolvePeerPublicKey(envelope.senderId, envelope.senderPublicKey);
    if (!senderPublicKey) {
      throw new Error(`Missing public key for sender ${envelope.senderId}`);
    }

    const signatureBase = this.canonicalSigningInput(envelope);
    const isValid = nacl.sign.detached.verify(
      naclUtil.decodeUTF8(signatureBase),
      naclUtil.decodeBase64(envelope.security.signing.signature),
      naclUtil.decodeBase64(senderPublicKey.signingPublicKey)
    );

    if (!isValid) {
      const error = new Error(`Invalid signature for sender ${envelope.senderId}`);
      error.code = 'INVALID_SIGNATURE';
      throw error;
    }

    return true;
  }

  async determinePowSteps() {
    if (typeof this.calibratedPowSteps === 'bigint') {
      return this.calibratedPowSteps;
    }

    if (typeof this.options.powSteps === 'number') {
      this.calibratedPowSteps = BigInt(Math.max(1, this.options.powSteps));
      return this.calibratedPowSteps;
    }

    const targetMs = Math.max(1, Number(this.options.powTargetMs || 1));
    const probeChallenge = bytesToHex(hash32(utf8ToBytes(`probe:${this.nodeId}:${this.now()}`)));
    const probeSteps = BigInt(2);

    const start = this.now();
    await VDF.compute(probeChallenge, probeSteps);
    const elapsedMs = Math.max(1, this.now() - start);

    const scaled = Math.max(1, Math.round((targetMs / elapsedMs) * Number(probeSteps)));
    this.calibratedPowSteps = BigInt(scaled);
    return this.calibratedPowSteps;
  }

  async generatePow(envelope) {
    const messageHash = this.computePowMessageHash(envelope);
    const challenge = messageHash;
    const steps = await this.determinePowSteps();
    const start = this.now();
    const proof = await VDF.compute(challenge, steps);
    const durationMs = this.now() - start;

    return {
      messageHash,
      challenge,
      proof,
      steps: steps.toString(),
      durationMs
    };
  }

  async verifyPow(envelope) {
    const expectedMessageHash = this.computePowMessageHash(envelope);
    const pow = envelope.security.pow;

    if (
      !pow ||
      !pow.messageHash ||
      pow.messageHash !== expectedMessageHash ||
      pow.challenge !== pow.messageHash
    ) {
      const error = new Error('PoW challenge mismatch');
      error.code = 'INVALID_POW';
      throw error;
    }

    const verified = await VDF.verify(pow.messageHash, BigInt(pow.steps), pow.proof);
    if (!verified) {
      const error = new Error('PoW verification failed');
      error.code = 'INVALID_POW';
      throw error;
    }

    return true;
  }
}

module.exports = {
  MessageSecurityService,
  stableStringify,
  deriveBroadcastKey,
  legacyBroadcastKey,
  DEFAULT_SECURITY_OPTIONS
};
