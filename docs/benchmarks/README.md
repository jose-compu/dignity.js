# Performance benchmarks (#92)

Reproducible numbers from the in-memory stress harness and IndexedDB hydration bench.

## Run locally

```bash
# Full suite (gossip 100 + tiered 50 + IndexedDB 100 / 1k / 2k records)
npm run benchmark

# Write committed results file
npm run benchmark:write

# Quick smoke (CI)
npm run benchmark:quick
```

## What is measured

| Suite | Metric | Harness |
| --- | --- | --- |
| Gossip epidemic | p50 / p90 / p99 delivery ms, delivery ratio, heap MB | `scripts/stress-peer-group.js` via `InMemoryNetworkAdapter` |
| IndexedDB hydrate | Total ms and ms/record | `fake-indexeddb` + `IndexedDBPersistence.hydrate()` |

## What is *not* measured here

- Real WebRTC latency (requires browser + TURN)
- 10k simultaneous PeerJS connections in one tab (use `heapPerSubscriberKb` to extrapolate)
- Cross-browser timing (see [browser-compatibility.md](./browser-compatibility.md))

Latest checked-in results: [`results.json`](./results.json).

## Scale simulation (v1.14.0)

Seeded fan-out model (`runScaleSimulation`) — not a WebRTC load test.

| File | Profile | Command |
| --- | --- | --- |
| [`scale-simulation.json`](./scale-simulation.json) | `ci` (committed from seed `1520714`) | `npm run example:scale-sim` |
| [`scale-simulation-offline.json`](./scale-simulation-offline.json) | `offline` (local generate) | `npm run scale:offline` with `SCALE_SIM_JSON=1` redirected to this file |

## Stream signaling stress (v1.15.0)

Synthetic chunk metadata over PeerGroup gossip (`InMemoryNetworkAdapter`), not media bytes.

| File | Command |
| --- | --- |
| [`stream-signaling-stress.json`](./stream-signaling-stress.json) | `npm run stress:stream-chunks` |
