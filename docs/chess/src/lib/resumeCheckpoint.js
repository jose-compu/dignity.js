import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { keyPairToPublicBundle } from './playerKeys.js';

const CHECKPOINT_VERSION = 1;
const CHECKPOINT_DB = 'dignity-chess-checkpoints';
const CHECKPOINT_STORE = 'bundles';
const MAX_INLINE_CHECKPOINT_CHARS = 1800;

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(`${padded}${'='.repeat(padLen)}`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function checkpointSigningPayload(checkpoint) {
  const { signatures, ...rest } = checkpoint;
  return stableStringify(rest);
}

export function buildCheckpointDraft({
  gameId,
  roomKey,
  scope,
  game,
  seat,
  nickname,
  publicKey,
  peerId
}) {
  if (!game?.data) {
    return null;
  }

  return {
    v: CHECKPOINT_VERSION,
    gameId,
    roomKey,
    scope,
    fen: game.data.fen,
    moveHistory: game.data.moveHistory || [],
    status: game.data.status,
    turn: game.data.turn,
    winner: game.data.winner ?? null,
    joinToken: game.data.joinToken || null,
    watchToken: game.data.watchToken || null,
    version: game.version || 1,
    white: game.data.whitePlayerId
      ? {
          peerId: game.data.whitePlayerId,
          nickname: seat === 'white' ? nickname : game.data.whiteNickname || 'White',
          publicKey: seat === 'white'
            ? publicKey
            : game.data.whitePublicKey || null
        }
      : null,
    black: game.data.blackPlayerId
      ? {
          peerId: game.data.blackPlayerId,
          nickname: seat === 'black' ? nickname : game.data.blackNickname || 'Black',
          publicKey: seat === 'black'
            ? publicKey
            : game.data.blackPublicKey || null
        }
      : null,
    signatures: {},
    createdAt: Date.now(),
    proposer: {
      seat,
      peerId,
      nickname,
      publicKey
    }
  };
}

export function enrichCheckpointPlayerMetadata(checkpoint, game) {
  if (!checkpoint || !game?.data) {
    return checkpoint;
  }

  const next = { ...checkpoint, signatures: { ...(checkpoint.signatures || {}) } };

  if (game.data.whitePlayerId) {
    next.white = {
      ...(next.white || {}),
      peerId: game.data.whitePlayerId,
      nickname: game.data.whiteNickname || next.white?.nickname || 'White',
      publicKey: game.data.whitePublicKey || next.white?.publicKey || null
    };
  }

  if (game.data.blackPlayerId) {
    next.black = {
      ...(next.black || {}),
      peerId: game.data.blackPlayerId,
      nickname: game.data.blackNickname || next.black?.nickname || 'Black',
      publicKey: game.data.blackPublicKey || next.black?.publicKey || null
    };
  }

  return next;
}

export function signCheckpoint(checkpoint, keyPair, seat) {
  const payload = checkpointSigningPayload(checkpoint);
  const signature = nacl.sign.detached(
    naclUtil.decodeUTF8(payload),
    keyPair.signing.secretKey
  );

  return {
    ...checkpoint,
    signatures: {
      ...(checkpoint.signatures || {}),
      [seat]: {
        signature: naclUtil.encodeBase64(signature),
        publicKey: keyPairToPublicBundle(keyPair),
        signedAt: Date.now()
      }
    }
  };
}

export function verifyCheckpointSignature(checkpoint, seat) {
  const entry = checkpoint?.signatures?.[seat];
  if (!entry?.signature || !entry?.publicKey?.signingPublicKey) {
    return false;
  }

  const payload = checkpointSigningPayload(checkpoint);
  return nacl.sign.detached.verify(
    naclUtil.decodeUTF8(payload),
    naclUtil.decodeBase64(entry.signature),
    naclUtil.decodeBase64(entry.publicKey.signingPublicKey)
  );
}

export function isCheckpointFullySigned(checkpoint) {
  return Boolean(
    checkpoint
    && verifyCheckpointSignature(checkpoint, 'white')
    && verifyCheckpointSignature(checkpoint, 'black')
  );
}

export function checkpointSeatForPublicKey(checkpoint, publicKeyBundle) {
  if (!checkpoint || !publicKeyBundle?.signingPublicKey) {
    return null;
  }

  if (checkpoint.white?.publicKey?.signingPublicKey === publicKeyBundle.signingPublicKey) {
    return 'white';
  }
  if (checkpoint.black?.publicKey?.signingPublicKey === publicKeyBundle.signingPublicKey) {
    return 'black';
  }
  return null;
}

export function serializeCheckpoint(checkpoint) {
  return bytesToBase64Url(naclUtil.decodeUTF8(JSON.stringify(checkpoint)));
}

export function deserializeCheckpoint(encoded) {
  if (!encoded) {
    return null;
  }

  try {
    const json = naclUtil.encodeUTF8(base64UrlToBytes(encoded));
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function openCheckpointDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CHECKPOINT_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHECKPOINT_STORE)) {
        db.createObjectStore(CHECKPOINT_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeCheckpointRef(checkpoint) {
  const encoded = serializeCheckpoint(checkpoint);
  const digest = naclUtil.encodeBase64(nacl.hash(naclUtil.decodeUTF8(encoded))).slice(0, 16);
  const ref = `cp_${digest.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;

  if (typeof indexedDB === 'undefined') {
    localStorage.setItem(`dignity-chess-checkpoint:${ref}`, encoded);
    return ref;
  }

  const db = await openCheckpointDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKPOINT_STORE, 'readwrite');
    tx.objectStore(CHECKPOINT_STORE).put({ encoded, checkpoint, savedAt: Date.now() }, ref);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();

  localStorage.setItem(`dignity-chess-checkpoint:${ref}`, encoded);
  return ref;
}

export async function loadCheckpointRef(ref) {
  if (!ref) {
    return null;
  }

  const cached = localStorage.getItem(`dignity-chess-checkpoint:${ref}`);
  if (cached) {
    return deserializeCheckpoint(cached);
  }

  if (typeof indexedDB === 'undefined') {
    return null;
  }

  const db = await openCheckpointDb();
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKPOINT_STORE, 'readonly');
    const request = tx.objectStore(CHECKPOINT_STORE).get(ref);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();

  if (!record?.encoded) {
    return null;
  }

  return deserializeCheckpoint(record.encoded);
}

export async function resolveCheckpointFromRoute(route) {
  if (route.checkpoint) {
    return deserializeCheckpoint(route.checkpoint);
  }

  if (route.checkpointRef) {
    return loadCheckpointRef(route.checkpointRef);
  }

  return null;
}

export async function buildResumeLink(checkpoint) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const encoded = serializeCheckpoint(checkpoint);
  const common = [
    `game=${encodeURIComponent(checkpoint.gameId)}`,
    `room=${encodeURIComponent(checkpoint.roomKey)}`,
    'role=resume'
  ];

  if (encoded.length <= MAX_INLINE_CHECKPOINT_CHARS) {
    return `${base}#${common.join('&')}&checkpoint=${encoded}`;
  }

  const ref = await storeCheckpointRef(checkpoint);
  return `${base}#${common.join('&')}&checkpointRef=${encodeURIComponent(ref)}`;
}

export function gamePatchFromCheckpoint(checkpoint, localNodeId, seat) {
  const whitePlayerId = seat === 'white' ? localNodeId : checkpoint.white?.peerId || null;
  const blackPlayerId = seat === 'black' ? localNodeId : checkpoint.black?.peerId || null;

  return {
    fen: checkpoint.fen,
    moveHistory: checkpoint.moveHistory || [],
    status: checkpoint.status,
    turn: checkpoint.turn,
    winner: checkpoint.winner ?? null,
    joinToken: checkpoint.joinToken,
    joinTokenUsed: Boolean(checkpoint.black?.peerId || checkpoint.black?.publicKey),
    watchToken: checkpoint.watchToken,
    resumeToken: null,
    resumeCheckpointId: checkpoint.createdAt,
    whitePlayerId,
    blackPlayerId,
    whiteNickname: checkpoint.white?.nickname || 'White',
    blackNickname: checkpoint.black?.nickname || 'Black',
    whitePublicKey: checkpoint.white?.publicKey || null,
    blackPublicKey: checkpoint.black?.publicKey || null,
    lastMove: null
  };
}

export function validateCheckpointForResume(checkpoint) {
  if (!checkpoint || checkpoint.v !== CHECKPOINT_VERSION) {
    return { ok: false, reason: 'unsupported-checkpoint' };
  }

  if (!isCheckpointFullySigned(checkpoint)) {
    return { ok: false, reason: 'missing-signatures' };
  }

  if (!checkpoint.gameId || !checkpoint.roomKey || !checkpoint.fen) {
    return { ok: false, reason: 'incomplete-checkpoint' };
  }

  return { ok: true };
}
