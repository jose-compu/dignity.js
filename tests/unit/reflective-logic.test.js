const {
  hashReflectiveLogic,
  normalizeFunctionSource,
  collectReflectiveFingerprints
} = require('../../src/security/reflective-logic');
const {
  hashVerificationCode,
  buildVerificationEntry
} = require('../../src/security/verification-code');

describe('reflective logic hashing (#123)', () => {
  test('normalizes function source by stripping comments and whitespace', () => {
    function sample() {
      // line comment
      return 1 + 2;
    }
    const normalized = normalizeFunctionSource(sample.toString(), { stripComments: true });
    expect(normalized).not.toContain('// line comment');
    expect(normalized).toContain('return 1 + 2');
  });

  test('hash is stable for equivalent arrow functions', () => {
    const a = () => {
      return 42;
    };
    const b = () => {
      return 42;
    };

    const hashA = hashReflectiveLogic(a, { policy: 'strict' }).hash;
    const hashB = hashReflectiveLogic(b, { policy: 'strict' }).hash;
    expect(hashA).toBe(hashB);
  });

  test('hash is stable across whitespace and operator spacing variants', () => {
    const sparse = {
      validate(record) {
        return record.data.points >= 0;
      }
    };
    const dense = {
      validate(record){return record.data.points>=0;}
    };

    const hashSparse = hashReflectiveLogic(sparse, { policy: 'strict' }).hash;
    const hashDense = hashReflectiveLogic(dense, { policy: 'strict' }).hash;
    expect(hashSparse).toBe(hashDense);
  });

  test('hash is stable for method shorthand vs function property', () => {
    const shorthand = {
      validate(record) {
        return record.data.x > 0;
      }
    };
    const property = {
      validate: function (record) {
        return record.data.x > 0;
      }
    };

    const hashShorthand = hashReflectiveLogic(shorthand, { policy: 'strict' }).hash;
    const hashProperty = hashReflectiveLogic(property, { policy: 'strict' }).hash;
    expect(hashShorthand).toBe(hashProperty);
  });

  test('hash is stable when comments differ but logic is the same', () => {
    const withComments = {
      apply(record) {
        // business rule
        return record.data.amount >= 0; // non-negative
      }
    };
    const withoutComments = {
      apply(record) {
        return record.data.amount >= 0;
      }
    };

    expect(
      hashReflectiveLogic(withComments, { policy: 'strict' }).hash
    ).toBe(
      hashReflectiveLogic(withoutComments, { policy: 'strict' }).hash
    );
  });

  test('falls back to whitespace normalization when AST parse fails', () => {
    const normalized = normalizeFunctionSource('not valid javascript {{{', {
      astCanonicalize: true,
      stripComments: true,
      collapseWhitespace: true
    });
    expect(normalized).toBe('not valid javascript {{{');
  });

  test('walks nested object graphs via Reflect.ownKeys', () => {
    const rules = {
      currency: 'USD',
      validators: {
        validateScore(record) {
          return record.data.points >= 0;
        }
      }
    };

    const { fingerprints } = collectReflectiveFingerprints(rules);
    expect(fingerprints.has('$.validators.validateScore')).toBe(true);
    expect(fingerprints.has('$.currency')).toBe(false);
  });

  test('rejects native functions by default', () => {
    expect(() => hashReflectiveLogic(Array.prototype.map, { policy: 'strict' }))
      .toThrow('native functions cannot be fingerprinted');
  });

  test('hashReflectiveLogic returns per-path fingerprint list', () => {
    const rules = {
      apply(record) {
        return record.data.x > 0;
      }
    };
    const result = hashReflectiveLogic(rules, { policy: 'advisory' });
    expect(result.hash).toMatch(/^sha512:/);
    expect(result.fingerprintList[0].path).toBe('$.apply');
    expect(result.fingerprintList[0].hash).toMatch(/^sha512:/);
  });

  test('registerVerification reflective mode hashes nested functions', () => {
    const rulesV1 = {
      max: 10,
      validate(record) {
        return record.data.score <= 10;
      }
    };
    const rulesV2 = {
      max: 10,
      validate(record) {
        return record.data.score <= 20;
      }
    };

    const entryV1 = buildVerificationEntry({
      code: rulesV1,
      version: '1.0.0',
      policy: 'strict',
      reflective: true
    });
    const entryV2 = buildVerificationEntry({
      code: rulesV2,
      version: '1.0.0',
      policy: 'strict',
      reflective: true
    });

    expect(entryV1.hash).not.toBe(entryV2.hash);
    expect(entryV1.fingerprintList.length).toBe(1);
    expect(hashVerificationCode(rulesV1, { reflective: true, policy: 'strict' })).toBe(entryV1.hash);
  });

  test('policy is bound into reflective hash', () => {
    const rules = { check() { return true; } };
    const strict = hashReflectiveLogic(rules, { policy: 'strict' }).hash;
    const advisory = hashReflectiveLogic(rules, { policy: 'advisory' }).hash;
    expect(strict).not.toBe(advisory);
  });
});
