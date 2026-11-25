const { EventEmitter } = require('events');
const {
  createRtmpIngest,
  createSrtIngest,
  INGEST_FFMPEG_NOT_FOUND
} = require('../../src/streaming/ingest');

describe('ffmpeg ingest adapters', () => {
  test('missing ffmpeg surfaces INGEST_FFMPEG_NOT_FOUND', async () => {
    const spawn = jest.fn(() => {
      const child = new EventEmitter();
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      child.kill = jest.fn();
      process.nextTick(() => child.emit('error', Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' })));
      return child;
    });
    const ingest = createRtmpIngest({ url: 'rtmp://localhost/live', spawn });
    await expect(async () => {
      // eslint-disable-next-line no-unused-vars
      for await (const _ of ingest.frames()) {
        // no-op
      }
    }).rejects.toMatchObject({ code: INGEST_FFMPEG_NOT_FOUND });
  });

  test('RTMP ingest passes ffmpeg copy mpegts args', async () => {
    const stdout = new EventEmitter();
    const fakeChild = new EventEmitter();
    fakeChild.stdout = stdout;
    fakeChild.stderr = new EventEmitter();
    fakeChild.kill = jest.fn();
    const spawn = jest.fn(() => {
      process.nextTick(() => fakeChild.emit('spawn'));
      return fakeChild;
    });
    const ingest = createRtmpIngest({
      url: 'rtmp://example/live/k',
      ffmpegPath: '/usr/bin/ffmpeg',
      spawn
    });
    const iter = ingest.frames();
    const next = iter.next();
    await new Promise((r) => setImmediate(r));
    stdout.emit('end');
    fakeChild.emit('close', 0);
    await next;
    await iter.next();
    ingest.stop();
    expect(spawn).toHaveBeenCalledWith(
      '/usr/bin/ffmpeg',
      expect.arrayContaining([
        '-i',
        'rtmp://example/live/k',
        '-c',
        'copy',
        '-f',
        'mpegts',
        'pipe:1'
      ])
    );
  });

  test('SRT ingest uses srt url', async () => {
    const stdout = new EventEmitter();
    const fakeChild = new EventEmitter();
    fakeChild.stdout = stdout;
    fakeChild.stderr = new EventEmitter();
    fakeChild.kill = jest.fn();
    const spawn = jest.fn(() => {
      process.nextTick(() => fakeChild.emit('spawn'));
      return fakeChild;
    });
    const ingest = createSrtIngest({
      url: 'srt://0.0.0.0:9000?mode=listener',
      spawn
    });
    const iter = ingest.frames();
    const next = iter.next();
    await new Promise((r) => setImmediate(r));
    stdout.emit('end');
    fakeChild.emit('close', 0);
    await next;
    await iter.next();
    ingest.stop();
    expect(spawn.mock.calls[0][1]).toContain('srt://0.0.0.0:9000?mode=listener');
  });
});