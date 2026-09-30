---
title: "Dev builds never keep rendered pages on disk"
status: open
---

The 2026-10-01 benchmark restarted the debug engine on its disk cache, and it rendered all 1,512 pages again: 12.2 s, the same as its cold run. The release engine answered the same pages from disk in 0.10 s. The cause is in the code, not the cache: a dev build keeps answers on disk only when it was compiled with `AGENTKS_DEV_COMMIT` ([030/90](../030_rust-engine/90_memory-and-concurrency.md), decision of 2026-10-01). The code comment says `ctl build` sets it, but nothing sets it, and the engine does not say that its answers stay in memory. So every dev build a maintainer runs renders from scratch after each restart, silently.

# 01 To Do
- [ ] **Set `AGENTKS_DEV_COMMIT` in `ctl build engine`** (main repository, `scripts/build/engine.sh`) from `git rev-parse HEAD`.
    - [ ] A dirty working tree changes the code under one commit, which is the case the decision guards against. Decide how the id covers it: leave the variable unset on a dirty tree, or add a hash of the diff to the id. Record the choice in `04`.
    - [ ] Check that cargo rebuilds when the commit changes. `option_env!` is tracked by the compiler, but confirm it with two commits.
- [ ] **Say it when answers stay in memory.** `open_snapshot` (`apps/agentks-engine/crates/site/src/state/build.rs`) already returns notices. Add one when `persist` is false, naming the reason: a dev build without `AGENTKS_DEV_COMMIT`.
- [ ] **Correct the comment** on `DEV_COMMIT` in the same file, if the fix changes who sets the variable.
- [ ] **A test** that a dev build compiled with the variable reads its answers back after a restart. `store.rs` already has `a_persisted_answer_is_read_back_without_making_it_again`; the new test covers the path from the build flag to the store.

## Guardrails
- Keep the decision in 030/90: a dev build must never read another build's answers. The fix makes `ctl build` name its build, not make every dev build persist.
- Tests stay under a second.
- `./ctl gate` green.

## Done when
- `ctl build engine` (debug), then two runs of `data/bench/bench-run.sh apps/agentks-engine/target/debug/agentks <label>` with `cold` on the first: the second run's "every page once" total is at least ten times shorter than the first's.
- A dev build without the variable prints one notice saying its answers stay in memory.
- A dev build from a dirty tree never reads answers written by a build of the clean commit.

# 02 Status and Result
Open. Found by the 2026-10-01 benchmark; the cause is known and nothing is changed yet.

## Result
None yet.

## Agent log
none

# 03 References
- [Comment 005, performance metrics](../../comments/005_2026-10-01_performance-metrics.md) — the four benchmark runs.
- [030/90 memory and concurrency](../030_rust-engine/90_memory-and-concurrency.md) — the decision that dev builds persist only with a commit id.
- [040/40 build cache on disk](./40_build-cache-on-disk.md) — the cache, and the `+<commit>` engine folder (`engine_folder` in `crates/cache/src/disk.rs`).
- Main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `scripts/build/engine.sh`, `apps/agentks-engine/crates/site/src/state/build.rs` (`DEV_COMMIT`, `engine_build`), `crates/site/src/state/store.rs`. The benchmark kit is in `data/bench/`, which git ignores, so it exists on this machine only.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## 01 The runs

| Run | Every page once | p50 / p95 per page | RAM after |
|---|---|---|---|
| Debug, cold | 12.43 s | 1.18 / 32.9 ms | 372 MB |
| Debug, restart | 12.22 s | 1.13 / 33.7 ms | 373 MB |
| Release, cold | 1.33 s | 0.18 / 3.38 ms | 300 MB |
| Release, restart | 0.10 s | 0.04 / 0.19 ms | 58 MB |

## Watch out
- The debug build also renders about seven times slower than the release build (6.2 ms against 0.85 ms p50 for a first docs page). That part is normal for a debug build, and is not this bug.
