const { InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src/network/in-memory-network');

describe('InMemoryNetworkAdapter', () => {
  test('broadcasts to other peers only', async () => {
    const hub = new InMemoryNetworkHub();
    const alice = new InMemoryNetworkAdapter(hub);
    const bob = new InMemoryNetworkAdapter(hub);
    const carol = new InMemoryNetworkAdapter(hub);

    const bobHandler = jest.fn();
    const carolHandler = jest.fn();
    const aliceHandler = jest.fn();

    bob.onMessage(bobHandler);
    carol.onMessage(carolHandler);
    alice.onMessage(aliceHandler);

    await alice.start('alice');
    await bob.start('bob');
    await carol.start('carol');

    await alice.broadcast({ type: 'ping', from: 'alice' });

    expect(bobHandler).toHaveBeenCalledWith({ type: 'ping', from: 'alice' });
    expect(carolHandler).toHaveBeenCalledWith({ type: 'ping', from: 'alice' });
    expect(aliceHandler).not.toHaveBeenCalled();
  });

  test('requires start before broadcasting', async () => {
    const hub = new InMemoryNetworkHub();
    const adapter = new InMemoryNetworkAdapter(hub);

    await expect(adapter.broadcast({ type: 'x' })).rejects.toThrow('Network adapter has not been started');
  });

  test('stops receiving after offMessage and stop', async () => {
    const hub = new InMemoryNetworkHub();
    const alice = new InMemoryNetworkAdapter(hub);
    const bob = new InMemoryNetworkAdapter(hub);

    const bobHandler = jest.fn();
    bob.onMessage(bobHandler);

    await alice.start('alice');
    await bob.start('bob');

    bob.offMessage(bobHandler);
    await alice.broadcast({ step: 1 });
    expect(bobHandler).not.toHaveBeenCalled();

    bob.onMessage(bobHandler);
    await bob.stop();
    await alice.broadcast({ step: 2 });
    expect(bobHandler).not.toHaveBeenCalled();
  });
});
