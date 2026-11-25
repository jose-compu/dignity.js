/**
 * Viewer-side WebCodecs decode helper (#152 milestone 9).
 * @experimental
 */

const naclUtil = require('tweetnacl-util');
const { decodeMediaChunkPayload, verifyMediaChunk } = require('./media-chunk');
const {
  detectWebCodecsSupport,
  WebCodecsNotSupportedError,
  mimeTypeToDecoderCodec
} = require('./webcodecs-support');

/**
 * @typedef {Object} WebCodecsDecoderHandle
 * @property {(chunk: import('./media-chunk').SignedMediaChunk, options?: { sessionId?: string }) => void} feedChunk
 * @property {() => void} close
 * @property {boolean} waitingForKeyframe
 * @property {string | null} activeLayerId
 */

/**
 * @param {Object} options
 * @param {(frame: unknown) => void} options.onFrame
 * @param {typeof VideoDecoder} [options.VideoDecoder]
 * @param {Object} [options.support]
 * @param {HTMLCanvasElement} [options.canvas]
 * @param {(decoder: unknown, frame: unknown) => void} [options.drawFrame]
 * @returns {WebCodecsDecoderHandle}
 */
function createWebCodecsDecoder(options) {
  if (!options || typeof options.onFrame !== 'function') {
    throw new TypeError('createWebCodecsDecoder requires onFrame');
  }

  const support = options.support ?? detectWebCodecsSupport({ VideoDecoder: options.VideoDecoder });
  if (!support.VideoDecoder) {
    throw new WebCodecsNotSupportedError(
      support.missing && support.missing.length ? support.missing : ['VideoDecoder']
    );
  }
  const VideoDecoder = options.VideoDecoder ?? support.VideoDecoder;

  /** @type {InstanceType<typeof VideoDecoder> | null} */
  let decoder = null;
  /** @type {string | null} */
  let configuredCodec = null;
  /** @type {string | null} */
  let activeLayerId = null;
  let waitingForKeyframe = true;

  /** @type {Uint8Array | null} */
  let configuredDescription = null;

  function ensureDecoder(codec, description) {
    const sameDescription =
      (!description && !configuredDescription) ||
      (description &&
        configuredDescription &&
        description.byteLength === configuredDescription.byteLength &&
        description.every((b, i) => b === configuredDescription[i]));
    if (decoder && configuredCodec === codec && sameDescription) {
      return;
    }
    if (decoder) {
      try {
        decoder.close();
      } catch {
        /* ignore */
      }
    }
    decoder = new VideoDecoder({
      output: (frame) => {
        if (options.canvas && options.drawFrame) {
          options.drawFrame(options.canvas, frame);
        } else if (options.canvas && typeof frame?.close === 'function') {
          const ctx = options.canvas.getContext('2d');
          if (ctx && typeof frame.width === 'number') {
            options.canvas.width = frame.width;
            options.canvas.height = frame.height;
            ctx.drawImage(frame, 0, 0);
          }
        }
        options.onFrame(frame);
        if (typeof frame?.close === 'function') {
          frame.close();
        }
      },
      error: () => {
        waitingForKeyframe = true;
      }
    });
    const config = { codec };
    if (description && description.byteLength > 0) {
      config.description = description;
    }
    decoder.configure(config);
    configuredCodec = codec;
    configuredDescription = description ? new Uint8Array(description) : null;
    waitingForKeyframe = true;
  }

  return {
    get waitingForKeyframe() {
      return waitingForKeyframe;
    },
    get activeLayerId() {
      return activeLayerId;
    },
    feedChunk(chunk, feedOptions = {}) {
      if (!chunk || typeof chunk !== 'object') {
        throw new TypeError('chunk is required');
      }
      const sessionId = feedOptions.sessionId;
      if (!verifyMediaChunk(chunk, sessionId)) {
        throw new Error('media chunk signature verification failed');
      }

      const layerId =
        typeof chunk.layerId === 'string' && chunk.layerId.trim() !== '' ? chunk.layerId.trim() : 'L0';
      if (activeLayerId !== layerId) {
        activeLayerId = layerId;
        waitingForKeyframe = true;
        if (decoder) {
          try {
            decoder.close();
          } catch {
            /* ignore */
          }
          decoder = null;
          configuredCodec = null;
        }
      }

      const isKeyframe = Boolean(chunk.keyframe);
      if (waitingForKeyframe && !isKeyframe) {
        return;
      }

      const mimeType = typeof chunk.mimeType === 'string' ? chunk.mimeType : 'video/webm;codecs=vp8';
      const codec = mimeTypeToDecoderCodec(mimeType);
      let description = null;
      if (typeof chunk.codecDescriptionBase64 === 'string' && chunk.codecDescriptionBase64.trim() !== '') {
        description = naclUtil.decodeBase64(chunk.codecDescriptionBase64.trim());
      }
      ensureDecoder(codec, description);

      const payload = decodeMediaChunkPayload(chunk);
      const chunkType = isKeyframe ? 'key' : 'delta';
      const timestampUs = Math.round((chunk.timestampMs != null ? chunk.timestampMs : 0) * 1000);

      const EncodedVideoChunk =
        options.EncodedVideoChunk ??
        (typeof globalThis !== 'undefined' ? globalThis.EncodedVideoChunk : undefined);
      if (typeof EncodedVideoChunk !== 'function') {
        throw new WebCodecsNotSupportedError(['EncodedVideoChunk']);
      }
      const encoded = new EncodedVideoChunk({
        type: chunkType,
        timestamp: timestampUs,
        data: payload
      });
      decoder.decode(encoded);
      if (isKeyframe) {
        waitingForKeyframe = false;
      }
    },
    close() {
      if (decoder) {
        try {
          decoder.close();
        } catch {
          /* ignore */
        }
        decoder = null;
      }
      configuredCodec = null;
      waitingForKeyframe = true;
      activeLayerId = null;
    }
  };
}

module.exports = {
  createWebCodecsDecoder
};