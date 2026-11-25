/**
 * WebCodecs feature detection for browser capture / decode (#152 milestone 9).
 * @experimental
 */

const { resolveRendition } = require('./rendition-ladder');

class WebCodecsNotSupportedError extends Error {
  /**
   * @param {string[]} missing
   */
  constructor(missing) {
    super(`WebCodecs is not available: missing ${missing.join(', ')}`);
    this.name = 'WebCodecsNotSupportedError';
    this.missing = [...missing];
  }
}

/**
 * @param {Object} [deps]
 * @returns {{
 *   supported: boolean,
 *   missing: string[],
 *   VideoEncoder?: typeof VideoEncoder,
 *   VideoDecoder?: typeof VideoDecoder,
 *   MediaStreamTrackProcessor?: typeof MediaStreamTrackProcessor,
 *   AudioEncoder?: typeof AudioEncoder,
 * }}
 */
function detectWebCodecsSupport(deps = {}) {
  const root = typeof globalThis !== 'undefined' ? globalThis : {};
  const VideoEncoder = deps.VideoEncoder ?? root.VideoEncoder;
  const VideoDecoder = deps.VideoDecoder ?? root.VideoDecoder;
  const MediaStreamTrackProcessor = deps.MediaStreamTrackProcessor ?? root.MediaStreamTrackProcessor;
  const AudioEncoder = deps.AudioEncoder ?? root.AudioEncoder;

  /** @type {string[]} */
  const missing = [];
  if (typeof VideoEncoder !== 'function') {
    missing.push('VideoEncoder');
  } else if (typeof VideoEncoder.isConfigSupported !== 'function') {
    missing.push('VideoEncoder.isConfigSupported');
  }
  if (typeof VideoDecoder !== 'function') {
    missing.push('VideoDecoder');
  }

  const result = {
    supported: missing.length === 0,
    missing
  };
  if (VideoEncoder) {
    result.VideoEncoder = VideoEncoder;
  }
  if (VideoDecoder) {
    result.VideoDecoder = VideoDecoder;
  }
  if (typeof MediaStreamTrackProcessor === 'function') {
    result.MediaStreamTrackProcessor = MediaStreamTrackProcessor;
  }
  if (typeof AudioEncoder === 'function' && typeof AudioEncoder.isConfigSupported === 'function') {
    result.AudioEncoder = AudioEncoder;
  }
  return result;
}

/**
 * @param {Object} support — from detectWebCodecsSupport
 * @param {{ width: number, height: number, bitrate?: number, framerate?: number }} dimensions
 * @param {Object} [deps]
 * @returns {Promise<{ codec: string, mimeType: string, width: number, height: number, bitrate: number, framerate: number, hardwareAcceleration?: string }>}
 */
async function selectVideoEncoderConfig(support, dimensions, deps = {}) {
  if (!support.VideoEncoder || typeof support.VideoEncoder.isConfigSupported !== 'function') {
    throw new WebCodecsNotSupportedError(
      support.missing && support.missing.length ? support.missing : ['VideoEncoder']
    );
  }
  const VideoEncoder = support.VideoEncoder;
  const width = Math.max(2, Math.floor(dimensions.width));
  const height = Math.max(2, Math.floor(dimensions.height));
  const bitrate = dimensions.bitrate != null ? dimensions.bitrate : 1_500_000;
  const framerate = dimensions.framerate != null ? dimensions.framerate : 30;

  /** @type {{ codec: string, mimeType: string }[]} */
  const candidates = [
    { codec: 'avc1.42E01E', mimeType: 'video/mp4;codecs=avc1.42E01E' },
    { codec: 'vp8', mimeType: 'video/webm;codecs=vp8' }
  ];

  const isConfigSupported =
    deps.isConfigSupported ?? ((config) => VideoEncoder.isConfigSupported(config));

  for (const row of candidates) {
    const config = {
      codec: row.codec,
      width,
      height,
      bitrate,
      framerate,
      latencyMode: 'realtime'
    };
    let supported;
    try {
      supported = await isConfigSupported(config);
    } catch {
      supported = { supported: false };
    }
    const ok = supported && (supported.supported === true || supported === true);
    if (ok) {
      return {
        ...config,
        mimeType: row.mimeType
      };
    }
  }

  throw new Error('No supported WebCodecs video encoder configuration (tried H.264 and VP8)');
}

/**
 * Map chunk mimeType / codec to VideoDecoder configure codec string.
 * @param {string} mimeType
 * @returns {string}
 */
function mimeTypeToDecoderCodec(mimeType) {
  if (typeof mimeType !== 'string' || mimeType.trim() === '') {
    return 'vp8';
  }
  const lower = mimeType.toLowerCase();
  if (lower.includes('avc1') || lower.includes('h264')) {
    const match = mimeType.match(/codecs=([^;,\s]+)/i);
    if (match) {
      return match[1];
    }
    return 'avc1.42E01E';
  }
  if (lower.includes('vp8')) {
    return 'vp8';
  }
  if (lower.includes('vp9')) {
    return 'vp9';
  }
  return 'vp8';
}

/**
 * @param {'hd720' | 'fhd1080'} profile
 * @param {'L0' | 'L1' | 'L2'} layerId
 * @returns {{ width: number, height: number, videoBitrateKbps: number }}
 */
function renditionEncoderDimensions(profile, layerId) {
  const rendition = resolveRendition(profile, layerId);
  return {
    width: rendition.width,
    height: rendition.height,
    videoBitrateKbps: rendition.videoBitrateKbps
  };
}

module.exports = {
  WebCodecsNotSupportedError,
  detectWebCodecsSupport,
  selectVideoEncoderConfig,
  mimeTypeToDecoderCodec,
  renditionEncoderDimensions
};