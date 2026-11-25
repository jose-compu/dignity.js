/**
 * Node.js media ingest helpers for live streaming origins (#152 milestone 4).
 * ffmpeg is optional and not an npm dependency — probe at runtime.
 * @experimental
 */

const fs = require('fs');
const { spawn: defaultSpawn, spawnSync: defaultSpawnSync } = require('child_process');

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
          mimeType: 'application/octet-stream'
        };
      }
    }
  };
}

/**
 * @param {Object} options
 * @param {string} options.filePath
 * @param {number} [options.chunkBytes]
 * @param {string} [options.ffmpegPath]
 * @param {string[]} [options.ffmpegArgs]
 * @param {typeof defaultSpawn} [options.spawn]
 */
function createFfmpegMediaIngest({
  filePath,
  chunkBytes = DEFAULT_CHUNK_BYTES,
  ffmpegPath = DEFAULT_FFMPEG_PATH,
  ffmpegArgs,
  spawn = defaultSpawn
}) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new TypeError('filePath must be a non-empty string');
  }

  /** @type {import('child_process').ChildProcessWithoutNullStreams | null} */
  let child = null;

  const args =
    ffmpegArgs ||
    ['-hide_banner', '-loglevel', 'error', '-i', filePath, '-f', 'mpegts', 'pipe:1'];

  return {
    kind: 'ffmpeg',
    filePath,
    chunkBytes,
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

      const stdoutChunks = [];
      await new Promise((resolve, reject) => {
        child.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
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
            reject(new Error(`ffmpeg exited with code ${code}`));
            return;
          }
          resolve();
        });
        if (child.exitCode === 0) {
          resolve();
        }
      });

      const combined = Buffer.concat(stdoutChunks);
      let offset = 0;
      while (offset + chunkBytes <= combined.length) {
        const slice = combined.subarray(offset, offset + chunkBytes);
        yield {
          payloadBytes: new Uint8Array(slice),
          mimeType: 'video/mp2t'
        };
        offset += chunkBytes;
      }
      if (offset < combined.length) {
        yield {
          payloadBytes: new Uint8Array(combined.subarray(offset)),
          mimeType: 'video/mp2t'
        };
      }
    }
  };
}

/**
 * Prefer ffmpeg ingest when the binary is on PATH; otherwise read the file in fixed chunks.
 * @param {Object} options
 * @param {string} options.filePath
 * @param {number} [options.chunkBytes]
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