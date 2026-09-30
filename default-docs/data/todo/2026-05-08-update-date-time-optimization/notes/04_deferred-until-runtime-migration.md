---
title: "Deferred until the engine migration — why and what stays valid"
sidebar_label: "Deferred"
---

# Deferred — implement in the engine migration's Phase 1

This issue's implementation work is **deferred** until the engine migration to Rust ([2026-09-29-rust-core-engine-migration](../../2026-09-29-rust-core-engine-migration/issue.md)). The design (notes 01 and 02) and the comment-flow walkthroughs (001 and 002) stay as they are — they are the spec. Only the implementation target changes.

## Why defer

| Reason | Detail |
|---|---|
| **Current scale doesn't bite** | ~12 tracker-touching commits → ~11 ms full walk → invisible to users today. The lag-projection only crosses the perceptibility threshold at ~3 K commits / 2 yr active use. We have time. |
| **The triggering bug is fixed** | The urgency came from the SSR module-isolation incident (`notes/03_ssr-module-isolation.md`). It was fixed in [2026-08-07-astro-7-and-load-time-refactor](../../2026-08-07-astro-7-and-load-time-refactor/issue.md), and the Rust engine has no SSR module isolation at all: one process, one index, one cache. |
| **Implementing twice is wasteful** | Landing it in `issue-dates.ts` (TypeScript / Astro) now means redoing it in the Rust engine's tracker module. Same design, two implementations, the same correctness risks twice. |
| **The design is the durable bit** | Notes 01 and 02 describe the algorithm (eager-incremental walk, `merge-base --is-ancestor` discriminator, branch-keyed persistent cache, server-start pre-warm, watcher reconciliation). That description is language-agnostic and ports to Rust unchanged. |

## What stays valid

These need **no** revision when work resumes under the migration:

- `notes/01_design-and-rationale.md` — architecture, current-vs-proposed comparison, edge-case handling.
- `notes/02_walkthrough.md` — step-by-step timeline diagrams for every scenario.
- `comments/001_current-commit-flow.md` — current (Astro lazy) flow.
- `comments/002_post-incremental-flow.md` — proposed flow.
- The 3 subtasks (`01_eager-incremental-refresh.md`, `02_branch-keyed-persistent-cache.md`, `03_watcher-debounce-and-edge-polish.md`) — the split survives; only the language and the cache location change.

## What's now obsolete

- `notes/03_ssr-module-isolation.md` — describes a fix for a Vite-specific bug class that the Rust engine does not have. Kept as a record, and as a warning for any future framework with similar isolation.

## What changes when work resumes

| Today's target | Target in the Rust engine |
|---|---|
| `agent-ks-engine/src/loaders/issue-dates.ts` (TypeScript) | The Rust engine's tracker module, shared with the CLI |
| `agent-ks-engine/src/dev-tools/integration.ts` (watcher wiring) | The Rust engine's file watcher (`notify`) |
| `cache.delete()` + `moduleGraph.invalidateModule` | One removal from the engine's index. No dual invalidation |
| `chokidar` + custom `.git/HEAD` watching | `notify` + the same `.git/HEAD` logic |
| Per-branch JSON under `.cache/<repo>/<branch>.json` | The per-project build cache, `~/.agentks/build-cache/<project hash>/`, keyed by branch; the migration proposes the engine version in the key too ([the build cache note](../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md)) |
| `git log --no-merges --name-only --pretty=format:'§%aI' -- <tracker>` | Same command, run from Rust, or a native Rust git library |

The code changes language; the algorithm doesn't.

## Action

- **Status:** keep deferred. The issue surfaces in the queue but is not actively workable.
- **Subtasks:** stay open. They describe work that still needs to happen, in Rust.
- **Implementation order:** Phase 1 of the migration ports the tracker loader to Rust. The eager-incremental cache lands at the same time, as the first implementation rather than "lazy first, optimise later".
- **No interim work:** do not patch `issue-dates.ts` further.

## When this should be revived early

Lift the deferral if any of these becomes true before the migration's Phase 1 ships:

- The tracker grows past ~500 commits and the lag becomes felt.
- A new bug appears in the lazy cache that the current dual-invalidation pattern cannot fix.
- Branch switching triggers full rebuilds often enough to feel slow.
- The migration is dropped and Astro stays for the foreseeable future.

## Cross-reference

- Successor: [2026-09-29-rust-core-engine-migration](../../2026-09-29-rust-core-engine-migration/issue.md). Its [impact note](../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/18_impact-on-other-issues.md) lists this issue.
- The earlier Go plan, [2026-05-08-runtime-stack-migration](../../2026-05-08-runtime-stack-migration/issue.md), is superseded.
