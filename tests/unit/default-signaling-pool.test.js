const createDefaultSignalingPool = require('../../src/signaling/create-default-signaling-pool');
const { DEFAULT_CLOUDFLARE_SIGNALING_URLS } = require('../../src/signaling/default-signaling-config');

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

  test('uses hardcoded Cloudflare signaling defaults from config', () => {
    expect(DEFAULT_CLOUDFLARE_SIGNALING_URLS).toEqual([
      'wss://peerjs.92k.de/peerjs?key=peerjs',
      'wss://0.peerjs.com/peerjs?key=peerjs'
    ]);

    const pool = createDefaultSignalingPool({
      fallbackUrls: [],
      WebSocketImpl: function MockWebSocket() {}
    });

    expect(pool.providers).toHaveLength(DEFAULT_CLOUDFLARE_SIGNALING_URLS.length);
    expect(pool.providers.map((provider) => provider.url)).toEqual(DEFAULT_CLOUDFLARE_SIGNALING_URLS);
    expect(pool.providers.every((provider) => provider.constructor.name === 'PeerJSSignalingProvider')).toBe(true);
  });
});
