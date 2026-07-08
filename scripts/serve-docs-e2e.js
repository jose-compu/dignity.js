#!/usr/bin/env node
/**
 * Build docs assets and serve docs/ for Playwright browser e2e tests.
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const port = Number(process.env.DOCS_PORT || process.env.PLAYWRIGHT_DOCS_PORT || 4174);
const host = process.env.DOCS_HOST || '127.0.0.1';

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const esmTarget = path.join(root, 'docs/assets/dignity.esm.js');
const esmSource = path.join(root, 'dist/dignity.esm.js');

run('npm', ['run', 'build']);
fs.copyFileSync(esmSource, esmTarget);

if (!fs.existsSync(path.join(root, 'docs/chess/assets/chess-app.js'))) {
  run('node', ['scripts/build-chess-demo.js']);
}

const server = spawn(
  'npx',
  ['http-server', 'docs', '-a', host, '-p', String(port), '-c-1'],
  { cwd: root, stdio: 'inherit', shell: true }
);

function shutdown() {
  server.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.on('exit', (code) => {
  process.exit(code || 0);
});
