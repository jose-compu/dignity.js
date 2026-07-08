const { getStoredCommand } = require('./manifest');

function emitStoredCommandRejection(node, reason, commandId, args) {
  if (node && typeof node.emit === 'function') {
    node.emit('warning', {
      type: 'stored-command-rejected',
      reason,
      commandId,
      args
    });
  }
}

/**
 * True when node has joined a publisher-capable peer group for manifest writes.
 * @param {import('../core/dignity-p2p')} node
 * @param {object} manifest
 * @returns {boolean}
 */
function isPublisherCommandCapable(node, manifest) {
  if (!node || !node.peerGroups || typeof node.peerGroups.get !== 'function') {
    return false;
  }

  const targetGroupId = manifest.peerGroupId || null;

  if (targetGroupId) {
    const group = node.peerGroups.get(targetGroupId);
    return Boolean(group && group.role === 'publisher' && group.commandCapable !== false);
  }

  for (const group of node.peerGroups.values()) {
    if (group.role === 'publisher' && group.commandCapable !== false) {
      return true;
    }
  }

  return false;
}

/**
 * Reject patch keys outside allowedFields when the command defines them.
 * @param {object} command
 * @param {object} patch
 * @returns {string|null} rejection reason or null if ok
 */
function validateAllowedFields(command, patch) {
  if (!Array.isArray(command.allowedFields)) {
    return null;
  }

  const allowed = new Set(command.allowedFields);
  for (const key of Object.keys(patch || {})) {
    if (!allowed.has(key)) {
      return 'field-not-allowed';
    }
  }

  return null;
}

/**
 * Execute a manifest-declared stored command on a publisher node (issue #105).
 * @param {import('../core/dignity-p2p')} node
 * @param {object} manifest - validated manifest
 * @param {string} commandId
 * @param {object} args
 * @returns {Promise<{ ok: boolean, reason?: string, result?: * }>}
 */
async function executeStoredCommand(node, manifest, commandId, args = {}) {
  if (!manifest || manifest.readOnly) {
    emitStoredCommandRejection(node, 'read-only-manifest', commandId, args);
    return { ok: false, reason: 'read-only-manifest' };
  }

  const command = getStoredCommand(manifest, commandId);
  if (!command) {
    emitStoredCommandRejection(node, 'unknown-command', commandId, args);
    return { ok: false, reason: 'unknown-command' };
  }

  if (!isPublisherCommandCapable(node, manifest)) {
    emitStoredCommandRejection(node, 'not-command-capable', commandId, args);
    return { ok: false, reason: 'not-command-capable' };
  }

  const collection = command.collection;
  const writeOptions = {
    peerGroupId: args.peerGroupId || manifest.peerGroupId || undefined,
    broadcastScope: args.broadcastScope
  };

  if (command.kind === 'create') {
    const data = args.data;
    if (!data || typeof data !== 'object') {
      emitStoredCommandRejection(node, 'invalid-args', commandId, args);
      return { ok: false, reason: 'invalid-args' };
    }

    const fieldError = validateAllowedFields(command, data);
    if (fieldError) {
      emitStoredCommandRejection(node, fieldError, commandId, args);
      return { ok: false, reason: fieldError };
    }

    const record = await node.create(collection, data, {
      ...writeOptions,
      id: args.id
    });
    return { ok: true, result: record };
  }

  if (command.kind === 'update') {
    const { id, patch } = args;
    if (!id || !patch || typeof patch !== 'object') {
      emitStoredCommandRejection(node, 'invalid-args', commandId, args);
      return { ok: false, reason: 'invalid-args' };
    }

    const fieldError = validateAllowedFields(command, patch);
    if (fieldError) {
      emitStoredCommandRejection(node, fieldError, commandId, args);
      return { ok: false, reason: fieldError };
    }

    const record = await node.update(collection, id, patch, writeOptions);
    return { ok: true, result: record };
  }

  if (command.kind === 'delete') {
    const { id } = args;
    if (!id) {
      emitStoredCommandRejection(node, 'invalid-args', commandId, args);
      return { ok: false, reason: 'invalid-args' };
    }

    await node.remove(collection, id, writeOptions);
    return { ok: true, result: { id, deleted: true } };
  }

  emitStoredCommandRejection(node, 'unsupported-kind', commandId, args);
  return { ok: false, reason: 'unsupported-kind' };
}

module.exports = {
  isPublisherCommandCapable,
  validateAllowedFields,
  executeStoredCommand,
  emitStoredCommandRejection
};
