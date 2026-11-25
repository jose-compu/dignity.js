/**
 * Node ingest adapters (#152 milestone 6). Not for browser bundles.
 * @experimental
 */

const fs = require('fs');
const dgram = require('dgram');
const http = require('http');
const { spawn: defaultSpawn, spawnSync: defaultSpawnSync } = require('child_process');
const { MpegTsDemuxer } = require('./mpegts-demuxer');
const { Fmp4IncrementalParser } = require('../media-framing');

const DEFAULT_FFMPEG_PATH = 'ffmpeg';
const INGEST_FFMPEG_NOT_FOUND = 'INGEST_FFMPEG_NOT_FOUND';

function isEnoentError(err) {
  return Boolean(err && (err.code === 'ENOENT' || err.errno === 'ENOENT'));
}

/**
 * @param {string} ffmpegPath
 * @param {typeof defaultSpawnSync} [spawnSync]
 */
function assertFfmpegAvailable(ffmpegPath = DEFAULT_FFMPEG_PATH, spawnSync = defaultSpawnSync) {
  const result = spawnSync(ffmpegPath, ['-version'], { encoding: 'utf8' });
  if (result.error && isEnoentError(result.error)) {
    const err = new Error(`ffmpeg not found at ${ffmpegPath}`);
    err.code = INGEST_FFMPEG_NOT_FOUND;
    throw err;
  }
  if (result.status !== 0 && !result.stdout) {
    const err = new Error(`ffmpeg not found at ${ffmpegPath}`);
    err.code = INGEST_FFMPEG_NOT_FOUND;
    throw err;
  }
}

/**
 * @param {AsyncIterable<Uint8Array> | NodeJS.ReadableStream} byteSource
 * @param {AbortSignal | null} [signal]
 */
async function* framesFromMpegTsByteSource(byteSource, signal = null) {
  const demuxer = new MpegTsDemuxer();
  const queue = [];
  let done = false;
  let streamError = null;
  let resolveWait = null;

  const notify = () => {
    if (resolveWait) {
      resolveWait();
      resolveWait = null;
    }
  };

  const wait = () =>
    new Promise((resolve) => {
      if (queue.length > 0 || done || streamError) {
        resolve();
        return;
      }
      resolveWait = resolve;
    });

  const onChunk = (buf) => {
    const chunk = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const frames = demuxer.push(chunk);
    for (const f of frames) {
      queue.push(f);
    }
    notify();
  };

  if (byteSource && typeof byteSource[Symbol.asyncIterator] === 'function') {
    (async () => {
      try {
        for await (const chunk of byteSource) {
          if (signal && signal.aborted) {
            break;
          }
          onChunk(chunk);
        }
        const tail = demuxer.flush();
        for (const f of tail) {
          queue.push(f);
        }
      } catch (err) {
        streamError = err;
      } finally {
        done = true;
        notify();
      }
    })();
  } else if (byteSource && typeof byteSource.on === 'function') {
    byteSource.on('data', onChunk);
    byteSource.on('error', (err) => {
      streamError = err;
      done = true;
      notify();
    });
    byteSource.on('end', () => {
      const tail = demuxer.flush();
      for (const f of tail) {
        queue.push(f);
      }
      done = true;
      notify();
    });
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          if (typeof byteSource.destroy === 'function') {
            byteSource.destroy();
          }
        },
        { once: true }
      );
    }
    if (typeof byteSource.resume === 'function' && byteSource.isPaused && byteSource.isPaused()) {
      byteSource.resume();
    }
  } else {
    throw new TypeError('byteSource must be a Readable stream or async iterable');
  }

  while (queue.length > 0 || !done) {
    if (queue.length === 0) {
      await wait();
      if (streamError) {
        throw streamError;
      }
      if (done && queue.length === 0) {
        break;
      }
    }
    while (queue.length > 0) {
      yield queue.shift();
    }
  }
}

/**
 * @param {Object} options
 * @param {string | NodeJS.ReadableStream | import('dgram').Socket | { type: 'udp'; port: number; address?: string }} options.input
 */
function createMpegTsIngest({ input }) {
  if (input == null) {
    throw new TypeError('input is required');
  }

  /** @type {import('dgram').Socket | null} */
  let udpSocket = null;
  /** @type {AbortController | null} */
  let abort = null;

  const stop = () => {
    if (udpSocket) {
      udpSocket.close();
      udpSocket = null;
    }
    if (abort) {
      abort.abort();
      abort = null;
    }
  };

  return {
    kind: 'mpegts',
    stop,
    async *frames() {
      abort = new AbortController();

      if (typeof input === 'string') {
        const stream = fs.createReadStream(input);
        stream.pause();
        yield* framesFromMpegTsByteSource(stream, abort.signal);
        return;
      }

      if (input && input.type === 'udp') {
        udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        await new Promise((resolve, reject) => {
          udpSocket.once('error', reject);
          udpSocket.bind(input.port, input.address || '0.0.0.0', resolve);
        });

        async function* udpIterable() {
          const q = [];
          let resolveChunk = null;
          let closed = false;
          udpSocket.on('message', (msg) => {
            if (resolveChunk) {
              resolveChunk(msg);
              resolveChunk = null;
            } else {
              q.push(msg);
            }
          });
          udpSocket.on('close', () => {
            closed = true;
            if (resolveChunk) {
              resolveChunk(null);
              resolveChunk = null;
            }
          });
          while (!closed || q.length > 0) {
            if (abort && abort.signal.aborted) {
              break;
            }
            if (q.length > 0) {
              yield q.shift();
              continue;
            }
            const next = await new Promise((resolve) => {
              resolveChunk = resolve;
            });
            if (next === null) {
              break;
            }
            yield next;
          }
        }

        yield* framesFromMpegTsByteSource(udpIterable(), abort.signal);
        return;
      }

      if (input && typeof input.on === 'function') {
        yield* framesFromMpegTsByteSource(input, abort.signal);
        return;
      }

      throw new TypeError('input must be a file path, Readable stream, or udp socket descriptor');
    }
  };
}

/**
 * @param {Object} options
 * @param {string} options.playlistUrl
 * @param {typeof fetch} [options.fetch]
 * @param {number} [options.pollIntervalMs]
 */
function createHlsIngest({ playlistUrl, fetch: fetchFn, pollIntervalMs = 1000 }) {
  if (typeof playlistUrl !== 'string' || playlistUrl.trim() === '') {
    throw new TypeError('playlistUrl must be a non-empty string');
  }
  const doFetch = fetchFn || globalThis.fetch;
  if (typeof doFetch !== 'function') {
    throw new TypeError('fetch implementation is required');
  }

  let stopped = false;
  const seen = new Set();

  return {
    kind: 'hls',
    playlistUrl,
    stop() {
      stopped = true;
    },
    async *frames() {
      while (!stopped) {
        const res = await doFetch(playlistUrl);
        if (!res.ok) {
          throw new Error(`HLS playlist fetch failed: ${res.status}`);
        }
        const text = await res.text();
        const lines = text.split(/\r?\n/).map((l) => l.trim());
        const segmentUrls = [];
        let base = playlistUrl;
        const slash = base.lastIndexOf('/');
        if (slash >= 0) {
          base = base.slice(0, slash + 1);
        }
        for (const line of lines) {
          if (!line || line.startsWith('#')) {
            continue;
          }
          const url = line.startsWith('http') ? line : `${base}${line}`;
          if (!seen.has(url)) {
            segmentUrls.push(url);
          }
        }

        for (const segUrl of segmentUrls) {
          if (stopped) {
            return;
          }
          const segRes = await doFetch(segUrl);
          if (!segRes.ok) {
            throw new Error(`HLS segment fetch failed: ${segRes.status}`);
          }
          const buf = new Uint8Array(await segRes.arrayBuffer());
          seen.add(segUrl);

          if (segUrl.endsWith('.m4s') || segUrl.includes('.mp4')) {
            const fmp4 = new Fmp4IncrementalParser();
            for (const frame of fmp4.push(buf).concat(fmp4.flush())) {
              yield frame;
            }
          } else {
            const demuxer = new MpegTsDemuxer();
            for (const frame of demuxer.push(buf).concat(demuxer.flush())) {
              yield frame;
            }
          }
        }

        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }
    }
  };
}

/**
 * @param {Object} options
 * @param {string} options.url
 * @param {string} [options.ffmpegPath]
 * @param {typeof defaultSpawn} [options.spawn]
 */
function createRtmpIngest({ url, ffmpegPath = DEFAULT_FFMPEG_PATH, spawn = defaultSpawn }) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new TypeError('url must be a non-empty string');
  }
  return createFfmpegMpegTsPipeIngest({
    kind: 'rtmp',
    url,
    ffmpegPath,
    spawn,
    inputArgs: ['-i', url]
  });
}

/**
 * @param {Object} options
 * @param {string} options.url
 * @param {string} [options.ffmpegPath]
 * @param {typeof defaultSpawn} [options.spawn]
 */
function createSrtIngest({ url, ffmpegPath = DEFAULT_FFMPEG_PATH, spawn = defaultSpawn }) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new TypeError('url must be a non-empty string');
  }
  return createFfmpegMpegTsPipeIngest({
    kind: 'srt',
    url,
    ffmpegPath,
    spawn,
    inputArgs: ['-i', url]
  });
}

function createFfmpegMpegTsPipeIngest({ kind, url, ffmpegPath, spawn, inputArgs }) {
  /** @type {import('child_process').ChildProcessWithoutNullStreams | null} */
  let child = null;

  const args = [
    '-hide_banner',
    '-loglevel',
    'error',
    ...inputArgs,
    '-c',
    'copy',
    '-f',
    'mpegts',
    'pipe:1'
  ];

  return {
    kind,
    url,
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
      try {
        child = spawn(ffmpegPath, args);
      } catch (err) {
        if (isEnoentError(err)) {
          const notFound = new Error(`ffmpeg not found at ${ffmpegPath}`);
          notFound.code = INGEST_FFMPEG_NOT_FOUND;
          throw notFound;
        }
        throw err;
      }

      await new Promise((resolve, reject) => {
        child.on('error', (err) => {
          if (isEnoentError(err)) {
            const notFound = new Error(`ffmpeg not found at ${ffmpegPath}`);
            notFound.code = INGEST_FFMPEG_NOT_FOUND;
            reject(notFound);
            return;
          }
          reject(err);
        });
        child.on('spawn', resolve);
      });

      let closeCode = null;
      const closePromise = new Promise((resolve, reject) => {
        child.on('close', (code) => {
          closeCode = code;
          if (code !== 0 && code !== null) {
            reject(new Error(`ffmpeg exited with code ${code}`));
            return;
          }
          resolve();
        });
      });
      yield* framesFromMpegTsByteSource(child.stdout);
      await closePromise;
    }
  };
}

/**
 * WHIP (RFC 9725) resource handler with injectable WebRTC peer factory.
 * AAC/H.264 frames arrive via `peerFactory` and are exposed as `frames()`.
 *
 * @param {Object} options
 * @param {(
 *   offerSdp: string,
 *   ctx: { resourceId: string }
 * ) => Promise<{ answerSdp: string, onFrame?: (cb: (frame: object) => void) => void, close?: () => void }>} options.peerFactory
 * @param {(req: import('http').IncomingMessage) => boolean | Promise<boolean>} [options.authorize]
 * @param {string} [options.mountPath]
 */
function createWhipIngest({ peerFactory, authorize, mountPath = '/whip' }) {
  if (typeof peerFactory !== 'function') {
    throw new TypeError('peerFactory is required');
  }

  /** @type {Map<string, { queue: object[], notify: (() => void) | null, closed: boolean, closePeer?: () => void }>} */
  const sessions = new Map();
  let resourceSeq = 0;

  const enqueue = (id, frame) => {
    const s = sessions.get(id);
    if (!s || s.closed) {
      return;
    }
    s.queue.push(frame);
    if (s.notify) {
      s.notify();
      s.notify = null;
    }
  };

  const normalizedMount = mountPath.endsWith('/') ? mountPath.slice(0, -1) : mountPath;

  /**
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  async function handleRequest(req, res) {
    const url = req.url || '/';
    if (!url.startsWith(normalizedMount)) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const suffix = url.slice(normalizedMount.length) || '/';

    if (req.method === 'POST' && (suffix === '' || suffix === '/')) {
      if (authorize) {
        const ok = await authorize(req);
        if (!ok) {
          res.statusCode = 401;
          res.end();
          return;
        }
      }
      const contentType = String(req.headers['content-type'] || '');
      if (!contentType.toLowerCase().includes('application/sdp')) {
        res.statusCode = 415;
        res.setHeader('Accept', 'application/sdp');
        res.end();
        return;
      }

      const body = await readBody(req);
      const resourceId = `res-${++resourceSeq}`;
      const peer = await peerFactory(body.toString('utf8'), { resourceId });
      const location = `${normalizedMount}/${resourceId}`;
      sessions.set(resourceId, { queue: [], notify: null, closed: false });
      if (peer.onFrame) {
        peer.onFrame((frame) => enqueue(resourceId, frame));
      }
      if (peer.close) {
        const session = sessions.get(resourceId);
        if (session) {
          session.closePeer = peer.close;
        }
      }

      res.statusCode = 201;
      res.setHeader('Location', location);
      res.setHeader('Content-Type', 'application/sdp');
      res.end(peer.answerSdp || '');
      return;
    }

    if (req.method === 'DELETE' && suffix.startsWith('/')) {
      const id = suffix.slice(1).split('/')[0];
      const session = sessions.get(id);
      if (!session) {
        res.statusCode = 404;
        res.end();
        return;
      }
      session.closed = true;
      if (session.closePeer) {
        session.closePeer();
      }
      sessions.delete(id);
      res.statusCode = 200;
      res.end();
      return;
    }

    res.statusCode = 405;
    res.end();
  }

  return {
    kind: 'whip',
    mountPath: normalizedMount,
    sessions,
    handleRequest,
    stop() {
      for (const [id, session] of sessions) {
        session.closed = true;
        if (session.closePeer) {
          session.closePeer();
        }
        sessions.delete(id);
      }
    },
    async *frames() {
      const activeId = () => {
        for (const [id, s] of sessions) {
          if (!s.closed) {
            return id;
          }
        }
        return null;
      };

      while (true) {
        const id = activeId();
        if (!id) {
          await new Promise((r) => setTimeout(r, 10));
          continue;
        }
        const session = sessions.get(id);
        if (session.queue.length > 0) {
          yield session.queue.shift();
          continue;
        }
        await new Promise((resolve) => {
          session.notify = resolve;
        });
      }
    }
  };
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Buffer>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = {
  INGEST_FFMPEG_NOT_FOUND,
  assertFfmpegAvailable,
  framesFromMpegTsByteSource,
  createMpegTsIngest,
  createHlsIngest,
  createRtmpIngest,
  createSrtIngest,
  createWhipIngest
};