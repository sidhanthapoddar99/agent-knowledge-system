---
title: Closed — the flag works, it stays off, and the premise was wrong
---

# Closed — the flag works, it stays off, and the premise was wrong

This issue closes `done`, not `dropped`, and the distinction is the point.
`dropped` would mean the work was abandoned. It was not. It was carried out,
it produced a working implementation and two shipped fixes, and it then
**disproved its own premise with a measurement**. That last part is the most
valuable thing here, and dropping the issue would delete it.

## What the issue asked

> Rebuild and rewrite only the pages a change affects. Measured: 98.7% of built
> pages are byte-identical between builds.

The premise underneath it was that the build is the thing that hurts.

## What we found

**Astro 7.2's own `experimental.incrementalBuild` works on this content tree.**
Evaluated in [025](../subtasks/025_evaluate-astros-own-incremental-build.md):

| | |
|---|---|
| Build time | 6.25 s → **4.20 s** (−33%) |
| Granularity | one body edit rebuilt **exactly one page** |
| Correctness | **5/5** tests pass |
| Cache size | `node_modules/.astro` 1 MB off → **91 MB** on |

The obstacle `025` originally claimed — that `allContent` in the props would
defeat the cache — was disproved **in both directions**: props are not part of
Astro's comparison at all, so the cache neither breaks on them nor protects
against them.

**And that is exactly the failure mode.** A deliberately wrong cache key produced
**one stale page, exit code 0, and no warning**. The build reports success and
publishes yesterday's HTML. That is why the flag is off by default and why
`scripts/checks/check-incremental-staleness.mjs` exists as a strict three-build
gate.

## Why it stays off

The premise was wrong, and the number that shows it is this one:

- `./start` (dev) writes **0.4 MB** and is ready in **2.4 s**.
- The old `./start` ran a full build first: **~100 MB** and **~9.5 s**.
- Dev never reads `dist/`. Verified by deleting `dist/` and serving every route.

About 98% of runs are dev, and **dev does not build**. So a 33% saving on the
build applies to the ~2% of runs that are a build — a publish, roughly once a
fortnight, inside a CI pipeline that is already clean. Against that: a cache
whose wrong answer is silent, and 91 MB of it.

The real fix for the thing that hurt was to **stop building on every dev start**,
which shipped separately. Incremental build was the right investigation and the
wrong lever.

## What shipped anyway, and was worth the whole issue

**A live production defect, found and fixed** —
[010](../subtasks/010_make-the-build-deterministic.md). `formatRelativeTime()`
read `Date.now()` at render, so a static build baked *"31 min ago"* into the HTML.
On a built site that string is frozen at deploy time and silently becomes wrong.
Relative time now lives in `src/modules/relative-time.ts` and is computed on the
client; the server renders the full date. The build is deterministic —
**1307/1307 pages byte-identical** across time-separated builds.

That bug had nothing to do with incremental builds. It was found because
determinism was a prerequisite for them.

Also shipped: `src/pages/lib/cache-key.ts` (the per-entry keys, off by default),
the staleness gate, and the measurement that `getStaticPaths()` is **2.55 s —
61% of the build, identical warm and cold**. That last figure is what rescopes
any future work here, and it lives in
[030](../subtasks/030_reverse-dependency-graph.md).

## What is dropped, and why

Two subtasks are dropped rather than done. Both were "write our own incremental
system", and Astro shipping one made that path redundant before either started:

- [020 — diff and copy into dist](../subtasks/020_diff-and-copy-into-dist.md)
- [030 — reverse dependency graph](../subtasks/030_reverse-dependency-graph.md)

`030` also carries the measurement above, so it is dropped rather than deleted —
the number outlives the plan.

## If this comes back

It comes back on one condition: **the deploy model changes.** A move to an SSR
node server (`@astrojs/node`) removes the 1300-page build entirely, which makes
incremental build permanently irrelevant rather than merely off. That is the
question worth asking next, and it is not this issue.

To turn the flag on today: `INCREMENTAL_BUILD=1` in `.env`, and run
`scripts/checks/check-incremental-staleness.mjs` before trusting any build it
produces.
