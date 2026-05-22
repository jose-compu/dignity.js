const api = require('../../src');

describe('public API exports', () => {
  test('exports core modules and defaults', () => {
    expect(api.DignityP2P).toBeDefined();
    expect(api.SignalingPool).toBeDefined();
    expect(api.WebSocketSignalingProvider).toBeDefined();
    expect(api.PeerJSSignalingProvider).toBeDefined();
    expect(api.MessageSecurityService).toBeDefined();
    expect(api.VDF).toBeDefined();
    expect(api.SlothPermutation).toBeDefined();
    expect(api.IndexedDBPersistence).toBeDefined();
  });

  test('exports sane default configs', () => {
    expect(Array.isArray(api.DEFAULT_CLOUDFLARE_SIGNALING_URLS)).toBe(true);
    expect(api.DEFAULT_CLOUDFLARE_SIGNALING_URLS.length).toBeGreaterThan(0);
    expect(Array.isArray(api.DEFAULT_SIGNALING_FALLBACK_URLS)).toBe(true);
    expect(api.DEFAULT_SIGNALING_FALLBACK_URLS.length).toBeGreaterThan(0);

    expect(api.DEFAULT_SECURITY_OPTIONS).toMatchObject({
      enabled: true,
      signingEnabled: true,
      encryptionEnabled: true,
      powEnabled: true,
      powTargetMs: 1000,
      powSteps: 22
    });
  });
});
