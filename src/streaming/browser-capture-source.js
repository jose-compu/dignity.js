/**
 * Browser MediaStream capture via WebCodecs VideoEncoder (#152 milestone 9).
 * @experimental
 */

const naclUtil = require('tweetnacl-util');
const { createSignedMediaChunk, DEFAULT_LAYER_ID } = require('./media-chunk');
const { LAYER_IDS, resolveRendition } = require('./rendition-ladder');
const { createLayerSequenceTracker } = require('./simulcast-publish');
const {
  detectWebCodecsSupport,
  WebCodecsNotSupportedError,
  selectVideoEncoderConfig
} = require('./webcodecs-support');

function pickVideoTrack(mediaStream, videoTrack) {
  if (videoTrack) {
    return videoTrack;
  }
  if (!mediaStream || typeof mediaStream.getVideoTracks !== 'function') {
    throw new TypeError('mediaStream must expose getVideoTracks()');
  }
  const tracks = mediaStream.getVideoTracks();
  if (!tracks.length) {
    throw new Error('mediaStream has no video track');
  }
  return tracks[0];
}

/**
 * @param {Object} options
 * @param {MediaStream} options.mediaStream
 * @param {MediaStreamTrack} [options.videoTrack]
 * @param {string} options.sessionId
 * @param {string} options.broadcasterId
 * @param {Uint8Array} options.signingSecretKey
 * @param {string} options.signingPublicKey
 * @param {'hd720' | 'fhd1080'} [options.profile]
 * @param {string} [options.layerId]
 * @param {string[]} [options.simulcastLayerIds]
 * @param {(chunk: import('./media-chunk').SignedMediaChunk) => void} [options.onChunk]
 * @param {number} [options.maxFrames] — stop after N encoded frames (demos / tests)
 * @param {typeof VideoEncoder} [options.VideoEncoder]
 * @param {typeof MediaStreamTrackProcessor} [options.MediaStreamTrackProcessor]
 * @param {typeof VideoFrame} [options.VideoFrame]
 * @param {Function} [options.requestVideoFrameCallback]
 * @param {HTMLVideoElement} [options.videoElement]
 * @param {HTMLCanvasElement} [options.canvasElement]
 * @param {ReturnType<typeof detectWebCodecsSupport>} [options.support]
 * @returns {Promise<{
 *   start: () => Promise<void>,
 *   stop: () => void,
 *   chunks: import('./media-chunk').SignedMediaChunk[],
 *   codec: string,
 *   mimeType: string,
 * }>}
 */
async function createBrowserCaptureSource(options) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('options object is required');
  }
  const {
    mediaStream,
    sessionId,
    broadcasterId,
    signingSecretKey,
    signingPublicKey,
    profile = 'hd720',
    layerId = DEFAULT_LAYER_ID,
    simulcastLayerIds,
    onChunk,
    maxFrames
  } = options;

  if (!sessionId || !broadcasterId || !signingSecretKey || !signingPublicKey) {
    throw new TypeError('sessionId, broadcasterId, signingSecretKey, and signingPublicKey are required');
  }

  const support = options.support ?? detectWebCodecsSupport({ VideoEncoder: options.VideoEncoder });
  if (!support.VideoEncoder || typeof support.VideoEncoder.isConfigSupported !== 'function') {
    throw new WebCodecsNotSupportedError(
      support.missing && support.missing.length ? support.missing : ['VideoEncoder']
    );
  }
  const VideoEncoder = options.VideoEncoder ?? support.VideoEncoder;
  const VideoFrame = options.VideoFrame ?? (typeof globalThis !== 'undefined' ? globalThis.VideoFrame : undefined);

  const track = pickVideoTrack(mediaStream, options.videoTrack);
  const layerIds =
    Array.isArray(simulcastLayerIds) && simulcastLayerIds.length > 0
      ? simulcastLayerIds.map((id) => String(id))
      : [layerId];

  for (const id of layerIds) {
    if (!LAYER_IDS.includes(id)) {
      throw new Error(`Unknown simulcast layerId: ${id}`);
    }
  }

  const sequences = createLayerSequenceTracker();
  /** @type {import('./media-chunk').SignedMediaChunk[]} */
  const chunks = [];
  let framesEncoded = 0;
  let stopped = false;
  /** @type {Map<string, { encoder: InstanceType<typeof VideoEncoder>, config: Awaited<ReturnType<typeof selectVideoEncoderConfig>> }>} */
  const encoders = new Map();

  let processor = null;
  let reader = null;
  let rvfHandle = null;
  let videoEl = null;
  let canvas = null;

  function emitChunk(encodedChunk, meta, encoderMeta = {}) {
    let payloadBytes;
    if (encodedChunk instanceof Uint8Array) {
      payloadBytes = encodedChunk;
    } else if (encodedChunk && typeof encodedChunk.copyTo === 'function') {
      payloadBytes = new Uint8Array(encodedChunk.byteLength);
      encodedChunk.copyTo(payloadBytes);
    } else if (encodedChunk && encodedChunk.data instanceof Uint8Array) {
      payloadBytes = encodedChunk.data;
    } else if (encodedChunk && encodedChunk.data) {
      payloadBytes = new Uint8Array(encodedChunk.data);
    } else {
      throw new TypeError('encoded video output must be Uint8Array or EncodedVideoChunk-like');
    }

    const keyframe = encodedChunk.type === 'key';
    const timestampMs = Math.round((encodedChunk.timestamp != null ? encodedChunk.timestamp : 0) / 1000);

    const chunk = createSignedMediaChunk({
      sessionId,
      broadcasterId,
      payloadBytes,
      signingSecretKey,
      signingPublicKey,
      sequence: sequences.next(meta.layerId),
      timestampMs,
      layerId: meta.layerId,
      mimeType: meta.mimeType,
      keyframe,
      profile,
      rendition: resolveRendition(profile, meta.layerId)
    });
    const description = encoderMeta?.decoderConfig?.description;
    if (description && description.byteLength > 0) {
      chunk.codecDescriptionBase64 = naclUtil.encodeBase64(
        description instanceof Uint8Array ? description : new Uint8Array(description)
      );
    }
    chunks.push(chunk);
    if (typeof onChunk === 'function') {
      onChunk(chunk);
    }
    framesEncoded += 1;
    if (maxFrames != null && framesEncoded >= maxFrames) {
      stop();
    }
  }

  function stop() {
    if (stopped) {
      return;
    }
    stopped = true;
    for (const entry of encoders.values()) {
      try {
        entry.encoder.close();
      } catch {
        /* ignore */
      }
    }
    encoders.clear();
    if (reader) {
      try {
        reader.cancel();
      } catch {
        /* ignore */
      }
      reader = null;
    }
    if (processor && typeof processor.readable?.cancel === 'function') {
      try {
        processor.readable.cancel();
      } catch {
        /* ignore */
      }
    }
    processor = null;
    if (rvfHandle && videoEl && typeof videoEl.cancelVideoFrameCallback === 'function') {
      try {
        videoEl.cancelVideoFrameCallback(rvfHandle);
      } catch {
        /* ignore */
      }
    }
    rvfHandle = null;
    if (videoEl) {
      try {
        videoEl.srcObject = null;
      } catch {
        /* ignore */
      }
    }
  }

  for (const lid of layerIds) {
    const rendition = resolveRendition(profile, lid);
    const config = await selectVideoEncoderConfig(
      support,
      {
        width: rendition.width,
        height: rendition.height,
        bitrate: rendition.videoBitrateKbps * 1000
      },
      options
    );
    const meta = { layerId: lid, mimeType: config.mimeType };
    const encoder = new VideoEncoder({
      output: (chunk, metadata) => emitChunk(chunk, meta, metadata),
      error: (err) => {
        throw err;
      }
    });
    encoder.configure({
      codec: config.codec,
      width: config.width,
      height: config.height,
      bitrate: config.bitrate,
      framerate: config.framerate,
      latencyMode: 'realtime'
    });
    encoders.set(lid, { encoder, config });
  }

  const primary = encoders.get(layerIds[0]);

  async function readLoopTrackProcessor() {
    const MediaStreamTrackProcessor =
      options.MediaStreamTrackProcessor ?? support.MediaStreamTrackProcessor;
    if (!MediaStreamTrackProcessor) {
      return false;
    }
    processor = new MediaStreamTrackProcessor({ track });
    reader = processor.readable.getReader();
    while (!stopped) {
      let readResult;
      try {
        readResult = await reader.read();
      } catch {
        break;
      }
      const { value, done } = readResult;
      if (done || !value || stopped) {
        break;
      }
      try {
        for (const [lid, entry] of encoders) {
          const frame =
            lid === layerIds[0]
              ? value
              : new VideoFrame(value, {
                  visibleRect: {
                    width: entry.config.width,
                    height: entry.config.height
                  }
                });
          const keyFrame = framesEncoded === 0;
          entry.encoder.encode(frame, { keyFrame });
          if (frame !== value && typeof frame.close === 'function') {
            frame.close();
          }
        }
      } finally {
        if (typeof value.close === 'function') {
          value.close();
        }
      }
    }
    return true;
  }

  function readLoopCanvasFallback() {
    const rVFC = options.requestVideoFrameCallback;
    videoEl = options.videoElement;
    canvas = options.canvasElement;
    if (!videoEl || !canvas || typeof rVFC !== 'function') {
      throw new Error(
        'MediaStreamTrackProcessor is unavailable; provide videoElement, canvasElement, and requestVideoFrameCallback'
      );
    }
    videoEl.srcObject = mediaStream;
    videoEl.muted = true;
    videoEl.playsInline = true;

    const ctx = canvas.getContext('2d');
    const tick = (now, metadata) => {
      if (stopped) {
        return;
      }
      const vw = metadata?.width ?? videoEl.videoWidth;
      const vh = metadata?.height ?? videoEl.videoHeight;
      if (!vw || !vh) {
        rvfHandle = rVFC.call(videoEl, tick);
        return;
      }
      for (const [, entry] of encoders) {
        canvas.width = entry.config.width;
        canvas.height = entry.config.height;
        ctx.drawImage(videoEl, 0, 0, entry.config.width, entry.config.height);
        const frame = new VideoFrame(canvas, { timestamp: now * 1000 });
        const keyFrame = framesEncoded === 0;
        entry.encoder.encode(frame, { keyFrame });
        frame.close();
      }
      if (!stopped) {
        rvfHandle = rVFC.call(videoEl, tick);
      }
    };
    const playPromise = typeof videoEl.play === 'function' ? videoEl.play() : Promise.resolve();
    return playPromise.then(() => {
      rvfHandle = rVFC.call(videoEl, tick);
    });
  }

  let primaryCodec = primary.config.codec;
  let primaryMime = primary.config.mimeType;

  return {
    get codec() {
      return primaryCodec;
    },
    get mimeType() {
      return primaryMime;
    },
    chunks,
    async start() {
      if (stopped) {
        throw new Error('capture source already stopped');
      }
      const usedProcessor = await readLoopTrackProcessor();
      if (!usedProcessor) {
        await readLoopCanvasFallback();
      }
    },
    stop
  };
}

module.exports = {
  createBrowserCaptureSource
};