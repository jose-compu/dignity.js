/**
 * RTP depacketizers for WHIP ingest (H.264 RFC 6184, Opus RFC 7587).
 * @experimental
 */

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

/**
 * @param {Uint8Array} packet — full RTP packet
 * @returns {{ payload: Uint8Array, payloadType: number, sequenceNumber: number, timestamp: number, marker: boolean } | null}
 */
function parseRtpHeader(packet) {
  if (!(packet instanceof Uint8Array) || packet.length < 12) {
    return null;
  }
  const v = packet[0] >> 6;
  if (v !== 2) {
    return null;
  }
  const cc = packet[0] & 0x0f;
  const extension = (packet[0] >> 4) & 1;
  const marker = (packet[1] >> 7) & 1;
  const payloadType = packet[1] & 0x7f;
  const sequenceNumber = readU16BE(packet, 2);
  const timestamp = readU32BE(packet, 4);
  let offset = 12 + cc * 4;
  if (extension) {
    if (offset + 4 > packet.length) {
      return null;
    }
    const extLen = readU16BE(packet, offset + 2);
    offset += 4 + extLen * 4;
  }
  if (offset >= packet.length) {
    return null;
  }
  return {
    payload: packet.subarray(offset),
    payloadType,
    sequenceNumber,
    timestamp,
    marker: marker === 1
  };
}

const H264_NAL_TYPE_MASK = 0x1f;

/**
 * Depacketize one H.264 RTP payload (single NAL, STAP-A, FU-A).
 * @param {Uint8Array} rtpPayload
 * @param {Uint8Array[]} [fuBuffer] — mutable reassembly buffer for FU-A
 * @returns {{ accessUnit: Uint8Array, keyframe: boolean } | null}
 */
function depacketizeH264Rtp(rtpPayload, fuBuffer) {
  if (!(rtpPayload instanceof Uint8Array) || rtpPayload.length === 0) {
    return null;
  }
  const nalHeader = rtpPayload[0];
  const nalType = nalHeader & H264_NAL_TYPE_MASK;

  if (nalType >= 1 && nalType <= 23) {
    const start = new Uint8Array([0, 0, 0, 1]);
    const body = new Uint8Array(start.length + rtpPayload.length);
    body.set(start, 0);
    body.set(rtpPayload, start.length);
    const keyframe = nalType === 5;
    return { accessUnit: body, keyframe };
  }

  if (nalType === 24) {
    let offset = 1;
    const parts = [];
    while (offset + 2 <= rtpPayload.length) {
      const size = readU16BE(rtpPayload, offset);
      offset += 2;
      if (offset + size > rtpPayload.length) {
        break;
      }
      const nal = rtpPayload.subarray(offset, offset + size);
      offset += size;
      const start = new Uint8Array([0, 0, 0, 1]);
      const chunk = new Uint8Array(start.length + nal.length);
      chunk.set(start, 0);
      chunk.set(nal, start.length);
      parts.push(chunk);
    }
    if (!parts.length) {
      return null;
    }
    const total = parts.reduce((n, p) => n + p.length, 0);
    const au = new Uint8Array(total);
    let pos = 0;
    for (const p of parts) {
      au.set(p, pos);
      pos += p.length;
    }
    const keyframe = parts.some((p) => p.length > 4 && (p[4] & H264_NAL_TYPE_MASK) === 5);
    return { accessUnit: au, keyframe };
  }

  if (nalType === 28) {
    if (rtpPayload.length < 2) {
      return null;
    }
    const fuHeader = rtpPayload[1];
    const start = (fuHeader & 0x80) !== 0;
    const end = (fuHeader & 0x40) !== 0;
    const fragment = rtpPayload.subarray(2);
    if (start) {
      const reconstructedNalType = nalHeader & 0xe0;
      const rebuilt = new Uint8Array(2 + fragment.length);
      rebuilt[0] = reconstructedNalType | (fuHeader & 0x1f);
      rebuilt[1] = fragment[0];
      rebuilt.set(fragment.subarray(1), 2);
      if (!fuBuffer) {
        return null;
      }
      fuBuffer.length = 0;
      fuBuffer.push(rebuilt);
    } else if (fuBuffer && fuBuffer.length) {
      const prev = fuBuffer[fuBuffer.length - 1];
      const merged = new Uint8Array(prev.length + fragment.length);
      merged.set(prev, 0);
      merged.set(fragment, prev.length);
      fuBuffer[fuBuffer.length - 1] = merged;
    }
    if (end && fuBuffer && fuBuffer.length) {
      const nal = fuBuffer[fuBuffer.length - 1];
      const startCode = new Uint8Array([0, 0, 0, 1]);
      const au = new Uint8Array(startCode.length + nal.length);
      au.set(startCode, 0);
      au.set(nal, startCode.length);
      fuBuffer.length = 0;
      const keyframe = (nal[0] & H264_NAL_TYPE_MASK) === 5;
      return { accessUnit: au, keyframe };
    }
    return null;
  }

  return null;
}

/**
 * @param {Uint8Array} rtpPayload — Opus audio frame (RFC 7587)
 * @returns {Uint8Array | null}
 */
function depacketizeOpusRtp(rtpPayload) {
  if (!(rtpPayload instanceof Uint8Array) || rtpPayload.length === 0) {
    return null;
  }
  return new Uint8Array(rtpPayload);
}

/**
 * Stateful WHIP RTP → media frame assembler (no app bridge required).
 * @param {Object} [options]
 * @param {(frame: { payloadBytes: Uint8Array, mimeType: string, timestampMs: number, keyframe: boolean, track: 'video' | 'audio' }) => void} [options.onFrame]
 */
function createWhipRtpFrameAssembler(options = {}) {
  /** @type {Uint8Array[]} */
  const h264Fu = [];
  const videoPt = options.videoPayloadType != null ? options.videoPayloadType : 96;
  const audioPt = options.audioPayloadType != null ? options.audioPayloadType : 111;
  const videoClock = options.videoClockRate != null ? options.videoClockRate : 90000;
  const audioClock = options.audioClockRate != null ? options.audioClockRate : 48000;

  function feedRtpPacket(packet) {
    const header = parseRtpHeader(packet);
    if (!header) {
      return;
    }

    if (header.payloadType === audioPt) {
      const opus = depacketizeOpusRtp(header.payload);
      if (opus && typeof options.onFrame === 'function') {
        const timestampMs = Math.round((header.timestamp / audioClock) * 1000);
        options.onFrame({
          payloadBytes: opus,
          mimeType: 'audio/opus',
          timestampMs,
          keyframe: true,
          track: 'audio'
        });
      }
      return;
    }

    if (header.payloadType === videoPt) {
      const h264 = depacketizeH264Rtp(header.payload, h264Fu);
      if (h264 && typeof options.onFrame === 'function') {
        const timestampMs = Math.round((header.timestamp / videoClock) * 1000);
        options.onFrame({
          payloadBytes: h264.accessUnit,
          mimeType: 'video/h264',
          timestampMs,
          keyframe: h264.keyframe,
          track: 'video'
        });
      }
    }
  }

  return { feedRtpPacket, parseRtpHeader };
}

module.exports = {
  parseRtpHeader,
  depacketizeH264Rtp,
  depacketizeOpusRtp,
  createWhipRtpFrameAssembler
};