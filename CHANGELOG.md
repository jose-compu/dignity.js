# Changelog

## dignity.js 1.11.0

Relay degradation (milestone 5 partial, #152): per-downstream relay layer policy from child receiver reports, playout buffer target guard before layer step-down, and filtered one-hop relay forwarding (signed and sealed chunks unchanged on the wire).

## dignity.js 1.10.0

Adaptive streaming control plane (milestone 5 partial, #152): HD/FHD rendition ladders, media chunk envelope version 3 with signed `rendition`, receiver reports, sender bandwidth estimator, and viewer layer selector with hysteresis. Playground `stream-adaptive-layers` and `npm run example:adaptive-layer`.