/**
 * E2E smoke test for chess portable checkpoint import (RUN_CHESS_E2E=1).
 * Full WebRTC co-sign handshake requires two live peers and is environment-dependent;
 * this test verifies dual-signed checkpoint validation and lobby resume import in the browser.
 */

const { test, expect } = require('@playwright/test');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const {
  buildCheckpointDraft,
  signCheckpoint,
  formatPortableCheckpointBundle,
  validateCheckpointForResume
} = require('../../docs/chess/src/lib/resumeCheckpoint.js');
const { createFreshKeyPair, keyPairToPublicBundle } = require('../../docs/chess/src/lib/playerKeys.js');

const ROOT = path.join(__dirname, '../..');
const DOCS_PORT = Number(process.env.DOCS_PORT || 4174);

function buildSignedCheckpointFixture() {
  const whiteKeys = createFreshKeyPair();
  const blackKeys = createFreshKeyPair();
  const whitePublic = keyPairToPublicBundle(whiteKeys);
  const blackPublic = keyPairToPublicBundle(blackKeys);
  const game = {
    version: 1,
    data: {
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      moveHistory: ['e4'],
      status: 'playing',
      turn: 'black',
      winner: null,
      joinToken: 'join',
      watchToken: 'watch',
      whitePlayerId: 'host-peer',
      blackPlayerId: 'join-peer',
      whiteNickname: 'White',
      blackNickname: 'Black',
      whitePublicKey: whitePublic,
      blackPublicKey: blackPublic
    }
  };

  let checkpoint = buildCheckpointDraft({
    gameId: 'E2E-Resume',
    roomKey: 'room-e2e',
    scope: 'room:chess:E2E-Resume',
    game,
    seat: 'white',
    nickname: 'White',
    publicKey: whitePublic,
    peerId: 'host-peer'
  });
  checkpoint = signCheckpoint(checkpoint, whiteKeys, 'white');
  checkpoint = signCheckpoint(checkpoint, blackKeys, 'black');
  return { checkpoint, whiteKeys, blackKeys };
}

let serverProcess;

test.beforeAll(async () => {
  if (process.env.RUN_CHESS_E2E !== '1') {
    return;
  }

  const buildChess = spawnSync('node', ['scripts/build-chess-demo.js'], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  if (buildChess.status !== 0) {
    throw new Error('Failed to build chess demo');
  }

  serverProcess = spawn('npx', ['http-server', 'docs', '-a', '127.0.0.1', '-p', String(DOCS_PORT), '-c-1'], {
    cwd: ROOT,
    stdio: 'pipe',
    shell: true
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
});

test.afterAll(async () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});

test.describe('chess resume smoke', () => {
  test.skip(() => process.env.RUN_CHESS_E2E !== '1', 'Set RUN_CHESS_E2E=1 to run browser e2e tests');

  test('lobby imports portable checkpoint and opens resume join gate', async ({ page }) => {
    const { checkpoint } = buildSignedCheckpointFixture();
    expect(validateCheckpointForResume(checkpoint)).toEqual({ ok: true });

    const bundle = formatPortableCheckpointBundle(checkpoint);
    const baseUrl = `http://127.0.0.1:${DOCS_PORT}/chess/`;

    await page.goto(baseUrl);
    await page.getByLabel('Portable dual-signed checkpoint bundle').fill(bundle);
    await page.getByRole('button', { name: 'Import checkpoint and open resume' }).click();

    await expect(page.getByRole('heading', { name: 'Resume game' })).toBeVisible();
    await expect(page.getByText('Game E2E-Resume')).toBeVisible();
  });

  test('rejects tampered portable checkpoint bundle in lobby', async ({ page }) => {
    const { checkpoint } = buildSignedCheckpointFixture();
    const tampered = {
      v: 1,
      kind: 'dignity-chess-checkpoint',
      exportedAt: Date.now(),
      checkpoint: {
        ...checkpoint,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }
    };

    const baseUrl = `http://127.0.0.1:${DOCS_PORT}/chess/`;
    await page.goto(baseUrl);
    await page.getByLabel('Portable dual-signed checkpoint bundle').fill(JSON.stringify(tampered));
    await page.getByRole('button', { name: 'Import checkpoint and open resume' }).click();
    await expect(page.getByRole('alert')).toContainText('signature verification failed', { ignoreCase: true });
  });
});
