const esbuild = require('esbuild');

async function run() {
  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: ['node18'],
    outfile: 'dist/dignity.cjs.js',
    sourcemap: true
  });

  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    outfile: 'dist/dignity.esm.js',
    sourcemap: true
  });

  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'iife',
    globalName: 'DignityJS',
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    outfile: 'dist/dignity.min.js'
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
