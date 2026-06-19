# Test Plan — CQRS & Scalability (v0.8.0)

**Branch:** `feat/cqrs-v0.8`  
**Target Release:** v0.8.0  
**Last Updated:** 2026-06-19

This document defines the detailed test strategy for the CQRS and per-publisher scalability features.

## 1. Scope

### In Scope for v0.8.0
- Per-publisher tiered PeerGroups (live core + bulk tail)
- Automatic domain event emission on commands
- Query-side replicas (`DignityQueryReplica`) and materialized views
- Event schema versioning
- Bulk relay election & presence
- View consistency verification (hash chains)
- Increased default `maxHops`

### Out of Scope (v0.9+)
- Full TypeScript definitions
- Production deployment runbooks
- Browser compatibility matrix

## 2. Test Pyramid

| Layer | Focus | Tools | Target Coverage |
|-------|-------|-------|-----------------|
| Unit | Core logic (event emission, view maintenance, hop counting) | Jest | ≥ 90% |
| Integration | Multi-node CQRS flows, replica sync | Jest + InMemoryNetwork | All major paths |
| Stress / Scale | 5k–50k subscribers, per-publisher isolation | `stress-peer-group.js` | Key scenarios |
| E2E (optional) | Browser-based replica + live spectator | Playwright (future) | Critical user journeys |

## 3. Detailed Test Areas

### 3.1 Per-Publisher Tiered PeerGroups (#80, #81, #85, #86)

**Goal:** Each publisher has an independent live core (default 5 000) and an unbounded bulk tail.

**Test Cases**

| ID | Description | Type | Priority |
|----|-------------|------|----------|
| T-001 | Default `realtimeCap` = 5000 per `groupId` | Unit | High |
| T-002 | `joinPeerGroup` with `tier: 'auto'` assigns live while under cap | Integration | High |
| T-003 | When live cap is reached, new joiners go to bulk for that publisher only | Integration | High |
| T-004 | One follower can be live on Alice and bulk on Bob simultaneously | Integration | High |
| T-005 | `publishToPeerGroup` with `tier: 'live'` only fans out to live core | Integration | High |
| T-006 | Bulk publish (`publishPeerGroupBulk`) delivers to bulk tail only | Integration | High |
| T-007 | `maxHops` default raised to 64 (or 128) | Unit | High |
| T-008 | Per-publisher `seenGossipIds` isolation (no cross-publisher dedup pollution) | Integration | Medium |
| T-009 | Stress: 10 publishers × (5k live + 10k bulk) — memory & delivery | Stress | High |

**Acceptance Criteria**
- No single global live seat pool.
- Each `groupId` maintains its own live count and tier assignment.

### 3.2 Automatic Domain Event Emission (#83)

**Goal:** Every write operation automatically emits a signed, versioned domain event.

**Test Cases**

| ID | Description | Type | Priority |
|----|-------------|------|----------|
| T-010 | `create` emits `record:created` event with correct schema version | Unit | High |
| T-011 | `update` emits `record:updated` with `baseVersion` and patch | Unit | High |
| T-012 | `remove` emits `record:removed` | Unit | High |
| T-013 | Ownership transfer emits `ownership:transferred` | Unit | High |
| T-014 | Events are signed with the current identity key (supports rotation) | Integration | High |
| T-015 | Events are published via `peer-group:gossip` with `innerMessageType: 'domain-event'` | Integration | High |

### 3.3 Query-Side Replicas & Materialized Views (#84)

**Goal:** `DignityQueryReplica` nodes maintain fast, local read views from events.

**Test Cases**

| ID | Description | Type | Priority |
|----|-------------|------|----------|
| T-016 | Replica starts with empty view and hydrates from events | Integration | High |
| T-017 | `read` and `list` on replica return data without contacting owner | Integration | High |
| T-018 | IndexedDB persistence layer is used for durable views | Integration | High |
| T-019 | In-memory hot cache serves sub-50 ms reads after hydration | Performance | High |
| T-020 | Replica ignores events for collections it is not interested in | Unit | Medium |
| T-021 | Replica can be started in read-only mode (no command capability) | Integration | High |

### 3.4 Event Schema Versioning (#88)

**Test Cases**

| ID | Description | Type | Priority |
|----|-------------|------|----------|
| T-022 | All domain events carry `schemaVersion` field | Unit | High |
| T-023 | Replicas ignore events with unknown future `schemaVersion` (graceful) | Integration | High |
| T-024 | Replicas can still process older schema versions | Integration | High |
| T-025 | Version bump does not break existing replicas | Integration | High |

### 3.5 Bulk Relay Election & Presence (#89)

**Test Cases**

| ID | Description | Type | Priority |
|----|-------------|------|----------|
| T-026 | Stable bulk relays are elected per `groupId` | Integration | High |
| T-027 | Bulk subscribers discover and connect to elected relays | Integration | High |
| T-028 | Relay failover when an elected relay leaves the group | Integration | Medium |
| T-029 | Presence metadata includes `role: 'bulk-relay'` | Unit | Medium |

### 3.6 View Consistency Verification (#90)

**Test Cases**

| ID | Description | Type | Priority |
|----|-------------|------|----------|
| T-030 | Each replica maintains a hash chain over applied events | Unit | High |
| T-031 | Replica can verify chain integrity on demand | Integration | High |
| T-032 | Tampered event breaks verification and emits `securityerror` | Integration | High |
| T-033 | Publisher publishes periodic checkpoint of the event hash root | Integration | Medium |

### 3.7 Stress & Scale Scenarios (Extension of #81)

**New scenarios for v0.8**

| Scenario | Publishers | Live / Bulk per publisher | Purpose |
|----------|------------|---------------------------|---------|
| S-01 | 1 | 5 000 / 10 000 | Mixed-tier baseline |
| S-02 | 10 | 5 000 / 10 000 | Per-publisher isolation at scale |
| S-03 | 3 | 5 000 / 0 | All-live small viral publishers |
| S-04 | 1 | 5 000 / 50 000 | Large bulk tail memory test |

**Metrics to capture**
- `liveDeliveryRatio`, `bulkDeliveryRatio`
- `bulkLagMs` (p50 / p95)
- `peakSeenGossipAcrossGroups`
- Memory (heapUsed) at steady state

## 4. Test Execution Strategy

1. **Unit tests** — run on every commit (`npm test`).
2. **Integration tests** — run on PR (`npm run test:peer-group`).
3. **Stress tests** — nightly or on-demand via `RUN_STRESS_TESTS=1`.
4. **Manual verification** — use the live playground + new CQRS demo scenarios.

## 5. Open Questions for Test Design

- Should bulk relays be elected deterministically or via gossip leader election?
- What is the exact format of the event hash chain root published by the owner?
- Do we need a separate `query` security context (lighter signing requirements)?

---

**Next step:** Implement the test harness extensions and the first set of unit tests for domain event emission.