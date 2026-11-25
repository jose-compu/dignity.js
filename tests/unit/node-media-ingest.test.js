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
const fixtureBytes = fs.readFileSync(fixturePath);

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
        stdout.emit('data', Buffer.from(fixtureBytes));
        fakeChild.emit('close', 0);
      });
      return fakeChild;
    });

    const ingest = createFfmpegMediaIngest({ filePath: fixturePath, chunkBytes: 8, spawn });
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
    }

    expect(spawn).toHaveBeenCalled();
    expect(frames.length).toBeGreaterThan(0);
    const joined = Buffer.concat(frames.map((f) => Buffer.from(f.payloadBytes)));
    expect(joined.equals(fixtureBytes)).toBe(true);
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