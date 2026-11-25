# Live P2P video and audio — design document (v1.2.0)

**Status:** Research plus an experimental API. **v1.3.0** adds a minimal **public-mode** signed chunk path over an injectable signaling bus (unit-tested; see `src/streaming/public-stream-path.js`). There is still **no** WebRTC media track wiring, camera capture demo, private E2E keys, relay trees at scale, or ABR. This document records topology, security, and scale assumptions for [issue #152](https://github.com/jose-compu/dignity.js/issues/152).

## Goals

- Browser or Node.js **origin** (broadcaster).
- **Low end-to-end latency** for live A/V.
- **720p (HD)** and **1080p (Full HD)** with congestion-adaptive quality.
- **Access modes:** private (single or list), public, and combined public plus private tracks.
- Design exploration toward **10 million concurrent viewers** without a central SFU for the entire audience.

## Honest scope statement

v1.2.0 added the design write-up and `StreamSession` access-mode validation. **v1.3.0** adds:

1. `createSignedMediaChunk` / `verifyMediaChunk` (Ed25519 over chunk metadata + payload hash).
2. `createPublicStreamBroadcaster`, `createPublicStreamViewer`, and `createPublicStreamRelay` over `InMemoryStreamSignalingBus` (join handshake + one relay hop).
3. Optional demo: [`docs/live-stream-demo.html`](./live-stream-demo.html) (in-memory simulation only).

There is still **no** encoder pipeline and **no** WebRTC `RTCPeerConnection` media wiring in the library.

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

Example planning numbers (signaling + chunk metadata only; actual degree is **adaptive** per peer upload capacity):

| Target \(N\) | Degree \(d\) | Min hops \(h = \lceil \log_d N \rceil\) |
|-------------|--------------|----------------------------------------|
| 10,000      | 8            | 5                                      |
| 1,000,000   | 12           | 6                                      |
| 10,000,000  | 16           | 6                                      |

**Per-hop latency:** each relay adds encode/decode (if transcoding) or packetization delay, jitter buffer, and one RTT bucket for control. Budget **20–80 ms** per hop for chunked WebCodecs over data channels (no transcoding), or **40–120 ms** if a relay re-encodes. A 6-hop tree therefore adds roughly **120–480 ms** on top of capture and playout — within reach of interactive live targets if origin–leaf depth stays ≤ 6 and peers run GCC/TWCC-aware forwarding.

### Churn and repair

- Peers heartbeat upstream relays; on timeout, children **re-parent** using dignity.js presence + PeerGroup announcements (same signaling fabric as object replication).
- **Siblings** hold a short overlap buffer (2–4 s) to absorb gap on re-parent.
- Optional **super-peers** — high-bandwidth, long-lived nodes (could be dignity.js “bulk relay” tier extended to media) take more children.
- Optional **TURN** only for NAT traversal, not for fan-out (TURN is not scalable to 10M; it is a last resort for blocked UDP).

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

**v1.7.0 (milestone 4, partial)** shipped the public Node origin on `dignity.js/node` (file/ffmpeg ingest, `PublicStreamBroadcaster` only).

**v1.8.0 (milestone 4, continued)** extends `createNodeStreamOrigin` to `private-single`, `private-list`, and `combined`: sealed private chunks (and a signed `layerId: 'public'` chunk per frame in combined mode) fan out on the injectable bus as `stream:media-chunk`; join accept/reject uses `session.canJoin`; optional `WebRTCDataChannelTransport.sendChunk` mirrors the same chunks; `rotateRecipients()` advances the private sender-key epoch after removing a recipient. Public mode still uses `PublicStreamBroadcaster`.

- `createFileMediaIngest` / `createFfmpegMediaIngest` (injectable `spawn`; ffmpeg is **not** an npm dependency).
- `resolveNodeMediaIngest` — ffmpeg when a probe succeeds; otherwise file bytes in fixed chunks.

**v1.9.0 (milestone 4, framing)** adds browser-safe `parseAnnexBAccessUnits` / `parseFmp4Fragments` on the main bundle; `createFfmpegMediaIngest` defaults to fragmented MP4 or Annex-B stdout and yields frames with `timestampMs` and `keyframe`. Signed chunks use media envelope **version 2** (`keyframe` in the signature); v1.8.0 chunks still verify. Native Node WebRTC peer remains deferred; `dataChannelTransport` stays injectable.

Examples: `npm run example:node-stream` (public), `npm run example:node-private-stream`, `npm run example:node-framed-stream` (Annex-B fixture + mock ffmpeg).

### WebRTC tracks vs data-channel chunking

| Approach | Pros | Cons |
|----------|------|------|
| Media tracks | Mature browsers, built-in jitter buffers | Hard to multi-cast one encoded bitstream to many children without SFU |
| WebCodecs + chunks over SCTP | One encode, many forwards; fits tree fan-out | More application logic; MSE/AudioWorklet playout |

**Plan:** hybrid — WebCodecs chunking over dignity.js-secured data channels for scale; optional direct tracks for low-latency private 1:1.

---

## Latency budget (720p / 1080p live)

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

Assuming 30 fps live; actual rates adapt via TWCC/GCC feedback.

### HD 720p

| Layer | Resolution | Video kbps | Audio kbps |
|-------|------------|------------|------------|
| L0    | 640×360    | 400        | 48         |
| L1    | 1280×720   | 1,800      | 64         |
| L2    | 1280×720   | 3,000      | 96 (stereo)|

### Full HD 1080p

| Layer | Resolution | Video kbps | Audio kbps |
|-------|------------|------------|------------|
| L0    | 854×480    | 800        | 48         |
| L1    | 1920×1080  | 4,500      | 96         |
| L2    | 1920×1080  | 8,000      | 128        |

**Simulcast / SVC:** origin emits L0–L2; relays prefer forwarding a single layer per subtree based on downstream TWCC. **SVC (AV1 temporal/spatial)** reduces uplink on origin when browsers support it.

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

**v1.5.0** added sender-key wrapping for `private-single` and `private-list` via `sealPrivateMediaChunk` / `openPrivateMediaChunk` (signed ciphertext envelope; relays verify without plaintext).

**v1.6.0** adds `combined` for the private layer (public layer remains signed clear chunks in the same `sessionId`), plus `createPrivateSenderKeyEpoch` / `rotatePrivateSenderKeyEpoch` so removed allowlist members cannot open chunks sealed after rotation. MLS-style group evolution for large rosters remains future work.

---

## Benchmark / simulation plan (10M justification)

Before claiming production readiness at 10M:

1. **Analytic model** — random \(d\)-ary trees with churn; measure expected repair time vs depth (this document’s tables).
2. **Discrete-event simulator** — peers with upload caps drawn from measured distributions; GCC drops/throttles; record stall rate vs \(N\).
3. **Harness** — extend existing peer-group stress scripts (`stress:peer-group`) with synthetic chunk publishers (no real video) to validate signaling load.

Feasibility argument: 10M **concurrent** viewers implies ~6 relay hops at degree 16 with mostly **read-only** leaf peers; CPU per relay is dominated by crypto verify + memcpy, not re-encode. The bottleneck is **uplink on origin and first-tier relays**, mitigated by super-peers and adaptive degree — not a monolithic SFU bill.

---

## Milestone mapping (#152)

| Milestone | Status |
|-----------|--------|
| 1. Research doc | **Done** (this file, v1.2.0) |
| 2. Prototype browser origin | **Partial (v1.3.0)** — public-mode signed chunks + join handshake over injectable bus; no real A/V capture |
| 3. Private modes + combined | **Done (v1.6.0)** — E2E sealed chunks for `private-single` / `private-list` / `combined`; sender-key epoch rotation on removal |
| 4. Node origin | **Done (v1.9.0)** — public + private/combined on `dignity.js/node`; file ingest or ffmpeg-framed Annex-B/fMP4; native Node WebRTC peer **deferred** |
| 5. Adaptive layer | Documented only |
| 6. Scale simulation | Plan documented |

---

## References

- [WebCodecs](https://www.w3.org/TR/webcodecs/)
- [WebRTC GCC](https://datatracker.ietf.org/doc/html/rfc8888) / TWCC
- [RFC 9420 MLS](https://www.rfc-editor.org/rfc/rfc9420.html) (group key evolution)
- dignity.js `MessageSecurityService`, PeerGroup gossip, CQRS bulk relay tiers