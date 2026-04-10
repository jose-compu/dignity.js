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
});
