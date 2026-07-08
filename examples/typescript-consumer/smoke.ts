import {
  DignityP2P,
  InMemoryNetworkAdapter,
  InMemoryNetworkHub,
  hashReflectiveLogic,
  type CompatibilityPolicy,
  type DignityRecord
} from 'dignity.js';

const hub = new InMemoryNetworkHub();
const node: DignityP2P = new DignityP2P({
  nodeId: 'ts-smoke',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security: { powEnabled: false, signingEnabled: false, encryptionEnabled: false }
});

const policy: CompatibilityPolicy = 'strict';

node.registerVerification('scores', {
  code: {
    max: 100,
    validate(record: DignityRecord) {
      return (record.data.points as number) <= 100;
    }
  },
  reflective: true,
  version: '0.14.0',
  policy
});

const reflective = hashReflectiveLogic({ check() { return true; } }, { policy });
const hashPrefix: string = reflective.hash.slice(0, 7);

void node;
void hashPrefix;
