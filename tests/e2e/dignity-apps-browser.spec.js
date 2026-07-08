/**
 * Real-browser tests for Dignity Apps (MessageChannel, sandboxed iframe, CSP).
 * Run: RUN_BROWSER_E2E=1 npm run test:e2e:browser
 */

const { test, expect } = require('@playwright/test');

const shouldRun = () => process.env.RUN_BROWSER_E2E === '1';

test.describe('Dignity Apps browser', () => {
  test.skip(() => !shouldRun(), 'Set RUN_BROWSER_E2E=1 to run headless browser tests');

  test('sandboxed host iframe handshake and query in Chromium', async ({ page }) => {
    await page.goto('/e2e-fixtures/dignity-apps-host.html');

    await expect(page.locator('#channel-ready')).toHaveText('true', { timeout: 15000 });
    await expect(page.locator('#status')).toHaveText('ok', { timeout: 5000 });
    await expect(page.locator('#sandbox')).toHaveText('allow-scripts');
    await expect(page.locator('#csp-present')).toHaveText('true');
    await expect(page.locator('#post-text')).toHaveText('browser timeline post');
  });
});
