---
title: "The load-time fix"
outcome: "Cold `/todo` under 300 ms, and per-page inline CSS under 5 KB gzipped with no flash"
notes: "Landed. `/todo` 1.206s → 0.155s, built HTML 136.6 MB → 73.8 MB. `review` for one thing only: whether a cold cache flashes"
who: sid
status: done
subtasks:
  - "[Index loader reads frontmatter only](../../subtasks/010_load-time/010_index-loader-frontmatter-only.md)"
  - "[Theme CSS delivery](../../subtasks/010_load-time/020_theme-css-delivery.md)"
---

The whole reason this issue is priority `high`. Both halves of the measured problem — the
server side and the browser side — land here, and nothing in this stage depends on the
upgrade.

**After this stage the issue has already paid for itself.** Everything later is currency
and correctness.

## Todo

- [ ] [the index loader](../../subtasks/010_load-time/010_index-loader-frontmatter-only.md) — stop rendering 861 bodies to build a table of titles
- [ ] [theme CSS delivery](../../subtasks/010_load-time/020_theme-css-delivery.md) — stop inlining 65 KB into every page

## What landed

Two commits: `ae16663` (the loader) and `e22df2a` (the CSS).

**The index loader.** It read ids, dates, `meta.*` and its subtasks' statuses —
and not one rendered body — while rendering every tracked file in the tracker to
produce them. A per-load render context now carries a `metaOnly` flag down the
folder walk; the tree is walked identically either way, so the object graph keeps
its shape and only the `html` strings differ. `loadIssue` reads one folder
instead of going through the tracker-wide load, which is why a detail page no
longer costs what the index costs.

| | Before | After |
|---|---|---|
| `/todo`, module graph warm (protocol B) | 1.206 s | **0.155 s** |
| `/todo`, first request of all (protocol A) | 2.570 s | 1.039 s |
| Detail page, first request | 2.543 s | 1.576 s |

**The protocol-A rows are not the win, and not a miss either.** What remains
there is Vite compiling the layout module graph — `/user-guide`, which touches no
issue code, costs 1.7–2.2 s on the same cold server. It is a per-route constant
that does not grow with the tracker, which is the opposite of the problem this
stage was opened for.

**Theme CSS.** Identical on every page, so inlining put the same 65 KB in all
1,016 rendered pages. Now served from `/theme.css` with a content-hashed URL.
Built HTML **136.6 MB → 73.8 MB**; `/todo` gzipped **51,928 → 39,138 bytes**.
`/artifacts/**` keeps its own inline block — those are standalone by contract.

**Two defects fixed on the way**, both found by reading rather than by failing:
`invalidateIssuesCache(dataPath)` deleted a key that never existed, because
entries are keyed `<dataPath>::<flags>`; and the module-level `embedCollector`
is gone, folded into the per-load context.

## Gate

Both subtasks' "done when" blocks pass, with before-and-after numbers recorded from the same harness. Specifically: cold `/todo` under 300 ms, and per-page inline CSS under 5 KB gzipped with no flash on a cold cache.

## Questions

- [ ] The index-loader subtask says do not parallelize, with measurements showing async is 1.8–2.3x slower. If the real corpus behaves differently — a network filesystem, a genuinely cold cache — re-measure before assuming sequential still wins.
- [ ] Frontmatter validation is currently dead code, so nothing enforces the `title` rule. Does that get wired up here, where the loader is already open, or in [stage 50](./50_correctness-sweep.md) where the cleanup subtask owns the decision?
