const DEFAULT_CLOUDFLARE_SIGNALING_URLS = [
  'wss://signaling.cloudflare.com',
  'wss://cloudflare-webrtc-signaling.example',
  'wss://trycloudflare-signaling.example'
];

const DEFAULT_SIGNALING_FALLBACK_URLS = [
  'wss://relay.dignity.dev/signaling',
  'wss://backup-relay.dignity.dev/signaling'
];

module.exports = {
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS
};
