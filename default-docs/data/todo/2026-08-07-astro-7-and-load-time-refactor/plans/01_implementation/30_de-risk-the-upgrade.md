---
title: "De-risk the upgrade"
outcome: "`@astrojs/mdx` is gone and both caches follow the `globalThis` pattern, so stage 40 is one bump instead of two"
notes: "Landed. **The cache split reproduced** — two live module instances in one dev server. Only the mdx half of the sweep ran; the rest moves to [stage 50](./50_correctness-sweep.md)"
who: sid
status: done
subtasks:
  - "[Module-level cache state](../../subtasks/030_correctness/010_cache-module-state.md)"
  - "[Dead-code sweep](../../subtasks/050_cleanup/010_dead-code-sweep.md)"
---

Two pieces of work that exist to make [stage 40](./40_the-upgrade.md) smaller and safer.
Both are cheap. Both are hard prerequisites, not preferences.

## Todo

- [ ] [module-level cache state](../../subtasks/030_correctness/010_cache-module-state.md) — move the two bare caches onto `globalThis`, matching the four siblings that already do
- [ ] [the dead-code sweep](../../subtasks/050_cleanup/010_dead-code-sweep.md) — including `@astrojs/mdx`, which removes an entire co-bump from the bump

## The cache bug reproduced — and it is not the one the migration issue describes

The stage said reproduce before fixing, because the audit could not. It
reproduces, by counting module instantiations in one dev server:

```
  instance #1   at boot            ← the plugin / config context
  instance #2   on first request   ← the SSR request context
  instance #3   after touching the loader itself (ordinary HMR, expected)
```

**#1 and #2 are alive at the same time**, so a module-level `Map` is two Maps.
The consequence is not a stale page — the mtime signature catches edits on its
own — it is that `invalidateIssuesCache()`, called from the dev integration,
cleared the copy the request path never reads.

**The codebase already knew.** `integration.ts` reaches into
`server.moduleGraph` to force the SSR copy to re-instantiate, commented as
*"belt-and-suspenders against Vite's plugin/SSR module isolation"*. That
workaround is standing in for shared state. Both caches in `issues.ts` and both
maps in `issue-dates.ts` now live on `globalThis`, matching `paths.ts` and
`cache.ts` — after which exactly one state object exists and every caller
resolves to it, confirmed by probe.

**This matters for [stage 40](./40_the-upgrade.md):** its open question is
whether the 25-line `moduleGraph` reach-in can go. Its reason for existing has
just been removed, so that question is now answerable rather than speculative.

**What is NOT shown:** that the git-ref watcher's invalidation now crosses
contexts end to end. `touch`ing the ref did not make the watcher fire, and
forcing it by rewriting a git ref is not worth the risk. The fix is correct by
construction — `globalThis` is per-process and both instances share the process
— but the end-to-end path is argued, not demonstrated.

## What landed from the sweep

Only `@astrojs/mdx`, which is what this stage needed: it removes a co-bump from
stage 40. Zero `.mdx` files exist, and page markdown goes through this project's
own `marked` pipeline, never Astro's. The `mdx` spellings left in globs and
regexes are our own matchers' tolerated extensions.

The rest of the dead-code sweep did not run and is not blocking the upgrade.

## Gate

`@astrojs/mdx` is gone from `package.json` and `astro.config.mjs`, and both caches follow the `globalThis` pattern. The build still produces 1,229 pages or more, and the dev toolbar and editor still work.

## Questions

- [ ] **Reproduce the cache bug before fixing it.** The audit could not — the running server showed a correct fresh timestamp. "Already fixed by accident" and "the cache was cold" look identical from outside. If it turns out not to reproduce, that is a finding worth writing into the migration issue, because that bug is its stated justification.
- [ ] The dead-code sweep overlaps the codebase-refactoring issue's own sweep subtask. Comment there before starting, so it is not done twice.
- [ ] Frontmatter validation is a decision inside the sweep, not a deletion — wire it up or remove it. Wiring it up will surface existing violations that this stage has not budgeted.
