---
title: "Performance budget — engine start-up, memory, render, build and size"
status: open
---

One reason for the migration is performance: today's engine holds 874 MB of memory after 24 minutes and needs 419 MB of `node_modules` per project. This leaf measures the new engine on the full corpus, sets a budget for each number, and fails CI when a change breaks the budget. It owns the engine and binary side. The browser side (bundle size, first paint, navigation) is owned by [090/80 perf budget checks](../090_frontend-performance/80_perf-budget-checks.md); both report into the same file.

# 01 To Do
- [ ] **A measurement harness.** `ctl perf` runs on the pinned corpus from [20](./20_route-and-content-parity.md) and writes `data/reports/perf/<date>.json`:
    - [ ] **Start-up:** time from `agentks start` to the first `manifest` answer, cold (empty build cache) and warm (filled build cache).
    - [ ] **Render:** time to answer a `page` request, uncached and cached, as the median and the 95th percentile over every page.
    - [ ] **Change to push:** time from a file write to the pushed hash message, for a plain page and for a page embedded by others.
    - [ ] **Memory:** resident memory after start-up, and after a 30-minute soak that opens every page and edits 100 files.
    - [ ] **Build:** `agentks build` time for the corpus, cold and warm (Phase 3).
    - [ ] **Size:** the release binary per platform, compressed and uncompressed.
    - [ ] **Build cache:** its size on disk for the corpus.
- [ ] **Set the budgets** from the first green measurement, as the measured value plus a margin, and write them into `tests/perf/budget.yaml`. Record the first numbers in this leaf's Result.
- [ ] **A CI job** runs `ctl perf` on a fixed runner type and fails when a number exceeds its budget or grows more than 10% over the last default-branch run. Timing jobs run three times and use the median, so noise does not fail a build.
- [ ] **State the binary size in each release note**, as the distribution note requires ([160/10](../160_distribution/10_installer-and-release-workflow.md)).
- [ ] **Re-measure today's engine** once on the same machine and corpus, so the release note can compare like with like. The audit's numbers predate the Astro 7 upgrade and must not be quoted as current.

## Guardrails
- A budget can be raised only in a change that says why, in the commit message and in this leaf's Decisions.
- Never tune for the benchmark alone (for example caching only the corpus pages). The harness uses the whole corpus.

## Done when
- `ctl perf` produces the report on the corpus.
- `tests/perf/budget.yaml` holds a budget for every number above.
- The perf CI job fails on a deliberately slowed change (add a 50 ms sleep to page rendering) and passes without it.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `tests/perf/` and `ctl` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`).
- **Read first:**
  - [Performance and size](../../brainstorm/01_initial-discussion/13_performance-and-size.md) — today's numbers and the audit's Go prototype (1.83 ms per page uncached, 13.9 MB for the whole corpus in memory).
  - [Why and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md) — where those numbers come from.
  - [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 06 (size).
  - [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md).
- **Depends on:** [170/20 route and content parity](./20_route-and-content-parity.md) (a correct engine and the pinned corpus), [030/90 memory and concurrency](../030_rust-engine/90_memory-and-concurrency.md).
- **Unblocks:** the 1.0.0 release note's performance section.

# 04 Decisions
- Decided (claude, 2026-09-30): budgets are set from the first correct measurement plus a margin, not guessed in advance, because a guessed number is either meaningless or blocks work for no reason.
- Decided (claude, 2026-09-30): a regression of more than 10% against the last default-branch run fails CI, with timings taken as the median of three runs.

# 05 Notes & Analysis

## 01 Reference numbers

| Measure | Today (Astro, pre-7 audit) | Audit's Go prototype |
|---|---|---|
| Install footprint | 419 MB `node_modules` per project | one binary |
| Memory | 874 MB after 24 minutes | 13.9 MB for the corpus |
| Page render | 6–9 ms first byte in dev | 1.83 ms uncached |

## Watch out
- CI runners vary. Keep the perf job on one runner type and compare against its own history, not against a laptop.
- Memory in Rust is not only the heap: count the embedded bundles once, and check the in-memory cache respects its byte budget ([040/30](../040_caching/30_in-memory-cache.md)).
