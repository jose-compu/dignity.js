/*
 * VDF wrapper adaptation based on:
 * https://github.com/hyperhyperspace/pulsar/blob/main/src/model/VDF.ts
 */
const SlothPermutation = require('./sloth-vdf');

class VDF {
  static async compute(challengeHex, steps) {
    const vdfInstance = new SlothPermutation();
    const challengeBigInt = BigInt(`0x${challengeHex}`);
    const result = vdfInstance.generateProofVDF(steps, challengeBigInt);
    return result.toString(16);
  }

  static async verify(challengeHex, steps, resultHex) {
    const vdfInstance = new SlothPermutation();
    const challengeBigInt = BigInt(`0x${challengeHex}`);
    const resultBigInt = BigInt(`0x${resultHex}`);
    return vdfInstance.verifyProofVDF(steps, challengeBigInt, resultBigInt);
  }
}

module.exports = VDF;
