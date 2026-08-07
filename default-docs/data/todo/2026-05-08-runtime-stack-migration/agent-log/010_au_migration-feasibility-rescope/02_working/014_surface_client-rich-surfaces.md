---
title: "Client-side rich surfaces (diagrams, artifacts, interactive JS)"
---

# Surface 4 — client-side rich surfaces

Everything the browser executes on a content page: four diagram renderers, the
self-contained-HTML artifact embed, the pan/zoom lightbox with its copy/download
actions, the code-block copy label, and the site-wide tooltip. Explicitly **out
of scope** (another auditor): `src/dev-tools/**` — the CodeMirror editor, the Yjs
sync layer, and the four dev-toolbar apps.

**One-line answer.** The browser code is near-free to port and the notes are
right about that; what the notes never mention is that four of the six surfaces
are **half server** — the artifact route alone injects theme CSS, computes a
content-hash ETag, and owns a MIME decision that is a security boundary — and
none of that appears anywhere in `notes/architecture/`.

---

## 1 · Inventory

### 1.1 The browser scripts

All eight live in `astro-doc-code/src/scripts/`. All eight are loaded from
`src/layouts/BaseLayout.astro` (lines 139–151) as five `<script src="…">` tags —
plain Astro-bundled module scripts, **no Astro islands, no hydration directives,
no framework runtime**.

Lead line: the eight files, their line count (measured with `wc -l`), and how each
reaches the browser.

| File | Lines | Entry? | Reaches the browser as |
|---|---:|---|---|
| `scripts/diagrams.ts` | 157 | yes (BaseLayout) | own chunk, 3.1 KiB, `<script type="module" src>` |
| `scripts/drawio.ts` | 282 | no | `import('./drawio')` from `diagrams.ts` — separate chunk, loads only when a `.diagram-drawio` exists |
| `scripts/lightbox.ts` | 320 | yes (BaseLayout) | bundled with `panzoom` + `diagram-actions` + `code-labels` into one 11.6 KiB chunk |
| `scripts/panzoom.ts` | 204 | no | static import from `lightbox.ts` |
| `scripts/diagram-actions.ts` | 277 | no | static import from `lightbox.ts` |
| `scripts/artifacts.ts` | 258 | yes (BaseLayout) | **inlined into every page's HTML**, 3.7 KiB |
| `scripts/code-labels.ts` | 57 | yes (BaseLayout) | inlined, 1.3 KiB |
| `scripts/tooltip.ts` | 88 | yes (BaseLayout) | inlined, 1.1 KiB |
| **total** | **1,643** | | |

(Measured: the inline-vs-external split comes from parsing the built HTML of
`/tmp/aks-audit-dist/index.html` after a fresh `astro build`. Astro inlines small
hoisted scripts and emits larger ones as hashed chunks. This split is Astro's own
heuristic and would be Vite's `build.assetsInlineLimit` in a Go+Vite world — the
behaviour, not the mechanism, is what to preserve.)

### 1.2 The vendored blob

| Path | Size | What |
|---|---:|---|
| `src/vendor/drawio/viewer-static.min.js` | 4,100,766 bytes (3.91 MiB) | draw.io's own `GraphViewer`, taken verbatim from upstream v31.1.5. **draw.io publishes no npm package** — this is the only full-fidelity renderer that exists. |
| `src/vendor/drawio/LICENSE` | — | Apache-2.0 |
| `src/vendor/drawio/README.md` | 60 | provenance, SHA-256, upgrade procedure, the six-globals explanation |
| `public/vendor/drawio/math/startup.js` | 12 | a deliberate no-op MathJax stand-in, so the viewer's unconditional `Editor.initMath()` doesn't 404 on every page |

Measured: the emitted `dist/_astro/viewer-static.min.<hash>.js` is **byte-identical**
to the source (`cmp` says so). Vite's `?url` here does nothing but hash the
filename and hand back a URL. gzip 853,087 bytes (0.81 MiB).

### 1.3 The server-side halves

These are the files that *produce* the markup the browser scripts consume, or that
*serve* the files those scripts fetch. This is the part the architecture notes do
not cover.

| File | Lines | Job |
|---|---:|---|
| `src/parsers/renderers/marked.ts` (the `DIAGRAM_LANGS` branch, lines 28 + 73–77) | ~6 of 192 | ` ```mermaid ` / ` ```dot ` / ` ```graphviz ` fences → `<div class="diagram diagram-<kind>">escaped source</div>` |
| `src/parsers/postprocessors/diagram-embed.ts` | 91 | `![alt](./x.excalidraw\|.drawio)` → `<div class="diagram diagram-<kind>" data-src="…?v=<mtimeMs>" data-title="…">`; existence check + typed error entry |
| `src/parsers/postprocessors/asset-src.ts` | 98 | rewrites relative `<img src>` and colocated-file `<a href>` to `/content-assets/<path-relative-to-content-root>`; exports `resolveContentAssetUrl` used by all three of the loaders below |
| `src/loaders/diagram-pages.ts` | 210 | first-class diagram **pages** — `.mmd/.mermaid/.dot/.gv/.excalidraw/.drawio` with an `NN_` prefix become docs pages; `.meta.json` sidecar; `allow_diagram_pages` opt-out |
| `src/loaders/artifact-pages.ts` | 287 | first-class artifact **pages** — `NN_*.html`; `.meta.json`/`.meta.jsonc` sidecar; `embed_height`; the `artifact.theme` mode reader; `allow_artifact_pages` opt-out |
| `src/loaders/first-class-page.ts` | 55 | one shared slug-collision pass across markdown + diagram + artifact entries |
| `src/pages/artifacts/[...path].ts` | 216 | the reserved `/artifacts/<path>` route: symlink-proof containment, theme injection, content-hash ETag, `text/html` scoping |
| `src/pages/content-assets/[...path].ts` | 116 | serves every colocated non-markdown file out of content dirs; ETag/304; dev-vs-prod Cache-Control |
| `src/pages/assets/[...path].ts` | 128 | serves the framework/user asset dirs at `/assets/` — where draw.io's `STENCIL_PATH` points |
| `src/pages/lib/mime.ts` | 23 | the 17-entry shared MIME map; `.excalidraw → application/json`, `.drawio → application/xml`; **`.html` deliberately absent** |
| `src/layouts/file-type-icons.ts` | 34 | the two sidebar glyphs that mark a diagram or artifact page |
| `src/loaders/issues.ts` (diagram/artifact arms) | ~45 of 1,100+ | the same first-class treatment inside tracker `notes/`/`brainstorm/`/`agent-log/` folders |

Plus a guard: `src/loaders/config.ts:413` — `RESERVED_BASE_URLS = ['artifacts',
'assets', 'content-assets', 'api', 'editor']`, so a user section cannot claim
those prefixes.

### 1.4 CSS

Measured by brace-matched selector attribution over `src/styles/markdown.css`:

| Surface | Lines of CSS | File |
|---|---:|---|
| lightbox overlay + toolbar + toast | 129 | `markdown.css` |
| artifact embed + expand overlay + error | 114 | `markdown.css` |
| diagram container + hover toolbar + caption + dark-mode invert | 91 | `markdown.css` |
| copy/download dropdown | 32 | `markdown.css` |
| code-block label | 30 | `markdown.css` |
| tooltip | 28 | `element.css` |
| **total** | **424** | |

### 1.5 Total size of this surface

**2,913 lines of TypeScript** (measured, `wc -l` over the 12 files in 1.1 + 1.3,
excluding `issues.ts` and `marked.ts` which are mostly other surfaces) **+ 424
lines of CSS + one 3.91 MiB vendored blob**.

---

## 2 · The six rich surfaces, one by one

### 2.1 Mermaid

| | |
|---|---|
| **Renders** | flowcharts, sequence, class, state, ER, gantt, pie, mindmap, timeline, architecture, treemap, … (whatever mermaid 11 supports) |
| **Markdown trigger** | a ` ```mermaid ` fenced code block, **or** a first-class `NN_name.mmd` / `.mermaid` file in a docs section / tracker folder |
| **Server produces** | `<div class="diagram diagram-mermaid">…HTML-escaped source…</div>` — source travels **inline in the page** |
| **Client** | `diagrams.ts:53-81` — `await import('mermaid')`, `mermaid.initialize({ startOnLoad:false, theme:'default', securityLevel:'loose', htmlLabels:false })`, then `mermaid.render(id, source)` per div |
| **Lazy?** | yes — dynamic `import('mermaid')` fires only when at least one `.diagram-mermaid` is on the page |
| **Weight (measured)** | transitive closure from `mermaid.core.<hash>.js`: **52 chunks, 2.52 MiB raw / 0.75 MiB gzip**. That is the ceiling (all diagram types + katex 259 KiB + cytoscape 432 KiB + treemap 366 KiB). A single flowchart page loads `mermaid.core` (480 KiB) plus its one diagram-type chunk. |
| **Notable choice** | `htmlLabels: false` is deliberate — `<foreignObject>` taints a canvas in Chromium, which would break the lightbox's copy-as-PNG action |

### 2.2 Graphviz

| | |
|---|---|
| **Renders** | DOT graphs via the `dot` layout engine |
| **Markdown trigger** | ` ```dot ` or ` ```graphviz ` fence, **or** a first-class `NN_name.dot` / `.gv` file |
| **Server produces** | same inline-source container, `diagram-graphviz` |
| **Client** | `diagrams.ts:83-100` — `await import('@hpcc-js/wasm-graphviz')`, `Graphviz.load()`, `graphviz.layout(src,'svg','dot')` |
| **Lazy?** | yes |
| **Weight (measured)** | **1 chunk, 780,102 bytes raw / 614 KiB gzip.** The WebAssembly module is **base64-inlined into the JS** — `find node_modules/@hpcc-js/wasm-graphviz -name '*.wasm'` and `find dist -name '*.wasm'` both return **nothing**. |
| **Consequence for the port** | there is **no `.wasm` asset to serve** and therefore **no `application/wasm` MIME requirement**. Whatever the notes assume about wasm serving, it does not apply here. |

### 2.3 Excalidraw

| | |
|---|---|
| **Renders** | a saved `.excalidraw` scene, exported to static SVG (never the editor) |
| **Markdown trigger** | `![alt](./assets/x.excalidraw)` image syntax, **or** a first-class `NN_name.excalidraw` file. A plain `[link](…)` stays a link. |
| **Server produces** | `<div class="diagram diagram-excalidraw" data-src="/content-assets/…?v=<mtimeMs>" data-title="…">` — **by reference**, not inline |
| **Client** | `diagrams.ts:102-151` — `await import('@excalidraw/excalidraw')`, `fetch(src, {cache:'no-cache'})`, `exportToSvg({elements, appState:{exportBackground:true, viewBackgroundColor:'#ffffff'}, files})`, then builds a caption `<div>` with a "open file ↗" link |
| **Lazy?** | yes |
| **Weight (measured)** | closure minus mermaid's shared chunks: **66 chunks, 4.04 MiB raw / 1.51 MiB gzip.** The main chunk is 1.12 MiB and **contains React** (`__SECRET_INTERNALS`, `useState` × 92). It drags in ~40 locale chunks, `pica`, a 1.78 MiB font-subsetting shared chunk, and spawns a **Web Worker** (`subset-worker.chunk.<hash>.js`, `new Worker` × 1). |
| **The honest reading** | we import a full drawing-application bundle to call one export function. `node_modules/@excalidraw/excalidraw` is **48 MB on disk**; `dist/prod` alone is 18 MB. |

### 2.4 draw.io

| | |
|---|---|
| **Renders** | `.drawio` / `<mxfile>` XML at full fidelity, including multi-page files (pages toolbar shown when `pageCount > 1`) |
| **Markdown trigger** | `![alt](./assets/x.drawio)`, or a first-class `NN_name.drawio` file |
| **Server produces** | `data-src` container, same as excalidraw |
| **Client** | `drawio.ts` — injects the vendored 3.91 MiB UMD bundle as a `<script>` tag (it exports nothing; it installs globals), then constructs `new GraphViewer(host, doc.documentElement, {...})` per diagram |
| **Lazy?** | doubly — `import('./drawio')` from `diagrams.ts:44` only when a `.diagram-drawio` exists, and the vendored script tag is injected once inside that module |
| **Weight (measured)** | **4,100,766 bytes raw / 853,087 bytes gzip**, one file, byte-identical to source |
| **Six globals overridden before load** | `PROXY_URL`, `STYLE_PATH`, `SHAPES_PATH`, `STENCIL_PATH`, `GRAPH_IMAGE_PATH` → `/assets/drawio/…`; `DRAW_MATH_URL` → `/vendor/drawio/math`; `DRAWIO_LOG_URL` → `''`; `onDrawioViewerLoad` claimed to suppress the global `.mxgraph` scan. **All of them default to `viewer.diagrams.net`** — a built site would otherwise phone home on every page view. |
| **Dark mode** | native, not the invert filter the other three use: `Editor.darkMode` + per-viewer `'dark-mode'` option, plus `stampColorScheme()` which writes a `<style>` child into the SVG so `light-dark()` resolves correctly after `cloneNode` (lightbox) or `removeAttribute('style')` (download). A `MutationObserver` on `document.documentElement[data-theme]` rebuilds every viewer on a theme toggle. |
| **Known cost** | draw.io's *stencil* libraries (AWS/Azure/GCP/Cisco/K8s icon sets, ~21 MB of XML) are **not** vendored. `STENCIL_PATH` points at `default-docs/assets/drawio/stencils/` so a consumer can drop them in. |

### 2.5 Artifacts (self-contained HTML)

The one surface with a genuinely substantial server half.

**How a `.html` file becomes a page.** `loadArtifactPages()` globs `**/*.html`
(ignoring `**/assets/**`) in each docs section, requires an `NN_` prefix (warns
and skips otherwise), reads an optional `NN_name.meta.json` / `.meta.jsonc`
sidecar, and pushes an entry whose `content` is a **placeholder div**, not the
artifact HTML:

```
<div class="artifact artifact-html"
     data-src="/artifacts/<path-relative-to-content-root>?v=<mtimeMs>"
     data-title="…"
     [style="height:…;" | "aspect-ratio:…;height:auto;"]></div>
```

**The sidecar.** `.meta.json` (`.meta.jsonc` preferred by `readSettings`) carries
`title` / `description` / `sidebar_label` / `sidebar_position` / `draft` —
frontmatter's job for a file that cannot hold frontmatter — plus `embed_height`
(a rendering override: `"full"` | CSS length | `"16/9"` aspect | pixel number) and
an **opaque `artifact:` block** the loader passes through onto `entry.data.artifact`
untouched. Exactly one key inside that block is interpreted by the engine:
`artifact.theme` (`"site"` | `"self"`, default `self`; the string `"self-world"`
also reads as `self`). The `.meta.` infix exists so a bare `NN_name.json` can be a
data file the artifact itself fetches. Measured: **12 sidecars** in
`default-docs/data/` today, against **11 `.html` files**.

**The route.** `src/pages/artifacts/[...path].ts` serves the file at
`/artifacts/<path>`:

1. `getStaticPaths` walks every content-category dir and enumerates **all**
   `.html` files (dotfiles excluded) — including ones inside `assets/`, which the
   loader skips for page-ification. Measured: **11 paths built**.
2. Containment is symlink-proof — `realpathSync` on both sides, then
   `path.relative` must not start with `..`.
3. `readArtifactThemeMode(fullPath)` reads the sidecar. `site` → `injectSiteTheme()`
   splices `<style id="artifact-site-theme">…getThemeCSS(getTheme())…</style>` plus
   an inline dark-mode init script **right after the opening `<head>` tag** (not
   before `</head>`, because an artifact's own body can contain a literal
   `</head>` in a code sample). `self` → the file's exact bytes.
4. ETag: a sha1 content hash for the injected variant (so it varies with a theme
   change, which leaves the file mtime untouched) vs `"<size>-<mtimeMs>"` for the
   byte-identical path.
5. `Content-Type: text/html` is set **locally in this route and deliberately not
   added to `lib/mime.ts`**. Adding `.html` to the shared map would make every
   colocated `.html` anywhere in the tracker executable first-party HTML on the
   site origin. **This is a security boundary expressed as a routing decision.**

Measured effect: `04_site-theme-demo.html` is 8,246 bytes on disk and **73,548
bytes served** (site mode — 65 KiB of injected theme CSS). `03_design-system-demo.html`
is 10,537 bytes on disk and 10,537 bytes served (self mode). Both are *also*
reachable at `/content-assets/<same path>` where the MIME map has no `.html` entry
and they fall through to `application/octet-stream` — i.e. they download rather
than execute. That dual exposure is the design, and it is exact.

**The client.** `scripts/artifacts.ts` turns each placeholder into an
**unsandboxed same-origin `<iframe>`** and hangs three behaviours off it:

- *Theme handshake* — `iframe.contentDocument.documentElement.setAttribute('data-theme', …)`
  on load and on every site theme toggle (a `MutationObserver` on the root
  `data-theme`). Requires same-origin and no `sandbox` attribute; the code comments
  say so explicitly.
- *Content-height fitting* — `fitToContent()` is the trickiest 45 lines in the
  surface. It neutralises `min-height:100vh` inside the iframe, measures the
  horizontal scrollbar gutter (`win.innerHeight - de.clientHeight`), collapses the
  iframe to `0px` before reading `scrollHeight` (otherwise the measurement feeds
  its own value back and grows without bound), and adds 2px of slack for fractional
  layout rounding. A `ResizeObserver` on both the inner document and the outer
  container keeps it in sync.
- *Affordances* — an "open full page" link (the `?v=` cache-buster stripped so it
  is bookmarkable) and an in-place expand overlay closed by Escape.

**Tracker parity.** `loaders/issues.ts:952` gives the same treatment to `.html`
files inside tracker `notes/` and `brainstorm/` folders, gated on a per-section
`allowArtifacts` flag (`agent-memory/` stays markdown + diagrams).

### 2.6 The three site-wide utilities

| Surface | What it does | Browser APIs it needs |
|---|---|---|
| **Lightbox** (`lightbox.ts` + `panzoom.ts` + `diagram-actions.ts`, 801 lines) | full-screen pan/zoom viewer for every `.markdown-content img` and every `.diagram-rendered`; wheel-zoom-toward-cursor, pointer drag, two-finger pinch, double-click, `+`/`-`/`0` keys; SVG text stays selectable and clicking a label copies it; a split copy button whose caret opens a menu with PNG light/dark, SVG, and source copy/download | Pointer Events, `getSelection`, `XMLSerializer`, `Blob`, `URL.createObjectURL`, `canvas.toBlob`, `img.decode()`, `navigator.clipboard.write` + `ClipboardItem`, `ResizeObserver`-free but `getBoundingClientRect`-heavy |
| **Code labels** (`code-labels.ts`, 57 lines) | language pill on `pre[data-language]`, swaps to a copy icon on hover, copies on click | `navigator.clipboard.writeText` |
| **Tooltip** (`tooltip.ts`, 88 lines) | one singleton cursor-anchored tip for any `[data-tip]`; shows **only when the text is actually cropped** unless `data-tip-always` is present | `scrollWidth`/`clientWidth`, mouse events |

`diagram-actions.ts` carries one non-obvious rule: `rasterizable: false` for
draw.io, because its labels are `<foreignObject>` and Chromium taints a canvas an
SVG containing one is drawn onto — every PNG action would throw `SecurityError`.
The PNG menu entries are withheld rather than offered and failed.

---

## 3 · Measured bundle weight

### 3.1 Eager JS per page type

Measured by parsing the built HTML of a fresh `astro build` (14.6 s wall, 1,229
pages) and summing inline script bodies plus the byte size of every referenced
`/_astro/*.js`. **Uncompressed.**

| Page type | Page HTML | Eager JS |
|---|---:|---:|
| custom (home) / blog index / blog post | 79–82 KiB | **21.9 KiB** |
| docs page (with sidebar + outline) | 157–173 KiB | **28.8 KiB** |
| issue sub-doc page | 133 KiB | **29.4 KiB** |
| issues index (filter bar, table, grouping) | 374 KiB | **42.3 KiB** |

Of the 21.9 KiB baseline, this surface owns **19.7 KiB**: lightbox+panzoom+
diagram-actions 11.6 KiB, diagrams entry 3.1 KiB, artifacts 3.7 KiB, code-labels
1.3 KiB, tooltip 1.1 KiB (rounding aside; the remaining ~1.1 KiB is the dark-mode
and theme init).

### 3.2 Lazy diagram payloads

Measured as the transitive chunk closure from each library's entry chunk in
`/tmp/aks-audit-dist/_astro/`, with gzip -6 applied per chunk.

| Library | Chunks | Raw | gzip | Loads when |
|---|---:|---:|---:|---|
| mermaid (all diagram types) | 52 | 2.52 MiB | 0.75 MiB | a ` ```mermaid ` fence or `.mmd` page is present |
| excalidraw (excl. shared mermaid chunks) | 66 | 4.04 MiB | 1.51 MiB | an `.excalidraw` embed or page is present |
| draw.io vendored viewer | 1 | 3.91 MiB | 0.81 MiB | a `.drawio` embed or page is present |
| graphviz (wasm base64-inlined) | 1 | 0.76 MiB | 0.60 MiB | a ` ```dot ` fence or `.dot` page is present |

Total `dist/_astro/` is **24 MB across 546 JS files**; the whole `dist/` is 159 MB
(1,229 pages + 52 content-assets + 11 artifacts).

### 3.3 node_modules footprint

Measured with `du -sh` (total `node_modules` = 419 MB):

| Package | Disk |
|---|---:|
| mermaid | 67 MB |
| @excalidraw/excalidraw | 48 MB |
| astro | 22 MB |
| react-dom | 7.2 MB |
| shiki | 3.9 MB |
| @hpcc-js/wasm-graphviz | 1.9 MB |
| react | 260 KB |

---

## 4 · React

**Answer: React is used nowhere except inside excalidraw's bundle, and the runtime
swap does not change that.**

- `grep -rn "from 'react'"` etc. over `src/`: **zero hits.** Nothing in the
  framework imports React.
- `astro.config.mjs` has **no `@astrojs/react` integration** — `integrations:
  [mdx(), devToolbarIntegration()]`. There is not a single `.tsx`/`.jsx` file in
  `src/`.
- `react` and `react-dom` are listed as **direct** dependencies in
  `package.json` only to satisfy `@excalidraw/excalidraw`'s `peerDependencies`
  (`^17 || ^18 || ^19`).
- Confirmed in the build output: the only chunk containing React internals is
  `percentages-<hash>.js` (1.12 MiB), which is excalidraw's own chunk and loads
  only behind the `import('@excalidraw/excalidraw')` dynamic import.

So: **this surface is not affected by the runtime swap on the React axis at all.**
Vite bundles excalidraw with its React the same way whether an Astro process or a
Go process serves the resulting file. The only thing that changes is who writes
the `<script>` tag.

---

## 5 · The split that matters — browser half vs server half

The proposal keeps Vite, so the browser half is genuinely nearly free. The trap is
assuming that is the whole story. It is not. Per surface:

| Surface | Browser half (unaffected) | Server half (must be rewritten in Go) |
|---|---|---|
| mermaid | dynamic import, `mermaid.render`, `htmlLabels:false` config | fence detection in the markdown renderer → `<div class="diagram diagram-mermaid">` with HTML-escaped source; **first-class `.mmd` page** discovery, `NN_` prefix parse, `.meta.json` sidecar, slug-collision pass, `allow_diagram_pages` opt-out, cache dependency registration |
| graphviz | dynamic import, `Graphviz.load()`, `layout()` | same as mermaid, for `.dot`/`.gv` |
| excalidraw | dynamic import, `fetch`, `exportToSvg`, caption DOM | `![](…)`→placeholder rewrite (`diagram-embed.ts`), `resolveContentAssetUrl` content-root resolution, existence check + typed error, **mtime `?v=` cache-buster**, `/content-assets/` route with ETag/304 + `application/json` MIME for `.excalidraw` |
| draw.io | vendored script injection, six globals, `GraphViewer`, theme rebuild | everything excalidraw needs, plus `application/xml` MIME for `.drawio`, plus serving `/vendor/drawio/math/startup.js` (an Astro `public/` file), plus `/assets/drawio/**` for optional stencils |
| **artifacts** | iframe creation, theme handshake, `fitToContent`, expand overlay | **the whole route**: path enumeration, symlink-proof containment, sidecar theme-mode read, theme-CSS injection at `<head>` open, sha1 content-hash ETag, `text/html` scoped to this route only, dev/prod Cache-Control; plus the loader (`NN_` prefix, sidecar, `embed_height` → inline style, opaque `artifact:` passthrough, collision pass, tracker parity) |
| lightbox / code-labels / tooltip | 100 % browser | **none** |

**Ratio.** Of the 2,913 TypeScript lines in this surface, **1,643 are browser
(56 %) and 1,270 are server (44 %)** — and the server 44 % is the part with the
containment checks, the ETag semantics, the MIME security decision, the
cache-dependency wiring, and the slug-collision pass. It is not the easy half.

### 5.1 What the browser code assumes about the server

Five contracts a Go server must satisfy exactly, or a rich surface silently
degrades:

1. **`data-src` URLs are fetched with `cache: 'no-cache'`** (`diagrams.ts:111`,
   `drawio.ts:206`, `lightbox.ts:174`). The server must answer a conditional
   request with a real 304 or every diagram re-downloads on every reload.
2. **`.excalidraw` must arrive as valid JSON and `.drawio` as text.** The MIME map
   sets `application/json` and `application/xml`; `res.json()` / `res.text()`
   depend on it.
3. **The `?v=<mtimeMs>` query must change when the file changes and be ignored for
   lookup.** Both routes ignore the query for content; static hosts do too.
4. **The artifact iframe must be same-origin and unsandboxed**, or the theme
   handshake and `fitToContent` both silently fall into their `catch` blocks and
   the artifact renders untethered from the site theme at a placeholder height.
5. **`/vendor/drawio/math/startup.js` must return 200, not 404.** It is an empty
   file whose entire purpose is to not be a 404.

---

## 6 · Dependencies, classified

| Dependency | Version | Class | Notes for the port |
|---|---|---|---|
| `mermaid` | ^11.12.2 | **browser-side** (survives any server) | pure client; Vite bundles it either way |
| `@excalidraw/excalidraw` | ^0.18.1 | **browser-side** | pulls React; only `exportToSvg` is used |
| `react` / `react-dom` | ^19.2.7 | **browser-side** | excalidraw peer deps only |
| `@hpcc-js/wasm-graphviz` | ^1.21.0 | **browser-side** | wasm is base64-inlined; no asset serving needed |
| vendored `viewer-static.min.js` | drawio v31.1.5 | **browser-side** | a file to copy; not a package |
| `marked` + `marked-alert` | ^17 / ^2.1.2 | **Node-only** | the diagram-fence branch must be reimplemented as a goldmark extension |
| `glob` | ^11 | **Node-only** | `filepath.WalkDir` in Go |
| `js-yaml`, `gray-matter` | — | **Node-only** | sidecars here are JSON, so only `encoding/json` + a JSONC tolerance is needed |
| Vite `?url` import | — | **Vite-specific** | one usage (`drawio.ts:18`); survives, Vite stays |
| Astro `<script src>` hoisting/bundling | — | **Astro-only** | replaced by Vite entry points + a manifest lookup |
| Astro `getStaticPaths` + `APIRoute` | — | **Astro-only** | replaced by Go `http.Handler`s |
| Astro `import.meta.env.DEV` | — | **Astro/Vite-only** | 13 files use it; here it gates dev-vs-prod `Cache-Control` |
| Astro `public/` copy-to-dist | — | **Astro-only** | one file (`vendor/drawio/math/startup.js`); becomes `//go:embed` |
| `astro:assets` / `<Image>` | — | **not used** | zero hits. See §7. |

Browser APIs the surface depends on (all portable, all survive any server):
Pointer Events, `ResizeObserver`, `MutationObserver`, `IntersectionObserver` (in
the issues layout, not here), `navigator.clipboard.write` + `ClipboardItem`,
`canvas.getContext('2d')` + `toBlob` + `ctx.filter`, `XMLSerializer`, `Blob` +
`URL.createObjectURL`, `img.decode()`, `iframe.contentDocument` (same-origin),
`Worker` (excalidraw only), `localStorage`, CSS `light-dark()` + `color-scheme`
(draw.io only).

---

## 7 · Astro build-time asset handling actually in use

This is the shortest section in the report, and that is the finding.

Measured, exhaustively:

| Mechanism | Usages in `src/` | Where |
|---|---:|---|
| `?url` import | **1** | `src/scripts/drawio.ts:18` |
| `?raw` import | **0** | — |
| `?inline` import | **0** | — |
| `import img from '*.png\|jpg\|svg\|…'` | **0** | — |
| `astro:assets` / `<Image />` / `<Picture />` | **0** | — |
| `src/assets/` contents | **1 file** | `.gitkeep` |
| `public/` contents | **1 file** | `public/vendor/drawio/math/startup.js` |
| `import.meta.glob` | **21** | all in `pages/lib/layout-registry.ts` + `pages/api/dev/layouts.ts` — the layout surface, not this one |

**Reading:** the "Astro build-time asset machinery that does not exist in a Go
server" is, for this surface, **two files** — one `?url` import of the vendored
draw.io blob, and one `public/` file. Everything else the framework serves goes
through the three hand-written file-serving routes (`/assets`, `/content-assets`,
`/artifacts`), which read from disk at request time and are already
framework-agnostic in shape.

That is good news for the migration and should be stated as such. The port cost
here is **routes, not asset pipeline.**

---

## 8 · What a Go rewrite costs, capability by capability

| Capability | Go equivalent | Verdict |
|---|---|---|
| ` ```mermaid ` / ` ```dot ` fence → container div | goldmark custom `CodeBlock` renderer | **straight port**, ~30 lines |
| `![](…​.excalidraw\|.drawio)` → placeholder div | goldmark `Image` renderer or an AST transformer | **straight port**, ~80 lines. Cleaner than today's regex-over-rendered-HTML. |
| relative src → `/content-assets/<root-relative>` | `filepath.Rel` over the configured content roots | **straight port**, ~60 lines |
| first-class diagram pages (`.mmd`/`.dot`/`.excalidraw`/`.drawio`) | `filepath.WalkDir` + prefix parse + `encoding/json` sidecar | **straight port**, ~200 lines |
| first-class artifact pages (`NN_*.html`) | same | **straight port**, ~250 lines |
| slug-collision pass | map of slug → entries | **straight port**, ~50 lines |
| `/assets`, `/content-assets` routes | `http.HandlerFunc` + `filepath.EvalSymlinks` + `mime.TypeByExtension` (with an explicit override map — Go's default map has no `.excalidraw`/`.drawio`) | **straight port**, ~150 lines. Go's `http.ServeContent` gives ETag/Range/304 nearly free. |
| `/artifacts` route incl. theme injection | `regexp` on the opening `<head>` tag + `crypto/sha1` | **straight port**, ~120 lines |
| `public/` → `/vendor/drawio/math/startup.js` | `//go:embed` + `http.FS` | **straight port**, ~5 lines |
| Vendored draw.io blob | `//go:embed` or a Vite `?url` import that survives | **no change** — Vite stays; keep the `?url` import as-is |
| The eight browser scripts | Vite entry points; `<script>` tags emitted from the Vite manifest | **straight port**, near-zero code change. The five BaseLayout tags become five manifest lookups. |
| `mermaid` / `graphviz` / `excalidraw` dynamic imports | unchanged | **no change** |
| Astro's small-script inlining | `build.assetsInlineLimit` + reading the manifest, or just always emit `<script src>` | **minor redesign.** 6.1 KiB currently inlined becomes 3 extra HTTP requests unless deliberately re-inlined. |
| `import.meta.env.DEV` gating of Cache-Control | a runtime flag on the server struct | **simplification** — Go knows at request time whether it is in dev mode; no build-time constant needed |
| Server-side pre-rendering of diagrams | **does not exist today.** Nothing is pre-rendered; all four renderers are client-side. | **nothing to port.** Also: nothing to gain — Go has no mermaid, no excalidraw, and no draw.io renderer, so pre-rendering would be a new project, not a port. |

**Total estimated Go rewrite for the server half: 900–1,000 lines**, against 1,270
TypeScript lines today. Confidence: **read** (I read every file; I did not write
the Go).

**Total estimated change for the browser half: near zero.** The eight scripts move
to `frontend/src/` unchanged; only the five `<script>` tags in `BaseLayout.astro`
become manifest-driven tags in a Go template.

---

## 9 · What is lost or degraded

| Item | Severity | Why | Mitigation |
|---|---|---|---|
| Nothing in the four diagram renderers | **none** | they are browser code and Vite stays | — |
| Nothing in lightbox / tooltip / code-labels | **none** | pure DOM | — |
| Astro's automatic small-script inlining | **minor** | 6.1 KiB of JS currently arrives in the HTML document; without it, three extra requests per page | Vite's `build.assetsInlineLimit`, or a Go template helper that inlines any manifest entry under N bytes |
| Astro's `?url` content-hashing of the vendored blob | **none** | Vite still provides `?url` | — |
| `astro:assets` image optimisation | **none** | measured: **zero usages**. Nothing to lose. | — |
| The artifact route's exact ETag semantics | **minor** | easy to get subtly wrong: the site-mode ETag must be a hash of the *injected* body, not the file, or a theme change serves stale artifacts from a year-long cache | port the comment along with the code; it explains the trap |
| The `.html`-not-in-the-shared-MIME-map decision | **major if lost** | it is invisible in the code (an *absence*), and a Go port using `mime.TypeByExtension` gets `text/html` for free — which silently makes every colocated `.html` in the tracker executable first-party HTML on the site origin | an explicit MIME override map with `.html` mapped to `application/octet-stream` for `/content-assets`, and `text/html` written literally in the `/artifacts` handler; a test that asserts both |
| `fitToContent`'s measurement dance | **minor** | 45 lines of hard-won browser layout knowledge; it ports verbatim because it is browser code — but only if whoever moves it resists "simplifying" it | keep the comments |
| draw.io's six-globals override | **minor** | if the local route prefixes change during the port and the globals aren't updated, the site silently starts making requests to `viewer.diagrams.net` on every page with a diagram | the vendored README already documents this; add a build check |
| Excalidraw's bundle weight | **major, and pre-existing** | 4.04 MiB raw / 1.51 MiB gzip + React + a Web Worker to call one export function. The migration neither helps nor hurts. | out of scope for the migration, but worth an issue: `exportToSvg` may be reachable from a smaller entry point, or scenes could be pre-exported to `.svg` at author time |
| Server-side diagram pre-render | **none (does not exist)** | — | — |
| WASM asset serving | **none (does not exist)** | graphviz inlines its wasm as base64 | — |

**Nothing on this surface is fatal.** That is the honest verdict and it is the
strongest part of the migration's case.

---

## 10 · Claims from the architecture notes, checked

| Claim | Where | Verdict | Evidence |
|---|---|---|---|
| "Compare to today's Astro setup which ships ~300–500 KB to most pages" | `notes/architecture/03_vite-frontend-and-dist.md` | **false** | Measured on a fresh build: **21.9 KiB** eager JS on home/blog, **28.8 KiB** on a docs page, **42.3 KiB** on the issues index — all uncompressed. Off by roughly 10–20×. The claim's conclusion ("Go + Vite ships less JS than Astro") is not supported by the current numbers; the eager budget is already at the note's own "under 30 KB" target. |
| "Astro's component-island runtime (~30 KB) → replaced by direct script tags" | same note | **false for this codebase** | There are **no Astro islands** — no `@astrojs/react`/`vue`/`svelte` integration, no `client:*` directive anywhere, no `.tsx`/`.jsx` file. Every script is already a plain `<script src>`. There is no island runtime to remove. |
| "What stays unchanged: `default-docs/` folder shape" | `notes/architecture/01_overview.md` | **holds** | The `.meta.json` sidecar convention, `NN_` prefixes, `allow_diagram_pages` / `allow_artifact_pages` opt-outs are all on-disk conventions the server reads. Nothing about them is Astro-shaped. |
| "What this requires us to write: … Embed.FS asset serving with mtime/ETag caching" | `notes/architecture/01_overview.md` | **partly holds** | It names embedded *framework* assets. It does **not** name the three routes that serve **user content** — `/assets`, `/content-assets`, `/artifacts` (472 lines together) — which read from disk, not from `embed.FS`, and carry the containment + MIME + ETag logic. |
| Module layout in `notes/architecture/02_go-runtime.md` covers what Go owns | that note | **incomplete** | `internal/server/` lists `router.go`, `sse.go`, `assets.go`, `handlers.go`. There is **no** artifact route, no content-asset route, no MIME concern, no theme-injection step, no first-class-page scanner in `internal/content/`, and no mention of the vendored draw.io blob. A `grep -i` for `diagram\|mermaid\|excalidraw\|drawio\|artifact\|graphviz\|wasm\|lightbox` across all six `notes/architecture/*.md` returns **one incidental hit** ("built artifacts embedded into binary"). |
| "Island budget per route … Docs page: sidebar, outline, theme-toggle ~8 KB" | `notes/architecture/03_vite-frontend-and-dist.md` | **incomplete** | The per-route table omits diagrams, artifacts, lightbox, tooltip and code-labels entirely — 19.7 KiB of the current 28.8 KiB docs-page budget. The proposed 8 KiB budget for a docs page is not achievable while these surfaces exist. |
| "Vite never runs in production" / dist embedded at compile time | `notes/architecture/03_vite-frontend-and-dist.md` | **holds, and is compatible** | The `?url` import of the vendored blob and the four dynamic imports are all build-time concerns; nothing on this surface needs Vite at request time. |
| "The dev-toolbar UI … optionally rebuilt … or dropped from v1" | same note | **out of my scope** | Named here only because `diagrams:render` is dispatched from `dev-tools/editor/**` (two call sites) and listened for by `diagrams.ts` and `artifacts.ts`. If the editor is dropped from v1, those two listeners become dead code — a coupling the editor auditor should be told about. |

---

## 11 · Open questions

1. **Does the Go template inline small scripts, or not?** Today 6.1 KiB of JS
   (artifacts + code-labels + tooltip) arrives inside the HTML document. Keeping
   that behaviour needs a deliberate manifest-reading helper; dropping it costs
   three requests per page. Nobody has decided.
2. **What replaces `import.meta.env.DEV` for Cache-Control?** Straightforward in
   Go, but the dev-vs-prod split currently exists in three routes and one script,
   and the semantics (`no-cache` + ETag in dev, `max-age=31536000` in prod paired
   with a changing `?v=`) need to be stated once rather than re-derived per route.
3. **Is `text/html` scoping going to survive a port?** It is an *absence* in the
   current code — `.html` is missing from `lib/mime.ts` on purpose. Go's
   `mime.TypeByExtension(".html")` returns `text/html` by default. This will be
   reintroduced by accident unless someone writes it down as a requirement and
   tests it.
4. **Excalidraw's 4 MiB.** Not a migration question, but the migration is when
   someone will look at it. Is there a smaller entry point than the package root
   for `exportToSvg`, or should scenes be pre-exported to `.svg` at author time?
5. **Where does the vendored draw.io blob live in the new tree?** `frontend/src/vendor/`
   with a `?url` import (unchanged), or `//go:embed` in the Go tree? The first
   keeps the code identical; the second makes it visible in the binary-size story.
   `notes/architecture/04_distribution-single-binary.md`'s size budget should say
   which, because 3.91 MiB is a material fraction of the claimed ~25 MB binary.
6. **The structure/layout/theme/shell model and first-class non-markdown pages.**
   `notes/architecture-update/01_the-structure.md` says a *structure* owns "parsing
   rules · URL rules + slugs". Diagram and artifact pages are files that are not
   markdown and are discovered by a scanner living beside the markdown loader,
   sharing one collision pool. Which axis owns them in the new model is not
   answered anywhere.

---

## Confidence labels

| Claim class | Label |
|---|---|
| All line counts, file counts, package sizes | **measured** (`wc -l`, `find`, `du`, `stat`) |
| All bundle weights, chunk closures, gzip sizes, per-page eager JS | **measured** — from a fresh `npx astro build --outDir /tmp/aks-audit-dist` (exit 0, 14.6 s, 1,229 pages), parsed with Python |
| Artifact injection sizes (8,246 → 73,548 bytes) | **measured** |
| Behaviour of each script and route | **read** — I opened every file named in this report |
| Go rewrite line estimates | **assumed** — informed by reading the TypeScript, not by writing Go |
| "Nothing is fatal on this surface" | **read** — follows from every capability having a named Go equivalent or being pure browser code |
