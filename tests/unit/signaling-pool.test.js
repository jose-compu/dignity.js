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
});
