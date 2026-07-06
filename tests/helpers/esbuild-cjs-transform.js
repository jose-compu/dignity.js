const esbuild = require('esbuild');

module.exports = {
  process(sourceText, sourcePath) {
    const loader = sourcePath.endsWith('.jsx') ? 'jsx' : 'js';
    const result = esbuild.transformSync(sourceText, {
      loader,
      format: 'cjs',
      platform: 'node',
      target: 'node18'
    });
    return { code: result.code };
  }
};
