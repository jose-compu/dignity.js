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
  },
  {
    hash: 'app-error-panel',
    expectLine: 'panel mounted: true'
  },
  {
    hash: 'stream-private-chunks',
    expectLine: 'recipient plaintext: sealed-frame'
  },
  {
    hash: 'stream-combined-rotation',
    expectLine: 'bob after rotation failed: true'
  },
  {
    hash: 'stream-framed-chunks',
    expectLine: 'signed keyframe: true'
  },
  {
    hash: 'stream-adaptive-layers',
    expectLine: 'selected layer: L0'
  },
  {
    hash: 'stream-adaptive-layers',
    expectLine: 'selected layer: L1'
  }
];

test.describe('Playground private stream demo', () => {
  test.skip(() => !shouldRun(), 'Set RUN_BROWSER_E2E=1 to run headless browser tests');

  test('private chunks demo rejects spectator', async ({ page }) => {
    await page.goto('/playground/index.html#stream-private-chunks');
    await page.getByRole('button', { name: /Run/ }).click();
    await expect(page.locator('#run-status')).toHaveText('Done', { timeout: 20000 });
    await expect(page.locator('#output')).toContainText('spectator decrypt failed: true');
  });
});

test.describe('Playground browser', () => {
  test.skip(() => !shouldRun(), 'Set RUN_BROWSER_E2E=1 to run headless browser tests');

  test('playground page loads and lists Dignity Apps examples', async ({ page }) => {
    await page.goto('/playground/index.html');
    await expect(page.getByRole('heading', { name: 'Live playground' })).toBeVisible();
    await expect(page.locator('a[href="#app-manifest"]')).toBeVisible();
    await expect(page.locator('a[href="#app-stored-command"]')).toBeVisible();
    await expect(page.getByLabel('Feature')).toBeVisible();
    await expect(page.locator('#feature-select option[value="app-bridge-query"]')).toHaveCount(1);
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
