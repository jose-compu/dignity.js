const path = require('path');
const { createMpegTsIngest } = require('../../src/streaming/ingest');

const fixturePath = path.join(__dirname, '../fixtures/mpegts-h264.ts');

describe('createMpegTsIngest', () => {
  test('reads MPEG-TS file into framed access units', async () => {
    const ingest = createMpegTsIngest({ input: fixturePath });
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
    }
    expect(frames.length).toBeGreaterThanOrEqual(1);
    expect(frames[0].mimeType).toBe('video/h264');
    expect(frames[0].keyframe).toBe(true);
  });
});