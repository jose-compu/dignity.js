/**
 * Verify that every playground demo runs without errors.
 * Uses Node crypto.webcrypto shim since demos use Web Crypto API.
 */

const fs = require('fs');
const path = require('path');
const dignity = require('../../src/index');
const crypto = require('crypto');

global.crypto = crypto.webcrypto;

// Load demos by reading the ESM file and extracting the array
const demosPath = path.join(__dirname, '../../docs/assets/playground-demos.js');
const demosContent = fs.readFileSync(demosPath, 'utf8');
const arrayMatch = demosContent.match(/export const PLAYGROUND_DEMOS = (\[[\s\S]+\]);/);
if (!arrayMatch) {
  throw new Error('Could not parse PLAYGROUND_DEMOS from playground-demos.js');
}
const PLAYGROUND_DEMOS = eval(arrayMatch[1]);

function createHelpers() {
  const tracked = [];
  const cleanupFns = [];

  return {
    fastSecurity(overrides = {}) {
      return {
        appPassword: 'playground-test-password',
        powEnabled: false,
        signingEnabled: false,
        encryptionEnabled: false,
        ...overrides
      };
    },
    sleep(ms = 30) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    track(...nodes) {
      tracked.push(...nodes);
    },
    onCleanup(fn) {
      cleanupFns.push(fn);
    },
    async cleanupAll() {
      for (const node of tracked) {
        if (node && typeof node.stop === 'function') {
          try {
            await node.stop();
          } catch (err) {
            // ignore cleanup errors
          }
        }
      }
      for (const fn of cleanupFns) {
        try {
          await fn();
        } catch (err) {
          // ignore cleanup errors
        }
      }
      tracked.length = 0;
      cleanupFns.length = 0;
    }
  };
}

// Demos that require DOM (document/window) - skip in Node tests
const DOM_REQUIRED_DEMOS = new Set(['app-sandbox-host', 'app-error-panel']);

describe('Playground demos', () => {
  for (const demo of PLAYGROUND_DEMOS) {
    if (DOM_REQUIRED_DEMOS.has(demo.id)) {
      test.skip(`${demo.id} runs without errors (requires DOM)`, () => {});
      continue;
    }

    test(`${demo.id} runs without errors`, async () => {
      const helpers = createHelpers();
      const logs = [];
      const log = (...args) => {
        logs.push(args.map(a => String(a)).join(' '));
      };

      try {
        const fn = new Function('dignity', 'helpers', 'log', `return (async () => { ${demo.code} })();`);
        await fn(dignity, helpers, log);
      } catch (err) {
        throw new Error(`Demo ${demo.id} failed: ${err.message}\n${err.stack}`);
      } finally {
        await helpers.cleanupAll();
      }

      // Check that log was called (every demo should produce output)
      expect(logs.length).toBeGreaterThan(0);

      // Check that no "Error" or "undefined" was logged (common failure patterns)
      const errorLogs = logs.filter(l =>
        l.includes('ERROR:') ||
        (l.includes('Error:') && !l.includes('invalid mode caught')) ||
        l === 'undefined'
      );
      if (errorLogs.length > 0) {
        throw new Error(`Demo ${demo.id} logged errors: ${errorLogs.join(', ')}`);
      }
    }, 10000); // 10s timeout per demo
  }
});
