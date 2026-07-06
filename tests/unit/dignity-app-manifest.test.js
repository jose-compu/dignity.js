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
    expect(getStoredCommand(manifest, 'missing')).toBeNull();
    expect(manifest.readOnly).toBe(false);
  });

  test('rejects invalid manifest shapes and stored command fields', () => {
    expect(validateDignityAppManifest(null).ok).toBe(false);
    expect(validateDignityAppManifest({ schemaVersion: 99, id: 'app', title: 'x', collections: ['a'] }).ok).toBe(false);
    expect(validateDignityAppManifest({ id: 'app', title: 'x', collections: [] }).ok).toBe(false);
    expect(validateDignityAppManifest({ id: 'app', title: 'x', collections: ['', 'a'] }).ok).toBe(false);
    expect(validateDignityAppManifest({ id: 'app', title: 'x', collections: ['a', 'a'] }).ok).toBe(false);

    const badCmd = validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      storedCommands: [{ id: '', collection: 'posts', kind: 'update' }]
    });
    expect(badCmd.ok).toBe(false);

    const badKind = validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      storedCommands: [{ id: 'x', collection: 'posts', kind: 'patch' }]
    });
    expect(badKind.ok).toBe(false);

    const badFields = validateDignityAppManifest({
      id: 'app',
      title: 'App',
      collections: ['posts'],
      storedCommands: [{ id: 'x', collection: 'posts', kind: 'update', allowedFields: [''] }]
    });
    expect(badFields.ok).toBe(false);
  });

  test('validates optional manifest metadata and https origins', () => {
    const result = validateDignityAppManifest({
      id: 'timeline',
      title: 'Timeline',
      description: '  Events  ',
      collections: ['posts'],
      peerGroupId: ' feed:alice ',
      publisherId: ' pub-1 ',
      allowedCspOrigins: ['https://cdn.example.com']
    });
    expect(result.ok).toBe(true);
    expect(result.manifest.description).toBe('Events');
    expect(result.manifest.peerGroupId).toBe('feed:alice');
    expect(collectionAllowed(null, 'posts')).toBeFalsy();
  });
});
