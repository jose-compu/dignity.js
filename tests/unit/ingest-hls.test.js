const { buildMpegTsFromAnnexB } = require('../helpers/build-mpegts-fixture');
const { createHlsIngest } = require('../../src/streaming/ingest');
const annexBytes = new Uint8Array([0, 0, 0, 1, 0x65, 0x88, 0x84, 0x00]);

describe('HLS ingest', () => {
  test('fetches new segments in order only once', async () => {
    const seg1 = buildMpegTsFromAnnexB(annexBytes, 90000);
    const seg2 = buildMpegTsFromAnnexB(annexBytes, 180000);
    const fetches = [];
    const fetch = jest.fn(async (url) => {
      fetches.push(url);
      if (url.endsWith('live.m3u8')) {
        return {
          ok: true,
          text: async () => '#EXTM3U\n#EXTINF:1,\nseg0.ts\n#EXTINF:1,\nseg1.ts\n'
        };
      }
      if (url.endsWith('seg0.ts')) {
        return { ok: true, arrayBuffer: async () => seg1.buffer.slice(seg1.byteOffset, seg1.byteOffset + seg1.byteLength) };
      }
      if (url.endsWith('seg1.ts')) {
        return { ok: true, arrayBuffer: async () => seg2.buffer.slice(seg2.byteOffset, seg2.byteOffset + seg2.byteLength) };
      }
      throw new Error(`unexpected ${url}`);
    });

    const ingest = createHlsIngest({
      playlistUrl: 'https://example.test/live.m3u8',
      fetch,
      pollIntervalMs: 5
    });

    const timer = setTimeout(() => ingest.stop(), 30);
    const frames = [];
    for await (const frame of ingest.frames()) {
      frames.push(frame);
      if (frames.length >= 2) {
        ingest.stop();
        break;
      }
    }
    clearTimeout(timer);

    expect(fetch).toHaveBeenCalled();
    const segFetches = fetches.filter((u) => u.includes('.ts'));
    expect(segFetches).toEqual(['https://example.test/seg0.ts', 'https://example.test/seg1.ts']);
    expect(frames[0].timestampMs).toBe(1000);
    expect(frames[1].timestampMs).toBe(2000);
  });
});