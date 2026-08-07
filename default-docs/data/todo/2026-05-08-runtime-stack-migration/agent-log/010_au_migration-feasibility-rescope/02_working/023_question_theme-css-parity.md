---
title: "Does theme and CSS customization survive the migration?"
---

# Deep question 3 — does CSS and theme customization survive?

**Yes, and for the customization the user actually does — writing CSS, overriding
variables, shipping a theme folder, switching themes, dark mode — it survives intact
and in two places gets better.** Nothing in the theme system is built out of Astro:
`theme.ts` imports `fs`, `path` and `js-yaml` and touches exactly one framework API
(`import.meta.env.DEV`, one line), CSS custom properties are a browser feature, and
dark mode is a root attribute plus `localStorage`. What genuinely has no Go equivalent
is *Astro's automatic scoping of `<style>` blocks inside components* — and that is
framework-internal CSS, 1,341 lines of it, not anything a user writes.

Two things change that a user would notice, and both are decisions rather than losses:
the dev theme picker has to be rebuilt outside Astro's toolbar, and a user-shipped
**layout** stops being a compiled component and becomes a runtime-parsed template.

Confidence is labelled per claim: **measured** = a command was run in this session,
**read** = the code was opened, **assumed** = inference.

---

## 1. Verifying surface 3

I re-ran the load-bearing measurements in `./013_surface_theming-and-css.md` rather
than trusting them. Every number I checked reproduced.

Re-measured facts, all **measured** this session:

| Claim in surface 3 | My measurement | Agrees? |
|---|---|---|
| 53 `required_variables` in `src/styles/theme.yaml` | 53 (colors 21 / fonts 19 / elements 13) | yes |
| 109 custom properties declared by the default theme | 109 distinct `--x:` declarations across the 10 `files:` entries | yes |
| Theme CSS inlined per page, 64,864 bytes | 64,938 bytes, byte-identical on all 988 real content pages | yes (±74 B, build drift) |
| 46.3 % of the built site is that repeated block | 64,158,744 of 138,746,168 HTML bytes = **46.2 %** | yes |
| Theme `<style>` at char 1,060, bundle `<link>` at char 66,444 | identical, on `dist/index.html` | yes |
| `.issue-sidebar` unscoped 65× in the layout bundle | 65 | yes |
| 260 scoped selectors across 12 component hashes in the bundle | 260 `data-astro-cid-*` occurrences, 12 distinct hashes | yes |
| 1,364 lines of CSS in `.astro` `<style>` blocks | **1,341 non-blank lines across 14 files**, of which 14 lines in `src/pages/editor.astro` are `is:global` → **1,327 genuinely scoped, 13 files** | yes, modulo blank-line counting |
| 21 `:global()` escapes | 21 (FilterBar 6, IssuesCards 15) | yes |
| `theme.ts` has no Astro API | one hit: `import.meta.env?.DEV` at line 336 | yes |
| `validateTheme()` DEV-gated; production never validates | `theme.ts:336` | yes |
| `getThemeCSS` caches *after* recursing → a cycle blows the stack | `theme.ts:384-425`, `cssCache.set` at line 422, recursion at 413 | yes (**read**) |
| `--color-text-tertiary` dangles with frozen `#888`/`#999` | `markdown.css:856,888`, declared nowhere | yes |
| `statusVar()` builds `var(--status-<name>)` at render time | `issue-status.ts:70` | yes |

**Where I found something surface 3 missed, and it matters for the hot-reload
question.** Surface 3 describes CSS hot reload as one behaviour — full page reload. It
is actually **two**, because `shouldTriggerReload()` (`dev-tools/integration.ts:122-126`)
only fires for files under `watchPaths`, and `watchPaths` is content dirs + the config
dir + `paths.styles` (`src/styles`) + `theme_paths`. It does **not** include
`src/layouts/`. So:

- **Theme CSS** (`src/styles/*.css`, `default-docs/themes/**`) → `handleHotUpdate`
  returns `[]`, Vite's HMR is suppressed, `server.ws.send({type:'full-reload'})`.
- **Layout CSS** (`src/layouts/issues/default/styles/*.css`, and every scoped `<style>`
  block) → `shouldTriggerReload` is false, `handleHotUpdate` returns early, **Vite's
  native CSS HMR runs**.

I verified the second half against the running dev server on port 3088 (**measured**,
read-only `curl`). `GET /src/layouts/issues/default/styles/index.css` returns a JS
module beginning:

```
import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext("/src/layouts/issues/default/styles/index.css");
import { updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle } from "/@vite/client"
```

and the same for `ViewToggle.astro?astro&type=style&index=0&lang.css`, whose body
starts `.issues-view-toggle[data-astro-cid-f4qesu36]{display:inl…`.

So today HMR exists for the CSS a *framework developer* edits and not for the CSS a
*user* edits. That is the wrong way round, and §6 shows the Go design can invert it.

---

## 2. Where the machinery comes from

This is the whole answer, so it is worth being exact. The CSS story has five distinct
providers, and only two of them are Astro.

```
   USER WRITES                     WHO CARRIES IT                        SURVIVES Go?
   ───────────                     ──────────────                        ────────────
   --color-brand-primary: #x   ─▶  the BROWSER (CSS custom properties)   yes, untouched
   theme.yaml { files: [...] } ─▶  js-yaml + fs + string concat          yes, gopkg.in/yaml.v3
   extends: "@theme/default"   ─▶  theme.ts recursion (200 lines)        yes, straight port
   theme: "full-width"         ─▶  config.ts + resolveThemeName          yes, straight port
   <style> in a .astro file    ─▶  ASTRO COMPILER (data-astro-cid)       NO — §4
   import './detail.css'       ─▶  VITE (bundle, hash, HMR)              only if Vite keeps it
   dark-mode toggle            ─▶  the BROWSER (localStorage, attribute) yes, untouched
   dev theme picker            ─▶  ASTRO dev toolbar host                NO — rebuild, ~1-2 days
   full-reload on CSS save     ─▶  VITE ws channel                       yes, SSE
```

Three facts that make the picture less alarming than "we are dropping a framework"
suggests:

1. **The theme CSS is deliberately outside Vite already.** `BaseLayout.astro:42-46`
   carries the reason in a comment: a Vite import would pin the default theme into the
   module graph and emit it *after* the `theme-styles` tag, defeating child overrides.
   Grep confirms nothing imports `@styles/*` anywhere (**measured**). So Vite's CSS
   bundling contributes **zero** to the user-facing theme path. Anything the notes
   claim about removing Vite bundling from theme CSS is removing something that is not
   there.

2. **There is no preprocessor.** `astro-doc-code/package.json` has no PostCSS,
   Tailwind, Sass or autoprefixer, and no config file for any of them exists
   (**measured** — surface 3, re-confirmed). Every stylesheet is hand-written plain
   CSS. That deletes an entire class of migration risk.

3. **Serving a `.css` file is not a framework capability.** `http.ServeContent` plus an
   mtime ETag is four lines of Go. Concatenating ten files is 0.090 ms
   (**measured**: 200 iterations over the real 10-file default theme, 62,218 bytes
   output, mean 0.090 ms in Python; Go will be at or below that).

---

## 3. The parity table

One row per user-facing customization capability that exists today. "Machinery owner"
is who supplies the mechanism, not who happens to run it.

| # | Capability today | How it works today | Machinery owner | Under Go + Vite | Verdict |
|---|---|---|---|---|---|
| 1 | Override one theme variable | drop `color.css` in a theme folder, list it in `files:`, `extends: "@theme/default"`; concatenated after the parent, wins by cascade | browser (custom properties) + `fs` concat | identical — Go reads the same files in the same order | **same** |
| 2 | Add a whole CSS file to a theme | any `.css` name listed in `theme.yaml → files:` | `fs` + `theme.yaml` | identical | **same** |
| 3 | Ship a whole theme folder | `default-docs/themes/<name>/` with `theme.yaml`; discovered by scanning `theme_paths` | `fs.readdirSync` | `os.ReadDir` — identical | **same** |
| 4 | Point `theme_paths` anywhere | `site.yaml theme_paths:` accepts `@alias`, absolute, or config-relative (`config.ts:189-199`) | alias resolver, pure string logic | identical | **same** |
| 5 | Extend a theme (`extends` chain, multi-level) | recursion in `getThemeCSS`, skip-set propagation for `override` mode | 200 lines of `theme.ts` | ~120 lines of Go recursion + a `map[string]bool` | **same**, plus the cycle bug fixed for free |
| 6 | `override_mode: override` / `replace` | replace = skip parent; override = skip parent files the child also ships, by basename | `theme.ts:395-417` | straight port | **same** — but see §7, neither mode is exercised by anything in the repo |
| 7 | Swap the active theme in `site.yaml` | edit `theme:`; `cache-manager` classifies `site.yaml` as a config change and drops the theme cache too | config loader | identical | **same** |
| 8 | Restyle a status colour | theme's `color.css` sets `--status-review: …`; `statusVar()` builds `var(--status-<name>)` at render time | browser + `issue-status.ts:70` | identical — a Go template emits the same string | **same** |
| 9 | Dark mode | `data-theme="dark"` on `<html>`; values in `color.css` `:root` + `[data-theme="dark"]`; inline head script reads `localStorage` then `matchMedia` | 100 % browser | byte-identical script in a Go template | **same** |
| 10 | Dark-mode propagation into artifacts / draw.io | three `MutationObserver`s on `attributeFilter:['data-theme']`; artifacts route injects a minified copy of the boot script | browser + one route | same route logic in Go; observers unchanged | **same** |
| 11 | Zero-FOUC first paint | merged CSS is **inlined** in `<head>` before the boot script — no stylesheet round trip at all | Astro `set:html` (trivial) | `html/template` + `template.CSS` — trivially preserved, **but the notes propose linking instead** | **same if inlining is kept; worse if the notes' raw-file model is taken literally** — §7 |
| 12 | Per-structure theme (a different theme for `/todo` than `/user-guide`) | **does not exist.** `theme:` is one global key (`config.ts:51`, `site.yaml:35`) | — | does not exist either | **same (absent both sides)** |
| 13 | Live theme switching in dev, without editing config | dev-toolbar writes `dev-color-theme` cookie → `window.location.reload()` → `BaseLayout.astro:29-40` reads it via `Astro.cookies` under `import.meta.env.DEV` | **Astro dev-toolbar host** for the UI; a cookie + reload for the mechanism | mechanism ports trivially (`r.Cookie`); UI must be rebuilt as an in-page dev panel, ~200 of the 739 lines in `layout-selector/index.ts` are the theme + display-mode sections | **worse in the short term** (chrome rebuilt, 1–2 days), **better in the long term** — it also works in `serve` mode, which the static prod build cannot do at all |
| 14 | Scoped component styles inside a layout | Astro compiler stamps `data-astro-cid-<hash>` on elements and selectors | **Astro compiler — no equivalent anywhere** | plain `.css` files + BEM discipline + a lint rule | **lost as a mechanism; §4 shows the practical risk is small and measured** |
| 15 | `:global()` escape for runtime-created nodes | 21 uses, needed because `innerHTML` nodes never get the cid attribute | consequence of #14 | the rule and all 21 wrappers **delete** | **better** — a whole class of bug disappears |
| 16 | Theme CSS hot reload | full page reload (`server.ws.send({type:'full-reload'})`) | Vite ws channel | fsnotify + SSE; can hot-swap `#theme-styles.textContent` with no reload | **better** — §6 |
| 17 | Layout CSS hot reload | real Vite CSS HMR, no page reload (**measured**) | **Vite** | depends: keep layout CSS in the Vite bundle → same; move it into the theme chain → replaced by the SSE swap | **same or better**, see §6 |
| 18 | Ship a layout alongside a theme | `LAYOUT_EXT_DIR` → `@ext-layouts` → `import.meta.glob()`; **needs the Node toolchain and a dev-server restart or rebuild** | **Vite** (build-time glob) | `filepath.WalkDir` at boot + runtime-parsed `html/template`; no toolchain | **better on reach, worse on power** — §5 |
| 19 | A theme restyling the issues layout (`issues.css`) | documented in the user guide; **does not actually work** — the layout bundle loads at char 66,444, after the theme block at 1,060, and `.issue-sidebar` is unscoped there (**measured**) | Vite bundle ordering | fixable by putting layout CSS into the theme chain | **better**, if the fix is taken |
| 20 | Read resolved token values | `agent-ks theme tokens [name] [--json]` — a 298-line JS reimplementation of the merge | plugin CLI | the binary already owns the real merge; the reimplementation deletes | **better** |
| 21 | Theme validation in production | **none** — `validateTheme()` is gated on `import.meta.env.DEV` (`theme.ts:336`) | — | validate unconditionally at startup | **better** |

Scoring the 21 rows: **13 same, 6 better, 1 lost-as-a-mechanism (#14, framework-internal),
1 conditional-worse (#13 dev picker chrome; #11 only if the linking model is adopted
carelessly).** No row that a content author or theme author touches ends up worse.

---

## 4. The hard case — scoped CSS

### What is actually there

**Measured** by parsing every `<style>` block out of all 53 `.astro` files:

| Component | Scoped lines | `:global()` uses |
|---|---:|---:|
| `layouts/issues/default/parts/index/FilterBar.astro` | 371 | 6 |
| `layouts/issues/default/parts/index/GuideModal.astro` | 199 | 0 |
| `layouts/issues/default/parts/index/IssuesTable.astro` | 167 | 0 |
| `layouts/issues/default/parts/index/IssuesCards.astro` | 101 | 15 |
| `layouts/custom/countdown/Layout.astro` | 86 | 0 |
| `layouts/custom/home/Hero.astro` | 81 | 0 |
| `layouts/issues/default/parts/index/Pagination.astro` | 56 | 0 |
| `layouts/BaseLayout.astro` | 53 | 0 |
| `layouts/custom/home/Features.astro` | 49 | 0 |
| `layouts/custom/info/Content.astro` | 48 | 0 |
| `layouts/issues/default/parts/index/StateTabs.astro` | 46 | 0 |
| `layouts/issues/default/parts/index/PresetStrip.astro` | 44 | 0 |
| `layouts/issues/default/parts/index/ViewToggle.astro` | 26 | 0 |
| **Total scoped** | **1,327** | **21** |
| `pages/editor.astro` (`is:global`, already unscoped) | 14 | 0 |

Ten of the thirteen are in `issues/default`. That is 1,010 of the 1,327 lines —
**76 % of the entire de-scoping job sits in one layout folder.**

### Measuring the actual collision risk

The fear with de-scoping is silent visual regression: a rule that was confined to one
component starts applying elsewhere. I measured the three ways that can happen.

**Collision analysis, measured** over the 243 selector blocks in scoped style tags:

| Risk | Count | What it means |
|---|---:|---|
| Selectors anchored on a bare tag (`a {`, `table {`, `li {`) | **0** | zero blast radius from tag selectors — this is the failure mode that would be catastrophic, and it is absent |
| Distinct class names used inside scoped blocks | 168 | the namespace to protect |
| Class names appearing in **two or more** scoped components | **2** | `.is-active` (5 components) and `.issues-view` (2 components) |
| Class names colliding with a **global** `.css` file under `src/` | **6** | `.is-active`, `.is-review`, `.issues-pagination`, `.issues-state-tabs__btn`, `.issues-state-tabs__count`, `.issues-table` |

Every one of those eight is benign, and I checked each:

- **`.issues-view`** — declared byte-identically in both files:
  `IssuesCards.astro:42-43` and `IssuesTable.astro:154-155` are the same two lines
  (`.issues-view { display: none; }` / `.issues-view.is-active { display: block; }`).
  De-scoping merges two identical rules into one. No behaviour change.
- **`.is-active`** — never appears bare. Every use is compound:
  `.issues-filters__groupby.is-active`, `.issues-view--cards.is-active`,
  `.issues-presets__btn.is-active`, `.issues-table__sort-icon.is-active`,
  `.issues-view-toggle__btn.is-active`. It is a shared modifier convention, which is
  exactly what BEM prescribes.
- **The 6 global collisions** are all *deliberate cross-file collaboration*.
  `styles/groups.css` styles the scoped components' classes from outside via a
  more-specific ancestor — `.issues-state-tabs--compact .issues-state-tabs__btn`,
  `.issues-table__group-section .issues-table`. Today the scoped rule is
  `.issues-state-tabs__btn[data-astro-cid-x]` = specificity 0,2,0 and the override is
  `.issues-state-tabs--compact .issues-state-tabs__btn` = 0,2,0 — a **tie**, decided by
  source order. After de-scoping the component rule drops to 0,1,0 and the override
  wins outright. **De-scoping makes these six *more* reliable, not less.**

That is the honest read: this codebase is already hand-namespaced BEM and does not lean
on the compiler. Astro's scoping here is a safety net that nothing has fallen into.

### The replacement discipline — one recommendation

**Extract each block to a sibling `.css` file, keep the existing BEM prefix, and add a
`stylelint` `selector-class-pattern` rule that requires every selector's leftmost class
to start with the owning layout's prefix.** Cost: 3–5 days of mechanical extraction
plus a half-day writing the rule and the per-layout prefix map.

```
BEFORE                                   AFTER
parts/index/FilterBar.astro              parts/index/FilterBar.html      (Go template)
  <style>                                parts/index/FilterBar.css       (plain CSS)
    .issues-filters__chip { … }            .issues-filters__chip { … }
    :global(.issues-chip-pop) { … }        .issues-chip-pop { … }   ← :global wrapper deleted
  </style>
                                         stylelint: every selector's leftmost class
  compiler stamps [data-astro-cid-…]     must match ^issues-(filters|view|table|…)
```

Why this one and not the alternatives:

| Option | Why not |
|---|---|
| **CSS Modules through Vite** | Gives back hashed scoping — but the class names then only exist inside the JS bundle, and a **Go** template has no way to import the generated name map without a build-time codegen step feeding Go from Vite. It reintroduces exactly the cross-language coupling the migration is trying to reduce, for a risk measured at 0 bare-tag selectors. |
| **A build step that stamps a scope attribute** | Rebuilding Astro's compiler. Weeks of work, a new thing to maintain, and it would have to run at *template parse* time to keep runtime-parsed user layouts working — which is where the whole design gets hard. |
| **Shadow DOM per component** | Breaks the theme contract outright: `var(--color-*)` inherits through shadow boundaries, but every layout selector, the `data-theme` attribute selectors, and all the site-wide `markdown.css` rules stop reaching the content. Non-starter. |
| **Nothing — just global CSS, no rule** | This is what happens by default, and it works today for the 4,682 lines of already-global CSS. But the lint rule costs half a day and converts a silent failure mode into a CI error. Take it. |

### What happens to the `:global()` project rule

The project convention in `CLAUDE.md` — *"elements created at runtime via `innerHTML` /
`createElement` don't receive Astro's `data-astro-cid-*` attribute, so scoped selectors
skip them; wrap those styles in `:global()`"* — **exists only because of scoping, and it
deletes with scoping.** All 21 wrappers become no-ops and should be removed, not
mechanically translated. That rule is currently a live bug source: it fires only when a
node is created at runtime, so getting it wrong produces an unstyled element that
appears in one interaction path and nowhere else. Removing it is a genuine improvement,
and the migration is the moment to delete the paragraph from `CLAUDE.md` and from
`dev-docs/05_architecture/05_layout-internals/`.

---

## 5. The other hard case — a theme that ships a layout

### What is actually true today

Three corrections to the framing, all **measured**:

1. **Themes cannot ship layouts.** `theme.yaml`'s schema is `name` / `version` /
   `description` / `extends` / `supports_dark_mode` / `override_mode` / `files` (CSS
   only). Layouts ship through a *separate* mechanism — `LAYOUT_EXT_DIR` in `.env`
   (live value: `./default-docs/layouts`) → the `@ext-layouts` Vite alias → nine pairs
   of `import.meta.glob()` in `pages/lib/layout-registry.ts`. The two are unrelated.
2. **The capability is advertised but unexercised.**
   `default-docs/data/user-guide/20_custom-pages/03_creating-custom-layouts.md:266`
   calls `LAYOUT_EXT_DIR` "**The recommended path**". `default-docs/layouts/` contains
   one file: `.gitkeep`.
3. **It already requires a full Node toolchain.** `import.meta.glob()` is resolved by
   Vite at build/dev-server-start time. To use a user layout you must run `./start dev`
   or `./start build`, i.e. have `node_modules` (419 MB, measured by surface 7) and bun
   or npm. "A user can ship a layout without a toolchain" is **not a property this
   project has today.**

### What a user layout actually needs from the server

I read all three built-in `custom` layouts. Every one of them does exactly the same
thing and nothing else:

```
custom/home/Layout.astro:31     const content = await loadFile(dataPath);
custom/info/Layout.astro:18       pageData = content.data as typeof pageData;
custom/countdown/Layout.astro:17
                                          │
                                          ▼
                    data/pages/home.yaml  →  parsed YAML  →  template
```

`loadFile()` on a `.yaml` returns `{ data: <parsed YAML> }`. So the entire server-side
power a user layout exercises is **"parse the YAML file `site.yaml` pointed me at and
hand me the object"** — a *generic* operation a Go handler can perform for any data
shape without knowing the shape, via `yaml.Unmarshal(b, &map[string]any{})`.

Surface 2 records this as a major loss ("a user-shipped layout with a new data shape
stops being possible without a binary rebuild") and proposes a third mechanism to fix
it. That third mechanism is not needed: the generic map *is* the fix, and it is one
handler.

### The recommendation: runtime-parsed `html/template` for every layout

**Use `html/template`, parsed at boot from `embed.FS` for built-ins and from
`filepath.WalkDir` over the overlay directory for user layouts. One mechanism, no
`templ`.**

The reasoning, weighed against what `templ` buys:

| Dimension | `templ` (compiled) | `html/template` (runtime-parsed) |
|---|---|---|
| User ships a layout | **impossible** without `go build` of the whole engine | drop a `layout.html` in the overlay dir, restart or hot-rescan |
| Toolchain the user needs | Go toolchain + framework source | **nothing** — strictly better than today's Node + 419 MB `node_modules` |
| Compile-time type checking of built-in layouts | yes | no — mitigated by a boot-time parse + fixture-execute pass |
| Render speed | faster (compiled string writes) | fast enough — see below |
| Number of template mechanisms to maintain | 2, if overlays also need `html/template` | 1 |

**The type-safety argument is weaker than it looks.** Surface 2 measured that this
project has *no* compile-time template checking today: no `astro check`, no
`@astrojs/check` installed, no `tsc` in any script or in CI, and `tsc --noEmit` run by
hand right now returns 27 errors across 5 files. The 47 `interface Props` declarations
are validated only by an editor language server. So `templ` would be **adding** a
guarantee the project has never had, at the price of closing an extension point the
project advertises as recommended. That is the wrong trade.

**The speed argument does not bite at this scale.** Warm dev render latency measured
against the live server (5 samples each, `curl -w %{time_total}`):

| Route | Mean warm response |
|---|---:|
| `/user-guide/getting-started/overview` | 8.5 ms |
| `/dev-docs/overview/code-structure` | 6.3 ms |
| `/todo` (issues index, the heaviest page) | 32.8 ms |

The issues index is the slow one, and surface 6 measured that ~14 ms of it is
`computeSignature`'s 1,781 `stat` calls — the loader, not templating. A pre-parsed
`html/template` tree executes in the tens of microseconds for pages this size.
Optimising templating here is optimising the wrong term.

**What actually enforces correctness**, replacing the compiler: a boot-time pass that
`template.ParseFiles` every registered template and executes each against a fixture
value, plus a `doc-engine check --templates` subcommand doing the same in CI. That
turns "a bad user layout is a per-request 500" into "the server refuses to start and
names the file". It is the invariant surface 2 was worried about, enforced by the
simplest thing that enforces it.

**Runner-up, and what would make it win.** `templ` for the built-in layouts plus
`html/template` for overlays. It wins if either (a) a profile shows template execution
is a measurable fraction of the issues-detail render — the page has 27 components — or
(b) the built-in templates grow large enough that runtime errors start escaping the
boot check in practice. Neither is true on today's numbers, and adopting it costs a
second template dialect that user-facing documentation then has to explain twice.

**One thing genuinely lost either way, and it is not CSS.** A user layout today can
ship a `<script>` that Vite bundles, tree-shakes and hashes for free. Under the
proposal that needs `doc-engine dev --vite`, i.e. Node on the themer's machine. The
notes' own runtime-config table marks this row as a warning while the surrounding prose
says the surface is identical. It is not — but it is the *JS* half of layout shipping.
**The CSS half needs nothing: a user layout's `style.css` is a file the Go server
serves, or a file the theme chain concatenates.**

---

## 6. CSS hot reload — assessing the 200–500 ms → 5 ms claim

The claim, from `../../../notes/architecture/01_overview.md` and
`../../../notes/architecture/06_performance-comparison.md`:
*"Theme CSS hot-reload: 200–500 ms (Vite re-bundle)"* → *"~5 ms … because no Vite
bundling step"*.

**The mechanism is wrong and the arithmetic does not support the win.**

- **No re-bundle happens.** Theme CSS is deliberately outside the Vite module graph
  (`BaseLayout.astro:42-46`; grep confirms zero imports of `@styles/*`). On a
  `color.css` save the path is `handleHotUpdate` → `cacheManager.onFileChange` → clear
  the theme and combined-CSS caches → `server.ws.send({type:'full-reload'})` → `return []`
  to suppress Vite's own HMR. Vite bundles nothing.
- **The server-side work being "saved" is 0.090 ms** (**measured**: 200 iterations
  re-reading and concatenating the real 10-file default theme, 62,218 bytes out). Going
  from 0.090 ms to something smaller in Go is not a user-visible improvement.
- **The real cost is the full document reload.** Server render is 6.3–8.5 ms for a docs
  page and 32.8 ms for the issues index (**measured**); the browser then re-parses
  138 KB of HTML, re-runs every script, and throws away all page state. That is where
  the "flash" comes from — the deliberate `full-reload`, not bundling.

**But there is a much better win available that the notes do not name, and it is
cheap.** Because the CSS arrives as an inline `<style id="theme-styles">`, a Go dev
server can push the new merged text over SSE and the client can do:

```js
// ~15 lines, dev only
new EventSource('/__dev/events').addEventListener('theme-css', e => {
  document.getElementById('theme-styles').textContent = e.data;
});
```

That is a **flash-free, state-preserving swap**: scroll position, open filter panels,
the issues table's active view, an expanded sidebar tree and any in-progress form all
survive. It is strictly better than both today's full reload *and* a `<link href>`
cache-bust swap (which has a brief window where the new sheet has not arrived). Payload
is 13,027 bytes gzipped for the active theme (**measured**) — nothing.

**Honest scoreboard on hot reload:**

| CSS a person edits | Today | Under Go + SSE swap | Verdict |
|---|---|---|---|
| Theme CSS (`themes/**`, `src/styles/`) — what a **user** edits | full page reload, all state lost, ~8–33 ms server + full re-parse | inline `<style>` textContent swap, no reload, no flash, state preserved | **better** |
| Layout CSS (`src/layouts/**`) — what a **framework developer** edits | real Vite CSS HMR, no reload (**measured**) | same, *if* layout CSS stays in the Vite frontend bundle; the SSE swap *if* it joins the theme chain | **same or slightly worse for developers** |

And that second row is where a decision has to be taken, because it collides with the
`issues.css` defect (parity row #19). Putting layout CSS into the theme chain is what
makes a theme's `issues.css` actually win the cascade — the capability the user guide
already promises and the code does not deliver. Doing that costs framework developers
their per-component CSS HMR and hands them the SSE swap instead, which is nearly as
good.

**Take the theme-chain option.** A documented user capability that does not work is a
worse defect than a marginally slower inner loop for the two people editing
`detail.css`. Concretely, that means the emitted head becomes:

```
<head>
  <style id="theme-styles">
      ┌─ parent theme files (color, font, element, breakpoints, reset,
      │  markdown, navbar, footer, docs, blogs)
      ├─ LAYOUT CSS (issues/detail.css, index.css, groups.css, de-scoped
      │  component CSS)                                   ← moved here
      └─ child theme files (the user's overrides)         ← now genuinely last
  </style>
  <script> dark-mode boot </script>
</head>
```

Sizes for that combined block, **measured**: 127,582 bytes raw / **20,999 bytes
gzip-9** — theme 64,938 raw / 13,027 gzip plus the layout bundle 62,644 raw /
8,337 gzip.

---

## 7. Decisions this forces, stated plainly

Four, and none of them is "can we still do CSS".

**1. Inline or link? Recommend: split, and inline the token layer.** The notes propose
serving `/themes/<name>/<file>.css` raw with ETags and call it identical behaviour. It
is not — today's model is inline, which is why there is no FOUC on a cold cache. But
inlining everything costs 64,938 bytes on every page (46.2 % of the built site,
**measured**) and is never cached across navigations. Measured split of the default
theme:

| Layer | Files | Raw bytes | Gzip-9 bytes |
|---|---|---:|---:|
| Tokens (`color`, `font`, `element`, `breakpoints`) | 4 | 9,946 | 3,421 |
| Bulk (`reset`, `markdown`, `navbar`, `footer`, `docs`, `blogs`) | 6 | 52,021 | 9,466 |

Inline the 3.4 KB token layer (it carries `:root` and `[data-theme="dark"]`, so colors
and the dark-mode attribute resolve before first paint, FOUC guarantee intact) and link
the rest as one cacheable, ETagged file. First paint keeps its guarantee; every
subsequent navigation saves ~9.5 KB on the wire. **Note the artifacts route forces the
inline path to exist anyway** — `pages/artifacts/[...path].ts:181` injects
`getThemeCSS(getTheme())` into third-party HTML, so the merged-string API is required
regardless of what the main page does.

**2. Does `override_mode` survive?** Both shipped user themes use `merge`;
`full-width/theme.yaml` has its `override` line commented out. Nothing in the repo
exercises `override` or `replace`, so both would be ported blind and remain untested on
both sides. Write two fixture themes before porting, or drop the modes explicitly.
Porting untested code paths by omission is the worst of the three.

**3. Widen the contract.** 53 variables required, 109 declared, 109 referenced across
`src/`, and **44 referenced but never declared by the default theme** (**measured**).
Most of the 44 are component-private (`--dt-*` toolbar, `--ev-*` editor) and fine, but
`--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-*` and the
z-index scale are load-bearing and outside the contract — so a `replace`-mode theme can
pass validation and still break the site. And `--color-text-tertiary`
(`markdown.css:856,888`) is declared by nothing at all, with frozen `#888`/`#999`
fallbacks, so task-checkbox borders do not respond to dark mode. Split
`required_variables` into "required" and "expected" tiers, and add the missing one.
This is a defect in the current stack; the port is just when someone will look.

**4. Who owns the name `default`?** `resolveThemeName()` short-circuits the literal
string `default` to `src/styles/` **before** any directory scan, and
`getAvailableThemes()` seeds `'default'` into its `seen` set first — so a user theme
directory named `default` is both unreachable and invisible. Preserve that deliberately
or state the new rule; do not rediscover it in Go.

---

## 8. The answer the user asked for

**Yes. Everything you do today with CSS you will still do, in the same files, with the
same syntax.** A theme is still a folder with a `theme.yaml` and some `.css`; you still
set `theme:` in `site.yaml`; `extends` still chains; overriding `--color-brand-primary`
still works because CSS custom properties are a browser feature that owes Astro
nothing; dark mode is unchanged down to the boot script. The theme loader is 513 lines
of `fs` + `path` + `js-yaml` with exactly one framework call in it, so it is a
translation, not a redesign.

**Three things change, none of them in your CSS.** The theme picker in the dev toolbar
has to be rebuilt as an in-page panel, because Astro owns the toolbar and Go cannot
have it — same buttons, different chrome, and unlike today it would also work in a
served production build. The framework's own 1,327 lines of component-scoped CSS lose
their automatic scoping and have to rely on the BEM naming they already use, which I
measured as low-risk: zero tag-anchored selectors and six cross-file collisions that
all get *more* correct without scoping. And a user-shipped **layout** stops being a
compiled Astro component and becomes a runtime-parsed HTML template — less powerful, in
that it cannot call framework functions, but reachable without installing Node at all,
which is more than can be said for today.

**One thing gets meaningfully better for you.** Editing a theme's CSS today reloads the
whole page and throws away your scroll position, your open filters and everything else;
a Go server watching the file and pushing the new CSS into the existing `<style>` tag
swaps it in place with no reload and no flash. The notes sell this as
"200–500 ms → 5 ms", which is the wrong argument — the actual merge takes 0.090 ms
today and the reload is what hurts — but the improvement is real, just for a different
reason than they give.
