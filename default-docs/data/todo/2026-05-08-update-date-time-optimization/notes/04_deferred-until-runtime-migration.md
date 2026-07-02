---
title: "Deferred until runtime migration — why and what stays valid"
sidebar_label: "Deferred"
---

# Deferred — implement during runtime migration phase 1

This issue's implementation work is **deferred** until the runtime stack migration ([`2026-05-08-runtime-stack-migration`](../../2026-05-08-runtime-stack-migration/issue.md)). The design (notes 01 and 02) and the comment-flow walkthroughs (001 and 002) stay as-is — they're the spec. Only the implementation pause changes.

## Why defer

| Reason | Detail |
|---|---|
| **Current scale doesn't bite** | ~12 tracker-touching commits → ~11 ms full walk → invisible to users today. The lag-projection only crosses the perceptibility threshold at ~3 K commits / 2 yr active use. We have time. |
| **The triggering bug evaporates** | The whole reason this got urgent was the SSR module-isolation incident (`notes/03_ssr-module-isolation.md`). In Go, that bug class is structurally impossible — single process, single module graph, single cache. Implementing the dual-invalidation pattern in Astro is patching a wound that won't exist after the migration. |
| **Implementing twice is wasteful** | Land it in `issue-dates.ts` (TypeScript / Astro) now → redo it in `internal/tracker/derived_dates.go` (Go) in 14–18 weeks. Same design, two implementations, same correctness risks both times. |
| **The design is the durable bit** | Notes 01 and 02 describe the algorithm (eager-incremental walk, `merge-base --is-ancestor` discriminator, branch-keyed persistent JSON, server-start pre-warm, watcher reconciliation). That description is language-agnostic. It ports verbatim into Go. |

## What stays valid

These notes / comments need **zero** revision when work resumes under the runtime migration:

- `notes/01_design-and-rationale.md` — architecture, current-vs-proposed comparison, edge-case handling.
- `notes/02_walkthrough.md` — step-by-step timeline diagrams for every scenario.
- `comments/001_current-commit-flow.md` — current (Astro lazy) flow.
- `comments/002_post-incremental-flow.md` — proposed flow.
- The 3 subtasks (`01_eager-incremental-refresh.md`, `02_branch-keyed-persistent-cache.md`, `03_watcher-debounce-and-edge-polish.md`) — semantic split survives; only the language changes.

## What's now obsolete

- `notes/03_ssr-module-isolation.md` — describes a fix for a Vite-specific bug class. **Becomes irrelevant after the runtime migration** (Go has no SSR module isolation). Kept as historical record + a warning sign for any future framework that introduces similar isolation.

## What changes when work resumes

The "implementation surface" target changes:

| Today's target | Post-migration target |
|---|---|
| `astro-doc-code/src/loaders/issue-dates.ts` (TypeScript) | `internal/tracker/derived_dates.go` (Go) |
| `astro-doc-code/src/dev-tools/integration.ts` (watcher wiring) | `internal/watcher/watcher.go` + tracker package |
| `cache.delete()` + `moduleGraph.invalidateModule` | A single `sync.Map.Delete` call. No SSR isolation; no dual-invalidation needed. |
| `chokidar` + custom `.git/HEAD` watching | `fsnotify` + same logic |
| Per-branch JSON under `.cache/<repo>/<branch>.json` | Same path, same shape. Still valid. |
| `git log --no-merges --name-only --pretty=format:'§%aI' -- <tracker>` | Same command. Either shell out or use `gix-go` for native Go. |

The code changes language; the algorithm doesn't.

## Action

- **Status:** keep `open` with `blocked` label. Issue surfaces in the queue but is flagged as not-actively-workable.
- **Subtasks:** stay open. They describe what work needs to happen; that's still true. Just not in TypeScript.
- **Implementation order under the runtime migration:**
  - Phase 1 of the migration (Go runtime core) ports the tracker loader. The eager-incremental cache lands at the same time — not as "lazy first, optimise later," but as the initial implementation. The design is firm enough that there's no value in shipping a placeholder.
- **No interim work:** explicitly do not patch `issue-dates.ts` further. The dual-invalidation pattern (notes 03) is the last patch this file gets in TypeScript.

## When this should be revived early

If any of these become true *before* migration phase 1 ships, lift the deferral:

- Tracker grows past ~500 commits and lag becomes felt
- A new bug appears in the lazy cache that can't be fixed by the dual-invalidation pattern
- Someone's branch-switching workflow is hitting full rebuilds frequently enough to feel slow
- Migration plans collapse (Astro stays for the foreseeable future)

If none of these happen, the next code touch on derived-`updated` is in Go.

## Cross-reference

- Successor: [`2026-05-08-runtime-stack-migration`](../../2026-05-08-runtime-stack-migration/issue.md)
- Specifically: [`brainstorm/04_discuss_stack-and-migration/03_migration.md` (phase 1)](../../2026-05-08-runtime-stack-migration/brainstorm/04_discuss_stack-and-migration/03_migration.md) lists tracker derived-updated cache as a phase-1 deliverable.
