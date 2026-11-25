/**
 * Build minimal MPEG-TS packets carrying Annex-B H.264 for unit tests.
 */

const TS = 188;
const SYNC = 0x47;

function patSection(pmtPid) {
  return new Uint8Array([
    0x00,
    0xb0,
    0x0d,
    0x00,
    0x01,
    0xc1,
    0x00,
    0x00,
    0x00,
    0x01,
    (pmtPid >> 8) & 0x1f,
    pmtPid & 0xff,
    0x00,
    0x00,
    0x00,
    0x00
  ]);
}

function pmtSection(videoPid) {
  return new Uint8Array([
    0x02,
    0xb0,
    0x12,
    0x00,
    0x01,
    0xc1,
    0x00,
    0x00,
    0xe0,
    0x00,
    0x00,
    0x00,
    0x1b,
    (videoPid >> 8) & 0x1f,
    videoPid & 0xff,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00
  ]);
}

function writePts(buf, offset, pts90k) {
  const v = pts90k >>> 0;
  buf[offset] = 0x21 | ((v >>> 29) & 0x0e);
  buf[offset + 1] = (v >>> 22) & 0xff;
  buf[offset + 2] = 0x01 | ((v >>> 14) & 0xfe);
  buf[offset + 3] = (v >>> 7) & 0xff;
  buf[offset + 4] = 0x01 | ((v << 1) & 0xfe);
}

function buildPes(annexB, pts90k) {
  const headerLen = 14;
  const pes = new Uint8Array(headerLen + annexB.length);
  pes[0] = 0x00;
  pes[1] = 0x00;
  pes[2] = 0x01;
  pes[3] = 0xe0;
  const pesLen = headerLen - 6 + annexB.length;
  pes[4] = (pesLen >> 8) & 0xff;
  pes[5] = pesLen & 0xff;
  pes[6] = 0x80;
  pes[7] = 0x80;
  pes[8] = 0x05;
  writePts(pes, 9, pts90k);
  pes.set(annexB, headerLen);
  return pes;
}

function tsPacket(pid, payload, { payloadStart = true, cc = 0 }) {
  const pkt = new Uint8Array(TS);
  pkt.fill(0xff);
  pkt[0] = SYNC;
  pkt[1] = ((payloadStart ? 0x40 : 0x00) | ((pid >> 8) & 0x1f)) & 0xff;
  pkt[2] = pid & 0xff;
  pkt[3] = 0x10 | (cc & 0x0f);
  const max = Math.min(payload.length, TS - 4);
  pkt.set(payload.subarray(0, max), 4);
  return pkt;
}

/**
 * @param {Uint8Array} annexB
 * @param {number} [pts90k]
 */
function buildMpegTsFromAnnexB(annexB, pts90k = 90000) {
  const pmtPid = 0x0100;
  const videoPid = 0x0101;
  const patPayload = new Uint8Array(1 + patSection(pmtPid).length);
  patPayload[0] = 0x00;
  patPayload.set(patSection(pmtPid), 1);
  const pmtPayload = new Uint8Array(1 + pmtSection(videoPid).length);
  pmtPayload[0] = 0x00;
  pmtPayload.set(pmtSection(videoPid), 1);
  const pes = buildPes(annexB, pts90k);

  const packets = [
    tsPacket(0x0000, patPayload, { payloadStart: true, cc: 0 }),
    tsPacket(pmtPid, pmtPayload, { payloadStart: true, cc: 0 })
  ];

  let offset = 0;
  let cc = 0;
  let first = true;
  while (offset < pes.length) {
    const slice = pes.subarray(offset, offset + TS - 4);
    packets.push(tsPacket(videoPid, slice, { payloadStart: first, cc }));
    offset += slice.length;
    first = false;
    cc = (cc + 1) % 16;
  }

  const out = new Uint8Array(packets.length * TS);
  for (let i = 0; i < packets.length; i += 1) {
    out.set(packets[i], i * TS);
  }
  return out;
}

module.exports = {
  TS,
  buildMpegTsFromAnnexB
};