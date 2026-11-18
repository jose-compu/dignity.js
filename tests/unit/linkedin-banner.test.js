const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, '../../assets/banners/render_linkedin.py');

describe('LinkedIn release banner', () => {
  test('v1.2.0 highlights fit inside card bounds (--check)', () => {
    execSync(`python3 ${JSON.stringify(scriptPath)} --check`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..'),
    });
  });
});