const SignalingPool = require('../../src/signaling/signaling-pool');

function createProvider({ id, priority, failConnect = false, failSend = false }) {
  return {
    id,
    priority,
    async connect() {
      if (failConnect) {
        throw new Error(`${id} connect failed`);
      }
    },
    async send() {
      if (failSend) {
        throw new Error(`${id} send failed`);
      }
    },
    async disconnect() {
      return undefined;
    },
    onMessage() {
      return undefined;
    }
  };
}

describe('SignalingPool', () => {
  test('connects to first available provider by priority', async () => {
    const primary = createProvider({ id: 'primary', priority: 0, failConnect: true });
    const secondary = createProvider({ id: 'secondary', priority: 1 });

    const pool = new SignalingPool([secondary, primary]);
    const connected = await pool.connect();

    expect(connected.id).toBe('secondary');
  });

  test('fails over when active provider send fails', async () => {
    const unstable = createProvider({ id: 'unstable', priority: 0, failSend: true });
    const backup = createProvider({ id: 'backup', priority: 1 });

    const pool = new SignalingPool([unstable, backup]);

    await pool.connect();
    await pool.send({ type: 'signal' });

    expect(pool.activeProvider.id).toBe('backup');
  });

  test('throws when no providers can connect', async () => {
    const only = createProvider({ id: 'only', priority: 0, failConnect: true });
    const pool = new SignalingPool([only]);

    await expect(pool.connect()).rejects.toThrow('only connect failed');
  });

  test('registerProvider appends new provider and can connect', async () => {
    const first = createProvider({ id: 'first', priority: 1, failConnect: true });
    const second = createProvider({ id: 'second', priority: 0 });
    const pool = new SignalingPool([first]);

    pool.registerProvider(second);
    const connected = await pool.connect();

    expect(connected.id).toBe('second');
  });

  test('onMessage only subscribes providers implementing onMessage', () => {
    const handler = jest.fn();
    const withListener = createProvider({ id: 'with-listener', priority: 0 });
    withListener.onMessage = jest.fn();
    const withoutListener = { id: 'without-listener', priority: 1 };
    const pool = new SignalingPool([withListener, withoutListener]);

    pool.onMessage(handler);

    expect(withListener.onMessage).toHaveBeenCalledWith(handler);
  });

  test('disconnect calls provider disconnect methods and clears active provider', async () => {
    const first = createProvider({ id: 'first', priority: 0 });
    first.disconnect = jest.fn(async () => undefined);
    const second = { id: 'second', priority: 1 };
    const pool = new SignalingPool([first, second]);
    pool.activeProvider = first;

    await pool.disconnect();

    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(pool.activeProvider).toBeNull();
  });

  test('send auto-connects when no active provider', async () => {
    const provider = createProvider({ id: 'auto', priority: 0 });
    const pool = new SignalingPool([provider]);

    const result = await pool.send({ type: 'ping' });

    expect(pool.activeProvider.id).toBe('auto');
    expect(result).toBeNull();
  });

  test('send returns null on success', async () => {
    const provider = createProvider({ id: 'ok', priority: 0 });
    const pool = new SignalingPool([provider]);
    await pool.connect();

    const result = await pool.send({ type: 'data' });
    expect(result).toBeNull();
  });

  test('constructor defaults to empty providers array', () => {
    const pool = new SignalingPool();
    expect(pool.providers).toEqual([]);
  });

  test('connect throws generic error when no providers exist', async () => {
    const pool = new SignalingPool();
    await expect(pool.connect()).rejects.toThrow('No signaling provider could connect');
  });

  test('send failover retries without excluding provider when id is missing', async () => {
    let brokenSendCalls = 0;
    const broken = {
      priority: 0,
      async connect() {},
      async send() {
        brokenSendCalls += 1;
        throw new Error('send broken');
      }
    };
    const backup = createProvider({ id: 'backup', priority: 1 });
    const pool = new SignalingPool([broken, backup]);

    pool.activeProvider = broken;
    await expect(pool.send({ type: 'x' })).rejects.toThrow('send broken');
    expect(brokenSendCalls).toBeGreaterThanOrEqual(2);
  });

  test('send failover disconnects provider that lacks disconnect', async () => {
    const broken = {
      id: 'broken',
      priority: 0,
      async connect() {},
      async send() { throw new Error('send broken'); }
    };
    const backup = createProvider({ id: 'backup', priority: 1 });
    const pool = new SignalingPool([broken, backup]);

    pool.activeProvider = broken;
    const error = await pool.send({ type: 'x' });

    expect(error.message).toBe('send broken');
    expect(pool.activeProvider.id).toBe('backup');
  });
});
