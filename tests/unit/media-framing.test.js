const fs = require('fs');
const path = require('path');
const {
  parseAnnexBAccessUnits,
  parseFmp4Fragments,
  AnnexBIncrementalParser,
  Fmp4IncrementalParser
} = require('../../src/streaming/media-framing');

const annexFixture = fs.readFileSync(
  path.join(__dirname, '../fixtures/h264-annexb-access-units.bin')
);
const fmp4Fixture = fs.readFileSync(path.join(__dirname, '../fixtures/fmp4-fragments.bin'));

describe('media framing parsers', () => {
  test('Annex-B access units with IDR keyframe flag', () => {
    const frames = parseAnnexBAccessUnits(new Uint8Array(annexFixture));
    expect(frames).toHaveLength(2);
    expect(frames[0].keyframe).toBe(true);
    expect(frames[0].timestampMs).toBe(0);
    expect(frames[0].mimeType).toBe('video/h264');
    expect(frames[1].keyframe).toBe(false);
    expect(frames[1].timestampMs).toBe(33);
  });

  test('Annex-B incremental parse across chunk boundary', () => {
    const full = new Uint8Array(annexFixture);
    const split = Math.floor(full.length / 2);
    const parser = new AnnexBIncrementalParser();
    const first = parser.push(full.subarray(0, split));
    const second = parser.push(full.subarray(split));
    const flushed = parser.flush();
    const all = [...first, ...second, ...flushed];
    expect(all).toHaveLength(2);
    expect(all[0].keyframe).toBe(true);
    expect(all[1].keyframe).toBe(false);
  });

  test('Annex-B split mid start-code is recovered on next push', () => {
    const full = new Uint8Array(annexFixture);
    const cut = full.length - 2;
    const parser = new AnnexBIncrementalParser();
    parser.push(full.subarray(0, cut));
    const rest = parser.push(full.subarray(cut));
    const tail = parser.flush();
    expect([...rest, ...tail]).toHaveLength(1);
    expect([...rest, ...tail][0].keyframe).toBe(false);
  });

  test('fMP4 init and media fragment timestamps', () => {
    const frames = parseFmp4Fragments(new Uint8Array(fmp4Fixture));
    expect(frames).toHaveLength(2);
    expect(frames[0].timestampMs).toBe(0);
    expect(frames[0].keyframe).toBe(true);
    expect(frames[1].timestampMs).toBe(3000);
    expect(frames[1].keyframe).toBe(true);
  });

  test('fMP4 incremental parse with split mid-box header', () => {
    const full = new Uint8Array(fmp4Fixture);
    const cut = 10;
    const parser = new Fmp4IncrementalParser();
    const a = parser.push(full.subarray(0, cut));
    const b = parser.push(full.subarray(cut));
    const all = [...a, ...b, ...parser.flush()];
    expect(all).toHaveLength(2);
    expect(all[1].timestampMs).toBe(3000);
  });
});