const api = require('../../src');

describe('public API exports', () => {
  test('exports core modules and defaults', () => {
    expect(api.DignityP2P).toBeDefined();
    expect(api.SignalingPool).toBeDefined();
    expect(api.WebSocketSignalingProvider).toBeDefined();
    expect(api.PeerJSSignalingProvider).toBeDefined();
    expect(api.MessageSecurityService).toBeDefined();
    expect(api.deriveKeyPairFromCredentials).toBeDefined();
    expect(api.parsePeerJsServerUrl).toBeDefined();
    expect(api.DEFAULT_APP_PASSWORD).toBeDefined();
    expect(api.VDF).toBeDefined();
    expect(api.SlothPermutation).toBeDefined();
    expect(api.IndexedDBPersistence).toBeDefined();
    expect(api.PeerJSNetworkAdapter).toBeDefined();
    expect(api.createPeerJSNetworkAdapter).toBeDefined();
    expect(api.peerGroupScope).toBeDefined();
    expect(api.parsePeerGroupScope).toBeDefined();
    expect(api.DEFAULT_PEER_GROUP_OPTIONS).toBeDefined();
    expect(api.selectFanoutPeers).toBeDefined();
    expect(api.DignityQueryReplica).toBeDefined();
    expect(api.DOMAIN_EVENT_SCHEMA_VERSION).toBe(1);
    expect(api.DEFAULT_LIVE_CAP).toBe(5000);
    expect(api.DEFAULT_PEER_GROUP_OPTIONS.maxHops).toBe(64);
    expect(api.STREAMING_API_EXPERIMENTAL).toBe(true);
    expect(api.createStreamSession).toBeDefined();
    expect(api.STREAM_ACCESS_MODES.PUBLIC).toBe('public');
    expect(api.parseAnnexBAccessUnits).toBeDefined();
    expect(api.parseFmp4Fragments).toBeDefined();
    expect(api.demuxMpegTs).toBeDefined();
    expect(api.MEDIA_CHUNK_VERSION).toBe(3);
    expect(api.resolveRendition).toBeDefined();
    expect(api.createBandwidthEstimator).toBeDefined();
    expect(api.createLayerSelector).toBeDefined();
    expect(api.createReceiverReport).toBeDefined();
    expect(api.createPlayoutBuffer).toBeDefined();
    expect(api.createRelayLayerPolicy).toBeDefined();
    expect(api.normalizeSimulcastLayers).toBeDefined();
    expect(api.runSimulcastLoadTrace).toBeDefined();
    expect(api.runScaleSimulation).toBeDefined();
    expect(api.assignRelayChildBudget).toBeDefined();
    expect(api.assignRelayChildren).toBeDefined();
    expect(api.PublicStreamBroadcaster.prototype.publishSimulcastTick).toBeDefined();
  });

  test('package.json exposes TypeScript definitions', () => {
    const pkg = require('../../package.json');
    expect(pkg.types).toBe('./types/index.d.ts');
    expect(pkg.exports['.'].types).toBe('./types/index.d.ts');
    expect(pkg.exports['./react'].types).toBe('./types/react.d.ts');
  });

  test('node subpath exports ingest adapters', () => {
    const nodeApi = require('../../src/node');
    expect(nodeApi.createMpegTsIngest).toBeDefined();
    expect(nodeApi.createHlsIngest).toBeDefined();
    expect(nodeApi.createRtmpIngest).toBeDefined();
    expect(nodeApi.createSrtIngest).toBeDefined();
    expect(nodeApi.createWhipIngest).toBeDefined();
    expect(nodeApi.INGEST_FFMPEG_NOT_FOUND).toBe('INGEST_FFMPEG_NOT_FOUND');
  });

  test('main and streaming indexes do not pull Node-only streaming modules', () => {
    const mainSrc = require('fs').readFileSync(require('path').join(__dirname, '../../src/index.js'), 'utf8');
    const streamingSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../../src/streaming/index.js'),
      'utf8'
    );
    for (const fragment of ['src/node', 'node-stream-origin', 'node-media-ingest', 'streaming/ingest/index', "require('fs')", "require('child_process')", "require('dgram')", "require('http')"]) {
      expect(mainSrc.includes(fragment)).toBe(false);
      expect(streamingSrc.includes(fragment)).toBe(false);
    }
  });

  test('browser bundle excludes Node-only modules', () => {
    const fs = require('fs');
    const path = require('path');
    const bundlePath = path.join(__dirname, '../../dist/dignity.esm.js');
    if (!fs.existsSync(bundlePath)) {
      return;
    }
    const src = fs.readFileSync(bundlePath, 'utf8');
    expect(src.includes('child_process')).toBe(false);
    expect(src.includes('dgram')).toBe(false);
    expect(src.includes('node-media-ingest')).toBe(false);
    expect(src.includes('ingest/index')).toBe(false);
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
