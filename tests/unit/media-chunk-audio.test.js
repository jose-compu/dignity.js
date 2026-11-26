const { createSignedMediaChunk, verifyMediaChunk, AUDIO_LAYER_ID, resolveAudioRendition } = require('../../src');
const { assertLayerMatchesRendition } = require('../../src/streaming/media-chunk');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

function keys() {
  const signing = nacl.sign.keyPair();
  return {
    signingSecretKey: signing.secretKey,
    signingPublicKey: naclUtil.encodeBase64(signing.publicKey)
  };
}

describe('audio media chunks', () => {
  test('signed A0 chunk verifies with audio rendition', () => {
    const k = keys();
    const chunk = createSignedMediaChunk({
      sessionId: 's',
      broadcasterId: 'b',
      ...k,
      layerId: AUDIO_LAYER_ID,
      profile: 'hd720',
      keyframe: true,
      timestampMs: 0,
      mimeType: 'audio/webm;codecs=opus',
      payloadBytes: new Uint8Array([9]),
      rendition: resolveAudioRendition('hd720')
    });
    expect(chunk.layerId).toBe('A0');
    expect(verifyMediaChunk(chunk, 's')).toBe(true);
    assertLayerMatchesRendition(AUDIO_LAYER_ID, { ...chunk.rendition, layerId: AUDIO_LAYER_ID });
  });

  test('assertLayerMatchesRendition rejects bad audio rendition', () => {
    expect(() =>
      assertLayerMatchesRendition(AUDIO_LAYER_ID, {
        profile: 'hd720',
        layerId: AUDIO_LAYER_ID,
        width: 0,
        height: 0,
        videoBitrateKbps: 0,
        audioBitrateKbps: 999
      })
    ).toThrow();
  });
});