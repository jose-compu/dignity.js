# Changelog

## dignity.js 1.12.0

Origin simulcast publish (milestone 5, #152): `publishSimulcastTick` on the public broadcaster, per-layer sequence numbers, multi-layer Node ingest frames, `normalizeSimulcastLayers`, `runSimulcastLoadTrace`, playground `stream-simulcast-load`, and `npm run example:simulcast-load`.

## dignity.js 1.11.0

Relay degradation (milestone 5 partial, #152): per-downstream relay layer policy from child receiver reports, playout buffer target guard before layer step-down, and filtered one-hop relay forwarding (signed and sealed chunks unchanged on the wire).

## dignity.js 1.10.0

Adaptive streaming control plane (milestone 5 partial, #152): HD/FHD rendition ladders, media chunk envelope version 3 with signed `rendition`, receiver reports, sender bandwidth estimator, and viewer layer selector with hysteresis. Playground `stream-adaptive-layers` and `npm run example:adaptive-layer`.