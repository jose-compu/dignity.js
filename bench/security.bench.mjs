import { bench, describe } from 'vitest';
import { require } from './helpers.mjs';

const nacl = require('tweetnacl');
const SlothPermutation = require('../src/security/sloth-vdf');
const VDF = require('../src/security/vdf');
const {
  MessageSecurityService,
  stableStringify
} = require('../src/security/message-security-service');
const {
  exportIdentityMnemonic,
  importIdentityMnemonic
} = require('../src/security/identity-mnemonic');
const { hashVerificationCode } = require('../src/security/verification-code');
const {
  hashReflectiveLogic,
  normalizeFunctionSource
} = require('../src/security/reflective-logic');

function buildNestedPayload(width, depth) {
  if (depth === 0) {
    return { text: 'lorem ipsum dolor sit amet', score: 42, active: true };
  }
  const node = {};
  for (let i = width - 1; i >= 0; i -= 1) {
    node[`key-${i}`] = buildNestedPayload(width, depth - 1);
  }
  node.list = Array.from({ length: width }, (_, i) => i * 3);
  return node;
}

const nestedPayload = buildNestedPayload(6, 3);

describe('stableStringify', () => {
  bench('nested payload (6x3)', () => {
    stableStringify(nestedPayload);
  });
});

describe('Sloth VDF', () => {
  const sloth = new SlothPermutation();
  const challenge = BigInt('0x' + 'a1b2c3d4e5f60718'.repeat(8));
  const steps = BigInt(2);
  const proof = sloth.generateProofVDF(steps, challenge);
  const challengeHex = 'deadbeefcafebabe'.repeat(8);

  bench('generateProofVDF (2 steps)', () => {
    sloth.generateProofVDF(steps, challenge);
  });

  bench('verifyProofVDF (2 steps)', () => {
    sloth.verifyProofVDF(steps, challenge, proof);
  });

  bench('VDF.compute + VDF.verify (1 step)', async () => {
    const result = await VDF.compute(challengeHex, BigInt(1));
    await VDF.verify(challengeHex, BigInt(1), result);
  });
});

describe('MessageSecurityService', () => {
  const securityOptions = {
    appPassword: 'bench-password',
    powEnabled: false,
    signingEnabled: true,
    encryptionEnabled: true
  };
  const alice = new MessageSecurityService({ nodeId: 'alice', options: securityOptions });
  const bob = new MessageSecurityService({ nodeId: 'bob', options: securityOptions });
  alice.registerPeerPublicKey('bob', bob.getPublicKey());
  bob.registerPeerPublicKey('alice', alice.getPublicKey());

  const message = {
    messageType: 'record:update',
    payload: nestedPayload,
    targetId: 'bob'
  };

  bench('secure + decrypt direct message (signed, encrypted)', async () => {
    const envelope = await alice.secureOutgoingMessage(message);
    await bob.decryptIncomingMessage(envelope);
  });
});

describe('identity mnemonic', () => {
  const keyPair = {
    signing: nacl.sign.keyPair.fromSeed(new Uint8Array(32).fill(7)),
    encryption: nacl.box.keyPair.fromSecretKey(new Uint8Array(32).fill(9))
  };

  bench('export + import mnemonic round-trip', async () => {
    const phrase = await exportIdentityMnemonic(keyPair);
    await importIdentityMnemonic(phrase);
  });
});

describe('verification and reflective logic', () => {
  const rules = {
    name: 'chess-move-validator',
    rules: Array.from({ length: 25 }, (_, i) => ({
      field: `field-${i}`,
      min: i,
      max: i * 10,
      required: i % 2 === 0
    }))
  };

  const validators = {
    validateMove(record) {
      const { from, to, piece } = record.data;
      if (!from || !to) {
        return false;
      }
      // pawns can only move forward
      if (piece === 'p' && to[1] <= from[1]) {
        return false;
      }
      return from !== to;
    },
    validateScore: (record) => record.data.points >= 0 && record.data.points <= 1000,
    validateOwner(record, context) {
      return record.ownerId === context.actorId || context.collaborators.includes(context.actorId);
    }
  };

  bench('hashVerificationCode (structured rules)', () => {
    hashVerificationCode(rules, { policy: 'strict' });
  });

  bench('normalizeFunctionSource', () => {
    normalizeFunctionSource(validators.validateMove.toString(), { stripComments: true });
  });

  bench('hashReflectiveLogic (validator object)', () => {
    hashReflectiveLogic(validators, { policy: 'strict' });
  });
});
