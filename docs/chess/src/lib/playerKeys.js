import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { deriveKeyPairFromCredentials } from '../../../../src/index.js';
import {
  checkpointSeatForPublicKey,
  getCheckpointSeatPublicKey
} from './resumeCheckpoint.js';

const STORAGE_KEY = 'dignity-chess-player-keys-v1';
const DEMO_KDF_ITERATIONS = 10000;

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function serializeKeyPair(keyPair) {
  return {
    signingSecretKey: naclUtil.encodeBase64(keyPair.signing.secretKey),
    signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
    encryptionSecretKey: naclUtil.encodeBase64(keyPair.encryption.secretKey),
    encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
  };
}

function deserializeKeyPair(record) {
  if (!record?.signingSecretKey || !record?.encryptionSecretKey) {
    return null;
  }

  return {
    signing: {
      secretKey: naclUtil.decodeBase64(record.signingSecretKey),
      publicKey: naclUtil.decodeBase64(record.signingPublicKey)
    },
    encryption: {
      secretKey: naclUtil.decodeBase64(record.encryptionSecretKey),
      publicKey: naclUtil.decodeBase64(record.encryptionPublicKey)
    }
  };
}

export function createFreshKeyPair() {
  return {
    signing: nacl.sign.keyPair(),
    encryption: nacl.box.keyPair()
  };
}

export async function derivePlayerKeyPairFromCredentials({ gameId, seat, username, password }) {
  if (!gameId || !seat || !username || !password) {
    throw new Error('derivePlayerKeyPairFromCredentials requires gameId, seat, username, and password');
  }

  return deriveKeyPairFromCredentials({
    username,
    password,
    pepper: `${gameId}:${seat}`,
    kdfIterations: DEMO_KDF_ITERATIONS
  });
}

export function keyPairToPublicBundle(keyPair) {
  return {
    signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
    encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
  };
}

export function savePlayerKeyRecord(gameId, seat, keyPair, nickname) {
  if (!gameId || !seat || !keyPair) {
    return;
  }

  const store = loadStore();
  const entryKey = `${gameId}:${seat}`;
  store[entryKey] = {
    gameId,
    seat,
    nickname: nickname || null,
    ...serializeKeyPair(keyPair),
    updatedAt: Date.now()
  };

  const fingerprint = keyPairToPublicBundle(keyPair).signingPublicKey;
  store[`fp:${fingerprint}`] = entryKey;

  saveStore(store);
}

export function loadPlayerKeyPair(gameId, seat) {
  const store = loadStore();
  const record = store[`${gameId}:${seat}`];
  return deserializeKeyPair(record);
}

export function findPlayerKeyPairByPublicKey(publicKeyBundle) {
  if (!publicKeyBundle?.signingPublicKey) {
    return null;
  }

  const store = loadStore();
  const entryKey = store[`fp:${publicKeyBundle.signingPublicKey}`];
  if (!entryKey) {
    return null;
  }

  return deserializeKeyPair(store[entryKey]);
}

export async function resolveResumeKeysFromCheckpoint({
  checkpoint,
  gameId,
  username,
  password,
  preferredSeat = null
}) {
  if (!checkpoint) {
    return { seat: null, keyPair: null };
  }

  const seatsToTry = preferredSeat === 'white' || preferredSeat === 'black'
    ? [preferredSeat]
    : ['white', 'black'];

  for (const seat of seatsToTry) {
    const publicKey = getCheckpointSeatPublicKey(checkpoint, seat);
    const localKeys = findPlayerKeyPairByPublicKey(publicKey);
    if (localKeys) {
      return { seat, keyPair: localKeys };
    }
  }

  if (username && password) {
    for (const seat of seatsToTry) {
      try {
        const derived = await derivePlayerKeyPairFromCredentials({
          gameId,
          seat,
          username,
          password
        });
        const bundle = keyPairToPublicBundle(derived);
        if (checkpointSeatForPublicKey(checkpoint, bundle) === seat) {
          savePlayerKeyRecord(gameId, seat, derived, null);
          return { seat, keyPair: derived };
        }
      } catch (_error) {
        // try next seat
      }
    }
  }

  if (preferredSeat === 'white' || preferredSeat === 'black') {
    return {
      seat: preferredSeat,
      keyPair: resolveKeyPairForResume({
        gameId,
        seat: preferredSeat,
        checkpointPlayer: checkpoint[preferredSeat]
      })
    };
  }

  return { seat: null, keyPair: null };
}

export function resolveKeyPairForResume({ gameId, seat, checkpointPlayer }) {
  if (checkpointPlayer?.publicKey) {
    const byFingerprint = findPlayerKeyPairByPublicKey(checkpointPlayer.publicKey);
    if (byFingerprint) {
      return byFingerprint;
    }
  }

  if (gameId && seat) {
    const bySeat = loadPlayerKeyPair(gameId, seat);
    if (bySeat) {
      return bySeat;
    }
  }

  return createFreshKeyPair();
}

export function exportSeatKeyBackup(gameId, seat) {
  const record = loadStore()[`${gameId}:${seat}`];
  if (!record) {
    return null;
  }

  return btoa(JSON.stringify(record));
}

export function importSeatKeyBackup(backupText) {
  let record;
  try {
    record = JSON.parse(atob(String(backupText || '').trim()));
  } catch (_error) {
    throw new Error('Invalid seat key backup');
  }

  if (!record?.gameId || !record?.seat || (record.seat !== 'white' && record.seat !== 'black')) {
    throw new Error('Invalid seat key backup');
  }

  const keyPair = deserializeKeyPair(record);
  if (!keyPair) {
    throw new Error('Invalid seat key backup');
  }

  savePlayerKeyRecord(record.gameId, record.seat, keyPair, record.nickname);
  return { gameId: record.gameId, seat: record.seat, keyPair };
}
