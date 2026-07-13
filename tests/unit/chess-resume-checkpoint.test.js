/**
 * @jest-environment jsdom
 */

require('fake-indexeddb/auto');

if (typeof structuredClone === 'undefined') {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const {
  buildCheckpointDraft,
  signCheckpoint,
  verifyCheckpointSignature,
  isCheckpointFullySigned,
  serializeCheckpoint,
  deserializeCheckpoint,
  validateCheckpointForResume,
  checkpointSeatForPublicKey,
  getCheckpointSeatPublicKey,
  storeCheckpointRef,
  loadCheckpointRef,
  formatPortableCheckpointBundle,
  parsePortableCheckpointBundle,
  buildResumeHashFromCheckpoint
} = require('../../docs/chess/src/lib/resumeCheckpoint.js');
const {
  createFreshKeyPair,
  keyPairToPublicBundle,
  savePlayerKeyRecord,
  loadPlayerKeyPair,
  findPlayerKeyPairByPublicKey,
  exportSeatKeyBackup,
  importSeatKeyBackup,
  derivePlayerKeyPairFromCredentials,
  resolveResumeKeysFromCheckpoint
} = require('../../docs/chess/src/lib/playerKeys.js');

const GAME_ID = 'Fischer-Spassky';
const ROOM_KEY = 'room-alpha';

function sampleGame(overrides = {}) {
  return {
    version: 3,
    data: {
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      moveHistory: ['e4'],
      status: 'playing',
      turn: 'black',
      winner: null,
      joinToken: 'join-token',
      watchToken: 'watch-token',
      whitePlayerId: 'host-peer',
      blackPlayerId: 'join-peer',
      whiteNickname: 'White',
      blackNickname: 'Black',
      whitePublicKey: null,
      blackPublicKey: null,
      ...overrides
    }
  };
}

function dualSignedCheckpoint() {
  const whiteKeys = createFreshKeyPair();
  const blackKeys = createFreshKeyPair();
  const whitePublic = keyPairToPublicBundle(whiteKeys);
  const blackPublic = keyPairToPublicBundle(blackKeys);

  const game = sampleGame({
    whitePublicKey: whitePublic,
    blackPublicKey: blackPublic
  });

  let checkpoint = buildCheckpointDraft({
    gameId: GAME_ID,
    roomKey: ROOM_KEY,
    scope: `room:chess:${GAME_ID}`,
    game,
    seat: 'white',
    nickname: 'White',
    publicKey: whitePublic,
    peerId: 'host-peer'
  });

  checkpoint = signCheckpoint(checkpoint, whiteKeys, 'white');
  checkpoint = signCheckpoint(checkpoint, blackKeys, 'black');
  return { checkpoint, whiteKeys, blackKeys, whitePublic, blackPublic };
}

beforeEach(() => {
  localStorage.clear();
  indexedDB.deleteDatabase('dignity-chess-checkpoints');
});

describe('resumeCheckpoint', () => {
  test('dual-signed checkpoint passes validateCheckpointForResume', () => {
    const { checkpoint } = dualSignedCheckpoint();
    expect(validateCheckpointForResume(checkpoint)).toEqual({ ok: true });
    expect(isCheckpointFullySigned(checkpoint)).toBe(true);
  });

  test('rejects tampered checkpoint signatures', () => {
    const { checkpoint } = dualSignedCheckpoint();
    checkpoint.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(isCheckpointFullySigned(checkpoint)).toBe(false);
    expect(validateCheckpointForResume(checkpoint)).toEqual({ ok: false, reason: 'missing-signatures' });
  });

  test('round-trips serializeCheckpoint and deserializeCheckpoint', () => {
    const { checkpoint } = dualSignedCheckpoint();
    const encoded = serializeCheckpoint(checkpoint);
    const restored = deserializeCheckpoint(encoded);
    expect(restored).toEqual(checkpoint);
    expect(validateCheckpointForResume(restored)).toEqual({ ok: true });
  });

  test('stable key order does not change signature payload', () => {
    const { checkpoint, whiteKeys } = dualSignedCheckpoint();
    const reordered = {
      ...checkpoint,
      moveHistory: [...checkpoint.moveHistory],
      signatures: {}
    };
    const signed = signCheckpoint(reordered, whiteKeys, 'white');
    expect(verifyCheckpointSignature(signed, 'white')).toBe(true);
  });

  test('storeCheckpointRef and loadCheckpointRef round-trip', async () => {
    const { checkpoint } = dualSignedCheckpoint();
    const ref = await storeCheckpointRef(checkpoint);
    expect(ref).toMatch(/^cp_/);

    const loaded = await loadCheckpointRef(ref);
    expect(validateCheckpointForResume(loaded)).toEqual({ ok: true });
    expect(loaded.fen).toBe(checkpoint.fen);
  });

  test('formatPortableCheckpointBundle and parsePortableCheckpointBundle', () => {
    const { checkpoint } = dualSignedCheckpoint();
    const bundle = formatPortableCheckpointBundle(checkpoint);
    const parsed = parsePortableCheckpointBundle(bundle);
    expect(validateCheckpointForResume(parsed)).toEqual({ ok: true });
    expect(parsed.gameId).toBe(GAME_ID);
  });

  test('parsePortableCheckpointBundle rejects invalid bundle', () => {
    expect(() => parsePortableCheckpointBundle('not-json')).toThrow('Invalid portable checkpoint bundle');
    const { checkpoint } = dualSignedCheckpoint();
    const tampered = {
      v: 1,
      kind: 'dignity-chess-checkpoint',
      exportedAt: Date.now(),
      checkpoint: {
        ...checkpoint,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }
    };
    expect(() => parsePortableCheckpointBundle(JSON.stringify(tampered))).toThrow('Checkpoint signature verification failed');
  });

  test('buildResumeHashFromCheckpoint embeds inline checkpoint when small enough', () => {
    const { checkpoint } = dualSignedCheckpoint();
    const hash = buildResumeHashFromCheckpoint(checkpoint);
    expect(hash).toContain('role=resume');
    expect(hash).toContain('checkpoint=');
    expect(hash).not.toContain('checkpointRef=');
  });

  test('checkpointSeatForPublicKey resolves seat from signing public key', () => {
    const { checkpoint, whitePublic, blackPublic } = dualSignedCheckpoint();
    expect(checkpointSeatForPublicKey(checkpoint, whitePublic)).toBe('white');
    expect(checkpointSeatForPublicKey(checkpoint, blackPublic)).toBe('black');
  });
});

describe('playerKeys', () => {
  test('save and load player key pair by game and seat', () => {
    const keyPair = createFreshKeyPair();
    savePlayerKeyRecord(GAME_ID, 'white', keyPair, 'Alice');
    const loaded = loadPlayerKeyPair(GAME_ID, 'white');
    expect(loaded.signing.publicKey).toEqual(keyPair.signing.publicKey);
    expect(loaded.encryption.publicKey).toEqual(keyPair.encryption.publicKey);
  });

  test('findPlayerKeyPairByPublicKey uses fingerprint index', () => {
    const keyPair = createFreshKeyPair();
    savePlayerKeyRecord(GAME_ID, 'black', keyPair, 'Bob');
    const found = findPlayerKeyPairByPublicKey(keyPairToPublicBundle(keyPair));
    expect(found.signing.secretKey).toEqual(keyPair.signing.secretKey);
  });

  test('exportSeatKeyBackup and importSeatKeyBackup round-trip', () => {
    const keyPair = createFreshKeyPair();
    savePlayerKeyRecord(GAME_ID, 'white', keyPair, 'Alice');
    const backup = exportSeatKeyBackup(GAME_ID, 'white');
    expect(backup).toBeTruthy();

    localStorage.clear();
    const imported = importSeatKeyBackup(backup);
    expect(imported).toEqual({
      gameId: GAME_ID,
      seat: 'white',
      keyPair: expect.objectContaining({
        signing: expect.any(Object),
        encryption: expect.any(Object)
      })
    });
    expect(loadPlayerKeyPair(GAME_ID, 'white').signing.publicKey).toEqual(keyPair.signing.publicKey);
  });

  test('importSeatKeyBackup rejects malformed backup', () => {
    expect(() => importSeatKeyBackup('!!!')).toThrow('Invalid seat key backup');
    expect(() => importSeatKeyBackup(btoa(JSON.stringify({ gameId: GAME_ID })))).toThrow('Invalid seat key backup');
  });

  test('getCheckpointSeatPublicKey falls back to signatures when player slot is empty', () => {
    const whiteKeys = createFreshKeyPair();
    const blackKeys = createFreshKeyPair();
    let checkpoint = buildCheckpointDraft({
      gameId: GAME_ID,
      roomKey: ROOM_KEY,
      scope: `room:chess:${GAME_ID}`,
      game: sampleGame(),
      seat: 'white',
      nickname: 'White',
      publicKey: keyPairToPublicBundle(whiteKeys),
      peerId: 'host-peer'
    });
    checkpoint = signCheckpoint(checkpoint, whiteKeys, 'white');
    checkpoint = signCheckpoint(checkpoint, blackKeys, 'black');
    checkpoint.black = {
      ...checkpoint.black,
      publicKey: null
    };

    expect(getCheckpointSeatPublicKey(checkpoint, 'black')?.signingPublicKey)
      .toBe(keyPairToPublicBundle(blackKeys).signingPublicKey);
    expect(checkpointSeatForPublicKey(checkpoint, keyPairToPublicBundle(blackKeys))).toBe('black');
  });

  test('resolveResumeKeysFromCheckpoint matches black credentials when player publicKey is null', async () => {
    const username = 'player2';
    const password = 'black-pass';
    const blackKeys = await derivePlayerKeyPairFromCredentials({
      gameId: GAME_ID,
      seat: 'black',
      username,
      password
    });
    const whiteKeys = createFreshKeyPair();

    let checkpoint = buildCheckpointDraft({
      gameId: GAME_ID,
      roomKey: ROOM_KEY,
      scope: `room:chess:${GAME_ID}`,
      game: sampleGame({ blackPlayerId: 'join-peer' }),
      seat: 'white',
      nickname: 'White',
      publicKey: keyPairToPublicBundle(whiteKeys),
      peerId: 'host-peer'
    });
    checkpoint = signCheckpoint(checkpoint, whiteKeys, 'white');
    checkpoint = signCheckpoint(checkpoint, blackKeys, 'black');
    checkpoint.black.publicKey = null;

    const resolved = await resolveResumeKeysFromCheckpoint({
      checkpoint,
      gameId: GAME_ID,
      username,
      password
    });

    expect(resolved.seat).toBe('black');
    expect(resolved.keyPair.signing.publicKey).toEqual(blackKeys.signing.publicKey);
  });
});
