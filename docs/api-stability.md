# API stability guarantee (v1.0.0)

dignity.js **v1.0.0** declares the public npm API stable. This document defines what is frozen, what counts as a breaking change, and how deprecations are handled.

See also: [`types/index.d.ts`](../types/index.d.ts), [`docs/openapi-like.json`](./openapi-like.json), [`docs/threat-model.md`](./threat-model.md).

## Semver commitment

| Release | Policy |
|---------|--------|
| **1.x** | No breaking changes to the frozen surface below. New features ship as minor releases. Bug fixes and security patches ship as patch releases. |
| **2.0** | May remove APIs deprecated in 1.x with at least one minor release of advance notice. |

Package version follows [Semantic Versioning 2.0](https://semver.org/).

## What is frozen (public API)

Everything exported from the package entry points is stable unless marked otherwise:

| Entry | Surface |
|-------|---------|
| `dignity.js` | `DignityP2P` lifecycle, CRUD, proposals, verification, peers, identity, PeerGroups, CQRS helpers, Dignity Apps, signaling, network adapters, security helpers |
| `dignity.js/react` | `useDignity`, `useCollection`, `useObject`, `usePeers`, `useDiscovery`, `useConnectionStats`, `useRoom`, `useMessages` |

Authoritative inventories:

- TypeScript: [`types/index.d.ts`](../types/index.d.ts), [`types/react.d.ts`](../types/react.d.ts)
- Machine-readable: [`docs/openapi-like.json`](./openapi-like.json)
- Generated reference: [`docs/api-reference.md`](./api-reference.md)

### Event names

All events documented in `openapi-like.json` → `events`, `warningSubtypes`, `queryReplicaEvents`, and `dignityAppHostEvents` are stable. Payload shapes may gain optional fields in minors; required fields will not be removed without a major bump.

### Record and manifest shapes

`recordShape` and `manifestShape` in `openapi-like.json` define the stable wire and storage contracts for replicated objects and Dignity App manifests.

## Breaking vs non-breaking changes

### Breaking (requires 2.0)

- Removing or renaming an exported function, class, constant, or hook
- Changing required parameters or return types incompatibly
- Removing a documented event or changing a required event payload field
- Changing default security behavior in a way that breaks interoperability with 1.0 peers (e.g. disabling signing by default)
- Removing a `package.json` export subpath

### Non-breaking (allowed in 1.x minors/patches)

- Adding new optional exports, events, warning subtypes, or manifest fields
- Adding optional parameters with defaults
- Performance improvements and internal refactors with identical behavior
- Documentation and type-definition clarifications
- Stricter validation that rejects previously invalid inputs only

## Deprecation policy

1. **Announce** — deprecated APIs are documented in release notes and annotated in `types/*.d.ts` with `@deprecated` and a removal target (next major).
2. **Warn** — runtime `console.warn` on first use per session when practical.
3. **Support window** — deprecated APIs remain functional for at least **one full minor release** (e.g. deprecated in 1.1, removed no earlier than 2.0).
4. **Remove** — only in a major release (2.0+), with migration notes.

No public APIs are currently deprecated as of v1.0.0.

## Internal and non-guaranteed surfaces

Not covered by the stability guarantee:

- Deep imports outside `package.json` `exports` (e.g. `dignity.js/src/...`)
- Undocumented private methods on class instances
- Test helpers under `tests/`
- Docs site demo apps (`docs/chess/`, `docs/tictactoe/`, `docs/apps/`) — examples only
- Playground scripts (`docs/assets/playground*.js`)

## Migration from 0.x

v1.0.0 introduces **no intentional breaking runtime changes** from v0.14.0. Upgrade by bumping the dependency version. See closed issue #97 for the 0.7 → 1.0 migration guide.

TypeScript consumers on 0.14 can adopt 1.0 without code changes if they already use the published `types` fields.

## Reporting instability

If a minor or patch release changes behavior you rely on, file an issue with the expected vs actual API contract. Regressions against this document are treated as bugs.
