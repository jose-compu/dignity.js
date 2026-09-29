import { bench, describe } from 'vitest';
import { require } from './helpers.mjs';

const { validateDignityAppManifest } = require('../src/apps/manifest');
const { buildAppCsp, prepareSandboxedAppHtml } = require('../src/apps/csp');
const { sanitizeCaptureValue } = require('../src/apps/capture-sanitize');

const rawManifest = {
  id: 'chess-lobby',
  title: 'Chess lobby',
  version: '1.2.3',
  collections: ['games', 'moves', 'players', 'chat'],
  allowedCspOrigins: ['https://cdn.example.com', 'https://images.example.org'],
  storedCommands: [
    { id: 'make-move', collection: 'moves', kind: 'create' },
    { id: 'rename-player', collection: 'players', kind: 'update' },
    { id: 'post-chat', collection: 'chat', kind: 'create' }
  ]
};

const validated = validateDignityAppManifest(rawManifest);
if (!validated.ok) {
  throw new Error(`Benchmark manifest is invalid: ${JSON.stringify(validated)}`);
}
const manifest = validated.manifest;

const appHtml = `<!doctype html><html><head><title>Chess</title></head><body>${
  '<div class="square"><span>piece</span></div>'.repeat(64)
}<script>window.app = {};</script></body></html>`;

const capturePayload = {
  level: 'error',
  message: 'x'.repeat(4000),
  context: {
    user: { name: 'alice', password: 'hunter2', token: 'abc' },
    history: Array.from({ length: 50 }, (_, i) => ({ move: i, san: `e${i % 8}`, meta: { depth: { deeper: { deepest: { tooDeep: i } } } } })),
    appPassword: 'secret'
  }
};

describe('Dignity Apps', () => {
  bench('validateDignityAppManifest', () => {
    validateDignityAppManifest(rawManifest);
  });

  bench('buildAppCsp', () => {
    buildAppCsp(manifest);
  });

  bench('prepareSandboxedAppHtml', () => {
    prepareSandboxedAppHtml(appHtml, manifest);
  });

  bench('sanitizeCaptureValue (nested log payload)', () => {
    sanitizeCaptureValue(capturePayload);
  });
});
