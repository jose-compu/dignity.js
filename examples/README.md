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
