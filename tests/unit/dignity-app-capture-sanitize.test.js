const {
  sanitizeCaptureMessage,
  sanitizeCaptureValue,
  MAX_MESSAGE_LENGTH
} = require('../../src/apps/capture-sanitize');

describe('capture sanitization (#106)', () => {
  test('sanitizeCaptureMessage caps length', () => {
    const long = 'x'.repeat(MAX_MESSAGE_LENGTH + 50);
    const out = sanitizeCaptureMessage(long);
    expect(out.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH + 1);
    expect(out.endsWith('…')).toBe(true);
  });

  test('sanitizeCaptureValue redacts sensitive keys', () => {
    const out = sanitizeCaptureValue({
      text: 'hello',
      password: 'secret',
      apiToken: 'tok'
    });
    expect(out.text).toBe('hello');
    expect(out.password).toBe('[redacted]');
    expect(out.apiToken).toBe('[redacted]');
  });

  test('sanitizeCaptureValue handles nested arrays and depth', () => {
    const deep = { a: { b: { c: { d: { e: { f: 'deep' } } } } } };
    const out = sanitizeCaptureValue(deep);
    expect(out.a.b.c.d.e).toBe('[max-depth]');
  });

  test('sanitizeCaptureValue handles primitives and arrays', () => {
    expect(sanitizeCaptureValue(null)).toBeNull();
    expect(sanitizeCaptureValue(undefined)).toBeUndefined();
    expect(sanitizeCaptureValue(42)).toBe(42);
    expect(sanitizeCaptureValue(true)).toBe(true);
    expect(sanitizeCaptureValue([1, 2])).toEqual([1, 2]);
    expect(sanitizeCaptureValue(Symbol('x'))).toBe('Symbol(x)');
  });

  test('sanitizeCaptureMessage handles empty input', () => {
    expect(sanitizeCaptureMessage(null)).toBe('');
    expect(sanitizeCaptureMessage(undefined)).toBe('');
  });
});
