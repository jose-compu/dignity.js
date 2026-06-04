const crypto = require('crypto');
const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../../src');
const { stableStringify } = require('../../src/security/message-security-service');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(condition, timeoutMs = 2500, intervalMs = 50) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (condition()) return true;
    await sleep(intervalMs);
  }
  return false;
}

function expectedHash(data) {
  const canonical = stableStringify(data || {});
  return `sha512:${crypto.createHash('sha512').update(canonical, 'utf8').digest('hex')}`;
}

describe('content hashes', () => {
  let hub;
  let security;

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
    security = { appPassword: 'test-pwd', powTargetMs: 5 };
  });

  test('create returns a sha512: hash of the record data', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();

    const data = { title: 'Hello', body: 'World' };
    const record = await alice.create('notes', data, { id: 'n1' });

    expect(record.hash).toBe(expectedHash(data));
    expect(record.hash).toMatch(/^sha512:[0-9a-f]{128}$/);

    await alice.stop();
  });

  test('hash changes after update', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();

    const v1 = await alice.create('notes', { title: 'First' }, { id: 'n1' });
    const v2 = await alice.update('notes', 'n1', { title: 'Second' });

    expect(v2.hash).toBe(expectedHash({ title: 'Second' }));
    expect(v2.hash).not.toBe(v1.hash);

    await alice.stop();
  });

  test('identical data produces identical hash regardless of record id', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();

    const data = { text: 'duplicate content' };
    const r1 = await alice.create('notes', data, { id: 'a' });
    const r2 = await alice.create('notes', data, { id: 'b' });

    expect(r1.hash).toBe(r2.hash);
    await alice.stop();
  });

  test('hash is replicated to peers via broadcast', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await alice.start();
    await bob.start();

    const data = { msg: 'hello peer' };
    const created = await alice.create('chat', data, { id: 'msg1' });

    await waitFor(() => bob.read('chat', 'msg1') !== null);

    const bobRecord = bob.read('chat', 'msg1');
    expect(bobRecord.hash).toBe(created.hash);
    expect(bobRecord.hash).toBe(expectedHash(data));

    await alice.stop();
    await bob.stop();
  });

  test('hash is preserved in pushRecordSnapshot and restoreRecord', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    const bob = new DignityP2P({ nodeId: 'bob', networkAdapter: new InMemoryNetworkAdapter(hub), security });

    await alice.start();
    await bob.start();

    const data = { value: 42 };
    await alice.create('items', data, { id: 'item1' });

    await alice.pushRecordSnapshot('items', 'item1', { connectToPeers: ['bob'] });

    await waitFor(() => bob.read('items', 'item1') !== null);

    const aliceRecord = alice.read('items', 'item1');
    const bobRecord = bob.read('items', 'item1');

    expect(bobRecord.hash).toBe(aliceRecord.hash);
    expect(bobRecord.hash).toBe(expectedHash(data));

    await alice.stop();
    await bob.stop();
  });

  test('list includes hash on each record', async () => {
    const alice = new DignityP2P({ nodeId: 'alice', networkAdapter: new InMemoryNetworkAdapter(hub), security });
    await alice.start();

    await alice.create('things', { x: 1 }, { id: 'a' });
    await alice.create('things', { x: 2 }, { id: 'b' });

    const records = alice.list('things');
    expect(records).toHaveLength(2);
    for (const r of records) {
      expect(r.hash).toMatch(/^sha512:[0-9a-f]{128}$/);
    }

    await alice.stop();
  });
});
