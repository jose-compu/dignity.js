/**
 * Minimal synchronous event bus used by {@link DignityP2P} and related classes.
 *
 * @example
 * const emitter = new EventEmitter();
 * emitter.on('change', (payload) => console.log(payload));
 * emitter.emit('change', { id: 'x' });
 */
class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.handlers = new Map();
  }

  /**
   * Register a handler for an event name.
   * Multiple handlers per event are supported; order is registration order.
   *
   * @param {string} eventName
   * @param {Function} handler - Called with a single payload argument when {@link EventEmitter#emit} runs.
   */
  on(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    this.handlers.get(eventName).add(handler);
  }

  /**
   * Remove a previously registered handler. No-op if the handler was not registered.
   *
   * @param {string} eventName
   * @param {Function} handler
   */
  off(eventName, handler) {
    const eventHandlers = this.handlers.get(eventName);
    if (!eventHandlers) {
      return;
    }

    eventHandlers.delete(handler);
    if (eventHandlers.size === 0) {
      this.handlers.delete(eventName);
    }
  }

  /**
   * Invoke all handlers registered for `eventName` with `payload`.
   * No-op when no handlers are registered.
   *
   * @param {string} eventName
   * @param {*} payload
   */
  emit(eventName, payload) {
    const eventHandlers = this.handlers.get(eventName);
    if (!eventHandlers) {
      return;
    }

    for (const handler of eventHandlers) {
      handler(payload);
    }
  }
}

module.exports = EventEmitter;
