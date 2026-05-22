function parsePeerJsServerUrl(url) {
  const parsed = new URL(url);
  const secure = parsed.protocol === 'wss:';
  const host = parsed.hostname;
  const port = parsed.port ? Number(parsed.port) : secure ? 443 : 80;
  const key = parsed.searchParams.get('key') || 'peerjs';

  let path = parsed.pathname || '/';

  // dignity.js URLs describe the final PeerJS websocket path (often ending in /peerjs).
  // The official PeerJS client always appends "peerjs" to `path`, so strip that suffix
  // to avoid connections like /peerjs/peerjs.
  if (path.endsWith('/peerjs')) {
    path = path.slice(0, -'/peerjs'.length) || '/';
  }

  if (path !== '/' && !path.endsWith('/')) {
    path += '/';
  }

  return { secure, host, port, path, key };
}

module.exports = parsePeerJsServerUrl;
