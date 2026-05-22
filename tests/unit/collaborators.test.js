const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src');

describe('collaborators and ownership transfer', () => {
  let hub;
  let owner;
  let collaborator;
  let observer;

  beforeEach(async () => {
    hub = new InMemoryNetworkHub();

    owner = new DignityP2P({
      nodeId: 'owner',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { appPassword: 'shared', powTargetMs: 50 }
    });

    collaborator = new DignityP2P({
      nodeId: 'collaborator',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { appPassword: 'shared', powTargetMs: 50 }
    });

    observer = new DignityP2P({
      nodeId: 'observer',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: { appPassword: 'shared', powTargetMs: 50 }
    });

    await owner.start();
    await collaborator.start();
    await observer.start();
  });

  afterEach(async () => {
    await owner.stop();
    await collaborator.stop();
    await observer.stop();
  });

  test('collaborator can update shared object', async () => {
    await owner.create('games', { score: 0 }, {
      id: 'game-1',
      collaborators: ['collaborator'],
      broadcastScope: 'room:game'
    });

    await collaborator.update('games', 'game-1', { score: 1 }, { broadcastScope: 'room:game' });

    expect(owner.read('games', 'game-1').data.score).toBe(1);
    expect(collaborator.read('games', 'game-1').data.score).toBe(1);
  });

  test('non-collaborator cannot update shared object', async () => {
    await owner.create('games', { score: 0 }, { id: 'game-1', broadcastScope: 'room:game' });

    await expect(
      observer.update('games', 'game-1', { score: 9 }, { broadcastScope: 'room:game' })
    ).rejects.toThrow(/collaborators can update/);
  });

  test('owner can add collaborators through update options', async () => {
    await owner.create('games', { score: 0 }, { id: 'game-1', broadcastScope: 'room:game' });

    await owner.update('games', 'game-1', { score: 1 }, {
      collaborators: ['collaborator'],
      broadcastScope: 'room:game'
    });

    await collaborator.update('games', 'game-1', { score: 2 }, { broadcastScope: 'room:game' });
    expect(owner.read('games', 'game-1').data.score).toBe(2);
  });

  test('collaborator cannot change collaborator list', async () => {
    await owner.create('games', { score: 0 }, {
      id: 'game-1',
      collaborators: ['collaborator'],
      broadcastScope: 'room:game'
    });

    await expect(
      collaborator.update('games', 'game-1', { score: 1 }, {
        collaborators: ['observer'],
        broadcastScope: 'room:game'
      })
    ).rejects.toThrow(/Only owner owner can change collaborators/);
  });

  test('only owner can delete object', async () => {
    await owner.create('games', { score: 0 }, {
      id: 'game-1',
      collaborators: ['collaborator'],
      broadcastScope: 'room:game'
    });

    await expect(collaborator.remove('games', 'game-1', { broadcastScope: 'room:game' }))
      .rejects.toThrow(/Only owner owner can delete/);
  });

  test('transferOwnership moves owner and keeps previous owner as collaborator', async () => {
    await owner.create('games', { score: 0 }, { id: 'game-1', broadcastScope: 'room:game' });

    await owner.transferOwnership('games', 'game-1', 'collaborator', { broadcastScope: 'room:game' });

    const transferred = owner.read('games', 'game-1');
    expect(transferred.ownerId).toBe('collaborator');
    expect(transferred.collaboratorIds).toContain('owner');

    await owner.update('games', 'game-1', { score: 3 }, { broadcastScope: 'room:game' });
    expect(collaborator.read('games', 'game-1').data.score).toBe(3);
  });
});
