const parsePeerJsServerUrl = require('../../src/signaling/parse-peerjs-url');

describe('parsePeerJsServerUrl', () => {
  test('strips trailing /peerjs because PeerJS client adds it', () => {
    expect(parsePeerJsServerUrl('wss://peerjs.92k.de/peerjs?key=peerjs')).toEqual({
      secure: true,
      host: 'peerjs.92k.de',
      port: 443,
      path: '/',
      key: 'peerjs'
    });
  });

  test('preserves custom mount prefixes before /peerjs', () => {
    expect(parsePeerJsServerUrl('wss://example.com/custom/peerjs?key=peerjs')).toEqual({
      secure: true,
      host: 'example.com',
      port: 443,
      path: '/custom/',
      key: 'peerjs'
    });
  });

  test('parses ws:// with default port 80', () => {
    expect(parsePeerJsServerUrl('ws://signaling.example.com/peerjs')).toEqual({
      secure: false,
      host: 'signaling.example.com',
      port: 80,
      path: '/',
      key: 'peerjs'
    });
  });

  test('parses explicit non-default port', () => {
    expect(parsePeerJsServerUrl('wss://peerjs.example.com:9000/peerjs?key=custom-key')).toEqual({
      secure: true,
      host: 'peerjs.example.com',
      port: 9000,
      path: '/',
      key: 'custom-key'
    });
  });

  test('defaults key to peerjs when query param is missing', () => {
    expect(parsePeerJsServerUrl('wss://peerjs.example.com/peerjs')).toEqual({
      secure: true,
      host: 'peerjs.example.com',
      port: 443,
      path: '/',
      key: 'peerjs'
    });
  });

  test('normalizes path without trailing slash', () => {
    expect(parsePeerJsServerUrl('wss://example.com/mount/peerjs?key=peerjs')).toEqual({
      secure: true,
      host: 'example.com',
      port: 443,
      path: '/mount/',
      key: 'peerjs'
    });
  });

  test('handles root path when url ends at host', () => {
    expect(parsePeerJsServerUrl('wss://peerjs.example.com/?key=peerjs')).toEqual({
      secure: true,
      host: 'peerjs.example.com',
      port: 443,
      path: '/',
      key: 'peerjs'
    });
  });

  test('throws on invalid URL', () => {
    expect(() => parsePeerJsServerUrl('not-a-url')).toThrow();
  });
});
