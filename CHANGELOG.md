# Changelog

## dignity.js 1.19.0

Live browser AV pipeline (#159, #152): `AudioEncoder` Opus in `createBrowserCaptureSource` (`A0` track), `createWebCodecsAudioDecoder`, `createMsePlayer` (fMP4 append with `QuotaExceededError` trim), transport-backed playground capture over `WebRTCDataChannelTransport` + in-page peers. **RFC 8888** RTCP congestion feedback encode/decode and `rfc8888MetricsToReceiverReports`; **AV1 SVC** when `VideoEncoder.isConfigSupported` accepts `av01` with `scalabilityMode` (else simulcast); **WHIP RTP** H.264/Opus depacketization via `createWhipRtpFrameAssembler` wired into `createWhipIngest`.

## dignity.js 1.18.0

Optional native WebRTC peer for Node.js (milestone 10, #152): `createNodeWebRTCPeerFactory` on `dignity.js/node` with runtime `import()` of **node-datachannel** (MPL-2.0, preferred) or **werift** (MIT); optional `peerDependencies` only — `npm install dignity.js` does not install a WebRTC stack. `NodeWebRTCNetworkAdapter` matches `WebRTCDataChannelTransport` / WHIP `peerFactory` shapes; `createNodeStreamOrigin({ webrtc: 'auto' | { factory, peerIds } })` mirrors signed (and sealed) chunks over SCTP data channels. Example `npm run example:node-webrtc`; integration test gated by `RUN_NODE_WEBRTC_TESTS=1`. **Still deferred:** RFC 8888 TWCC on the wire, AV1 SVC, Opus/AudioEncoder and MSE from #159, WHIP RTP depacketization to frames without an app-side bridge.

## dignity.js 1.17.0

Browser capture and decode via WebCodecs (milestone 9, #152, #159): `detectWebCodecsSupport`, `selectVideoEncoderConfig`, `createBrowserCaptureSource` (`MediaStream` → `VideoEncoder` → signed media chunk v3), and `createWebCodecsDecoder` (verified chunks → `VideoDecoder`, keyframe gate on layer switch). Playground `stream-webcodecs-capture`; browser e2e includes `stream-capacity-relays` and WebCodecs capture (Chromium fake media; skips when WebCodecs is missing). H.264 preferred, VP8 fallback; optional simulcast encoders per ladder layer. **Deferred:** `AudioEncoder` / Opus path, MSE playout, native Node WebRTC peer.

## dignity.js 1.16.0

Capacity-aware relay child assignment (milestone 8, #152): `assignRelayChildBudget`, `selectRelayChildren`, `assignRelayChildren`; optional `childAssignment: 'capacity'` on `createPublicStreamRelay` and `runScaleSimulation`; benchmark [`docs/benchmarks/scale-simulation-capacity.json`](./docs/benchmarks/scale-simulation-capacity.json); playground `stream-capacity-relays`. Uniform `runScaleSimulation` output matches v1.14.0 JSON. Capacity profile (seed `1520714`) stall share ~0.205 (still `qualified`); effective hops at 10M viewers ~8 with ~8 mean child degree. Still deferred: WebCodecs/getUserMedia (#159), native Node WebRTC, RFC 8888 wire format, AV1 SVC.

## dignity.js 1.15.0

Stream signaling stress harness (milestone 7, #152): `--mediaChunks` on `scripts/stress-peer-group.js` (session id, sequence, payload hash over `InMemoryNetworkAdapter`); `npm run stress:stream-chunks`; benchmark [`docs/benchmarks/stream-signaling-stress.json`](./docs/benchmarks/stream-signaling-stress.json); stress tier D (~50 subscribers, full delivery ratio); streaming roadmap milestone 7 complete. The v1.14.0 `runScaleSimulation` `qualified` stall claim is unchanged. Still deferred: WebCodecs/getUserMedia (#159), native Node WebRTC, RFC 8888 wire format, AV1 SVC.

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