---
title: "One link rule, everywhere"
outcome: "Every surface states the same rule — internal references are relative markdown links — with the reason attached and no alternative offered"
who: claude
status: done
subtasks:
  - "[Relative links are the contract](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)"
  - "[Link it, don't name it](../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)"
  - "[Links whose target does not exist](../../subtasks/100_link-integrity/100_links-whose-target-does-not-exist.md)"
---

## Todo

- [x] Settle the cross-section question **first** — settled by a dry-run `move`:
      cross-section relative links **are** maintained, so **there is no
      exception** and the simpler rule wins
- [x] State the rule identically on every surface — both skills' references, both
      `SKILL.md` front pages, `guide.ts`. `CLAUDE.md` left silent on link form,
      as instructed
- [x] Account for all 137 — 129 converted, 5 belong to the dead-target subtask,
      2 parked on the tracker question, 1 is a quoted example
- [x] Take the broken-target count to zero — 55 → 0
- [ ] **Convert backticked paths that should be links — NOT DONE.** The rule is
      live everywhere; the ~44 existing instances need judgement per instance and
      were not swept. Left on [`080`](../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)
- [x] **Gate after every batch** — build + `check links` after each directory,
      `check skill-links` on the source tree after the skill edits

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
