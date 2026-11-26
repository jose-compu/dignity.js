/**
 * Media Source Extensions player for verified fMP4 fragments.
 * @experimental
 */

const { parseFmp4Fragments } = require('./media-framing');

class MseNotSupportedError extends Error {
  constructor(missing) {
    super(`MSE is not available: missing ${missing.join(', ')}`);
    this.name = 'MseNotSupportedError';
    this.missing = missing;
  }
}

/**
 * @param {Object} [deps]
 */
function detectMseSupport(deps = {}) {
  const root = typeof globalThis !== 'undefined' ? globalThis : {};
  const MediaSource = deps.MediaSource ?? root.MediaSource;
  /** @type {string[]} */
  const missing = [];
  if (typeof MediaSource !== 'function') {
    missing.push('MediaSource');
  } else if (typeof MediaSource.isTypeSupported !== 'function') {
    missing.push('MediaSource.isTypeSupported');
  }
  return {
    supported: missing.length === 0,
    missing,
    MediaSource
  };
}

/**
 * @param {Object} options
 * @param {HTMLVideoElement} options.videoElement
 * @param {string} [options.mimeType]
 * @param {typeof MediaSource} [options.MediaSource]
 * @returns {{ appendFragment: (bytes: Uint8Array) => Promise<void>, close: () => void, waitingForKeyframe: boolean }}
 */
function createMsePlayer(options) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('options object is required');
  }
  const support = detectMseSupport({ MediaSource: options.MediaSource });
  if (!support.supported) {
    throw new MseNotSupportedError(support.missing);
  }
  const MediaSource = options.MediaSource ?? support.MediaSource;
  const video = options.videoElement;
  if (!video || typeof video !== 'object') {
    throw new TypeError('videoElement is required');
  }
  const mimeType =
    typeof options.mimeType === 'string' && options.mimeType.trim() !== ''
      ? options.mimeType.trim()
      : 'video/mp4; codecs="avc1.42E01E"';

  if (!MediaSource.isTypeSupported(mimeType)) {
    throw new Error(`MIME type not supported by MSE: ${mimeType}`);
  }

  const mediaSource = new MediaSource();
  const createObjectURL =
    options.createObjectURL ??
    (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? (obj) => URL.createObjectURL(obj)
      : null);
  if (!createObjectURL) {
    throw new MseNotSupportedError(['URL.createObjectURL']);
  }
  video.src = createObjectURL(mediaSource);
  video.muted = true;
  video.playsInline = true;

  /** @type {SourceBuffer | null} */
  let sourceBuffer = null;
  /** @type {Uint8Array[]} */
  const queue = [];
  let appending = false;
  let waitingForKeyframe = true;
  let closed = false;

  const openPromise = new Promise((resolve, reject) => {
    mediaSource.addEventListener(
      'sourceopen',
      () => {
        try {
          sourceBuffer = mediaSource.addSourceBuffer(mimeType);
          sourceBuffer.mode = 'segments';
          sourceBuffer.addEventListener('updateend', drainQueue);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      { once: true }
    );
  });

  function trimBufferOnQuota() {
    if (!sourceBuffer || sourceBuffer.updating) {
      return;
    }
    const start = sourceBuffer.buffered.length > 0 ? sourceBuffer.buffered.start(0) : 0;
    const end = sourceBuffer.buffered.length > 0 ? sourceBuffer.buffered.end(0) : 0;
    const trimEnd = start + (end - start) * 0.25;
    if (trimEnd > start + 0.5) {
      try {
        sourceBuffer.remove(start, trimEnd);
      } catch {
        /* ignore */
      }
    }
  }

  function drainQueue() {
    if (!sourceBuffer || sourceBuffer.updating || !queue.length || closed) {
      appending = false;
      return;
    }
    const chunk = queue.shift();
    if (!chunk) {
      appending = false;
      return;
    }
    appending = true;
    try {
      sourceBuffer.appendBuffer(chunk);
    } catch (err) {
      appending = false;
      if (err && err.name === 'QuotaExceededError') {
        trimBufferOnQuota();
        queue.unshift(chunk);
        return;
      }
      throw err;
    }
  }

  async function appendFragment(bytes) {
    if (closed) {
      throw new Error('MSE player is closed');
    }
    if (!(bytes instanceof Uint8Array)) {
      throw new TypeError('bytes must be Uint8Array');
    }
    await openPromise;
    const frames = parseFmp4Fragments(bytes);
    if (!frames.length) {
      return;
    }
    for (const frame of frames) {
      if (waitingForKeyframe && !frame.keyframe) {
        continue;
      }
      if (frame.keyframe) {
        waitingForKeyframe = false;
      }
      const payload = frame.payloadBytes;
      queue.push(payload instanceof Uint8Array ? payload : new Uint8Array(payload));
    }
    if (!appending) {
      drainQueue();
    }
    if (typeof video.play === 'function') {
      try {
        await video.play();
      } catch {
        /* autoplay policy */
      }
    }
  }

  function close() {
    closed = true;
    queue.length = 0;
    if (sourceBuffer) {
      try {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      } catch {
        /* ignore */
      }
    }
    if (video.src && video.src.startsWith('blob:')) {
      URL.revokeObjectURL(video.src);
    }
    video.removeAttribute('src');
  }

  return {
    get waitingForKeyframe() {
      return waitingForKeyframe;
    },
    appendFragment,
    close
  };
}

module.exports = {
  MseNotSupportedError,
  detectMseSupport,
  createMsePlayer
};