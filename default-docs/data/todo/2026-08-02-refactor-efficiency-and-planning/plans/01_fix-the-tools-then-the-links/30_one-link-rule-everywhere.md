---
title: "One link rule, everywhere"
outcome: "Every surface states the same rule — internal references are relative markdown links — with the reason attached and no alternative offered"
who: claude
status: open
subtasks:
  - "[Relative links are the contract](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)"
  - "[Link it, don't name it](../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)"
---

## Todo

- [ ] Settle the cross-section question **first** — verify against `move.mjs`
      whether a cross-section relative link is rewritten correctly. If it is,
      there is no exception and the simpler rule wins. Stage 40's gate encodes
      whatever this concludes
- [ ] State the rule identically on every surface: both skills, `guide.ts`, the
      user-guide, the dev-docs. **This repo's `CLAUDE.md` only if it already says
      something about links** — if it is silent, leave it silent
- [ ] Account for all 137 site-absolute links. 115 are the known user-guide
      cross-section set; the 19 in `dev-docs/` and 3 in the tracker have never
      been examined
- [ ] Convert backticked paths that should be links — **in reviewable batches,
      one directory at a time, gate after each.** Not one scripted sweep
- [ ] **Gate:** `agent-ks-dev check skill-links` clean, on the source tree,
      after every batch

**This stage carries the run's real risk.** It proposes the second mass link edit
in this repo; the first touched 341 files and was wrong. Two things make this one
different, and they have to stay true:

1. **There is no diagnosis to be wrong about.** `move.mjs` demonstrably rewrites
   relative markdown links and demonstrably cannot rewrite an absolute one or a
   backticked string. That is read from code, not inferred from symptoms.
2. **Backticked paths have real exceptions** — a file outside the site, a path
   being discussed as a value. Unlike the absolute-link case, a blanket rewrite
   here would cause its own damage. Convert deliberately.

**If a batch produces a number that surprises you, stop and measure before
continuing.** The 341 conversions were justified by *"not one of 101 links got it
right"* — the strongest available evidence that the tool was broken, read as
evidence that the authors were.
