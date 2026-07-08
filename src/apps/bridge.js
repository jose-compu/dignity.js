const { collectionAllowed } = require('./manifest');
const { executeStoredCommand } = require('./stored-commands');

const RPC_METHODS = new Set(['ready', 'query', 'list', 'runStoredCommand', 'log', 'error']);

/**
 * Apply simple equality filter to records.
 * @param {object[]} records
 * @param {object|null|undefined} filter
 * @returns {object[]}
 */
function filterRecords(records, filter) {
  if (!filter || typeof filter !== 'object') {
    return records;
  }

  return records.filter((record) => {
    for (const [key, value] of Object.entries(filter)) {
      if (key === 'ownerId') {
        if (record.ownerId !== value) {
          return false;
        }
        continue;
      }
      if (record.data && Object.prototype.hasOwnProperty.call(record.data, key)) {
        if (record.data[key] !== value) {
          return false;
        }
        continue;
      }
      if (record[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Create host-side RPC handler for Dignity App MessageChannel bridge (#103, #104, #105).
 * @param {object} options
 * @param {object} options.manifest - validated manifest
 * @param {import('../cqrs/query-replica')|null} [options.replica]
 * @param {import('../core/dignity-p2p')|null} [options.node]
 * @param {Function} [options.onLog]
 * @param {Function} [options.onError]
 * @returns {{ handle: (message: object) => Promise<object> }}
 */
function createHostRpcHandler({
  manifest,
  replica = null,
  node = null,
  onLog = null,
  onError = null
} = {}) {
  if (!manifest) {
    throw new Error('createHostRpcHandler requires manifest');
  }

  async function handle(message) {
    const rpcId = message?.rpcId;
    const method = message?.method;
    const params = message?.params || {};

    if (!rpcId || typeof rpcId !== 'string') {
      return { rpcId: rpcId || null, ok: false, error: { code: 'invalid-envelope', message: 'rpcId required' } };
    }

    if (!RPC_METHODS.has(method)) {
      return { rpcId, ok: false, error: { code: 'unknown-method', message: `Unknown RPC method: ${method}` } };
    }

    try {
      if (method === 'ready') {
        return { rpcId, ok: true, result: { appId: manifest.id, readOnly: manifest.readOnly } };
      }

      if (method === 'log') {
        if (typeof onLog === 'function') {
          onLog({ level: params.level || 'info', message: params.message, data: params.data });
        }
        return { rpcId, ok: true, result: { logged: true } };
      }

      if (method === 'error') {
        if (typeof onError === 'function') {
          onError({ message: params.message, stack: params.stack });
        }
        return { rpcId, ok: true, result: { received: true } };
      }

      if (method === 'query' || method === 'list') {
        if (!replica) {
          return { rpcId, ok: false, error: { code: 'no-replica', message: 'Query replica is not attached' } };
        }

        const collection = params.collection;
        if (!collectionAllowed(manifest, collection)) {
          return { rpcId, ok: false, error: { code: 'collection-denied', message: `Collection not allowed: ${collection}` } };
        }

        let records = replica.list(collection);
        if (method === 'query') {
          records = filterRecords(records, params.filter);
          if (typeof params.limit === 'number' && params.limit >= 0) {
            records = records.slice(0, params.limit);
          }
        }

        return { rpcId, ok: true, result: { records } };
      }

      if (method === 'runStoredCommand') {
        if (!node) {
          return { rpcId, ok: false, error: { code: 'no-node', message: 'Publisher node is not attached' } };
        }

        const outcome = await executeStoredCommand(node, manifest, params.commandId, params.args || {});
        if (!outcome.ok) {
          return { rpcId, ok: false, error: { code: outcome.reason, message: outcome.reason } };
        }
        return { rpcId, ok: true, result: outcome.result };
      }

      return { rpcId, ok: false, error: { code: 'unhandled', message: 'Unhandled method' } };
    } catch (error) {
      return {
        rpcId,
        ok: false,
        error: {
          code: error.code || 'rpc-failed',
          message: error.message || 'RPC failed'
        }
      };
    }
  }

  return { handle };
}

module.exports = {
  RPC_METHODS,
  filterRecords,
  createHostRpcHandler
};
