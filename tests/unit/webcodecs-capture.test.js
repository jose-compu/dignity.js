/**
 * WebCodecs capture + decode (milestone 9) with injectable browser APIs.
 */

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  detectWebCodecsSupport,
  WebCodecsNotSupportedError,
  selectVideoEncoderConfig,
  mimeTypeToDecoderCodec,
  renditionEncoderDimensions,
  createBrowserCaptureSource,
  createWebCodecsDecoder,
  createWebCodecsAudioDecoder,
  createSignedMediaChunk,
  verifyMediaChunk,
  selectAudioEncoderConfig,
  resolveEncodedChunkLayerId,
  mapSvcLayersToLayerId,
  AUDIO_LAYER_ID,
  resolveAudioRendition
} = require('../../src');

function signingKeys() {
  const signing = nacl.sign.keyPair();
  return {
    signingSecretKey: signing.secretKey,
    signingPublicKey: naclUtil.encodeBase64(signing.publicKey)
  };
}

class FakeEncodedVideoChunk {
  constructor({ type, timestamp, data }) {
    this.type = type;
    this.timestamp = timestamp;
    this.data = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.byteLength = this.data.byteLength;
  }

  copyTo(dest) {
    dest.set(this.data);
  }
}

function createFakeVideoEncoder() {
  return class FakeVideoEncoder {
    static async isConfigSupported(config) {
      if (config.codec.startsWith('avc')) {
        return { supported: true };
      }
      if (config.codec === 'vp8') {
        return { supported: true };
      }
      return { supported: false };
    }

    constructor(handlers) {
      this.handlers = handlers;
      this.configured = false;
    }

    configure() {
      this.configured = true;
    }

    encode(frame, options = {}) {
      const data = new Uint8Array([0, 0, 0, 1, options.keyFrame ? 0xaa : 0xbb]);
      const metadata =
        options.keyFrame && options.withDescription
          ? { decoderConfig: { description: new Uint8Array([1, 2, 3, 4]) } }
          : {};
      this.handlers.output(
        new FakeEncodedVideoChunk({
          type: options.keyFrame ? 'key' : 'delta',
          timestamp: frame.timestamp != null ? frame.timestamp : 33_000,
          data
        }),
        metadata
      );
    }

    close() {}
  };
}

function createFakeVideoDecoder(onFrame) {
  return class FakeVideoDecoder {
    constructor(handlers) {
      this.handlers = handlers;
      this.configured = false;
    }

    configure() {
      this.configured = true;
    }

    decode(chunk) {
      const payload = chunk.data instanceof Uint8Array ? chunk.data : new Uint8Array(chunk.data);
      this.handlers.output({
        width: 640,
        height: 360,
        payload,
        close() {}
      });
      if (onFrame) {
        onFrame(chunk);
      }
    }

    close() {}
  };
}

function fakeMediaStream() {
  return {
    getVideoTracks() {
      return [{ kind: 'video', id: 'v1' }];
    }
  };
}

function fakeTrackProcessor(frames) {
  return class FakeMediaStreamTrackProcessor {
    constructor() {
      let index = 0;
      this.readable = {
        getReader() {
          return {
            async read() {
              if (index >= frames.length) {
                return { done: true, value: undefined };
              }
              const value = frames[index++];
              return { done: false, value };
            },
            cancel() {
              return Promise.resolve();
            }
          };
        }
      };
    }
  };
}

describe('webcodecs support', () => {
  test('detectWebCodecsSupport reports missing APIs in Node', () => {
    const support = detectWebCodecsSupport({});
    expect(support.supported).toBe(false);
    expect(support.missing).toContain('VideoEncoder');
  });

  test('detectWebCodecsSupport reports full support when APIs are injectable', () => {
    class Encoder {
      static async isConfigSupported() {
        return { supported: true };
      }
    }
    class Processor {}
    class Decoder {}
    class AudioEnc {
      static async isConfigSupported() {
        return { supported: true };
      }
    }
    const support = detectWebCodecsSupport({
      VideoEncoder: Encoder,
      VideoDecoder: Decoder,
      MediaStreamTrackProcessor: Processor,
      AudioEncoder: AudioEnc
    });
    expect(support.supported).toBe(true);
    expect(support.missing).toEqual([]);
    expect(support.AudioEncoder).toBe(AudioEnc);
  });

  test('detectWebCodecsSupport flags missing isConfigSupported on VideoEncoder', () => {
    function Encoder() {}
    const support = detectWebCodecsSupport({ VideoEncoder: Encoder, VideoDecoder: function D() {} });
    expect(support.supported).toBe(false);
    expect(support.missing).toContain('VideoEncoder.isConfigSupported');
  });

  test('selectVideoEncoderConfig prefers H.264 when supported', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const VideoDecoder = createFakeVideoDecoder();
    const support = { ...detectWebCodecsSupport({ VideoEncoder, VideoDecoder }), supported: true, missing: [] };
    const config = await selectVideoEncoderConfig(support, { width: 640, height: 360 });
    expect(config.codec).toMatch(/^avc/);
    expect(config.mimeType).toContain('avc1');
  });

  test('mimeTypeToDecoderCodec maps avc mime strings', () => {
    expect(mimeTypeToDecoderCodec('video/mp4;codecs=avc1.42E01E')).toBe('avc1.42E01E');
    expect(mimeTypeToDecoderCodec('video/webm;codecs=vp8')).toBe('vp8');
    expect(mimeTypeToDecoderCodec('video/webm;codecs=vp9')).toBe('vp9');
    expect(mimeTypeToDecoderCodec('')).toBe('vp8');
    expect(mimeTypeToDecoderCodec('video/mp4;codecs=h264')).toBe('h264');
  });

  test('selectVideoEncoderConfig falls back to VP8 when H.264 unsupported', async () => {
    class Vp8OnlyEncoder {
      static async isConfigSupported(config) {
        return { supported: config.codec === 'vp8' };
      }
    }
    const support = { VideoEncoder: Vp8OnlyEncoder, missing: [], supported: true };
    const config = await selectVideoEncoderConfig(support, { width: 640, height: 360 });
    expect(config.codec).toBe('vp8');
  });

  test('renditionEncoderDimensions resolves ladder bitrates', () => {
    const row = renditionEncoderDimensions('hd720', 'L1');
    expect(row.width).toBe(1280);
    expect(row.videoBitrateKbps).toBe(1800);
  });

  test('WebCodecsNotSupportedError lists missing APIs', () => {
    const err = new WebCodecsNotSupportedError(['VideoEncoder', 'VideoDecoder']);
    expect(err.missing).toEqual(['VideoEncoder', 'VideoDecoder']);
    expect(err.name).toBe('WebCodecsNotSupportedError');
  });

  test('selectVideoEncoderConfig throws when no codec is supported', async () => {
    class NoEncoder {
      static async isConfigSupported() {
        return { supported: false };
      }
    }
    const support = { VideoEncoder: NoEncoder, missing: [], supported: true };
    await expect(selectVideoEncoderConfig(support, { width: 640, height: 360 })).rejects.toThrow(
      /No supported WebCodecs/
    );
  });
});

describe('createBrowserCaptureSource', () => {
  test('throws when options object is omitted', async () => {
    await expect(createBrowserCaptureSource(null)).rejects.toThrow(/options object is required/);
  });

  test('throws when required signing fields are missing', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const support = { VideoEncoder, missing: [], supported: true };
    await expect(
      createBrowserCaptureSource({
        mediaStream: fakeMediaStream(),
        sessionId: '',
        broadcasterId: 'bc',
        signingSecretKey: new Uint8Array(64),
        signingPublicKey: '',
        VideoEncoder,
        support
      })
    ).rejects.toThrow(/sessionId, broadcasterId/);
  });

  test('throws when media stream has no video track', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const support = { VideoEncoder, missing: [], supported: true };
    const keys = signingKeys();
    await expect(
      createBrowserCaptureSource({
        mediaStream: { getVideoTracks: () => [] },
        sessionId: 'x',
        broadcasterId: 'bc',
        ...keys,
        VideoEncoder,
        support
      })
    ).rejects.toThrow(/no video track/);
  });

  test('rejects unknown simulcast layer ids', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const support = { VideoEncoder, missing: [], supported: true };
    const keys = signingKeys();
    await expect(
      createBrowserCaptureSource({
        mediaStream: fakeMediaStream(),
        sessionId: 'x',
        broadcasterId: 'bc',
        ...keys,
        simulcastLayerIds: ['LX'],
        VideoEncoder,
        support
      })
    ).rejects.toThrow(/Unknown simulcast layerId/);
  });

  test('throws WebCodecsNotSupportedError when encoders are missing', async () => {
    const keys = signingKeys();
    await expect(
      createBrowserCaptureSource({
        mediaStream: fakeMediaStream(),
        sessionId: 'sess',
        broadcasterId: 'bc',
        ...keys
      })
    ).rejects.toBeInstanceOf(WebCodecsNotSupportedError);
  });

  test('encodes keyframe with timestamp and signs chunk v3', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const VideoDecoder = createFakeVideoDecoder();
    const support = { ...detectWebCodecsSupport({ VideoEncoder, VideoDecoder }), supported: true, missing: [] };
    const keys = signingKeys();
    const frames = [{ timestamp: 90_000, close() {} }];

    const source = await createBrowserCaptureSource({
      mediaStream: fakeMediaStream(),
      sessionId: 'wc-sess',
      broadcasterId: 'wc-bc',
      ...keys,
      profile: 'hd720',
      layerId: 'L0',
      maxFrames: 1,
      VideoEncoder,
      MediaStreamTrackProcessor: fakeTrackProcessor(frames),
      support
    });

    await source.start();
    expect(source.chunks.length).toBe(1);
    const chunk = source.chunks[0];
    expect(chunk.keyframe).toBe(true);
    expect(chunk.timestampMs).toBe(90);
    expect(chunk.layerId).toBe('L0');
    expect(chunk.rendition.profile).toBe('hd720');
    expect(verifyMediaChunk(chunk, 'wc-sess')).toBe(true);
    expect(chunk.codecDescriptionBase64).toBeUndefined();
    source.stop();
  });

  test('attaches codecDescriptionBase64 from encoder metadata on keyframes', async () => {
    const BaseEncoder = createFakeVideoEncoder();
    class EncoderWithMeta extends BaseEncoder {
      encode(frame, options = {}) {
        const data = new Uint8Array([0xaa]);
        this.handlers.output(
          new FakeEncodedVideoChunk({ type: 'key', timestamp: 33_000, data }),
          { decoderConfig: { description: new Uint8Array([1, 2, 3, 4]) } }
        );
      }
    }
    const VideoEncoder = EncoderWithMeta;
    const support = { VideoEncoder, missing: [], supported: true };
    const keys = signingKeys();
    const frames = [{ timestamp: 33_000, close() {} }];

    const source = await createBrowserCaptureSource({
      mediaStream: fakeMediaStream(),
      sessionId: 'desc-sess',
      broadcasterId: 'bc',
      ...keys,
      maxFrames: 1,
      VideoEncoder,
      MediaStreamTrackProcessor: fakeTrackProcessor(frames),
      support
    });
    await source.start();
    expect(source.chunks[0].codecDescriptionBase64).toBeDefined();
    source.stop();
  });

  test('simulcast emits one signed chunk per layer on same tick', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const VideoDecoder = createFakeVideoDecoder();
    const support = { ...detectWebCodecsSupport({ VideoEncoder, VideoDecoder }), supported: true, missing: [] };
    const keys = signingKeys();
    const frames = [{ timestamp: 60_000, close() {} }];
    const VideoFrame = function VideoFrame(source, meta = {}) {
      this.timestamp = meta.timestamp != null ? meta.timestamp : source.timestamp;
      this.close = () => {};
    };

    const source = await createBrowserCaptureSource({
      mediaStream: fakeMediaStream(),
      sessionId: 'simul',
      broadcasterId: 'simul-bc',
      ...keys,
      simulcastLayerIds: ['L0', 'L1'],
      maxFrames: 2,
      VideoEncoder,
      VideoFrame,
      MediaStreamTrackProcessor: fakeTrackProcessor(frames),
      support
    });

    await source.start();
    expect(source.chunks.length).toBe(2);
    const layers = source.chunks.map((c) => c.layerId).sort();
    expect(layers).toEqual(['L0', 'L1']);
    expect(source.chunks[0].timestampMs).toBe(source.chunks[1].timestampMs);
    source.stop();
  });

  test('encodes via canvas fallback when MediaStreamTrackProcessor is absent', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const support = { VideoEncoder, missing: [], supported: true };
    const keys = signingKeys();
    const OriginalVideoFrame = global.VideoFrame;
    global.VideoFrame = class VF {
      constructor() {
        this.timestamp = 1000;
      }
      close() {}
    };

    const videoEl = {
      srcObject: null,
      muted: false,
      playsInline: false,
      videoWidth: 640,
      videoHeight: 480,
      play: () => Promise.resolve(),
      requestVideoFrameCallback(cb) {
        setTimeout(() => cb(1, { width: 640, height: 480 }), 0);
        return 1;
      },
      cancelVideoFrameCallback() {}
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext() {
        return { drawImage() {} };
      }
    };

    try {
      const source = await createBrowserCaptureSource({
        mediaStream: fakeMediaStream(),
        sessionId: 'canvas',
        broadcasterId: 'bc',
        ...keys,
        maxFrames: 1,
        VideoEncoder,
        VideoFrame: global.VideoFrame,
        videoElement: videoEl,
        canvasElement: canvas,
        requestVideoFrameCallback: (...args) => videoEl.requestVideoFrameCallback(...args),
        support
      });

      await source.start();
      await new Promise((r) => setTimeout(r, 30));
      source.stop();
      expect(source.chunks.length).toBeGreaterThanOrEqual(1);
    } finally {
      global.VideoFrame = OriginalVideoFrame;
    }
  });

  test('requires canvas fallback dependencies when track processor is missing', async () => {
    const VideoEncoder = createFakeVideoEncoder();
    const support = { VideoEncoder, missing: [], supported: true };
    const keys = signingKeys();

    const source = await createBrowserCaptureSource({
      mediaStream: fakeMediaStream(),
      sessionId: 'canvas-fallback',
      broadcasterId: 'bc',
      ...keys,
      maxFrames: 1,
      VideoEncoder,
      support
    });

    await expect(source.start()).rejects.toThrow(/MediaStreamTrackProcessor is unavailable/);
  });
});

describe('createWebCodecsDecoder', () => {
  test('requires onFrame callback', () => {
    expect(() => createWebCodecsDecoder({})).toThrow(/onFrame/);
  });

  test('rejects invalid chunk objects', () => {
    const VideoDecoder = createFakeVideoDecoder();
    const decoder = createWebCodecsDecoder({
      onFrame: () => {},
      VideoDecoder,
      support: { VideoDecoder, missing: [], supported: true }
    });
    expect(() => decoder.feedChunk(null)).toThrow(/chunk is required/);
    decoder.close();
  });

  test('waits for keyframe after layer switch', () => {
    const decoded = [];
    const keys = signingKeys();
    const VideoDecoder = createFakeVideoDecoder((chunk) => {
      decoded.push(chunk.type);
    });

    const decoder = createWebCodecsDecoder({
      onFrame: () => {},
      VideoDecoder,
      EncodedVideoChunk: FakeEncodedVideoChunk,
      support: { VideoDecoder, missing: [], supported: true }
    });

    const delta = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      layerId: 'L0',
      keyframe: false,
      timestampMs: 10,
      mimeType: 'video/webm;codecs=vp8',
      payloadBytes: new Uint8Array([1]),
      ...keys
    });

    decoder.feedChunk(delta, { sessionId: 'dec' });
    expect(decoded.length).toBe(0);

    const key = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      layerId: 'L0',
      keyframe: true,
      timestampMs: 10,
      mimeType: 'video/webm;codecs=vp8',
      payloadBytes: new Uint8Array([2]),
      ...keys
    });
    decoder.feedChunk(key, { sessionId: 'dec' });
    expect(decoded.length).toBe(1);
    expect(decoder.waitingForKeyframe).toBe(false);

    const deltaL1 = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      layerId: 'L1',
      keyframe: false,
      timestampMs: 20,
      mimeType: 'video/webm;codecs=vp8',
      payloadBytes: new Uint8Array([3]),
      ...keys,
      profile: 'hd720'
    });
    decoder.feedChunk(deltaL1, { sessionId: 'dec' });
    expect(decoded.length).toBe(1);

    const keyL1 = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      layerId: 'L1',
      keyframe: true,
      timestampMs: 20,
      mimeType: 'video/webm;codecs=vp8',
      payloadBytes: new Uint8Array([4]),
      ...keys,
      profile: 'hd720'
    });
    decoder.feedChunk(keyL1, { sessionId: 'dec' });
    expect(decoded.length).toBe(2);
    decoder.close();
  });

  test('rejects chunks that fail signature verification', () => {
    const keys = signingKeys();
    const other = signingKeys();
    const VideoDecoder = createFakeVideoDecoder();

    const decoder = createWebCodecsDecoder({
      onFrame: () => {},
      VideoDecoder,
      EncodedVideoChunk: FakeEncodedVideoChunk,
      support: { VideoDecoder, missing: [], supported: true }
    });

    const bad = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      signingSecretKey: keys.signingSecretKey,
      signingPublicKey: other.signingPublicKey,
      layerId: 'L0',
      keyframe: true,
      timestampMs: 1,
      mimeType: 'video/webm;codecs=vp8',
      payloadBytes: new Uint8Array([9])
    });

    expect(() => decoder.feedChunk(bad, { sessionId: 'dec' })).toThrow(/Invalid media chunk signature/);
    decoder.close();
  });

  test('uses custom drawFrame when provided', () => {
    const custom = [];
    const canvas = {};
    const VideoDecoder = createFakeVideoDecoder();
    const keys = signingKeys();
    const decoder = createWebCodecsDecoder({
      canvas,
      drawFrame: (c, frame) => custom.push(frame.width),
      onFrame: () => {},
      VideoDecoder,
      EncodedVideoChunk: FakeEncodedVideoChunk,
      support: { VideoDecoder, missing: [], supported: true }
    });
    decoder.feedChunk(
      createSignedMediaChunk({
        sessionId: 'dec',
        broadcasterId: 'bc',
        ...keys,
        layerId: 'L0',
        keyframe: true,
        timestampMs: 3,
        mimeType: 'video/webm;codecs=vp8',
        payloadBytes: new Uint8Array([8])
      }),
      { sessionId: 'dec' }
    );
    expect(custom).toEqual([640]);
    decoder.close();
  });

  test('throws WebCodecsNotSupportedError when VideoDecoder is absent', () => {
    expect(() =>
      createWebCodecsDecoder({
        onFrame: () => {},
        support: detectWebCodecsSupport({})
      })
    ).toThrow(WebCodecsNotSupportedError);
  });

  test('renders decoded frames onto an optional canvas', () => {
    const drawn = [];
    const canvas = {
      width: 0,
      height: 0,
      getContext() {
        return {
          drawImage(frame) {
            drawn.push(frame.width);
          }
        };
      }
    };
    const VideoDecoder = createFakeVideoDecoder();
    const keys = signingKeys();
    const decoder = createWebCodecsDecoder({
      canvas,
      onFrame: () => {},
      VideoDecoder,
      EncodedVideoChunk: FakeEncodedVideoChunk,
      support: { VideoDecoder, missing: [], supported: true }
    });
    const chunk = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      ...keys,
      layerId: 'L0',
      keyframe: true,
      timestampMs: 5,
      mimeType: 'video/webm;codecs=vp8',
      payloadBytes: new Uint8Array([2])
    });
    decoder.feedChunk(chunk, { sessionId: 'dec' });
    expect(drawn).toEqual([640]);
    decoder.close();
  });

  test('tolerates canvas without a 2d context', () => {
    const canvas = { width: 0, height: 0, getContext: () => null };
    const VideoDecoder = createFakeVideoDecoder();
    const keys = signingKeys();
    const decoder = createWebCodecsDecoder({
      canvas,
      onFrame: () => {},
      VideoDecoder,
      EncodedVideoChunk: FakeEncodedVideoChunk,
      support: { VideoDecoder, missing: [], supported: true }
    });
    decoder.feedChunk(
      createSignedMediaChunk({
        sessionId: 'dec',
        broadcasterId: 'bc',
        ...keys,
        layerId: 'L0',
        keyframe: true,
        timestampMs: 1,
        mimeType: 'video/webm;codecs=vp8',
        payloadBytes: new Uint8Array([1])
      }),
      { sessionId: 'dec' }
    );
    decoder.close();
  });

  test('feeds decoder with codecDescriptionBase64 from signed keyframe', () => {
    let configuredDescriptionLength = 0;
    class TrackingDecoder extends createFakeVideoDecoder() {
      configure(config) {
        super.configure(config);
        configuredDescriptionLength = config.description ? config.description.byteLength : 0;
      }
    }
    const keys = signingKeys();
    const chunk = createSignedMediaChunk({
      sessionId: 'dec',
      broadcasterId: 'bc',
      ...keys,
      layerId: 'L0',
      keyframe: true,
      timestampMs: 12,
      mimeType: 'video/mp4;codecs=avc1.42E01E',
      payloadBytes: new Uint8Array([5, 6, 7])
    });
    chunk.codecDescriptionBase64 = Buffer.from([9, 8, 7, 6]).toString('base64');

    const decoder = createWebCodecsDecoder({
      onFrame: () => {},
      VideoDecoder: TrackingDecoder,
      EncodedVideoChunk: FakeEncodedVideoChunk,
      support: { VideoDecoder: TrackingDecoder, missing: [], supported: true }
    });
    decoder.feedChunk(chunk, { sessionId: 'dec' });
    expect(configuredDescriptionLength).toBe(4);
    decoder.close();
  });
});

describe('v1.19 streaming helpers', () => {
  test('mapSvcLayersToLayerId maps spatial/temporal to L0-L2', () => {
    expect(mapSvcLayersToLayerId(0, 0)).toBe('L0');
    expect(mapSvcLayersToLayerId(1, 0)).toBe('L1');
    expect(mapSvcLayersToLayerId(2, 1)).toBe('L2');
  });

  test('resolveEncodedChunkLayerId uses SVC metadata when enabled', () => {
    expect(resolveEncodedChunkLayerId({ spatialLayerId: 2, temporalLayerId: 0 }, true, 'L0')).toBe('L2');
    expect(resolveEncodedChunkLayerId(null, false, 'L1')).toBe('L1');
  });

  test('selectAudioEncoderConfig returns opus mime type', async () => {
    class AudioEnc {
      static async isConfigSupported() {
        return { supported: true };
      }
    }
    const support = { AudioEncoder: AudioEnc, missing: [], supported: true };
    const cfg = await selectAudioEncoderConfig(support, 48_000);
    expect(cfg.codec).toBe('opus');
    expect(cfg.mimeType).toContain('opus');
  });

  test('selectVideoEncoderConfig chooses AV1 SVC when supported', async () => {
    class Av1SvcEncoder {
      static async isConfigSupported(config) {
        return { supported: Boolean(config.scalabilityMode) };
      }
    }
    const support = { VideoEncoder: Av1SvcEncoder, missing: [], supported: true };
    const cfg = await selectVideoEncoderConfig(support, { width: 640, height: 360 });
    expect(cfg.svc).toBe(true);
    expect(cfg.codec).toMatch(/^av01/);
  });

  test('createWebCodecsAudioDecoder verifies and decodes key chunk', () => {
    const keys = signingKeys();
    let outputs = 0;
    class FakeAudioDecoder {
      constructor(handlers) {
        this.handlers = handlers;
      }
      configure() {}
      decode() {
        outputs += 1;
        this.handlers.output({ close() {} });
      }
      close() {}
    }
    const decoder = createWebCodecsAudioDecoder({
      onAudioData: () => {},
      AudioDecoder: FakeAudioDecoder,
      EncodedAudioChunk: FakeEncodedVideoChunk,
      support: { AudioDecoder: FakeAudioDecoder, missing: [], supported: true }
    });
    const chunk = createSignedMediaChunk({
      sessionId: 'aud',
      broadcasterId: 'bc',
      ...keys,
      layerId: AUDIO_LAYER_ID,
      profile: 'hd720',
      keyframe: true,
      timestampMs: 5,
      mimeType: 'audio/webm;codecs=opus',
      payloadBytes: new Uint8Array([1, 2]),
      rendition: resolveAudioRendition('hd720')
    });
    decoder.feedChunk(chunk, { sessionId: 'aud' });
    expect(outputs).toBe(1);
    decoder.close();
  });
});