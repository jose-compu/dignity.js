/**
 * RFC 8888 RTCP Congestion Control Feedback (CCFB, PT=205, FMT=11).
 * @experimental
 */

const RTCP_PT_PSFB = 205;
const RTCP_FMT_CCFB = 11;

const { createReceiverReport } = require('./receiver-report');

function readU16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU32BE(bytes, offset) {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
      0
  );
}

function writeU16BE(bytes, offset, value) {
  bytes[offset] = (value >> 8) & 0xff;
  bytes[offset + 1] = value & 0xff;
}

function writeU32BE(bytes, offset, value) {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

/**
 * @typedef {Object} Rfc8888Metric
 * @property {number} ssrc
 * @property {boolean} received
 * @property {number} ecn
 * @property {number} arrivalTimeOffset24
 * @property {number} [sequenceNumber]
 */

/**
 * @param {Object} packet
 * @param {number} packet.senderSsrc
 * @param {number} packet.sourceSsrc
 * @param {Rfc8888Metric[]} packet.metrics
 * @returns {Uint8Array}
 */
function encodeRtcpCongestionFeedback(packet) {
  if (!packet || typeof packet !== 'object') {
    throw new TypeError('packet must be an object');
  }
  const metrics = Array.isArray(packet.metrics) ? packet.metrics : [];
  const words = 2 + metrics.length * 2;
  const byteLen = (1 + words) * 4;
  const out = new Uint8Array(byteLen);
  const v = 2;
  const p = 0;
  const first = (v << 6) | (p << 5) | (RTCP_FMT_CCFB & 0x1f);
  out[0] = first;
  out[1] = RTCP_PT_PSFB;
  writeU16BE(out, 2, words);
  writeU32BE(out, 4, packet.senderSsrc >>> 0);
  writeU32BE(out, 8, packet.sourceSsrc >>> 0);

  let offset = 12;
  for (const row of metrics) {
    writeU32BE(out, offset, row.ssrc >>> 0);
    offset += 4;
    const m = row.received ? 1 : 0;
    const f = 0;
    const ecn = row.ecn != null ? row.ecn & 0x03 : 0;
    const ato = row.arrivalTimeOffset24 != null ? row.arrivalTimeOffset24 & 0xffffff : 0;
    const word =
      ((m & 1) << 31) |
      ((f & 1) << 30) |
      ((ecn & 3) << 28) |
      (ato & 0x0fffffff);
    writeU32BE(out, offset, word >>> 0);
    offset += 4;
  }
  return out;
}

/**
 * @param {Uint8Array} bytes
 * @returns {{ senderSsrc: number, sourceSsrc: number, metrics: Rfc8888Metric[] } | null}
 */
function decodeRtcpCongestionFeedback(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 12) {
    return null;
  }
  const v = bytes[0] >> 6;
  if (v !== 2) {
    return null;
  }
  const fmt = bytes[0] & 0x1f;
  if (bytes[1] !== RTCP_PT_PSFB || fmt !== RTCP_FMT_CCFB) {
    return null;
  }
  const lengthWords = readU16BE(bytes, 2);
  const expectedLen = (1 + lengthWords) * 4;
  if (bytes.length < expectedLen) {
    return null;
  }
  const senderSsrc = readU32BE(bytes, 4);
  const sourceSsrc = readU32BE(bytes, 8);
  /** @type {Rfc8888Metric[]} */
  const metrics = [];
  let offset = 12;
  while (offset + 8 <= expectedLen) {
    const ssrc = readU32BE(bytes, offset);
    offset += 4;
    const flags = readU32BE(bytes, offset);
    offset += 4;
    const received = ((flags >>> 31) & 1) === 1;
    const ecn = (flags >>> 28) & 3;
    const arrivalTimeOffset24 = flags & 0x0fffffff;
    metrics.push({ ssrc, received, ecn, arrivalTimeOffset24 });
  }
  return { senderSsrc, sourceSsrc, metrics };
}

/**
 * Turn RFC 8888 metrics into receiver reports for createBandwidthEstimator (JSON path unchanged).
 * @param {Object} options
 * @param {Rfc8888Metric[]} options.metrics
 * @param {string} options.sessionId
 * @param {string} options.viewerId
 * @param {string} options.layerId
 * @param {number} options.intervalMs
 * @param {number} options.timestampMs
 * @param {number} [options.bytesPerReceivedPacket]
 * @returns {import('./receiver-report').ReceiverReport[]}
 */
function rfc8888MetricsToReceiverReports(options) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  const metrics = Array.isArray(options.metrics) ? options.metrics : [];
  const bytesEach = options.bytesPerReceivedPacket != null ? options.bytesPerReceivedPacket : 1200;
  let received = 0;
  let lost = 0;
  let delaySum = 0;
  for (const row of metrics) {
    if (row.received) {
      received += 1;
      delaySum += row.arrivalTimeOffset24 & 0xffff;
    } else {
      lost += 1;
    }
  }
  const total = received + lost;
  const interarrivalDelayMs = total > 0 ? Math.round(delaySum / total / 4) : 0;
  return [
    createReceiverReport({
      sessionId: options.sessionId,
      viewerId: options.viewerId,
      layerId: options.layerId,
      timestampMs: options.timestampMs,
      intervalMs: options.intervalMs,
      bytesReceived: received * bytesEach,
      packetsReceived: received,
      packetsLost: lost,
      interarrivalDelayMs
    })
  ];
}

module.exports = {
  RTCP_PT_PSFB,
  RTCP_FMT_CCFB,
  encodeRtcpCongestionFeedback,
  decodeRtcpCongestionFeedback,
  rfc8888MetricsToReceiverReports
};