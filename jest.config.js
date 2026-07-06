module.exports = {
  testEnvironment: 'node',
  transform: {
    'docs/chess/src/.+\\.(js|jsx)$': '<rootDir>/tests/helpers/esbuild-cjs-transform.js'
  },
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: process.env.RUN_POW_CALIBRATE === '1'
    ? []
    : ['<rootDir>/tests/unit/sloth-vdf-timing.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  verbose: true
};
