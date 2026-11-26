/**
 * WebCodecs AudioDecoder helper for signed Opus chunks.
 * @experimental
 */

const naclUtil = require('tweetnacl-util');
const { decodeMediaChunkPayload, verifyMediaChunk } = require('./media-chunk');
const { detectWebCodecsSupport, WebCodecsNotSupportedError } = require('./webcodecs-support');

/**
 * @param {string} mimeType
 * @returns {string}
 */
function mimeTypeToAudioDecoderCodec(mimeType) {
  if (typeof mimeType !== 'string') {
    return 'opus';
  }
  const lower = mimeType.toLowerCase();
  if (lower.includes('opus')) {
    return 'opus';
  }
  if (lower.includes('mp4a')) {
    const match = mimeType.match(/codecs=([^;,\s]+)/i);
    return match ? match[1] : 'mp4a.40.2';
  }
  return 'opus';
}

/**
 * @param {Object} options
 * @param {(data: unknown) => void} options.onAudioData
 * @param {typeof AudioDecoder} [options.AudioDecoder]
 * @param {Object} [options.support]
 */
function createWebCodecsAudioDecoder(options) {
  if (!options || typeof options.onAudioData !== 'function') {
    throw new TypeError('createWebCodecsAudioDecoder requires onAudioData');
  }
  const support = options.support ?? detectWebCodecsSupport({ AudioDecoder: options.AudioDecoder });
  const AudioDecoder = options.AudioDecoder ?? support.AudioDecoder;
  if (!AudioDecoder) {
    throw new WebCodecsNotSupportedError(['AudioDecoder']);
  }

  /** @type {InstanceType<typeof AudioDecoder> | null} */
  let decoder = null;
  let configuredCodec = null;
  let waitingForKeyframe = true;

  function ensureDecoder(codec, description) {
    if (decoder && configuredCodec === codec) {
      return;
    }
    if (decoder) {
      try {
        decoder.close();
      } catch {
        /* ignore */
      }
    }
    decoder = new AudioDecoder({
      output: (data) => {
        options.onAudioData(data);
        if (typeof data?.close === 'function') {
          data.close();
        }
      },
      error: () => {
        waitingForKeyframe = true;
      }
    });
    const config = { codec, sampleRate: 48000, numberOfChannels: 2 };
    if (description && description.byteLength > 0) {
      config.description = description;
    }
    decoder.configure(config);
    configuredCodec = codec;
    waitingForKeyframe = true;
  }

  return {
    get waitingForKeyframe() {
      return waitingForKeyframe;
    },
    feedChunk(chunk, feedOptions = {}) {
      if (!chunk || typeof chunk !== 'object') {
        throw new TypeError('chunk is required');
      }
      const sessionId = feedOptions.sessionId;
      if (!verifyMediaChunk(chunk, sessionId)) {
        throw new Error('media chunk signature verification failed');
      }
      const isKeyframe = Boolean(chunk.keyframe);
      if (waitingForKeyframe && !isKeyframe) {
        return;
      }
      const mimeType = typeof chunk.mimeType === 'string' ? chunk.mimeType : 'audio/webm;codecs=opus';
      const codec = mimeTypeToAudioDecoderCodec(mimeType);
      let description = null;
      if (typeof chunk.codecDescriptionBase64 === 'string' && chunk.codecDescriptionBase64.trim() !== '') {
        description = naclUtil.decodeBase64(chunk.codecDescriptionBase64.trim());
      }
      ensureDecoder(codec, description);
      const payload = decodeMediaChunkPayload(chunk);
      const timestampUs = Math.round((chunk.timestampMs != null ? chunk.timestampMs : 0) * 1000);
      const EncodedAudioChunk =
        options.EncodedAudioChunk ??
        (typeof globalThis !== 'undefined' ? globalThis.EncodedAudioChunk : undefined);
      if (typeof EncodedAudioChunk !== 'function') {
        throw new WebCodecsNotSupportedError(['EncodedAudioChunk']);
      }
      const encoded = new EncodedAudioChunk({
        type: isKeyframe ? 'key' : 'delta',
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
    }
  };
}

module.exports = {
  mimeTypeToAudioDecoderCodec,
  createWebCodecsAudioDecoder
};