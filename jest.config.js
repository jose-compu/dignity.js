module.exports = {
  testEnvironment: 'node',
  transform: {
    'docs/chess/src/.+\\.(js|jsx)$': '<rootDir>/tests/helpers/esbuild-cjs-transform.js'
  },
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: process.env.RUN_POW_CALIBRATE === '1'
    ? []
    : ['<rootDir>/tests/unit/sloth-vdf-timing.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/streaming/ingest/**/*.js',
    '!src/streaming/node-webrtc-peer.js',
    '!src/streaming/browser-capture-source.js',
    '!src/streaming/mse-player.js',
    '!src/streaming/rtp-depacketizer.js',
    '!src/streaming/webcodecs-audio-decoder.js'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  verbose: true
};
