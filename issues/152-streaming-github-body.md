<!-- Paste into https://github.com/jose-compu/dignity.js/issues/152 (edit issue body) -->
## Summary

Live peer-to-peer **audio-first** streaming, then evidence-gated **video (240p–1080p)**, as part of the dignity.js stack (identity, PoW, social/presence).

**Design:** [`docs/live-streaming-design.md`](https://github.com/jose-compu/dignity.js/blob/main/docs/live-streaming-design.md)

**Product roadmap:** [`docs/roadmap.md`](https://github.com/jose-compu/dignity.js/blob/main/docs/roadmap.md)

**Branches:** [`docs/git-branches.md`](https://github.com/jose-compu/dignity.js/blob/main/docs/git-branches.md) · next release branch: `release/1.5.0-radio-pilot`

## Requirements (unchanged intent)

- Live P2P audio and (later) video; origin browser or Node.
- Low latency (1–3 s public mass viewing acceptable for backup under congestion).
- **Video ABR ladder (v2.0):** 240p, 360p, 480p, 720p, 1080p — ship **240–480** first, then HD.
- Access modes: private-single, private-list, public, combined (E2E for private).
- Scale research: large concurrent audiences via relay trees (not a near-term production claim).

## Technical notes (2026-11 review)

- WebCodecs chunks + Ed25519 on data channels: viable for fan-out.
- Relay trees: **fanout 3**, adaptive degree; audio fits residential uplink; 1080p is relay-heavy.
- **TURN** required in production ([#95](https://github.com/jose-compu/dignity.js/issues/95) runbook).
- Generic HLS/VOD P2P backup: out of scope vs mature alternatives; dignity.js differentiates on **identity + social + live audio**.

## Research checklist

- [x] Topology, WebCodecs vs tracks, Node options, ABR/GCC, churn, signing, access control, scale plan → design doc.

## Phased milestones (aligned with roadmap)

| # | Milestone | Status | Target |
|---|-----------|--------|--------|
| 1 | Research doc | **Done** (v1.2.0) | |
| 2 | Browser transport (WebRTC DC + signaling) | **Done** (v1.4.x) | Signed chunks, join handshake |
| 3 | **Radio pilot:** WebCodecs Opus, multi-hop relay, churn v1, TURN ops | **Next** | **v1.5** |
| 4 | Overlay metrics / synthetic load / simulator | Planned | **v1.6** |
| 5 | Private audio E2E | Planned | **v1.7** |
| 6 | Node origin (ffmpeg) | Planned | **v1.8** |
| 7 | Video ABR 240–480p | Planned | **v2.0** (first slice) |
| 8 | Video ABR 720–1080p | Planned | **v2.0** (after metrics) |

## Progress log

- **v1.2.0:** design doc + stream access-mode validation API.
- **v1.3.0:** signed public chunks, one-hop relay, in-memory bus, demo page ([#156](https://github.com/jose-compu/dignity.js/pull/156)).
- **v1.4.x:** `WebRTCStreamSignalingBus`, `WebRTCDataChannelTransport`; milestone 2 (transport) complete.
- **Next (v1.5):** end-to-end **mono Opus** playout, relay tree >1 hop, churn re-parent, pilot kit for university radio.

Meta roadmap issue: [#87](https://github.com/jose-compu/dignity.js/issues/87).