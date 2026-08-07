---
title: "Theming and CSS customization"
---

# Surface 3 — theming and CSS customization

**Headline.** The theme system is the most portable subsystem in the repo: `theme.ts`
is `fs` + `js-yaml` + string concatenation with no Astro API in it at all, and dark
mode is 100 % client-side. What actually breaks in a Go rewrite is *adjacent* — the
1,364 lines of Astro-compiler-scoped `<style>` blocks inside `.astro` components, and
the Astro dev-toolbar host that the theme switcher lives inside.

Everything below is grounded in the files named. Confidence is labelled per claim:
**measured** = a command was run, **read** = the code was opened, **assumed** =
inference.

---

## 1. What exists

### 1.1 The size of the surface

CSS line counts, `wc -l`, **measured**:

| Location | Files | Lines |
|---|---:|---:|
| `astro-doc-code/src/styles/` (all) | 12 | 2,646 |
| — of those, listed in `theme.yaml` `files:` and actually served | 10 | 2,594 |
| — of those, present but never loaded (`globals.css`, `index.css`) | 2 | 52 |
| `astro-doc-code/src/layouts/issues/default/styles/` | 3 | 1,175 |
| `astro-doc-code/src/dev-tools/editor/styles/` | 3 | 861 |
| **All `.css` under `src/`** | **18** | **4,682** |
| CSS inside `.astro` `<style>` blocks | 13 of 53 `.astro` files | 1,364 |
| CSS inside `.ts` template literals (dev toolbar apps) | 8 | 790 |
| `default-docs/themes/**/*.css` (the two shipped user themes) | 3 | 204 |
| `default-docs/themes/**/theme.yaml` | 2 | 21 |

Theming *code* (not CSS), `wc -l`, **measured**:

| File | Lines | Role |
|---|---:|---|
| `astro-doc-code/src/loaders/theme.ts` | 513 | resolution, manifest load, CSS merge, inheritance, validation, discovery |
| `astro-doc-code/src/loaders/theme-types.ts` | 101 | `ThemeManifest` / `ThemeConfig` / validation types |
| `astro-doc-code/src/pages/api/dev/themes.ts` | 79 | dev-only JSON endpoint listing themes |
| `astro-doc-code/src/styles/theme.yaml` | 89 | the contract manifest for the built-in theme |
| `astro-doc-code/src/layouts/BaseLayout.astro` | 153 total, ~45 theming | CSS injection + dark-mode boot script + dev cookie override |
| `astro-doc-code/src/loaders/config.ts` | 494 total, ~45 theming | `theme` / `theme_paths` resolution, `getTheme()`, `getThemePaths()` |
| `astro-doc-code/src/dev-tools/layout-selector/index.ts` | 739 total, ~200 theming | the dev-toolbar theme + display-mode picker |
| `plugins/agent-ks/skills/agent-ks-docs/scripts/theme/tokens.mjs` | 298 | the one CLI verb: `agent-ks theme tokens` |

Documentation that describes this surface as a user contract: **4,252 lines** across
24 files under `default-docs/data/user-guide/25_themes/` (**measured**). Any
behavioural change here is also a docs rewrite of that size.

### 1.2 The contract — `required_variables`

`astro-doc-code/src/styles/theme.yaml` declares **53 required variables** in three
groups (**measured**, parsed out of the YAML):

| Group | Count | Contents |
|---|---:|---|
| `colors` | 21 | 3 backgrounds, 3 text, 2 borders, 2 brand, 4 status (`success` / `warning` / `error` / `info`), **7 `--status-<name>` issue-lifecycle tokens** |
| `fonts` | 19 | 2 families, 6 primitive sizes, `--line-height-base`, 3 semantic UI tokens (`--ui-text-micro/body/title`), 7 semantic content tokens (`--content-body`, `--content-h1`…`h6`), `--content-code` |
| `elements` | 13 | 5 spacing, 3 radius, 3 shadow, 2 transition |

The seven `--status-*` tokens are `--status-open`, `--status-blocked`,
`--status-in-progress`, `--status-input-needed`, `--status-review`, `--status-done`,
`--status-dropped`. The manifest comment states plainly that the *names* are fixed in
`astro-doc-code/src/loaders/issue-status.ts` and are not configurable by any tracker;
only the colours are theme-owned. `issue-status.ts:70` builds the reference
dynamically: `` return `var(--status-${status})` `` — so the CSS variable name is
constructed from the status string at render time.

The 53 required variables are the *floor*. The built-in default theme actually
declares **109 distinct custom properties** (**measured** via
`agent-ks theme tokens default --json`), of which **20 differ between light and dark**.
The extras (z-index scale, opacity scale, border widths, `--sidebar-width`,
`--navbar-height`, `--outline-width`, `--max-width-*`, `--display-*`, `--font-weight-*`)
are used by layouts but are **not** in the contract, so a `replace`-mode theme that
satisfies the contract can still break the site.

Cross-check on actual consumption (**measured**, regex over `astro-doc-code/src`):
1,335 `var(--…)` references; 110 distinct variables referenced; **65 of those are
theme-declared, 45 are not**. The 45 break down as: 20 dev-toolbar-private (`--dt-*`),
12 editor-private (`--ev-*`), 4 issue-sidebar-local (`--sidebar-glyph` etc.), a handful
of component-local (`--badge-color`, `--chip-color`, `--group-accent`), two Shiki output
tokens (`--shiki-dark`, `--shiki-dark-bg`), two dynamic-prefix false hits (`--status-`,
`--color-`), one vendored library token, and **one genuine dangler**:
`--color-text-tertiary`, referenced twice in `astro-doc-code/src/styles/markdown.css`
(lines 856 and 888) with hardcoded fallbacks `#888` and `#999`. That is exactly the
anti-pattern the project conventions warn about — the variable never resolves, the
fallback freezes the value, and the task-checkbox border does not change with dark mode.
48 `var(--x, fallback)` occurrences exist across 9 files (**measured**).

### 1.3 How the CSS reaches the page

Read `astro-doc-code/src/layouts/BaseLayout.astro`. There is exactly one injection
point, line 106:

```astro
<style id="theme-styles" set:html={themeCSS}></style>
```

`themeCSS` is the string returned by `getThemeCSS(themeRef)` — the fully merged
parent-then-child concatenation of every file named in the `files:` lists along the
`extends` chain. It is **inlined into the `<head>` of every single page**. There is no
linked theme stylesheet and no CSS custom-property injection from JS.

Lines 42–46 of the same file carry a deliberate design note: the framework
**intentionally does not** `import '@styles/index.css'` through Vite, because a Vite
import would put the default theme into the module graph permanently and emit it
*after* the `theme-styles` tag on every response, defeating child-theme overrides. This
is load-bearing and it is the single most important fact for the port: **the theme CSS
is not in the Vite module graph at all.**

Measured on the current production build (`astro-doc-code/dist/`, 1,251 HTML pages):

| Metric | Value |
|---|---:|
| HTML pages built | 1,251 pages |
| Total HTML bytes | 138,481,123 bytes |
| Inlined theme block, per page | 64,864 bytes (identical on every page: min = max) |
| Inlined theme block, summed across the site | 64,085,632 bytes |
| Share of the built site that is the same repeated CSS block | **46.3 %** |
| Separately bundled CSS (`dist/_astro/layout-registry.*.css`) | 62,644 bytes, 1 file |
| Separately bundled editor CSS (`dist/_astro/editor.*.css`) | ~14 KiB, 1 file |

Order in the emitted `<head>` (**measured** on `dist/index.html`): the theme `<style>`
block starts at char 1,060; the bundled `<link rel="stylesheet">` at char 66,444. So:

```
<head>
  …
  <style id="theme-styles">   ← merged theme chain (parent files, then child files)
  …
  <link rel="stylesheet" href="/_astro/layout-registry.*.css">   ← Astro/Vite bundle
</head>
```

**The bundle wins the cascade.** That bundle contains the Astro-scoped `<style>` blocks
*and* the three Vite-imported issues stylesheets, unscoped. Verified (**measured**):
`.issue-sidebar` appears 65 times in the bundle as a plain, unscoped class selector.
Meanwhile `default-docs/data/user-guide/25_themes/05_component-styles/07_issues-styles.md`
tells users "Themes can ship their own `issues.css` to restyle just this layout" — which
a theme *can* do (the file just gets concatenated), but the result loses at equal
specificity to the built-in layout CSS that loads afterwards. That is a live mismatch
between the documented capability and the delivery order.

### 1.4 Theme resolution — the exact algorithm

From `astro-doc-code/src/loaders/theme.ts` (**read**):

`resolveThemeName(name)` — lines 38–74, called once at config load from
`config.ts:206`:

1. absolute path → returned as-is.
2. strip a leading `@theme/`; a *different* `@` prefix → hand off to the generic
   `resolveAliasPath()` in `alias.ts`.
3. the literal name `default` (with or without the `@theme/` prefix) → `paths.styles`,
   i.e. `astro-doc-code/src/styles/`. **This short-circuit happens before any directory
   scan**, so a user theme folder literally named `default` is unreachable.
4. otherwise scan each directory in `getThemePaths()` (the resolved `theme_paths` from
   `site.yaml`) for a subdirectory of that name; first hit wins.
5. no hit → `throw`, naming the searched directories and pointing at `site.yaml`.

`@theme/` is **not** a real alias. It is not in `alias.ts`'s reserved map
(`@docs`, `@blog`, `@issues`, `@custom`, `@navbar`, `@footer`, `@root`) and it is not a
user path alias; it is a string prefix special-cased inside `theme.ts`. The plural
`@themes` *is* a normal user alias, produced from `site.yaml`'s `paths: themes:` entry.
`paths.ts:352-356` also has a reverse mapping — any absolute path under `/src/styles/`
is stringified back to `@theme/default/<file>` for error messages.

`loadThemeConfig(themeRef)` — lines 302–365:

1. mtime-validated cache lookup via `cache-manager` (`'theme'` bucket).
2. directory must exist → else `throw` (no silent fallback).
3. `theme.yaml` must exist and parse and carry `name` + `version` + `files` → else
   `throw`.
4. `loadThemeCSS()` reads every `.css` entry from `files:` in order, prefixes each with
   `/* --- <file> --- */`, concatenates, and records each file path as a cache
   dependency along with `theme.yaml`. A missing file is a `console.warn`, not an error.
5. **`validateTheme()` runs only under `import.meta.env.DEV`** (line 336). In a
   production build no theme validation happens at all.
6. cache with the file dependency list.

`getThemeCSS(themeRef)` — lines 384–426, the inheritance merge:

```
getThemeCSS(ref):
  if combinedCache[ref] → return it
  theme = loadThemeConfig(ref)
  mode  = theme.manifest.override_mode ?? "merge"
  css = ""
  if theme.manifest.extends:
      switch mode:
        "replace":  (nothing — parent chain skipped entirely)
        "override": css += getThemeCSSWithSkip(parent, {child's own filenames})
                    css += "/* --- Child Theme Overrides --- */"
        "merge":    css += getThemeCSS(parent)          ← full recursion
                    css += "/* --- Child Theme Overrides --- */"
  css += theme.css                                       ← this theme's own files
  combinedCache[ref] = css
  return css
```

So the merge unit is **the file list, concatenated as text** — not a variable map. There
is no CSS parsing anywhere in the engine; the "override" is pure cascade. The three
modes differ only in which parent files get concatenated:

| `override_mode` | Parent chain | Child files | Result |
|---|---|---|---|
| `merge` (default) | fully concatenated first | appended after | child wins by cascade on identical selectors |
| `override` | concatenated **minus** any file whose *basename* the child also ships | appended after | child's `element.css` fully replaces parent's `element.css`; parent's other files survive |
| `replace` | skipped entirely | the only CSS | child is standalone; must define all 53 contract variables itself |

`getThemeCSSWithSkip()` (lines 436–468) propagates the skip set up a multi-level chain
and merges skip sets when an intermediate theme is itself in `override` mode.

`validateTheme()` (lines 211–294) does three things: (a) every file in `files:` must
exist on disk; (b) for each of the 53 required variables, a naive
`new RegExp(variable + '\\s*:')` test against the concatenated CSS — no scoping, no
`:root` check, a match inside a comment counts; (c) a cycle walk over the `extends`
chain. Severity depends on mode: no parent or `replace` → error; `override` → warning;
`merge` → warning ("will inherit from parent").

`getAvailableThemes()` (lines 475–502) returns `'default'` if `src/styles/theme.yaml`
exists, then scans every `theme_paths` directory for subdirectories containing a
`theme.yaml`. `'default'` is seeded into the `seen` set first, so a user directory named
`default` is also invisible here.

### 1.5 Dark mode

Implementation is a **root attribute toggle**, `data-theme="dark"`, and nothing else.

- **Where the values live**: `astro-doc-code/src/styles/color.css` — `:root { … }` for
  light (lines 9–48), `[data-theme="dark"] { … }` for dark (lines 53–86). 20 of the 109
  variables get a dark value (**measured**); everything else inherits light.
- **The boot script**: `BaseLayout.astro` lines 109–123, an `is:inline` script in the
  `<head>`, *after* the theme `<style>` block. It reads `localStorage.theme`, falls back
  to `window.matchMedia('(prefers-color-scheme: dark)')`, and stamps
  `document.documentElement.setAttribute('data-theme','dark')` **only when dark** —
  light stamps nothing.
- **FOUC mitigation**: yes, and it is the standard one. The script is inline,
  synchronous, and in `<head>` before any body content, so the attribute is on `<html>`
  before first paint. Because the theme CSS is also inline in the same `<head>`, there
  is **no stylesheet round trip at all** — zero flash-of-unstyled-content on a cold
  cache. This is a property the current design gets for free from inlining, and the
  proposal's "serve raw CSS files" model gives it up.
- **No CSS anywhere reads `prefers-color-scheme`** (confirmed by grep). The media query
  exists only inside that one boot script. `astro-doc-code/src/scripts/artifacts.ts:41-49`
  documents this explicitly and relies on it: an absent attribute means the site is
  rendering light, so falling back to the OS preference in an embedded artifact would
  desync it from the chrome.
- **The user-facing toggle**: `astro-doc-code/src/layouts/navbar/default/index.astro`
  lines 126 + 215–223 (and the same pattern in `navbar/minimal/index.astro` lines 75,
  96–101). Flips the attribute and writes `localStorage.theme`. Icon swap is pure CSS
  (`navbar.css:203-209`). Logo swap too: `site.yaml`'s `logo.theme.dark` / `.light` emit
  two `<img>` tags and `navbar.css:54-55` shows/hides by attribute.
- **Propagation to embedded content**: three separate observers watch
  `attributeFilter: ['data-theme']` on `<html>` — `scripts/artifacts.ts:241-246` (pushes
  the attribute into same-origin artifact iframes), `scripts/drawio.ts:277-281`, and the
  dev-toolbar display-mode buttons. `pages/artifacts/[...path].ts:99-103` ships its own
  minified copy of the boot script into every full-page artifact.
- **`supports_dark_mode` in `theme.yaml` is inert.** Grep finds it only in
  `theme-types.ts` (type), `api/dev/themes.ts:46` (echoed to the toolbar), and
  `layout-selector/index.ts:33` (typed, then never read). Nothing branches on it.

### 1.6 What a user can do today

| # | Capability | How it is delivered | Rebuild needed? |
|---|---|---|---|
| 1 | Override one variable | drop a `color.css` into a theme folder, list it in `files:`, `extends: "@theme/default"` — concatenated after the parent, wins by cascade | no; dev reload only |
| 2 | Add a whole CSS file | any `.css` name listed in `files:` (e.g. a theme-supplied `issues.css`) | no |
| 3 | Ship a whole theme folder | `default-docs/themes/<name>/` with `theme.yaml` + CSS; discovered by scanning `theme_paths` | no |
| 4 | Point `theme_paths` anywhere | `site.yaml` `theme_paths:` accepts `@alias`, absolute, or config-relative paths (`config.ts:189-199`) | no |
| 5 | Replace the base theme wholesale | `override_mode: "replace"` + `extends: null` | no |
| 6 | Replace one parent file, keep the rest | `override_mode: "override"` | no |
| 7 | Multi-level inheritance | `extends` chains recursively, skip sets propagate | no |
| 8 | Switch active theme | edit `site.yaml` `theme:`; `cache-manager` classifies `site.yaml` as a config change and also drops the theme cache (`cache-manager.ts:366-373`) | no, dev page reload |
| 9 | Switch theme *without editing config* | **dev only** — dev-toolbar sets a `dev-color-theme` cookie, `BaseLayout.astro:29-40` reads it when `import.meta.env.DEV` | no |
| 10 | Toggle light/dark | navbar button or dev toolbar; `localStorage` + root attribute | no, no reload |
| 11 | Ship layouts alongside a theme | separate mechanism — `LAYOUT_EXT_DIR` in `.env` → the `@ext-layouts` Vite alias → `import.meta.glob()` in `pages/lib/layout-registry.ts` | **yes — `import.meta.glob` is build-time** |
| 12 | Hot-reload CSS | `dev-tools/integration.ts:284-317` → `cacheManager.onFileChange()` → `server.ws.send({type:'full-reload'})` | **full page reload, never CSS-only HMR** |
| 13 | Read resolved token values | `agent-ks theme tokens [name] [--json]` — the only CLI theme verb | no |

On #12, precisely: `handleHotUpdate` returns `[]` to *suppress* Vite's own HMR and
issues a full reload instead. There is no `import.meta.hot.accept` for CSS anywhere.
Editing `color.css` reloads the whole page.

On #9 and the production story: in a production build `isDev` is false, so the cookie
override is dead code, and `api/dev/themes.ts:14-19` returns HTTP 403. Production output
is `output: 'static'` (`astro.config.mjs`), so the active theme is frozen at build time.

### 1.7 The dev-time theme switcher

`astro-doc-code/src/dev-tools/layout-selector/index.ts`, 739 lines, registered in
`dev-tools/integration.ts:325-330` via `addDevToolbarApp({ entrypoint: … })`.

How it works (**read**):

1. Astro calls `init(canvas: ShadowRoot, app, server)`. `canvas` is a shadow root owned
   by Astro's dev toolbar; the app appends a `<style>` and an
   `<astro-dev-toolbar-window>` custom element into it.
2. `fetch('/api/dev/themes')` and `fetch('/api/dev/layouts')` in parallel via
   `Promise.allSettled`. The themes endpoint returns
   `{ current: {ref, name}, themes: [{name, ref, displayName, description, version, extends, supportsDarkMode, error}] }`.
3. Clicking a theme sets `document.cookie = 'dev-color-theme=<name>; expires=+7d; path=/'`,
   stashes `sessionStorage['dev-toolbar-keep-open']`, and calls
   `window.location.reload()`.
4. The next request hits `BaseLayout.astro:29-40`, which reads the cookie via
   `Astro.cookies.get()`, runs it through `resolveThemeName()`, and injects that theme's
   merged CSS. `'__reset__'` is the sentinel meaning "ignore me, use `site.yaml`".
5. Display mode (light / dark / system) is separate: it writes `localStorage.theme` and
   sets the root attribute **client-side with no reload**.

**It writes no files.** It writes a cookie and reloads. **It does not need Vite HMR** —
the reload is a plain `window.location.reload()`, and the theme CSS it picks up was
never in Vite's graph. What it *does* need is Astro's dev-toolbar host: the
`addDevToolbarApp` hook, the `ShadowRoot` canvas, `app.toggleState()`, and the
`<astro-dev-toolbar-window>` custom element. Those four are Astro-only.

---

## 2. What it depends on

| Dependency | Where | Classification | Note |
|---|---|---|---|
| `js-yaml` | `theme.ts:11`, `config.ts` | **portable** | plain YAML parse; `gopkg.in/yaml.v3` is a direct swap |
| `node:fs`, `node:path` | `theme.ts:9-10` | **Node-only, trivially portable** | `os` / `path/filepath` |
| `import.meta.env.DEV` | `theme.ts:336`, `api/dev/themes.ts:14` | **Vite-only** | a build-time constant; becomes a Go bool / build tag |
| `Astro.cookies.get()` | `BaseLayout.astro:30` | **Astro-only** | `http.Request.Cookie()` is equivalent and simpler |
| `set:html={themeCSS}` | `BaseLayout.astro:106` | **Astro-only** | `html/template` + `template.CSS` is equivalent |
| Astro scoped `<style>` (`data-astro-cid-*`) | 13 `.astro` files, 1,364 lines | **Astro-only — no equivalent** | 260 scoped selectors across 12 component hashes in the built bundle (**measured**) |
| `:global()` escape hatch | 21 occurrences in 2 files | **Astro-only** | becomes a no-op once scoping is gone |
| Vite CSS import (`import './styles/detail.css'`) | 7 sites (issues layout ×4, editor ×3) | **Vite-only** | becomes a plain file list |
| `import.meta.glob('@ext-layouts/…')` | `layout-registry.ts`, `api/dev/layouts.ts` | **Vite-only** | build-time glob → static import map; a Go runtime directory scan is *more* capable, not less |
| `@ext-layouts` resolve alias | `astro.config.mjs` vite.resolve.alias | **Vite-only** | plain path config in Go |
| Vite CSS bundling / minify / content-hash | production build | **Vite-only** | retained if the proposal keeps Vite for the frontend bundle |
| `addDevToolbarApp`, `ShadowRoot` canvas, `<astro-dev-toolbar-window>`, `app.toggleState()` | `integration.ts:325`, `layout-selector/index.ts:46` | **Astro-only — no equivalent** | the toolbar host is Astro's, not ours |
| `server.ws.send({type:'full-reload'})` | `integration.ts:264, 279, 313` | **Vite-only** | SSE or a WebSocket in Go, straight swap |
| Vite `server.watcher` (chokidar) | `integration.ts:168-171` | **Vite-only** | `fsnotify` |
| Shiki (`shikiConfig.theme: 'github-dark'`) | `astro.config.mjs` | **Astro/Node-only** | emits `--shiki-dark` / `--shiki-dark-bg` custom properties consumed by `markdown.css:62-68` |
| `localStorage`, `matchMedia`, `document.cookie`, `MutationObserver` | boot script, navbar, `artifacts.ts`, `drawio.ts` | **browser-side — survives any server** | the entire dark-mode mechanism |
| `bun` (for the CLI verb) | `plugins/agent-ks/bin/agent-ks` | **Node-family, replaceable** | `agent-ks theme tokens` reimplements the merge in 298 lines of JS |

**No CSS preprocessor.** `astro-doc-code/package.json` (**read**) contains no PostCSS,
no Tailwind, no Sass, no autoprefixer, and there is no `postcss.config.*` or
`tailwind.config.*` in `astro-doc-code/`. Every stylesheet is hand-written plain CSS.
That removes an entire class of migration risk.

---

## 3. What a Go rewrite costs

| Capability | Go equivalent | Verdict |
|---|---|---|
| Parse `theme.yaml` | `gopkg.in/yaml.v3` | straight port |
| `resolveThemeName` / `resolveThemeAlias` | `path/filepath` + `os.Stat` | straight port |
| `files:` concatenation with per-file markers | `strings.Builder` | straight port, simpler |
| `extends` chain + the 3 `override_mode` semantics | recursion + a `map[string]bool` skip set | straight port; ~120 lines Go |
| Cycle detection | add a visited set to the recursion — **the port is an opportunity to fix this** (see §4) | straight port |
| `required_variables` validation | regex is enough to match today; `github.com/tdewolff/parse/v2/css` or `github.com/gorilla/css` if a real parser is wanted | straight port, easy upgrade |
| mtime-keyed theme cache + dependency invalidation | `os.Stat` mtimes + `sync.RWMutex` map | straight port, and simpler — one process, no SSR module isolation |
| Inject merged CSS into `<head>` | `html/template` with `template.CSS` (bypasses escaping) | straight port |
| Serve theme CSS as files instead | `http.ServeContent` + `ETag` from mtime | **redesign** — see §4, this is a behaviour change, not a port |
| Dark-mode boot script | unchanged inline `<script>` in the template | zero work |
| Dark-mode toggle, `localStorage`, `matchMedia`, MutationObservers | unchanged client TS | zero work |
| Dev cookie theme override | `r.Cookie("dev-color-theme")` | straight port, simpler than `Astro.cookies` |
| `/api/dev/themes` | `encoding/json` handler | straight port |
| Theme discovery (`getAvailableThemes`) | `os.ReadDir` | straight port |
| File watching → reload signal | `github.com/fsnotify/fsnotify` + SSE | straight port |
| `agent-ks theme tokens` | becomes a binary subcommand; the 298-line JS reimplementation of the merge **disappears** because the binary already owns the real merge | net simplification |
| Astro-scoped component `<style>` (1,364 lines) | **no equivalent** — extract to plain `.css`, hand-manage class namespacing | **redesign**, silent-regression risk |
| `:global()` escapes (21) | delete them | trivial once de-scoped |
| Vite CSS bundling / hashing for the framework's own CSS | keep Vite for the island bundle (the proposal already does) | preserved |
| Dev-toolbar theme picker | **no equivalent host** — rebuild as an in-page dev panel (a Vite island) | **redesign**, ~1–2 days |
| Shiki dark-mode CSS hooks | Chroma (`github.com/alecthomas/chroma/v2`) emits different classes/inline styles; `markdown.css:62-68` must be rewritten | **redesign** (small, but it *is* CSS work owned by this surface) |
| `import.meta.glob` for theme-shipped layouts | runtime `filepath.WalkDir` over the overlay dir | **better than today** — no rebuild needed to add a layout |

---

## 4. What is lost or degraded

| # | Item | Severity | Why | Mitigation |
|---|---|---|---|---|
| 1 | Astro-compiler style scoping in 13 components (1,364 lines) | **major** | `data-astro-cid-*` is generated by Astro's compiler. Removing it turns 260 scoped selectors into global ones. Collisions are silent and visual — nothing errors, a rule just starts applying somewhere it did not. | Extract each block to a `.css` file, adopt a strict BEM-ish prefix per component, and diff rendered pages before/after. Budget real time; this is the riskiest item on the surface. |
| 2 | Astro dev-toolbar host for the theme picker | **minor** | `addDevToolbarApp` + `ShadowRoot` + `<astro-dev-toolbar-window>` are Astro's. The *capability* (pick a theme without editing `site.yaml`) is a cookie and a reload and survives trivially; the toolbar chrome, the 3-dot overflow grouping, and coexistence with Astro's own audit/a11y apps do not. | Rebuild as a floating in-page dev panel served only in dev mode. ~200 of the 739 lines are the theme + display-mode sections. |
| 3 | Zero-round-trip, zero-FOUC CSS delivery | **major if the proposal's model is taken literally** | Today the merged CSS is inline in `<head>`, so there is no stylesheet fetch and no unstyled flash even on a cold cache. `notes/architecture/05_runtime-config-surface.md` proposes `/themes/<name>/<file>.css` served raw with ETags — that is N render-blocking requests on first paint, and the dark-mode attribute script would run before the styles land. | Keep inlining (identical behaviour, and Go can do it faster than Astro), or inline only the `:root`/`[data-theme]` variable blocks and link the rest. Either way, decide it deliberately — the notes do not name this trade. |
| 4 | Shiki's dual-theme output contract | **minor** | `markdown.css:62-68` targets `.shiki` spans and the `--shiki-dark` / `--shiki-dark-bg` custom properties Shiki emits. Chroma emits neither. | Rewrite those rules against Chroma's class names. ~10 lines of CSS; the pipeline change itself belongs to the markdown surface. |
| 5 | Theme validation in production | **none — already absent** | `theme.ts:336` gates `validateTheme()` on `import.meta.env.DEV`. A production build never validates. | The Go port should validate unconditionally at startup; this is a free improvement, not a loss. |
| 6 | Cycle safety in `getThemeCSS` | **none — already broken** | `validateTheme` detects `A → B → A` but only *records* a doc error under DEV; it does not throw. `getThemeCSS` (line 384) writes its cache entry *after* the recursive call, so a real cycle recurses until stack overflow. The user guide claims "The loader detects this and errors at startup" — it does not. Confidence: **read**, not reproduced. | The Go port gets a visited set for free. Fix in either stack. |
| 7 | `override_mode: "override"` / `"replace"` | **none** | Both shipped themes use `merge`; `full-width/theme.yaml` has the `override` line commented out. Nothing exercises the other two paths, so their port is untested-by-construction on both sides. | Write the fixture themes the current repo lacks, before or during the port. |
| 8 | Theme-supplied `issues.css` actually winning | **none — already broken** | The bundled layout CSS loads *after* the inline theme block (**measured**: `<style>` at char 1,060, `<link>` at 66,444), and `.issue-sidebar` is unscoped in that bundle (65 occurrences). A theme's `issues.css` loses at equal specificity, contradicting `default-docs/data/user-guide/25_themes/05_component-styles/07_issues-styles.md`. | The port is the natural fix: put *all* layout CSS in the theme chain so the documented override order is real. |
| 9 | `--color-text-tertiary` | **none — already broken** | Referenced twice in `markdown.css` with frozen hex fallbacks; not in the contract, not declared by any theme. Task-checkbox borders do not respond to dark mode. | Add it to `required_variables` and both `:root` blocks, or replace with `--color-text-muted`. |
| 10 | The 45 non-contract variables layouts depend on | **minor** | Only 53 of the 109 declared properties are contractual. A `replace`-mode theme can pass validation and still leave `--sidebar-width`, `--navbar-height`, `--z-index-*` undefined. | Same defect in either stack; the port is a chance to widen the contract or split it into "required" and "expected". |

**Not lost, and worth stating plainly, because the honest read of this surface is mostly
good news:** the entire dark-mode mechanism, the whole `theme.yaml` schema, the
inheritance semantics, `theme_paths` discovery, the `@theme/` prefix, the 53-variable
contract, the `--status-*` tokens, cookie-based theme switching, the `agent-ks theme
tokens` verb, and every line of the 2,594-line default theme CSS port with **no
redesign**. `theme.ts` imports exactly three things from outside the project — `fs`,
`path`, `js-yaml` — and touches no Astro API whatsoever.

---

## 5. Claims in the architecture notes, checked against the code

| # | Claim | Where | Verdict | Evidence |
|---|---|---|---|---|
| 1 | "Theme contract (`required_variables` in `theme.yaml`)" is under "What stays unchanged" | `../../../notes/architecture/01_overview.md` | **holds** | 53 variables in a YAML file, validated by regex over concatenated text. Nothing Astro-shaped. |
| 2 | "Themes live in `default-docs/themes/<name>/`; `theme.yaml` declares variables + extends chain" — behaviour "identical" | `../../../notes/architecture/05_runtime-config-surface.md` | **holds** | Matches `theme.ts` + `site.yaml` `theme_paths: ["@themes"]`. |
| 3 | "CSS files are served raw to the browser … No bundling. Browser gets the raw file." presented as identical behaviour | `../../../notes/architecture/05_runtime-config-surface.md` | **false as "identical"** | Today the merged CSS is **inlined** into every page: 64,864 bytes per page, 1,251 pages, 46.3 % of the built site (**measured**). Serving raw files is a different delivery model with different FOUC and round-trip characteristics. It may well be the right choice; it is not "identical". |
| 4 | "Theme CSS hot-reload: 200–500 ms (Vite re-bundle)" | `../../../notes/architecture/01_overview.md`, `06_performance-comparison.md` | **false (mechanism)** | `BaseLayout.astro:42-46` documents that theme CSS is deliberately kept **out** of the Vite module graph, and grep confirms nothing imports `@styles/*` or `src/styles/*.css`. What actually happens on a `color.css` save: `handleHotUpdate` → `cacheManager.onFileChange` → clear theme + combined-CSS caches → `server.ws.send({type:'full-reload'})` → full page reload. No re-bundle. The *latency* claim may still be roughly right; the reason given for it is wrong. |
| 5 | "Switch theme: 1–2 s (Vite re-bundles)" | `../../../notes/architecture/06_performance-comparison.md` | **false (mechanism)** | Same reason. A theme switch is a cookie write plus `window.location.reload()`; the server re-reads ≤11 CSS files (mtime-cached) and re-renders. |
| 6 | "Every CSS save makes the page flash white for half a second while Vite re-bundles" | `../../../notes/architecture/06_performance-comparison.md` | **partly-holds** | The white flash is real — but it is caused by the deliberate `full-reload`, not by bundling. This matters: the Go design must still decide what a CSS change triggers, and "serve the file raw" alone does not buy a flash-free swap; the client needs to hot-swap the `<link>`. |
| 7 | "Built-in default theme … gets embedded into the binary via `embed.FS`. **User themes always win when present**" | `../../../notes/architecture/05_runtime-config-surface.md` | **partly-holds** | Embedding is fine. But there is no "user wins" overlay today: `theme:` names exactly one theme and `extends:` pulls the parent in explicitly. Worse, `resolveThemeName` short-circuits `default` to the built-in **before** scanning, and `getAvailableThemes` seeds `'default'` into `seen` first — so a user theme directory named `default` is unreachable and invisible. Either preserve that or state the new rule. |
| 8 | Astro static prod "loses everything dynamic (editor, tracker live updates, **theme switching**)" | `../../../notes/architecture/06_performance-comparison.md` | **holds** | `BaseLayout.astro:29` gates the cookie override on `import.meta.env.DEV`; `api/dev/themes.ts:14-19` returns 403 in PROD; `astro.config.mjs` sets `output: 'static'` for production. |
| 9 | "`themes/<name>/*.css` editable at runtime — Same; faster than today (no bundling)" | `../../../notes/architecture/05_runtime-config-surface.md` | **partly-holds** | "Editable at runtime" holds. "No bundling" is already true today for theme CSS — the speedup, if any, comes from dropping the full-page reload, not from dropping a bundler that was never in this path. |
| 10 | "A **theme** swap is *always* free (pure skin)" | `../../../notes/architecture-update/01_the-structure.md` | **partly-holds today** | True for variables. Not true for layout-owned CSS: the issues layout's 1,175 lines load after the theme block and are unscoped, so a theme cannot restyle them at equal specificity (**measured**). The separation model would make this true; today it is not. |
| 11 | "Vite plugin ecosystem (PostCSS, Tailwind if we want it) preserved" | `../../../notes/architecture/03_vite-frontend-and-dist.md` | **holds, and is moot for this surface** | `package.json` has no PostCSS/Tailwind/Sass and there is no config file for any of them. All CSS is hand-written plain CSS. |
| 12 | Go `internal/theme/` split into `loader.go` / `inheritance.go` / `contract.go` | `../../../notes/architecture/02_go-runtime.md` | **holds** as a shape | Maps cleanly onto `loadThemeConfig` / `getThemeCSS`+`getThemeCSSWithSkip` / `validateTheme`. 513 TS lines → roughly 600–800 Go lines. |

---

## 6. Port cost

**Measured current size of the surface: 8,141 lines**, composed as:

| Component | Lines |
|---|---:|
| `loaders/theme.ts` + `loaders/theme-types.ts` | 614 |
| `pages/api/dev/themes.ts` | 79 |
| `styles/theme.yaml` | 89 |
| `styles/*.css` | 2,646 |
| `layouts/issues/default/styles/*.css` | 1,175 |
| `dev-tools/editor/styles/*.css` | 861 |
| CSS in `.astro` `<style>` blocks | 1,364 |
| CSS in `.ts` template literals | 790 |
| `default-docs/themes/**` (2 user themes) | 225 |
| `plugins/…/scripts/theme/tokens.mjs` | 298 |

Excluded from that figure and charged to other surfaces: `BaseLayout.astro` and
`config.ts` (theming is ~90 lines across the two), and the non-theme 539 lines of
`layout-selector/index.ts`.

**Estimate: 2–3 weeks solo**, split roughly:

| Work | Estimate | Confidence |
|---|---|---|
| Theme loader, inheritance, 3 override modes, contract validation, discovery, mtime cache, `/api/dev/themes`, cookie override, CSS injection — all in Go | 5–8 days | **read** — the TS is 693 lines with three external imports and no Astro API |
| De-scoping 1,364 lines of `.astro` `<style>` into plain CSS with collision-safe naming, plus visual verification across the page types | 3–5 days | **assumed** — mechanical work with silent-failure risk; 260 scoped selectors across 12 components (**measured**) is the size, not the difficulty |
| Rebuilding the theme + display-mode picker outside Astro's dev toolbar | 1–2 days | **read** |
| Rewriting the Shiki-specific CSS against Chroma, fixing `--color-text-tertiary`, and adding the missing fixture themes for `override` / `replace` | 1–2 days | **read** |

The 2,594 lines of default-theme CSS and the 204 lines of user-theme CSS move as files
and cost approximately nothing.

---

## 7. Open questions for whoever decides

1. **Inline or link?** The notes assume linked raw files. Today's inline block is
   64,864 bytes per page and 46.3 % of the built site (**measured**) — linking is a
   large win on bytes and a loss on first-paint round trips and FOUC guarantees. Which
   one is the target behaviour?
2. **Does a CSS edit still full-reload the page?** "Serve the file raw" does not by
   itself give a flash-free swap; the dev client has to hot-swap the `<link>`. Is that
   in scope, and if so does it also work for the inline-block model?
3. **Does layout CSS join the theme chain?** Making a theme's `issues.css` actually win
   (today it does not) is the difference between the documented capability and the real
   one — and the separation model in
   `../../../notes/architecture-update/01_the-structure.md` implies it should.
4. **Does `override_mode` survive at all?** Nothing in the repo exercises `override` or
   `replace`. Porting two untested code paths, or dropping them, is a decision worth
   taking explicitly rather than by omission.
5. **Is `--status-<name>` still constructed dynamically?** `issue-status.ts:70` builds
   the property name from the status string. A Go template doing the same is fine, but
   it means the seven names stay a hard coupling between the status vocabulary and every
   theme's `color.css`.
6. **Does the contract widen?** 53 required, 109 declared, 65 actually consumed by
   layouts (**measured**). A `replace`-mode theme can pass validation and still break
   the site.
