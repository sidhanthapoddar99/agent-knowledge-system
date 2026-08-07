---
title: "De-risk the upgrade"
outcome: "`@astrojs/mdx` is gone and both caches follow the `globalThis` pattern, so stage 40 is one bump instead of two"
notes: "⚠️ Hard prerequisite for [the upgrade](./40_the-upgrade.md), not a preference — and cheap. Reproduce the cache bug **before** fixing it"
who: claude
status: open
subtasks:
  - "[Module-level cache state](../../subtasks/030_correctness/010_cache-module-state.md)"
  - "[Dead-code sweep](../../subtasks/050_cleanup/010_dead-code-sweep.md)"
---

Two pieces of work that exist to make [stage 40](./40_the-upgrade.md) smaller and safer.
Both are cheap. Both are hard prerequisites, not preferences.

## Todo

- [ ] [module-level cache state](../../subtasks/030_correctness/010_cache-module-state.md) — move the two bare caches onto `globalThis`, matching the four siblings that already do
- [ ] [the dead-code sweep](../../subtasks/050_cleanup/010_dead-code-sweep.md) — including `@astrojs/mdx`, which removes an entire co-bump from the bump

## Gate

`@astrojs/mdx` is gone from `package.json` and `astro.config.mjs`, and both caches follow the `globalThis` pattern. The build still produces 1,229 pages or more, and the dev toolbar and editor still work.

## Questions

- [ ] **Reproduce the cache bug before fixing it.** The audit could not — the running server showed a correct fresh timestamp. "Already fixed by accident" and "the cache was cold" look identical from outside. If it turns out not to reproduce, that is a finding worth writing into the migration issue, because that bug is its stated justification.
- [ ] The dead-code sweep overlaps the codebase-refactoring issue's own sweep subtask. Comment there before starting, so it is not done twice.
- [ ] Frontmatter validation is a decision inside the sweep, not a deletion — wire it up or remove it. Wiring it up will surface existing violations that this stage has not budgeted.
