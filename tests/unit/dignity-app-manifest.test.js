const {
  validateDignityAppManifest,
  collectionAllowed,
  getStoredCommand,
  MANIFEST_SCHEMA_VERSION
} = require('../../src/apps/manifest');

describe('Dignity App manifest', () => {
  test('validates minimal read-only manifest', () => {
    const result = validateDignityAppManifest({
      id: 'timeline-demo',
      title: 'Event timeline',
      collections: ['posts']
    });

    expect(result.ok).toBe(true);
    expect(result.manifest.schemaVersion).toBe(MANIFEST_SCHEMA_VERSION);
    expect(result.manifest.readOnly).toBe(true);
    expect(result.manifest.collections).toEqual(['posts']);
  });

  test('rejects invalid id', () => {
    expect(validateDignityAppManifest({ id: 'Bad ID!', title: 'x', collections: ['a'] }).ok).toBe(false);
  });

  test('stored command must reference declared collection', () => {
    const result = validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      storedCommands: [{ id: 'upvote', collection: 'comments', kind: 'update' }]
    });
    expect(result.ok).toBe(false);
  });

  test('rejects localhost in allowedCspOrigins', () => {
    const result = validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      allowedCspOrigins: ['https://localhost:3000']
    });
    expect(result.ok).toBe(false);
  });

  test('collectionAllowed and getStoredCommand', () => {
    const { manifest } = validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      storedCommands: [{
        id: 'bump',
        collection: 'posts',
        kind: 'update',
        allowedFields: ['score']
      }]
    });

    expect(collectionAllowed(manifest, 'posts')).toBe(true);
    expect(collectionAllowed(manifest, 'other')).toBe(false);
    expect(getStoredCommand(manifest, 'bump').kind).toBe('update');
    expect(manifest.readOnly).toBe(false);
  });
});
