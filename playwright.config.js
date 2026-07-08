const { defineConfig } = require('@playwright/test');

const docsPort = Number(process.env.DOCS_PORT || process.env.PLAYWRIGHT_DOCS_PORT || 4174);
const e2eEnabled = process.env.RUN_BROWSER_E2E === '1' || process.env.RUN_CHESS_E2E === '1';

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  fullyParallel: false,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: `http://127.0.0.1:${docsPort}`
  },
  webServer: e2eEnabled
    ? {
      command: 'node scripts/serve-docs-e2e.js',
      url: `http://127.0.0.1:${docsPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        ...process.env,
        DOCS_PORT: String(docsPort)
      }
    }
    : undefined
});
