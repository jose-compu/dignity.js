const {
  STREAM_ACCESS_MODES,
  validateStreamAccessConfig,
  normalizePrivateRecipients
} = require('../../src/streaming/access-modes');
const {
  StreamSession,
  createStreamSession,
  canJoinStream
} = require('../../src/streaming/stream-session');

describe('streaming access modes (experimental)', () => {
  test('validate private-single requires exactly one recipient', () => {
    expect(() =>
      validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_SINGLE, { privateRecipients: [] })
    ).toThrow(/exactly one/);
    expect(() =>
      validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_SINGLE, {
        privateRecipients: ['a', 'b']
      })
    ).toThrow(/exactly one/);
    expect(
      validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_SINGLE, { privateRecipients: ['bob'] })
    ).toEqual(['bob']);
  });

  test('validate private-list requires one or more recipients', () => {
    expect(() =>
      validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_LIST, { privateRecipients: [] })
    ).toThrow(/one or more/);
    const list = validateStreamAccessConfig(STREAM_ACCESS_MODES.PRIVATE_LIST, {
      privateRecipients: ['a', 'b']
    });
    expect(list).toEqual(['a', 'b']);
  });

  test('validate public forbids private recipients', () => {
    expect(validateStreamAccessConfig(STREAM_ACCESS_MODES.PUBLIC)).toEqual([]);
    expect(() =>
      validateStreamAccessConfig(STREAM_ACCESS_MODES.PUBLIC, { privateRecipients: ['x'] })
    ).toThrow(/must not include/);
  });

  test('validate combined requires private list', () => {
    expect(() =>
      validateStreamAccessConfig(STREAM_ACCESS_MODES.COMBINED, { privateRecipients: [] })
    ).toThrow(/at least one private/);
    expect(
      validateStreamAccessConfig(STREAM_ACCESS_MODES.COMBINED, { privateRecipients: ['vip'] })
    ).toEqual(['vip']);
  });

  test('normalizePrivateRecipients deduplicates', () => {
    expect(normalizePrivateRecipients([' alice ', 'alice', 'bob'])).toEqual(['alice', 'bob']);
  });

  describe('StreamSession.canJoin', () => {
    test('private-single allows only broadcaster and sole recipient', () => {
      const session = createStreamSession({
        sessionId: 's1',
        broadcasterId: 'alice',
        mode: STREAM_ACCESS_MODES.PRIVATE_SINGLE,
        privateRecipients: ['bob']
      });
      expect(session.canJoin('alice')).toBe(true);
      expect(session.canJoin('bob')).toBe(true);
      expect(session.canJoin('carol')).toBe(false);
    });

    test('public allows any identity', () => {
      const session = createStreamSession({
        sessionId: 's2',
        broadcasterId: 'alice',
        mode: STREAM_ACCESS_MODES.PUBLIC
      });
      expect(session.canJoin('random-viewer')).toBe(true);
    });

    test('combined allows public join; private decrypt only for allowlist', () => {
      const session = createStreamSession({
        sessionId: 's3',
        broadcasterId: 'alice',
        mode: STREAM_ACCESS_MODES.COMBINED,
        privateRecipients: ['bob']
      });
      expect(session.canJoin('spectator')).toBe(true);
      expect(session.canDecryptPrivateTracks('spectator')).toBe(false);
      expect(session.canDecryptPrivateTracks('bob')).toBe(true);
    });

    test('canJoinStream helper', () => {
      const session = new StreamSession({
        sessionId: 's4',
        broadcasterId: 'pub',
        mode: STREAM_ACCESS_MODES.PUBLIC
      });
      expect(canJoinStream(session, 'anyone')).toBe(true);
      expect(() => canJoinStream({}, 'x')).toThrow(/StreamSession/);
    });
  });
});