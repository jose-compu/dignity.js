const { MessageSecurityService } = require('../../src/security/message-security-service');

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
});
