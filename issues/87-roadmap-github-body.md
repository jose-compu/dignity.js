<!-- Paste into https://github.com/jose-compu/dignity.js/issues/87 (edit issue body) -->
# Roadmap (post–v1.0)

**Source of truth:** [`docs/roadmap.md`](https://github.com/jose-compu/dignity.js/blob/main/docs/roadmap.md) on `main` (audio-first pilots, video evidence-gated).

**Git branches:** [`docs/git-branches.md`](https://github.com/jose-compu/dignity.js/blob/main/docs/git-branches.md)

**Last updated:** 2026-11-22

## North star

| Priority | Product |
|----------|---------|
| **P0** | Live P2P **mono radio** + presence/chat on same runtime |
| **P1** | Private audio (E2E) |
| **P2** | Live video ABR **240p → 1080p** (after overlay metrics) |

## Release plan (summary)

| Version | Theme | Tracking |
|---------|-------|----------|
| **v1.4.1** (current) | WebRTC signaling + data channels, signed chunks | [#152](https://github.com/jose-compu/dignity.js/issues/152) |
| **v1.5** | Radio pilot ready (Opus, multi-hop relay, churn, TURN runbook) | #152 · branch `release/1.5.0-radio-pilot` |
| **v1.6** | Overlay telemetry + simulators (video gate) | #152 |
| **v1.7** | Private audio modes | #152 |
| **v1.8–v1.9** | Node/ffmpeg origin, streaming leaving `@experimental` | #152, [#95](https://github.com/jose-compu/dignity.js/issues/95) |
| **v2.0** | Video ABR 240/360/480 then 720/1080 | #152 · [`live-streaming-design.md`](https://github.com/jose-compu/dignity.js/blob/main/docs/live-streaming-design.md) |

## Shipped (pre–v1.4 meta)

| Version | Theme |
|---------|--------|
| **v1.0.0** | Stable API (#94), threat model (#96), migration (#97) |
| **v0.14.0** | TypeScript (#14), runbook (#95), audit (#124) |

Older history: [`README.md`](https://github.com/jose-compu/dignity.js/blob/main/README.md) changelog.

---

This issue tracks **meta roadmap** alignment. Implementation detail for live AV: **#152**.