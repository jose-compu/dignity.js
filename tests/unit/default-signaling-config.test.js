const {
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS
} = require('../../src/signaling/default-signaling-config');

describe('default signaling URL constants', () => {
  test('DEFAULT_CLOUDFLARE_SIGNALING_URLS are wss peerjs endpoints', () => {
    expect(DEFAULT_CLOUDFLARE_SIGNALING_URLS.length).toBeGreaterThanOrEqual(2);
    for (const url of DEFAULT_CLOUDFLARE_SIGNALING_URLS) {
      expect(url).toMatch(/^wss:\/\//);
      expect(url).toContain('/peerjs');
      expect(url).toContain('key=peerjs');
    }
  });

  test('DEFAULT_SIGNALING_FALLBACK_URLS are websocket urls', () => {
    expect(Array.isArray(DEFAULT_SIGNALING_FALLBACK_URLS)).toBe(true);
    for (const url of DEFAULT_SIGNALING_FALLBACK_URLS) {
      expect(url).toMatch(/^wss:\/\//);
    }
  });
});
