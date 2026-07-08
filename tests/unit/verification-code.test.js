const {
  hashVerificationCode,
  normalizeVerificationCode,
  parseSemver,
  compareSemver,
  buildVerificationEntry,
  evaluateVerificationCompatibility,
  buildVerificationPresenceMetadata,
  COMPATIBILITY_POLICIES,
  DEFAULT_COMPATIBILITY_POLICY
} = require('../../src/security/verification-code');

describe('verification code hashing (#115)', () => {
  test('hash is stable across object key order', () => {
    const a = hashVerificationCode({ rules: [{ field: 'score', max: 10 }], name: 'game' });
    const b = hashVerificationCode({ name: 'game', rules: [{ field: 'score', max: 10 }] });
    expect(a).toBe(b);
    expect(a.startsWith('sha512:')).toBe(true);
  });

  test('hash changes when policy changes', () => {
    const code = 'function validate() { return true; }';
    const strict = hashVerificationCode(code, { policy: 'strict' });
    const advisory = hashVerificationCode(code, { policy: 'advisory' });
    expect(strict).not.toBe(advisory);
  });

  test('normalizeVerificationCode collapses whitespace in functions', () => {
    const fn = function hello() {
      return 1 + 2;
    };
    const compact = normalizeVerificationCode(fn);
    expect(compact).not.toContain('\n');
  });

  test('buildVerificationEntry tracks version registry', () => {
    const entry = buildVerificationEntry({
      code: { min: 0 },
      version: '1.0.0',
      policy: 'strict'
    });
    expect(entry.versionRegistry.get('1.0.0')).toBe(entry.hash);
  });
});

describe('semver versioning (#116)', () => {
  test('parseSemver validates format', () => {
    expect(parseSemver('1.2.3').patch).toBe(3);
    expect(() => parseSemver('bad')).toThrow('invalid semver');
  });

  test('compareSemver orders versions', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    expect(compareSemver('1.1.0', '1.1.0')).toBe(0);
  });

  test('buildVerificationPresenceMetadata exports collection versions', () => {
    const registry = new Map([
      ['games', { hash: 'sha512:abc', version: '1.0.0' }]
    ]);
    expect(buildVerificationPresenceMetadata(registry).games.verificationVersion).toBe('1.0.0');
  });
});

describe('compatibility policies (#117)', () => {
  const local = buildVerificationEntry({
    code: 'rules-v1',
    version: '2.1.0',
    policy: 'strict'
  });

  test('matching hash accepts without mismatch events', () => {
    const entry = buildVerificationEntry({
      code: 'rules-v1',
      version: '2.1.0',
      policy: 'strict'
    });
    const result = evaluateVerificationCompatibility(entry, {
      verificationHash: entry.hash,
      verificationVersion: '2.1.0'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('accept');
    expect(result.events).toEqual([]);
  });

  test('advisory accepts missing remote hash with warning', () => {
    const advisory = buildVerificationEntry({
      code: 'rules-v1',
      version: '1.0.0',
      policy: 'advisory'
    });
    const result = evaluateVerificationCompatibility(advisory, {}, {
      collection: 'games',
      senderId: 'peer'
    });
    expect(result.action).toBe('accept');
    expect(result.events.some((e) => e.payload?.type === 'verification-hash-missing')).toBe(true);
  });

  test('strict rejects hash mismatch', () => {
    const result = evaluateVerificationCompatibility(local, {
      verificationHash: 'sha512:other',
      verificationVersion: '2.1.1'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('reject');
    expect(result.events.some((e) => e.type === 'policyrejected')).toBe(true);
    expect(result.events.some((e) => e.type === 'verificationmismatch')).toBe(true);
  });

  test('advisory accepts hash mismatch with warning', () => {
    const advisory = buildVerificationEntry({
      code: 'rules-v1',
      version: '2.1.0',
      policy: 'advisory'
    });
    const result = evaluateVerificationCompatibility(advisory, {
      verificationHash: 'sha512:other',
      verificationVersion: '2.1.0'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('accept');
    expect(result.events.some((e) => e.type === 'verificationmismatch')).toBe(true);
  });

  test('patch-only accepts same major.minor', () => {
    const patchOnly = buildVerificationEntry({
      code: 'rules-v1',
      version: '2.1.0',
      policy: 'patch-only'
    });
    const result = evaluateVerificationCompatibility(patchOnly, {
      verificationHash: 'sha512:other',
      verificationVersion: '2.1.5'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('accept');
  });

  test('backward-compatible accepts older remote version', () => {
    const backward = buildVerificationEntry({
      code: 'rules-v1',
      version: '2.0.0',
      policy: 'backward-compatible'
    });
    const result = evaluateVerificationCompatibility(backward, {
      verificationHash: 'sha512:other',
      verificationVersion: '1.5.0'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('accept');
  });

  test('detects version spoof when hash does not match registry', () => {
    const entry = buildVerificationEntry({
      code: 'rules-v1',
      version: '1.0.0',
      policy: 'strict'
    });
    const result = evaluateVerificationCompatibility(entry, {
      verificationHash: 'sha512:fake',
      verificationVersion: '1.0.0'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('reject');
    expect(result.events.some((e) => e.payload?.type === 'verification-version-spoof')).toBe(true);
  });

  test('no local entry accepts everything', () => {
    const result = evaluateVerificationCompatibility(null, {
      verificationHash: 'sha512:any'
    }, { collection: 'games', senderId: 'peer' });
    expect(result.action).toBe('accept');
  });

  test('normalizeVerificationCode rejects empty input', () => {
    expect(() => normalizeVerificationCode(null)).toThrow('verification code is required');
    expect(normalizeVerificationCode(42)).toBe('42');
  });

  test('hashVerificationCode rejects invalid policy', () => {
    expect(() => hashVerificationCode('x', { policy: 'invalid' })).toThrow('invalid compatibility policy');
  });

  test('buildVerificationEntry rejects invalid policy', () => {
    expect(() => buildVerificationEntry({ code: 'x', policy: 'nope' })).toThrow('invalid compatibility policy');
  });

  test('parseSemver accepts prerelease and build metadata', () => {
    const parsed = parseSemver('1.2.3-beta.1+build.5');
    expect(parsed.prerelease).toBe('beta.1');
    expect(parsed.build).toBe('build.5');
  });

  test('strict rejects missing remote hash', () => {
    const strict = buildVerificationEntry({ code: 'x', version: '1.0.0', policy: 'strict' });
    const result = evaluateVerificationCompatibility(strict, {}, { collection: 'c', senderId: 'p' });
    expect(result.action).toBe('reject');
    expect(result.reason).toBe('verification-hash-missing');
  });

  test('minor-and-patch accepts same major with different minor', () => {
    const policy = buildVerificationEntry({
      code: 'x',
      version: '2.4.0',
      policy: 'minor-and-patch'
    });
    const result = evaluateVerificationCompatibility(policy, {
      verificationHash: 'sha512:other',
      verificationVersion: '2.1.9'
    }, { collection: 'c', senderId: 'p' });
    expect(result.action).toBe('accept');
  });

  test('rejects when policy needs versions but remote has none', () => {
    const patchOnly = buildVerificationEntry({
      code: 'x',
      version: '1.0.0',
      policy: 'patch-only'
    });
    const result = evaluateVerificationCompatibility(patchOnly, {
      verificationHash: 'sha512:other'
    }, { collection: 'c', senderId: 'p' });
    expect(result.action).toBe('reject');
    expect(result.reason).toBe('version-required-for-policy');
  });

  test('buildVerificationPresenceMetadata includes hash-only collections', () => {
    const registry = new Map([
      ['notes', { hash: 'sha512:abc', version: null }]
    ]);
    expect(buildVerificationPresenceMetadata(registry).notes.verificationHash).toBe('sha512:abc');
  });
});
