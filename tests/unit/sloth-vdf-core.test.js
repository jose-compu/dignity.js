const SlothPermutation = require('../../src/security/sloth-vdf');

describe('SlothPermutation core', () => {
  test('fastPow handles modulus equal to one', () => {
    const sloth = new SlothPermutation();
    const result = sloth.fastPow(5n, 7n, 1n);
    expect(result).toBe(0n);
  });

  test('generateProofVDF and verifyProofVDF round-trip', () => {
    const sloth = new SlothPermutation();
    const challenge = 12345678901234567890n;
    const steps = 6n;

    const proof = sloth.generateProofVDF(steps, challenge);
    const verified = sloth.verifyProofVDF(steps, challenge, proof);

    expect(verified).toBe(true);
  });

  test('modVerif handles non-quadratic-residue verification path', () => {
    const sloth = new SlothPermutation();
    const challenge = 42n;
    const steps = 4n;
    const proof = sloth.generateProofVDF(steps, challenge);

    const originalQuadRes = sloth.quadRes.bind(sloth);
    jest.spyOn(sloth, 'quadRes').mockImplementation((value) => {
      if (value === proof || value === ((-proof + SlothPermutation.p) % SlothPermutation.p)) {
        return originalQuadRes(value);
      }
      return false;
    });

    expect(sloth.verifyProofVDF(steps, challenge, proof)).toBe(true);
  });

  test('modSqrtOp uses negated value for non-quadratic residues', () => {
    const sloth = new SlothPermutation();
    jest.spyOn(sloth, 'quadRes').mockReturnValue(false);

    const result = sloth.modSqrtOp(7n);
    expect(typeof result).toBe('bigint');
  });

  test('verifyProofVDF rejects tampered proof', () => {
    const sloth = new SlothPermutation();
    const challenge = 42n;
    const steps = 4n;

    const proof = sloth.generateProofVDF(steps, challenge);
    const tampered = (proof + 1n) % SlothPermutation.p;

    expect(sloth.verifyProofVDF(steps, challenge, tampered)).toBe(false);
  });
});
