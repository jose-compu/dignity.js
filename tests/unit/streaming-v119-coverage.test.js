const {
  depacketizeH264Rtp,
  depacketizeOpusRtp,
  parseRtpHeader,
  createWhipRtpFrameAssembler,
  createMsePlayer,
  detectMseSupport,
  MseNotSupportedError,
  decodeRtcpCongestionFeedback,
  encodeRtcpCongestionFeedback,
  rfc8888MetricsToReceiverReports,
  createWebCodecsAudioDecoder,
  createSignedMediaChunk,
  verifyMediaChunk,
  resolveAudioRendition,
  AUDIO_LAYER_ID,
  selectVideoEncoderConfig,
  selectAudioEncoderConfig,
  WebCodecsNotSupportedError,
  createBrowserCaptureSource,
  detectWebCodecsSupport
} = require('../../src');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { readFileSync } = require('fs');
const { join } = require('path');

function signingKeys() {
  const signing = nacl.sign.keyPair();
  return {
    signingSecretKey: signing.secretKey,
    signingPublicKey: naclUtil.encodeBase64(signing.publicKey)
  };
}

describe('streaming v1.19 branch coverage', () => {
  test('rtp depacketizer handles STAP-A and invalid packets', () => {
    const stapPayload = new Uint8Array([
      24,
      0,
      3,
      0x41,
      0x9a,
      0x10,
      0,
      2,
      0x42,
      0x01
    ]);
    const stap = depacketizeH264Rtp(stapPayload);
    expect(stap).not.toBeNull();
    expect(stap.accessUnit.length).toBeGreaterThan(8);
    expect(depacketizeH264Rtp(new Uint8Array([]))).toBeNull();
    expect(parseRtpHeader(new Uint8Array([0]))).toBeNull();
  });

  test('rtp FU-A reassembles split NAL', () => {
    const fu = [];
    const start = new Uint8Array([0x7c, 0x85, 0x88, 0x84, 0x11]);
    expect(depacketizeH264Rtp(start, fu)).toBeNull();
    const mid = new Uint8Array([0x7c, 0x05, 0x22, 0x33]);
    expect(depacketizeH264Rtp(mid, fu)).toBeNull();
    const end = new Uint8Array([0x7c, 0x45, 0x44]);
    const done = depacketizeH264Rtp(end, fu);
    expect(done).not.toBeNull();
    expect(done.accessUnit[4]).toBeDefined();
  });

  test('mse player handles QuotaExceededError and close', async () => {
    class ErrBuffer {
      constructor() {
        this.updating = false;
        this.buffered = { length: 1, start: () => 0, end: () => 2 };
        this.mode = 'segments';
      }
      addEventListener(evt, fn) {
        this._fn = fn;
      }
      appendBuffer() {
        const err = new Error('quota');
        err.name = 'QuotaExceededError';
        throw err;
      }
      remove() {}
    }
    class Ms {
      static isTypeSupported() {
        return true;
      }
      constructor() {
        this.readyState = 'open';
      }
      addEventListener(evt, fn) {
        if (evt === 'sourceopen') {
          setTimeout(fn, 0);
        }
      }
      addSourceBuffer() {
        return new ErrBuffer();
      }
      endOfStream() {}
    }
    Ms.last = null;
    const video = { src: '', muted: false, playsInline: false, play: async () => {}, removeAttribute() {} };
    const fmp4 = readFileSync(join(__dirname, '../fixtures/fmp4-fragments.bin'));
    const player = createMsePlayer({
      videoElement: video,
      MediaSource: Ms,
      createObjectURL: () => 'blob:x',
      mimeType: 'video/mp4; codecs="avc1.42E01E"'
    });
    Ms.last = null;
    await new Promise((r) => setTimeout(r, 5));
    await player.appendFragment(new Uint8Array(fmp4));
    player.close();
    expect(detectMseSupport({}).supported).toBe(false);
    expect(() => new MseNotSupportedError(['x']).missing).toBeDefined();
  });

  test('rtcp decode rejects malformed packets', () => {
    expect(decodeRtcpCongestionFeedback(new Uint8Array([0, 0, 0, 8]))).toBeNull();
    const ok = encodeRtcpCongestionFeedback({
      senderSsrc: 1,
      sourceSsrc: 2,
      metrics: []
    });
    expect(decodeRtcpCongestionFeedback(ok)).not.toBeNull();
  });

  test('audio decoder branches for invalid chunk and waiting keyframe', () => {
    class AD {
      constructor(h) {
        this.h = h;
      }
      configure() {}
      decode() {
        this.h.output({ close() {} });
      }
      close() {}
    }
    const dec = createWebCodecsAudioDecoder({
      onAudioData: () => {},
      AudioDecoder: AD,
      EncodedAudioChunk: class {
        constructor(o) {
          this.o = o;
        }
      },
      support: { AudioDecoder: AD, missing: [], supported: true }
    });
    expect(() => dec.feedChunk(null)).toThrow(/chunk is required/);
    const keys = signingKeys();
    const delta = createSignedMediaChunk({
      sessionId: 'a',
      broadcasterId: 'b',
      ...keys,
      layerId: AUDIO_LAYER_ID,
      profile: 'hd720',
      keyframe: false,
      timestampMs: 1,
      mimeType: 'audio/webm;codecs=opus',
      payloadBytes: new Uint8Array([1]),
      rendition: resolveAudioRendition('hd720')
    });
    dec.feedChunk(delta, { sessionId: 'a' });
    const key = { ...delta, keyframe: true, sequence: 1 };
    key.signatureBase64 = createSignedMediaChunk({
      sessionId: 'a',
      broadcasterId: 'b',
      ...keys,
      layerId: AUDIO_LAYER_ID,
      profile: 'hd720',
      keyframe: true,
      timestampMs: 1,
      mimeType: 'audio/webm;codecs=opus',
      payloadBytes: new Uint8Array([1]),
      rendition: resolveAudioRendition('hd720'),
      sequence: 1
    }).signatureBase64;
    dec.feedChunk(key, { sessionId: 'a' });
    expect(verifyMediaChunk(key, 'a')).toBe(true);
    dec.close();
  });

  test('whip assembler and opus depacketizer edge cases', () => {
    expect(depacketizeOpusRtp(null)).toBeNull();
    const frames = [];
    const asm = createWhipRtpFrameAssembler({ onFrame: (f) => frames.push(f), videoPayloadType: 99 });
    const pkt = new Uint8Array(13);
    pkt[0] = 0x80;
    pkt[1] = 99;
    pkt[12] = 0x65;
    asm.feedRtpPacket(pkt);
    expect(frames).toHaveLength(1);
    rfc8888MetricsToReceiverReports({
      metrics: [],
      sessionId: 's',
      viewerId: 'v',
      layerId: 'L0',
      intervalMs: 100,
      timestampMs: 1
    });
  });

  test('encoder config fallbacks and errors', async () => {
    class NoAv1 {
      static async isConfigSupported(config) {
        return { supported: config.codec === 'vp8' };
      }
    }
    const support = { VideoEncoder: NoAv1, missing: [], supported: true };
    const cfg = await selectVideoEncoderConfig(support, { width: 320, height: 240 }, { preferSvc: true });
    expect(cfg.codec).toBe('vp8');
    class None {
      static async isConfigSupported() {
        return { supported: false };
      }
    }
    await expect(
      selectVideoEncoderConfig({ VideoEncoder: None, missing: [], supported: true }, { width: 10, height: 10 })
    ).rejects.toThrow(/No supported/);
    await expect(selectAudioEncoderConfig({ missing: [] })).rejects.toBeInstanceOf(WebCodecsNotSupportedError);
    class BadAudio {
      static async isConfigSupported() {
        return { supported: false };
      }
    }
    await expect(selectAudioEncoderConfig({ AudioEncoder: BadAudio, missing: [] }, 1)).rejects.toThrow(/Opus/);
  });

  test('browser capture stop idempotency and missing video', async () => {
    const keys = signingKeys();
    class VE {
      static async isConfigSupported() {
        return { supported: true };
      }
      constructor() {}
      configure() {}
      encode() {}
      close() {}
    }
    const support = { VideoEncoder: VE, missing: [], supported: true };
    const source = await createBrowserCaptureSource({
      mediaStream: {
        getVideoTracks: () => [{ id: 'v' }]
      },
      sessionId: 's',
      broadcasterId: 'b',
      ...keys,
      VideoEncoder: VE,
      MediaStreamTrackProcessor: class {
        constructor() {
          this.readable = { getReader: () => ({ async read() { return { done: true }; }, cancel() {} }) };
        }
      },
      support
    });
    await source.start();
    source.stop();
    source.stop();
    expect(detectWebCodecsSupport({ VideoEncoder: VE, VideoDecoder: VE }).supported).toBe(true);
  });
});