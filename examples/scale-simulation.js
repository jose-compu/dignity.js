#!/usr/bin/env node
/**
 * Seeded fan-out scale model (#152 v1.14.0).
 */

const { runScaleSimulation } = require('../src');

const seed = Number(process.env.SCALE_SIM_SEED) || undefined;
const profile = process.env.SCALE_SIM_PROFILE === 'offline' ? 'offline' : 'ci';

const result = runScaleSimulation({ seed, profile });

const row10M = result.targets.find((t) => t.viewers === 10_000_000) ?? result.targets[result.targets.length - 1];

console.log(`viewers: ${row10M.viewers}`);
console.log(`hops: ${row10M.hops}`);
console.log(`chunk verified: ${result.chunk.verified}`);
console.log(`claim: ${result.claim.status}`);
if (result.claim.status === 'qualified') {
  console.log(`failed checks: ${result.claim.failedChecks.join(', ')}`);
}
console.log(`stall rate: ${result.stall.stallRate}`);

if (process.env.SCALE_SIM_JSON === '1') {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}