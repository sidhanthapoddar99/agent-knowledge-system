---
title: "Astro 7.2 ships an incremental build — evaluate it before writing ours"
status: open
---

# Overview

**Astro 7.2 has `experimental.incrementalBuild`, and it targets the same 4.6–5.0 s
that [030 the reverse dependency graph](./030_reverse-dependency-graph.md) was
opened to attack.** It works by having `getStaticPaths()` return a `cacheKey` per
page; Astro skips re-rendering a page whose key is unchanged.

That is a first-party version of layer 3. **Deciding between it and a bespoke graph
is cheaper than building either**, so the decision goes here — after
[020 diff-and-copy](./020_diff-and-copy-into-dist.md), before 030.

The Astro 7 upgrade is what put this on the table. It landed in
[the Astro 7 issue](../../2026-08-07-astro-7-and-load-time-refactor/issue.md) and
was not a goal of it.

Done when there is a written decision — ours, theirs, or both — with a measured
second-build number behind it, and 030 is either kept, rescoped or dropped on the
strength of that number.

# References

- [030 the reverse dependency graph](./030_reverse-dependency-graph.md) — what this
  might replace, rescope, or leave untouched
- [020 diff-and-copy](./020_diff-and-copy-into-dist.md) — runs first regardless;
  it solves the disk-churn half and neither approach here does
- [010 make the build deterministic](./010_make-the-build-deterministic.md) — the
  precondition for both. A `cacheKey` is a determinism claim in another spelling
- `astro-doc-code/src/pages/lib/static-paths.ts` — where a `cacheKey` would be
  returned, and where the obstacle below lives

# Todo list

- [ ] Turn the flag on, add a naive `cacheKey`, and **measure the second build**.
      The whole subtask rests on that one number
- [ ] Settle the `allContent` obstacle below — it decides whether the granularity
      is per-page or per-section
- [ ] Check what a wrong `cacheKey` does: stale HTML, or a loud failure
- [ ] Write the decision on 030 — keep, rescope to the sidebar problem, or drop
- [ ] If adopted, decide whether an experimental flag is acceptable in a released
      engine, and what happens to consumers when it changes

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Not measured — read this before quoting anything here

**Nothing in this subtask is a measurement.** It comes from the Astro 7.2
changelog plus a read of this repo's own `static-paths.ts`. The second-build
number that would justify it has not been taken, and taking it is the first todo
item. Treat every figure below as the *baseline it must beat*, not as a result.

Baseline, measured on this machine (3 runs, `bun run build`):

```
  wall            6.75–7.14 s
  peak RSS        1.19 GB
  pages           1284

  types                19 ms
  collect              46 ms
  server entrypoints  337 ms
  client bundle       960 ms
  generate routes   4600–5000 ms   ← 77% of the build, single-threaded
```

That 77 % is the target. It is the same figure the issue's own front page records
as `Generating 1,290 pages — 4,280 ms`, taken independently, which is a reason to
trust both.

## The obstacle, and it is ours rather than Astro's

`buildStaticPaths()` puts **`allContent`** — the whole section's content array,
which the sidebar needs — into the props of every page in that section.

So a `cacheKey` that is *honest about its inputs* has to include `allContent`, and
then **editing any page in a section invalidates every page in that section.**

That is not fatal and it is not nothing:

- **Still bought:** editing one `user-guide` page skips the ~1000 `/todo` pages.
  Cross-section isolation is real and comes free.
- **Not bought:** per-page granularity, which is what the 3.4 ms-per-page figure
  is multiplied by.

Getting per-page granularity means changing **how the sidebar gets its data** —
deriving it once and referencing it, rather than passing the array into every
page. That is the same shape of problem as
[the path map in the absolute-link-resolution issue](../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/010_thread-base-url-and-build-the-map.md):
one derived structure with many readers, instead of a copy per consumer.

**Worth checking whether those are the same piece of work.** If they are, this
subtask gets much cheaper and that one gets more valuable.

## Why this is not simply better than 030

Two things to weigh, and neither is settled here.

**It is an experimental flag.** This engine is versioned, released, and consumed by
other projects through a hard `engine_version` gate. Building a release's build
performance on a flag that can change shape is a real cost, and it is the kind of
cost that shows up later as a migration nobody planned.

**A wrong `cacheKey` serves stale HTML silently.** That is precisely the failure
class stages 50 and 60 of the Astro 7 issue spent their time on — a plausible wrong
answer beats a loud failure only until someone trusts it. Whatever is adopted needs
a way to detect a stale page, and `check-route-parity.mjs` compares dev against
`dist/` rather than against the previous `dist/`, so it does not cover this.

## What was ruled out on the way here, with numbers

These were measured while looking for build wins, and each is a dead end worth not
re-testing:

| Tried | Result |
|---|---|
| `build.concurrency: 8` (default is 1) | 6.45 s vs 6.63–6.99 s — **inside the run-to-run spread**, RSS flat. Page rendering is CPU-bound in one JS thread and `concurrency` is promise-level, not workers |
| Running the build under Bun | **16.5–16.9 s, 2.4× slower**, 1.49 GB. Note `bun run build` already runs under **node** — `.bin/astro` has a node shebang — so the current setup is the fast path by accident. Do not "fix" this with `--bun` |
| Shiki's JS regex engine | ~9 % slower (1750 ms vs 1610 ms over 1540 highlights), saves ~52 MB. Not worth the grammar-compatibility risk |
| "Switch on Rolldown / oxc" | **Already on.** Vite 8.2.1 depends on `rolldown` directly and `build.minify` resolves to `oxc` by default. Nothing to enable |
