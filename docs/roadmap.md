# dignity.js product roadmap

Tracks **post–v1.0** delivery through the most **usable** production path. Stable API policy remains in [`api-stability.md`](./api-stability.md). Release history and changelog bullets live in [`README.md`](../README.md). **Tracking issue:** [#87](https://github.com/jose-compu/dignity.js/issues/87) (meta); live AV detail in [#152](https://github.com/jose-compu/dignity.js/issues/152).

**Last updated:** 2026-11-22 — priorities reshaped after external technical review (audio-first pilots, video evidence-gated).

---

## North star (what “usable” means)

Ship something operators can **pilot this quarter**, not a library checklist that still needs real deployments to prove overlay stability.

| Priority | Product | Why dignity.js |
|----------|---------|----------------|
| **P0** | **Live P2P radio / mono audio** | 64–96 kbps is cheap on uplink; relay trees tolerate mediocre home upload; 1–3 s glass-to-glass is fine for broadcast backup under congestion. |
| **P0** | **Federated social + data on the same runtime** | Signed identity, PoW anti-abuse, encrypted chat/presence beside the stream — not offered as one stack by mature video P2P CDNs. |
| **P1** | **Private audio rooms** (E2E) | Reuse existing direct-message and stream access-mode APIs. |
| **P2** | **Public video (240p→1080p ABR)** | Technically viable in bounded scenarios; **deferred** until audio pilots produce relay-contribution and churn metrics. Ladder includes **240, 360, 480, 720, and 1080** so relays can stay on low layers under uplink pressure. Generic HLS/VOD backup competes with [P2P Media Loader](https://github.com/Novage/p2p-media-loader) (mature, in production) — not a first ship target. |

---

## Current baseline (v1.4.1)

- **Core (stable):** CRUD replication, verification, PeerGroups (`fanout` 3, `maxHops` 64), CQRS tiers, Dignity Apps, threat model.
- **Streaming (experimental):** Ed25519 signed chunks, public join handshake, WebRTC signaling + data channel transport (`WebRTCStreamSignalingBus`, `WebRTCDataChannelTransport`). **Not yet:** WebCodecs encode/play pipeline, multi-hop relay trees at scale, churn repair, TURN sizing doc in code, ABR, Node/ffmpeg origin.

**Pilot floor today:** v1.3+ chunk path + v1.4 signaling is enough for an **in-memory / lab** radio experiment; **v1.5** is the target for a cautious **university-radio** pilot on the public internet (see below).

---

## Technical verdict (bounded scenarios)

What completes the roadmap **does** close:

- **WebCodecs chunks over data channels** with Ed25519-signed envelopes — modern fan-out pattern (one encode, many forwards); fits Chrome, Edge, Safari 16.4+, Firefox.
- **Relay trees** with bounded degree and depth — origin load ~O(log N) vs O(N); fanout 3 with high `maxHops` matches existing PeerGroup defaults.
- **1–3 s latency** — acceptable for congestion backup (worse than pure WebRTC, comparable to LL-HLS).

What the roadmap **does not** eliminate without ops and pilots:

1. **Upload contribution** — each relay spends ~stream bitrate × children; 1080p @ 4.5 Mbps breaks typical 10 Mbps home uplink at ~2 children. **Audio makes this marginal.**
2. **NAT / corporate browsers** — WebRTC needs a **dimensioned TURN** pool; hidden cost if omitted.
3. **Churn** — radio audiences join/leave constantly; re-parent + overlap buffers are solved in literature but **hard engineering**; no large production deploy validates dignity.js overlay yet.
4. **Video market** — for CDN backup on VOD/HLS, mature OSS alternatives already ship; dignity.js wins on **identity + social + audio live**, not on replacing hls.js plugins alone.

---

## Release plan

### v1.5 — **Radio pilot ready** (target: first real pilot)

**Theme:** Public **mono Opus** live stream with 2–4 relay hops, same-session **presence + chat** via PeerGroup.

| Work item | Done when |
|-----------|-----------|
| WebCodecs **AudioEncoder** → signed chunks → **AudioWorklet** or MSE playout | End-to-end in browser demo (no camera required) |
| **Multi-hop relay tree** (not only one hop); default **fanout 3**; `degree` capped by measured `navigator.connection` / TWCC uplink estimate | Stress test to N≈1k synthetic listeners in harness |
| **Churn v1:** heartbeat upstream, re-parent on timeout, 2–4 s sibling overlap buffer | Unit + integration tests; documented failure modes |
| **TURN:** production-runbook section with sizing formula and health checks | Operators can deploy without reading WebRTC tribal knowledge |
| **Pilot kit:** checklist (signaling, TURN, expected relay %, stall SLO) | University / community radio can run a 1-hour test |
| Integrate stream `sessionId` with **scoped PeerGroup** for encrypted chat alongside audio | Demo page updated |

Non-goals for v1.5: 1080p video, ABR simulcast, Node/ffmpeg origin, 10M analytic claims.

### v1.6 — **Overlay evidence**

| Work item | Done when |
|-----------|-----------|
| Client **telemetry hooks** (relay ratio, stalls, re-parent count, signature failures) | Exporter-friendly events, no vendor lock-in |
| Extend `stress-peer-group` / new **synthetic audio chunk** load test | Report stall rate vs N and churn rate |
| Optional **super-peer** / bulk-relay tier for high-upload nodes | Documented; off by default |
| Discrete-event **simulator** (upload distribution + GCC throttle) | Feeds go/no-go for video |

**Gate:** v1.7 video milestones stay **blocked** until a pilot or simulator shows acceptable stall rate at target N with ≥X% relays willing.

### v1.7 — **Private audio**

- `private-single` / `private-list` with E2E keys (sender-key v1).
- Combined mode: public low-latency mono + private HQ track for allowlist.

### v1.8–v1.9 — **Platform & ops**

- Publisher rate limits on stream control plane (reuse anti-abuse bans).
- Node **ffmpeg → signed chunks** origin for headless broadcasters.
- Migration notes for streaming helpers leaving `@experimental` (see api-stability).

### v2.0 — **Video (evidence-gated)**

Only after v1.6 metrics from real or simulated load.

- WebCodecs VP9/AV1 + optional simulcast; full **ABR ladder** — **240p, 360p, 480p, 720p, 1080p** (plus sub-layers where simulcast applies) — with playout buffer tuning in [`live-streaming-design.md`](./live-streaming-design.md). Ship lowest tiers first in the v2.0 slice (240–480) for relay-friendly pilots, then 720/1080.
- Positioning: **interactive live / backup under congestion**, not primary replacement for P2P Media Loader on static HLS.

Research-only until gate clears: 10⁷ concurrent viewers — keep as **design upper bound**, not a marketing claim.

---

## Differentiation (vs video-only P2P CDNs)

- **Identity-bound streams** — chunks signed with the same Ed25519 material as `MessageSecurityService`.
- **Anti-abuse** — PoW and ban semantics on control + chunk abuse.
- **Social layer** — presence, DMs, and app state on one PeerJS/signaling fabric (chess spectators, timelines, future radio lobby).
- **Federation-friendly** — no monolithic SFU bill; overlays reuse PeerGroup gossip patterns.

---

## How to use this doc

- **Feature requests:** align with the **next unreleased row** above; avoid expanding video scope before v1.6 gate.
- **Operators:** start with [production-runbook.md](./production-runbook.md) + v1.5 pilot kit (when shipped).
- **Implementers:** topology and bitrates in [`live-streaming-design.md`](./live-streaming-design.md).
- **Branches and tags:** [`git-branches.md`](./git-branches.md) (`release/1.5.0-radio-pilot`, etc.).

---

## Shipped milestones (summary)

| Version | Theme |
|---------|--------|
| v1.0 | Stable API, threat model |
| v1.1 | Identity mnemonic |
| v1.2–v1.3 | Streaming research + signed public chunk path |
| v1.4 | WebRTC signaling + data channel transport (#152 milestone 2) |

Older milestones: see README and [#87](https://github.com/jose-compu/dignity.js/issues/87).