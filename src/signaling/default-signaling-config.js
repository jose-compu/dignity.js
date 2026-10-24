const DEFAULT_CLOUDFLARE_SIGNALING_URLS = [
  'wss://dechess-org-peerjs.vercel.app/peerjs?key=peerjs',
  'wss://0.peerjs.com/peerjs?key=peerjs'
];

const DEFAULT_SIGNALING_FALLBACK_URLS = [
  'wss://relay.dignity.dev/signaling',
  'wss://backup-relay.dignity.dev/signaling'
];

module.exports = {
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS
};
