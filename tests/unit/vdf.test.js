const VDF = require('../../src/security/vdf');

describe('VDF wrapper', () => {
  test('compute returns hex string and verify succeeds', async () => {
    const challenge = 'ab'.repeat(32);
    const steps = 5n;

    const proof = await VDF.compute(challenge, steps);
    const verified = await VDF.verify(challenge, steps, proof);

    expect(typeof proof).toBe('string');
    expect(proof).toMatch(/^[0-9a-f]+$/);
    expect(verified).toBe(true);
  });

  test('verify fails when challenge changes', async () => {
    const challenge = 'cd'.repeat(32);
    const steps = 3n;
    const proof = await VDF.compute(challenge, steps);

    const wrongChallenge = 'ef'.repeat(32);
    const verified = await VDF.verify(wrongChallenge, steps, proof);
    expect(verified).toBe(false);
  });

  test('verify fails when proof changes', async () => {
    const challenge = '12'.repeat(32);
    const steps = 3n;
    const proof = await VDF.compute(challenge, steps);
    const tamperedProof = `${proof.slice(0, -1)}0`;

    const verified = await VDF.verify(challenge, steps, tamperedProof);
    expect(verified).toBe(false);
  });
});
