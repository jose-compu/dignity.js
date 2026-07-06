const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function run() {
  const outDir = path.join(__dirname, '../docs/tictactoe/assets');
  fs.mkdirSync(outDir, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(__dirname, '../docs/tictactoe/src/app.js')],
    bundle: true,
    outfile: path.join(outDir, 'tictactoe-app.js'),
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    mainFields: ['module', 'main'],
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  const distSource = path.join(__dirname, '../dist/dignity.esm.js');
  const distTarget = path.join(__dirname, '../docs/assets/dignity.esm.js');
  if (fs.existsSync(distSource)) {
    fs.mkdirSync(path.dirname(distTarget), { recursive: true });
    fs.copyFileSync(distSource, distTarget);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
