---
title: "One route resolver — the map that answers a request and the map that enumerates the build"
status: open
---

# Overview

**Two files know the URL space, and this issue is about to build a third.**

```
  src/pages/lib/route-match.ts     resolves a REQUEST to content   (dev / SSR)
  src/pages/lib/static-paths.ts    enumerates every URL to emit    (build)
  ./010_thread-base-url-and-build-the-map.md   source file → published URL   (new)
```

The third one is [the path map](./010_thread-base-url-and-build-the-map.md). It
holds *exactly* the knowledge `static-paths.ts` already produces — every content
file and the URL it publishes at — derived a second time, from the same loaders,
for a different consumer.

**So this subtask is not "tidy up the routing files". It is: do not land a third
copy.** Build the map once, and have request matching and build enumeration both
read it.

Done when one structure produces the request match, the build's `getStaticPaths`,
and the link resolver's lookups — and `scripts/checks/check-route-parity.mjs` still
reports zero divergences.

# Where this came from

Filed out of
[stage 60 of the Astro 7 issue](../../../2026-08-07-astro-7-and-load-time-refactor/plans/01_implementation/60_routing-parity.md),
which scoped merging the two route resolvers at 5–8 days and then **measured that
they do not disagree**:

```
  1285 URLs      agree 1273      explained 12      DIVERGE 0
```

**That measurement is why the merge was cancelled there, and why it is worth doing
here.** As drift insurance it was not worth 5–8 days — nothing has drifted, and
`scripts/checks/check-route-parity.mjs` now catches it in three minutes if it starts. As
*the seam this issue needs anyway*, it is work that has to happen regardless.

The reasoning is the same one this issue already makes about the hosting prefix:

> *A prefix is only implementable once something owns the final URL … Today there
> is no single place that produces a URL, so there is nowhere to put the prefix.*

Three places that produce a URL is worse than two.

# References

- [the path map](./010_thread-base-url-and-build-the-map.md) — the prerequisite,
  and the structure this subtask makes authoritative
- [the shared resolver](./020_the-shared-resolver.md) — the link-side consumer;
  this is its routing-side twin
- [the path map design note](../../notes/30_the-path-map.md)
- [stage 60](../../../2026-08-07-astro-7-and-load-time-refactor/plans/01_implementation/60_routing-parity.md)
  — the measurement, and the cancelled-there decision
- [the parity harness subtask](../../../2026-08-07-astro-7-and-load-time-refactor/subtasks/040_routing-parity/010_unified-url-resolver.md)
  — what the harness checks, and what its two `explained` classes mean
- `scripts/checks/check-route-parity.mjs` — the gate this must not break
- [the trailing-slash matrix](../../notes/10_the-trailing-slash-matrix.html) — the
  harness's `dotted-segment-needs-trailing-slash` class is this phenomenon, seen
  from the routing side

# Todo list

- [ ] **Do [010](./010_thread-base-url-and-build-the-map.md) first.** Without the
      map there is nothing to unify onto, and this becomes the 5–8 day rewrite
      that was correctly cancelled
- [ ] Record a parity baseline **before** touching anything — `check-route-parity`
      must read zero on arrival, or the before/after is worthless
- [ ] Make `static-paths.ts` enumerate **from** the map instead of walking loaders
      a second time
- [ ] Make `route-match.ts` resolve **against** the map, keeping the deliberate
      leniencies below
- [ ] Delete the duplicated traversal once both read the map — this is the
      "remove the duplicate" half, and it comes **last**, not first
- [ ] Re-run `check-route-parity`. Zero divergences, and the two `explained`
      classes unchanged or reduced with a reason
- [ ] `./start build` clean, page count unchanged

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## What already agrees, so nobody re-derives it

The two files **already share every URL spelling.** `static-paths.ts` imports
`sourceFormSlug`, `canonicalContentUrl` and `planStageAliasUrl` from
`route-match.ts`, so each URL is written down exactly once today.

What is duplicated is the **traversal** — the walk that decides which URLs exist.
That is the part the map replaces, and it is the only part to merge.

## Two behaviours that must survive, because they are deliberate

Neither is drift, and a merge that "fixes" them makes the site worse. Both are
recorded as `explained` in the parity harness, with their reasons.

**1 · Dev is lenient under a plan folder.** `planStageAliasTarget`'s final return
lands *any* path under `/plans/<plan>/` on the plan page, so a relative link to
`overview.md` — or to any file in that folder — resolves rather than 404ing. The
build cannot enumerate names that do not exist, so it 404s. **This asymmetry is
correct** and follows directly from this project's rule that content is authored
against the file tree.

**2 · An unknown docs slug renders the section shell with a 404 status.** Not a
bare 404 body — the sidebar stays navigable while a file is mid-edit. The status
is honest; only the body differs from what a static host would serve. It answered
`200` once, which made every dead link look healthy to anything checking by
status code.

## Do not start this to remove duplication

The duplication is real and it is **not currently costing anything** — measured,
not assumed. Start this when [010](./010_thread-base-url-and-build-the-map.md)
lands and the choice is *two maps or one*. Starting earlier buys the 5–8 day
rewrite that stage 60 declined, for the benefit stage 60 measured at zero.
