/**
 * Smoke-test live playground demos in a real browser.
 * Run: RUN_BROWSER_E2E=1 npm run test:e2e:browser
 */

const { test, expect } = require('@playwright/test');

const shouldRun = () => process.env.RUN_BROWSER_E2E === '1';

const DIGNITY_APP_DEMOS = [
  {
    hash: 'app-manifest',
    expectLine: 'valid: true'
  },
  {
    hash: 'app-csp',
    expectLine: 'allows CDN: true'
  },
  {
    hash: 'app-bridge-query',
    expectLine: 'rpc ok: true'
  },
  {
    hash: 'app-stored-command',
    expectLine: 'stored command ok: true'
  },
  {
    hash: 'app-sandbox-host',
    expectLine: 'sandbox: allow-scripts'
  }
];

test.describe('Playground browser', () => {
  test.skip(() => !shouldRun(), 'Set RUN_BROWSER_E2E=1 to run headless browser tests');

  test('playground page loads and lists Dignity Apps examples', async ({ page }) => {
    await page.goto('/playground/index.html');
    await expect(page.getByRole('heading', { name: 'Live playground' })).toBeVisible();
    await expect(page.locator('a[href="#app-bridge-query"]')).toBeVisible();
    await expect(page.getByLabel('Feature')).toBeVisible();
  });

  for (const demo of DIGNITY_APP_DEMOS) {
    test(`playground demo runs: ${demo.hash}`, async ({ page }) => {
      await page.goto(`/playground/index.html#${demo.hash}`);
      await page.getByRole('button', { name: /Run/ }).click();
      await expect(page.locator('#run-status')).toHaveText('Done', { timeout: 20000 });
      await expect(page.locator('#output')).toContainText(demo.expectLine);
      await expect(page.locator('#output .is-error')).toHaveCount(0);
    });
  }
});
