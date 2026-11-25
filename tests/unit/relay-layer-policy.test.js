const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  createRelayLayerPolicy,
  createSignedMediaChunk,
  createReceiverReport,
  DEFAULT_HEADROOM_FACTOR
} = require('../../src/streaming');
const { RENDITION_PROFILE_HD720, resolveRendition } = require('../../src/streaming/rendition-ladder');

function layerBitrateBps(layerId) {
  const row = resolveRendition(RENDITION_PROFILE_HD720, layerId);
  return (row.videoBitrateKbps + row.audioBitrateKbps) * 1000 * DEFAULT_HEADROOM_FACTOR;
}

function testKeys(label) {
  const pair = nacl.sign.keyPair.fromSeed(nacl.hash(naclUtil.decodeUTF8(label)).slice(0, 32));
  return {
    signingSecretKey: pair.secretKey,
    signingPublicKey: naclUtil.encodeBase64(pair.publicKey)
  };
}

describe('relay layer policy', () => {
  test('drops enhancement layers before withholding L0 keyframes', () => {
    const l0Bps = layerBitrateBps('L0');
    const l2Bps = layerBitrateBps('L2');
    const policy = createRelayLayerPolicy({
      profile: RENDITION_PROFILE_HD720,
      floorBps: l0Bps,
      ceilingBps: l2Bps,
      quietGainBps: 50_000,
      initialEstimateBps: l2Bps
    });
    policy.registerChild('child-a', { initialEstimateBps: l2Bps });
    policy.registerChild('child-b', { initialEstimateBps: l2Bps });

    const keys = testKeys('relay-policy');
    const l0Keyframe = createSignedMediaChunk({
      sessionId: 's',
      broadcasterId: 'origin',
      payloadBytes: naclUtil.decodeUTF8('l0-kf'),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      layerId: 'L0',
      profile: RENDITION_PROFILE_HD720,
      keyframe: true
    });
    const l2Chunk = createSignedMediaChunk({
      sessionId: 's',
      broadcasterId: 'origin',
      payloadBytes: naclUtil.decodeUTF8('l2'),
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: keys.signingPublicKey,
      layerId: 'L2',
      profile: RENDITION_PROFILE_HD720
    });

    expect(policy.getChildLayer('child-a')).toBe('L2');
    expect(policy.shouldForwardToChild('child-a', l2Chunk)).toBe(true);

    policy.observeChildReport(
      'child-b',
      createReceiverReport({
        sessionId: 's',
        viewerId: 'child-b',
        layerId: 'L2',
        timestampMs: 1000,
        intervalMs: 1000,
        bytesReceived: Math.floor(l0Bps / 8) - 5000,
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    policy.observeChildReport(
      'child-b',
      createReceiverReport({
        sessionId: 's',
        viewerId: 'child-b',
        layerId: 'L1',
        timestampMs: 1300,
        intervalMs: 300,
        bytesReceived: Math.floor(l0Bps / 8) - 8000,
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    policy.observeChildReport(
      'child-b',
      createReceiverReport({
        sessionId: 's',
        viewerId: 'child-b',
        layerId: 'L1',
        timestampMs: 1550,
        intervalMs: 250,
        bytesReceived: Math.floor(l0Bps / 8) - 12000,
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );

    expect(policy.getChildLayer('child-b')).toBe('L0');
    expect(policy.shouldForwardToChild('child-b', l2Chunk)).toBe(false);
    expect(policy.shouldForwardToChild('child-b', l0Keyframe)).toBe(true);
    expect(policy.getChildLayer('child-a')).toBe('L2');
  });
});