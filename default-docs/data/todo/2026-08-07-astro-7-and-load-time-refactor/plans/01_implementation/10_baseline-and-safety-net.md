---
title: "Baseline and safety net"
outcome: "Every number the later stages are judged against is written down, re-measured on this machine"
notes: "Recorded 2026-08-07. Every figure reproduced the audit's, so nothing had to be re-explained"
who: claude
status: done
subtasks:
  - "[Typecheck baseline](../../subtasks/020_astro-7/020_typecheck-baseline.md)"
---

Record what the system does today, before anything changes it. Every later stage is judged
against these numbers, and there is no way back to them once work starts.

## Todo

- [ ] [the typecheck baseline](../../subtasks/020_astro-7/020_typecheck-baseline.md) — capture the 27 errors as the reference list; do **not** fix them
- [ ] Run the cold-request harness in [the index-loader subtask](../../subtasks/010_load-time/010_index-loader-frontmatter-only.md) and record `/todo`, a docs page and `/blog`
- [ ] Record the build baseline: page count, wall time, peak RSS
- [ ] Record the dev-server RSS after a sustained session

## What was recorded

Measured on this machine, 2026-08-07, Astro 5.17.1 / Vite 6.4.1 / Node 24.16.0 / bun 1.3.14.

| | Baseline |
|---|---|
| Typecheck (`tsc --noEmit`) | **27 errors** — 19 of them one root cause in `src/pages/lib/layout-registry.ts` |
| Build | 1,265 pages, 1,293 `.html`, 14.2 s, peak RSS 2.0 GB, `dist/` 170 MB |
| Built HTML, all files | 136.6 MB |
| Dev server ready | 378–428 ms |
| `/todo` first request | 2.57–3.06 s |
| `/todo` with the module graph already warm | 1.206 s |
| `/todo` warm | 0.034 s |
| Detail page, first request | 2.54 s |
| Dev-server RSS, fresh / sustained | 431 MB / 809 MB |

The audit's figures reproduced, so they stand as written. The one number that
moved is the page count — 1,229 → 1,265 — because this issue added an issue
folder. Later gates are written against 1,265.

**The harness is `/tmp/measure.sh`, and its protocol matters more than its
numbers.** Protocol A makes `/todo` the first request of all, so it pays for
compiling the shared module graph as well as its own work; protocol B warms
other routes first, so `/todo` pays only the issues-specific cost. Comparing a
protocol-A number against a protocol-B one invents a regression or a win that
is not there.

## Gate

Move on when every number in [the Astro 7 upgrade subtask's baseline table](../../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md) has been re-measured on this machine and written down. The audit's figures are from 2026-08-07 and should reproduce; if one does not, find out why before proceeding rather than adopting the new number silently.

## Questions

- [ ] Does the typecheck gate become blocking in CI, and if so at which stage? The subtask says "later, separately" — decide whether that means this issue or another one.
