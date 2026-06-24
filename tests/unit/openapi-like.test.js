const fs = require('fs');
const path = require('path');
const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src');

const specPath = path.join(__dirname, '../../docs/openapi-like.json');
const packagePath = path.join(__dirname, '../../package.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

/**
 * Collect DignityP2P method names referenced in openapi-like.json.
 * One-way check: every documented method must exist on the class.
 */
function collectDocumentedDignityMethods(openApiSpec) {
  const methods = new Set();
  const resources = openApiSpec.resources || {};

  for (const key of Object.keys(openApiSpec.lifecycle || {})) {
    methods.add(key);
  }

  const collectionResource = resources['collections/{collection}/{id}'] || {};
  for (const [key, entry] of Object.entries(collectionResource)) {
    if (entry && entry.method) {
      const match = entry.method.match(/^(\w+)\(/);
      if (match) {
        methods.add(match[1]);
      }
    } else if (key === 'delete') {
      methods.add('remove');
    }
  }

  const listResource = resources['collections/{collection}'] || {};
  if (listResource.list) {
    methods.add('list');
  }

  for (const section of ['peers', 'identity', 'peerGroups']) {
    for (const key of Object.keys(resources[section] || {})) {
      methods.add(key);
    }
  }

  return methods;
}

describe('openapi-like.json', () => {
  test('parses as valid JSON and matches package version', () => {
    expect(spec.name).toBe('dignity.js');
    expect(spec.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(spec.version).toBe(pkg.version);
  });

  test('documented DignityP2P methods exist on the class', () => {
    const hub = new InMemoryNetworkHub();
    const node = new DignityP2P({
      nodeId: 'spec-check',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { powEnabled: false, signingEnabled: false, encryptionEnabled: false }
    });

    const documented = collectDocumentedDignityMethods(spec);
    expect(documented.size).toBeGreaterThan(0);

    const missing = [...documented].filter((name) => typeof node[name] !== 'function');
    expect(missing).toEqual([]);
  });
});
