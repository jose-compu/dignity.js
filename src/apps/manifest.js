const MANIFEST_SCHEMA_VERSION = 1;
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const LOGIC_HASH_PATTERN = /^sha512:[0-9a-f]{128}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateOptionalSemver(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null };
  }
  if (!isNonEmptyString(value)) {
    return { ok: false, reason: `${fieldName} must be a semver string` };
  }
  try {
    const { parseSemver } = require('../security/verification-code');
    parseSemver(value.trim());
    return { ok: true, value: value.trim() };
  } catch (error) {
    return { ok: false, reason: `${fieldName}: ${error.message}` };
  }
}

function validateOptionalLogicHash(value) {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null };
  }
  if (!isNonEmptyString(value) || !LOGIC_HASH_PATTERN.test(value.trim())) {
    return { ok: false, reason: 'logicHash must match sha512:<128 hex chars>' };
  }
  return { ok: true, value: value.trim() };
}

function validateStoredCommand(command, index) {
  const prefix = `storedCommands[${index}]`;
  if (!command || typeof command !== 'object') {
    return { ok: false, reason: `${prefix} must be an object` };
  }
  if (!isNonEmptyString(command.id)) {
    return { ok: false, reason: `${prefix}.id is required` };
  }
  if (!isNonEmptyString(command.collection)) {
    return { ok: false, reason: `${prefix}.collection is required` };
  }
  if (!['create', 'update', 'delete'].includes(command.kind)) {
    return { ok: false, reason: `${prefix}.kind must be create, update, or delete` };
  }
  if (command.allowedFields !== undefined) {
    if (!Array.isArray(command.allowedFields) || command.allowedFields.some((f) => !isNonEmptyString(f))) {
      return { ok: false, reason: `${prefix}.allowedFields must be a string array` };
    }
  }
  if (command.logicRef != null && command.logicRef !== '' && !isNonEmptyString(command.logicRef)) {
    return { ok: false, reason: `${prefix}.logicRef must be a non-empty string` };
  }
  const logicVersionResult = validateOptionalSemver(command.logicVersion, `${prefix}.logicVersion`);
  if (!logicVersionResult.ok) {
    return logicVersionResult;
  }
  const logicHashResult = validateOptionalLogicHash(command.logicHash);
  if (!logicHashResult.ok) {
    return { ok: false, reason: `${prefix}.${logicHashResult.reason}` };
  }
  if (logicVersionResult.value && !logicHashResult.value) {
    return { ok: false, reason: `${prefix}.logicHash is required when logicVersion is set` };
  }
  if (logicHashResult.value && !logicVersionResult.value) {
    return { ok: false, reason: `${prefix}.logicVersion is required when logicHash is set` };
  }
  return { ok: true, logicVersion: logicVersionResult.value, logicHash: logicHashResult.value };
}

/**
 * Validate a Dignity App manifest (issue #101).
 * @returns {{ ok: true, manifest: object } | { ok: false, reason: string }}
 */
function validateDignityAppManifest(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'manifest must be an object' };
  }

  if (raw.schemaVersion !== undefined && raw.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    return { ok: false, reason: `unsupported schemaVersion: ${raw.schemaVersion}` };
  }

  if (!isNonEmptyString(raw.id) || !ID_PATTERN.test(raw.id)) {
    return { ok: false, reason: 'id must match [a-z0-9][a-z0-9._-]{0,63}' };
  }

  if (!isNonEmptyString(raw.title)) {
    return { ok: false, reason: 'title is required' };
  }

  if (!Array.isArray(raw.collections) || raw.collections.length === 0) {
    return { ok: false, reason: 'collections must be a non-empty string array' };
  }

  const collections = [];
  for (const name of raw.collections) {
    if (!isNonEmptyString(name)) {
      return { ok: false, reason: 'collections entries must be non-empty strings' };
    }
    if (collections.includes(name)) {
      return { ok: false, reason: `duplicate collection: ${name}` };
    }
    collections.push(name.trim());
  }

  const storedCommands = Array.isArray(raw.storedCommands) ? raw.storedCommands : [];
  const storedLogicRaw = raw.storedLogic && typeof raw.storedLogic === 'object' ? raw.storedLogic : {};
  const storedLogic = {};

  for (const [logicId, logicEntry] of Object.entries(storedLogicRaw)) {
    if (!logicEntry || typeof logicEntry !== 'object') {
      return { ok: false, reason: `storedLogic.${logicId} must be an object` };
    }
    const logicVersionResult = validateOptionalSemver(logicEntry.version, `storedLogic.${logicId}.version`);
    if (!logicVersionResult.ok) {
      return logicVersionResult;
    }
    const logicHashResult = validateOptionalLogicHash(logicEntry.hash);
    if (!logicHashResult.ok) {
      return { ok: false, reason: `storedLogic.${logicId}.${logicHashResult.reason}` };
    }
    if (!logicVersionResult.value || !logicHashResult.value) {
      return { ok: false, reason: `storedLogic.${logicId} requires version and hash` };
    }
    storedLogic[logicId] = {
      version: logicVersionResult.value,
      hash: logicHashResult.value,
      validate: isNonEmptyString(logicEntry.validate) ? logicEntry.validate.trim() : null
    };
  }

  const normalizedCommands = [];
  for (let index = 0; index < storedCommands.length; index += 1) {
    const command = storedCommands[index];
    const result = validateStoredCommand(command, index);
    if (!result.ok) {
      return result;
    }
    if (command.logicRef) {
      if (!storedLogic[command.logicRef]) {
        return { ok: false, reason: `storedCommands[${index}] references unknown logicRef: ${command.logicRef}` };
      }
    }
    const collection = command.collection;
    if (!collections.includes(collection)) {
      return {
        ok: false,
        reason: `storedCommands[${index}] references undeclared collection: ${collection}`
      };
    }
    normalizedCommands.push({
      id: command.id.trim(),
      collection: collection.trim(),
      kind: command.kind,
      allowedFields: Array.isArray(command.allowedFields) ? [...command.allowedFields] : null,
      requiresRole: isNonEmptyString(command.requiresRole) ? command.requiresRole.trim() : null,
      logicRef: isNonEmptyString(command.logicRef) ? command.logicRef.trim() : null,
      logicVersion: result.logicVersion || storedLogic[command.logicRef]?.version || null,
      logicHash: result.logicHash || storedLogic[command.logicRef]?.hash || null
    });
  }

  const allowedCspOrigins = Array.isArray(raw.allowedCspOrigins) ? raw.allowedCspOrigins : [];
  for (const origin of allowedCspOrigins) {
    if (!isNonEmptyString(origin) || !origin.startsWith('https://')) {
      return { ok: false, reason: 'allowedCspOrigins entries must be https:// URLs' };
    }
    if (/localhost|127\.0\.0\.1/i.test(origin)) {
      return { ok: false, reason: 'localhost origins are not allowed in allowedCspOrigins' };
    }
  }

  const dappVersionResult = validateOptionalSemver(raw.dappVersion, 'dappVersion');
  if (!dappVersionResult.ok) {
    return dappVersionResult;
  }
  const logicHashResult = validateOptionalLogicHash(raw.logicHash);
  if (!logicHashResult.ok) {
    return logicHashResult;
  }
  if (dappVersionResult.value && !logicHashResult.value) {
    return { ok: false, reason: 'logicHash is required when dappVersion is set' };
  }
  if (logicHashResult.value && !dappVersionResult.value) {
    return { ok: false, reason: 'dappVersion is required when logicHash is set' };
  }

  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    id: raw.id.trim(),
    title: raw.title.trim(),
    description: isNonEmptyString(raw.description) ? raw.description.trim() : '',
    collections,
    peerGroupId: isNonEmptyString(raw.peerGroupId) ? raw.peerGroupId.trim() : null,
    publisherId: isNonEmptyString(raw.publisherId) ? raw.publisherId.trim() : null,
    dappVersion: dappVersionResult.value,
    logicHash: logicHashResult.value,
    storedLogic,
    storedCommands: normalizedCommands,
    allowedCspOrigins: allowedCspOrigins.map((o) => o.trim()),
    readOnly: storedCommands.length === 0,
    forwardConsoleLog: raw.forwardConsoleLog === true
  };

  return { ok: true, manifest };
}

function collectionAllowed(manifest, collectionName) {
  return manifest && Array.isArray(manifest.collections)
    && manifest.collections.includes(collectionName);
}

function getStoredCommand(manifest, commandId) {
  if (!manifest || !Array.isArray(manifest.storedCommands)) {
    return null;
  }
  return manifest.storedCommands.find((cmd) => cmd.id === commandId) || null;
}

module.exports = {
  MANIFEST_SCHEMA_VERSION,
  ID_PATTERN,
  validateDignityAppManifest,
  collectionAllowed,
  getStoredCommand
};
