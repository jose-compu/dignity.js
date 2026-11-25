/**
 * Node.js media ingest helpers for live streaming origins (#152 milestone 4).
 * ffmpeg is optional and not an npm dependency — probe at runtime.
 * @experimental
 */

const fs = require('fs');
const { spawn: defaultSpawn, spawnSync: defaultSpawnSync } = require('child_process');
const {
  AnnexBIncrementalParser,
  Fmp4IncrementalParser
} = require('./media-framing');

const DEFAULT_CHUNK_BYTES = 65536;
const DEFAULT_FFMPEG_PATH = 'ffmpeg';

function isEnoentError(err) {
  return Boolean(err && (err.code === 'ENOENT' || err.errno === 'ENOENT'));
}

/**
 * @param {string} [ffmpegPath]
 * @param {(cmd: string, args: string[], opts?: object) => import('child_process').SpawnSyncReturns<string>} [spawnSync]
 */
function isFfmpegAvailable(ffmpegPath = DEFAULT_FFMPEG_PATH, spawnSync = defaultSpawnSync) {
  const result = spawnSync(ffmpegPath, ['-version'], { encoding: 'utf8' });
  if (result.error) {
    if (isEnoentError(result.error)) {
      return false;
    }
    return false;
  }
  return result.status === 0 || Boolean(result.stdout);
}

/**
 * @param {Object} options
 * @param {string} options.filePath
 * @param {number} [options.chunkBytes]
 */
function createFileMediaIngest({ filePath, chunkBytes = DEFAULT_CHUNK_BYTES }) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new TypeError('filePath must be a non-empty string');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Media file not found: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);

  return {
    kind: 'file',
    filePath,
    chunkBytes,
    stop() {},
    async *frames() {
      if (buffer.length === 0) {
        return;
      }
      for (let offset = 0; offset < buffer.length; offset += chunkBytes) {
        const end = Math.min(offset + chunkBytes, buffer.length);
        yield {
          payloadBytes: buffer.subarray(offset, end),
          mimeType: 'application/octet-stream',
          keyframe: false
        };
      }
    }
  };
}

const DEFAULT_FFMPEG_ARGS = {
  fmp4: ['-hide_banner', '-loglevel', 'error', '-i', null, '-f', 'mp4', '-movflags', 'frag_keyframe+empty_moov+default_base_moof', 'pipe:1'],
  annexb: ['-hide_banner', '-loglevel', 'error', '-i', null, '-f', 'h264', 'pipe:1']
};

function buildFfmpegArgs(filePath, format, customArgs) {
  if (customArgs) {
    return customArgs;
  }
  const template = format === 'annexb' ? DEFAULT_FFMPEG_ARGS.annexb : DEFAULT_FFMPEG_ARGS.fmp4;
  return template.map((token) => (token === null ? filePath : token));
}

/**
 * @param {Object} options
 * @param {string} options.filePath
 * @param {'fmp4' | 'annexb'} [options.format]
 * @param {number} [options.frameDurationMs]
 * @param {string} [options.ffmpegPath]
 * @param {string[]} [options.ffmpegArgs]
 * @param {typeof defaultSpawn} [options.spawn]
 */
function createFfmpegMediaIngest({
  filePath,
  format = 'fmp4',
  frameDurationMs,
  ffmpegPath = DEFAULT_FFMPEG_PATH,
  ffmpegArgs,
  spawn = defaultSpawn
}) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new TypeError('filePath must be a non-empty string');
  }
  if (format !== 'fmp4' && format !== 'annexb') {
    throw new TypeError('format must be "fmp4" or "annexb"');
  }

  /** @type {import('child_process').ChildProcessWithoutNullStreams | null} */
  let child = null;

  const args = buildFfmpegArgs(filePath, format, ffmpegArgs);

  return {
    kind: 'ffmpeg',
    filePath,
    format,
    frameDurationMs,
    get child() {
      return child;
    },
    stop() {
      if (child && child.exitCode === null && !child.killed) {
        child.kill('SIGTERM');
      }
      child = null;
    },
    async *frames() {
      child = spawn(ffmpegPath, args);

      const parser =
        format === 'annexb'
          ? new AnnexBIncrementalParser({ frameDurationMs })
          : new Fmp4IncrementalParser();

      const queue = [];
      let resolveWait = null;
      let streamEnded = false;
      let streamError = null;

      const notify = () => {
        if (resolveWait) {
          resolveWait();
          resolveWait = null;
        }
      };

      const waitForData = () =>
        new Promise((resolve) => {
          if (queue.length > 0 || streamEnded || streamError) {
            resolve();
            return;
          }
          resolveWait = resolve;
        });

      child.stdout.on('data', (chunk) => {
        const pushed = parser.push(new Uint8Array(chunk));
        for (const frame of pushed) {
          queue.push(frame);
        }
        notify();
      });

      await new Promise((resolve, reject) => {
        child.stdout.on('error', reject);
        child.on('error', (err) => {
          if (isEnoentError(err)) {
            const unavailable = new Error('ffmpeg is not available');
            unavailable.code = 'ENOENT';
            reject(unavailable);
            return;
          }
          reject(err);
        });
        child.on('close', (code) => {
          if (code !== 0 && code !== null) {
            streamError = new Error(`ffmpeg exited with code ${code}`);
            notify();
            reject(streamError);
            return;
          }
          const tail = parser.flush();
          for (const frame of tail) {
            queue.push(frame);
          }
          streamEnded = true;
          notify();
          resolve();
        });
        if (child.exitCode === 0) {
          const tail = parser.flush();
          for (const frame of tail) {
            queue.push(frame);
          }
          streamEnded = true;
          notify();
          resolve();
        }
      });

      while (queue.length > 0 || !streamEnded) {
        if (queue.length === 0) {
          await waitForData();
          if (streamError) {
            throw streamError;
          }
          if (streamEnded) {
            break;
          }
        }
        while (queue.length > 0) {
          yield queue.shift();
        }
      }
    }
  };
}

/**
 * Prefer ffmpeg ingest when the binary is on PATH; otherwise read the file in fixed chunks.
 * @param {Object} options
 * @param {string} options.filePath
 * @param {number} [options.chunkBytes]
 * @param {'fmp4' | 'annexb'} [options.format]
 * @param {number} [options.frameDurationMs]
 * @param {string} [options.ffmpegPath]
 * @param {typeof defaultSpawn} [options.spawn]
 * @param {typeof defaultSpawnSync} [options.spawnSync]
 */
async function resolveNodeMediaIngest(options) {
  const spawnSync = options.spawnSync || defaultSpawnSync;
  const ffmpegPath = options.ffmpegPath || DEFAULT_FFMPEG_PATH;
  if (isFfmpegAvailable(ffmpegPath, spawnSync)) {
    return createFfmpegMediaIngest(options);
  }
  return createFileMediaIngest(options);
}

module.exports = {
  DEFAULT_CHUNK_BYTES,
  isFfmpegAvailable,
  createFileMediaIngest,
  createFfmpegMediaIngest,
  resolveNodeMediaIngest
};