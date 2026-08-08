---
title: "Render only the pages a change affects"
status: dropped
---

# Overview

> [!WARNING]
> **Dropped, and kept on disk for one number.** Astro 7.2 ships the per-page cache
> this was written to build, so the implementation is redundant. What is left is
> the measurement below — **`getStaticPaths()` is 2.55 s, identical warm and cold,
> 61% of the build** — which is the figure any future attempt starts from. The file
> stays because that number outlives the plan.
>
> It is dropped rather than kept open because the work only pays off in a build,
> and about 98% of runs are dev, which does not build. If the deploy model ever
> moves to an SSR node server, there is no 1300-page build to optimise at all.
> See [the closing comment](../comments/001_closed-the-flag-works-and-stays-off.md).

> [!IMPORTANT]
> **Its target had already moved before it was dropped.** Astro 7.2's own incremental build now removes the
> per-page render cost this was written to attack — measured at **-79%** in
> [025](./025_evaluate-astros-own-incremental-build.md). What survives is the one
> thing a per-page cache structurally cannot do: **`getStaticPaths()` runs in full,
> every build, before any cache key is consulted.** That is 2.55 s and now the
> largest single item in the build.
>
> So the remaining value is the todo item below that reads *"filter `getStaticPaths`
> to the affected set"*. Read 025 before starting; most of the rest of this file is
> now redundant with a first-party feature.

The expensive layer, and the one that actually takes 7 seconds toward 0.1. It needs
something the codebase does not have: a map from **a source file** to **the pages
that file appears in**.

**Do not start this before layers 1 and 2.** They are cheap, they solve a stated
problem outright, and this one must justify itself against the 7-second baseline
they leave behind — not the 14 seconds it was imagined against.

Done when a one-line content edit rebuilds only the affected pages, and a
correctness gate proves no page went stale.

# References

- [diff and copy](./020_diff-and-copy-into-dist.md) — prerequisite; supplies the
  scratch-build and sync machinery
- [make the build deterministic](./010_make-the-build-deterministic.md) — prerequisite
- [cache-manager dependency tracking](../../2026-08-07-astro-7-and-load-time-refactor/subtasks/030_correctness/020_cache-manager-dependency-tracking.md)
  — ~120 lines of dependency tracking with zero call sites. **Built for this.**
  That subtask asks "implement or delete"; this is the case for implement
- `astro-doc-code/src/loaders/issues.ts` — `computeFolderSignature`, a per-folder
  mtime signature that already exists and is already used

# Todo list

- [ ] Decide implement-or-delete on the `cache-manager` API **first** — it changes
      whether this starts from something or from nothing
- [ ] Record the forward dependencies a page actually has — see Details, the list is
      longer than "the markdown file"
- [ ] Invert it: source file → pages
- [ ] Filter `getStaticPaths` to the affected set, behind a flag
- [ ] Build a correctness gate — see below. **This is not optional**
- [ ] Measure. If it does not beat 7 s by enough to matter, say so and stop

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## The fan-out is wider than one file to one page

Editing one subtask markdown file changes, at minimum:

```
  the subtask page          ← the obvious one
  its issue's detail page   ← renders subtask status chips
  any plan page referencing it   ← pulls live subtask status
  the tracker index         ← counts and status marks
```

And that is before `[[path]]` embeds, which splice one file's content into another
page entirely. Those are already tracked as cache dependencies by the issues loader
— reuse that rather than inventing a second mechanism.

**Getting this list wrong is the whole risk.** A missed edge does not fail loudly;
it ships a stale page that looks fine.

## The gate this needs, and why nothing else will do

> **Build incrementally, then build fully, and compare byte for byte.**

Anything less tests that the fast path ran, not that it was right. Run it in CI on
every change to the dependency logic. If the two outputs differ, the dependency
graph has a hole, and that is exactly the bug class that is otherwise invisible.

This gate is also cheap to write once layer 2 exists, because layer 2 already hashes
every output file.

## Where the time actually is

```
  Collecting build info      143 ms
  Vite / Rolldown bundle   1,360 ms   ← still paid every build
  Generating 1,290 pages   4,280 ms   ← the only part this removes
```

**The ceiling is about 1.5 seconds**, not zero, because the bundle step runs
regardless. So the realistic win is 7 s → ~1.6 s, not 7 s → 0.1 s. Worth knowing
before anyone budgets a week for it.

> [!WARNING]
> **The 4,280 ms is not all per-page render work, and this arithmetic is wrong
> because of it.** Measured in
> [025](./025_evaluate-astros-own-incremental-build.md): of an equivalent 5,180 ms
> generate phase, **2,550 ms is `getStaticPaths()`** — loading and rendering every
> markdown file — and only 2,630 ms is rendering the pages. Astro's flag already
> takes the second number to 550 ms.
>
> So the ~1.5 s ceiling above was computed against a number that is roughly 60 %
> something else. Re-derive it against `getStaticPaths` before budgeting anything.

## When this is not worth doing

If the answer to *"how often do you run a full build?"* is "on deploy", then this
saves ~5 seconds per deploy. **The edit loop never runs a build** — the dev server
serves a page in 14–17 ms on demand, which is already incremental rendering by
another name.

This becomes clearly worth it if either changes: builds move into a
save-triggered loop, or the site grows enough that 4,280 ms becomes 40,000 ms.
At 3.4 ms per page, that is roughly 12,000 pages.
