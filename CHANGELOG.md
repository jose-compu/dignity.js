# Changelog

## dignity.js 1.14.0

Seeded scale simulation (milestone 7 partial, #152): `runScaleSimulation` with `ci` and `offline` profiles, benchmark JSON under `docs/benchmarks/`, playground `stream-scale-sim`, `npm run example:scale-sim` and `scale:offline`. PeerGroup signaling stress harness remains planned for 1.15.0.

## dignity.js 1.13.0

Standard ingest adapters (milestone 6, #152): pure-JS `demuxMpegTs`, Node `createMpegTsIngest`, `createHlsIngest`, `createRtmpIngest`, `createSrtIngest`, `createWhipIngest`, `ingest` option on `createNodeStreamOrigin`; playground `stream-ingest-mpegts`; `npm run example:ingest-mpegts` and `example:ingest-whip`.

## dignity.js 1.12.0

Origin simulcast publish (milestone 5, #152): `publishSimulcastTick` on the public broadcaster, per-layer sequence numbers, multi-layer Node ingest frames, `normalizeSimulcastLayers`, `runSimulcastLoadTrace`, playground `stream-simulcast-load`, and `npm run example:simulcast-load`.

## dignity.js 1.11.0

Relay degradation (milestone 5 partial, #152): per-downstream relay layer policy from child receiver reports, playout buffer target guard before layer step-down, and filtered one-hop relay forwarding (signed and sealed chunks unchanged on the wire).

## dignity.js 1.10.0

Adaptive streaming control plane (milestone 5 partial, #152): HD/FHD rendition ladders, media chunk envelope version 3 with signed `rendition`, receiver reports, sender bandwidth estimator, and viewer layer selector with hysteresis. Playground `stream-adaptive-layers` and `npm run example:adaptive-layer`.