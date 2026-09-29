import { bench, describe } from 'vitest';
import { require } from './helpers.mjs';

const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('../src');

const fastSecurity = {
  appPassword: 'bench-password',
  powEnabled: false,
  signingEnabled: false,
  encryptionEnabled: false
};

function createNode(nodeId, hub) {
  let counter = 0;
  return new DignityP2P({
    nodeId,
    networkAdapter: new InMemoryNetworkAdapter(hub),
    idGenerator: () => `${nodeId}-${(counter += 1)}`,
    now: () => 1_700_000_000_000 + counter,
    security: fastSecurity
  });
}

const RECORD_COUNT = 200;

// A pre-populated node for read-path benchmarks.
const readHub = new InMemoryNetworkHub();
const readNode = createNode('reader', readHub);
await readNode.start();
for (let i = 0; i < RECORD_COUNT; i += 1) {
  await readNode.create('notes', { index: i, title: `note ${i}`, tags: ['a', 'b'] }, { id: `n-${i}` });
}

describe('DignityP2P (in-memory network)', () => {
  bench(`create ${RECORD_COUNT} records`, async () => {
    const hub = new InMemoryNetworkHub();
    const node = createNode('writer', hub);
    await node.start();
    for (let i = 0; i < RECORD_COUNT; i += 1) {
      await node.create('notes', { index: i, title: `note ${i}` }, { id: `n-${i}` });
    }
    await node.stop();
  });

  bench(`create + update ${RECORD_COUNT / 2} records`, async () => {
    const hub = new InMemoryNetworkHub();
    const node = createNode('writer', hub);
    await node.start();
    for (let i = 0; i < RECORD_COUNT / 2; i += 1) {
      await node.create('notes', { index: i, title: `note ${i}` }, { id: `n-${i}` });
      await node.update('notes', `n-${i}`, { title: `note ${i} (edited)` });
    }
    await node.stop();
  });

  bench(`list ${RECORD_COUNT} records`, () => {
    readNode.list('notes');
  });

  bench('read single record', () => {
    readNode.read('notes', 'n-100');
  });
});
