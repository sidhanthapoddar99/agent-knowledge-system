---
title: "Round 1 — seven-surface inventory of the current engine"
status: done
---

# Round 1 — what we actually have today

Seven auditors, one per surface, run in parallel against the working tree. Each was
told to inventory its surface from the code, price the Go port, name what is lost, and
**check the architecture notes' claims against what the code does**. That last
instruction is what made the round worth running: the inventory was expected, the
claim-checking was not.

Producers, each a standalone porting checklist for its surface:

| Producer | Surface | Lines in scope | Port estimate |
|---|---|---|---|
| [content pipeline](./011_surface_content-pipeline.md) | markdown in, HTML out | 3,274 | 3–5 weeks |
| [layouts and components](./012_surface_layouts-and-components.md) | the 53 `.astro` files + resolution | 11,653 | 6–9 weeks |
| [theming and CSS](./013_surface_theming-and-css.md) | theme contract, inheritance, delivery | 8,141 | 2–3 weeks |
| [client rich surfaces](./014_surface_client-rich-surfaces.md) | diagrams, artifacts, asset routes | 3,337 | 2–3 weeks |
| [dev tools and live editing](./015_surface_dev-tools-and-live-editing.md) | toolbar, editor, CRDT sync | 9,370 | 7–10 weeks |
| [loaders, cache, routing](./016_surface_loaders-cache-routing.md) | loaders, caches, URL resolution | 7,367 | 5–8 weeks |
| [distribution, plugin, docs](./017_surface_distribution-plugin-docs.md) | CLI, wrappers, releases, doc debt | 51,299 | 13–21 weeks |

Sum of the estimates: **38–59 weeks solo**, before de-duplication and before the
optimism multiplier that round 2 applies to them.

## The round's finding: the design notes describe a system we do not have

The single most consequential result of this round is not a port cost. It is that
**`notes/architecture/` and `notes/architecture-update/` are arguing from a picture of
the codebase that measurement does not support.** Forty-six claim-checks were run
across the seven surfaces. Twenty-two came back `false` or `partly-holds`, and they are
not scattered — they cluster in the two places the migration case rests on: the
performance table, and the "what we would have to replace" list.

### Claims that measurement refutes outright

Every row measured on this machine, 2026-08-07, against the working tree and a live dev
server on port 3088.

| Claim in the notes | Measured | Direction |
|---|---|---|
| Astro dev first byte 50–200 ms | 6.3–8.7 ms docs/blog/home; 26.6–35.7 ms issues | Astro is **6–20x faster** than claimed |
| Cold-start dev server 2–4 s | 1.81 / 1.85 / 1.91 s | overstated |
| Markdown re-render on save 150–400 ms | ~1.4 ms per file (whole 1,023-file corpus in 1,392 ms) | overstated ~150x |
| Theme CSS hot-reload 200–500 ms "Vite re-bundle" | theme CSS is deliberately **outside** the Vite graph; merge costs 0.090 ms | wrong mechanism, not just wrong number |
| Theme switch 1–2 s "Vite re-bundles" | a cookie write plus `location.reload()`; Vite bundles nothing | wrong mechanism |
| `bun` startup tax ~150 ms per CLI invocation | 1 ms (20 runs of `bun -e ''` in 0.020 s total) | overstated 150x |
| `node_modules/` ~150–250 MB | **419 MB** (463 top-level packages) | understated — favours migration |
| Embedded `dist/` compressed 1–2 MB | 24 MB raw / **6.1 MB gzipped** across 548 files | understated 3–6x |
| Idle memory 150–300 MB Node | **874 MB RSS** after 24 minutes | understated — favours migration |
| Full corpus rebuild "327 pages, 8–15 s" | **1,229 pages in 14.76 s** | corpus has grown 3.8x past the note |
| "The 11 plugin commands" | **37 commands**, 180 flags, 32 with `--json` | understated 3.4x |
| "5 reference files" in the skills | **39** across three skills | understated 8x |

The pattern is consistent and it cuts both ways. Every *performance* claim overstates
how slow Astro is. Every *footprint* claim understates how heavy it is. The performance
rows are the ones the migration argument leans on, and they are the ones that do not
survive contact with a stopwatch.

### Things the notes say we must replace that do not exist

These are cheaper than a wrong number, because the work was never real:

- **Astro islands and hydration directives.** `03_vite-frontend-and-dist.md` plans to
  replace `client:load` / `client:idle` / `client:visible` with explicit dynamic
  imports. A grep across all 53 `.astro` files returns **zero** matches. There are no
  islands. Every layout already ships plain `<script>` tags. The ~30 KB island runtime
  the note budgets for removal is not being shipped.
- **`src/custom-tags/`.** `02_known-issues-content-pipeline.md` records it as
  "infrastructure without wiring". The directory does not exist anywhere in the repo.
- **Astro build-time asset machinery.** Measured exhaustively: 1 `?url` import, zero
  `?raw`, zero `?inline`, zero image imports, zero `astro:assets` / `<Image>`,
  `src/assets/` holds only a `.gitkeep`, `public/` holds one 12-line file.
- **MDX.** `@astrojs/mdx` is a declared dependency with `mdx()` registered in
  `astro.config.mjs`, and there are **zero `.mdx` files repo-wide**. The integration
  handles nothing.

### Two pipeline defects the notes record as unfixed, which are fixed

`02_known-issues-content-pipeline.md` is the note that motivates rebuilding the content
pipeline "by construction" in Go. Two of its four symptoms no longer hold:

- *"Asset embeds registered for docs + blog, never for issues — `getAssetPath()` existed
  as dead code."* `content-types/issues.ts:33-35` registers
  `createAssetEmbedPreprocessor` and calls that method. Issues get `[[path]]` embeds.
- *"No content type rewrites relative `<img src>`."* `assetSrcPostprocessor` is
  registered in all three parsers (`docs.ts:39`, `blog.ts:40`, `issues.ts:45`).

The remaining real divergence is narrow and worth stating precisely, because it is the
whole of what "per-parser divergence" now means: **six of the seven pipeline steps are
identical text in all three parsers.** The only two differences are that full relative
link resolution is gated to `contentType === 'docs'`, and `issue-body-links` fires only
for issues — for which `IssuesParser` passes the string `'blog'` as its content type to
get the behaviour it wants.

## Where the real difficulty is

Strip the refuted claims out and the difficulty relocates. **No surface returned a
`fatal` loss.** Sixteen `major` losses across seven surfaces, and they concentrate:

**1 · The Astro dev-toolbar host — 1,793 lines with nowhere to live.** This is the
largest genuine Astro lock-in in the repo. `addDevToolbarApp`, the per-app shadow roots,
the toggle state machine and the overflow menu are proprietary browser API with no Go,
Vite or standalone equivalent. Six apps depend on it. The notes list "Astro dev-toolbar
plumbing" as deletable, which is true of the *host* and says nothing about the six apps
that then have nowhere to go — and the notes name only two of the six, the two smallest
(319 lines of 1,793). Worse, the notes contradict themselves on whether the toolbar
ships at all: `03_vite-frontend-and-dist.md` says "or dropped from v1" while
`06_performance-comparison.md` calls it "part of the framework's value". **That
disagreement swings this surface's estimate by about three weeks and has to be settled
before any estimate means anything.**

**2 · Server-side CRDT.** `server/yjs-sync.ts` is not a websocket relay — it owns the
authoritative `Y.Doc`, seeds it in a transaction, applies every client update through
`syncProtocol.readSyncMessage`, observes `Y.Text` for autosave, and resets content on
external edits. Yjs is JavaScript and cannot run in a Go process. This was the expected
fatal item and it is **not fatal**: two maintained pure-Go Yjs ports exist as of August
2026 (`reearth/ygo`, 34 stars, pushed 2026-08-06; and `Deln0r/ygo`), both explicitly
CGO-free, adding only 434 KB to a binary. The note's named candidate, "y-crdt-go
(y-go)", does not exist — two web searches on 2026-08-07 found no such module. The Rust
`y-crdt` route has no maintained Go binding at all (published bindings are Python, Ruby,
R, .NET, Swift, Kotlin) and would break the no-CGO single-binary promise.

**3 · The external-layout contract, which is stronger today than the notes credit.**
`05_runtime-config-surface.md` claims the user-editable surface is "identical". It is
not. Today an external layout is a real `.astro` component compiled by Vite: it can
import `@loaders/*`, call `loadFile` / `loadIssues`, run server-side code, and gets its
client script bundled, tree-shaken and hashed for free. Every built-in custom layout
(countdown, home, info) does exactly this. Under the proposed design a user layout is a
template plus, for any JavaScript, `doc-engine dev --vite` — which means Node on the
themer's machine, which is the thing the migration exists to remove. The notes' own
table flags this while the surrounding prose calls the surface identical.

**4 · Syntax highlighting.** Shiki emits `style="color:#X;--shiki-dark:#Y"` per token,
so dark mode is a pure CSS switch with no re-render (`markdown.css:63-67`). Chroma
renders one theme per pass and has no equivalent. The mitigation is a custom Chroma HTML
formatter emitting Shiki's exact shape (~150–250 lines of Go, 5–8 days), after which
`markdown.css` and `code-labels.ts` port with zero edits. Separately, TextMate grammar
fidelity is a real loss with no mitigation that preserves the single-binary goal — Shiki
uses the grammars VS Code ships, including embedded-language support (28 requested
languages expand to 52 loaded), and Chroma's hand-written lexers are coarser.

**5 · Scoped CSS.** 1,364 lines across 13 components, 260 scoped selectors, 12 component
hashes. Astro's compiler generates the scope attribute; nothing outside Astro does. The
de-scoping risk turned out **measurably small** — zero selectors anchored on a bare tag,
only two class names repeat across components, and the six collisions with global CSS
are deliberate overrides that go from a specificity tie to an outright win once scoping
is removed. It is mechanical work that fails silently, not dangerous work.

**6 · Documentation debt, which no note budgets.** ~11,000 lines across **44 pages**
invalidated outright, plus ~18,000 more needing verification. `dev-docs/10_layouts`
loses 12 of 13 pages; `dev-docs/05_architecture` loses 10 of 20, including the entire
`05_layout-internals` subtree.

## Defects found in passing, unrelated to the migration

Auditing the current code to price a rewrite turned up bugs in the current code. These
are real today and do not wait on any migration decision. They are carried into
[the handover](../03_debrief/01_handover.md) with proposed homes.

| Defect | Evidence |
|---|---|
| Circular theme `extends` recurses until stack exhaustion | `validateTheme:268-287` detects the cycle but only calls `addError()` under `import.meta.env.DEV` and never throws; `getThemeCSS:384-426` writes its cache entry *after* the recursive call. The user guide claims it "errors at startup" |
| `cache-manager` dependency tracking does not exist | `deps` are written by `setCache` and read only by `invalidateByDep`, which has zero call sites. `invalidateByPattern`, `haveDepsChanged`, `hasFileChanged` likewise. Both the file header and the project `CLAUDE.md` describe this cache as having dependency tracking |
| Dev and production disagree on URLs | `/todo/<issue>/plans/<plan>/<nonexistent>` returns 302 in dev, host 404 in the build. `/user-guide/<nonexistent>` serves a 296,909-byte styled page in dev; `dist/` contains no `404.html` at all |
| A user theme named `default` is unreachable | `theme.ts:57` short-circuits the literal name before any directory scan; `getAvailableThemes()` seeds it into the `seen` set first |
| `--color-text-tertiary` is declared by nothing | Used at `markdown.css:856,888` with frozen `#888`/`#999` fallbacks, so task-checkbox borders already ignore dark mode — the exact failure the project's theming rule exists to prevent. 44 variables total are referenced but undeclared |
| `subtask-state.ts:14` POSTs to `/__editor/subtask-toggle` with no dev guard | Its catch at line 176 rolls the UI back, so it fails quietly in production |
| 139 fenced code blocks render unhighlighted | Languages requested nowhere in the Shiki config: `astro` 104, `env` 13, `jsonc` 11, `nginx` 6, `text` 3, `diff` 2 |
| Frontmatter validation is dead | `getFrontmatterSchema` / `validateFrontmatter` are declared on every parser and called from nowhere. The "title required" rule is unenforced |
| Dead weight | `@astrojs/mdx` (zero `.mdx` files), a 267-line presence system with no client, 702 unreferenced editor lines, ~120 lines of dead cache API |
| No typecheck anywhere | No `astro check`, `@astrojs/check` not installed, no `tsc --noEmit` in any script or workflow. Running it by hand produces 27 errors |

## What this round could not settle

- **The trigger bug could not be reproduced live.** The running dev server showed a
  correct fresh timestamp. The exposed state is unambiguous in the source
  (`issue-dates.ts:40` and `issues.ts:462` each hold a bare module-level
  `const cache = new Map()`), but "already fixed by accident" and "still broken, cache
  was cold" look identical from outside.
- **Two auditors measured the same thing 4.8x apart.** The content-pipeline auditor
  measured marked + marked-alert + shiki at 1.36 ms per file over this corpus; the JIT
  auditor measured 6.57 ms per file with the same libraries at the same scale. Neither
  number should be quoted in a decision until the gap is explained. It does not move any
  verdict — Go wins at either figure — but it is an open measurement discrepancy, not a
  rounding difference.
