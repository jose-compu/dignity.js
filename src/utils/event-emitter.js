class EventEmitter {
  constructor() {
    this.handlers = new Map();
  }

  on(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    this.handlers.get(eventName).add(handler);
  }

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
