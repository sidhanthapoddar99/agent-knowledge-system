---
title: "Lift the shared CLI contract into a top-level _cli.mjs"
status: done
---

The good parts (arg-parser, help renderer, output helpers) are trapped in `issues/_lib.mjs` where no other domain can reach them — the root cause of the "two civilizations" split. Promote them to a top-level `_cli.mjs` consumed by every domain. Foundational; unblocks 03/04/05.

## Tasks

- [ ] Create `scripts/_cli.mjs` with: `parseArgs` (moved from `issues/_lib`, + unknown-flag rejection from the hand-rolled loops), a help renderer, a JSON-output helper, and a unified error/exit helper
- [ ] Generalize `reportAndExit` (from `_check-lib`) into the shared error/report format so non-validators can use it
- [ ] Repoint `issues/*` to import `parseArgs`/`printHelp` from `_cli.mjs` (keep `issues/_lib` for issue-domain logic only)
- [ ] Repoint `blog`/`config`/`docs`/`images` scripts off their hand-rolled parsers onto `_cli.mjs`
- [ ] No behavior change in this subtask beyond unification — verify each command still runs (regression via the self-test harness, subtask 14)
