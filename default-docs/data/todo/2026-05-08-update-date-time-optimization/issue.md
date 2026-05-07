## Goal

Scale the derived-`updated` cache loader (`astro-doc-code/src/loaders/issue-dates.ts`) so it stays imperceptible at 3 K+ issues / 10 K+ tracker-touching commits, and across server restarts and branch switches. Today's lazy in-memory cache works fine at this repo's scale (~11 ms full walks), but the cost is paid on the **request path** — at projected scale (~500 ms / ~2.5 s walks) the lag becomes user-visible.

The frontend rendering side of this work (relative-time formatting in the layouts) already landed as [subtask 11 of `2026-05-07-tracker-mental-model-alignment`](../2026-05-07-tracker-mental-model-alignment/subtasks/11_relative-time-rendering.md). This issue is purely the backend cache-scaling story.

## Design — branch-keyed persistent cache with eager incremental update

Two notes cover the design:
- [`notes/01_design-and-rationale.md`](./notes/01_design-and-rationale.md) — architecture + current-vs-proposed comparison + edge-case handling.
- [`notes/02_walkthrough.md`](./notes/02_walkthrough.md) — step-by-step timeline diagrams with concrete timings for every scenario (server start, commits, branch switches, page renders).

Short version:

- **Eager** instead of lazy: the watcher itself does the diff walk and patches the cache, so reads never block on git.
- **Incremental** instead of full: walk only `<lastHash>..HEAD` (~15 ms typical) instead of all history (~500 ms).
- **Persistent** to disk under `.cache/<repo>/<branch>.json` so server restarts don't lose state.
- **Branch-keyed**: one cache file per branch; switching to an already-seen branch becomes a load + diff-walk instead of a full rebuild.

After this lands: ~24 s/day of cumulative request-path blocking → ~0 s.

## Subtasks at a glance

- **01 — Eager incremental refresh (in-memory).** Replace `cache.delete()` with stale-flag; watcher handler does sync `<lastHash>..HEAD` walk; `merge-base --is-ancestor` discriminator handles non-linear moves. Validates the diff-walk engine. **Core; lands first.**
- **02 — Branch-keyed persistent cache + server-start pre-warm.** `.cache/<repo>/<branch>.json` files; atomic writes; load on server start; branch-switch fast path; orphan-branch GC; schema versioning. **Core; depends on 01.**
- **03 — Watcher debounce + edge polish (optional).** 100 ms debounce for rebase/fixup bursts; single-flight lock; detached-HEAD transitions. Land if scripted-git-ops churn is felt; otherwise skip.

## Ordering

1. Land **01** — diff-walk in-memory, no disk yet.
2. Land **02** — adds branch-keyed persistence + pre-warm. After this, the unified design is in place.
3. Optional: land **03** if churn-from-scripted-git events becomes a felt problem.

## Related

- Mechanism today (lazy invalidation, full walk) — [`agent-log/001_cache-and-update-mechanism.md`](../2026-05-07-tracker-mental-model-alignment/agent-log/001_cache-and-update-mechanism.md) of the mental-model issue.
- Per-commit flow walk-throughs — see this issue's [comment 001 (current)](./comments/001_current-commit-flow.md) and [comment 002 (post-incremental)](./comments/002_post-incremental-flow.md).
