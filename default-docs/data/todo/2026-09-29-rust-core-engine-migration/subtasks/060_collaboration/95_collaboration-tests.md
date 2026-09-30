---
title: "Collaboration tests — convergence, reconnect, conflicts, access and load"
status: open
---

Live collaboration fails in ways a demo never shows: two edits at the same instant, a laptop that sleeps mid-edit, a file the AI changes while three people type, a key revoked during a session. This leaf builds the test suite that proves the collaboration group works and keeps working. It takes over subtask `03_sync-testing` of [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) (multi-tab concurrent edits, reconnection, conflict resolution) and extends it to access keys, disk merges, diagrams and load.

# 01 To Do
- [ ] **A headless test client** in Rust that speaks `hello`, `doc.join`, the binary sync frames and awareness ([060/20](./20_sync-protocol.md)), driven by scripts. Most tests use it; a few run real browsers.
- [ ] **Convergence (property test):** N clients (2–5) apply random inserts and deletes concurrently with random delays; after quiescence every client's text, the server document and — after write-back — the file on disk are identical. Run many seeds in CI.
- [ ] **Multi-tab concurrent edit** (from subtask 03): two tabs of one browser type into the same paragraph at once; both see the same result.
- [ ] **Reconnect** (from subtask 03): drop a client's socket mid-edit, keep typing offline, reconnect — edits merge, nothing duplicates. Also across a server restart (the epoch path, [060/10](./10_yrs-document-per-file.md)).
- [ ] **Conflict and disk merge** (from subtask 03 and [060/60](./60_disk-and-live-doc-merge.md)): an outside write during editing merges; an overlapping outside write raises the conflict notice and keeps the typed text.
- [ ] **Access:** a `read` key cannot change a document or the tracker; revoking closes the socket with `4401`; a wrong key is rate-limited ([060/40](./40_access-keys.md)).
- [ ] **Presence:** users appear and disappear; cursors follow; a crashed tab's cursor clears.
- [ ] **Diagrams:** the Excalidraw concurrent-move test and the draw.io double-save test from [060/80](./80_diagram-collaboration.md).
- [ ] **Tracker ops:** two clients, one status change, both tables update ([060/70](./70_tracker-live-edits.md)).
- [ ] **Load:** 10 clients on one document typing at human speed for 5 minutes; server CPU and memory stay within the budget [170/40](../170_testing/40_performance-budget.md) sets; update latency p95 under 100 ms on localhost.
- [ ] **Browser end-to-end** (Playwright, with [170/30](../170_testing/30_end-to-end.md)): two browser contexts, one with a share key, edit one page and see each other.

## Guardrails
- Tests use temp projects and a temp `AGENTKS_HOME`; they never touch the developer's real `~/.agentks`.
- Flaky tests are fixed or removed, never retried into passing.

## Done when
- The whole suite runs in CI on Linux on every change to the sync, server or editor code, and passes 20 consecutive runs without a flake.
- The property test has run at least 10,000 seeds once, locally, without a divergence.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository — Rust tests under `apps/agentks-engine/` (an integration-test crate or `tests/`), browser tests with the end-to-end suite.

**Read first:**
- The absorbed [03_sync-testing](../../../2026-04-10-sync-and-presence/subtasks/03_sync-testing.md).
- [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) — the test strategy and CI gates.
- Every other leaf in this group, for the behaviour under test.

**Depends on:** every other leaf of 060; [170/10](../170_testing/10_rust-tests.md) and [170/30](../170_testing/30_end-to-end.md) for the harness.
**Unblocks:** closing the collaboration group.

# 04 Decisions
- Decided (claude, 2026-09-30): convergence is checked by a randomised property test across text, server document and file on disk, not only by examples.

# 05 Notes & Analysis

## Watch out
- Make time injectable (autosave pause, unload delay, stale thresholds) so tests do not sleep.
