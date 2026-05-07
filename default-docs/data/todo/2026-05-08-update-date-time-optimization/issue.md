## Goal

Scale the derived-`updated` cache loader (`astro-doc-code/src/loaders/issue-dates.ts`) so the cold rebuild stays imperceptible at 3 K+ issues / 10 K+ tracker-touching commits. At present scale (this repo, 12 tracker-touching commits) the walk is ~11 ms. Projected at 3 K issues, ~500 ms on the request path; at 10 K, ~2.5 s — clearly laggy.

The frontend rendering side of this work (relative-time formatting for the `updated` column — "3 hours ago", "2 days ago", full date+time at >7 days) lives as [subtask 11 of `2026-05-07-tracker-mental-model-alignment`](../2026-05-07-tracker-mental-model-alignment/subtasks/11_relative-time-rendering.md). It made more sense there since it completes the user-facing surface of the manual-`updated` drop. This issue is purely the backend cache-scaling work.

## Subtasks at a glance

- **01 — Move cache rebuild off the request path.** Async background rebuild on watcher fire; readers serve stale-or-empty without blocking on `git log`.
- **02 — Pre-warm cache at server start.** Kick off `walkLog` in `astro:server:setup` so the first issues-page render is already warm.
- **03 — Re-add incremental refresh.** Use `<syncedAt>..HEAD` walk for linear advance; full rebuild only on branch switch / non-linear move.
- **04 — Disk-persisted cache.** `.astro/issue-dates.json` survives server restarts; verify against current HEAD on load.
- **05 — Watcher debounce.** Coalesce rapid git events (e.g. interactive rebase) into a single rebuild.

## Ordering

01 + 02 are complementary and small; land them together — that alone covers the perceived-lag concern up to ~3K issues with heavy churn. 03 is worth adding if commit-during-dev churn becomes the bottleneck. 04 and 05 are nice-to-have; skip until there's a felt need.

## Background — full discussion

The current cache mechanism (lazy invalidation, watcher push + reader pull) is documented in [`agent-log/001_cache-and-update-mechanism.md`](../2026-05-07-tracker-mental-model-alignment/agent-log/001_cache-and-update-mechanism.md) of the mental-model issue. The detailed scaling analysis and optimization rationale live in this issue's notes — see [`notes/01_scaling-analysis.md`](./notes/01_scaling-analysis.md) and [`notes/02_optimization-options.md`](./notes/02_optimization-options.md).
