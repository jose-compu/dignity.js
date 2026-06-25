const MANIFEST_SCHEMA_VERSION = 1;
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
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
  return { ok: true };
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
  for (let index = 0; index < storedCommands.length; index += 1) {
    const result = validateStoredCommand(storedCommands[index], index);
    if (!result.ok) {
      return result;
    }
    const collection = storedCommands[index].collection;
    if (!collections.includes(collection)) {
      return {
        ok: false,
        reason: `storedCommands[${index}] references undeclared collection: ${collection}`
      };
    }
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

  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    id: raw.id.trim(),
    title: raw.title.trim(),
    description: isNonEmptyString(raw.description) ? raw.description.trim() : '',
    collections,
    peerGroupId: isNonEmptyString(raw.peerGroupId) ? raw.peerGroupId.trim() : null,
    publisherId: isNonEmptyString(raw.publisherId) ? raw.publisherId.trim() : null,
    storedCommands: storedCommands.map((cmd) => ({
      id: cmd.id.trim(),
      collection: cmd.collection.trim(),
      kind: cmd.kind,
      allowedFields: Array.isArray(cmd.allowedFields) ? [...cmd.allowedFields] : null,
      requiresRole: isNonEmptyString(cmd.requiresRole) ? cmd.requiresRole.trim() : null
    })),
    allowedCspOrigins: allowedCspOrigins.map((o) => o.trim()),
    readOnly: storedCommands.length === 0
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
