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
  createBrowserCaptureSource,
  createWebCodecsDecoder,
  createSignedMediaChunk,
  verifyMediaChunk
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
      this.handlers.output(
        new FakeEncodedVideoChunk({
          type: options.keyFrame ? 'key' : 'delta',
          timestamp: frame.timestamp != null ? frame.timestamp : 33_000,
          data
        }),
        {}
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
  });
});

describe('createBrowserCaptureSource', () => {
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
});

describe('createWebCodecsDecoder', () => {
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
});