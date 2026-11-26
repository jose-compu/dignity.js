const {
  parseRtpHeader,
  depacketizeH264Rtp,
  depacketizeOpusRtp,
  createWhipRtpFrameAssembler
} = require('../../src');

function buildRtp(payloadType, payload, marker = false) {
  const packet = new Uint8Array(12 + payload.length);
  packet[0] = 0x80;
  packet[1] = (marker ? 0x80 : 0) | (payloadType & 0x7f);
  packet[2] = 0;
  packet[3] = 1;
  packet[4] = 0;
  packet[5] = 0;
  packet[6] = 0;
  packet[7] = 42;
  packet.set(payload, 12);
  return packet;
}

describe('RTP depacketizers', () => {
  test('parseRtpHeader reads payload type and marker', () => {
    const rtp = buildRtp(96, new Uint8Array([0x65, 0x88]));
    const header = parseRtpHeader(rtp);
    expect(header.payloadType).toBe(96);
    expect(header.payload[0] & 0x1f).toBe(5);
  });

  test('depacketizeH264Rtp single NAL IDR', () => {
    const idr = new Uint8Array([0x65, 0x88, 0x84]);
    const result = depacketizeH264Rtp(idr);
    expect(result.keyframe).toBe(true);
    expect(result.accessUnit[0]).toBe(0);
    expect(result.accessUnit[4]).toBe(0x65);
  });

  test('depacketizeOpusRtp copies payload', () => {
    const payload = new Uint8Array([9, 8, 7]);
    expect(depacketizeOpusRtp(payload)).toEqual(payload);
  });

  test('assembler emits video and audio frames by PT', () => {
    const frames = [];
    const assembler = createWhipRtpFrameAssembler({ onFrame: (f) => frames.push(f) });
    assembler.feedRtpPacket(buildRtp(96, new Uint8Array([0x41, 1, 2])));
    assembler.feedRtpPacket(buildRtp(111, new Uint8Array([0xfc, 0xff, 0xfe])));
    expect(frames).toHaveLength(2);
    expect(frames[0].track).toBe('video');
    expect(frames[1].track).toBe('audio');
  });
});