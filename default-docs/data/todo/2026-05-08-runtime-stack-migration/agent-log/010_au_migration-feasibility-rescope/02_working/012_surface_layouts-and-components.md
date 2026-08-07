---
title: "Layouts and rendering components"
---

# Surface 2 — layouts and rendering components

Audit of everything under `astro-doc-code/src/layouts/` plus the routing and
layout-resolution code in `astro-doc-code/src/pages/`. Every number below was
produced by running a command against the tree; confidence labels are on each
claim that a reader would act on without re-checking.

## Headline

The Astro-specific surface in the layouts tree is **thin and unglamorous** — no
component islands, no hydration directives, no `define:vars`, no view
transitions, 1,288 lines of `<style>` CSS that is already hand-namespaced BEM.
The expensive part is not Astro. It is that **one layout folder,
`issues/default`, is 7,825 lines across 47 files (78 % of the whole layouts
tree)** and is a full interactive application — and that today an external
layout is a *compiled component with access to the framework's TypeScript
loaders*, which a runtime-parsed Go template cannot be.

---

## 1. Inventory

### 1.1 The whole surface, measured

Line counts are `wc -l` over the named extensions; `find`-driven, run 2026-08-07.

| Group | Files | Lines | Note |
|---|---:|---:|---|
| `src/layouts/**/*.astro` | 51 | 5,789 | the components |
| `src/layouts/**/*.ts` | 22 | 3,058 | server helpers, client scripts, guide, icons |
| `src/layouts/**/*.css` | 3 | 1,175 | issues-only stylesheets |
| **`src/layouts/` total** | **76** | **10,022** | excludes 10 `README.md` (525 lines) |
| `src/pages/**` (routing) | 12 | 1,631 | 2 `.astro`, 10 `.ts` |
| `src/scripts/**` (site-wide client JS loaded by `BaseLayout`) | 8 | 1,643 | adjacent surface, not owned here |
| **Total in scope + adjacent** | **96** | **13,296** | |

For context: `src/` as a whole is 43,268 lines across 221 files; code-only
(`.ts` + `.astro` + `.css`) is 33,855. So this surface is **~30 % of the
framework's code**. (measured)

Of the 53 `.astro` files in `src/`, **51 are under `layouts/`** and 2 are under
`pages/` (`[...slug].astro`, `editor.astro`). There are no `.astro` files
anywhere else. (measured)

### 1.2 Per-layout-folder inventory

Lines are `.astro` + `.ts` + `.css` inside the folder; `README.md` excluded.

| Layout folder | Files | Lines | Entry file(s) | Verdict |
|---|---:|---:|---|---|
| `issues/default` | 47 | 7,825 | `IndexLayout.astro`, `DetailLayout.astro`, `SubDocLayout.astro` | **a project on its own** |
| `docs/default` | 7 | 575 | `Layout.astro` | medium |
| `custom/home` | 4 | 296 | `Layout.astro` | small |
| `blogs/default` | 6 | 250 | `IndexLayout.astro`, `PostLayout.astro` | small |
| `navbar/default` | 1 | 230 | `index.astro` | small |
| `custom/countdown` | 1 | 200 | `Layout.astro` | small, self-contained |
| `BaseLayout.astro` | 1 | 153 | — | root wrapper |
| `custom/info` | 3 | 136 | `Layout.astro` | trivial |
| `navbar/minimal` | 1 | 109 | `index.astro` | trivial |
| `docs/compact` | 2 | 95 | `Layout.astro` | trivial — imports `../default/` parts |
| `footer/default` | 1 | 85 | `index.astro` | trivial |
| `footer/minimal` | 1 | 34 | `index.astro` | trivial |
| `file-type-icons.ts` (shared) | 1 | 34 | — | shared icon map |

`_ext-stub/` holds a single `.gitkeep` — it is the fallback target for the
`@ext-layouts` Vite alias when no external layout directory is configured.

### 1.3 `issues/default` broken out

This is the folder that decides the migration estimate.

| Sub-area | Files | Lines | Contents |
|---|---:|---:|---|
| Entry + body components | 5 | 450 | `IndexLayout` (12), `DetailLayout` (14), `SubDocLayout` (133), `IndexBody` (161), `DetailBody` (130) |
| `parts/index/` | 8 | 1,281 | `FilterBar` (536), `GuideModal` (353), `IssuesTable` (328), `IssuesCards` (145), `Pagination` (93), `StateTabs` (98), `PresetStrip` (74), `ViewToggle` (54) |
| `parts/detail/` | 11 | 1,475 | `DetailSidebar` (403), `SubdocTree` (325), `SubtaskTree` (126), `PlanPage` (175), `Comprehensive` (104), `MetaSidebar` (98), `OverviewSubtasks` (65), `IssueThread` (52), `SubtaskPage` (50), `NotePage` (45), `SubDocMetaSidebar` (34) |
| `parts/shared/` | 3 | 116 | `MetaPanel` (61), `IssueCard` (34), `StatusBadge` (21) |
| `server/` (render-time TS) | 4 | 646 | `helpers.ts` (512), `toc.ts` (51), `agent-log-icons.ts` (42), `state-icon.ts` (41) |
| `scripts/index/` (browser TS) | 5 | 1,225 | `client.ts` (797), `groups.ts` (178), `filters.ts` (130), `types.ts` (68), `presets.ts` (52) |
| `scripts/detail/` (browser TS) | 5 | 456 | `subtask-state.ts` (194), `panels.ts` (150), `toc-observer.ts` (61), `comprehensive.ts` (53), `types.ts` (28), `client.ts` (20) |
| `styles/` | 3 | 1,175 | `detail.css` (1,042), `groups.css` (97), `index.css` (36) |
| `guide.ts` | 1 | 504 | framework-bundled issue-anatomy guide, rendered per issue |

`server/helpers.ts` alone exports **41 symbols** — URL builders
(`detailUrl`, `subtaskUrl`, `noteUrl`, `logUrl`, `planUrl`, `brainstormUrl`,
`agentMemoryUrl`, `sectionEntryUrl`), panel-key builders, status sorting
(`sortSubtasksByState`, `terminalStartIndex`, `effectiveStatus`, `needsReview`),
tree grouping (`groupByPath`, `groupSubtasks`), plan rendering
(`planDocument`, `resolvePlanStage`, `stageHeadingText`), and presentation
helpers (`formatRelativeTime`, `avatarColor`, `initial`, `wordCount`, `pad`).
This is domain logic that happens to live in the layout folder — it is a port,
not a template rewrite. (read)

### 1.4 Layout resolution — how a URL becomes a component

Three files, 696 lines total:

```
site.yaml  pages:                       [...slug].astro (105)
   path / type / layout: "@docs/default"      │
              │                               ├─ getStaticPaths → static-paths.ts (172)
              ▼                               ├─ SSR fallback   → route-match.ts   (369)
        RouteProps { pageType, layout, … }    │      matchServerRoute + prepareRender
                                              │
                                              ├─ dev cookie overrides
                                              │    dev-layout / dev-navbar / dev-footer
                                              │
                                              ├─ resolveLayout(alias, variant) ─┐
                                              ├─ resolveChrome(alias, kind)   ──┤ layout-registry.ts (222)
                                              ▼                                 │
                                  <BaseLayout>                                  │
                                    <NavbarComponent slot="navbar"/>            │
                                    <LayoutComponent {...layoutProps}/>  ◄──────┘
                                    <FooterComponent slot="footer"/>
                                  </BaseLayout>
```

`layout-registry.ts` holds **18 `import.meta.glob()` calls** — one `builtin`
and one `ext` pattern for each of 9 registry keys (`docs`, `custom`,
`blog-index`, `blog-post`, `issues-index`, `issues-detail`, `issues-subdoc`,
`navbar`, `footer`). A style name is extracted from the path with
`/\/([^/]+)\/[^/]+\.astro$/`, external entries overwrite built-in ones of the
same name, and the result is a `Map<style, () => Promise<Module>>`. Three
error paths throw structured `[CONFIG ERROR]` messages listing the expected
file path and the available styles. (read)

`import.meta.glob` appears **29 times across `src/`** — 18 in
`layout-registry.ts`, 5 in `pages/api/dev/layouts.ts`, 6 elsewhere. (measured)

---

## 2. Astro-specific features actually used

Counts are grep over `src/**/*.astro` (53 files). This is the list a Go port has
to answer for.

| Astro feature | Occurrences | Where | Go/templ replacement | Cost |
|---|---:|---|---|---|
| `Astro.props` + `interface Props` | 51 / 47 | nearly every component | struct passed to template; templ has typed params | straight port |
| `<style>` scoped CSS | 13 files, 1,288 lines | see §3 | no equivalent — see §3 | see §3 |
| `<script>` (bundled TS) | 7 | `BaseLayout` ×5, `IndexBody`, `DetailBody`, `SubDocLayout`, `navbar`×2, `Outline`, `GuideModal`, `countdown`, `editor` | Vite manifest + `<script type=module src=…>` | straight port |
| `set:html` | 31 | markdown HTML + inline SVG injection | `template.HTML` / `templ.Raw` | straight port |
| `<Fragment set:html>` | 13 | body HTML injection | same | straight port |
| `class:list` | 10 | `SidebarNode` ×5, `navbar` ×3, `Outline`, `SubDocLayout` | `templ` conditional classes, or a `classes` helper func | straight port |
| `<script is:inline>` | 3 | dark-mode bootstrap, sidebar restore, detail sidebar | literal `<script>` in template | straight port |
| `<script type="application/json" …>` config passing | 3 | `IndexBody`, `DetailBody`, `SubDocLayout` | `json.Marshal` into a `<script>` tag | straight port |
| `<slot>` / named slots | 6 | `BaseLayout` (navbar/default/footer), `Body`, `Content`, `info/Layout` | `templ` children / `html/template` block+define | straight port |
| `Astro.self` (recursive component) | 4 | `SidebarNode` ×2, `SubtaskTree`, `SubdocTree` | named template calling itself; `templ` recursion | straight port |
| `import.meta.glob` layout discovery | 29 | `layout-registry.ts`, dev API | compile-time map + boot-time overlay scan | redesign, small |
| `Astro.url.pathname` | 2 | `navbar/default`, `navbar/minimal` | `r.URL.Path` | straight port |
| `Astro.cookies` | 2 | `BaseLayout` (theme override), `[...slug]` (layout override) | `r.Cookie` | straight port |
| `Astro.params` | 1 | `[...slug]` | router param | straight port |
| `Astro.redirect` / `Astro.response.status` | 3 | `[...slug]` | `http.Redirect`, `w.WriteHeader` | straight port |
| `Astro.generator` | 1 | `BaseLayout` meta tag | constant string | trivial |
| `define:vars` | **0** | — | nothing to replace | none |
| `client:load` / `client:idle` / `client:visible` / `client:only` | **0** | — | nothing to replace | none |
| `ClientRouter` / `<ViewTransitions>` | **0** | — | nothing to replace | none |
| `is:raw` | **0** | — | — | none |
| `Astro.slots` (programmatic) | **0** | — | — | none |

**The good news, stated plainly.** There are **zero component islands and zero
hydration directives** in this codebase. Every layout is server-rendered HTML
plus hand-written vanilla-TS DOM code loaded by a plain `<script>` tag. The
proposal's "replace hydration directives with explicit dynamic imports" is a
no-op here — there is nothing to replace. (measured)

**One dead pattern.** Five files register `document.addEventListener('astro:page-load', …)`
(`navbar/default:229`, `navbar/minimal:108`, `docs/default/Sidebar:201`,
`docs/default/Outline:87`, `issues/default/parts/detail/DetailSidebar:400`) but
no `ClientRouter`/`ViewTransitions` component exists anywhere in `src/`, so the
event never fires. Five lines of dead re-init that a naive port would carry
across. (measured)

### 2.1 The MDX dependency

`astro.config.mjs` registers `mdx()` from `@astrojs/mdx`. No layout file
imports or renders an `.mdx` component; markdown rendering goes through the
project's own `marked`-based pipeline in `src/parsers/`. The integration is
loaded but this surface does not depend on it. (read)

---

## 3. Scoped CSS — measured, and less bad than expected

Astro auto-scopes every `<style>` block by stamping `data-astro-cid-*` on the
component's elements and rewriting the selectors. Go `html/template` and `templ`
have no equivalent, so the honest question is: *how much CSS relies on it, and
would it break if made global?*

### 3.1 How much CSS is where

| Location | Files | Non-blank CSS lines | Scoped by Astro? |
|---|---:|---:|---|
| `<style>` blocks inside `.astro` | 13 | 1,288 | yes (except `editor.astro`'s `is:global`) |
| — of which inside `:global(){}` escapes | — | 127 | no, explicitly opted out |
| — genuinely auto-scoped | — | **1,161** | yes |
| `src/layouts/**/*.css` (imported) | 3 | 1,175 raw | **no** — plain global CSS |
| `src/styles/*.css` (theme + chrome) | 12 | 2,741 raw | **no** — global |
| `src/dev-tools/editor/styles/*.css` | 3 | 861 raw | **no** — global |
| **All `.css` files in `src/`** | 18 | **4,236 non-blank** | no |

So of ~5,500 non-blank CSS lines in `src/`, only **1,161 (21 %) depend on
Astro's scoping**, and all of them sit in 12 components. (measured)

### 3.2 Would globalising those 1,161 lines break anything?

I extracted every selector block from the scoped `<style>` blocks and checked
what each selector's leftmost compound is anchored on.

| Check | Result |
|---|---|
| Selector blocks in scoped `<style>` | 172 |
| Whose leftmost compound is a bare element/tag selector (would leak) | **0** |
| Distinct class names defined in scoped blocks | 161 |
| Class names defined in more than one scoped block | **2** (`.is-active`, `.issues-view`) |

Both duplicates are safe on inspection: every `.is-active` rule is compound and
BEM-anchored (`.issues-filters__groupby.is-active`,
`.issues-presets__btn.is-active`, `.issues-table__sort-icon.is-active`,
`.issues-view-toggle__btn.is-active`, `.issues-view--cards.is-active`), and the
one true duplicate — `.issues-view.is-active { display: block; }` in both
`IssuesCards.astro` and `IssuesTable.astro` — is byte-identical. (measured, then
read for the compound check)

**Conclusion:** the replacement discipline for a Go port is "keep writing BEM,
which is what the code already does". The mechanical work is: move 1,161 lines
out of 12 `.astro` files into 12 `.css` files, wire them into the Vite CSS
entry, and delete 21 `:global()` wrappers (which become no-ops). That is a
day's work, not a redesign. **This is the cheapest item on the whole surface,
and any estimate that prices scoped CSS as a major risk is wrong.**

The one caveat: Astro's scoping is currently a *silent* safety net. Once it is
gone, a future contributor who writes `.card { … }` in a new layout breaks
another layout with no warning. The mitigation is a lint rule (stylelint
`selector-class-pattern` with a per-layout prefix), not a runtime mechanism.

---

## 4. External layouts — the key question

### 4.1 What ships today

An external layout is configured by one env var. From `.env.example` and the
live `.env`:

```
LAYOUT_EXT_DIR=./default-docs/layouts     # dogfood mode
LAYOUT_EXT_DIR=../layouts                 # consumer mode
```

`astro.config.mjs` resolves it against the repo root, hard-errors if the
directory is missing, adds it to `vite.server.fs.allow`, and aliases it to
`@ext-layouts`. When unset, the alias points at `src/layouts/_ext-stub/` so the
globs resolve to nothing. (read)

A user's external layout is **a real `.astro` component compiled by Vite**. Per
`default-docs/data/user-guide/20_custom-pages/03_creating-custom-layouts.md`, it
may:

- import framework internals through aliases — `@loaders/`, `@parsers/`,
  `@hooks/`, `@modules/`, `@styles/`, `@layouts/`, `@ext-layouts/`;
- call server-side loaders directly (`loadFile`, `loadContentWithSettings`,
  `loadIssues`) — every built-in custom layout does exactly this;
- import sibling `.astro` components and `.ts` utilities from its own folder;
- ship a scoped `<style>` block;
- ship a `<script>` that Vite bundles, tree-shakes and hashes;
- declare a typed `interface Props`.

It is auto-discovered by style name and overrides a built-in of the same name.
It requires no source edit to the framework.

**Note for the estimate:** `default-docs/layouts/` currently contains exactly
one file, `.gitkeep` (0 lines). The mechanism is wired and configured but has
**zero real users in this repo**, so it is an unexercised path against the
current layout set. (measured)

### 4.2 What a compiled Go binary can and cannot offer

Two options, and they are genuinely different products.

| | Runtime-parsed `html/template` (or `text/template`) | Compiled `templ` |
|---|---|---|
| User ships a layout without a toolchain | **yes** — drop `layout.html` in a folder, server re-parses | **no** — needs Go + `templ` + a rebuild |
| Typed props | no — `map[string]any` / `any`, errors at render | yes — compile-checked structs |
| User can call framework loaders | **no** — only registered `FuncMap` helpers and the data the Go handler chose to pass | yes (it is Go) |
| User can define new data sources | **no** | yes |
| Layout ships its own JS island | needs a Vite build on the user's machine → **Node is back** | same |
| Layout ships its own CSS | yes, served raw | yes |
| Render errors | runtime, per request, discovered by the user | compile time |
| Hot reload | re-parse on fsnotify, ~ms | rebuild the binary |

The honest characterisation: **runtime templates preserve the *presentation*
half of today's external-layout contract and lose the *behaviour* half.** Today
a user layout is code; under a runtime-template design it becomes a view over a
data shape the engine decided in advance. That is precisely the
"layout ↔ structure compatibility config" the architecture-update note is
proposing, so the design direction already anticipates it — but the note's
runtime-config table does not say that the contract narrows.

Concrete example of what stops working: `custom/countdown/Layout.astro` (200
lines) calls `loadFile(dataPath)` and reads five arbitrary YAML keys. A user
who wants a "countdown" layout today writes exactly that and ships it. Under
runtime templates, they can only render fields the Go handler already
unmarshals and passes in — so a genuinely new custom-page shape needs a binary
rebuild. The note admits this for *new layout types* ("Same — Astro requires
source edit") but that comparison is not accurate: today, adding a new custom
*style* with a new data shape needs **no** source edit, only `LAYOUT_EXT_DIR`.

A third option worth naming because it dodges the trade-off: keep the JS
toolchain optional but let a layout declare a **schema** (its own YAML/JSON) that
the Go loader reads generically into `map[string]any`, then render with
`html/template`. That gives back arbitrary data shapes without arbitrary code.
It is more work than either option above and is not in the notes. Not deciding
here — flagging that the binary choice as presented is a false pair.

---

## 5. TypeScript — how load-bearing is it, really

`tsconfig.json` extends `astro/tsconfigs/strict` and defines 9 path aliases.
Type usage in layouts is heavy on the surface:

- **47 `interface Props` declarations** across 53 `.astro` files
- **30 `import type` statements** in layout components, pulling `Issue`,
  `IssuesVocabulary`, `IssueSubtask`, `IssueNote`, `IssueAgentLog`, `IssuePlan`,
  `IssueStatus`, `TocEntry`, `SidebarNode`, `NavItem`, `FooterColumn`,
  `GuideHeading`, `AgentLogKind` from the loaders
- `SubDocLayout.astro` types `subDoc` as a **6-arm discriminated union**, and the
  file's control flow depends on narrowing it

And then it is not enforced anywhere:

| Check | Result | Confidence |
|---|---|---|
| `astro check` in any script / CI / `start` wrapper | **not present** | measured (grep over `package.json`, `start`, `start.ps1`, `.github/workflows/release.yml`) |
| `@astrojs/check` installed | **not installed** (`node_modules/@astrojs/` = compiler, internal-helpers, markdown-remark, mdx, prism, telemetry) | measured |
| `tsc --noEmit` anywhere | **not present** | measured |
| `tsc --noEmit -p tsconfig.json` run by hand, now | **27 errors in 5 files** | measured |

Two of those five files are in this surface:
`src/pages/lib/layout-registry.ts` (the `LayoutLoader` variance error) and
`src/layouts/issues/default/scripts/index/client.ts:574`, which reads

```ts
function applyPreset(preset: import('./issues-types').PresetView) {
```

— a module that does not exist (the file is `types.ts`). Because it sits in type
position it erases at build, the runtime is fine, and nothing has ever flagged
it. `preset` has been implicitly `any` at that call site. (measured)

Also worth stating: **`tsc` does not check `.astro` files at all**, and
`astro check` is not installed. So the 47 `interface Props` contracts — the
thing that makes component wiring safe in this codebase — are validated by the
editor language server and by nothing else.

**The honest answer to "how much type-safety is load-bearing":** a large amount
of type *information* exists and is genuinely useful while editing, but **zero
of it is enforced by any gate**. Moving to Go would not lose an enforced
guarantee — it would, for the built-in layouts, *add* one, since Go and `templ`
both fail the build on a wrong field. The loss is confined to external layouts
if runtime templates are chosen (§4.2).

---

## 6. Dependencies

Marked as required by the task: Astro-only / Node-only / portable / browser-side.

| Dependency | Used by | Class | Notes |
|---|---|---|---|
| `astro` (component runtime, `.astro` compiler) | all 53 `.astro` files | **Astro-only** | the whole component model |
| `import.meta.glob` (Vite) | `layout-registry.ts`, `api/dev/layouts.ts` | **Vite-only** | needs literal string patterns — that constraint is *why* there are 18 hand-written globs |
| Vite path aliases (`@layouts`, `@loaders`, …) | 30 typed imports + every component import | Vite-only | Go has no analogue; becomes package imports |
| Vite `<script>` bundling | 7 script tags | Vite-only, but **preserved** in the proposal | proposal keeps Vite as build tool |
| `@astrojs/mdx` | registered, unused by layouts | Astro-only | droppable from this surface |
| `js-yaml` | `astro.config.mjs`, loaders | Node-only | Go: `gopkg.in/yaml.v3` |
| `clsx` | declared in `package.json` | — | **not imported by any layout file** (`class:list` is used instead) |
| `marked` + `marked-alert` (via `@parsers/renderers`) | `guide.ts` | Node-only | Go: `goldmark` |
| `shiki` | markdown pipeline (surface 3) | Node-only | Go: `alecthomas/chroma` |
| `localStorage` (34 refs) | sidebar collapse, filter cache, theme, view mode | **browser-side** | survives any server |
| `sessionStorage` (12) | panel/scroll state | browser-side | survives |
| `history.replaceState` (6), `URLSearchParams` (7), `location.search` (4) | issues filter state in the URL | browser-side | survives |
| `IntersectionObserver` (2) | TOC scroll-spy | browser-side | survives |
| `MutationObserver` (2) | dynamic re-wiring | browser-side | survives |
| `<dialog>` + `showModal()` | `GuideModal` | browser-side | survives |
| `matchMedia` (1) | dark-mode bootstrap in `BaseLayout` | browser-side | survives |
| `fetch('/__editor/subtask-toggle')` (1) | `scripts/detail/subtask-state.ts` | browser-side, **needs a server route** | the Go server must implement this POST endpoint or subtask toggling dies |
| `requestAnimationFrame` (10), `getBoundingClientRect` (8), `scrollIntoView` (7) | scroll centring, sidebar | browser-side | survives |

### 6.1 The cross-language duplication nobody has costed

Five browser-side layout scripts import `@loaders/issue-status` — a 238-line
server module that is the single source of truth for the status vocabulary
(`STATUSES`, `CATEGORIES`, `TERMINAL_STATUSES`, `STATUS_LABELS`,
`STATUS_DESCRIPTIONS`, `statusVar`, `categoryOf`, `isValidStatus`,
`normalizeStatus`, `LEGACY_STATUS_MAP`):

```
layouts/issues/default/scripts/detail/comprehensive.ts:9
layouts/issues/default/scripts/detail/subtask-state.ts:9
layouts/issues/default/scripts/detail/types.ts:1
layouts/issues/default/scripts/index/filters.ts:7
layouts/issues/default/scripts/index/types.ts:6
```

Today Vite bundles the same module into both the SSR graph and the browser
bundle, so server and client cannot disagree. Under Go + Vite the server side
becomes Go and the browser side stays TS — **the status model has to exist twice,
in two languages**. Either it is hand-duplicated (guaranteed drift, and this
project's own conventions treat status vocabulary as framework-fixed) or it is
code-generated from one source. Neither the architecture notes nor the runtime-
config note mentions this. (measured — the imports; read — the consequence)

---

## 7. Port cost, capability by capability

| Capability | Go equivalent | Kind of work |
|---|---|---|
| Component tree, props, composition | `templ` components or `html/template` `define`/`template` | **straight port**, 51 components |
| Named slots (`navbar`/`footer`/default) | `templ` children, or template blocks | straight port |
| Recursive components (`Astro.self` ×4) | recursive named template / recursive `templ` func | straight port |
| Conditional classes (`class:list` ×10) | `templ` class expressions or a `cls()` FuncMap helper | straight port |
| Raw HTML injection (`set:html` ×31) | `template.HTML` / `templ.Raw` | straight port |
| Config → client via `<script type=application/json>` ×3 | `json.Marshal` + `template.JS` | straight port |
| Layout discovery + `@type/style` alias resolution | compile-time `map[string]Renderer` + boot-time overlay scan | **redesign, small** — ~200 lines |
| Structured `[CONFIG ERROR]` messages (3 paths) | same strings, `fmt.Errorf` | straight port |
| Dev cookie layout/theme override (`dev-layout`, `dev-navbar`, `dev-footer`, `dev-color-theme`) | read cookie in handler | straight port |
| Scoped CSS (1,161 lines) | move to `.css` + keep BEM + a lint rule | **straight port** (§3) |
| Site-wide client scripts (`src/scripts/`, 1,643 lines) | unchanged TS, Vite-built, script tags from manifest | **no port** — survives |
| `issues/default` browser TS (1,681 lines) | unchanged TS | **no port** — survives |
| `issues/default/server/*.ts` (646 lines) | rewrite in Go | **straight port**, but it is real logic |
| `guide.ts` (504 lines of markdown template + generated tables) | Go string templates + goldmark | straight port, tedious |
| `parts/detail/PlanPage.astro` + `planDocument()` | Go | straight port |
| External layout as a **compiled component with loader access** | — | **LOST** under runtime templates (§4) |
| Typed `interface Props` across component boundaries | Go structs / `templ` params | **improved** for built-ins, **lost** for external layouts under runtime templates |
| `astro:page-load` re-init hooks (5) | nothing | delete |

---

## 8. What is lost or degraded

| Item | Severity | Why | Mitigation |
|---|---|---|---|
| External layout can run server-side code (call `loadFile`, `loadIssues`, import `@loaders/*`) | **major** | Runtime-parsed Go templates can only render data the engine already chose to pass. A user-shipped layout with a new data shape stops being possible without a binary rebuild. | Choose `templ` (users need Go) — or add a generic "layout declares its own YAML schema, engine unmarshals into `map[string]any`" mechanism, which is more work than either option in the notes |
| External layout can ship a bundled `<script>` island for free | **major** | Vite must run on the user's machine to bundle it; the note itself routes this through `doc-engine dev --vite`, i.e. Node returns for exactly the person the migration promised to free from Node | Ship pre-bundled islands with the binary and expose a documented island API; accept that novel islands need the dev toolchain |
| Compile-time validation of layout props | **minor** | Currently unenforced anyway (§5) — no `astro check`, 27 live `tsc` errors | `templ` for built-ins makes this strictly better |
| Astro's automatic CSS scoping | **minor** | 1,161 lines, all already BEM-anchored, 0 tag-anchored selectors | stylelint `selector-class-pattern` per layout prefix |
| One source of truth for the status vocabulary across server and browser | **major** | `issue-status.ts` (238 lines) is imported by 5 browser modules *and* the render path; Go+TS splits it in two | code-generate the TS from a Go source (or from a shared JSON), and gate on the generated file being current |
| Per-layout `README.md` colocated with the code (10 files, 525 lines) | **none** | plain markdown, moves as-is | — |
| Astro's error overlay for template errors | **minor** | Go runtime templates fail per request at render time, not at build | a `--check-templates` boot flag that parses and executes every registered template against a fixture |
| Hot module reload of a layout component | **minor** | Astro/Vite HMR swaps a component without reload; Go re-parses and the browser full-reloads via SSE | SSE reload is what the notes propose; acceptable |
| Component islands / hydration directives | **none** | zero in use | — |
| View transitions | **none** | zero in use (5 listeners that never fire) | delete them |
| `define:vars` | **none** | zero in use | — |

---

## 9. Claims in the architecture notes, checked against the code

| Claim (source) | Verdict | Evidence |
|---|---|---|
| "`import.meta.glob()` layout resolution (replaced by Go's compile-time map)" — `notes/architecture/01_overview.md` | **holds, understated** | 18 globs in `layout-registry.ts` + 5 in `api/dev/layouts.ts`. A compile-time map covers built-ins; the *external* half needs a boot-time filesystem scan, which the note does not mention here (it does in `05_runtime-config-surface.md`). |
| "Astro's hydration directives (`client:load`, etc.) → replaced by explicit dynamic imports" — `03_vite-frontend-and-dist.md` | **false as stated** | Zero `client:*` directives exist. Nothing to replace. |
| "Astro's component-island runtime (~30 KB) → replaced by direct script tags" | **false as stated** | No islands are used; layouts already ship direct `<script>` tags. |
| "Compare to today's Astro setup which ships ~300–500 KB to most pages" | **unverifiable from this surface** | Not measured here; no built `dist/` was produced. The layouts tree ships 7 `<script>` tags of hand-written vanilla TS totalling 3,324 source lines (`src/scripts/` 1,643 + `issues/default/scripts/` 1,681), with the heavy libraries (mermaid, excalidraw, graphviz, CodeMirror) lazy-loaded by `src/scripts/diagrams.ts` and the editor route. Somebody should measure this before it is quoted. |
| "Layout overlay path — **Behaviour: identical.** … `layout.html` ← Go template (today: `Layout.astro`)" — `05_runtime-config-surface.md` | **partly holds** | The *discovery and override* semantics port exactly. The *contract* does not: today's `Layout.astro` may import framework loaders and run server code; a `layout.html` may not. The note's own table then contradicts the "identical" line by putting `island.ts` at ⚠️. |
| "**Net:** the user-editable surface is identical." — `05_runtime-config-surface.md` | **false** | Adding a new custom-page style with a new YAML shape needs no framework source edit today (drop it in `LAYOUT_EXT_DIR`, point `site.yaml` at it — this is exactly what `custom/countdown`, `custom/home` and `custom/info` do, and the user-guide documents it as "the recommended path"). Under runtime templates it needs a binary rebuild. |
| "Adding a new custom-page type still requires a built-in template — same as today (Astro doesn't let users add layout types either without source edits)" | **false for *styles*, true for *types*** | Types (`docs`/`blog`/`issues`/`custom`) are fixed by `[...slug].astro` — true. Styles are not: `@ext-layouts` adds a style with no source edit. |
| "The current code does not draw these distinctions cleanly; we fix it when we rewrite" — `architecture-update/01_the-structure.md` | **holds** | `route-match.ts` (369) and `static-paths.ts` (172) both branch on `type` and are kept in sync by hand; `layout-registry.ts` hard-codes 9 registry keys and 7 alias prefixes in three parallel tables (`GLOBS`, `ALIAS_PREFIX`, `EXPECTED_PATH`). Adding a structure means editing all of them. |
| "navbar/footer filed under `layouts/` … lift into a shell" — same note | **holds** | `layouts/navbar/{default,minimal}` and `layouts/footer/{default,minimal}` are registry keys alongside content layouts, and `BaseLayout.astro` composes them through named slots. 458 lines total; the lift is cheap. |
| "TypeScript everywhere on the frontend [preserved]" — `03_vite-frontend-and-dist.md` | **holds for browser code, silently false for render code** | 1,681 lines of `issues/default/scripts/` and 1,643 of `src/scripts/` stay TS. But 646 lines of `issues/default/server/*.ts` + 504 of `guide.ts` + 3,058 total layout `.ts` become Go, and `issue-status.ts` has to live on both sides. |

---

## 10. Defects found while measuring

Not the point of the audit, but a port would carry these across if nobody says so.

| Finding | File | Confidence |
|---|---|---|
| `import('./issues-types')` names a nonexistent module; `preset` is implicitly `any`. Survives because no typecheck gate runs. | `src/layouts/issues/default/scripts/index/client.ts:574` | measured (`tsc` reproduces it) |
| The dev layouts API globs `/src/layouts/docs/styles/*/Layout.astro` — there is no `styles/` path segment (real path is `docs/<style>/Layout.astro`). Docs / blog / custom lists return empty to the layout-selector toolbar, which fetches this at `dev-tools/layout-selector/index.ts:91`. Navbar/footer globs are correct. | `src/pages/api/dev/layouts.ts:11-18` | read |
| Five `index.ts` layout manifests (143 lines) export `components` / `styles` / `config` maps pointing at `@layouts/docs/components/…`, `@layouts/blogs/components/…`, `@layouts/custom/components/…` — **none of those directories exist**, and nothing in `src/` imports these modules. Dead. | `layouts/{docs/default,docs/compact,blogs/default,custom/home,custom/info}/index.ts` | measured (`ls` + grep for importers) |
| Five `astro:page-load` listeners with no router to fire them. | see §2 | measured |
| `clsx` is a declared dependency and is imported by nothing under `src/`. | `package.json` | measured |

---

## 11. Port cost estimate for this surface

| Component of the estimate | Lines | Basis |
|---|---:|---|
| 51 `.astro` components → `templ`/`html/template` | 5,789 | mechanical but wide; `issues/default` is 27 of them |
| Layout `.ts` that becomes Go (`server/`, `guide.ts`, `file-type-icons.ts`) | 1,184 | real logic, not markup |
| Layout `.ts` that stays TS (browser) | 1,874 | no port |
| Routing + resolution (`pages/lib/` + `[...slug].astro`) | 696 | redesign against the structure-registry model |
| Scoped CSS relocation | 1,161 | move + lint rule |
| Layout `.css` (already global) | 1,175 | no port |

**Estimate: 6–9 weeks solo for a faithful port of this surface**, of which
4–6 weeks is `issues/default` alone. That assumes the structure-registry
redesign from `architecture-update/01_the-structure.md` is done as part of it
rather than after — doing the port first and the redesign second means writing
`route-match.ts`'s `switch (type)` in Go and then deleting it.

Confidence: **read**. It is a line-count-and-shape estimate, not a measured
port of any component. The number that would sharpen it most is a spike:
port `docs/default` (575 lines, 7 files, one recursive component, one inline
script, zero scoped CSS) end to end and multiply.

---

## 12. Open questions

1. **Runtime templates or `templ`?** §4.2 lays out the trade-off. This decides
   whether "a user can ship a layout" survives in any form, and it is not a
   detail — it is the difference between a documentation *framework* and a
   documentation *binary*.
2. **Where does the status vocabulary live** once server is Go and client is TS?
   Hand-duplicate, or generate one from the other?
3. **Does `POST /__editor/subtask-toggle` survive?** `scripts/detail/subtask-state.ts`
   writes issue status back to `settings.json` through it. If the Go server does
   not implement it, subtask toggling silently rolls back on every click.
4. **What replaces Astro's build-time layout validation?** Today a bad
   `layout:` alias in `site.yaml` fails the build with a message naming the
   expected path and the available styles. With runtime templates that becomes a
   500 on the affected page unless a boot-time validation pass is written.
5. **Do the 10 layout `README.md` files stay colocated with Go code?** They are
   the only per-layout documentation that exists.
