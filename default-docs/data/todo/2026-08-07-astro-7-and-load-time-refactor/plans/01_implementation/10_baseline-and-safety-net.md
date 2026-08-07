---
title: "Baseline and safety net"
status: open
---

Record what the system does today, before anything changes it. Every later stage is judged
against these numbers, and there is no way back to them once work starts.

## Todo

- [ ] [the typecheck baseline](../../subtasks/020_astro-7/020_typecheck-baseline.md) — capture the 27 errors as the reference list; do **not** fix them
- [ ] Run the cold-request harness in [the index-loader subtask](../../subtasks/010_load-time/010_index-loader-frontmatter-only.md) and record `/todo`, a docs page and `/blog`
- [ ] Record the build baseline: page count, wall time, peak RSS
- [ ] Record the dev-server RSS after a sustained session

## Gate

Move on when every number in [the Astro 7 upgrade subtask's baseline table](../../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md) has been re-measured on this machine and written down. The audit's figures are from 2026-08-07 and should reproduce; if one does not, find out why before proceeding rather than adopting the new number silently.

## Questions

- [ ] Does the typecheck gate become blocking in CI, and if so at which stage? The subtask says "later, separately" — decide whether that means this issue or another one.
