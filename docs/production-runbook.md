# Production deployment runbook (#95)

Practical guide for running dignity.js in production: signaling, NAT traversal, security tuning, monitoring, and scale.

See also: [browser-compatibility.md](./browser-compatibility.md), [PeerJS ICE/TURN](./browser-compatibility.md#peerjs-ice-turn).

## Deployment checklist

| Item | Required | Notes |
|------|----------|-------|
| HTTPS (or localhost) | Yes | Web Crypto and secure contexts for browser apps |
| Signaling reachable | Yes | Default pool or self-hosted `wss://` endpoints |
| TURN relay (production mesh) | Recommended | Corporate VPN / symmetric NAT often block direct UDP |
| Custom `appPassword` | Yes | Never ship `DEFAULT_APP_PASSWORD` in production |
| Broadcast scope passwords | Per room/game | `security.broadcastPasswords` keyed by `broadcastScope` |
| Persistence strategy | Optional | `IndexedDBPersistence` with `collections` filter for large apps |
| Verification registration | Recommended | `registerVerification` or `registerPublisherVerification` per collection |
| Monitoring hooks | Recommended | Subscribe to `securityerror`, `peerbanned`, `chainbroken`, `policyrejected` |

## Signaling

### Default pool

`createDefaultSignalingPool()` uses public Cloudflare PeerJS relays plus fallback URLs from [src/signaling/default-signaling-config.js](../src/signaling/default-signaling-config.js).

```js
import { createDefaultSignalingPool, createPeerJSNetworkAdapter } from 'dignity.js';

const pool = createDefaultSignalingPool({
  cloudflareUrls: ['wss://your-relay.example/peerjs?key=peerjs'],
  fallbackUrls: ['wss://backup.example/signaling']
});

const networkAdapter = createPeerJSNetworkAdapter({
  urls: pool.providers.map((p) => p.url)
});
```

### Self-hosted signaling

- Run PeerJS or a WebSocket relay compatible with `PeerJSSignalingProvider` / `WebSocketSignalingProvider`
- Use TLS (`wss://`) in production
- Plan failover: multiple URLs in `createPeerJSNetworkAdapter({ urls: [...] })`
- Optional live smoke: `RUN_CLOUDFLARE_LIVE_TESTS=1 npm run test:cloudflare-live` (CI runs this on `main`, `continue-on-error`)

### Reconnect

On signaling drop: `await node.stop()` then `await node.start(nodeId)`. Re-open data channels with `connectToPeer` / `bootstrapPeerIds`. For late joiners, owner calls `pushRecordSnapshot`.

## ICE / TURN

Browser mesh depends on WebRTC ICE. STUN alone is insufficient on many networks.

```js
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

| Symptom | Likely cause | Mitigation |
|---------|--------------|------------|
| Signaling OK, no P2P messages | No data channel | `connectToPeer`, `bootstrapPeerIds` |
| LAN works, VPN fails | UDP blocked | Deploy TURN, set `iceServers` |
| Safari background tab | WebRTC throttled | Keep tab focused during connect |
| Stale joiner state | Missed initial `create` | `pushRecordSnapshot` + `restoreRecord` |

## Security tuning

Defaults from `DEFAULT_SECURITY_OPTIONS`:

| Option | Default | Production guidance |
|--------|---------|---------------------|
| `powSteps` | 22 | Lower in dev; keep ~1s target via `powTargetMs` on slow devices |
| `powTargetMs` | 1000 | Calibrate with `RUN_POW_CALIBRATE=1 npm run test:pow-calibrate` |
| `kdfIterations` | 100000 | Raise for high-value apps; peers must agree on decrypt |
| `banDurationMs` | 48h | Auto-ban on bad signature/PoW; tune per threat model |
| `signingEnabled` | true | Keep enabled |
| `encryptionEnabled` | true | Keep enabled; scope passwords per game/room |

### Identity and cold recovery

- Use `deriveAndAdoptIdentity` or `adoptDerivedIdentityKeyPair` — not ephemeral random keys for long-lived accounts
- Enroll cold recovery: `enrollAndBroadcastColdRecovery` or two-step `enrollColdRecoveryPassword` + `broadcastColdRecoveryEnrollment`
- Rotate on compromise: `revokeAndRotateDerivedIdentity` (requires cold co-sign when enrolled)

### Verification (v0.13+)

```js
node.registerPublisherVerification('alice', 'posts', {
  code: businessRules,
  reflective: true,
  version: '0.14.0',
  dappId: 'my-feed',
  policy: 'strict'
});
```

Policies: `advisory` (warn), `strict` (reject), `patch-only`, `minor-and-patch`, `backward-compatible`.

## Monitoring

### Connection and gossip stats

```js
node.getConnectionStats();   // { openCount, peerIds }
node.getPeerGroupStats();    // joinedGroups, seenGossipCount, openConnectionCount
node.getBanInfo(peerId);     // ban expiry + reason
```

### Events to alert on

| Event | Severity | Action |
|-------|----------|--------|
| `securityerror` | High | Log peerId, message type; consider `banPeer` |
| `peerbanned` | Medium | Audit ban reason |
| `chainbroken` | High | CQRS replica hash chain failure — investigate publisher |
| `policyrejected` | Medium | Verification/policy mismatch or untrusted publisher |
| `verificationmismatch` | Low–Medium | Hash drift; strict policy rejects at ingest |
| `warning` + `orphan-operation` | Low | Late joiner — `pushRecordSnapshot` |
| `warning` + `content-hash-mismatch` | High | Possible tampering |

### Dignity Apps host

Subscribe on `DignityAppHost`: `apperror`, `apprpcerror`, `applog`. Use `attachErrorPanel` for operator visibility.

## Scale guidance

### Direct mesh (small groups)

- Suitable for games, small collaboration (chess, tic-tac-toe demos)
- Use `joinDiscovery` + scoped `broadcastScope`
- Cap open connections via adapter `maxOpenConnections`

### CQRS tiered PeerGroups (large audiences)

- Publisher: `joinPeerGroup(id, { role: 'publisher', tiered: true, domainEvents: true, liveCap: 5000 })`
- Subscribers: `joinPeerGroup(id, { role: 'subscriber', tierMode: 'auto' })`
- Read path: `DignityQueryReplica` materializes from signed domain events
- Bulk tail: `publishPeerGroupBulk`, `electBulkRelays` for audiences above live cap

### Persistence

- `IndexedDBPersistence.attach(node)` — filter `collections` to avoid quota exhaustion
- Safari private mode: storage may be ephemeral
- Large collections: monitor per-origin quota; prune deleted stubs in app logic

## Operational gotchas

1. **Default app password** — emits `warning` with `default-app-password`; set a strong `appPassword` before `start()`
2. **PeerJS without connect** — broadcasting does not auto-open channels to all peers; use `connectToPeers` or `bootstrapPeerIds`
3. **Reflective verification** — minified/bundled function sources may not match across peers; pin `dappVersion` + `logicHash` on manifests
4. **Dignity App CSP** — iframe `connect-src` locked unless `allowedCspOrigins` set on manifest
5. **No central registry** — publisher trust is opt-in per peer via `registerPublisherVerification`

## Smoke tests before go-live

```bash
npm test
RUN_BROWSER_E2E=1 npm run test:e2e:browser
RUN_CLOUDFLARE_LIVE_TESTS=1 npm run test:cloudflare-live   # optional signaling check
```

Manual: [playground](https://jose-compu.github.io/dignity.js/playground/), chess demo, timeline app on target browsers.
