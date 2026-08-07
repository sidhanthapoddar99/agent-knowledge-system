---
title: "The case against the migration, and the cheaper alternatives"
---

# The case against the migration, and the cheaper alternatives

**Verdict up front: do not do it now.** The migration's stated trigger has a ten-line
fix that four files in the same directory already use. Its performance case is built on
numbers that are wrong by 6× to 150× in the direction that favours the rewrite. Its
distribution case is real, well-engineered, and currently serves **zero users** — the
repo is public, has 0 stars, 0 forks, 0 watchers and 0 release-asset downloads
(measured against the GitHub API, 2026-08-07). And the price is six to twelve months of
a one-person project's entire output, during which the five high-priority issues in the
tracker — including the whole editor line, which is also the hardest thing to port —
ship nothing.

The parts of the case that survive scrutiny are: **binary size** (my own `go build`
probe lands inside the note's budget), **memory** (the note *understates* how bad Astro
dev is), and **one genuine architectural defect** — dev and production disagree about
URLs today, reproducibly. That defect is the strongest argument in the entire proposal
and it does not need Go to fix.

Conditions that would flip this to "do it" are in section 6. They are specific and
testable; none of them is true today.

---

## 1. The numbers audit

Everything below was measured on this machine on 2026-08-07 against the live dev server
(pid 338292, port 3088, `astro dev`, Astro 5.17.1) and a real `go build`. Sources for
the claims: [`notes/architecture/06_performance-comparison.md`](../../../notes/architecture/06_performance-comparison.md)
and [`notes/architecture/04_distribution-single-binary.md`](../../../notes/architecture/04_distribution-single-binary.md).

**Every quantitative claim I could reach, with the measurement beside it.** Units on
every number; "unverifiable" means no Go implementation exists to measure.

| # | Claim in the notes | Claimed | Measured | Error direction |
|---|---|---|---|---|
| 1 | Astro dev cold start | 2 000–4 000 ms | **1 808 / 1 846 / 1 914 ms** to first HTTP 200 on `/`, 3 clean runs; Astro's own "ready" line 351–368 ms | overstated ~1.5–2× |
| 2 | Astro dev first byte, cached | 50–200 ms | **5.5–8.7 ms** (`/`, `/blog`, `/user-guide/…`, `/dev-docs/…`); **26.6–35.7 ms** (`/todo`, `/todo/<issue>`) | overstated 6–25× |
| 3 | Astro dev first byte, cold render | 200–600 ms | **300–479 ms** (first hit on an uncompiled route) | roughly right |
| 4 | Markdown re-render on save | 150–400 ms → 30–80 ms in Go | the **entire warm request** — route match, load, render, layout, serve — is 6–8 ms | falsified |
| 5 | Idle memory, Astro dev | 150–300 MB | **874 MB RSS** after 24 min of ordinary use (+46 MB esbuild child) | **understated — favours Go** |
| 6 | `node_modules/` | ~150 MB (arch note) / ~250 MB (`issue.md`) | **424.7 MB** apparent, **487 MB** on disk, 463 top-level packages | understated 1.7–2.8× |
| 7 | Embedded `dist/` (compressed) | 1–2 MB | **6.13 MB** gzip -9 / **23.19 MB** raw, 546 JS files | understated 3–6× |
| 8 | CodeMirror bundle in `dist/` | 180 KB compressed | `codemirror-setup` chunk is **305 938 bytes raw** | understated |
| 9 | Yjs server (`y-go`) | ~2 MB | linking `reearth/ygo` v1.45.0 and exercising `crdt.New()` + `EncodeStateAsUpdate()` adds **434 176 bytes** | overstated 4.6× — favours Go |
| 10 | Total stripped binary | 25–35 MB | **21.1 MB** (pre-gzipped assets) → **25.7 MB** (+ go-git) → **38.0 MB** (raw assets), before any application code | **roughly right, if assets are pre-compressed** |
| 11 | Tracker git walk | 11 ms (12 commits) | **50 ms**, 307 643 bytes, 3 runs, over today's tracker | understated 4.5× |
| 12 | Full corpus rebuild | 8–15 s for 327 pages | 1 229 pages in 14.76 s (read, surface 016) | page count off 3.8× |
| 13 | bun startup tax per CLI call | ~150 ms | `bun -e ''` × 20 = **0.019 s total → ~1 ms each** | overstated ~150× |
| 14 | `agent-ks issue list` | ~250 ms | × 10 = **0.317 s → 31.7 ms each** | overstated 8× |
| 15 | "Fast prod and full features are mutually exclusive" | structural | `astro.config.mjs:92` is `output: isDev ? 'server' : 'static'`, with a comment saying the choice is for **fast CDN builds**. No adapter installed. | **a config line, not a framework limit** |

### The binary-size claim actually survives — I built it

This is the one place where a sibling audit (surface 017) is wrong and the proposal is
right, so it is worth stating plainly. I compiled a real probe: `net/http` + `chi` +
`cobra` + `goldmark` (GFM/table/tasklist/auto-heading-id) + `chroma` v2 (full lexer and
style registry) + `fsnotify` + `yaml.v3` + `html/template` + `reearth/ygo` + `go-git`,
all with `-ldflags="-s -w"`, embedding the repo's real `dist/_astro`.

Measured, in bytes:

```
  net/http hello world                       5 828 873
  goldmark only                              2 707 618
  chroma only                                6 619 298
  full stack, NO embedded frontend          14 717 193
  full stack + raw dist/_astro (23.19 MB)   37 957 897
  full stack + PRE-GZIPPED dist (6.31 MB)   21 082 377
    + ygo exercised                         21 516 553
    + go-git                                25 727 241   ← realistic floor
```

So the honest figure is **26 MB with pre-compressed assets, 43 MB without** — plus the
project's own ~20 000–30 000 lines of Go, which I did not model (assume +2–5 MB).
**~28–31 MB compressed-assets, ~45–48 MB raw.** The note's 25–35 MB budget is
defensible; it just quietly assumes pre-compression, which then forces
`Content-Encoding: gzip` on every asset response. Say that out loud in the design.

Two corrections that follow: the frontend payload is not `1–2 MB`, it is **6.13 MB
gzipped**; and moving the editor's client-side syntax highlighting server-side saves
**1.62 MB gzipped** (234 TextMate grammar chunks, 8.68 MB raw) plus 0.21 MB of themes —
a real lever, but 1.8 MB, not the 7 MB that a raw-byte reading suggests.

### The two rows that carry the whole performance case are the two that are wrong

Rows 2 and 4 are the ones a reader remembers: *pages take 50–200 ms today and will take
5–15 ms*. Measured, a warm docs page today takes **5.5–8.7 ms** — already inside the
proposed target. There is no 10× to win on the common path. The real gap is on the
issues pages (26–36 ms), and roughly 14 ms of that is `computeSignature` being called
twice per request (read, surface 016) — a caching bug, not a runtime tax.

Row 4 is worse than wrong, it is self-refuting: markdown re-render cannot cost 150–400 ms
when the complete request costs 6–8 ms.

### Row 15 is the one that should change the decision

The performance note's own framing — *"today, 'fast prod' and 'full features' are
mutually exclusive; after migration they're the same thing"* — is called "the deepest
win". It is not a property of Astro. `astro.config.mjs` chooses `output: 'static'` for
production **deliberately**, and the comment in the file says why (CDN builds). Astro
supports `output: 'server'` in production with `@astrojs/node`; the repo simply has no
adapter installed (29 runtime deps, none of them an adapter).

That means the four-way comparison table is missing its most important column:

```
   the table compares          what it omits
   ┌──────────────┐            ┌──────────────────────────┐
   │ Astro dev    │  slow      │ Astro SSR prod           │  ← never measured,
   │ Astro static │  no feats  │ (@astrojs/node, no Vite) │    never mentioned
   │ Go+Vite dev  │            │ full features + prod     │
   │ Go+Vite prod │  ← winner  │ perf, ~2 lines of config │
   └──────────────┘            └──────────────────────────┘
```

Astro SSR prod is the direct competitor to Go+Vite prod: same feature set, no Vite in
the request path, no rewrite. Nobody has measured it. Until someone does, the
performance case is a comparison against a straw configuration.

---

## 2. Pricing the alternatives

The stated trigger is one bug: under Vite 6, the plugin context and the SSR context can
hold separate instances of `loaders/issue-dates.ts`, so the watcher clears one cache and
the renderer reads the other. Full write-up:
[`brainstorm/04_discuss_stack-and-migration/05_issue.md`](../../../brainstorm/04_discuss_stack-and-migration/05_issue.md).

**Five options, priced against the trigger and against the broader motivation.** Days
are solo working days.

| Option | Solves the trigger? | Cost | Leaves unsolved |
|---|---|---|---|
| **(a) `globalThis` state relocation** | **Yes, structurally** | **~1 day** | distribution, cold start, memory, dev/prod URL drift |
| (b) Upgrade to Astro 6 | Maybe — unverified | 5–10 days + regression risk | everything except currency |
| (c) Move the cache to a file / socket / sidecar | Yes, at a cost | 4–8 days | same as (a), plus new failure modes |
| (d) Stay on Astro, extract only what hurts | Yes (includes (a)) | 15–25 days | single-binary distribution |
| (e) `bun build --compile` the existing stack | No (orthogonal) | 3–10 days, unverified | the trigger; but delivers the single binary |
| **The migration** | Yes | **120–260 days** (section 3) | — |

### (a) Fix it inside Astro — one day, using a pattern the repo already has

This is the finding that most damages the proposal, and I verified it directly.

`loaders/cache-manager.ts:44` and `loaders/paths.ts:131` both park their mutable state
on `globalThis` under a string key. `paths.ts` carries the comment:

> `// Use globalThis to persist state across Vite module reloads`
> `// (astro.config.mjs and runtime may load this as separate module instances)`

A process has exactly one `globalThis`, so state hung there is immune to module-instance
splitting **by construction** — the same structural immunity Go is being bought for.
`loaders/cache.ts` and `loaders/theme.ts` use the same pattern. Four files.

Grepping for bare module-level caches across `src/loaders/` and `src/parsers/` returns
exactly two hits:

```
  src/loaders/issue-dates.ts:40   const cache = new Map<string, CacheEntry>();
  src/loaders/issues.ts:462       const cache = new Map<string, CacheEntry>();
```

Those two files are the entire bug. The fix is to wrap each in a `getState()` accessor —
about ten lines each — after which the 25-line `server.moduleGraph.invalidateModule`
reach-in at `dev-tools/integration.ts:206–232` can be deleted outright.

**Cost: one day including a commit-and-refresh check. Risk: near zero.** It does not
merely work around the bug; it removes the bug class for these two caches on exactly the
same principle Go would ("one process, one copy of the state"). The claim in the trigger
note that this is *"structural, not a bug we can fix"* is true of the Vite module graph
and false of this repo's cache, because the repo already contains the fix.

That matters for the argument, not just the code: the migration's headline justification
is a defect whose remedy is already sitting in the same directory.

### (b) Astro 6 — reject, and the existing research is right

Read all four files of
[`brainstorm/03_research_astro-6-upgrade/`](../../../brainstorm/03_research_astro-6-upgrade/01_overview.md).
The research is honest and its verdict holds on its own merits, independent of the Go
decision:

- It does **not** reliably solve the trigger. Astro 6.3.4's upstream fix (#16757) targets
  file-change HMR; this repo's invalidation is driven by **git-ref** changes. Whether it
  covers that path is marked ⚠️ unverified and remains so.
- Its failure mode is the dangerous one: if Vite 7's Environment API renames
  `server.moduleGraph` or changes id normalisation, the loop no-ops and logs the *benign*
  first-load message. Stale timestamps return with no error and no build signal.
- Every genuinely useful Astro 6 feature (content layer, collections, Zod, image service,
  adapters) is inert here, because this framework owns its own content pipeline.

The upgrade buys currency and nothing else. **But note that the cancellation reasoning is
now circular:** Astro 6 was cancelled *because the Go migration is the adopted direction*,
and the Go migration is justified partly by a bug class that Astro 6 might have fixed. If
the migration is not adopted, the Astro 6 decision needs re-taking on its own merits — and
option (a) is what makes it re-takeable without urgency.

### (c) Move the cache out of module state entirely

A file under `.cache/`, or a sidecar process, keyed by project directory — this is what
[`brainstorm/05_idea_backend-side-cache-isolation.md`](../../../brainstorm/05_idea_backend-side-cache-isolation.md)
proposes for a different problem (localStorage collisions across projects on the same
port). It works: a file has one copy no matter how many module instances read it.

It costs 4–8 days and buys concurrency questions, staleness questions and a serialisation
format you did not previously need. `globalThis` gets the same guarantee for a tenth of
the work. **Take (a) instead.** (c) only wins if state must survive a process restart,
which for a git-derived cache it need not.

### (d) Stay on Astro, extract only what hurts

The honest version of the migration. Four items, each independently valuable, each
shippable alone:

| Extract | Why | Days |
|---|---|---|
| `globalThis` for the two caches | kills the trigger | 1 |
| **One URL resolver for dev and build** | kills the only measured architectural defect | 5–8 |
| Fix the double `computeSignature` per issue request | ~14 ms of the 27 ms issue-page cost | 1–2 |
| Install `@astrojs/node`, offer `output: 'server'` in prod | kills "fast prod vs full features" | 2–3 |
| Delete the dead weight found by the audits | `@astrojs/mdx` (0 `.mdx` files), presence (267 lines, no client), 702 unreferenced editor lines, ~120 lines of dead cache API | 3–5 |

**Total 12–19 days**, and it addresses every defect the seven audits actually *measured*,
as opposed to projected.

The URL-resolver item deserves emphasis because it is the proposal's best evidence and
gets buried under the performance tables. I reproduced it:

```
  /user-guide/nope-does-not-exist
      dev   → HTTP 404, a styled 296 909-byte page
      dist/ → no such file, no dist/404.html at all → bare host 404

  /todo/<issue>/plans/<plan>/<nonexistent>
      dev   → 302 to the plan page   (route-match.ts:225-242 falls back on ANY 3rd segment)
      dist/ → absent                 (static-paths.ts:128-149 emits only real stage names)
```

Two implementations of the same URL knowledge, already drifted, already producing
different HTTP behaviour. That is a real, present, user-visible defect. **It is also
purely a code-organisation problem — merging `route-match.ts` (369 lines) and
`static-paths.ts` (172 lines) into one resolver is the same work in TypeScript as in Go.**
Rewriting the runtime to get it is paying 300 days for a 6-day fix.

### (e) The single binary without the rewrite

If distribution is the real goal, the language is not the only lever. `bun build
--compile` produces a self-contained executable with no `node_modules`.

Measured: a hello-world bun executable is **94 582 912 bytes (94.6 MB)**. An Astro
node-adapter server compiled the same way would land somewhere around 100–120 MB.

| | Go rewrite | `bun --compile` |
|---|---|---|
| Binary size | ~28–31 MB | ~100–120 MB (baseline 94.6 MB measured) |
| Consumer install | one file | one file |
| `node_modules` on consumer machine | none | none |
| Cross-compile | native, 5 targets | bun supports cross-targets |
| Engineering cost | 120–260 days | 3–10 days, **unverified** |
| Rewrite risk | total | none |

**This is unverified** — Astro's node adapter reads client assets from disk at runtime and
that may or may not survive `--compile` without a shim. It is a 1–2 day spike and nobody
has run it. If it works, the migration's single largest claimed user benefit is available
for under two weeks of work at 4× the binary size, and the entire Go case collapses to
"memory and cold start".

---

## 3. The total cost nobody budgets

### Rolling up the seven surfaces, then de-duplicating

The surface estimates, summed raw, come to **38–59 weeks**. They overlap: the artifact
and diagram loaders plus the three serving routes are counted by the content-pipeline,
rich-surfaces *and* loaders audits; CSS de-scoping is counted by both theming and layouts;
the dev API routes by both dev-tools and loaders. De-duplicating conservatively at 15–20%:

| Workstream | Raw | De-duplicated | Note |
|---|---|---|---|
| Content pipeline | 3–5 wk | 3–4 wk | Chroma dual-theme formatter is the long pole |
| Layouts + routing | 6–9 wk | 6–9 wk | `issues/default` alone is 7 825 lines / 47 files |
| Theming + CSS de-scoping | 2–3 wk | 2–3 wk | 1 364 lines lose Astro's scoping silently |
| Client-rich server half | 2–3 wk | 1–2 wk | overlaps pipeline + loaders |
| Dev tools + editor + CRDT | 7–10 wk | 6–9 wk | 4–5 wk if presence dropped and toolbar becomes plain pages |
| Loaders, cache, routing | 5–8 wk | 3–5 wk | overlaps pipeline + rich surfaces |
| Distribution, plugin, docs | 13–21 wk | 12–19 wk | **docs alone is 4–8 wk and cannot start early** |
| **Total** | **38–59 wk** | **33–51 wk** | |

### Then challenge them, because porters underestimate

Three reasons to apply a multiplier, none of them generic pessimism:

1. **None of these estimates comes from a port.** They are line-count-and-shape readings.
   The layouts audit says so explicitly and names the spike that would sharpen it
   (`docs/default`, 575 lines) — which nobody has run.
2. **The hardest items are the least specified.** No note mentions the artifact route,
   the content-asset route, the MIME boundary, the first-class-page scanners, the editor
   server (1 152 lines), the CRDT server (344), the toolbar (1 793), or the dev API (187).
   That is ~3 500 lines the "what this requires us to write" list omits entirely.
3. **Equivalence verification is always cut and always needed.** 1 023 markdown files,
   6.71 MB of HTML output. Without a golden-diff harness nobody will know that 900 pages
   changed subtly. The pipeline audit budgets 3–5 days for it; that is optimistic for a
   harness that must diff highlighted code blocks across two different highlighters.

Applying 1.3–1.6× (moderate, not catastrophist): **43–82 weeks → 10–19 months solo.**

### A second, independent bottom-up from this repo's own velocity

`astro-doc-code/src` is 33 855 lines of TS/`.astro`/CSS today. Measured git churn:
**+47 174 / −3 903 lines** over 13.7 months, and **+19 405 / −3 341** in the last 90 days
— so recent net velocity is **~5 350 lines/month** (AI-assisted, and impressive).

The port must produce Go for roughly 18 800 lines of server-side TS and `.astro`
(loaders 5 935 + parsers 2 390 + pages 1 631 + `.astro` templates 5 789 + layout `.ts`
1 184 + dev-tools server 1 492 + integration 376), at Go's typical 1.2–1.6× expansion:
**22 500–30 000 lines of Go**, plus new code that has no counterpart today.

At the measured recent rate that is **4.2–5.6 months of pure line production** — before
the docs rewrite (11 068 lines invalidated across 44 pages, 18 000 more needing a
verification pass, and it cannot begin until the Go exists), before the plugin decision,
before Windows CI that does not exist, before the release-note template that does not
exist for this document type.

**Two bottom-ups, one from surface estimates and one from measured velocity, bracket the
same answer: 6–12 months, most likely 8–10.** Confidence: moderate. I would bet against
anything under 6 months and against anything over 18.

### What does not get built

26 open issues. Five are `high` priority:

| Priority | Component | Issue |
|---|---|---|
| high | components | Site-wide search (Orama) |
| high | components | Artifacts (HTML) as first-class content — *in progress* |
| high | editor | Editor V2 core surface |
| high | ai-plugin-and-docs | Documentation update phase 2 — *in progress* |
| high | loaders-and-renderers | The renderer owns the URL — absolute link resolution + hosting path prefix |

**Six of the 26 open issues are `editor`** — Editor V2 core, Editor V2 advanced
authoring, Yjs sync and multi-user presence, IDE-style navigation, presentation modes,
server lifecycle. The editor is simultaneously the largest active workstream and the
single hardest surface to port (7–10 weeks for parity, an unproven Go CRDT library, and
a dev-toolbar host that does not exist in any language). The migration and the product
roadmap collide head-on.

Note also the last high-priority row: *"The renderer owns the URL"* is already an open
issue. It is the same defect the migration cites as its architectural motive. It is
scoped, filed, and does not require Go.

---

## 4. The language-count problem

Measured inventory of what a contributor must already read:

| Language / dialect | Where | Lines |
|---|---|---|
| TypeScript | `astro-doc-code/src/**` (134 `.ts` files) | ~26 500 |
| Astro components | 53 `.astro` files | 5 789 |
| CSS | 18 `.css` files + 13 `<style>` blocks | 6 046 |
| JavaScript (ESM `.mjs`) | `plugins/agent-ks/**`, `scripts/check-links.mjs` | 9 024 |
| Python (stdlib) | `migration/` — 8 scripts | 2 577 |
| Bash | `start`, `bin/` shims | ~280 |
| PowerShell | `start.ps1` | 232 |

Seven surfaces today, in one repo, maintained by **one person** (562 + 55 commits, both
the same author; zero external contributors in 616 commits).

The migration **adds Go, and probably `templ`** (a Go template dialect with its own
compiler), while removing none of the above:

- TypeScript **stays** — 1 643 lines of `src/scripts` + 1 731 lines of layout scripts +
  ~3 900 lines of live editor client. Vite stays in the design, so the browser half never
  leaves.
- The plugin CLI is **`.mjs`, 9 024 lines, zero npm dependencies** — and absorbing it into
  Go is measurably not worth it: bun startup is 1 ms (not 150), `issue list` is 32 ms (not
  250), `check section` over 95 pages is 30 ms — already faster than the note's *projected*
  Go time of 40 ms. Realistic ceiling ~6×, saving ~1.3 s per 50 calls.
- Python `migration/` stays — it is runtime-agnostic by design.
- Shell shrinks by ~56% of `start`, and `start.ps1` genuinely disappears. That is the one
  real reduction.

Net: **7 languages → 8 or 9.** And the cross-language duplication is not hypothetical —
it is already named by three surfaces:

```
     TODAY                            AFTER
  ┌──────────────────┐            ┌──────────────────┐
  │ issue-status.ts  │            │ issue_status.go  │  server
  │  238 lines       │  ONE       └────────┬─────────┘
  │  imported by     │  module             │ must be kept identical
  │  5 browser files │            ┌────────┴─────────┐
  │  AND the render  │            │ issue-status.ts  │  browser (5 importers)
  │  path            │            └──────────────────┘
  └──────────────────┘
     Vite guarantees            a codegen step + a CI gate,
     they cannot disagree       or they drift silently
```

The same split hits the markdown renderer: today `dev-tools/editor/renderer/index.ts`
(184 lines) and the server pipeline use the *same* marked + marked-alert + shiki, so the
editor preview and the published page cannot disagree. After migration one is goldmark +
chroma and the other is marked + shiki, in different languages, and they will diverge on
CommonMark edge cases, alert markup and highlighter classes. There is no fix that keeps
both the single binary and the fidelity.

**For AI-assisted development specifically** — this project's stated purpose — the effect
is subtler than "more languages is harder". An agent asked to change how issue status is
rendered currently edits one file. Afterwards it must edit a Go file, a TypeScript file
and a generated artefact, in the right order, and know that a gate exists. Every
cross-language duplication is a place where a plausible-looking single-file edit is
silently wrong. That is precisely the failure mode this repo's own conventions are built
to prevent.

---

## 5. The honest loss list — what the notes have not noticed

Extracted from the seven audits, filtered to **major and fatal**, and split by whether the
design notes acknowledge it. An unacknowledged loss is worth more than a priced one.

**Not acknowledged anywhere in `notes/`:**

| Loss | Why it bites |
|---|---|
| **`.html` deliberately absent from the shared MIME map** | The security property is expressed as an *absence* in `lib/mime.ts`. Go's `mime.TypeByExtension` returns `text/html` by default. A faithful-looking port silently turns every colocated `.html` in the tracker into executable first-party HTML on the site origin. This is a security regression that a smoke test passes. |
| **External layouts can run server-side code** | Every built-in custom layout (`home`, `info`, `countdown`) imports `@loaders/data` and calls `loadFile()`. The user guide calls `LAYOUT_EXT_DIR` "the recommended path". A runtime-parsed Go template can render only what the Go handler already unmarshalled — so a user layout with a new data shape needs a binary rebuild. `05_runtime-config-surface.md` calls this surface "identical". It is not. |
| **Editor-save echo suppression against the file watcher** | `editor-store.ts` counts `writeFileSync` calls against chokidar events, explicitly "no timing assumptions". fsnotify emits a *different number of events per write*. A miscount makes the editor's own save look external → `reloadFromDisk` + `resetContent` → the user's text and cursor are stomped mid-typing. Highest-probability regression in the whole port, and invisible to a smoke test. |
| **The theme CSS is inlined, not linked** | 64 864 bytes per page × 1 251 pages = 46.3% of the built site. Zero stylesheet fetches, zero FOUC even on a cold cache. `05_runtime-config-surface.md` proposes serving raw linked CSS files and calls that identical behaviour. It is a different first-paint model. |
| **The Astro dev-toolbar host** | `addDevToolbarApp`, per-app shadow roots, the toggle state machine, overflow grouping — proprietary, with no equivalent in Go, Vite or standalone. 1 793 lines across 6 apps depend on it. `03_vite-frontend-and-dist.md` names only the two smallest (319 of 1 793 lines) and offers "or dropped from v1". |
| **The engine version series has no defined continuation** | `ENGINE_VERSION` 0.2.4, `MIN_CONTENT_VERSION` 0.2.0, hard startup gate. Continue → Go must parse every 0.2.x format byte-for-byte at v1. Fork → breaks the `/^\d+\.\d+\.\d+$/` regex and the migration ordering rule. Restart at 1.0.0 → every existing tree falls below the floor and hard-stops on startup. Not retrofittable after the first Go release ships. |
| **The plugin distribution channel** | Claude Code auto-PATHs a plugin's `bin/`, and cannot carry five ~30 MB platform binaries. Today `/plugin install` is the entire install for 37 commands at a 1.4 MB payload. Bundling binaries makes it ~150 MB; not bundling makes every command require a separate install first. |
| **`agent-ks img` shells out to ImageMagick** | In Go: the same shell-out (no gain), CGo (loses the static binary), or a re-implementation that loses webp/avif delegate parity. Never mentioned. |

**Acknowledged, but under-priced:**

| Loss | The under-pricing |
|---|---|
| Shiki dual light/dark in one payload | Chroma renders one theme per pass. The mitigation — a custom Chroma formatter emitting Shiki's exact `--shiki-dark` span shape — is the single largest line item in the pipeline port (5–8 days), and it swings to ~15 days if byte-identical output is required. |
| TextMate grammar fidelity | Shiki uses VS Code's own grammars, including embedded-language support (28 requested → 52 loaded). Chroma's lexers are hand-written and coarser. HTML with inline script/style and markdown-in-markdown degrade visibly. **There is no mitigation that preserves the single-binary goal.** |
| Astro's automatic CSS scoping | 1 364 lines across 13 components. The failure mode is silent: nothing errors, a rule just starts applying somewhere new. |
| Preview/published fidelity | See section 4. |
| The 37-command CLI | Every note plans for 11. The mapping table omits 26 commands, 180 flags, 32 `--json` schemas. |
| 11 068 lines of docs invalidated | Across 44 pages; another ~18 000 need a verification pass. Cannot be parallelised with engine work because it documents code that does not exist yet. |

**Things the notes list as losses that are not losses at all** — worth deleting from the
design so the ledger is honest: there are **zero** Astro islands, **zero** `client:*`
directives, **zero** `define:vars`, **zero** ViewTransitions, and **zero** `.mdx` files in
this repo. The "~30 KB island runtime" being replaced does not exist. The measured eager
JS budget today is 21.9–42.3 KB per page, not the "~300–500 KB" the notes quote — already
inside the proposal's own target.

---

## 6. The conditions test

Not a mood — a checklist. **Run it; the answer changes when the answers change.**

### The migration is clearly RIGHT when *all* of these hold

| # | Condition | Today |
|---|---|---|
| 1 | There are consumers who cannot install Node — measured, not projected | ❌ 0 stars, 0 forks, 0 watchers, 0 release-asset downloads, 1 contributor |
| 2 | The cheap fixes have been shipped and the pain persists | ❌ `globalThis` (1 day) and the single URL resolver (5–8 days) are both unshipped |
| 3 | Astro SSR prod has been measured and is genuinely insufficient | ❌ never measured; no adapter installed |
| 4 | `bun --compile` has been spiked and does not deliver the binary | ❌ never attempted |
| 5 | A `docs/default` port spike exists and confirms the effort model | ❌ no `.go` file and no `go.mod` in this repo |
| 6 | A `reearth/ygo` ⇄ `y-codemirror.next` conformance test has passed | ❌ 1–2 day spike, never run |
| 7 | The feature roadmap can absorb 6–12 months of zero feature output | ❌ 5 high-priority issues open, 6 of them in the editor line |
| 8 | Someone other than the sole maintainer can carry Go | ❌ zero external contributors in 616 commits |

Zero of eight. That is the answer.

### The migration is clearly WRONG when any of these holds

- **The trigger has a one-day fix in the current stack.** It does. This alone should stop
  it until (a) is shipped and the pain is re-assessed against reality rather than against
  a bug.
- **The performance case rests on numbers that are wrong in the proposal's favour.** It
  does — 6× to 150× on the rows a reader remembers.
- **The distribution benefit serves zero measured users.** It does.
- **The rewrite collides with the largest active workstream.** It does — the editor.
- **The team is one person.** It is.

### What would make me change my mind, in priority order

1. **Ship option (a), then wait a month.** If cache staleness still bites after the two
   caches move to `globalThis`, the trigger was misdiagnosed and everything is back open.
2. **Measure Astro SSR prod.** `bun add @astrojs/node`, `output: 'server'`, benchmark
   first-byte and RSS. If it is materially worse than the 5–8 ms and 874 MB numbers I
   measured — particularly on memory — the runtime case gets real evidence for the first
   time. My prediction: first-byte improves, memory improves a lot, and the case weakens
   further. Two days.
3. **Spike `bun build --compile` on that server.** If it produces a working ~110 MB
   single binary, the distribution argument is answered without a rewrite. Two days.
4. **Get one external user.** The entire distribution case is currently a hypothesis about
   people who do not exist yet. One real consumer complaining about a 425 MB
   `node_modules/` is worth more than every table in
   [`notes/architecture/06_performance-comparison.md`](../../../notes/architecture/06_performance-comparison.md).
5. **Then, and only then, run the `docs/default` port spike.** If a 575-line layout with
   one recursive component and one inline script takes more than five days end to end in
   Go, the 33–51-week estimate is optimistic by a lot and the decision is settled the other
   way.

### What I recommend concretely

**Keep the issue open at `low` priority as a design capture — it already is — and do not
schedule implementation.** Split off and ship, in this order:

| Order | Work | Days | Value |
|---|---|---|---|
| 1 | `globalThis` for `issue-dates.ts` and `issues.ts`; delete the `moduleGraph` reach-in | 1 | kills the trigger |
| 2 | One URL resolver serving both `serve` and `build`; add `dist/404.html` | 5–8 | kills the only measured architectural defect |
| 3 | Measure Astro SSR prod with `@astrojs/node` | 2 | replaces the missing table column |
| 4 | Spike `bun build --compile` | 2 | tests the distribution claim for 1% of the cost |
| 5 | Delete the dead weight the audits found | 3–5 | `@astrojs/mdx`, presence (267 lines), 702 unreferenced editor lines, ~120 lines of dead cache API |
| 6 | Fix the double `computeSignature`; add a Windows CI job | 3–4 | worth doing under any decision |

**16–22 days.** That buys every measured benefit the migration claims except binary size
and idle memory — and steps 3 and 4 tell you whether those two are worth 6–12 months.

If both come back negative — Astro SSR prod is slow *and* `bun --compile` fails *and* real
consumers exist — then the migration has a case, and it should be re-argued on
**distribution, cold start and memory**, which are the three claims that survived this
audit. Not on the performance tables, and not on the bug.

---

## What I could not check

Stated plainly so nothing here reads as more certain than it is.

- **Every Go-side runtime number** — first byte, throughput, memory, cold start. No `.go`
  file and no `go.mod` exist in this repo. The binary sizes in section 1 are mine and real;
  the speeds are not measurable by anyone until a spike exists.
- **Whether `bun build --compile` works on an Astro node-adapter server.** Only the 94.6 MB
  baseline is measured. The rest is `assumed`.
- **Whether the trigger bug still reproduces.** The running dev server rendered a correct
  fresh timestamp, but the cache may simply have been cold. Inconclusive, same as the
  loaders audit found. The *fix* for it is `read` from the source, and it is unambiguous.
- **The effort multiplier (1.3–1.6×).** Judgement, not measurement. The velocity-based
  cross-check in section 3 is measured and lands in the same range, which is why I believe
  the bracket.
- **`agent-ks issue list` returns 26 open issues; the tracker folder holds 54.** The
  difference is 25 done and 2 dropped, per the CLI's own tip line.
