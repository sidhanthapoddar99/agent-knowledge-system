---
title: "Loaders, caching, routing, build modes"
---

# Surface 6 — loaders, caching, routing and build modes

Audit of `astro-doc-code/src/loaders/` (minus `theme.ts`, another auditor's), the
routing layer in `astro-doc-code/src/pages/`, `src/hooks/useSidebar.ts`, and
`astro-doc-code/astro.config.mjs`. Everything below is grounded in the files as
they stand; confidence is labelled per claim (**measured** = a command was run,
**read** = read in the source, **assumed** = inference).

## The one thing that changes the migration decision

**The stated trigger for the whole migration — Vite 6 SSR module isolation
splitting a module-level cache — is still in the code, in exactly two files, and
the fix for it is already implemented four times in the same folder.**
`cache-manager.ts`, `cache.ts`, `paths.ts` and `theme.ts` all park their mutable
state on `globalThis` under a string key, which is immune to module-instance
splitting by construction. `issue-dates.ts:40` and `issues.ts:462` do not — they
hold a bare `const cache = new Map()`, and they are the two modules the watcher
has to reach with a `server.moduleGraph.invalidateModule()` dance. Whatever else
argues for a Go rewrite, "this bug class is unfixable inside Astro" does not
survive reading the sibling files. (read; see [The triggering bug](#the-triggering-bug))

---

## 1. Build mode — definitively hybrid-by-environment, and static in production

`astro-doc-code/astro.config.mjs:89-92`:

```js
const isDev = process.env.NODE_ENV !== 'production';
export default defineConfig({
  output: isDev ? 'server' : 'static',
```

There is **no `export const prerender` anywhere in the repo** (measured —
`grep -rn "prerender"` over `src/` and `astro.config.mjs` returns nothing). So
the per-page prerender escape hatch is unused and the single `output` switch
governs everything.

| Mode | Trigger | Output | Route resolution |
|---|---|---|---|
| Server (SSR) | `NODE_ENV !== 'production'` — i.e. `astro dev`, `astro preview` of a dev build | in-process render per request | `matchServerRoute()` walks `site.yaml → pages` per request |
| Static (SSG) | `astro build` (Astro sets `NODE_ENV=production`) | `dist/` of `index.html` files | `getStaticPaths()` → `buildStaticPaths()` enumerates every URL at build time |

**Which pages are prerendered in production: all of them.** Measured on a full
production build run during this audit:

| Measure | Value |
|---|---|
| Build wall time | 14.76 s |
| Peak RSS during build | 2 011 160 KB (≈ 2.0 GB) |
| Pages built (Astro's own count) | 1 229 pages |
| `.html` files in `dist/` | 1 257 |
| Total files in `dist/` | 1 847 |
| `dist/` size | 166 MB |
| Server entrypoint in `dist/` | **none** — no `dist/server/`, no `entry.mjs` |

`dist/404.html` does **not** exist (measured). The three dev API endpoints
(`api/dev/errors`, `api/dev/layouts`, `api/dev/themes`) *are* emitted as static
files even though their handlers return a 403 under `import.meta.env.PROD` — so
the production build ships three frozen 403 JSON bodies.

### What this means for the JIT-rendering question

The production artefact today is a **fully materialised static tree**. There is
no request-time rendering in production at all. Two consequences the migration
plan has to price:

1. **A Go runtime that renders per request is not replacing a per-request
   renderer — it is replacing a build step.** The "First-byte time" rows in
   `notes/architecture/06_performance-comparison.md` compare Go's request path
   against Astro's *dev* request path, which is not what anybody serves.
2. **Dev and prod already diverge on routing behaviour**, because the two route
   builders are separate code (§5). That divergence is measured and reproduced
   below; a Go rewrite that has one route resolver removes it, which is a real
   win the notes under-sell relative to the perf numbers they lead with.

Measured against the live dev server on this repo (`PORT=3088`, warm):

| URL | HTTP | TTFB |
|---|---|---|
| `/dev-docs/versioning/overview` | 200 | 7.2 ms |
| `/dev-docs/overview/code-structure` | 200 | 8.1 ms |
| `/user-guide/getting-started/overview` | 200 | 7.5 ms |
| `/blog` | 200 | 6.3 ms |
| `/todo` (issues index, 1 009 336 bytes of HTML) | 200 | 36.8 ms |
| `/todo/2026-05-08-runtime-stack-migration` | 200 | 27.7 ms |
| `/nonexistent-page-xyz` (no section matches) | 404 | 4.5 ms |
| `/user-guide/nope-does-not-exist` (section matches, doc doesn't) | 404 | 9.3 ms, 296 909 bytes |

The perf note's "Astro dev first-byte (cached) 50–200 ms" row is off by roughly
an order of magnitude for docs pages on this corpus (measured). The issues pages
*are* slower, and §3 shows exactly why — it is 2 × 7 ms of `stat()`, not Astro.

---

## 2. The cache — what it is, keyed how, invalidated how

There are **four independent caching mechanisms**, not one, and they do not share
a design.

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │ (A) cache-manager.ts — globalThis['__cache_manager__']               │
 │                                                                      │
 │   fileRegistry : Map<absPath, {path, mtime, type}>                   │
 │   content      : Map<key, {data, deps[], mtimes(EMPTY), created}>    │
 │   sidebar      : Map<key, …>                                         │
 │   theme        : Map<key, …>                                         │
 │   settings     : Map<key, …>                                         │
 │   config       : Map<key, …>                                         │
 │   stats        : per-cache {hits, misses, invalidations, lastAccess} │
 │   watchPaths   : {contentPaths, configPaths, assetPaths, themePaths} │
 │                                                                      │
 │   READ  : getCached() — NO validation. Returns whatever is there.    │
 │   WRITE : setCache(name, key, data, deps[])                          │
 │   KILL  : onFileChange/Add/Delete(path) → detectFileType() →         │
 │           clearCache() of WHOLE named caches (not entries)           │
 └──────────────────────────────────────────────────────────────────────┘
        ▲ invalidated only by the Vite plugin's chokidar watcher
        │ (dev-tools/integration.ts, configureServer + handleHotUpdate)

 ┌──────────────────────────────────────────────────────────────────────┐
 │ (B) issues.ts:462 — module-level `const cache = new Map()`           │
 │   key   : `${dataPath}::${includeDrafts ? 'd' : ''}`                 │
 │   value : {signature: number, data: LoadedIssues, embedded: string[]}│
 │   READ  : recompute summed-mtime signature EVERY call, compare       │
 │   KILL  : signature mismatch, or invalidateIssuesCache() from watcher│
 └──────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────┐
 │ (C) issue-dates.ts:40 — module-level `const cache = new Map()`       │
 │   key   : absolute tracker path                                      │
 │   value : {issues: Map<slug, ISO-date>, syncedAt: headSha}           │
 │   READ  : `if (cache.has(k)) return` — trusted unconditionally       │
 │   KILL  : ONLY invalidateIssueDateCache() from the watcher on        │
 │           .git/HEAD or the active branch ref changing                │
 └──────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────┐
 │ (D) theme.ts:368 — globalThis['__theme_combined_css__']              │
 │   key   : theme ref string; value: merged CSS string                 │
 │   KILL  : cache-manager reaches in BY STRING LITERAL, 4 places       │
 └──────────────────────────────────────────────────────────────────────┘
```

### (A) `cache-manager.ts` — 524 lines, and the dependency graph in it is inert

This is the headline finding on the cache. The file's own header advertises
"Dependency tracking between caches", and the project `CLAUDE.md` describes it as
"Unified mtime-based cache with dependency tracking". Reading the code:

- `setCache()` (`cache-manager.ts:228-243`) stores `deps` **and writes
  `mtimes: new Map()` with the comment `// Not used - HMR handles invalidation`**.
- `getCached()` (`:201-220`) has the comment *"We don't check mtimes here …
  Checking mtimes on every access was causing 10-15ms overhead"* and returns
  `entry.data` unconditionally on a hit.
- The only function that reads `entry.deps` is `invalidateByDep()`.
- **`invalidateByDep`, `invalidateByPattern`, `haveDepsChanged` and
  `hasFileChanged` are never called anywhere in the repo** (measured — the only
  hits repo-wide are their own definitions in `cache-manager.ts` and a stale copy
  under `.claude/worktrees/`).

So the dependency lists that `data.ts:296`, `data.ts:424`, `useSidebar.ts:241`
and `theme.ts:362` carefully assemble — including the `embeddedFiles` and
diagram/artifact `dependencyFiles` work in `data.ts:268-296` — are **recorded and
never read**. Invalidation is entirely coarse: `onFileChange()` classifies the
file by extension/basename and calls `clearCache()` on whole named caches.

| Changed file type | Detection rule (`detectFileType`, `:104-134`) | Caches wiped whole |
|---|---|---|
| `settings.json` / `settings.jsonc` | basename match | `sidebar`, `settings` |
| `site.yaml` / `navbar.yaml` / `footer.yaml` | basename match | `config` (+ `theme` and combined-CSS if `site.yaml`) |
| `theme.yaml`, or any path under a registered theme dir | basename or prefix match | `theme` + combined CSS |
| `.md` / `.mdx` | extension | `content`, `sidebar` |
| `.css .js .png .jpg .jpeg .gif .svg .webp` | extension | **nothing** |
| anything else in a watched dir | fallthrough | `content`, `sidebar` (conservative) |

Two consequences worth naming for a redesign:

- Editing one markdown file blows away the whole `content` and `sidebar` caches
  for every section — `user-guide`, `dev-docs`, `blog` all re-parse. At this
  corpus that is 162 non-tracker markdown files re-globbed and re-parsed.
- The `asset` arm is a deliberate no-op, so a colocated `.excalidraw`/`.drawio`
  edit reaches `content` only via the `unknown` fallthrough (those extensions are
  in neither list). A `.css` edit inside `default-docs/` is classified `asset` and
  invalidates nothing — the theme arm only catches it if the path is under a
  registered theme dir.

**Lifetime**: the whole `globalThis` state is process-scoped. In a static build
it is populated once and never invalidated (no watcher). In dev it lives for the
life of the `astro dev` process.

### (B) `issues.ts` — the summed-mtime signature, measured

`computeSignature(dataPath, embedded)` (`issues.ts:496-547`) walks every issue
folder, every declared section folder, and every nested subfolder to
`MAX_SUBFOLDER_DEPTH` (5), summing `mtimeMs` of every tracked file
(`.md`, `.html`, `.meta.json`, `.meta.jsonc`, and the four diagram extensions),
every directory, and both `settings.json`/`settings.jsonc` variants.

Measured on this repo's tracker (53 issue folders, 950 files, 861 `.md`), by
re-implementing the exact walk and instrumenting it:

| Measure | Value |
|---|---|
| `fs.statSync` calls per `computeSignature()` | 1 781 |
| Mean wall time per `computeSignature()` (20 runs, warm page cache) | 7.07 ms |

`loadIssues()` calls it on **every** invocation. An issues detail-page request in
dev calls `loadIssues()` twice — once directly in `route-match.ts:169` and again
inside `loadIssue()` at `issues.ts:1471` — so **~14 ms of pure `stat()` precedes
every issue page render**, which is most of the measured 27.7 ms TTFB. In a
static build the same walk runs on every `buildStaticPaths()` pass.

Two design notes for whoever redesigns this:

- The signature is a **sum**, so it is theoretically collidable (one file's mtime
  falling by exactly what another's rises). Practically irrelevant; structurally
  worth not repeating.
- **A `git commit` does not change any working-tree mtime.** So the signature is
  *stable across a commit*, and the `updated` value baked into the cached
  `LoadedIssues` — which came from `getIssueDate()` at `issues.ts:829` — stays
  stale unless something explicitly clears this cache. That is why the watcher
  calls `invalidateIssuesCache()` alongside `invalidateIssueDateCache()`.

### (C) `issue-dates.ts` — the git-derived `updated` cache

Cold path (`ensureFresh` → `fullBuild` → `walkLog`, `:104-162`): `spawnSync('git',
['log','--no-merges','--name-only','--pretty=format:§%aI','--',<trackerRel>])`
with a 64 MB `maxBuffer`, parsed into `slug → first (most recent) ISO date`.

Measured on this repo:

| Measure | Value |
|---|---|
| `git log` wall time (3 runs) | 0.05 s each |
| Bytes of `git log` output parsed | 298 478 |
| Commits touching the tracker | 235 |

The perf note's "11 ms (12 commits) → 500 ms (3 K commits)" projection is in the
right shape; the measured value here is **50 ms at 235 commits**, so the
extrapolation to 3 000 commits is closer to 600 ms than the note implies. It is
paid once per process (or once per invalidation), on the request path.

Hot path is `cache.has(trackerRoot)` — a `Map.get`. No mtime check, no HEAD
comparison. The comment at `:104-111` is explicit that this is deliberate.

### (D) The theme combined-CSS cache

Lives on `globalThis['__theme_combined_css__']` (`theme.ts:368`). `cache-manager.ts`
clears it by **repeating that string literal in four places** (`:310`, `:358`,
`:370`, `:487`) rather than importing anything — a circular-import dodge that a
Go port removes for free, but which is a live coupling today: renaming the key in
`theme.ts` silently breaks four invalidation paths with no type error.

---

## 3. The triggering bug

### What the code actually contains today

The bug is **still present in the code**, and it is **partially worked around**.
Precisely:

| File | Mutable state | On `globalThis`? | Exposure |
|---|---|---|---|
| `cache-manager.ts:44-95` | all five caches + registry + stats + watchPaths | ✅ | none |
| `cache.ts:66-78` | errors + warnings | ✅ | none |
| `paths.ts:133-148` | `userPaths`, `initialized` | ✅ | none |
| `theme.ts:368-374` | combined CSS map | ✅ | none |
| `paths.ts:98-122, 185` | the exported `paths` object; `paths.config` mutated by `initPaths` | ❌ | papered over — see below |
| `config.ts:104` | `resolvedThemePaths` | ❌ | repaired by side-effect replay from the (globalThis) config cache at `config.ts:143` |
| **`issues.ts:462`** | `cache: Map<key, CacheEntry>` | ❌ | **the exposure** |
| **`issue-dates.ts:40,43`** | `cache`, `repoRootByPath` | ❌ | **the exposure** |
| `issues.ts:666,685,471` | `parser`, `inlineParser`, `embedCollector` | ❌ | harmless (lazily rebuilt / call-scoped) |
| `pages/lib/layout-registry.ts:84` | `REGISTRY` | ❌ | harmless (immutable, built from `import.meta.glob`) |

The `paths.ts` row deserves a sentence, because it is the same bug wearing a
different hat. `initPaths()` guards on `state.initialized`, which is on
`globalThis` — but the thing it sets, `(paths as any).config = newConfigDir`, is
module-local. So in a *second* module instance `initPaths()` returns immediately
and `paths.config` is never assigned; the instance falls back to
`earlyConfigDir`, read from `process.env.CONFIG_DIR` at module load. That only
works because `astro.config.mjs:25-27` explicitly copies `CONFIG_DIR` into
`process.env`, with a comment saying exactly why:

> *"Propagate to process.env so SSR/render contexts that load paths.ts
> independently (without going through initPaths()) read the same CONFIG_DIR the
> build is using. Without this, paths.ts's early fallback kicks in during SSR and
> navbar/footer/site.yaml get loaded from the wrong directory."*

That is a second, independent instance of module splitting, already diagnosed and
already worked around by a different mechanism.

### The workaround, and the drift between it and its own comment

`dev-tools/integration.ts:180-232` is the workaround. The comment block at
`:180-190` says the code force-clears "via `server.ssrLoadModule`". **It does
not** — the actual handler at `:210-232` does two things:

1. `invalidateIssueDateCache()` + `invalidateIssuesCache()` — the plugin-context
   copies.
2. `server.moduleGraph.getModuleById(id)` → `invalidateModule(mod)` for
   `loaders/issue-dates.ts` and `loaders/issues.ts`, resolved via
   `path.resolve(path.dirname(new URL(import.meta.url).pathname), '../loaders/…')`.

So attempt (1) from `brainstorm/04_discuss_stack-and-migration/05_issue.md` was
dropped and only attempt (2) survives. The comment describing the shipped code is
stale — worth noting because the brainstorm note asserts "dual invalidation (both
1 + 2) — what the current code does", and that is no longer true.

### Did it reproduce?

**No — and I could not construct a controlled test without a git write, which I
am not permitted to run.** What I could observe:

- The running dev server started at 06:39:23. Commit `5d61838` landed at
  06:42:39, *while it was running*.
- The dev server renders `2026-08-07T06:42:39+05:30` for that issue on `/todo` —
  the correct, freshest value (measured).

That is consistent with the `moduleGraph.invalidateModule` workaround doing its
job, and equally consistent with the cache simply having been cold at the moment
of the first read after the commit. It is **not** evidence the bug is fixed, and
it is not evidence it is live. Confidence: **measured** for the observation,
**inconclusive** for the diagnosis.

### Is it genuinely unfixable inside Astro?

**No, and I would defend that.** There is a narrower fix, it is five lines per
file, and it is the pattern the same directory already uses four times:

```ts
// issue-dates.ts — today
const cache = new Map<string, CacheEntry>();

// the fix, identical in shape to cache-manager.ts:75-95
const KEY = '__issue_dates_cache__';
function getCache(): Map<string, CacheEntry> {
  if (!(globalThis as any)[KEY]) (globalThis as any)[KEY] = new Map();
  return (globalThis as any)[KEY];
}
```

`globalThis` is one object per *process*. Vite SSR can instantiate a module twice;
it cannot give a process two `globalThis` objects. That is precisely why
`cache-manager.ts` was written that way, and its own header comment
(`paths.ts:131-132`) states the reason out loud: *"Use globalThis to persist state
across Vite module reloads (astro.config.mjs and runtime may load this as separate
module instances)."*

The brainstorm note's structural argument — *"Any module-level mutable state
that's mutated by the watcher and read by SSR is at risk … Tomorrow if we add a
search index, a settings cache, a permission cache — same bug"* — is true, and it
is exactly the argument for a one-line `globalStore()` helper that every cache
uses. The claim that follows it, *"The structural response is don't have an SSR
module graph at all"*, does not follow from the evidence in this repo, where the
same problem was solved four times without leaving Astro.

**None of that argues against the migration.** It argues that this specific bug
should not be carried as its justification, because a reader who checks will find
the counter-example in the adjacent file. The honest framing is: the bug class is
real, the workaround is real, it costs one helper function and the discipline to
use it — and Go removes the discipline requirement, not the possibility of a fix.

---

## 4. `issues.ts` at 1 481 lines — the responsibility map

This is the biggest file in the repo and the single biggest port item on this
surface. Line ranges are exact (read).

| Lines | Count | Responsibility | Port character |
|---|---|---|---|
| 1-40 | 40 | Header doc: the whole folder-per-issue contract, section shapes, depth cap, draft rules | spec, not code — carry it verbatim |
| 42-105 | 64 | Imports + re-exports of the lifecycle vocabulary and section registry through this module (a barrel for `@loaders/issues` consumers) | disappears in Go (packages) |
| 107-433 | 327 | **Type declarations** — `IssueMetadata`, `IssueComment`, `IssueNote`, `IssueAgentLog`, `IssuePlanStage`, `IssuePlan`, `IssueSubtask`, `AgentLogGroupMeta`, `SubtaskGroupMeta`, `AgentLogKind`, `DEFAULT_AGENT_LOG_KINDS`, `Issue`, `IssuesVocabularyField`, `IssuesPresetView`, `IssuesVocabulary`, `LoadedIssues` | straight port to Go structs; ~1:1 |
| 435-436 | 2 | `FOLDER_PATTERN` (`^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]*)$`), `COMMENT_PATTERN` | straight port |
| 438-553 | 116 | **Cache + signature** — `CacheEntry`, the module-level `cache` Map, `embedCollector`, `statMtime`, `isTrackedDocFile`, `computeSignature`, `invalidateIssuesCache` | redesign (see §2B) |
| 555-593 | 39 | Normalisers — `normalizeComponent`, `resolveStatus`, `readJson`, `fmDateString` | straight port |
| 595-661 | 67 | **Vocabulary validation** — `missingDescriptionsMessage`, `resolveVocabulary`. Three hard errors: a per-tracker `fields.status` block, a leftover `statusColors` map, any `component`/`labels` value without a description. Synthesises an in-memory `fields.status` from code constants | straight port; the error strings are the contract |
| 663-694 | 32 | Renderer funnels — lazy `createIssuesParser()`, `renderMarkdown` (also the `[[path]]` embed-dependency collection point), lazy `createMarkedInstance()` for `parseInline`, `inlineField` | **couples to the parser surface** — not portable here |
| 696-738 | 43 | `readComments` — strict `NNN_YYYY-MM-DD_AUTHOR.md` pattern with a documented looser `NNN_slug.md` fallback that recovers author/date from frontmatter | straight port |
| 740-854 | 115 | **`loadIssueFolder`** — the orchestrator. Reads `settings.json`, `issue.md`, `glossary.md`, then dispatches to all seven section readers, merges `agentLogKinds` (2-letter codes, string or `{name,icon,desc}`), warns on stray root `.md`, and stamps `created` (from the slug) and `updated` (from `getIssueDate`) | straight port |
| 856-904 | 49 | `walkSubfolderTree<T>` — the generic nested walk, depth-capped at `MAX_SUBFOLDER_DEPTH`, stable files-then-folders order, per-leaf-folder sequence reset, warn-and-skip past the cap | straight port |
| 906-1010 | 105 | `readFreeformDocs` — `notes`/`brainstorm`/`agent-memory`. Three doc types (`markdown` / `diagram` / `artifact`), extension set gated by `section.allowArtifacts`, plus a same-route collision guard that warns rather than picking a winner | straight port + parser coupling |
| 1012-1054 | 43 | `readAgentLogs` — same walk, frontmatter `agent`/`status`/`date`/`color`, sequence from the `NNN_` prefix or the fallback counter, diagrams first-class | straight port |
| 1056-1215 | 160 | **`plans/`** — `PLAN_OVERVIEW`, `planStageAnchor`, `planRefTarget`, `readPlanRefs` (resolve issue-relative subtask refs, keep unresolved ones), `byPrefixValue`, `readPlans`. Fixed two-level shape; stage status + category from frontmatter; refs resolved live so a plan cannot hold a stale count | straight port |
| 1216-1298 | 83 | Agent-log grouping — `AGENT_LOG_CHILD_MIN_PREFIX = 100`, `isAgentLogSlotFolder` (arithmetic on the prefix, not a name list), `readAgentLogGroups` walking folders for optional `settings.json` status | straight port |
| 1285-1298 | 14 | `slugToLabel`, `readGroupTitle` | straight port |
| 1300-1386 | 87 | `readSubtaskFile` + `readSubtasks` — frontmatter-driven, body optional, nested grouping folders as labels only | straight port |
| 1388-1460 | 73 | **`loadIssues`** — cache lookup, signature check, vocabulary read + validate, root-draft short-circuit, folder enumeration, embed-collector arming, per-folder load, `updated desc` sort, cache store | straight port + cache redesign |
| 1462-1481 | 20 | `loadIssue` — served from the shared cache; falls back to a direct folder read for drafts excluded from the filtered set | straight port |

**Roughly 60 % of the file is a straight port** (types, patterns, walkers,
readers, validation). The genuinely awkward 40 % is the cache/signature block
(§2B) and the two renderer funnels, which reach into the markdown parser surface
owned by another audit.

---

## 5. Routing — and yes, the duplication smell is real, and it has already drifted

### How `[...slug].astro` resolves a page (105 lines)

```
                       ┌─ static build ──────────────────────────┐
                       │ getStaticPaths() → buildStaticPaths()   │
                       │   walks site.yaml pages, loads ALL       │
                       │   content, emits {params, props} per URL │
                       └──────────────────┬──────────────────────┘
 request ──────────────────────────────────┤
                       ┌─ server / dev ────┴──────────────────────┐
                       │ Astro.props empty → matchServerRoute()   │
                       │   walks site.yaml pages, prefix-matches   │
                       │   base_url, builds the SAME props shape   │
                       └──────────────────┬──────────────────────┘
                                          ▼
                          routeProps.redirectTo?  → Astro.redirect
                          routeProps.notFound?    → status = 404
                          pageType === 'docs-index' → redirect to first doc
                                          ▼
             cookie overrides (dev only): dev-layout / dev-navbar / dev-footer
                                          ▼
        LAYOUT_VARIANT[pageType] → resolveLayout(alias, variant, pageName)
             (layout-registry.ts: 9 import.meta.glob pairs, builtin + @ext-layouts)
                                          ▼
             prepareRender(props) → {title, contentType, layoutProps, editorPath}
                                          ▼
        <BaseLayout><Navbar/><LayoutComponent {...layoutProps}/><Footer/></BaseLayout>
```

`layout-registry.ts` is worth calling out: it holds **9 pairs of
`import.meta.glob()` calls** (`docs`, `custom`, `blog-index`, `blog-post`,
`issues-index`, `issues-detail`, `issues-subdoc`, `navbar`, `footer`), each with a
built-in pattern and an `@ext-layouts/…` pattern, because *"Vite requires
`import.meta.glob` arguments to be literal strings"* (its own header). External
matches override built-ins by style name. This is the most Vite-shaped code on the
surface and has no meaning outside a bundler.

### The duplication — verified

`route-match.ts` (369 lines) and `static-paths.ts` (172 lines) both encode URL
knowledge. Some of it is genuinely shared — `sourceFormSlug()`,
`canonicalContentUrl()` and `planStageAliasUrl()` are exported from `route-match`
and imported by `static-paths`, and `planStageAliasUrl`'s doc comment says the
quiet part: *"The one place the alias URL is spelled — `route-match` resolves it
at request time, `static-paths` emits it at build time, and they must agree."*

But four decisions are still spelled twice:

| Decision | `route-match.ts` | `static-paths.ts` | Agreed? |
|---|---|---|---|
| Strip leading `/` from `base_url` | `:99` | `:52` | yes |
| Source-form alias → canonical redirect | `:126-135`, `:155-164` | `:35-45`, `:78`, `:96` | yes (shared helpers) |
| `/<issue>/issue` → `/<issue>` | `:188-193` (literal `'issue'`) | `:110-113` (literal `'issue'`) | yes |
| Sub-doc resolution (`groupPath` + id key) | `resolveSubDoc` `:252-285` | inline loop `:154-165` | yes, by parallel construction |
| **Plan sub-URL fallback** | `planStageAliasTarget:225-242` — returns the plan URL for **any** third segment | `:128-149` — emits `overview` and real stage names **only** | **NO** |
| **Section-scoped 404 page** | `notFound: true` → styled page + 404 status | never emitted | **NO** |

Both divergences reproduce (measured, against the live dev server and the
freshly-built `dist/`):

| URL | Dev (server) | Static (`dist/`) |
|---|---|---|
| `…/plans/01_fix-the-tools-then-the-links` | 200 | page exists |
| `…/plans/01_fix-the-tools-then-the-links/overview` | 302 → plan page | page exists |
| `…/plans/01_fix-the-tools-then-the-links/10_the-tools-tell-the-truth` | 302 → plan page `#anchor` | page exists |
| `…/plans/01_fix-the-tools-then-the-links/zzz-does-not-exist` | **302 → plan page** | **missing → host 404** |
| `…/plans/01_fix-the-tools-then-the-links/settings` | **302 → plan page** | **missing → host 404** |
| `/user-guide/nope-does-not-exist` | **404 + 296 909-byte styled page** | **missing → host 404, no `dist/404.html`** |

So the note in `notes/architecture-update/01_the-structure.md` calling this a
smell is not a stylistic complaint — the two switches have already drifted, in two
places, and the drift is invisible because nothing compares them. That is a
concrete, checkable argument for the self-registering-structure model, and it is
stronger than the perf tables.

### Asset routes

Four serving routes, all outside `[...slug]` by static-segment priority, all
enumerating `getStaticPaths()` for the build and all implementing a `GET` handler
for dev:

| Route | Source | Roots searched | Filter | Notes |
|---|---|---|---|---|
| `/assets/<path>` | `pages/assets/[...path].ts` (128) | `getPathsByCategory('asset')` | dotfiles excluded | first match wins |
| `/content-assets/<path>` | `pages/content-assets/[...path].ts` (116) | `getPathsByCategory('content')` | `.md`/`.mdx`/`settings.json(c)`/dotfiles refused | symlink-proof via `realpathSync` |
| `/artifacts/<path>` | `pages/artifacts/[...path].ts` (216) | `getPathsByCategory('content')` | `.html` only | injects the resolved theme CSS + a dark-mode init when the sidecar says `artifact.theme: "site"`; content-hash ETag in that case |
| `/api/dev/*` | `pages/api/dev/{errors,layouts,themes}.ts` (37/71/79) | n/a | 403 under `PROD` | still emitted into `dist/` as static 403 bodies |

All four share: `mimeTypes` lookup from `pages/lib/mime.ts` (23 lines), a
`"${size}-${mtimeMs}"` ETag, `If-None-Match` → 304, and
`Cache-Control: import.meta.env.DEV ? 'no-cache' : 'public, max-age=31536000'`.
Containment is checked with `path.relative()` + `startsWith('..')` at a segment
boundary — the `assets` route comments explicitly that plain `startsWith` would
let `/data/assets-private` match `/data/assets`. `content-assets` and `artifacts`
additionally compare `realpathSync` on both sides.

`RESERVED_BASE_URLS = ['artifacts','assets','content-assets','api','editor']`
lives in `config.ts:413` with a per-segment reason map, and `validateRoutes()`
hard-throws at config load if a section's `base_url` normalises onto one. The same
list is defended a second time in `route-match.ts:53-63` (`isInternalSlug`).

---

## 6. Paths and aliases

### The two-phase init

`paths.ts` splits into phase 1 (module load) and phase 2 (`initPaths`), and the
reason is stated in its header: *"CONFIG_DIR may not be available yet (ES imports
run before `loadEnv()`)"*. Phase 1 resolves structural paths from
`import.meta.url`:

```
__dirname          = <repo>/astro-doc-code/src/loaders
frameworkRoot      = <repo>/astro-doc-code        (where src/ lives)
projectRoot        = <repo>/                      (where default-docs/, .env live)
paths.root         = projectRoot
paths.{src,layouts,loaders,hooks,modules,pages,styles,srcAssets} = frameworkRoot/src/…
paths.config       = process.env.CONFIG_DIR ? resolve(projectRoot, it) : ''   ← "early" value
```

Phase 2 (`initPaths`, `:176-269`), called from `astro.config.mjs:83` *after*
`loadEnv()` and after `site.yaml` is parsed:

1. Sets `paths.config` to the authoritative resolved dir (module-local mutation —
   see §3).
2. Throws if `site.yaml` has no `paths:` section, with a worked example in the message.
3. Per key: rejects `RESERVED_KEYS = {docs, blog, issues, custom, navbar, footer, theme, config, root}`.
4. Resolves the value: `@root` / `@root/…` composes against `projectRoot` and is
   containment-checked; **any other `@alias` is a hard error** with the reason
   spelled out (user-to-user references would create declaration-ordering
   ambiguity, and system layout aliases are not content paths); anything else
   resolves relative to the config dir.
5. Throws if the resolved directory does not exist.
6. Requires `data` and `assets` to be present; registers `config` itself.
7. Categorises each key: `config` → config, `asset*` → asset, everything else → content.

`initPaths` is idempotent via the `globalThis`-backed `initialized` flag.

### Alias resolution (`alias.ts`, 247 lines)

`getAliasMap()` merges seven reserved layout aliases (`@docs @blog @issues
@custom @navbar @footer @root`) with `@<key>` for every user path. Reserved wins
on collision (`if (!map[alias])`). `extractPrefix()` sorts keys **longest-first**
so `@data2` matches before `@data`. `resolveAlias()` re-checks `@root`
containment after `path.join` collapses `../` segments, throwing on escape.

`resolveAssetUrl()` is the odd one: it maps `@assets/x` → `/assets/x`,
passes through anything starting with `http` or `/`, and **defaults any other
relative string to `/assets/<it>`**.

`toAliasPath()` (`paths.ts:332-371`) inverts the mapping for display, longest-path
first, with structural fallbacks to `@theme/default/…`, `@src/…`, then a
project-root-relative path.

### Portability

| Piece | Portable? | Why |
|---|---|---|
| `projectRoot` / `frameworkRoot` derivation | Node-only mechanism, portable intent | uses `fileURLToPath(import.meta.url)`; in Go it is `os.Executable()` + `--project-root`, which is *simpler*, not harder |
| Two-phase init itself | **Astro-only artefact** | it exists because ES imports run before `loadEnv()`. A Go `main()` has no such ordering problem — this is ~60 lines of choreography that simply disappears |
| `CONFIG_DIR` → `process.env` propagation (`astro.config.mjs:25-27`) | **Astro/Vite-only** | pure module-splitting workaround; disappears |
| Alias map, longest-prefix match, reserved keys | fully portable | plain string/map logic |
| `@root` containment check | fully portable | `filepath.Clean` + prefix-at-separator, same shape |
| Category inference from key name | fully portable | |
| `toAliasPath` | fully portable | |

**Estimate: ~75 % of `paths.ts` + `alias.ts` (620 lines combined) is portable
logic; ~25 % is choreography that exists only because of Astro's config/SSR module
ordering and vanishes rather than porting.** (read)

---

## 7. `engine-version.ts` — the version gate

131 lines, and **the most portable file on this surface** — it is
`ENGINE_VERSION = '0.2.4'`, `MIN_CONTENT_VERSION = '0.2.0'`, `UNVERSIONED = '0.0.0'`,
a `^\d+\.\d+\.\d+$` regex, a three-place numeric comparator, and
`assertContentVersionSupported()` throwing one of three messages. Zero imports.
Called from exactly one place — `config.ts:172`, immediately after `site.yaml`
parses and before any resolution work, so the version error is the first thing a
user sees.

The file also carries the record of a real defect: the comparator used to compare
only major and minor, discarding patch, so content at `0.1.0` compared *equal* to
a floor of `0.1.2` and passed — every format migration this repo had shipped moved
only the patch place, so the gate had never once refused migrated content
(`:81-90`).

**Go port: 30-40 lines, no library. `golang.org/x/mod/semver` exists but is
overkill for a fixed `N.N.N` grammar with no prerelease/build metadata.**

### What a migration means post-Go

Nothing about the *contract* changes — content still declares
`engine_version` in `site.yaml`, the binary still carries a version and a floor,
the gate still hard-stops. Three things do change, and two of them are decisions
the migration has to take rather than inherit:

1. **The scripts.** `migration/<to-version>_<statement>.py` are Python and operate
   on the filesystem. They are **completely unaffected** — they never import
   framework code. This is the cheapest part of the whole migration.
2. **Version-series continuity.** The engine version is currently a property of
   the Astro engine. Does the Go binary continue at `0.2.5`, or reset? If it
   continues, a user's `engine_version: "0.2.4"` must keep passing the Go gate —
   which means the Go loader must accept every content format the Astro loader
   accepted, on day one, with no floor bump. That is a real constraint on the
   port's completeness, and no note states it.
3. **Where the floor error is printed.** Today it aborts `astro dev`/`astro build`
   before the server starts. In Go it aborts `serve` — same shape, and the message
   text (which walks the user's AI through the migration chain) ports verbatim.

---

## 8. Dependency inventory

Runtime npm packages actually reached by this surface (measured — import scan
over `loaders/*.ts`, `pages/**`, `hooks/useSidebar.ts`, `astro.config.mjs`):

| Package | Used by | Class | Go equivalent |
|---|---|---|---|
| `glob` ^11 | `data.ts:197`, `artifact-pages.ts:214`, `diagram-pages.ts` | portable | `path/filepath.WalkDir` + `doublestar` for `**` patterns |
| `js-yaml` ^4 | `config.ts`, `astro.config.mjs`, `dev-tools/integration.ts` | portable | `gopkg.in/yaml.v3` |
| `gray-matter` ^4 | `issues.ts:696-738` and every frontmatter read in the readers | portable | `github.com/adrg/frontmatter` or hand-rolled `---` split + yaml.v3 |
| `marked` ^17 + `marked-alert` | `issues.ts:686` (`parseInline` for one-line frontmatter fields) | portable | `goldmark` — but inline-only rendering needs care (goldmark has no first-class `parseInline`) |
| `astro` (types: `APIRoute`, `GetStaticPaths`, `AstroIntegration`) | all four serving routes, `integration.ts` | **Astro-only** | `net/http.HandlerFunc` |
| `vite` (`loadEnv`) | `astro.config.mjs:6` | **Vite-only** | `os.Getenv` + a `.env` reader (`joho/godotenv`) |
| `@astrojs/mdx` | `astro.config.mjs:3` | **Astro-only** | goldmark has no MDX; see losses |
| Node `fs`, `path`, `url`, `child_process`, `node:crypto` | everywhere | **Node-only APIs, portable intent** | `os`/`io/fs`, `path/filepath`, `os/exec`, `crypto/sha1` |
| `import.meta.glob` | `layout-registry.ts` (9 pairs) | **Vite-only** | compile-time map literal + `embed.FS` |
| `import.meta.env.DEV` / `.PROD` | `data.ts:145`, `issues.ts:1400`, all four routes | **Vite-only** | a runtime flag |
| `chokidar` (transitively, via Vite's `server.watcher`) | `integration.ts` | Node-only | `fsnotify` |

Browser-side dependencies: **none on this surface.** Everything here runs
server-side or at build time. `useSidebar.ts` is named like a hook but is a pure
server-side tree builder (it reads `fs` directly at `:81`, `:107`); nothing in it
touches the DOM.

---

## 9. What a Go rewrite costs, per capability

| Capability | Lines today | Go equivalent | Character |
|---|---|---|---|
| Version gate (`engine-version.ts`) | 131 | stdlib only | **straight port**, 30-40 lines |
| Settings JSON/JSONC (`settings-file.ts`) | 109 | `github.com/tidwall/jsonc` or port the string-aware stripper | **straight port** |
| Section registry (`issue-sections.ts`) | 151 | slice of structs + two maps | **straight port**, near-identical |
| Status vocabulary (`issue-status.ts`) | 238 | consts + maps | **straight port** |
| Path resolution (`paths.ts`) | 373 | `path/filepath` | **port + shrink** — two-phase choreography deletes |
| Alias resolution (`alias.ts`) | 247 | maps + string ops | **straight port** |
| Config load + validate (`config.ts`) | 494 | `yaml.v3` + the same guards | **straight port**; `validateRoutes` and `RESERVED_BASE_URLS` port verbatim |
| Content loader (`data.ts`) | 463 | `filepath.WalkDir` + the parser | **port**, but the parser it calls is another surface's problem |
| Sidebar tree (`useSidebar.ts`) | 372 | pure tree building | **straight port** |
| Issues loader (`issues.ts`) | 1 481 | ~60 % 1:1 | **the big one** — see §4 |
| Git-derived dates (`issue-dates.ts`) | 214 | `os/exec` on `git log`, or `go-git`/`gix` | **straight port**; shelling out is what it already does |
| First-class diagram pages (`diagram-pages.ts`) | 210 | container HTML emission | **straight port** (the *rendering* is client-side and unaffected) |
| First-class artifact pages (`artifact-pages.ts`) | 287 | ditto + sidecar reads | **straight port** |
| Slug-collision pass (`first-class-page.ts`) | 55 | map + dedupe | **straight port** |
| Cache manager (`cache-manager.ts`) | 524 | `sync.RWMutex`-guarded maps | **redesign** — and it should shrink: ~120 lines are dead or inert (§2A) |
| Error/warning collector (`cache.ts`) | 221 | a slice + mutex | **straight port**, minus the `globalThis` dance |
| Route matching (`route-match.ts`) | 369 | `net/http` mux or a per-structure registry | **redesign** — merging with static-paths is the point |
| Static path enumeration (`static-paths.ts`) | 172 | a `build` subcommand walking the same registry | **redesign / merge** |
| Layout registry (`layout-registry.ts`) | 222 | compile-time map + overlay scan | **redesign** — `import.meta.glob` has no equivalent, and doesn't need one |
| Asset / content-asset / artifact routes | 460 combined | `http.ServeContent` gives ETag + Range + 304 free | **port + shrink** |
| MIME map (`mime.ts`) | 23 | `mime.TypeByExtension` | **delete** — stdlib, though the deliberate `.html` exclusion must be reproduced |
| Dev API endpoints | 187 | three JSON handlers | **straight port** |
| `astro.config.mjs` | 136 | `main()` + flag parsing | **mostly deletes** |
| **Total** | **7 367** (measured) | | |

---

## 10. Claims checked against the code

| Claim (source) | Verdict | Evidence |
|---|---|---|
| "SSR module isolation … Couldn't fix it cleanly inside Astro" (`issue.md`) | **partly holds** | The bug class is real and reproduced in the codebase's own history. But `cache-manager.ts`, `cache.ts`, `paths.ts` and `theme.ts` all solve it with `globalThis`, and the two affected files simply don't use that pattern. Fix is ~5 lines each. |
| "Dual invalidation (both 1 + 2) — what the current code does" (`brainstorm/…/05_issue.md`) | **false** | `dev-tools/integration.ts:210-232` does only `moduleGraph.invalidateModule`. The `ssrLoadModule` attempt is gone; only the *comment* at `:180-190` still mentions it. |
| "What stays unchanged: `site.yaml` schema" (`notes/architecture/01_overview.md`) | **false as written** | `notes/architecture/05_runtime-config-surface.md` — the note that says "identical. Same keys" — shows `pages:` as a **list** of `{path, type, data}`. Today it is a **map** keyed by page name with `base_url`, `type`, `layout`, `data` (`config.ts:37-42`, `default-docs/config/site.yaml`). It also shows `type: home`, which is not in `PageType` (`docs \| blog \| custom \| issues`), and drops `layout:` entirely. Three schema changes inside a note claiming none. |
| "`@root` alias semantics unchanged" (`notes/architecture/01_overview.md`) | **holds** | `paths.ts:211-229` + `alias.ts:121-133` are pure string/path logic with a containment check. Direct port. |
| "Two-phase path init ports to Go" (`notes/architecture/02_go-runtime.md`, `internal/config/paths.go`) | **partly holds** | The *outputs* port. The *two-phase* structure exists only because ES imports run before `loadEnv()` (`paths.ts:1-12`); a Go `main()` has no such ordering, so porting the phasing would be porting a workaround. |
| "No `loaders/cache-manager.ts` equivalent needed. Each cache is local to its module" (`notes/architecture/02_go-runtime.md`) | **partly holds** | True that module isolation stops forcing a shared manager. But `cache-manager.ts`'s *real* jobs — file-type classification and cross-cache invalidation cascades (content→sidebar, `site.yaml`→theme+CSS) — are watcher-routing work that survives any runtime. What genuinely deletes is the `globalThis` plumbing and ~120 lines of dead API. |
| "Cache architecture: Content (mtime-keyed), invalidated by file mtime check on read" (`notes/architecture/02_go-runtime.md`) | **false as a description of today** | `getCached()` explicitly does **not** check mtimes (`cache-manager.ts:194-220`), and the stored `mtimes` map is written empty with the comment `// Not used`. It is watcher-invalidated, not mtime-validated. The proposal is a *change*, not a port — fine, but it should say so. |
| "Astro dev first-byte (cached) 50–200 ms" (`notes/architecture/06_performance-comparison.md`) | **false on this repo** | Measured warm: 6.3–8.9 ms for docs/blog pages; 27.7 ms for an issue detail page; 36.8 ms for the 1 MB issues index. |
| "Issue tracker walk on commit ~11 ms (12 commits) → ~500 ms (3 K)" (`06_performance-comparison.md`) | **partly holds** | Measured here: `git log` over the tracker is **50 ms at 235 commits** (298 KB output). Linear extrapolation to 3 000 commits is ~600 ms, so the ceiling estimate is roughly right but the current-scale number is 4-5× the note's. |
| "Full corpus rebuild (327 pages this repo) 8–15 s" (`06_performance-comparison.md`) | **false on both numbers** | Measured: **1 229 pages in 14.76 s** wall (Astro's own report: 14.08 s), peak RSS 2.0 GB. The page count is 3.8× the note's; the time is at the top of the note's range for 3.8× the work. |
| "Disk footprint: `node_modules/` ~150 MB" (`06_performance-comparison.md`) | **false** | Measured: `astro-doc-code/node_modules/` is **419 MB**. `dist/` is another 166 MB. |
| "URL rules are centralized … one structure's behaviour lives in two shared switches" (`notes/architecture-update/01_the-structure.md`) | **holds, and stronger than stated** | Verified and reproduced: the two switches have already **drifted** in two places — plan sub-URL fallback (dev 302 / static 404) and section-scoped not-found pages (dev styled 404 / static host 404, no `dist/404.html`). |
| "Per-user UI state … Today (static output) the browser is the only place per-user state can live" (`architecture-update/01_the-structure.md`) | **holds** | Confirmed: production is pure SSG, no server entrypoint in `dist/`. |

---

## 11. What is lost or degraded

| Item | Severity | Why | Mitigation |
|---|---|---|---|
| MDX support (`@astrojs/mdx`) | **fatal** for MDX files | goldmark has no MDX; MDX is JSX-in-markdown and needs a JS toolchain. `site.yaml` globs are `**/*.{md,mdx}` throughout (`data.ts:141`, `route-match.ts:115`, `static-paths.ts:64`) | Measured: **0 `.mdx` files exist in `default-docs/data/`** — the capability is advertised but unused. Drop it and delete the glob branch, or keep a Node sidecar for MDX only. Decide explicitly; do not discover it mid-port. |
| Astro's `.astro` component model for layouts | major (framework-dev cost) | 53 `.astro` files; `templ`/`html/template` are plainer and have no scoped-CSS story | Another auditor's surface; noted here only because `layout-registry.ts` is the resolution half of it |
| `import.meta.glob` layout discovery | minor | 9 glob pairs in `layout-registry.ts` become a compile-time map + a runtime overlay scan — arguably clearer | none needed |
| Cookie-driven dev layout/theme override (`[...slug].astro:66-80`, `applyLayoutOverride`) | minor | Depends on `import.meta.env.DEV` and `Astro.cookies` | Trivially rebuilt on `net/http` cookies; the *validation* logic (`availableStyles()` gate) ports as-is |
| Dev-toolbar apps (layout selector, error logger, cache inspector, system metrics) | major | Astro's `addDevToolbarApp` API has no equivalent; four apps + their `api/dev/*` endpoints | Rebuild as an in-page dev panel served by the Go binary. The *data* (`getCacheStats`, `getAllIssues`) ports; the host UI does not |
| Vite HMR / `server.ws.send({type:'full-reload'})` | minor | Replaced by SSE, which the notes already plan | `fsnotify` + SSE |
| The per-file dependency lists in `data.ts` (embeds, diagram/artifact sidecars) | **none today, major if ported naively** | They are already inert (§2A). A Go port that faithfully reproduces "record deps, invalidate by clearing whole caches" would port a bug | Build the dependency graph *properly* in Go, or drop the lists and be honest that invalidation is coarse. Do not port the middle state |
| Static-build parity for the not-found page and plan sub-URLs | **major, and it exists today** | Two measured dev/prod divergences (§5) | A single route resolver used by both `serve` and `build` removes the class. This is the strongest concrete argument in the whole proposal |
| `astro build`'s 1 229-page prerender | none (it is being replaced, not lost) | The Go plan keeps a `build` subcommand for static export | Must enumerate from the same registry as `serve`, or the divergence returns |
| The `@ext-layouts` alias / `LAYOUT_EXT_DIR` external-layout mechanism | minor | It is a Vite `resolve.alias` entry (`astro.config.mjs:132`) resolved at bundle time | A directory scan at startup; simpler in Go |
| `parseInline` for one-line frontmatter fields (`issues.ts:686`) | minor | goldmark renders blocks; inline-only rendering needs a custom renderer or post-strip of the wrapping `<p>` | Strip the wrapper, or use goldmark's inline parser directly. ~20 lines |

---

## 12. Open questions this audit could not settle

1. **Does the Go `serve` keep static export?** If yes, the enumeration must come
   from the same resolver as request matching, or the divergence in §5 is
   recreated on day one. If no, every consumer currently deploying `dist/` to a
   CDN loses that path.
2. **Version-series continuity across the rewrite** (§7). If the Go binary
   continues at `0.2.5` with `MIN_CONTENT_VERSION = 0.2.0`, it commits to parsing
   every format the Astro loader parses, complete, at v1. Nobody has written that
   down.
3. **Is MDX being dropped?** Zero `.mdx` files exist today, but the globs and the
   integration are wired in. This should be a decision, not a discovery.
4. **What replaces `issues.ts`'s 1 781-stat signature?** Options: a proper
   dependency graph, an fsnotify-maintained index, or the eager-incremental design
   already specced in `2026-05-08-update-date-time-optimization`. The notes assume
   the third without saying it also has to cover the *content* cache, not just the
   dates cache — because a `git commit` moves no mtime, the two are coupled.
5. **Should the `globalThis` fix land now, independently of the migration?** It is
   ~10 lines across two files and would let the migration be argued on its real
   merits (distribution, cold start, memory) rather than on a bug that has a
   cheaper fix. This is a decision for whoever owns the issue.
