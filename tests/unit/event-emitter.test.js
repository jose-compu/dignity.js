const EventEmitter = require('../../src/utils/event-emitter');

describe('EventEmitter', () => {
  test('registers and emits handlers', () => {
    const emitter = new EventEmitter();
    const received = [];

    emitter.on('change', (payload) => received.push(payload));
    emitter.emit('change', { id: 1 });

    expect(received).toEqual([{ id: 1 }]);
  });

  test('removes handlers', () => {
    const emitter = new EventEmitter();
    const handler = jest.fn();

    emitter.on('change', handler);
    emitter.off('change', handler);
    emitter.emit('change', { id: 2 });

    expect(handler).not.toHaveBeenCalled();
  });

  test('no-op when removing unknown handlers', () => {
    const emitter = new EventEmitter();
    const handler = jest.fn();

    expect(() => emitter.off('missing', handler)).not.toThrow();
  });

  test('emit is no-op for unregistered event', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit('unknown', { x: 1 })).not.toThrow();
  });

  test('off cleans up empty handler set', () => {
    const emitter = new EventEmitter();
    const handler = jest.fn();

    emitter.on('test', handler);
    emitter.off('test', handler);

    expect(emitter.handlers.has('test')).toBe(false);
  });

  test('off removes one handler but keeps remaining handlers', () => {
    const emitter = new EventEmitter();
    const a = jest.fn();
    const b = jest.fn();

    emitter.on('event', a);
    emitter.on('event', b);
    emitter.off('event', a);

    emitter.emit('event', 'val');
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith('val');
    expect(emitter.handlers.has('event')).toBe(true);
  });

  test('supports multiple handlers for same event', () => {
    const emitter = new EventEmitter();
    const first = jest.fn();
    const second = jest.fn();

    emitter.on('ping', first);
    emitter.on('ping', second);
    emitter.emit('ping', 'data');

    expect(first).toHaveBeenCalledWith('data');
    expect(second).toHaveBeenCalledWith('data');
  });
});
