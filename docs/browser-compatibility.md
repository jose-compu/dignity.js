# Browser compatibility (#91)

dignity.js targets **modern evergreen browsers** with WebRTC, IndexedDB, and Web Crypto. CI runs **Node.js unit tests only** — browser rows below reflect manual smoke testing on the docs site (playground, chess demo), not automated cross-browser CI.

## Required platform APIs

| API | Used for | Minimum expectation |
| --- | --- | --- |
| WebRTC (`RTCPeerConnection`) | PeerJS mesh data channels | Chrome 74+, Firefox 66+, Safari 12.1+, Edge 79+ |
| IndexedDB | Optional reload persistence (`IndexedDBPersistence`) | Same as above |
| Web Crypto (`crypto.subtle` or `tweetnacl` fallback) | Signing, encryption, PoW | Secure context (HTTPS or localhost) |
| `WebSocket` | Signaling fallback / Cloudflare relay | Universal in supported browsers |
| ES modules | ESM bundle (`dist/dignity.esm.js`) | Native `import` (no IE11) |

## Compatibility matrix

| Browser | Status | Notes |
| --- | --- | --- |
| **Chrome / Chromium** (recent) | Supported | Primary dev target; playground + chess demo verified manually |
| **Firefox** (recent) | Supported | WebRTC + IndexedDB; test playground after signaling changes |
| **Safari** (macOS / iOS, recent) | Supported with caveats | WebRTC may need user gesture for some flows; IT P restrictions on `wss://` signaling |
| **Edge** (Chromium) | Supported | Same as Chrome |
| **Node.js 18+** | Supported (non-browser) | In-memory adapter, fake-indexeddb tests; PeerJS falls back to WebSocket checks |
| **IE11 / legacy Edge** | Not supported | No WebRTC mesh, no ESM |

**CI (automated):** Node **18.x, 20.x, 22.x** on `ubuntu-latest` — see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). No Playwright/browser matrix in CI yet.

## Known limitations

- **Secure context:** Web Crypto and many signaling endpoints require HTTPS (or `localhost`).
- **WebRTC NAT/firewall:** Mesh connectivity depends on STUN/TURN and signaling reachability; corporate VPNs may block UDP.
- **Safari background tabs:** Timers and WebRTC may throttle when the tab is inactive.
- **IndexedDB quotas:** Large collections can hit per-origin storage limits; filter with `collections` on `IndexedDBPersistence`.
- **PoW (Sloth VDF):** Default `powSteps: 22` targets ~1s per message; slow devices may need lower steps in development.
- **Safari private mode:** IndexedDB may be ephemeral or cleared on close.

## Signaling defaults

Default pool includes Cloudflare and public PeerJS servers (`wss://`). Custom deployments should provide their own signaling URLs via `createDefaultSignalingPool({ cloudflareUrls, fallbackUrls })`.

## Reporting issues

If a browser-specific failure is reproducible on the [playground](https://jose-compu.github.io/dignity.js/playground/) or chess demo, open an issue with browser version, OS, and console errors.
