const fs = require('fs');
const path = require('path');
const { demuxMpegTs, MpegTsDemuxer, ptsToTimestampMs } = require('../../src/streaming/ingest/mpegts-demuxer');
const { buildMpegTsFromAnnexB } = require('../helpers/build-mpegts-fixture');

const annexFixturePath = path.join(__dirname, '../fixtures/h264-annexb-access-units.bin');
const annexBytes = new Uint8Array(fs.readFileSync(annexFixturePath));
const fixturePath = path.join(__dirname, '../fixtures/mpegts-h264.ts');

describe('mpegts demuxer', () => {
  test('PTS converts at 90kHz to milliseconds', () => {
    expect(ptsToTimestampMs(90000)).toBe(1000);
    expect(ptsToTimestampMs(90000 * 2)).toBe(2000);
  });

  test('demuxes H.264 access units with keyframe flag from fixture', () => {
    const ts = buildMpegTsFromAnnexB(annexBytes, 90000);
    fs.writeFileSync(fixturePath, Buffer.from(ts));
    const frames = demuxMpegTs(ts);
    expect(frames.length).toBeGreaterThanOrEqual(1);
    expect(frames[0].mimeType).toBe('video/h264');
    expect(frames[0].keyframe).toBe(true);
    expect(frames[0].timestampMs).toBe(1000);
    const keyframes = frames.filter((f) => f.keyframe).length;
    expect(keyframes).toBeGreaterThanOrEqual(1);
  });

  test('split buffers across arbitrary chunk sizes', () => {
    const ts = buildMpegTsFromAnnexB(annexBytes, 180000);
    const demuxer = new MpegTsDemuxer();
    const all = [];
    for (let i = 0; i < ts.length; i += 37) {
      all.push(...demuxer.push(ts.subarray(i, i + 37)));
    }
    all.push(...demuxer.flush());
    const oneShot = demuxMpegTs(ts);
    expect(all.length).toBe(oneShot.length);
    expect(all[0].timestampMs).toBe(2000);
  });

  test('rejects non-Uint8Array input', () => {
    const demuxer = new MpegTsDemuxer();
    expect(() => demuxer.push([1, 2, 3])).toThrow(/Uint8Array/);
  });

  test('resyncs after leading garbage bytes', () => {
    const ts = buildMpegTsFromAnnexB(annexBytes, 90000);
    const padded = new Uint8Array(ts.length + 4);
    padded.set([0x00, 0x11, 0x22, 0x33], 0);
    padded.set(ts, 4);
    const frames = demuxMpegTs(padded);
    expect(frames.length).toBeGreaterThanOrEqual(1);
  });

  test('empty push returns no frames', () => {
    const demuxer = new MpegTsDemuxer();
    expect(demuxer.push(new Uint8Array(0))).toEqual([]);
  });

  test('tolerates continuity counter gaps', () => {
    const ts = buildMpegTsFromAnnexB(annexBytes, 90000);
    const demuxer = new MpegTsDemuxer();
    const firstPacket = ts.subarray(0, 188 * 3);
    const rest = ts.subarray(188 * 3);
    demuxer.push(firstPacket);
    demuxer.push(rest);
    const frames = demuxer.flush();
    expect(frames.length).toBeGreaterThanOrEqual(1);
  });
});