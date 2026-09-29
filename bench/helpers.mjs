import { createRequire } from 'node:module';

// Load the CommonJS sources natively so benchmarks measure the same code paths
// that consumers of the package execute.
export const require = createRequire(import.meta.url);

/**
 * Deterministic pseudo-random generator (mulberry32) so benchmark inputs and
 * shuffles are identical across runs.
 */
export function seededRandom(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
