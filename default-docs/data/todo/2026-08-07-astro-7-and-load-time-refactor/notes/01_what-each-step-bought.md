---
title: "What each step bought"
---

Per-step measured effect of the work in [the implementation plan](../plans/01_implementation/overview.md).
Every figure here was measured on one machine on 2026-08-07 — nothing is estimated,
and where a number could not be measured it says so.

**Read the protocol before the numbers.** Dev timings depend entirely on which
request comes first:

| Protocol | Meaning |
|---|---|
| **A** | `/todo` is the first request to a fresh server — pays for compiling the shared module graph *and* its own work |
| **B** | other routes are requested first, so `/todo` pays only the issues-specific cost |

A protocol-A number compared against a protocol-B one invents a win or a regression
that is not there. The gap between them is roughly one second of Vite compilation
that every route pays once, and that nothing in this issue changes.

# The four steps, and what each one moved

| Step | What it changed | What it bought |
|---|---|---|
| **1. Index loader reads metadata only** | The index rendered every tracked file in the tracker to build a table of titles | `/todo` **1.206 s → 0.155 s** (protocol B) |
| **2. Theme CSS served from `/theme.css`** | The same 65 KB was inlined into all 1,016 rendered pages | Built HTML **136.6 MB → 73.8 MB**; `/todo` gzipped **51,928 → 39,138 B** |
| **3. Caches shared on `globalThis`** | Two live module instances each held their own cache | No timing change. Fixes invalidation, and removes the reason the `moduleGraph` reach-in exists |
| **4. Astro 5.17.1 → 7.2.0** | Vite 6 → 8, Rolldown | Build **13.9 s → 7.1 s**; build peak RSS **2,049 → 1,239 MB** |

# Where the wins actually come from, because they are not the same kind

**Steps 1 and 2 scale with the tracker.** They removed work that grew with every
issue added — rendering N bodies to list N titles, and copying one stylesheet into
N pages. That is why they matter more than their headline numbers suggest: they
change the *slope*, not just the intercept. This is the part that answers "it takes
10 seconds on a real large repo and increases with size".

**Step 4 is flat.** Rolldown makes the same amount of work faster. Good, permanent,
and unrelated to how big the tracker grows.

**Step 3 bought no speed at all** and was still worth doing — it was a hard
prerequisite for step 4 and it fixed a real defect. Not every step has to show up
on a stopwatch.

# The number that surprised us

The plan predicted step 4 would buy nothing measurable. That was wrong twice:

```
  build wall        13.7–15.1 s  →  7.1–7.3 s     ~2x
  build peak RSS       2,049 MB  →  1,239 MB      -38%
```

The memory figure is the one that matters most, because RAM was the first problem
on the original list — and it came free, from a dependency bump, with no code
change of ours.

What the plan got *right* is that warm request time did not move: 0.033 s before,
0.034 s after. Step 4 does not touch the paths that were slow.

# Two fixes that came out of reading rather than measuring

Neither showed up in any timing, and both were real:

- **`invalidateIssuesCache(dataPath)` never matched anything.** Entries are keyed
  `<dataPath>::<flags>`; it deleted the bare `dataPath`. Only the clear-everything
  form ever worked.
- **`paths.ts` found the framework root by counting directory levels**, which was
  correct only because Astro 5 happened to bundle chunks at a matching depth. Astro
  7 bundles one level deeper and every theme lookup went to `dist/src/styles`. A
  latent defect that the upgrade exposed rather than caused.

# What did not improve

Stated plainly, because a list of only wins is not a measurement:

| | Before | After |
|---|---|---|
| Dev server ready | ~400 ms | **~1,057 ms** |
| Built HTML, total | 73.8 MB | **79.7 MB** (+8%) |
| Typecheck errors | 27 | 27 — unchanged, not fixed |
| Detail page, first request | 1.576 s | 1.245 s — better, but still over a second |

Dev boot got 650 ms slower. Against a build that got seven seconds faster and a
first request that halved, that is a trade worth taking — but it is a real
regression and it is the one thing a person feels on every restart.

# Not measured

- **How any of it looks.** The theme CSS moved from an inline `<style>` to a
  `<link>`; whether a cold cache flashes is a claim about rendering and needs eyes.
- **`./start`** against Astro 7's changed CLI.
- **RAM of the dev server over a long session** — the figure that opened this whole
  thread (874 MB) was never re-measured after the upgrade. Only *build* RSS was.
  That gap is worth closing, because sustained dev memory is what actually bites.
