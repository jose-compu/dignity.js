/**
 * Pure-JS MPEG-TS demuxer (188-byte packets, PAT/PMT, PES) for H.264 ingest (#152 milestone 6).
 * Browser-safe — no Node imports.
 * @experimental
 */

const { parseAnnexBAccessUnits, H264_MIME } = require('../media-framing');

const TS_PACKET_SIZE = 188;
const SYNC_BYTE = 0x47;
const PAT_PID = 0x0000;
const STREAM_TYPE_H264 = 0x1b;
const STREAM_TYPE_AAC = 0x0f;
const PTS_WRAP = 1n << 33n;

function concatBytes(...parts) {
  const chunks = parts.filter((p) => p && p.length > 0);
  if (chunks.length === 0) {
    return new Uint8Array(0);
  }
  if (chunks.length === 1) {
    return chunks[0];
  }
  let total = 0;
  for (const c of chunks) {
    total += c.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/**
 * 33-bit PTS/DTS at 90 kHz → milliseconds (wrap-safe within one session).
 * @param {bigint | number | null} pts
 */
function ptsToTimestampMs(pts) {
  if (pts == null) {
    return undefined;
  }
  const v = typeof pts === 'bigint' ? pts : BigInt(pts >>> 0);
  return Math.round(Number((v * 1000n) / 90000n));
}

function readU16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

/**
 * @param {Uint8Array} payload PSI section (after pointer_field if any)
 * @returns {{ programs: Map<number, number>, version: number } | null}
 */
function parsePatSection(payload) {
  if (payload.length < 8 || payload[0] !== 0x00) {
    return null;
  }
  const sectionLength = ((payload[1] & 0x0f) << 8) | payload[2];
  if (sectionLength + 3 > payload.length) {
    return null;
  }
  const version = (payload[5] >> 1) & 0x1f;
  const programs = new Map();
  let offset = 8;
  const end = 3 + sectionLength - 4;
  while (offset + 4 <= end) {
    const programNumber = readU16BE(payload, offset);
    const pid = ((payload[offset + 2] & 0x1f) << 8) | payload[offset + 3];
    if (programNumber !== 0) {
      programs.set(programNumber, pid);
    }
    offset += 4;
  }
  return { programs, version };
}

/**
 * @param {Uint8Array} payload
 */
function parsePmtSection(payload) {
  if (payload.length < 12 || payload[0] !== 0x02) {
    return null;
  }
  const sectionLength = ((payload[1] & 0x0f) << 8) | payload[2];
  if (sectionLength + 3 > payload.length) {
    return null;
  }
  const pcrPid = ((payload[8] & 0x1f) << 8) | payload[9];
  const programInfoLength = ((payload[10] & 0x0f) << 8) | payload[11];
  let offset = 12 + programInfoLength;
  const end = 3 + sectionLength - 4;
  /** @type {{ streamType: number, elementaryPid: number }[]} */
  const streams = [];
  while (offset + 5 <= end) {
    const streamType = payload[offset];
    const elementaryPid = ((payload[offset + 1] & 0x1f) << 8) | payload[offset + 2];
    const esInfoLength = ((payload[offset + 3] & 0x0f) << 8) | payload[offset + 4];
    streams.push({ streamType, elementaryPid });
    offset += 5 + esInfoLength;
  }
  return { pcrPid, streams };
}

/**
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {{ pts: bigint | null, dts: bigint | null, headerLen: number } | null}
 */
function parsePesHeader(bytes, offset) {
  if (offset + 9 > bytes.length) {
    return null;
  }
  if (bytes[offset] !== 0x00 || bytes[offset + 1] !== 0x00 || bytes[offset + 2] !== 0x01) {
    return null;
  }
  const pesPacketLength = readU16BE(bytes, offset + 4);
  const flags = bytes[offset + 7];
  const pesHeaderDataLength = bytes[offset + 8];
  const headerStart = offset + 9;
  const headerEnd = headerStart + pesHeaderDataLength;
  if (headerEnd > bytes.length) {
    return null;
  }
  let pts = null;
  let dts = null;
  const ptsDtsFlags = (flags >> 6) & 0x03;
  let p = headerStart;
  if (ptsDtsFlags === 2 || ptsDtsFlags === 3) {
    if (p + 5 > headerEnd) {
      return null;
    }
    pts = readPts(bytes, p);
    p += 5;
  }
  if (ptsDtsFlags === 3) {
    if (p + 5 > headerEnd) {
      return null;
    }
    dts = readPts(bytes, p);
    p += 5;
  }
  const totalHeader = 9 + pesHeaderDataLength;
  const payloadStart = offset + totalHeader;
  const packetEnd =
    pesPacketLength > 0 ? Math.min(offset + 6 + pesPacketLength, bytes.length) : bytes.length;
  return { pts, dts, headerLen: totalHeader, payloadStart, packetEnd };
}

function readPts(bytes, offset) {
  const pts =
    ((bytes[offset] & 0x0e) << 29) |
    (bytes[offset + 1] << 22) |
    ((bytes[offset + 2] & 0xfe) << 14) |
    (bytes[offset + 3] << 7) |
    ((bytes[offset + 4] >> 1) & 0x7f);
  return BigInt(pts);
}

class MpegTsDemuxer {
  constructor() {
    /** @type {Uint8Array} */
    this._carry = new Uint8Array(0);
    this._pmtPid = null;
    this._videoPid = null;
    this._audioPid = null;
    /** @type {Record<number, number>} */
    this._lastCc = {};
    /** @type {Record<number, { bytes: Uint8Array[], pts: bigint | null }>} */
    this._pes = {};
    this._skipAudio = true;
  }

  /**
   * @param {Uint8Array} chunk
   * @returns {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>}
   */
  push(chunk) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError('chunk must be a Uint8Array');
    }
    this._carry = concatBytes(this._carry, chunk);
    const frames = [];
    while (this._carry.length >= TS_PACKET_SIZE) {
      if (this._carry[0] !== SYNC_BYTE) {
        const next = this._carry.indexOf(SYNC_BYTE, 1);
        if (next < 0) {
          this._carry = this._carry.subarray(this._carry.length - 1);
          break;
        }
        this._carry = this._carry.subarray(next);
        continue;
      }
      const packet = this._carry.subarray(0, TS_PACKET_SIZE);
      this._carry = this._carry.subarray(TS_PACKET_SIZE);
      const emitted = this._processPacket(packet);
      frames.push(...emitted);
    }
    return frames;
  }

  flush() {
    const frames = [];
    for (const pid of Object.keys(this._pes)) {
      const id = Number(pid);
      frames.push(...this._flushPes(id));
    }
    this._carry = new Uint8Array(0);
    return frames;
  }

  /**
   * @param {Uint8Array} packet
   */
  _processPacket(packet) {
    const adaptationFieldControl = (packet[3] >> 4) & 0x03;
    const pid = ((packet[1] & 0x1f) << 8) | packet[2];
    const payloadUnitStart = (packet[1] & 0x40) !== 0;
    const cc = packet[3] & 0x0f;

    const last = this._lastCc[pid];
    if (last !== undefined && last !== cc && (last + 1) % 16 !== cc) {
      // tolerate continuity jumps — reset partial PES assembly for this PID
      delete this._pes[pid];
    }
    this._lastCc[pid] = cc;

    let offset = 4;
    if (adaptationFieldControl === 0x02 || adaptationFieldControl === 0x03) {
      const afLen = packet[4];
      offset = 5 + afLen;
    }
    if (adaptationFieldControl === 0x02 || offset >= TS_PACKET_SIZE) {
      return [];
    }

    const payload = packet.subarray(offset);

    if (pid === PAT_PID) {
      if (payloadUnitStart && payload.length > 0) {
        const pointer = payload[0];
        const sectionStart = 1 + pointer;
        if (sectionStart < payload.length) {
          const pat = parsePatSection(payload.subarray(sectionStart));
          if (pat && pat.programs.size > 0) {
            for (const pmtPid of pat.programs.values()) {
              this._pmtPid = pmtPid;
            }
          }
        }
      }
      return [];
    }

    if (this._pmtPid !== null && pid === this._pmtPid) {
      if (payloadUnitStart && payload.length > 0) {
        const pointer = payload[0];
        const sectionStart = 1 + pointer;
        if (sectionStart < payload.length) {
          const pmt = parsePmtSection(payload.subarray(sectionStart));
          if (pmt) {
            for (const stream of pmt.streams) {
              if (stream.streamType === STREAM_TYPE_H264) {
                this._videoPid = stream.elementaryPid;
              } else if (stream.streamType === STREAM_TYPE_AAC) {
                this._audioPid = stream.elementaryPid;
              }
            }
          }
        }
      }
      return [];
    }

    if (this._videoPid !== null && pid === this._videoPid) {
      return this._ingestPes(pid, payloadUnitStart, payload);
    }

    if (!this._skipAudio && this._audioPid !== null && pid === this._audioPid) {
      return this._ingestAudioPes(pid, payloadUnitStart, payload);
    }

    return [];
  }

  /**
   * @param {number} pid
   * @param {boolean} unitStart
   * @param {Uint8Array} payload
   */
  _ingestPes(pid, unitStart, payload) {
    const frames = [];
    if (unitStart) {
      frames.push(...this._flushPes(pid));
      if (payload.length === 0) {
        return frames;
      }
      const pes = parsePesHeader(payload, 0);
      if (!pes) {
        return frames;
      }
      this._pes[pid] = {
        bytes: [payload.subarray(pes.payloadStart)],
        pts: pes.pts
      };
    } else if (this._pes[pid]) {
      this._pes[pid].bytes.push(payload);
    }
    return frames;
  }

  _ingestAudioPes(pid, unitStart, payload) {
    if (unitStart) {
      this._pes[pid] = { bytes: [payload], pts: null };
    } else if (this._pes[pid]) {
      this._pes[pid].bytes.push(payload);
    }
    return [];
  }

  /**
   * @param {number} pid
   */
  _flushPes(pid) {
    const state = this._pes[pid];
    delete this._pes[pid];
    if (!state || state.bytes.length === 0) {
      return [];
    }
    const combined = concatBytes(...state.bytes);
    let esBytes = combined;
    const pes = parsePesHeader(combined, 0);
    let pts = state.pts;
    if (pes) {
      esBytes = combined.subarray(pes.payloadStart);
      if (pes.pts != null) {
        pts = pes.pts;
      }
    }
    const parsed = parseAnnexBAccessUnits(esBytes);
    if (parsed.length === 0 && esBytes.length > 0) {
      const keyframe = esBytes.length >= 5 && (esBytes[4] & 0x1f) === 5;
      const ts = ptsToTimestampMs(pts);
      return [
        {
          payloadBytes: esBytes,
          mimeType: H264_MIME,
          timestampMs: ts != null ? ts : 0,
          keyframe
        }
      ];
    }
    const ts = ptsToTimestampMs(pts);
    return parsed.map((frame, index) => ({
      ...frame,
      timestampMs: ts != null ? ts + (index > 0 ? index : 0) : frame.timestampMs
    }));
  }
}

/**
 * One-shot demux of a complete or partial MPEG-TS buffer.
 * @param {Uint8Array} bytes
 * @returns {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>}
 */
function demuxMpegTs(bytes) {
  const demuxer = new MpegTsDemuxer();
  const frames = demuxer.push(bytes);
  return frames.concat(demuxer.flush());
}

module.exports = {
  TS_PACKET_SIZE,
  SYNC_BYTE,
  MpegTsDemuxer,
  demuxMpegTs,
  ptsToTimestampMs
};