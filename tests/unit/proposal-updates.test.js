const { DignityP2P, InMemoryNetworkHub, InMemoryNetworkAdapter } = require('../../src');
const { fastTestSecurity } = require('../helpers/fast-security');

describe('delegated move proposals (#13)', () => {
  let hub;
  let owner;
  let proposer;
  let observer;

  beforeEach(async () => {
    hub = new InMemoryNetworkHub();

    owner = new DignityP2P({
      nodeId: 'owner',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: fastTestSecurity({ appPassword: 'shared' })
    });

    proposer = new DignityP2P({
      nodeId: 'proposer',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: fastTestSecurity({ appPassword: 'shared' })
    });

    observer = new DignityP2P({
      nodeId: 'observer',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security: fastTestSecurity({ appPassword: 'shared' })
    });

    await owner.start();
    await proposer.start();
    await observer.start();
  });

  afterEach(async () => {
    await owner.stop();
    await proposer.stop();
    await observer.stop();
  });

  test('non-owner cannot update but proposal round-trip applies patch', async () => {
    await owner.create('games', { board: [null, null, null], turn: 'proposer' }, {
      id: 'g1',
      broadcastScope: 'room:game'
    });

    await expect(
      proposer.update('games', 'g1', { board: ['X', null, null] }, { broadcastScope: 'room:game' })
    ).rejects.toThrow(/collaborators can update/);

    const proposals = [];
    owner.on('proposal', (p) => proposals.push(p));

    const results = [];
    proposer.on('proposalresult', (r) => results.push(r));

    const { proposalId } = await proposer.proposeUpdate('games', 'g1', {
      board: ['X', null, null],
      turn: 'owner'
    });

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(proposals).toHaveLength(1);
    expect(proposals[0].proposalId).toBe(proposalId);
    expect(proposals[0].proposerId).toBe('proposer');

    await owner.acceptProposal(proposals[0], { broadcastScope: 'room:game' });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(owner.read('games', 'g1').data.board[0]).toBe('X');
    expect(proposer.read('games', 'g1').data.board[0]).toBe('X');
    expect(results.some((r) => r.ok === true && r.proposalId === proposalId)).toBe(true);
  });

  test('owner cannot proposeUpdate', async () => {
    await owner.create('games', { score: 0 }, { id: 'g2', broadcastScope: 'room:game' });
    await expect(owner.proposeUpdate('games', 'g2', { score: 1 })).rejects.toThrow(/update\(\) directly/);
  });

  test('rejectProposal notifies proposer', async () => {
    await owner.create('games', { board: [] }, { id: 'g3', broadcastScope: 'room:game' });

    const proposals = [];
    owner.on('proposal', (p) => proposals.push(p));

    const results = [];
    proposer.on('proposalresult', (r) => results.push(r));

    await proposer.proposeUpdate('games', 'g3', { board: ['O'] });
    await new Promise((resolve) => setTimeout(resolve, 40));

    await owner.rejectProposal(proposals[0], 'invalid-move');
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(results.some((r) => r.ok === false && r.reason === 'invalid-move')).toBe(true);
    expect(owner.read('games', 'g3').data.board).toEqual([]);
  });

  test('banned proposer proposals are ignored by owner handler', async () => {
    await owner.create('games', { board: [] }, { id: 'g4', broadcastScope: 'room:game' });
    owner.banPeer('proposer');

    const proposals = [];
    owner.on('proposal', (p) => proposals.push(p));

    await proposer.proposeUpdate('games', 'g4', { board: ['X'] });
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(proposals).toHaveLength(0);
  });
});
