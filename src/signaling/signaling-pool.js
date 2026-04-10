class SignalingPool {
  constructor(providers = []) {
    this.providers = [...providers];
    this.activeProvider = null;
  }

  registerProvider(provider) {
    this.providers.push(provider);
  }

  getProvidersByPriority() {
    return [...this.providers].sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  async connect(excludedProviderIds = new Set()) {
    const providers = this.getProvidersByPriority().filter(
      (provider) => !excludedProviderIds.has(provider.id)
    );
    let lastError;

    for (const provider of providers) {
      try {
        await provider.connect();
        this.activeProvider = provider;
        return provider;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('No signaling provider could connect');
  }

  async send(message) {
    if (!this.activeProvider) {
      await this.connect();
    }

    try {
      await this.activeProvider.send(message);
    } catch (error) {
      if (this.activeProvider && typeof this.activeProvider.disconnect === 'function') {
        await this.activeProvider.disconnect();
      }

      const failedProviderId = this.activeProvider ? this.activeProvider.id : null;
      this.activeProvider = null;
      const excludedProviderIds = failedProviderId ? new Set([failedProviderId]) : new Set();
      await this.connect(excludedProviderIds);
      await this.activeProvider.send(message);
      return error;
    }

    return null;
  }

  onMessage(handler) {
    for (const provider of this.providers) {
      if (typeof provider.onMessage === 'function') {
        provider.onMessage(handler);
      }
    }
  }

  async disconnect() {
    const disconnections = this.providers
      .filter((provider) => typeof provider.disconnect === 'function')
      .map((provider) => provider.disconnect());

    await Promise.all(disconnections);
    this.activeProvider = null;
  }
}

module.exports = SignalingPool;
