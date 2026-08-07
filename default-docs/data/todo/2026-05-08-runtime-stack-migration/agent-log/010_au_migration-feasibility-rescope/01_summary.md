---
title: "Summary"
---

# State

Complete. Eleven agents across two rounds; all eleven returned. The verdict is **do not
schedule the migration** — the trigger has a one-day fix and the performance case does
not survive measurement — with a 16–22 day alternative package proposed against the
current Astro codebase. Nothing was changed in the code or the notes; the corrections the
notes need and the ten defects found in passing are listed in
[the handover](./03_debrief/01_handover.md) and **not filed as subtasks**, because that is
the user's call.

# Goal

Full re-scope of the Astro to Go+Vite migration: inventory every feature surface we have
today, name what is lost or at risk, settle whether theme/CSS customization survives,
whether JIT rendering is possible, and whether a B-tree-backed cache is the right
substrate.

# Todo

- [x] [the seven-surface inventory](./02_working/010_surface-inventory.md) — priced all
      seven surfaces (38–59 weeks raw) and, more usefully, ran 46 claim-checks against the
      architecture notes; 22 came back false or partly-true and they cluster in the two
      places the migration case rests on.
- [x] [content pipeline](./02_working/011_surface_content-pipeline.md) — the least
      Astro-coupled surface in the engine: 2,390 lines with zero Astro and zero Vite API
      calls. The only real risk is Shiki's dual light/dark output, which Chroma cannot
      reproduce without a custom formatter.
- [x] [layouts and components](./02_working/012_surface_layouts-and-components.md) — zero
      islands, zero hydration directives, zero `define:vars`; the cost is that
      `issues/default` is a 7,825-line application, and that a user layout today can run
      server-side code, which the proposed design cannot offer.
- [x] [theming and CSS](./02_working/013_surface_theming-and-css.md) — the most portable
      subsystem in the repo (`fs` + `path` + `js-yaml`, one framework call); the expense is
      adjacent, in 1,364 lines of compiler-scoped CSS and the toolbar the theme switcher
      lives in.
- [x] [client rich surfaces](./02_working/014_surface_client-rich-surfaces.md) — the
      browser half is genuinely free, but 44% of this surface is server code the notes
      never mention, including a MIME decision that is a security boundary expressed as an
      *absence* in a map.
- [x] [dev tools and live editing](./02_working/015_surface_dev-tools-and-live-editing.md)
      — the expected fatal item (server-side Yjs) is not fatal: two maintained pure-Go
      ports exist. The real lock-in is the Astro dev-toolbar host, 1,793 lines with nowhere
      to live. 1,009 lines of this surface are already dead.
- [x] [loaders, cache, routing](./02_working/016_surface_loaders-cache-routing.md) — found
      the five-line fix for the migration's stated trigger, and the one architectural
      defect that is real and measured: dev and production have already drifted apart on
      URLs.
- [x] [distribution, plugin, docs](./02_working/017_surface_distribution-plugin-docs.md) —
      the CLI has 37 commands, not the 11 every note plans for; ~11,000 lines across 44
      documentation pages are invalidated, which no note budgets.
- [x] [the four deep questions](./02_working/020_deep-questions.md) — answered all four,
      two of them by building and running real Go code rather than reasoning about it.
- [x] [JIT rendering](./02_working/021_question_jit-rendering.md) — yes: 1.83 ms p50 with
      no cache at all, 0.54 ms p50 warm, 13.9 MB RSS for the whole corpus, measured on a Go
      server built for the audit. Two non-optional porting conditions attached.
- [x] [the B-tree cache](./02_working/022_question_btree-cache.md) — no, to both readings.
      Median directory fan-out is 3, so every tree collapses to one B-tree node, and a warm
      restart re-derives everything in less time than it takes to read the cache file back.
- [x] [theme and CSS parity](./02_working/023_question_theme-css-parity.md) — survives:
      13 of 21 capabilities unchanged, 6 better, 1 lost, and the one lost is framework-
      internal rather than anything a user writes.
- [x] [the case against](./02_working/024_question_case-against.md) — the strongest result
      of the run: the trigger has a one-day fix, the "fast prod versus full features"
      trade-off is a config line rather than a framework limit, and the cost is 6–12 months
      of a one-person project's entire output.

# Out of Scope

No code was changed, in either tree. The notes under `notes/architecture/` were audited
but not corrected — the corrections are listed in the handover for the user to approve,
because rewriting an issue's own design notes as a side effect of auditing them is not
what the run was asked to do. No subtasks were filed. Nothing was committed.

# Outcome

**The migration is technically sound and currently unjustified.** Both halves of that
matter, and the audit was run hard enough to be confident of each.

**Nothing is fatal.** Across seven surfaces there are **zero `fatal` losses** and sixteen
`major` ones, every one with a named mitigation. The item everyone expected to be fatal —
that Yjs is JavaScript and a Go server cannot run the authoritative `Y.Doc` — turns out to
have two maintained pure-Go ports as of August 2026, both CGO-free, adding 434 KB to a
binary. The notes' own named candidate does not exist.

**But the case for doing it does not survive measurement.** Forty-six claims from
`notes/architecture/` were checked against the code and a live dev server; twenty-two came
back false or partly-true, and they are not randomly distributed:

| | Claimed | Measured |
|---|---|---|
| Dev first byte | 50–200 ms | 6.3–8.7 ms (docs/blog/home) |
| Markdown re-render on save | 150–400 ms | ~1.4 ms per file |
| `bun` startup tax per CLI call | ~150 ms | 1 ms |
| Cold-start dev server | 2–4 s | 1.81–1.91 s |
| Embedded `dist/` | 1–2 MB | 6.1 MB gzipped / 24 MB raw |
| `node_modules/` | 150–250 MB | 419 MB |
| Idle memory | 150–300 MB | 874 MB RSS after 24 min |
| Plugin commands to port | 11 | 37 |

Every performance row overstates how slow Astro is. Every footprint row understates how
heavy it is. The performance rows are the ones the argument leans on.

**The trigger does not justify the rewrite.** The issue's stated cause is a Vite 6 SSR
module-isolation bug leaving a cache stale. A grep over `src/loaders/` finds exactly two
bare module-level caches — `issue-dates.ts:40` and `issues.ts:462` — while
`cache-manager.ts`, `paths.ts`, `cache.ts` and `theme.ts` **all already park their state
on `globalThis`**, and `paths.ts`'s own comment names Vite module splitting as the reason.
That is roughly ten lines each, after which a 25-line `moduleGraph` reach-in deletes. The
caveat is recorded honestly: the bug could not be reproduced live, so reproduce before
fixing.

**And the framing beneath it is a config line.** `astro.config.mjs:92` is
`output: isDev ? 'server' : 'static'`. "Fast production and full features are mutually
exclusive" — the note's deepest claimed win — is that line, not a framework limit. The
comparison table is missing the column nobody measured: Astro SSR in production via
`@astrojs/node`.

**Cost, two ways.** Seven surface estimates sum to 38–59 weeks; de-duplicated and given a
1.3–1.6 optimism multiplier, 10–19 months. Independently, measured churn (+19,405 net
lines in `src/` over 90 days) against 22,500–30,000 lines of Go needed gives 4.2–5.6
months of pure line production before docs, plugin or Windows CI. Both bracket **6–12
months** — against a project the GitHub API reports as 0 stars, 0 forks, 0 watchers and 0
release-asset downloads. The distribution benefit is the one part of the case that
survived, and it currently serves nobody.

## The four questions, answered

**Would we lose features?** No feature is lost outright. Six things get materially harder
and are worth naming: Shiki's TextMate grammar fidelity and its dual light/dark
single-payload output; the Astro dev-toolbar host, which 1,793 lines of working apps hang
off with no equivalent anywhere; the external-layout contract, where today a user layout
compiles as a real component that can call `loadFile` / `loadIssues` and gets a bundled
island for free; 1,364 lines of compiler-scoped CSS that must be de-scoped by hand; the
authoritative server-side CRDT; and ~11,000 lines across 44 documentation pages.

**Does CSS and theme customization survive?** Yes — the clearest result in the audit. Of
21 user-facing capabilities, 13 are unchanged, 6 improve, and 1 is lost: Astro's automatic
component scoping, which is framework-internal CSS rather than anything a user writes.
`theme.ts` is 513 lines of `fs`, `path` and `js-yaml` with one framework call, and dark
mode is entirely browser-side. Four decisions come with it, the load-bearing one being
runtime-parsed `html/template` over `templ` — `templ` would buy compile-time safety the
project has never had (no `astro check`, no `tsc` in CI, 27 errors today) at the price of
closing the advertised layout extension point.

**Is JIT rendering possible?** Yes, and it should be the default. Measured on a real Go
server built for this audit: 1.83 ms p50 / 10.11 ms p90 with no cache, 0.54 ms p50 /
1.14 ms p99 with a warm body cache holding the entire corpus in 13.9 MB. Production today
is 100% static generation (`output: isDev ? 'server' : 'static'`, 1,257 `.html` files in
`dist/`, no `entry.mjs`), so JIT replaces a build step rather than a renderer. Two
conditions are non-optional: serving one docs page must read one markdown file — today
`loadIssues` renders all 871 tracker files to build an index that reads only metadata —
and `chroma.lexers.Get` must be memoised, worth 6.5x on the corpus for ten lines.

**Should the cache be a B-tree?** No, in both senses, and the numbers are not close.
Median directory fan-out is **3 entries** against a B-tree node holding 16–32, so every
tree collapses into a single node; a linear prefix scan measured **2.8x faster** than the
B-tree range scan, and still only 0.20 ms at 100x this corpus. On disk, a warm restart
re-derives everything in **7.8 ms — less than the 11.2 ms needed to read an equivalent
cache file back**. bbolt is separately disqualified by execution rather than by argument:
it refuses a second opener (452 ms timeout, even read-only) while this repo ships a
37-command CLI users run while the server is up. Persist exactly one thing, the git-derived
`updated` dates, ~4 KB keyed by the HEAD SHA.

The experience answer is that a persistent cache would make it **worse**. At 7.8 ms warm
boot and 0.54 ms renders there is nothing to feel, and persistence buys a staleness class
that outlives the process — a wrong entry surviving a restart, and a user who now has to
learn that a cache exists. Today nobody has to. If cold start ever becomes a real
complaint the lever is syntax highlighting (85 ms without chroma against 790 ms with it),
not a database.

## What it cost, and what it found in the current code

Eleven agents, 743 tool calls, 1.97 M tokens, 42 minutes wall-clock. Two agents wrote and
ran Go benchmarks; one caught itself benchmarking on tmpfs, where `fsync` appears free, and
re-ran on ext4.

Auditing the current system to price a rewrite found **ten defects that are live today**
and independent of any migration decision — a circular theme `extends` that recurses to
stack exhaustion while the user guide claims it errors at startup; a `cache-manager` whose
advertised dependency tracking has zero call sites, contradicting both its own header and
the project `CLAUDE.md`; dev and production disagreeing on URLs; a theme folder named
`default` being unreachable; and a CSS variable used with frozen hex fallbacks that is
declared nowhere, which is precisely the failure the project's theming rule exists to
prevent. All ten, with proposed homes, are in [the handover](./03_debrief/01_handover.md).

## Two things left unsettled

The trigger bug **was not reproduced live** — the running dev server showed a correct fresh
timestamp, and "already fixed by accident" is indistinguishable from "cache was cold" from
outside. And two auditors measured the same library stack **4.8x apart** (1.36 ms against
6.57 ms per file); it changes no verdict, since Go wins at either figure, but neither
number should be quoted in a decision until the gap is explained.
