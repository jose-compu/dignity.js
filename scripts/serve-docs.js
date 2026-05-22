const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const root = path.join(__dirname, '..');
const preferredPort = Number(process.env.DOCS_PORT || 4173);
const openBrowser = process.argv.includes('--no-open') ? false : process.env.DOCS_NO_OPEN !== '1';

const requiredFiles = [
  'docs/index.html',
  'docs/chess/index.html',
  'docs/assets/highlight/highlight.min.js',
  'docs/assets/highlight/github.min.css',
  'docs/assets/highlight/github-dark.min.css'
];

function ensureChessBundle() {
  const chessBundle = path.join(root, 'docs/chess/assets/chess-app.js');

  if (fs.existsSync(chessBundle)) {
    return;
  }

  console.log('\n[docs] chess-app.js not found — building chess demo...\n');
  const build = spawnSync('node', ['scripts/build-chess-demo.js'], {
    cwd: root,
    stdio: 'inherit'
  });

  if (build.status !== 0) {
    process.exit(build.status || 1);
  }
}

function verifyDocs() {
  for (const relativePath of requiredFiles) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing docs asset: ${relativePath}`);
    }
  }
}

function isPortAvailable(port, host) {
  return new Promise((resolve) => {
    const probe = net.createServer();

    probe.once('error', () => resolve(false));
    probe.once('listening', () => {
      probe.close(() => resolve(true));
    });

    probe.listen(port, host);
  });
}

async function resolvePort(host) {
  if (await isPortAvailable(preferredPort, host)) {
    return preferredPort;
  }

  if (process.env.DOCS_PORT) {
    throw new Error(
      `Port ${preferredPort} is already in use. Stop the other server or run with DOCS_PORT=<other>.`
    );
  }

  for (let candidate = preferredPort + 1; candidate < preferredPort + 20; candidate += 1) {
    if (await isPortAvailable(candidate, host)) {
      console.log(`[docs] Port ${preferredPort} is in use — using ${candidate} instead.`);
      return candidate;
    }
  }

  throw new Error(`No free port found between ${preferredPort} and ${preferredPort + 19}.`);
}

async function main() {
  ensureChessBundle();
  verifyDocs();

  const host = '127.0.0.1';
  const port = await resolvePort(host);
  const docsUrl = `http://${host}:${port}/`;
  const chessUrl = `http://${host}:${port}/chess/`;

  console.log('\nServing dignity.js docs locally');
  console.log(`  Docs:  ${docsUrl}`);
  console.log(`  Chess: ${chessUrl}`);
  console.log('\nPress Ctrl+C to stop.\n');

  const httpServerBin = path.join(
    root,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'http-server.cmd' : 'http-server'
  );

  const serverArgs = [
    'docs',
    '-a',
    host,
    '-p',
    String(port),
    '-c-1'
  ];

  if (openBrowser) {
    serverArgs.push('-o', '/chess/');
  }

  const server = fs.existsSync(httpServerBin)
    ? spawn(httpServerBin, serverArgs, { cwd: root, stdio: 'inherit' })
    : spawn('npx', ['http-server', ...serverArgs], { cwd: root, stdio: 'inherit', shell: true });

  server.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
