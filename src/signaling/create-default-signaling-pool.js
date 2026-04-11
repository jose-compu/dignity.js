const SignalingPool = require('./signaling-pool');
const WebSocketSignalingProvider = require('./websocket-signaling-provider');
const PeerJSSignalingProvider = require('./peerjs-signaling-provider');
const {
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS
} = require('./default-signaling-config');

function createDefaultSignalingPool(options = {}) {
  const cloudflareUrls = options.cloudflareUrls || DEFAULT_CLOUDFLARE_SIGNALING_URLS;
  const fallbackUrls = options.fallbackUrls || DEFAULT_SIGNALING_FALLBACK_URLS;
  const WebSocketImpl = options.WebSocketImpl;

  const providers = [];

  cloudflareUrls.forEach((url, index) => {
    const usePeerJsProvider = /^wss:\/\/(peerjs\.92k\.de|0\.peerjs\.com)(\/|$)/.test(url);
    const ProviderClass = usePeerJsProvider ? PeerJSSignalingProvider : WebSocketSignalingProvider;

    providers.push(
      new ProviderClass({
        id: `cloudflare-${index + 1}`,
        url,
        WebSocketImpl,
        priority: index
      })
    );
  });

  fallbackUrls.forEach((url, index) => {
    providers.push(
      new WebSocketSignalingProvider({
        id: `fallback-${index + 1}`,
        url,
        WebSocketImpl,
        priority: cloudflareUrls.length + index
      })
    );
  });

  if (Array.isArray(options.customProviders)) {
    providers.push(...options.customProviders);
  }

  return new SignalingPool(providers);
}

module.exports = createDefaultSignalingPool;
