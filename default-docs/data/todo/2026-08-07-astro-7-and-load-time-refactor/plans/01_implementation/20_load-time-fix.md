---
title: "The load-time fix"
outcome: "Cold `/todo` under 300 ms, and per-page inline CSS under 5 KB gzipped with no flash"
notes: "⭐ **The issue has paid for itself here.** Independent of the upgrade — this stage would still be worth running if stage 40 never happened"
who: claude
status: open
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

## Gate

Both subtasks' "done when" blocks pass, with before-and-after numbers recorded from the same harness. Specifically: cold `/todo` under 300 ms, and per-page inline CSS under 5 KB gzipped with no flash on a cold cache.

## Questions

- [ ] The index-loader subtask says do not parallelize, with measurements showing async is 1.8–2.3x slower. If the real corpus behaves differently — a network filesystem, a genuinely cold cache — re-measure before assuming sequential still wins.
- [ ] Frontmatter validation is currently dead code, so nothing enforces the `title` rule. Does that get wired up here, where the loader is already open, or in [stage 50](./50_correctness-sweep.md) where the cleanup subtask owns the decision?
