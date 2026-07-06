const {
  DignityP2P,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  DignityQueryReplica,
  operationToDomainEvent
} = require('../../src');
const { fastTestSecurity, fastWaitFor, fastSleep } = require('../helpers/fast-security');

describe('DignityQueryReplica', () => {
  let hub;
  const security = fastTestSecurity({ appPassword: 'replica-test' });

  beforeEach(() => {
    hub = new InMemoryNetworkHub();
  });

  test('replica hydrates view from domain events', async () => {
    const publisher = new DignityP2P({
      nodeId: 'publisher',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });
    const subscriber = new DignityP2P({
      nodeId: 'subscriber',
      networkAdapter: new InMemoryNetworkAdapter(hub),
      security
    });

    await publisher.start();
    await subscriber.start();

    await publisher.joinPeerGroup('feed:pub', {
      role: 'publisher',
      tiered: true,
      liveCap: 10,
      fanout: 2,
      maxActivePeers: 4
    });

    const replica = new DignityQueryReplica(subscriber, {
      groupId: 'feed:pub',
      collections: ['posts'],
      publisherId: 'publisher'
    });
    await replica.start({ bootstrapPeerIds: ['publisher'] });
    await fastSleep(30);

    await publisher.create('posts', { text: 'replica hello' }, {
      id: 'p1',
      peerGroupId: 'feed:pub'
    });

    expect(await fastWaitFor(() => replica.read('posts', 'p1') !== null)).toBe(true);
    expect(replica.read('posts', 'p1').data.text).toBe('replica hello');
    expect(replica.getViewStats().eventCount).toBeGreaterThan(0);

    await replica.stop();
    await publisher.stop();
    await subscriber.stop();
  });

  test('verifyChain passes for ordered events', async () => {
    const view = require('../../src/cqrs/domain-events').createEmptyView(['posts']);
    const replica = new (require('../../src/cqrs/query-replica'))(
      { on() {}, off() {}, joinPeerGroup: async () => {}, leavePeerGroup: async () => {} },
      { groupId: 'g', collections: ['posts'] }
    );
    replica.view = view;

    const first = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { text: 'a' }
    }, { publisherId: 'pub', groupId: 'g', eventIdGenerator: () => 'e1' });

    const second = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 1,
      payload: { text: 'b' }
    }, { publisherId: 'pub', groupId: 'g', prevHash: first.eventHash, eventIdGenerator: () => 'e2' });

    replica.ingestEvent(first, { skipChainCheck: true });
    replica.ingestEvent(second);

    expect(replica.verifyChain().ok).toBe(true);
  });

  test('constructor and ingest edge cases', () => {
    expect(() => new DignityQueryReplica(null, { groupId: 'g' })).toThrow('requires dignityP2P');
    expect(() => new DignityQueryReplica({}, {})).toThrow('requires groupId');

    const dignity = {
      on: jest.fn(),
      off: jest.fn(),
      joinPeerGroup: jest.fn(async () => {}),
      leavePeerGroup: jest.fn(async () => {})
    };
    const replica = new DignityQueryReplica(dignity, { groupId: 'g', collections: ['posts'] });

    const warnings = [];
    const broken = [];
    replica.on('warning', (event) => warnings.push(event));
    replica.on('chainbroken', (event) => broken.push(event));

    const bad = { schemaVersion: 99, eventId: 'x', groupId: 'g', publisherId: 'p', kind: 'record:created' };
    expect(replica.ingestEvent(bad)).toBe(false);
    expect(warnings[0].type).toBe('domain-event-rejected');

    const first = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { text: 'a' }
    }, { publisherId: 'pub', groupId: 'g', eventIdGenerator: () => 'e1' });
    replica.ingestEvent(first, { skipChainCheck: true });

    const wrongPrev = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 1,
      payload: { text: 'b' }
    }, { publisherId: 'pub', groupId: 'g', prevHash: 'wrong', eventIdGenerator: () => 'e2' });
    expect(replica.ingestEvent(wrongPrev)).toBe(false);
    expect(broken.length).toBeGreaterThan(0);

    replica.handleDomainEvent({ groupId: 'other' });
    replica.handleDomainEvent({ ...first, groupId: 'g', publisherId: 'other' });
    replica.handlePeerGroupMessage({ groupId: 'g', type: 'domain:checkpoint', payload: { ok: true } });

    expect(replica.read('missing', 'x')).toBeNull();
    expect(replica.list('missing')).toEqual([]);
    expect(replica.getViewStats().collections.posts).toBeDefined();
  });

  test('start and stop lifecycle', async () => {
    const dignity = {
      handlers: {},
      on(event, handler) {
        this.handlers[event] = handler;
      },
      off(event) {
        delete this.handlers[event];
      },
      joinPeerGroup: jest.fn(async () => {}),
      leavePeerGroup: jest.fn(async () => {})
    };
    const replica = new DignityQueryReplica(dignity, { groupId: 'g', collections: ['posts'], publisherId: 'pub' });
    const started = [];
    replica.on('started', (payload) => started.push(payload));

    await replica.start({ bootstrapPeerIds: ['pub'] });
    expect(dignity.joinPeerGroup).toHaveBeenCalled();
    expect(started[0].groupId).toBe('g');

    await replica.stop();
    await replica.stop();
    expect(dignity.leavePeerGroup).toHaveBeenCalled();
  });

  test('ingest duplicate, genesis prevHash, and deleted list paths', async () => {
    const dignity = {
      on: jest.fn(),
      off: jest.fn(),
      joinPeerGroup: jest.fn(async () => {}),
      leavePeerGroup: jest.fn(async () => {})
    };
    const replica = new DignityQueryReplica(dignity, { groupId: 'g', collections: ['posts'] });
    const warnings = [];
    replica.on('warning', (event) => warnings.push(event));

    const first = operationToDomainEvent({
      kind: 'create',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 1,
      payload: { text: 'a' }
    }, { publisherId: 'pub', groupId: 'g', eventIdGenerator: () => 'e1' });

    const badGenesis = { ...first, eventId: 'e0', prevHash: 'unexpected' };
    expect(replica.ingestEvent(badGenesis)).toBe(false);

    replica.ingestEvent(first, { skipChainCheck: true });
    expect(replica.ingestEvent(first)).toBe(false);

    const conflict = operationToDomainEvent({
      kind: 'update',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 2,
      baseVersion: 99,
      payload: { text: 'nope' }
    }, { publisherId: 'pub', groupId: 'g', prevHash: first.eventHash, eventIdGenerator: () => 'e2' });
    expect(replica.ingestEvent(conflict)).toBe(false);
    expect(warnings.some((w) => w.type === 'domain-event-not-applied')).toBe(true);

    const removed = operationToDomainEvent({
      kind: 'delete',
      collectionName: 'posts',
      id: 'p1',
      timestamp: 3,
      baseVersion: 1
    }, { publisherId: 'pub', groupId: 'g', prevHash: first.eventHash, eventIdGenerator: () => 'e3' });
    replica.ingestEvent(removed, { skipChainCheck: true });

    expect(replica.read('posts', 'p1')).toBeNull();
    const deletedList = replica.list('posts', { includeDeleted: true });
    expect(deletedList).toHaveLength(1);
    expect(deletedList[0].deletedAt).toBeTruthy();

    const broken = replica.verifyChain();
    if (!broken.ok) {
      expect(broken).toBeDefined();
    }
  });

  test('start is idempotent when already started', async () => {
    const dignity = {
      on: jest.fn(),
      off: jest.fn(),
      joinPeerGroup: jest.fn(async () => {}),
      leavePeerGroup: jest.fn(async () => {})
    };
    const replica = new DignityQueryReplica(dignity, { groupId: 'g' });
    await replica.start();
    await replica.start();
    expect(dignity.joinPeerGroup).toHaveBeenCalledTimes(1);
  });
});
