---
title: "Astro 7.2 ships an incremental build — evaluate it before writing ours"
status: review
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

- [030 the reverse dependency graph](./030_reverse-dependency-graph.md) — kept and
  rescoped by this evaluation; see Outcomes
- [010 make the build deterministic](./010_make-the-build-deterministic.md) — now a
  hard blocker rather than a precondition-in-principle. Independently reproduced here
- [020 diff-and-copy](./020_diff-and-copy-into-dist.md) — runs first regardless;
  it solves the disk-churn half and neither approach here does
- `astro-doc-code/src/pages/lib/cache-key.ts` — the keys, and the dependency map
  they encode
- `scripts/check-incremental-staleness.mjs` — the only thing that catches a wrong key

# Todo list

- [x] Turn the flag on, add a naive `cacheKey`, and **measure the second build**.
      The whole subtask rests on that one number
- [x] Settle the `allContent` obstacle below — it decides whether the granularity
      is per-page or per-section
- [x] Check what a wrong `cacheKey` does: stale HTML, or a loud failure
- [x] Write the decision on 030 — keep, rescope to the sidebar problem, or drop
- [x] If adopted, decide whether an experimental flag is acceptable in a released
      engine, and what happens to consumers when it changes

# Outcomes and Next Steps

**It works, it is faster than expected, and it is off by default.** The mechanism
is sound and per-page granularity is achievable — but the failure mode is a
silently stale page, and one of its preconditions is not merely unmet, it is a
live defect. Turned on today it would ship wrong HTML.

## The measurement

Measured on this machine, no dev server running, `bun run build`, 1285 pages.

```
  full build                     6.25 s
  second build, nothing changed  4.20 s     -33%
  one-page content edit          4.41 s
  everything invalidated         6.50 s     (vs 6.51 s full — no overhead)
```

Inside the generate phase, which is the only part a page cache can touch:

```
                        full      cached
  getStaticPaths       2.55 s     2.56 s    unchanged — never cached
  rendering 1285 pages 2.63 s     0.55 s    -79%
  generate total       5.18 s     3.11 s
```

**The per-page win is large and the ceiling is low.** Rendering drops by 79 %,
but `getStaticPaths` is untouched and is now **61 % of the whole build**. It
still loads and renders every markdown file on every build, because Astro calls
it in full before it can consult a single key.

## The `allContent` obstacle was real but misdiagnosed

This subtask predicted that an honest key must include `allContent`, so editing
one page would invalidate its whole section. **Both halves turned out wrong, in
opposite directions.**

The props are not what creates the dependency: `docs/default/Layout.astro` ignores
the `allContent` prop entirely and calls `loadContentWithSettings(dataPath)` for
itself. So the section dependency is real, but it comes from the layout, not from
`buildStaticPaths`. **Passing the array differently would have fixed nothing.**

And the dependency is narrower than "the section's content". `buildSidebarTree`
reads only `slug`, `title`, `sidebar_label`, `sidebar_position` and `fileType` —
never a body. So the key hashes that *shape*, and a body edit leaves it untouched.

**Measured: editing one doc body rebuilds exactly one page.** Per-page
granularity, with no change to how the sidebar gets its data. The work this
subtask expected to hand to
[the path map](../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/010_thread-base-url-and-build-the-map.md)
is not needed for this purpose.

## Correctness — six tests, and the one that matters

Each edit was built incrementally and then from a cold cache, and every emitted
HTML file compared.

| Edit | Pages rebuilt | Result |
|---|---|---|
| A doc body | 1 | PASS |
| A doc title (changes the sidebar) | 105 — the whole section | PASS |
| Active theme CSS | 1057 — everything rendering chrome | PASS |
| A file inside an issue | 6 — that issue's pages | PASS |
| `navbar.yaml` | 1057 | PASS |
| **A deliberately wrong key** | 1 | **FAIL — 1 stale page** |

Counts exclude 23 pages that carry no key and always re-render (the artifacts
route and `404`).

**The last row is the finding.** Dropping `recordSalt(doc)` from the docs key and
editing a body produced a page serving the previous build's HTML — with **exit
code 0, no warning, and nothing in the log distinguishing it from a correct
page.** Astro compares the key and nothing else about the entry; it cannot know
what a layout opened while rendering. Only the external harness caught it.

That is the same failure class stages 50 and 60 of the Astro 7 issue were spent
on, and it is why this stays opt-in.

## Why it is off by default

Three blockers, in the order they have to be cleared.

**1. The build is not deterministic, and a cache makes that worse.**
[010](./010_make-the-build-deterministic.md) already names `formatRelativeTime`
as the whole cause; this run reproduced it independently — two *cold* builds one
minute apart differ:

```
- <time datetime="2026-08-08T02:16:43+05:30" …>31 min ago</time>
+ <time datetime="2026-08-08T02:16:43+05:30" …>32 min ago</time>
```

Under a cache it stops being nondeterminism and becomes permanent staleness: a
restored page keeps whatever the string said when it was first rendered, so a
cached page reads "31 min ago" until something else invalidates it. **This is
already a live defect without any cache** — a deployed static site freezes that
text at build time — which makes 010 worth doing on its own merits.

**2. Nothing detects a stale page except a full second build.** The gate now
exists (`scripts/check-incremental-staleness.mjs`) but it costs three builds, so
it is a CI job, not something anyone runs by reflex. Until it runs somewhere, a
wrong key is invisible.

**3. It is an experimental flag on a version-gated engine.** Content declares
`engine_version` and the gate hard-stops outside the supported range. Building a
release's build performance on a flag that can change shape is a cost that
arrives later as a migration nobody planned. Opt-in keeps it out of the contract.

## Caveats worth not rediscovering

- **`build.concurrency > 1` disables the cache outright**, with a warning. Default
  is 1, so this is fine today — but the two optimisations are mutually exclusive,
  and concurrency was already
  [measured as worthless here](#what-was-ruled-out-on-the-way-here-with-numbers).
- **The cache lives in `astro-doc-code/node_modules/.astro/`, not `.astro/`**, and
  it is **91 MB** — a full copy of the previous `dist/`. `./start clean` did not
  wipe it, which meant the documented escape hatch for "something is stale" left
  behind the one cache most likely to be causing it. **Fixed** — `clean` now
  removes it.
- **Astro's own `dependencyHash` has more than one stable value** and flips when
  the cache directory is wiped, so the build immediately after a cold build reuses
  nothing through no fault of any key. It costs one full rebuild and is silent.
  The harness pays a warm-up build to avoid measuring it.
- **Editing `astro.config.mjs` invalidates the entire manifest** via `configHash`.
  Correct, but it makes "why did nothing cache?" a confusing question during any
  config work.
- **Strict-mode gate runs are flaky until 010 lands** — whether they go red
  depends on a minute boundary falling between two builds.

## The decision on 030 — keep it, and change its target

**Keep [030](./030_reverse-dependency-graph.md). It is not superseded, but what it
is for has moved.**

030 was written to remove per-page render cost. Astro's flag now does that, by
79 %, for a fraction of the effort — so that justification is gone. What survives
is the part Astro's flag structurally cannot do: **`getStaticPaths()` runs in
full, every build, before any key is consulted.** That is 2.55 s and it is now the
largest single item in the build.

030's todo list already contains the right idea — *"filter `getStaticPaths` to the
affected set"*. That line is the whole remaining value; the rest of 030 is now
redundant with a first-party feature.

Its Details section also needs correcting: it budgets a ceiling of ~1.5 s on the
premise that "Generating 1,290 pages 4,280 ms" is all per-page render work. It is
not — roughly 60 % of that number is `getStaticPaths`.

Its own closing caveat still stands, and is now the strongest argument in the
file: the edit loop never runs a build, so this saves seconds per deploy, not per
edit.

## What is in the tree

Off by default; opt in with `INCREMENTAL_BUILD=1`.

- `astro-doc-code/src/pages/lib/cache-key.ts` — new. Its header carries the
  dependency map: what each surface actually reads, which is not what its props
  contain
- `astro-doc-code/src/pages/lib/static-paths.ts` — a `cacheKey` per entry
- `astro-doc-code/astro.config.mjs` — `incrementalBuild: INCREMENTAL_BUILD === '1'`
- `scripts/check-incremental-staleness.mjs` — the gate. Strict by default;
  `--ignore-clock` is a diagnostic, and [010](./010_make-the-build-deterministic.md)
  is explicit that ignoring `<time>` is not an acceptable permanent answer
- `start` — `clean` now wipes `node_modules/.astro/`

## Next steps, in order

1. **Land [010](./010_make-the-build-deterministic.md).** It is a live defect on
   its own, and nothing here can be trusted while it stands.
2. **Run the gate in CI** on any change to a key or to what a layout loads.
3. **Then flip the default**, and only then.
4. **Rescope [030](./030_reverse-dependency-graph.md)** to `getStaticPaths`
   pruning, and correct its ceiling arithmetic.

# Details

## Baseline, for comparison

Taken before any change, 3 runs:

```
  wall            6.60–7.31 s
  peak RSS        1.15 GB
  pages           1285

  types                21 ms
  collect              48 ms
  server entrypoints  249 ms
  client bundle       673 ms
  generate routes    5180 ms   ← 83% of the build, single-threaded
```

## What was ruled out on the way here, with numbers

These were measured while looking for build wins, and each is a dead end worth not
re-testing:

| Tried | Result |
|---|---|
| `build.concurrency: 8` (default is 1) | 6.45 s vs 6.63–6.99 s — **inside the run-to-run spread**, RSS flat. Page rendering is CPU-bound in one JS thread and `concurrency` is promise-level, not workers. It also **disables the incremental cache outright** |
| Running the build under Bun | **16.5–16.9 s, 2.4× slower**, 1.49 GB. Note `bun run build` already runs under **node** — `.bin/astro` has a node shebang — so the current setup is the fast path by accident. Do not "fix" this with `--bun` |
| Shiki's JS regex engine | ~9 % slower (1750 ms vs 1610 ms over 1540 highlights), saves ~52 MB. Not worth the grammar-compatibility risk |
| "Switch on Rolldown / oxc" | **Already on.** Vite 8.2.1 depends on `rolldown` directly and `build.minify` resolves to `oxc` by default. Nothing to enable |
