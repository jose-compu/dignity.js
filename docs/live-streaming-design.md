# Live P2P video and audio — design document

**Status:** Research plus an experimental API (**v1.4.1**). Shipped today: Ed25519-signed chunks, public join handshake, **WebRTC** signaling and data channel transport (`WebRTCStreamSignalingBus`, `WebRTCDataChannelTransport`). Still missing for production: **WebCodecs encode/play**, **multi-hop relay trees**, churn repair, TURN ops guidance in deploys, private E2E keys, and ABR.

**Product order (see [`roadmap.md`](./roadmap.md)):** ship **live mono radio (Opus)** and social presence first; treat **live video (240p through 1080p)** as v2.0 after overlay metrics from pilots. Generic HLS/VOD P2P backup is out of scope for near-term releases (mature alternatives exist).

Tracks [issue #152](https://github.com/jose-compu/dignity.js/issues/152).

## Goals

- Browser or Node.js **origin** (broadcaster).
- **Low end-to-end latency** for live A/V ( **1–3 s** acceptable for public mass viewing; **&lt; 500 ms** for private audio).
- **Phase 1:** public **mono audio** (64–96 kbps) for radio-style backup under congestion.
- **Phase 2 (gated):** **240p, 360p, 480p, 720p, and 1080p** with congestion-adaptive quality after relay/churn evidence (full ladder below).
- **Access modes:** private (single or list), public, and combined public plus private tracks.
- Design exploration toward very large concurrent audiences without a central SFU for the entire audience (research upper bound; not a near-term ship claim).

## Honest scope statement

v1.2.0 added the design write-up and `StreamSession` access-mode validation. **v1.3.0** added signed chunks and a one-hop relay over an injectable bus. **v1.4.x** adds WebRTC signaling + data channel transport for control and chunk delivery. There is still **no** WebCodecs encoder or browser playout pipeline in the library.

---

## Topology for large fan-out (no full-mesh SFU)

A single origin cannot open one WebRTC media session per viewer at 10M scale. The planned dignity.js approach is **P2P fan-out** over an overlay that mixes:

1. **Relay trees** — interior peers accept a bounded number of downstream children (`degree` \(d\)) and forward media chunks. Depth \(h\) grows as \(d^h \geq N\).
2. **Limited mesh cross-links** — optional sibling edges for repair when a relay dies, without forming a full mesh.

### Degree × depth

Let \(N\) be concurrent viewers (targets include \(N = 10^7\)).

For a balanced \(d\)-ary relay tree (origin counts as root, relays are non-leaf peers):

\[
\text{minimum depth } h \text{ satisfies } d^{h} \geq N
\]

**Pilot default:** align with PeerGroup gossip — **fanout 3**, high `maxHops`, adaptive `degree` per peer upload (audio often allows **degree 4–8** on residential uplink; **240–480p** often allows **degree 4–6**; 720p tighter; 1080p video often **2** on ~10 Mbps home upload).

Example planning numbers (signaling + chunk metadata only; actual degree is **adaptive** per peer upload capacity):

| Target \(N\) | Degree \(d\) | Min hops \(h = \lceil \log_d N \rceil\) |
|-------------|--------------|----------------------------------------|
| 1,000       | 3            | 7                                      |
| 10,000      | 3            | 9                                      |
| 100,000     | 4            | 9                                      |
| 1,000,000+  | 8–16         | 6–7 (research / super-peers)           |

**Per-hop latency:** each relay adds encode/decode (if transcoding) or packetization delay, jitter buffer, and one RTT bucket for control. Budget **20–80 ms** per hop for chunked WebCodecs over data channels (no transcoding), or **40–120 ms** if a relay re-encodes. A 6-hop tree therefore adds roughly **120–480 ms** on top of capture and playout — within reach of interactive live targets if origin–leaf depth stays ≤ 6 and peers run GCC/TWCC-aware forwarding.

### Churn and repair

- Peers heartbeat upstream relays; on timeout, children **re-parent** using dignity.js presence + PeerGroup announcements (same signaling fabric as object replication).
- **Siblings** hold a short overlap buffer (2–4 s) to absorb gap on re-parent.
- Optional **super-peers** — high-bandwidth, long-lived nodes (could be dignity.js “bulk relay” tier extended to media) take more children.
- **TURN (required in production):** dimension a fallback pool for the non-trivial fraction of browsers behind symmetric NAT or corporate firewalls. TURN carries **signaling and hole-punch assist**, not 10M fan-out media. Undersized TURN silently drops listeners — document pool size and geographic spread in the runbook (v1.5).

### Relation to existing PeerGroup gossip

Operationally, media chunk topics can reuse **scoped PeerGroups** (`peerGroupScope`) for session membership while keeping **encrypted payloads opaque** to relays that are not key holders (see access modes).

---

## Media path options

### Browser origin

1. **Capture:** `getUserMedia` (camera/mic) or `canvas.captureStream()`.
2. **Encode (preferred for data-channel fan-out):** WebCodecs `VideoEncoder` / `AudioEncoder` to produce timed chunks (AV1/VP9/Opus), keyed for ABR layers.
3. **Alternative:** classic WebRTC media tracks (`addTrack`) on direct P2P links — workable for prototypes and private modes with few peers, insufficient alone for 10M fan-out without an SFU.

### Node.js console origin

- **Ingest:** `ffmpeg` reading camera, file, or RTMP-like pipe; stdout as Annex-B or fMP4 fragments.
- **WebRTC stack (future prototype):** [`node-datachannel`](https://github.com/murat-dogan/node-datachannel) or [`werift`](https://github.com/shinyoshiaki/werift) for SCTP/data channels and selective RTP bridging.
- Chunks are signed and published into the same overlay as browser origins.

### WebRTC tracks vs data-channel chunking

| Approach | Pros | Cons |
|----------|------|------|
| Media tracks | Mature browsers, built-in jitter buffers | Hard to multi-cast one encoded bitstream to many children without SFU |
| WebCodecs + chunks over SCTP | One encode, many forwards; fits tree fan-out | More application logic; MSE/AudioWorklet playout |

**Plan:** hybrid — WebCodecs chunking over dignity.js-secured data channels for scale; optional direct tracks for low-latency private 1:1.

---

## Latency budget (live video, 240p–1080p)

Target: **glass-to-glass 1.0–3.0 s** for public mass viewing; **&lt; 500 ms** aspirational for private single-recipient.

| Stage | Budget (ms) | Notes |
|-------|-------------|-------|
| Capture + encode frame | 30–100 | WebCodecs; 1–2 frame GOP for live |
| Sign + seal chunk | 5–15 | Ed25519 over chunk header + hash |
| Origin queuing | 10–30 | Paced by GCC estimate |
| Per relay hop | 20–80 | No transcode; forward ciphertext |
| Last-mile playout buffer | 200–800 | Tunable; lower for private mode |
| ABR layer switch | 0–500 | only when congested |

Congestion increases playout buffer before dropping layers (see ABR below).

---

## Bitrate ladders (guidance)

Assuming 30 fps live; actual rates adapt via TWCC/GCC feedback. **Roadmap target (v2.0):** one ordered ABR ladder from **240p through 1080p**; viewers and relays step down under congestion before stalling.

### Unified live ladder (240p → 1080p)

| Layer | Label   | Resolution (approx.) | Video kbps | Audio kbps | Relay notes (10 Mbps uplink) |
|-------|---------|----------------------|------------|------------|-------------------------------|
| L0    | 240p    | 426×240              | 250        | 48 (mono)  | Many children; congested mobile |
| L1    | 360p    | 640×360              | 450        | 48         | Default floor for weak uplink |
| L2    | 480p    | 854×480              | 900        | 64         | Practical P2P video pilot tier |
| L3    | 720p    | 1280×720             | 1,800      | 64         | HD; degree 2–3 typical |
| L4    | 720p+   | 1280×720             | 3,000      | 96         | HD high; same resolution, higher QP cap |
| L5    | 1080p   | 1920×1080            | 4,500      | 96         | Full HD; relay-heavy |
| L6    | 1080p+  | 1920×1080            | 8,000      | 128        | Full HD high; origin/super-peers |

**v2.0 delivery order:** implement **L0–L2 (240 / 360 / 480)** in the first video slice (relay-friendly), then **L3–L6 (720 / 1080)** after uplink and churn metrics from 480p pilots.

### Alternate origin profiles (same layers)

Broadcasters may cap the **maximum emitted layer** (e.g. radio simulcast with video thumb at **240p only**; campus stream at **480p max** on shared Wi‑Fi) without changing layer IDs — viewers still step L0→L*n* within the cap.

**Simulcast / SVC:** origin emits the layers it can afford up to the cap; relays forward a **single** layer per subtree based on downstream TWCC. **SVC (AV1 temporal/spatial)** can collapse L4/L6 into temporal steps on the same spatial ID when browsers support it.

**ABR + GCC/TWCC:** receivers report transport-wide congestion control stats; relays run a simplified GCC controller to pace chunk fan-out; viewers switch layers when estimated throughput drops below layer bitrate × headroom factor (1.2×).

---

## Integrity and identity

Each media chunk carries:

- `sessionId`, `sequence`, `timestamp`, `layerId`, `codecConfig` fingerprint.
- Payload ciphertext (public track may be unencrypted; private tracks always encrypted).
- **Ed25519 signature** using the broadcaster’s dignity.js identity key (same key material as `MessageSecurityService` signing).

Relays verify signature before forwarding; invalid chunks are dropped and peer scores decay (reuse anti-abuse ban semantics).

---

## Access modes and encryption

| Mode | Recipients | Join policy (`canJoin`) | Private payload |
|------|------------|-------------------------|-----------------|
| `private-single` | Exactly one | Broadcaster + one id | E2E encrypted |
| `private-list` | One or more | Broadcaster + allowlist | E2E encrypted |
| `public` | None | Anyone | Cleartext or signed-only |
| `combined` | One or more + public | Anyone watches public layer | Private layer E2E for list |

Private modes use **dignity.js identity key agreement** (existing direct-message encryption primitives). **Relays never receive plaintext** for private tracks — they forward sealed blobs.

### Key distribution

Two patterns (implementation choice in a later milestone):

1. **Sender keys** — origin generates per-track symmetric key; wraps with each recipient’s public key (X25519 + AEAD). Simple for `private-single` / small lists.
2. **MLS-style group key** — epoch key for the private roster; each member gets a Welcome/Commit; better for roster changes at scale.

### Key rotation

- **Membership change** (add/remove private recipient): rotate epoch; old keys shredded after overlap window.
- **Timer-based** rotation (e.g. every 15–60 min) limits exposure.
- Combined mode maintains **separate key domains** for public (optional group key or unsigned) vs private track.

The v1.2.0 `createStreamSession` API validates roster shape only; key wrapping is not implemented yet.

---

## Operational risks (not solved by API completeness)

| Risk | Audio pilot | Video (later) |
|------|-------------|---------------|
| Upload contribution | Low (~0.1 Mbps × children) | High (Mbps × children); congestion hits relays hardest |
| NAT / TURN | Must deploy TURN; measure join failure % | Same, stricter latency |
| Churn / re-parent | Engineering v1.5; overlap buffer 2–4 s | Same, larger playout buffers |
| Competitive position | Unique with dignity.js identity + chat | P2P Media Loader et al. for HLS/VOD backup |

---

## Benchmark / simulation plan

Before claiming production readiness at large \(N\):

1. **Analytic model** — random \(d\)-ary trees with churn; measure expected repair time vs depth (this document’s tables).
2. **Discrete-event simulator** — peers with upload caps drawn from measured distributions; GCC drops/throttles; record stall rate vs \(N\) (**v1.6**).
3. **Harness** — extend `scripts/stress-peer-group.js` with **synthetic Opus-sized chunks** (v1.5–v1.6); optional video-sized payloads only after audio gate.

Feasibility argument (research): very large **concurrent** audiences imply ~6 relay hops at degree 8–16 with mostly **read-only** leaf peers; CPU per relay is dominated by crypto verify + memcpy, not re-encode. The bottleneck is **uplink on origin and first-tier relays**, mitigated by super-peers and adaptive degree — not a monolithic SFU bill. **No production dignity.js deploy validates this yet.**

---

## Milestone mapping (#152)

Aligned with [`roadmap.md`](./roadmap.md).

| Milestone | Status | Target |
|-----------|--------|--------|
| 1. Research doc | **Done** | v1.2.0 |
| 2. Browser transport | **Partial** | v1.4 — WebRTC signaling + DC; finish WebCodecs audio in **v1.5** |
| 3. Relay tree + churn | Not started | **v1.5** (audio) |
| 4. Private modes + combined | Skeleton only | **v1.7** |
| 5. Node origin (ffmpeg) | Not started | **v1.8** |
| 6. Adaptive video layers (240–1080p) | Documented only | **v2.0** (gated); 240/360/480 first slice |
| 7. Scale simulation + pilot metrics | Plan only | **v1.6** |

---

## References

- [WebCodecs](https://www.w3.org/TR/webcodecs/)
- [WebRTC GCC](https://datatracker.ietf.org/doc/html/rfc8888) / TWCC
- [RFC 9420 MLS](https://www.rfc-editor.org/rfc/rfc9420.html) (group key evolution)
- dignity.js `MessageSecurityService`, PeerGroup gossip, CQRS bulk relay tiers