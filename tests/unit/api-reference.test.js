const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pkg = require('../../package.json');

const apiRefPath = path.join(__dirname, '../../docs/api-reference.md');
const specPath = path.join(__dirname, '../../docs/openapi-like.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

describe('api-reference.md (#93)', () => {
  test('exists and matches openapi-like.json version', () => {
    expect(fs.existsSync(apiRefPath)).toBe(true);
    const content = fs.readFileSync(apiRefPath, 'utf8');
    expect(content).toContain(`v${spec.version}`);
    expect(content).toContain('openapi-like.json');
    expect(content).toContain('create(collection, data, options)');
    expect(content).toContain('joinPeerGroup');
    expect(spec.version).toBe(pkg.version);
  });

  test('regenerate script keeps file in sync', () => {
    const before = fs.readFileSync(apiRefPath, 'utf8');
    execSync('node scripts/generate-api-reference.js', {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe'
    });
    const after = fs.readFileSync(apiRefPath, 'utf8');
    expect(after).toBe(before);
  });
});
