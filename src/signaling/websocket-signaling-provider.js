class WebSocketSignalingProvider {
  constructor({ id, url, WebSocketImpl, priority = 0 }) {
    if (!url) {
      throw new Error('WebSocket signaling provider requires a url');
    }

    this.id = id || url;
    this.url = url;
    this.priority = priority;
    this.WebSocketImpl = WebSocketImpl || globalThis.WebSocket;
    this.socket = null;
    this.messageHandlers = new Set();
  }

  async connect() {
    if (!this.WebSocketImpl) {
      throw new Error('WebSocket implementation is not available');
    }

    await new Promise((resolve, reject) => {
      const socket = new this.WebSocketImpl(this.url);

      socket.onopen = () => {
        this.socket = socket;
        resolve();
      };

      socket.onerror = () => {
        reject(new Error(`Unable to connect to signaling url ${this.url}`));
      };

      socket.onmessage = (event) => {
        let payload = event.data;
        try {
          payload = JSON.parse(event.data);
        } catch (error) {
          payload = event.data;
        }

        for (const handler of this.messageHandlers) {
          handler(payload);
        }
      };
    });
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
  }

  async send(message) {
    if (!this.socket || this.socket.readyState !== 1) {
      throw new Error(`Signaling socket is not open for ${this.url}`);
    }

    this.socket.send(JSON.stringify(message));
  }

  async disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.close();
    this.socket = null;
  }
}

module.exports = WebSocketSignalingProvider;
