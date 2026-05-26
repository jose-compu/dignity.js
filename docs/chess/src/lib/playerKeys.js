import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

const STORAGE_KEY = 'dignity-chess-player-keys-v1';

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
  const record = JSON.parse(atob(backupText.trim()));
  if (!record?.gameId || !record?.seat) {
    throw new Error('Invalid seat key backup');
  }

  const keyPair = deserializeKeyPair(record);
  if (!keyPair) {
    throw new Error('Invalid seat key backup');
  }

  savePlayerKeyRecord(record.gameId, record.seat, keyPair, record.nickname);
  return { gameId: record.gameId, seat: record.seat, keyPair };
}
