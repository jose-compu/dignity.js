# Browser compatibility (#91)

dignity.js targets **modern evergreen browsers** with WebRTC, IndexedDB, Web Crypto, and (for Dignity Apps) `MessageChannel` + sandboxed iframes. **v0.14.0** bundles verification, CQRS replicas, Dignity Apps, and TypeScript definitions for browser use via `dist/dignity.esm.js`.

## Required platform APIs

| API | Used for | Minimum expectation |
| --- | --- | --- |
| WebRTC (`RTCPeerConnection`) | PeerJS mesh data channels | Chrome 74+, Firefox 66+, Safari 12.1+, Edge 79+ |
| IndexedDB | Optional reload persistence (`IndexedDBPersistence`) | Same as above |
| Web Crypto (`crypto.subtle` or `tweetnacl` fallback) | Signing, encryption, PoW, SHA-512 hashes | Secure context (HTTPS or localhost) |
| `WebSocket` | Signaling fallback / Cloudflare relay | Universal in supported browsers |
| ES modules | ESM bundle (`dist/dignity.esm.js`) | Native `import` (no IE11) |
| `MessageChannel` | Dignity Apps parent ↔ iframe RPC (#103) | Chrome 55+, Firefox 41+, Safari 10.1+, Edge 79+ |
| Sandboxed `<iframe>` + CSP meta | `DignityAppHost` sandboxed apps (#102) | Same as above |
| `Function.prototype.toString` | Reflective logic fingerprints (#123) | Required for `reflective: true` verification |

## Compatibility matrix

| Browser | Status | Notes |
| --- | --- | --- |
| **Chrome / Chromium** (recent) | Supported | Primary dev target; playground, chess, tic-tac-toe, timeline app verified |
| **Firefox** (recent) | Supported | WebRTC + IndexedDB + MessageChannel; re-test playground after signaling changes |
| **Safari** (macOS / iOS, recent) | Supported with caveats | WebRTC may need user gesture; IT restrictions on `wss://` signaling; iframe `srcdoc` + sandbox tested on timeline app |
| **Edge** (Chromium) | Supported | Same as Chrome |
| **Node.js 18+** | Supported (non-browser) | In-memory adapter, fake-indexeddb tests; PeerJS uses WebSocket checks in Node |
| **IE11 / legacy Edge** | Not supported | No WebRTC mesh, no ESM, no MessageChannel |

### Manual smoke targets (docs site)

| Page | Exercises |
| --- | --- |
| [Playground](https://jose-compu.github.io/dignity.js/playground/) | Core CRUD, CQRS, Dignity Apps, **v0.13 verification** demos |
| [Chess demo](https://jose-compu.github.io/dignity.js/chess/) | PeerJS mesh, ownership transfer, resume checkpoints |
| [Tic-tac-toe](https://jose-compu.github.io/dignity.js/tictactoe/) | Turn-based ownership, browser PeerJS |
| [Timeline app](https://jose-compu.github.io/dignity.js/apps/timeline/) | `DignityAppHost`, sandboxed iframe, stored commands |
| [Apps registry](https://jose-compu.github.io/dignity.js/apps/) | Manifest listing, search |

## CI coverage

| Job | What runs | Browsers |
| --- | --- | --- |
| **test** | `npm test`, `npm run build`, `npm run docs:check` | Node 18.x, 20.x, 22.x only |
| **browser-e2e** (push to `main` / `release/**`) | `RUN_BROWSER_E2E=1 npm run test:e2e` | **Chromium** (Playwright headless) |
| **cloudflare-live** (push to `main`, optional) | Live signaling smoke | Node + real `wss://` endpoints |

Local browser e2e:

```bash
npm run build
RUN_BROWSER_E2E=1 npm run test:e2e:browser   # playground + Dignity Apps
RUN_CHESS_E2E=1 npm run test:e2e:chess       # chess resume handshake
```

There is **no automated Firefox/Safari matrix in CI** yet — report cross-browser issues with version + console output.

## Feature-specific browser notes

### Dignity Apps (`DignityAppHost`)

- Requires **`MessageChannel`** — unavailable in IE11 and very old browsers.
- Apps run in a **sandboxed iframe** (`allow-scripts` only); parent communicates via `postMessage` / transferred ports.
- CSP is injected as a **meta tag**; `connect-src` is locked down unless `allowedCspOrigins` is set on the manifest.
- **Third-party iframes** embedding your host page may be blocked by `frame-ancestors 'none'` on the child app CSP.

### Verification (v0.13)

- `registerVerification` / `hashReflectiveLogic` run fully in-browser (includes AST canonicalization via bundled parser).
- Reflective mode fingerprints **`function.toString()`** output — minified or build-transformed functions may not match across peers unless sources are equivalent before bundling.
- Policy enforcement (`strict`, `patch-only`, etc.) applies on ingest like Node.

### CQRS / query replicas

- `DignityQueryReplica` and domain-event views work in browser builds; large audiences should prefer **tiered PeerGroups** (live cap ~5k per publisher) to limit memory.

## Known limitations

- **Secure context:** Web Crypto, many signaling endpoints, and some storage APIs require HTTPS (or `localhost`).
- **WebRTC NAT/firewall:** Mesh connectivity depends on STUN/TURN and signaling reachability; corporate VPNs may block UDP.
- **Safari background tabs:** Timers and WebRTC may throttle when the tab is inactive.
- **IndexedDB quotas:** Large collections can hit per-origin storage limits; filter with `collections` on `IndexedDBPersistence`.
- **PoW (Sloth VDF):** Default `powSteps: 22` targets ~1s per message; slow devices may need lower steps in development.
- **Safari private mode:** IndexedDB may be ephemeral or cleared on close.
- **Playground bundle size:** `docs/assets/dignity.esm.js` is a full browser bundle (verification + apps + acorn); first load on slow mobile networks may take longer.

## Signaling defaults

Default pool includes Cloudflare and public PeerJS servers (`wss://`). Custom deployments should provide their own signaling URLs via `createDefaultSignalingPool({ cloudflareUrls, fallbackUrls })`.

## PeerJS ICE/TURN and reconnect {#peerjs-ice-turn}

Browser mesh connectivity depends on **WebRTC ICE** (STUN for NAT discovery, TURN for relay when direct UDP fails). dignity.js passes optional `iceServers` through `createPeerJSNetworkAdapter`:

```js
import { createPeerJSNetworkAdapter } from 'dignity.js';

const networkAdapter = createPeerJSNetworkAdapter({
  urls: ['wss://your-signaling.example/peerjs?key=peerjs'],
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
});
```

### Reconnect behavior

- **Signaling drop:** `PeerJSNetworkAdapter` tries each URL in `urls` on `start()`. If the active PeerJS connection errors, call `stop()` then `start(nodeId)` to re-register with signaling and re-open data channels.
- **Data channel empty but signaling connected:** This usually means ICE failed or the remote peer is offline. Ensure both sides call `connectToPeer(remoteId)` (or use `bootstrapPeerIds` / `connectToPeers` on broadcasts). Check browser console for WebRTC errors.
- **Mid-session disconnect:** Peers should reconnect signaling, call `connectToPeer` again, and the owner may need `pushRecordSnapshot` so late joiners receive full state before applying updates.

### Troubleshooting

| Symptom | Likely cause | Mitigation |
| --- | --- | --- |
| Signaling connected, no messages | No open data channel | `connectToPeer`, `bootstrapPeerIds` |
| Works on LAN, fails on VPN/corp network | UDP blocked | Deploy TURN, set `iceServers` |
| Safari tab backgrounded | WebRTC throttled | Keep tab focused during connect |
| Joiner sees stale/missing state | Missed initial `create` | Owner calls `pushRecordSnapshot` |
| Dignity App iframe blank | CSP or sandbox violation | Check host error panel / browser console CSP events |
| Verification mismatch across peers | Different bundled function sources | Use `reflective: true` on equivalent source, or pin `dappVersion` + `logicHash` |

If a browser-specific failure is reproducible on the [playground](https://jose-compu.github.io/dignity.js/playground/), chess, tic-tac-toe, or timeline demos, open an issue with browser version, OS, and console errors.
