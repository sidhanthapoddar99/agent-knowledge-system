---
title: "What each step bought"
---

Four steps landed. Each one is scored below on the same four dimensions — **speed
(and where), memory, disk, and net impact** — with the subtask it came from.

All figures measured on one machine, 2026-08-07, Node 24.16.0 / bun 1.3.14.
Nothing is estimated. Where a dimension was not measured, the cell says so rather
than guessing.

**Read this before any dev timing.** Dev numbers depend entirely on which request
comes first:

| Protocol | Meaning |
|---|---|
| **A** | `/todo` is the first request to a fresh server — pays to compile the shared module graph *and* do its own work |
| **B** | other routes go first, so `/todo` pays only the issues-specific cost |

The gap between them is ~1 s of Vite compilation that every route pays once and
that nothing here changes. Comparing an A number with a B number invents a result.

# The scoreboard

| Step | Speed | Memory | Disk | Net |
|---|---|---|---|---|
| 1 · Index loader | `/todo` **1.206 s → 0.155 s** | not isolated | — | **Removes work that grew with the tracker** |
| 2 · Theme CSS | no server-side change | not isolated | **−62.8 MB built HTML** | **−25% bytes per page, cached after the first** |
| 3 · Shared caches | none | one cache, not two (not quantified) | — | Correctness; unblocked step 4 |
| 4 · Astro 7 | build **13.9 s → 7.1 s** | build peak **2,049 → 1,239 MB** | node_modules **+106 MB** | **Flat win on build, regression on boot** |

---

# Step 1 — the index loader reads metadata only

[Subtask: index loader reads frontmatter only](../subtasks/010_load-time/010_index-loader-frontmatter-only.md)
· [stage 20](../plans/01_implementation/20_load-time-fix.md) · commit `ae16663`

The index reads ids, dates, `meta.*` and its subtasks' statuses — and not one
rendered body. It was rendering every tracked file in the tracker to produce them.

**Speed — where: the dev server, on every issues page.**

| | Before | After | |
|---|---|---|---|
| `/todo`, protocol B | 1.206 s | **0.155 s** | 7.8× |
| `/todo`, protocol A | 2.570 s | 1.039 s | 2.5× |
| Detail page, first request | 2.543 s | 1.576 s | 1.6× |
| `/todo`, warm | 0.034 s | 0.033 s | unchanged |

**Memory:** not isolated. The change stops materialising ~861 rendered bodies per
index load, so it must reduce peak allocation, but no per-step measurement was taken.

**Disk:** none. Output bytes are identical; this is server-side work only.

**Net impact — this is the one that answers "it gets worse as the repo grows".**
The cost removed was proportional to tracker size: N bodies rendered to list N
titles. It changes the slope, not just the intercept. The other three steps are
flat wins.

---

# Step 2 — theme CSS served from `/theme.css`

[Subtask: theme CSS delivery](../subtasks/010_load-time/020_theme-css-delivery.md)
· [stage 20](../plans/01_implementation/20_load-time-fix.md) · commit `e22df2a`

The same 65 KB stylesheet was inlined into all 1,016 rendered pages.

**Speed — where: the browser, not the server.** Dev timings did not move
(0.155 s → 0.162 s, noise). What changes is transfer and parse: after the first
page, the stylesheet is cached and every later page carries 25% fewer bytes.

**Memory:** not isolated.

**Disk — the largest single effect in the issue:**

| | Before | After |
|---|---|---|
| Built HTML, all files | 136.6 MB | **73.8 MB** |
| `/todo` raw | 388,997 B | 324,171 B |
| `/todo` gzipped | 51,928 B | **39,138 B** |
| Inline `<style>` per page | 64,938 B | **0** |

**Net impact:** 62.8 MB of the built site was one stylesheet copied 1,016 times.
It also turned out to be **load-bearing for partial rebuilds** — before it, editing
a single colour rewrote every page, which would have capped any incremental scheme
at useless. See [the partial-rebuild note](../brainstorm/01_partial-rebuilds.md).

`/artifacts/**` keeps its own inline block: 277 pages that are standalone by contract.

---

# Step 3 — caches shared on `globalThis`

[Subtask: module-level cache state](../subtasks/030_correctness/010_cache-module-state.md)
· [stage 30](../plans/01_implementation/30_de-risk-the-upgrade.md) · commit `033c5ff`

Vite gives the plugin context and the SSR request context their own instance of a
module, so a module-level `Map` was two Maps. Reproduced by counting: instance #1
at boot, instance #2 on first request, both alive at once.

**Speed:** none. **Disk:** none. **Memory:** one cache instead of two — real, but
not quantified.

**Net impact — correctness, and it bought the next step.** What the split actually
broke was *targeted invalidation*, not freshness (the mtime signature covers that
independently). It also removes the reason the `moduleGraph` reach-in in
`integration.ts` exists, and it was a hard prerequisite for step 4.

**Worth carrying to [the migration issue](../../2026-05-08-runtime-stack-migration/issue.md):**
this bug is that issue's stated justification, and it is narrower than described.

---

# Step 4 — Astro 5.17.1 → 7.2.0 (Vite 6 → 8, Rolldown)

[Subtask: the upgrade](../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md)
· [stage 40](../plans/01_implementation/40_the-upgrade.md) · commit `82c7262`

**Speed — where: the build, and first-request compile. Not warm requests.**

| | Before | After | |
|---|---|---|---|
| Build, wall (3 runs) | 13.7–15.1 s | **7.1–7.3 s** | ~2× |
| `/todo` first request | 1.039 s | **0.590 s** | 1.8× |
| Detail, first request | 1.576 s | **1.245 s** | 1.3× |
| `/todo` warm | 0.033 s | 0.034 s | unchanged |
| **Dev server ready** | ~400 ms | **~1,057 ms** | **2.6× worse** |

**Memory — the best result here, and it was free:**

| | Before | After |
|---|---|---|
| Build, peak RSS | 2,049 MB | **1,239 MB** (−38%) |

Dev-server RSS on Astro 7 measured at **229 MB at boot → 557 MB after 4 pages →
597 MB after ~40 page loads**. ⚠️ **No delta is claimed against Astro 5**: the old
431 MB / 809 MB figures came from a different request sequence, so there is no
controlled comparison. That gap is still open and is the one worth closing, because
sustained dev memory is what is actually felt.

**Disk — this one got worse:**

| | Before | After |
|---|---|---|
| `node_modules` | 419 MB | **525 MB** (+106) |
| Built HTML, total | 73.8 MB | **79.9 MB** (+8%) |

**Net impact:** a flat ~2× on build and −38% build memory, paid for with a slower
dev boot and 106 MB more on disk. Worth taking, but not free.

**The plan predicted this step would buy nothing measurable.** That was wrong about
build time and wrong about memory — the dimension named first in the original
problem list — and right about warm request time.

---

# Two fixes that showed up on no stopwatch

Both found by reading, both real:

- **`invalidateIssuesCache(dataPath)` never matched anything.** Entries are keyed
  `<dataPath>::<flags>`; it deleted the bare `dataPath`. Only the
  clear-everything form ever worked. ([step 1's commit](../subtasks/010_load-time/010_index-loader-frontmatter-only.md))
- **`paths.ts` found the framework root by counting directory levels**, correct only
  because Astro 5 happened to bundle chunks at a matching depth. Astro 7 bundles one
  level deeper and every theme lookup went to `dist/src/styles`, killing the build on
  the first page. A latent defect the upgrade *exposed*, not one it caused.

# The combined position

| | Start of day | Now |
|---|---|---|
| `/todo`, protocol B | 1.206 s | **0.155 s** |
| `/todo`, first request of all | 2.570 s | **0.590 s** |
| Build, wall | 13.9 s | **7.1 s** |
| Build, peak RSS | 2,049 MB | **1,239 MB** |
| Built HTML | 136.6 MB | **79.9 MB** |
| `/todo` gzipped | 51,928 B | **40,167 B** |
| Typecheck errors | 27 | 27 — unchanged, not fixed |
| Dev server ready | ~400 ms | ~1,057 ms |
| `node_modules` | 419 MB | 525 MB |

Real browser traffic during the run served pages at **14–17 ms**, `/theme.css` at 0 ms.

# Not measured, and it should be said

- **Sustained dev-server RAM against a controlled Astro 5 baseline.** The single
  most relevant number to the original complaint, and the one still missing.
- **Per-step memory** for steps 1–3. Only whole-build RSS was captured.
- **How any of it looks.** The stylesheet moved from inline `<style>` to `<link>`;
  whether a cold cache flashes is a rendering claim and needs eyes on a screen.
- **`./start` against Astro 7's changed CLI** — background mode, a per-project lock,
  and a JSON ready line the wrapper parses.
