const http = require('http');
const { createWhipIngest } = require('../../src/streaming/ingest');

function request(port, method, path, headers, body = '') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path,
        headers
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8')
          });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

describe('WHIP ingest', () => {
  let server;
  let port;
  let whip;

  beforeEach(async () => {
    whip = createWhipIngest({
      mountPath: '/whip',
      peerFactory: async (offer) => ({
        answerSdp: `v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n`,
        onFrame: () => {}
      })
    });
    server = http.createServer((req, res) => {
      whip.handleRequest(req, res);
    });
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    whip.stop();
    await new Promise((resolve) => server.close(resolve));
  });

  test('POST returns 201 Location and SDP answer', async () => {
    const res = await request(port, 'POST', '/whip', {
      'Content-Type': 'application/sdp',
      'Content-Length': 3
    }, 'v=0');
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(/^\/whip\/res-/);
    expect(res.body).toContain('m=video');
  });

  test('415 on wrong content type', async () => {
    const res = await request(port, 'POST', '/whip', {
      'Content-Type': 'text/plain',
      'Content-Length': 1
    }, 'x');
    expect(res.status).toBe(415);
    expect(res.headers.accept).toBe('application/sdp');
  });

  test('401 when authorize rejects', async () => {
    whip = createWhipIngest({
      mountPath: '/whip',
      authorize: () => false,
      peerFactory: async () => ({ answerSdp: 'v=0' })
    });
    await new Promise((resolve) => {
      server.close(() => {
        server = http.createServer((req, res) => whip.handleRequest(req, res));
        server.listen(port, '127.0.0.1', resolve);
      });
    });
    const res = await request(port, 'POST', '/whip', {
      'Content-Type': 'application/sdp',
      'Content-Length': 1
    }, 'v');
    expect(res.status).toBe(401);
  });

  test('DELETE ends session', async () => {
    const created = await request(port, 'POST', '/whip', {
      'Content-Type': 'application/sdp',
      'Content-Length': 1
    }, 'v');
    const location = created.headers.location;
    const deleted = await request(port, 'DELETE', location, {});
    expect(deleted.status).toBe(200);
    const again = await request(port, 'DELETE', location, {});
    expect(again.status).toBe(404);
  });
});