---
author: sidhantha
date: 2026-08-08
title: "Closed — shipped as engine 0.3.0"
---

Closed `done` on 2026-08-08 and released as **engine `0.3.0`** — the first
release to move the middle place since `0.2.0`, and it moves because the
*engine* went two majors, not because any content format changed.

**Floor stays `0.2.0`. No migration ships and none is owed.** Every markdown
file, `settings.json`, frontmatter field and link form is untouched. A consumer
upgrading edits one line: `engine_version: "0.3.0"`.

Full upgrade instruction: [releases/0.3.0.md](../../../../../releases/0.3.0.md).

## What the issue set out to do, and whether it did it

The scope was two committed pieces and a candidate third.

| Committed | Result |
|---|---|
| Astro 5.17.1 → 7.2.0 (Vite 8, Node 22.12 floor) | ✅ Landed |
| Fix the index loader rendering 861 bodies to draw a table of titles | ✅ Landed — a docs page now loads **zero** JS chunks |
| *Candidate:* a tier of audit-found defects | ✅ Taken, and it was worth taking |

Both plans closed. All six stages `done`. Fifteen subtasks `done`, two `dropped`.

## The numbers, all measured on this branch

```
  first request        3.2 s  →  gone (frontmatter-only index)
  per-page CSS         65 KB inline  →  one cached <link>
  build                                6.0 s · 1285 pages
  dist                 108,959,585  →  97,676,286 bytes   -10.4%
  _astro                23,077,518  →  11,795,276 bytes   -48.9%
  _astro files                 582  →         156            -426
  route parity          1290 URLs · 1278 agree · 0 diverge
```

The `-426` is the live editor, which was being built into every consumer's
`dist/` as a working UI wired to save endpoints that only exist in dev — broken
on arrival, and half of `_astro`.

## The four audit findings that had right numbers and wrong conclusions

Worth recording, because it is the pattern of the whole issue rather than four
separate slips:

- **"44 undeclared CSS variables."** 42 were fine; the scan never read `.ts`
  files, where 20 of them live. The real defect was the *inverse* — 12 variables
  layouts read that the contract did not require.
- **"~120 lines of dead API."** One of the four was the missing last link of a
  pipeline that was already producing data.
- **"Adding Shiki grammars costs every reader."** Shiki runs server-side. The
  chunks belonged to the editor and reached **0** published pages — which is how
  the editor-in-`dist` defect was found.
- **"The two route resolvers have already drifted."** Measured **0** divergences
  across 1285 URLs. They share every spelling by import.

**Each of these was a correct measurement attached to an incorrect claim.** The
harness that settled the last one
([the route-parity check](../subtasks/040_routing-parity/010_unified-url-resolver.md))
also failed its own first control, reporting 17 correct redirects as broken — a
comparison bug in the harness, not in the code under test.

## What moved out rather than closing here

- **The URL-resolver merge** →
  [absolute-link-resolution 100/100](../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/100_unify-the-route-resolvers.md).
  Declined here on measurement (0 drift), rehomed there because that issue's path
  map holds the same knowledge `static-paths.ts` derives — landing the map
  without unifying means **three** URL producers instead of two.
- **Astro's own incremental build** →
  [incremental-builds 025](../../2026-08-07-incremental-builds/subtasks/025_evaluate-astros-own-incremental-build.md).
  Astro 7.2 ships `experimental.incrementalBuild`, which is a first-party version
  of what that issue's subtask `030` was opened to write. Unlocked by this
  upgrade and not a goal of it.
- **The `moduleGraph` reach-in** → left in place deliberately. Fixing the git-ref
  watcher made those 25 lines observable for the first time; deleting them in the
  same change that made them testable would have thrown away the test. The
  decision belongs to
  [the updated-date issue](../../2026-05-08-update-date-time-optimization/issue.md).

## Two dropped, and why

- [`020_astro-7/020_typecheck-baseline`](../subtasks/020_astro-7/020_typecheck-baseline.md)
  — its deliverable was a **before/after** type-check diff. The upgrade landed
  without the baseline, so the comparison is unobtainable. A first type-check
  report is still worth having and is not this issue's business.
- [`060_followups/030_dev-server-memory`](../subtasks/060_followups/030_dev-server-memory-controlled-test.md)
  — asked for an Astro 5 vs 7 comparison needing a downgrade and a reinstall, and
  the index-loader fix landed between the two states, so no protocol recovers a
  clean delta.

**The cost of the first one is the lesson of the issue.** The plan named it as a
hard constraint — *stage 10 before stage 40, you cannot diff a typecheck against
a baseline you never recorded* — and the constraint was right. It was skipped
because a tool prompted for an install and the prompt was declined, which read as
a small detour rather than as the one irreversible step in the plan. **A
measurement that can only be taken before an event is a gate, not a task.**
