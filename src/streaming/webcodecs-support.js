/**
 * WebCodecs feature detection for browser capture / decode (#152 milestone 9).
 * @experimental
 */

const { resolveRendition, mapSvcLayersToLayerId } = require('./rendition-ladder');

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
 *   AudioDecoder?: typeof AudioDecoder,
 * }}
 */
function detectWebCodecsSupport(deps = {}) {
  const root = typeof globalThis !== 'undefined' ? globalThis : {};
  const VideoEncoder = deps.VideoEncoder ?? root.VideoEncoder;
  const VideoDecoder = deps.VideoDecoder ?? root.VideoDecoder;
  const MediaStreamTrackProcessor = deps.MediaStreamTrackProcessor ?? root.MediaStreamTrackProcessor;
  const AudioEncoder = deps.AudioEncoder ?? root.AudioEncoder;
  const AudioDecoder = deps.AudioDecoder ?? root.AudioDecoder;

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
  if (typeof AudioDecoder === 'function') {
    result.AudioDecoder = AudioDecoder;
  }
  return result;
}

/**
 * @param {Object} support
 * @param {number} [bitrate]
 * @param {Object} [deps]
 */
async function selectAudioEncoderConfig(support, bitrate = 64_000, deps = {}) {
  if (!support.AudioEncoder || typeof support.AudioEncoder.isConfigSupported !== 'function') {
    throw new WebCodecsNotSupportedError(['AudioEncoder']);
  }
  const AudioEncoder = support.AudioEncoder;
  const config = {
    codec: 'opus',
    sampleRate: 48000,
    numberOfChannels: 2,
    bitrate
  };
  const isConfigSupported =
    deps.isConfigSupported ?? ((candidate) => AudioEncoder.isConfigSupported(candidate));
  let supported;
  try {
    supported = await isConfigSupported(config);
  } catch {
    supported = { supported: false };
  }
  const ok = supported && (supported.supported === true || supported === true);
  if (!ok) {
    throw new Error('Opus AudioEncoder configuration is not supported');
  }
  return {
    ...config,
    mimeType: 'audio/webm;codecs=opus'
  };
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

  /** @type {{ codec: string, mimeType: string, scalabilityMode?: string, svc?: boolean }[]} */
  const candidates = [];
  if (deps.preferSvc !== false) {
    candidates.push({
      codec: 'av01.0.08M.08',
      mimeType: 'video/mp4;codecs=av01.0.08M.08',
      scalabilityMode: 'L3T3',
      svc: true
    });
    candidates.push({
      codec: 'av01.0.05M.08',
      mimeType: 'video/mp4;codecs=av01.0.05M.08',
      scalabilityMode: 'L1T3',
      svc: true
    });
  }
  candidates.push(
    { codec: 'avc1.42E01E', mimeType: 'video/mp4;codecs=avc1.42E01E' },
    { codec: 'vp8', mimeType: 'video/webm;codecs=vp8' }
  );

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
    if (row.scalabilityMode) {
      config.scalabilityMode = row.scalabilityMode;
    }
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
        mimeType: row.mimeType,
        svc: Boolean(row.svc)
      };
    }
  }

  throw new Error('No supported WebCodecs video encoder configuration (tried AV1 SVC, H.264, and VP8)');
}

/**
 * @param {object} encodedChunkMetadata
 * @param {boolean} useSvc
 * @param {string} [fallbackLayerId]
 * @returns {string}
 */
function resolveEncodedChunkLayerId(encodedChunkMetadata, useSvc, fallbackLayerId = 'L0') {
  if (!useSvc || !encodedChunkMetadata || typeof encodedChunkMetadata !== 'object') {
    return fallbackLayerId;
  }
  const spatial =
    encodedChunkMetadata.spatialLayerId ??
    encodedChunkMetadata.spatialLayer ??
    encodedChunkMetadata.layerIndex ??
    0;
  const temporal = encodedChunkMetadata.temporalLayerId ?? encodedChunkMetadata.temporalLayer ?? 0;
  return mapSvcLayersToLayerId(spatial, temporal);
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
  selectAudioEncoderConfig,
  mimeTypeToDecoderCodec,
  resolveEncodedChunkLayerId,
  renditionEncoderDimensions
};