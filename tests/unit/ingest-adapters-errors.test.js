const { createMpegTsIngest, createHlsIngest, createRtmpIngest, assertFfmpegAvailable } = require('../../src/streaming/ingest');

describe('ingest adapter validation', () => {
  test('createMpegTsIngest requires input', () => {
    expect(() => createMpegTsIngest({})).toThrow(/input/);
  });

  test('createMpegTsIngest rejects unknown input at frames()', async () => {
    const ingest = createMpegTsIngest({ input: { foo: 1 } });
    await expect(async () => {
      // eslint-disable-next-line no-unused-vars
      for await (const _ of ingest.frames()) {
        // no-op
      }
    }).rejects.toThrow(/file path|Readable|udp/);
  });

  test('createHlsIngest requires playlistUrl', () => {
    expect(() => createHlsIngest({ playlistUrl: '' })).toThrow(/playlistUrl/);
  });

  test('createRtmpIngest requires url', () => {
    expect(() => createRtmpIngest({ url: '' })).toThrow(/url/);
  });

  test('assertFfmpegAvailable throws when spawnSync reports ENOENT', () => {
    const spawnSync = () => ({ error: Object.assign(new Error('enoent'), { code: 'ENOENT' }) });
    expect(() => assertFfmpegAvailable('/missing/ffmpeg', spawnSync)).toThrow(/ffmpeg not found/);
  });
});