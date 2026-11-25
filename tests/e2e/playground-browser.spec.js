/**
 * Smoke-test live playground demos in a real browser.
 * Run: RUN_BROWSER_E2E=1 npm run test:e2e:browser
 */

const { test, expect } = require('@playwright/test');

const shouldRun = () => process.env.RUN_BROWSER_E2E === '1';

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  }
});

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
    expectLines: ['selected layer: L0', 'selected layer: L1']
  },
  {
    hash: 'stream-relay-degrade',
    expectLines: ['child A layer: L2', 'child B layer: L0', 'buffer target:']
  },
  {
    hash: 'stream-simulcast-load',
    expectLines: ['published layers: L0 L1 L2', 'relay forwards: L0', 'viewer layer: L0']
  },
  {
    hash: 'stream-ingest-mpegts',
    expectLines: ['access units:', 'keyframes:', 'first timestampMs:']
  },
  {
    hash: 'stream-scale-sim',
    expectLines: ['viewers: 10000000', 'hops: 6', 'chunk verified: true']
  },
  {
    hash: 'stream-capacity-relays',
    expectLines: ['childBudget:']
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
      const lines = demo.expectLines || (demo.expectLine ? [demo.expectLine] : []);
      for (const line of lines) {
        await expect(page.locator('#output')).toContainText(line);
      }
      await expect(page.locator('#output .is-error')).toHaveCount(0);
    });
  }
});

test.describe('Playground WebCodecs capture (fake media)', () => {
  test.skip(() => !shouldRun(), 'Set RUN_BROWSER_E2E=1 to run headless browser tests');

  test('stream-webcodecs-capture encodes at least one verified keyframe', async ({ page }, testInfo) => {
    await page.goto('/playground/index.html#stream-webcodecs-capture');
    await page.getByRole('button', { name: /Run/ }).click();
    await expect(page.locator('#run-status')).toHaveText('Done', { timeout: 60000 });
    const outputText = await page.locator('#output').innerText();
    if (outputText.includes('webcodecs supported: false')) {
      testInfo.skip(true, 'WebCodecs not available in this Chromium build');
      return;
    }
    await expect(page.locator('#output')).toContainText('verified keyframes:');
    const match = outputText.match(/verified keyframes:\s*(\d+)/);
    expect(Number(match[1])).toBeGreaterThanOrEqual(1);
    const decodedMatch = outputText.match(/decoded frames:\s*(\d+)/);
    testInfo.annotations.push({
      type: 'webcodecs-decode',
      description: decodedMatch ? `decoded frames: ${decodedMatch[1]}` : 'decode count unavailable'
    });
  });
});
