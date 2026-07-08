const HANDSHAKE_TYPE = 'dignity-app-handshake';

function createRpcId() {
  return `rpc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * App-side RPC client over a MessagePort (#103, #104, #105).
 * @param {MessagePort} port
 * @returns {object} dignity app API
 */
function createDignityAppClient(port) {
  if (!port || typeof port.postMessage !== 'function') {
    throw new Error('createDignityAppClient requires a MessagePort');
  }

  const pending = new Map();

  port.onmessage = (event) => {
    const response = event.data;
    if (!response || !response.rpcId) {
      return;
    }
    const entry = pending.get(response.rpcId);
    if (!entry) {
      return;
    }
    pending.delete(response.rpcId);
    if (response.ok) {
      entry.resolve(response.result);
    } else {
      const err = new Error(response.error?.message || 'RPC failed');
      err.code = response.error?.code || 'rpc-failed';
      entry.reject(err);
    }
  };

  function call(method, params = {}) {
    const rpcId = createRpcId();
    return new Promise((resolve, reject) => {
      pending.set(rpcId, { resolve, reject });
      port.postMessage({ rpcId, method, params });
    });
  }

  return {
    ready() {
      return call('ready');
    },
    query({ collection, filter, limit } = {}) {
      return call('query', { collection, filter, limit }).then((r) => r.records);
    },
    list(collection) {
      return call('list', { collection }).then((r) => r.records);
    },
    runStoredCommand(commandId, args = {}) {
      return call('runStoredCommand', { commandId, args });
    },
    log(message, data) {
      return call('log', { level: 'info', message, data });
    },
    error(message, stack) {
      return call('error', { message, stack });
    }
  };
}

/**
 * Wait for host handshake and return the app client API.
 * @param {object} [options]
 * @param {number} [options.timeoutMs=10000]
 * @returns {Promise<object>}
 */
function connectDignityAppClient({ timeoutMs = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMessage);
      reject(new Error('Dignity App handshake timed out'));
    }, timeoutMs);

    function onMessage(event) {
      const data = event.data;
      if (!data || data.type !== HANDSHAKE_TYPE) {
        return;
      }

      const port = event.ports && event.ports[0];
      if (!port) {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        reject(new Error('Dignity App handshake missing MessagePort'));
        return;
      }

      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      const client = createDignityAppClient(port);
      resolve(client);
    }

    window.addEventListener('message', onMessage);
  });
}

/**
 * Bootstrap script injected into sandboxed app HTML by the host.
 * Self-contained — no module imports in the iframe.
 * @returns {string}
 */
function buildClientBootstrapScript() {
  return `<script>
(function() {
  var HANDSHAKE_TYPE = '${HANDSHAKE_TYPE}';
  var pending = [];
  var client = null;

  function createRpcId() {
    return 'rpc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function createClient(port) {
    var waiters = {};
    port.onmessage = function(event) {
      var response = event.data;
      if (!response || !response.rpcId) return;
      var entry = waiters[response.rpcId];
      if (!entry) return;
      delete waiters[response.rpcId];
      if (response.ok) entry.resolve(response.result);
      else {
        var err = new Error((response.error && response.error.message) || 'RPC failed');
        err.code = (response.error && response.error.code) || 'rpc-failed';
        entry.reject(err);
      }
    };
    port.start();
    function call(method, params) {
      var rpcId = createRpcId();
      return new Promise(function(resolve, reject) {
        waiters[rpcId] = { resolve: resolve, reject: reject };
        port.postMessage({ rpcId: rpcId, method: method, params: params || {} });
      });
    }
    return {
      ready: function() { return call('ready'); },
      query: function(opts) { return call('query', opts).then(function(r) { return r.records; }); },
      list: function(collection) { return call('list', { collection: collection }).then(function(r) { return r.records; }); },
      runStoredCommand: function(id, args) { return call('runStoredCommand', { commandId: id, args: args || {} }); },
      log: function(msg, data) { return call('log', { message: msg, data: data }); }
    };
  }

  function flush() {
    if (!client) return;
    while (pending.length) {
      var job = pending.shift();
      var p;
      if (job.method === 'ready') p = client.ready();
      else if (job.method === 'query') p = client.query(job.args[0]);
      else if (job.method === 'list') p = client.list(job.args[0]);
      else if (job.method === 'runStoredCommand') p = client.runStoredCommand(job.args[0], job.args[1]);
      else if (job.method === 'log') p = client.log(job.args[0], job.args[1]);
      else { job.reject(new Error('unknown method')); continue; }
      p.then(job.resolve).catch(job.reject);
    }
  }

  window.dignity = {
    ready: function() { return enqueue('ready', []); },
    query: function(opts) { return enqueue('query', [opts]); },
    list: function(collection) { return enqueue('list', [collection]); },
    runStoredCommand: function(id, args) { return enqueue('runStoredCommand', [id, args]); },
    log: function(msg, data) { return enqueue('log', [msg, data]); }
  };

  function enqueue(method, args) {
    return new Promise(function(resolve, reject) {
      pending.push({ method: method, args: args, resolve: resolve, reject: reject });
      flush();
    });
  }

  window.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== HANDSHAKE_TYPE) return;
    var port = event.ports && event.ports[0];
    if (!port) return;
    client = createClient(port);
    client.ready().then(function() { flush(); }).catch(function(err) {
      pending.forEach(function(j) { j.reject(err); });
      pending.length = 0;
    });
  });
})();
</script>`;
}

module.exports = {
  HANDSHAKE_TYPE,
  createDignityAppClient,
  connectDignityAppClient,
  buildClientBootstrapScript
};
