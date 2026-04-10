const createDefaultSignalingPool = require('../../src/signaling/create-default-signaling-pool');

describe('createDefaultSignalingPool', () => {
  test('builds providers from cloudflare urls and fallback urls', () => {
    const pool = createDefaultSignalingPool({
      cloudflareUrls: ['wss://cf-1.example'],
      fallbackUrls: ['wss://fb-1.example', 'wss://fb-2.example'],
      WebSocketImpl: function MockWebSocket() {}
    });

    expect(pool.providers).toHaveLength(3);
    expect(pool.providers[0].id).toBe('cloudflare-1');
    expect(pool.providers[1].id).toBe('fallback-1');
    expect(pool.providers[2].id).toBe('fallback-2');
  });
});
