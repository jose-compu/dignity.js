# Git branches and releases

How version work maps to branches, tags, and tracking issues. Product order lives in [`roadmap.md`](./roadmap.md); streaming detail in [`live-streaming-design.md`](./live-streaming-design.md).

## Default flow

1. Branch from `main`.
2. Open a PR into `main` (CI runs on `main` and `release/**` — see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).
3. After merge, cut a **release branch** only when preparing a semver tag (see below).
4. Push a tag `vX.Y.Z` matching `package.json`; publish workflow runs on `v*` tags.

Do **not** name a branch `cursor` or put `cursor` in the name ([`AGENTS.md`](../AGENTS.md)).

## Branch name patterns

| Pattern | Use |
|---------|-----|
| `feat/<topic>` | Features and API changes (e.g. `feat/streaming-relay-tree`) |
| `fix/<topic>` | Bug fixes |
| `docs/<topic>` | Documentation-only (e.g. `docs/audio-first-roadmap`) |
| `release/<semver[-theme]>` | Stabilization before tag (e.g. `release/1.5.0-radio-pilot`) |
| `chore/<topic>` | Tooling, deps, CI |

Keep names lowercase; use hyphens, not underscores.

## Post–v1.4 roadmap → suggested branches

Work should land on `main` via PR. Optional **release branches** while hardening a minor before tag:

| Target | Suggested release branch | Tracking | Primary doc |
|--------|--------------------------|----------|-------------|
| **v1.5** radio pilot | `release/1.5.0-radio-pilot` | [#152](https://github.com/jose-compu/dignity.js/issues/152) | `roadmap.md` § v1.5 |
| **v1.6** overlay metrics | `release/1.6.0-overlay-metrics` | [#152](https://github.com/jose-compu/dignity.js/issues/152) | `roadmap.md` § v1.6 |
| **v1.7** private audio | `release/1.7.0-private-audio` | [#152](https://github.com/jose-compu/dignity.js/issues/152) | `roadmap.md` § v1.7 |
| **v1.8–v1.9** platform | `release/1.8.0-node-origin` (split as needed) | [#152](https://github.com/jose-compu/dignity.js/issues/152) | `roadmap.md` |
| **v2.0** video ABR | `release/2.0.0-video-abr` | [#152](https://github.com/jose-compu/dignity.js/issues/152) | `live-streaming-design.md` ladder |
| Meta / multi-theme | — | [#87](https://github.com/jose-compu/dignity.js/issues/87) | `roadmap.md` |

Feature branches can be shorter (`feat/stream-opus-playout`) and merge before the release branch is cut.

## Docs site branch

The optional GitHub Pages **`docs`** git branch (not `main/docs/`) is described in [`scripts/setup-docs-branch.sh`](../scripts/setup-docs-branch.sh). Site content in-repo lives under `/docs` on `main`; do not confuse that folder with the `docs` branch name.

## Related issues

| Issue | Role |
|-------|------|
| [#87](https://github.com/jose-compu/dignity.js/issues/87) | Meta roadmap (post–v1.0); points at `docs/roadmap.md`. Suggested body: [`issues/87-roadmap-github-body.md`](../issues/87-roadmap-github-body.md) |
| [#152](https://github.com/jose-compu/dignity.js/issues/152) | Live P2P AV milestones and acceptance. Suggested body: [`issues/152-streaming-github-body.md`](../issues/152-streaming-github-body.md) |
| [#95](https://github.com/jose-compu/dignity.js/issues/95) | Production runbook (TURN, streaming ops) |