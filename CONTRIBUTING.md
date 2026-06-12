# Contributing to dignity.js

Thanks for helping improve dignity.js. Keep contributions small, focused, and
easy to review.

## Prerequisites

- Node.js 18 or newer
- npm

## Local Setup

```bash
git clone https://github.com/jose-compu/dignity.js.git
cd dignity.js
npm install
```

## Validate Your Change

Run the checks that match your change before opening a pull request.

| Command | When to use it |
| --- | --- |
| `npm test` | Full Jest suite with coverage; use before most PRs. |
| `npm run test:unit` | Faster unit-test pass for source-only changes. |
| `npm run build` | Required when library source or package output changes. |
| `npm run docs:dev` | Preview docs and the chess demo locally. |
| `npm run docs:check` | Verify generated docs assets exist. |
| `npm run example:tictactoe` | Smoke-test the tic-tac-toe example. |
| `npm run example:chess` | Smoke-test the lightweight chess example. |

The docs server prints local URLs when it starts. Use
`DOCS_NO_OPEN=1 npm run docs:dev` if you do not want it to open a browser.

## Find a First Task

Good first issues are listed here:

https://github.com/jose-compu/dignity.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

Pick one issue, keep the PR scoped to that issue, and mention the issue number
in the PR description.

## Code Style

- Match the naming and test style already used in `src/` and `tests/`.
- Add or update tests when behavior changes.
- Keep docs examples runnable and based on mock or local data.
- Avoid unrelated formatting cleanup.
- Do not add AI co-author trailers to commits.

## Pull Request Checklist

- [ ] The PR has a clear summary and linked issue.
- [ ] Relevant tests or docs checks were run.
- [ ] `npm run build` was run for source or package-output changes.
- [ ] The diff is small and focused.
- [ ] No secrets, private credentials, or generated local reports are included.
