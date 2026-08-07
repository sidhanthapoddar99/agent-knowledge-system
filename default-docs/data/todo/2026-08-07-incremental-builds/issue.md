## Goal

A build rewrites only the pages a change affects, instead of regenerating and
rewriting all 1,290 every time.

## Why — and it is measured, not assumed

Sid's case: a full build writes every file each time, which wears the disk and
spends time on output that is 99% unchanged.

**The 99% is real. It measures at 98.7%.**

| | Pages | Byte-identical to the previous build |
|---|---|---|
| Two builds, nothing changed at all | 1,290 | **1,273** |
| A build after a one-line edit to one markdown file | 1,290 | **1,273** |

One line changed **at most 17 pages out of 1,290** — and fewer in truth, because
the same 17 already differed between two builds where nothing changed.

Full measurement: [the partial-rebuild brainstorm](../2026-08-07-astro-7-and-load-time-refactor/brainstorm/01_partial-rebuilds.md).

## What a build costs today, and where the time is

```
  Collecting build info      143 ms
  Vite / Rolldown bundle   1,360 ms
  Generating 1,290 pages   4,280 ms   ← 3.4 ms per page
  ─────────────────────────────────
  total                    5,810 ms
```

**Per page it is already milliseconds.** The seconds are the page count. No faster
runtime touches that — only building fewer pages does.

## Scope — three layers, and they are separable

Each is useful alone. Each is a prerequisite for the next.

| | What it does | Buys | Cost |
|---|---|---|---|
| **1. Determinism** | Move relative timestamps to the client | Makes "unchanged" detectable at all | Very small |
| **2. Diff-and-copy** | Build to scratch, write only changed files into `dist/` | **Ends the disk churn: 17 writes, not 1,290.** Build still takes 7 s | Small |
| **3. Skip rendering** | Render only the pages a change affects | Takes 7 s toward ~0.1 s | Large |

**Layer 1 is the precondition for everything.** You cannot skip work you cannot
prove is unchanged.

**Layer 2 alone solves the disk-wear complaint completely** and touches nothing
inside the framework — it is a post-build step.

**Layer 3 is the one that needs a reverse dependency graph**, and it is where the
risk lives: a wrong skip ships a stale page, silently.

## What already helps, from the Astro 7 issue

Two things landed there that this issue depends on, neither done for this reason:

- **The theme stylesheet left the page body.** Before that, changing one colour
  rewrote all 1,290 files, which would have capped any incremental scheme at
  useless-whenever-you-touch-a-colour.
- **`computeFolderSignature`** — a per-folder mtime signature already exists in the
  issues loader. That is half a dependency graph, already written and in use.

## The argument against doing layer 3 soon

**The edit loop does not run builds.** The dev server already renders one page on
request and caches it — 14 to 17 ms per page in real use. The 7 s is a deploy cost,
paid once, and the Astro 7 work already halved it from 13.9 s.

So layer 3 must justify itself against a 7-second baseline, not the 14-second one it
was imagined against. Layers 1 and 2 do not have that problem: they are cheap and
they solve a stated complaint outright.

**Nothing here requires Go.** Layer 3 needs a dependency graph, which is
language-independent — worth stating because incremental rebuilds are often listed
as a reason to rewrite the runtime.

## Related

- [Astro 7 upgrade and the load-time refactor](../2026-08-07-astro-7-and-load-time-refactor/issue.md)
  — where the measurements came from, and the two changes this depends on
- [cache-manager dependency tracking](../2026-08-07-astro-7-and-load-time-refactor/subtasks/030_correctness/020_cache-manager-dependency-tracking.md)
  — ~120 lines of dependency tracking with zero call sites. **This issue is the
  argument for implementing rather than deleting them**
- [Runtime stack migration](../2026-05-08-runtime-stack-migration/issue.md) —
  partial rebuilds are one of its stated attractions; this issue tests whether that
  needs a rewrite. It does not
