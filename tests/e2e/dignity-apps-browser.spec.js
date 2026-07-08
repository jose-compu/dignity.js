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

  test('error panel auto-expands on iframe errors', async ({ page }) => {
    await page.goto('/e2e-fixtures/dignity-apps-error-panel.html');

    await expect(page.locator('#status')).toHaveText('ok', { timeout: 15000 });
    await expect(page.locator('#error-panel-visible')).toHaveText('true');
    await expect(page.locator('#error-count')).not.toHaveText('0');
  });

  test('timeline app shell loads posts', async ({ page }) => {
    await page.goto('/apps/timeline/index.html');

    await expect(page.locator('#status')).toHaveText('ok', { timeout: 15000 });
    const frame = page.frameLocator('#host-mount iframe');
    await expect(frame.locator('.post')).toHaveCount(2, { timeout: 10000 });
    await expect(frame.locator('.post').first()).toContainText('Welcome');
  });

  test('apps registry lists timeline and supports search', async ({ page }) => {
    await page.goto('/apps/index.html');

    await expect(page.locator('.app-card')).toHaveCount(1);
    await expect(page.locator('.app-card h2')).toHaveText('Timeline');

    await page.fill('#search', 'no-match-xyz');
    await expect(page.locator('#apps-empty')).toBeVisible();

    await page.fill('#search', 'timeline');
    await expect(page.locator('.app-card')).toHaveCount(1);
  });
});
