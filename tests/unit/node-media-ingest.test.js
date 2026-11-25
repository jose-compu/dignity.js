const fs = require('fs');
const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');
const {
  createFileMediaIngest,
  createFfmpegMediaIngest,
  resolveNodeMediaIngest
} = require('../../src/streaming/node-media-ingest');

const fixturePath = path.join(__dirname, '../fixtures/stream-origin-chunks.bin');
const annexFixturePath = path.join(__dirname, '../fixtures/h264-annexb-access-units.bin');
const fmp4FixturePath = path.join(__dirname, '../fixtures/fmp4-fragments.bin');
const fixtureBytes = fs.readFileSync(fixturePath);
const annexFixtureBytes = fs.readFileSync(annexFixturePath);
const fmp4FixtureBytes = fs.readFileSync(fmp4FixturePath);

describe('node media ingest', () => {
  test('file bytes split with no ffmpeg', async () => {
    const ingest = createFileMediaIngest({ filePath: fixturePath, chunkBytes: 5 });
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
    }
    expect(frames).toHaveLength(4);
    expect(Buffer.from(frames[0].payloadBytes).toString('utf8')).toBe('abcde');
    expect(Buffer.from(frames[3].payloadBytes).toString('utf8')).toBe('p');
    expect(frames.every((f) => f.keyframe === false)).toBe(true);
  });

  test('injected spawn used when ffmpeg ingest succeeds', async () => {
    const stdout = new EventEmitter();
    const fakeChild = new EventEmitter();
    fakeChild.stdout = stdout;
    fakeChild.stderr = new EventEmitter();
    fakeChild.kill = jest.fn();
    fakeChild.exitCode = null;
    fakeChild.killed = false;

    const spawn = jest.fn(() => {
      process.nextTick(() => fakeChild.emit('spawn'));
      process.nextTick(() => {
        stdout.emit('data', annexFixtureBytes.subarray(0, 6));
        stdout.emit('data', annexFixtureBytes.subarray(6));
        fakeChild.emit('close', 0);
      });
      return fakeChild;
    });

    const ingest = createFfmpegMediaIngest({
      filePath: annexFixturePath,
      format: 'annexb',
      spawn
    });
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
    }

    expect(spawn).toHaveBeenCalled();
    expect(frames).toHaveLength(2);
    expect(frames[0].keyframe).toBe(true);
    expect(frames[0].timestampMs).toBe(0);
    expect(frames[1].keyframe).toBe(false);
  });

  test('ffmpeg fmp4 stdout becomes framed fragments', async () => {
    const stdout = new EventEmitter();
    const fakeChild = new EventEmitter();
    fakeChild.stdout = stdout;
    fakeChild.stderr = new EventEmitter();
    fakeChild.kill = jest.fn();
    fakeChild.exitCode = null;
    fakeChild.killed = false;

    const spawn = jest.fn(() => {
      process.nextTick(() => {
        stdout.emit('data', fmp4FixtureBytes.subarray(0, 40));
        stdout.emit('data', fmp4FixtureBytes.subarray(40));
        fakeChild.emit('close', 0);
      });
      return fakeChild;
    });

    const ingest = createFfmpegMediaIngest({ filePath: fmp4FixturePath, format: 'fmp4', spawn });
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
    }
    expect(frames).toHaveLength(2);
    expect(frames[1].timestampMs).toBe(3000);
    expect(frames[1].keyframe).toBe(true);
  });

  test('ENOENT on resolve falls back to file bytes', async () => {
    const spawnSync = jest.fn(() => ({
      error: Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' }),
      status: null,
      stdout: ''
    }));

    const ingest = await resolveNodeMediaIngest({
      filePath: fixturePath,
      chunkBytes: fixtureBytes.length,
      spawnSync
    });

    expect(ingest.kind).toBe('file');
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
    }
    expect(frames).toHaveLength(1);
    expect(Buffer.from(frames[0].payloadBytes).equals(fixtureBytes)).toBe(true);
  });

  test('empty file yields no frames', async () => {
    const emptyPath = path.join(os.tmpdir(), `dignity-empty-${Date.now()}.bin`);
    fs.writeFileSync(emptyPath, Buffer.alloc(0));
    try {
      const ingest = createFileMediaIngest({ filePath: emptyPath });
      const frames = [];
      for await (const frame of ingest.frames()) {
        frames.push(frame);
      }
      expect(frames).toHaveLength(0);
    } finally {
      fs.unlinkSync(emptyPath);
    }
  });

  test('missing file throws', () => {
    expect(() =>
      createFileMediaIngest({ filePath: path.join(os.tmpdir(), 'definitely-missing-dignity-stream.bin') })
    ).toThrow(/not found/);
  });
});