/**
 * Browser-safe H.264 Annex-B and fMP4 fragment parsers for Node ffmpeg ingest (#152).
 * No fs or child_process.
 * @experimental
 */

const DEFAULT_FRAME_DURATION_MS = 33;
const H264_MIME = 'video/h264';
const FMP4_MIME = 'video/mp4';

function concatBytes(chunks) {
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

function findAnnexBStartCodes(bytes) {
  const positions = [];
  for (let i = 0; i + 3 < bytes.length; i += 1) {
    if (bytes[i] === 0 && bytes[i + 1] === 0) {
      if (bytes[i + 2] === 1) {
        positions.push({ index: i, length: 3 });
        i += 2;
      } else if (bytes[i + 2] === 0 && bytes[i + 3] === 1) {
        positions.push({ index: i, length: 4 });
        i += 3;
      }
    }
  }
  return positions;
}

function nalType(nalHeaderByte) {
  return nalHeaderByte & 0x1f;
}

function isVclNal(type) {
  return type >= 1 && type <= 5;
}

function isAudNal(type) {
  return type === 9;
}

function accessUnitBytesFromNals(nalSlices, includeStartCodes = true) {
  const parts = [];
  for (const nal of nalSlices) {
    if (includeStartCodes) {
      parts.push(new Uint8Array([0, 0, 0, 1]));
    }
    parts.push(nal.bytes);
  }
  return concatBytes(parts);
}

/**
 * @param {Uint8Array} bytes
 * @param {Object} [options]
 * @param {number} [options.frameDurationMs]
 * @returns {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>}
 */
function parseAnnexBAccessUnits(bytes, { frameDurationMs = DEFAULT_FRAME_DURATION_MS } = {}) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError('bytes must be a Uint8Array');
  }
  if (bytes.length === 0) {
    return [];
  }

  const starts = findAnnexBStartCodes(bytes);
  if (starts.length === 0) {
    return [];
  }

  /** @type {Array<{ type: number, bytes: Uint8Array }>} */
  const nals = [];
  for (let s = 0; s < starts.length; s += 1) {
    const start = starts[s].index + starts[s].length;
    const end = s + 1 < starts.length ? starts[s + 1].index : bytes.length;
    if (start >= end) {
      continue;
    }
    const nalBytes = bytes.subarray(start, end);
    if (nalBytes.length === 0) {
      continue;
    }
    nals.push({ type: nalType(nalBytes[0]), bytes: nalBytes });
  }

  const hasAud = nals.some((n) => isAudNal(n.type));
  /** @type {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>} */
  const frames = [];

  if (hasAud) {
    let i = 0;
    let auIndex = 0;
    while (i < nals.length) {
      if (!isAudNal(nals[i].type)) {
        i += 1;
        continue;
      }
      i += 1;
      const group = [];
      while (i < nals.length && !isAudNal(nals[i].type)) {
        group.push(nals[i]);
        i += 1;
        if (group.length > 0 && isVclNal(nals[i - 1].type)) {
          break;
        }
      }
      if (group.length === 0) {
        continue;
      }
      const keyframe = group.some((n) => n.type === 5);
      frames.push({
        payloadBytes: accessUnitBytesFromNals(group),
        mimeType: H264_MIME,
        timestampMs: auIndex * frameDurationMs,
        keyframe
      });
      auIndex += 1;
    }
    return frames;
  }

  let pending = [];
  let auIndex = 0;
  for (const nal of nals) {
    pending.push(nal);
    if (isVclNal(nal.type)) {
      const keyframe = nal.type === 5;
      frames.push({
        payloadBytes: accessUnitBytesFromNals(pending),
        mimeType: H264_MIME,
        timestampMs: auIndex * frameDurationMs,
        keyframe
      });
      auIndex += 1;
      pending = [];
    }
  }
  if (pending.length > 0) {
    const keyframe = pending.some((n) => n.type === 5);
    frames.push({
      payloadBytes: accessUnitBytesFromNals(pending),
      mimeType: H264_MIME,
      timestampMs: auIndex * frameDurationMs,
      keyframe
    });
  }
  return frames;
}

function readU32BE(bytes, offset) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function boxType(bytes, offset) {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

/**
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {{ type: string, start: number, size: number, headerSize: number, bodyStart: number } | null}
 */
function readBoxAt(bytes, offset) {
  if (offset + 8 > bytes.length) {
    return null;
  }
  let size = readU32BE(bytes, offset);
  const type = boxType(bytes, offset + 4);
  let headerSize = 8;
  if (size === 1) {
    if (offset + 16 > bytes.length) {
      return null;
    }
    const hi = readU32BE(bytes, offset + 8);
    const lo = readU32BE(bytes, offset + 12);
    size = hi * 0x100000000 + lo;
    headerSize = 16;
  }
  if (size === 0) {
    size = bytes.length - offset;
  }
  if (size < headerSize || offset + size > bytes.length) {
    return null;
  }
  return {
    type,
    start: offset,
    size,
    headerSize,
    bodyStart: offset + headerSize
  };
}

function findBoxIn(bytes, start, end, targetType) {
  let offset = start;
  while (offset + 8 <= end) {
    const box = readBoxAt(bytes, offset);
    if (!box) {
      break;
    }
    if (box.type === targetType) {
      return box;
    }
    offset += box.size;
  }
  return null;
}

function walkBoxes(bytes, start, end, visit) {
  let offset = start;
  while (offset + 8 <= end) {
    const box = readBoxAt(bytes, offset);
    if (!box) {
      break;
    }
    visit(box);
    const bodyEnd = box.start + box.size;
    const containerTypes = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'moof', 'traf']);
    if (containerTypes.has(box.type)) {
      walkBoxes(bytes, box.bodyStart, bodyEnd, visit);
    }
    offset += box.size;
  }
}

function parseMdhdTimescale(bytes, mdhdBox) {
  if (!mdhdBox || mdhdBox.bodyStart + 12 > mdhdBox.start + mdhdBox.size) {
    return 1000;
  }
  const version = bytes[mdhdBox.bodyStart];
  if (version === 1) {
    if (mdhdBox.bodyStart + 28 > mdhdBox.start + mdhdBox.size) {
      return 1000;
    }
    return readU32BE(bytes, mdhdBox.bodyStart + 24);
  }
  return readU32BE(bytes, mdhdBox.bodyStart + 12);
}

function parseTfdtDecodeTime(bytes, tfdtBox) {
  if (!tfdtBox) {
    return 0;
  }
  const version = bytes[tfdtBox.bodyStart];
  if (version === 1) {
    const hi = readU32BE(bytes, tfdtBox.bodyStart + 4);
    const lo = readU32BE(bytes, tfdtBox.bodyStart + 8);
    return hi * 0x100000000 + lo;
  }
  return readU32BE(bytes, tfdtBox.bodyStart + 4);
}

function trunFirstSampleIsSync(bytes, trunBox) {
  if (!trunBox || trunBox.bodyStart + 12 > trunBox.start + trunBox.size) {
    return false;
  }
  const body = trunBox.bodyStart;
  const flags = readU32BE(bytes, body + 4);
  let offset = body + 8;
  if (flags & 0x1) {
    offset += 4;
  }
  if (flags & 0x4) {
    if (offset + 4 > trunBox.start + trunBox.size) {
      return false;
    }
    const sampleFlags = readU32BE(bytes, offset);
    return (sampleFlags & 0x10000) === 0;
  }
  if (flags & 0x200) {
    if (offset + 4 > trunBox.start + trunBox.size) {
      return false;
    }
    const sampleFlags = readU32BE(bytes, offset);
    return (sampleFlags & 0x10000) === 0;
  }
  return false;
}

/**
 * @param {Uint8Array} bytes
 * @returns {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>}
 */
function parseFmp4Fragments(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError('bytes must be a Uint8Array');
  }
  if (bytes.length < 8) {
    return [];
  }

  /** @type {Uint8Array | null} */
  let initSegment = null;
  let timescale = 1000;
  const frames = [];
  let offset = 0;

  while (offset + 8 <= bytes.length) {
    const box = readBoxAt(bytes, offset);
    if (!box) {
      break;
    }

    if (box.type === 'ftyp') {
      const moov = findBoxIn(bytes, offset + box.size, bytes.length, 'moov');
      if (!moov) {
        break;
      }
      initSegment = bytes.subarray(offset, moov.start + moov.size);
      let mdhd = null;
      walkBoxes(bytes, moov.bodyStart, moov.start + moov.size, (inner) => {
        if (inner.type === 'mdhd') {
          mdhd = inner;
        }
      });
      timescale = parseMdhdTimescale(bytes, mdhd);
      frames.push({
        payloadBytes: initSegment,
        mimeType: FMP4_MIME,
        timestampMs: 0,
        keyframe: true
      });
      offset = moov.start + moov.size;
      continue;
    }

    if (box.type === 'moof') {
      const mdat = readBoxAt(bytes, offset + box.size);
      if (!mdat || mdat.type !== 'mdat') {
        break;
      }
      let tfdt = null;
      let trun = null;
      walkBoxes(bytes, box.bodyStart, box.start + box.size, (inner) => {
        if (inner.type === 'tfdt') {
          tfdt = inner;
        }
        if (inner.type === 'trun') {
          trun = inner;
        }
      });
      const decodeTime = parseTfdtDecodeTime(bytes, tfdt);
      const timestampMs = Math.round((decodeTime / timescale) * 1000);
      const keyframe = trunFirstSampleIsSync(bytes, trun);
      const payload = bytes.subarray(offset, offset + box.size + mdat.size);
      frames.push({
        payloadBytes: payload,
        mimeType: FMP4_MIME,
        timestampMs,
        keyframe
      });
      offset += box.size + mdat.size;
      continue;
    }

    offset += box.size;
  }

  return frames;
}

function trimPartialStartCodeSuffix(bytes) {
  if (bytes.length >= 3 && bytes[bytes.length - 1] === 0 && bytes[bytes.length - 2] === 0 && bytes[bytes.length - 3] === 0) {
    return bytes.subarray(0, bytes.length - 3);
  }
  if (bytes.length >= 2 && bytes[bytes.length - 1] === 0 && bytes[bytes.length - 2] === 0) {
    return bytes.subarray(0, bytes.length - 2);
  }
  if (bytes.length >= 1 && bytes[bytes.length - 1] === 0) {
    return bytes.subarray(0, bytes.length - 1);
  }
  return bytes;
}

function indexAfterCompleteAnnexBPrefix(bytes) {
  const safe = trimPartialStartCodeSuffix(bytes);
  const starts = findAnnexBStartCodes(safe);
  if (starts.length < 2) {
    return 0;
  }
  for (let s = 1; s < starts.length; s += 1) {
    const nalStart = starts[s - 1].index + starts[s - 1].length;
    if (nalStart >= starts[s].index) {
      continue;
    }
    const type = nalType(safe[nalStart]);
    if (isVclNal(type)) {
      return starts[s].index;
    }
  }
  return 0;
}

class AnnexBIncrementalParser {
  constructor({ frameDurationMs = DEFAULT_FRAME_DURATION_MS } = {}) {
    this.frameDurationMs = frameDurationMs;
    this._buffer = new Uint8Array(0);
    this._emitted = 0;
  }

  /**
   * @param {Uint8Array} chunk
   * @returns {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>}
   */
  push(chunk) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError('chunk must be a Uint8Array');
    }
    if (chunk.length === 0) {
      return [];
    }
    this._buffer = concatBytes([this._buffer, chunk]);
    const frames = [];
    while (true) {
      const cut = indexAfterCompleteAnnexBPrefix(this._buffer);
      if (!cut) {
        break;
      }
      const complete = this._buffer.subarray(0, cut);
      const parsed = parseAnnexBAccessUnits(complete, { frameDurationMs: this.frameDurationMs });
      for (let i = 0; i < parsed.length; i += 1) {
        frames.push({
          ...parsed[i],
          timestampMs: (this._emitted + i) * this.frameDurationMs
        });
      }
      this._emitted += parsed.length;
      this._buffer = this._buffer.subarray(cut);
    }
    return frames;
  }

  flush() {
    const frames = parseAnnexBAccessUnits(this._buffer, { frameDurationMs: this.frameDurationMs }).map(
      (frame, i) => ({
        ...frame,
        timestampMs: (this._emitted + i) * this.frameDurationMs
      })
    );
    this._emitted += frames.length;
    this._buffer = new Uint8Array(0);
    return frames;
  }
}

class Fmp4IncrementalParser {
  constructor() {
    this._buffer = new Uint8Array(0);
    this._initEmitted = false;
    this.timescale = 1000;
  }

  /**
   * @param {Uint8Array} chunk
   * @returns {Array<{ payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean }>}
   */
  push(chunk) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError('chunk must be a Uint8Array');
    }
    this._buffer = concatBytes([this._buffer, chunk]);
    const frames = [];
    let progress = true;

    while (progress) {
      progress = false;
      if (!this._initEmitted) {
        const ftyp = readBoxAt(this._buffer, 0);
        if (!ftyp || ftyp.type !== 'ftyp') {
          continue;
        }
        const moov = findBoxIn(this._buffer, ftyp.start + ftyp.size, this._buffer.length, 'moov');
        if (!moov) {
          continue;
        }
        const initEnd = moov.start + moov.size;
        if (initEnd > this._buffer.length) {
          continue;
        }
        let mdhd = null;
        walkBoxes(this._buffer, moov.bodyStart, initEnd, (inner) => {
          if (inner.type === 'mdhd') {
            mdhd = inner;
          }
        });
        this.timescale = parseMdhdTimescale(this._buffer, mdhd);
        frames.push({
          payloadBytes: this._buffer.subarray(0, initEnd),
          mimeType: FMP4_MIME,
          timestampMs: 0,
          keyframe: true
        });
        this._buffer = this._buffer.subarray(initEnd);
        this._initEmitted = true;
        progress = true;
        continue;
      }

      const moof = readBoxAt(this._buffer, 0);
      if (!moof || moof.type !== 'moof') {
        continue;
      }
      if (moof.start + moof.size > this._buffer.length) {
        continue;
      }
      const mdat = readBoxAt(this._buffer, moof.start + moof.size);
      if (!mdat || mdat.type !== 'mdat') {
        continue;
      }
      if (mdat.start + mdat.size > this._buffer.length) {
        continue;
      }
      let tfdt = null;
      let trun = null;
      walkBoxes(this._buffer, moof.bodyStart, moof.start + moof.size, (inner) => {
        if (inner.type === 'tfdt') {
          tfdt = inner;
        }
        if (inner.type === 'trun') {
          trun = inner;
        }
      });
      const decodeTime = parseTfdtDecodeTime(this._buffer, tfdt);
      const timestampMs = Math.round((decodeTime / this.timescale) * 1000);
      const keyframe = trunFirstSampleIsSync(this._buffer, trun);
      const end = mdat.start + mdat.size;
      frames.push({
        payloadBytes: this._buffer.subarray(0, end),
        mimeType: FMP4_MIME,
        timestampMs,
        keyframe
      });
      this._buffer = this._buffer.subarray(end);
      progress = true;
    }

    return frames;
  }

  flush() {
    const frames = parseFmp4Fragments(this._buffer);
    this._buffer = new Uint8Array(0);
    return frames;
  }
}

module.exports = {
  DEFAULT_FRAME_DURATION_MS,
  H264_MIME,
  FMP4_MIME,
  parseAnnexBAccessUnits,
  parseFmp4Fragments,
  AnnexBIncrementalParser,
  Fmp4IncrementalParser,
  findAnnexBStartCodes,
  readBoxAt
};