const fs = require('fs');
const path = require('path');

const contributingPath = path.join(__dirname, '../../CONTRIBUTING.md');
const templateDir = path.join(__dirname, '../../.github/ISSUE_TEMPLATE');

describe('contributor docs (v0.9)', () => {
  test('CONTRIBUTING.md exists and links good first issues', () => {
    const content = fs.readFileSync(contributingPath, 'utf8');
    expect(content).toContain('good first issue');
    expect(content).toContain('npm test');
  });

  test('GitHub issue templates exist', () => {
    expect(fs.existsSync(path.join(templateDir, 'bug_report.yml'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'feature_request.yml'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'config.yml'))).toBe(true);
  });
});
