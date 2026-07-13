# Contributing to dignity.js

Thank you for helping improve dignity.js. This guide covers the basics for first-time contributors.

## Good first issues

New to the repo? Start here:

**[good first issues on GitHub](https://github.com/jose-compu/dignity.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)**

These are scoped tasks (docs, tests, small examples) that do not require deep P2P expertise.

## Development setup

```bash
git clone https://github.com/jose-compu/dignity.js.git
cd dignity.js
npm ci
npm test
```

Node.js **18+** is required (CI runs 18, 20, and 22).

## Before you open a PR

1. **Branch** from `main` (e.g. `feat/my-change` or `release/0.10`).
2. **Run tests:** `npm test` (or `npm run test:unit` for faster iteration).
3. **Match style:** follow existing patterns in the file you edit; keep diffs focused.
4. **Docs:** if you change public API behavior, update `docs/openapi-like.json` and run `npm run docs:api-reference` when applicable.
5. **No drive-by refactors** — one concern per PR when possible.

### Optional test targets

| Command | When |
| --- | --- |
| `npm run test:peer-group` | PeerGroup / CQRS changes |
| `RUN_STRESS_TESTS=1 npm run test:stress-peer-group` | Gossip scale harness |
| `npm run benchmark:quick` | Benchmark script changes |
| `npm run docs:check` | Docs asset changes |

## Reporting bugs

Use the [bug report template](https://github.com/jose-compu/dignity.js/issues/new?template=bug_report.yml). Include reproduction steps, Node/browser version, and expected vs actual behavior.

## Feature requests

Use the [feature request template](https://github.com/jose-compu/dignity.js/issues/new?template=feature_request.yml). Describe the use case and how it fits the dignity.js scalable data layer and replicated object model.

## Code of conduct

Be respectful in issues and PRs. Maintainers may close contributions that are hostile, spam, or unrelated to the project goals.

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
