const { execSync } = require('child_process');
const path = require('path');

describe('TypeScript definitions (#14)', () => {
  test('typescript consumer compiles with tsc --noEmit', () => {
    const consumerDir = path.join(__dirname, '../../examples/typescript-consumer');
    execSync('npm run test:typescript', {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit'
    });
  });
});
