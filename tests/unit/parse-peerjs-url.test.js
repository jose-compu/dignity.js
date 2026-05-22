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
});
