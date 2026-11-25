# Dignity.js Examples

This directory contains standalone example scripts and consumer projects demonstrating `dignity.js` features in Node.js and TypeScript environments.

## Available Examples

### Minimal Tic-Tac-Toe Demo
* **File:** [`decentralized-tictactoe.js`](./decentralized-tictactoe.js)
* **Description:** Minimal terminal tic-tac-toe game demonstrating room discovery, object replication, owner updates, and broadcast scoping over in-memory peers.
* **Run Command:**
  ```bash
  npm run example:tictactoe
  ```
  or
  ```bash
  node examples/decentralized-tictactoe.js
  ```

### Decentralized Chess Lite Demo
* **File:** [`decentralized-chess-lite.js`](./decentralized-chess-lite.js)
* **Description:** Terminal chess game demonstrating credential-derived signing keys, room discovery, replicated match state, and move authorization.
* **Run Command:**
  ```bash
  npm run example:chess
  ```
  or
  ```bash
  node examples/decentralized-chess-lite.js
  ```

### Node.js public stream origin (experimental)
* **File:** [`node-stream-origin.js`](./node-stream-origin.js)
* **Description:** Console public broadcaster over a fixture file and `InMemoryStreamSignalingBus` (no ffmpeg required).
* **Run Command:**
  ```bash
  npm run example:node-stream
  ```
  or
  ```bash
  node examples/node-stream-origin.js
  ```
* **Import path:** `dignity.js/node` (`createNodeStreamOrigin`, `resolveNodeMediaIngest`).

### Adaptive layer simulation (experimental, v1.10.0)

Signed HD ladder chunks, scripted receiver reports, bandwidth estimator, and hysteresis layer selector (no ffmpeg).

* **Script:** [`adaptive-layer-sim.js`](./adaptive-layer-sim.js)
* **Run Command:**
  ```bash
  npm run example:adaptive-layer
  ```
  or
  ```bash
  node examples/adaptive-layer-sim.js
  ```

### Node.js framed stream origin (experimental, v1.9.0)

Annex-B or fMP4 stdout from ffmpeg is parsed into access units with `timestampMs` and `keyframe`; the example uses a mock ffmpeg child and the Annex-B fixture.

* **Script:** [`node-framed-stream-origin.js`](./node-framed-stream-origin.js)
* **Run Command:**
  ```bash
  npm run example:node-framed-stream
  ```
  or
  ```bash
  node examples/node-framed-stream-origin.js
  ```

### Node.js private stream origin (experimental)
* **File:** [`node-private-stream-origin.js`](./node-private-stream-origin.js)
* **Description:** `private-list` console origin over a fixture file; one listed recipient opens sealed bytes (no ffmpeg).
* **Run Command:**
  ```bash
  npm run example:node-private-stream
  ```
  or
  ```bash
  node examples/node-private-stream-origin.js
  ```

### TypeScript Consumer Project
* **Directory:** [`typescript-consumer/`](./typescript-consumer/)
* **Description:** Sample TypeScript project demonstrating type definitions, type safety, and verification rules compile-time checking.
* **Run Command:**
  ```bash
  npm run test:typescript
  ```
  or
  ```bash
  npx tsc --noEmit -p examples/typescript-consumer/tsconfig.json
  ```

## Browser Demos

For interactive browser applications using WebRTC and Dignity Apps runtime, see the following locations in the repository:

* **3D Chess Web App:** [`docs/chess/`](../docs/chess/) (run via `npm run build:chess` or `npm run docs:dev`)
* **Browser Tic-Tac-Toe Web App:** [`docs/tictactoe/`](../docs/tictactoe/) (run via `npm run build:tictactoe` or `npm run docs:dev`)
* **Dignity Apps Registry & Timeline:** [`docs/apps/`](../docs/apps/)
* **Live stream prototype (in-memory, experimental):** [`docs/live-stream-demo.html`](../docs/live-stream-demo.html) (v1.3.0 public chunk path only)