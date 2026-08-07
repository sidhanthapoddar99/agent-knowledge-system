---
title: "Content pipeline and markdown rendering"
---

# Surface 1 — the content pipeline (markdown in, HTML out)

Audit of everything that turns a file on disk into the HTML string a layout
sets with `set:html`. Scope: `astro-doc-code/src/parsers/` plus the three
pipeline-adjacent loaders that produce page bodies without going through it
(`diagram-pages.ts`, `artifact-pages.ts`, `first-class-page.ts`) and the two
serving routes the pipeline's output URLs point at.

**The one thing that changes the migration decision.** This surface is the
cheapest major part of the engine to port and the least Astro-coupled: measured,
`src/parsers/` is **2,390 lines across 23 files** and imports **exactly four npm
packages** (`marked`, `marked-alert`, `shiki`, `gray-matter`) plus Node `fs` and
`path`. It contains **zero Astro API calls and zero Vite API calls** — not one
`import.meta.glob`, not one `astro:` import, not one `Astro.*` reference
(measured by grep over the whole folder). It is plain TypeScript that reads
files and returns strings. The single genuine fidelity risk in the whole surface
is **syntax highlighting**: Shiki uses TextMate grammars and produces dual
light/dark output via CSS custom properties, and Go's Chroma matches neither the
grammar set nor the output shape.

---

## 1. What exists

### 1.1 File map, with measured line counts

`wc -l` over `astro-doc-code/src/parsers/` — 23 files, 2,390 lines.

| File | Lines | Role |
|---|---:|---|
| `src/parsers/types.ts` | 186 | `ContentType`, `FileType`, `ProcessContext`, `Processor`, `LoadedContent`, `ContentData`, `LoadOptions`, `ContentSettings`, `FrontmatterSchema`, `ParserError` |
| `src/parsers/index.ts` | 89 | Barrel + `getParser(contentType)` factory |
| `src/parsers/core/base-parser.ts` | 300 | Abstract `BaseContentParser`: file read, frontmatter split, pipeline run, heading extraction, slug/id, yaml/json parse |
| `src/parsers/core/pipeline.ts` | 107 | `ProcessingPipeline` — ordered pre/post processor lists, `process(raw, ctx, render)` |
| `src/parsers/core/order-prefix.ts` | 115 | The `NN_` ordering-prefix grammar (2–5 digits, strict `_` and loose `[_-]` families), `MAX_SUBFOLDER_DEPTH = 5` |
| `src/parsers/core/index.ts` | 6 | Barrel |
| `src/parsers/content-types/docs.ts` | 106 | `DocsParser` — pipeline wiring, slug rules, asset resolver |
| `src/parsers/content-types/blog.ts` | 127 | `BlogParser` — date-from-filename, central `assets/<slug>/` resolver |
| `src/parsers/content-types/issues.ts` | 71 | `IssuesParser` — folder-relative resolver, extra `issue-body-links` pass |
| `src/parsers/content-types/index.ts` | 7 | Barrel |
| `src/parsers/preprocessors/asset-embed.ts` | 240 | `[[path]]` file inlining, incl. inside fenced code blocks; dependency reporting |
| `src/parsers/preprocessors/code-protect.ts` | 78 | Generic fence/inline-code protect+restore helper (**exported but no caller** — `asset-embed` inlines its own copy) |
| `src/parsers/preprocessors/index.ts` | 16 | Barrel |
| `src/parsers/renderers/marked.ts` | 192 | Three `Marked` factories, Shiki highlighter singleton, custom `code`/`listitem` renderers, `marked-alert` |
| `src/parsers/renderers/index.ts` | 12 | Barrel |
| `src/parsers/postprocessors/heading-ids.ts` | 84 | `<h1..h6>` → slugified `id=`, dedup counter |
| `src/parsers/postprocessors/internal-links.ts` | 203 | Relative page-link rewriting (docs full; blog/issues extension-strip only) |
| `src/parsers/postprocessors/issue-body-links.ts` | 114 | Issues-only re-rooting for the detail-page URL collapse |
| `src/parsers/postprocessors/diagram-embed.ts` | 91 | `<img src="*.excalidraw\|*.drawio">` → `.diagram` placeholder div with `data-src` + mtime cache-buster |
| `src/parsers/postprocessors/asset-src.ts` | 98 | Relative `<img src>` and colocated-file `<a href>` → `/content-assets/<path>` |
| `src/parsers/postprocessors/external-links.ts` | 99 | `target="_blank"` + `rel="noopener noreferrer"` |
| `src/parsers/postprocessors/table-wrap.ts` | 26 | `<table>` → `<div class="table-wrapper">…</div>` |
| `src/parsers/postprocessors/index.ts` | 23 | Barrel |

Pipeline-adjacent code that produces page bodies **without** the parser, and
therefore belongs on the same porting checklist:

| File | Lines | Role |
|---|---:|---|
| `src/loaders/artifact-pages.ts` | 287 | `NN_*.html` → first-class page; `.meta.json`/`.meta.jsonc` sidecar; `artifact.theme` mode; `embed_height`; slug-collision guard |
| `src/loaders/diagram-pages.ts` | 210 | `NN_*.{mmd,mermaid,dot,gv,excalidraw,drawio}` → first-class page; two container shapes |
| `src/loaders/first-class-page.ts` | 55 | Shared slug-collision resolver across md / diagram / artifact pools |
| `src/pages/content-assets/[...path].ts` | 116 | Serves colocated files; symlink containment, ETag/304, dev-vs-prod cache headers |
| `src/pages/artifacts/[...path].ts` | 216 | Serves artifact `.html` raw; `text/html` scoped here only; optional host-theme CSS injection |
| `src/pages/lib/mime.ts` | 23 | 17-entry extension → MIME map used by `content-assets` |
| `src/scripts/` (8 files) | 1,643 | Browser-side consumers of the pipeline's output markup — see §6 |
| `src/styles/markdown.css` | 940 | The CSS contract for every class this pipeline emits |
| `src/dev-tools/editor/renderer/index.ts` | 184 | A **second, browser-side reimplementation** of the renderer for the live-editor preview |

### 1.2 How a markdown file becomes HTML

```
file.md
  │
  ├─ fs.readFileSync (utf-8)                       base-parser.ts:115
  ├─ gray-matter → { data: frontmatter, content }  base-parser.ts:116
  ├─ frontmatterLineCount computed (error offsets) base-parser.ts:121-123
  │
  ├─ ProcessContext { filePath, fileDir, contentType, frontmatter,
  │                   basePath, frontmatterLineCount, embeddedFiles:Set }
  │
  ├─ await renderReady   ← Shiki highlighter singleton must resolve first
  │
  ├─ PIPELINE ────────────────────────────────────────────────────────┐
  │    preprocessors (markdown → markdown)                            │
  │      [1] asset-embed        [[path]] → file bytes inlined         │
  │    render (markdown → HTML)                                       │
  │      marked + marked-alert + custom code/listitem renderers       │
  │      code fences → Shiki dual-theme HTML, or .diagram div         │
  │    postprocessors (HTML → HTML, ordered)                          │
  │      [1] heading-ids                                              │
  │      [2] internal-links                                           │
  │     [2b] issue-body-links      ← issues pipeline only             │
  │      [3] diagram-embed         ← must precede asset-src           │
  │      [4] asset-src                                                │
  │      [5] external-links                                           │
  │      [6] table-wrap                                               │
  └────────────────────────────────────────────────────────────────── ┘
  │
  ├─ extractHeadings(html)   regex over the FINAL html   base-parser.ts:46-61
  ├─ generateSlug(relativePath, fileType)   per content type
  ├─ buildContentData(frontmatter, parsedFilename)
  └─ LoadedContent { id, slug, content, headings, data, filePath,
                     relativePath, fileType, embeddedFiles? }
```

Two ordering constraints are load-bearing and undocumented outside code
comments: `diagram-embed` **must** run before `asset-src` (it needs the
author-written relative src), and `heading-ids` **must** run before
`extractHeadings` (which only matches headings that already carry an `id`).

### 1.3 The capability × content-type matrix

The proposal's companion note
[02_known-issues-content-pipeline.md](../../../notes/architecture-update/02_known-issues-content-pipeline.md)
claims per-parser divergence. Divergence is real but **much smaller than the
note says** — three of its four bullets no longer describe the code. The measured
matrix, read from the three constructors:

| Capability | `DocsParser` | `BlogParser` | `IssuesParser` | Notes |
|---|---|---|---|---|
| `[[path]]` asset embed | ✅ default resolver | ✅ blog resolver | ✅ folder resolver | Three different resolvers, one processor |
| heading IDs | ✅ | ✅ | ✅ | identical |
| internal-links: strip `.md` | ✅ | ✅ | ✅ | non-docs take the early branch |
| internal-links: strip `NN_` prefixes, `/index`, diagram-page handling | ✅ | ❌ | ❌ | gated on `contentType === 'docs'` (`internal-links.ts:167`) |
| issue-body re-rooting | ❌ | ❌ | ✅ | fires only for `<id>/issue.md` |
| diagram-embed (`.excalidraw` / `.drawio` as `<img>`) | ✅ | ✅ | ✅ | identical |
| asset-src (`<img src>` and colocated `<a href>` → `/content-assets/`) | ✅ | ✅ | ✅ | identical |
| external-links | ✅ | ✅ | ✅ | identical |
| table-wrap | ✅ | ✅ | ✅ | identical |
| Shiki highlighting | ✅ | ✅ | ✅ | shared singleton |
| frontmatter schema validation | declared, **never called** | declared, **never called** | declared, **never called** | see §1.5 |

`IssuesParser` passes `'blog'` as its `contentType` to the base constructor
(`content-types/issues.ts:31`, with the comment *"issues are not a registered
ContentType"*). That is what routes it down the non-docs branch of
`internal-links`. It is a two-value union doing three jobs.

The `ContentType` union has a fourth member, `'page'`, which `getParser` maps to
`DocsParser` — **no call site ever passes it** (measured: `loadContent(` is called
at 5 sites, all with `'docs'` or `'blog'`).

### 1.4 Frontmatter — what the system actually reads

`gray-matter` is called at **6 sites** (measured): once in `base-parser.ts:116`
for every markdown page, four times in `loaders/issues.ts` for tracker metadata,
twice in `dev-tools/server/middleware.ts` for the editor.

Keys actually read anywhere in `src/` (measured by grepping `.data.<key>` and the
typed `fm` destructures in `issues.ts`):

| Key | Read by | Purpose |
|---|---|---|
| `title` | docs, blog, issues, subtasks, agent-log stages | Page/entry title; defaults to `'Untitled'` |
| `description` | docs, blog | Meta description; **absence emits a warning** |
| `sidebar_label` | docs sidebar | Sidebar row label |
| `sidebar_position` | docs sidebar | Overrides the `NN_` prefix value |
| `draft` | docs, blog, issues | Excluded from production builds |
| `date` | blog, comments, agent-log entries | Falls back to the filename date |
| `author` | blog, comments | Byline / avatar |
| `tags` | blog | Tag list |
| `image` | blog | Cover image |
| `status` | issue subtasks, plan stages, agent-log entries | Lifecycle state; **legacy `state:` still tolerated with a console warning** (`issues.ts:1316`) |
| `color` | issue notes / agent-log entries | Optional CSS colour tint |
| `agent` | agent-log entries | Which agent produced it |
| `outcome`, `notes` | plan stages | Rendered **inline** (`marked.parseInline`) into a table cell |
| `who` | plan stages | Owner |
| `subtasks` | plan stages | Ref list resolved to targets |

That is 15 keys. Nothing else in `src/` reads frontmatter; anything else an
author writes rides along in `ContentData`'s index signature and is ignored.

### 1.5 Frontmatter validation is declared and dead

`getFrontmatterSchema()` is an abstract method every parser implements, and
`validateFrontmatter()` reads it and throws `MISSING_FRONTMATTER`. **Measured:
neither is called anywhere outside the classes that define them.** The project's
"`title` frontmatter required in every doc file" rule (`CLAUDE.md`, Key Rules #3)
is therefore not enforced by the engine — a titleless page renders as
`'Untitled'`. Confidence: measured (grep across `src/`, empty result).

For a Go rewrite this is a free win, not a port: the schema data exists, the
enforcement does not, and wiring it up is ~20 lines.

### 1.6 Renderer configuration in detail

`renderers/marked.ts` exports **three** factories, all of which are live:

| Factory | Highlighting | Used by |
|---|---|---|
| `createMarkdownRendererAsync()` | Shiki, dual-theme | `BaseContentParser` — every docs / blog / issues page |
| `createMarkdownRenderer()` (sync) | none | `defaultRenderer` module-level export; `renderMarkdown()` helper |
| `createMarkedInstance()` | none | `issues.ts:687` for `parseInline` on `outcome:`/`notes:` |

`renderMarkdown()` (the sync, unhighlighted path) is used once for real content:
`src/layouts/issues/default/guide.ts:494` renders the bundled issue-anatomy
guide. So a fenced code block **inside the guide is not highlighted** while the
same block in an issue body is. Confidence: read.

Marked options, everywhere identical: `gfm: true`, `breaks: false`.

Three renderer overrides:

1. **`code({text, lang})`** — if `lang` ∈ `{mermaid, dot, graphviz}` emit
   `<div class="diagram diagram-{mermaid|graphviz}">` with HTML-escaped source
   for the client script to render. Otherwise Shiki-highlight, then string-patch
   the output: `html.replace('<pre class="shiki', '<pre data-language="…" class="shiki')`.
   That `data-language` attribute is what `src/scripts/code-labels.ts` (57 lines)
   turns into the hover label and copy button.
2. **`listitem(token)`** — task-list items are rewritten into
   `<li class="task-item"><span class="task-checkbox">…svg…</span><span class="task-content">…</span></li>`,
   and marked's own injected `<input type="checkbox">` is stripped with a regex.
   The tick is an inline SVG polyline. **Measured: 2,367 task-list items in the
   content corpus** — this is not a corner case.
3. **`marked-alert` plugin** — GFM alert blockquotes. Emits
   `.markdown-alert` + a per-type modifier class + a `.markdown-alert-title` row
   with an icon. **Measured usage: 82 alerts** (35 NOTE, 23 IMPORTANT, 12
   WARNING, 9 CAUTION, 3 TIP). `src/styles/markdown.css:181-215` styles them.

`MarkdownRendererOptions.extensions` exists as a hook for custom
`TokenizerAndRendererExtension`s. **No caller ever passes one** (measured).

### 1.7 Syntax highlighting — the Shiki configuration, measured

`getHighlighter()` in `renderers/marked.ts:41-58` creates one process-wide Shiki
instance:

- **Themes:** `github-light` and `github-dark`, both loaded, output via
  `themes: { light, dark }` — Shiki's dual-theme mode. This emits inline
  `style="color:#…;--shiki-dark:#…"` on every token span. Dark mode is a pure
  CSS switch: `markdown.css:63-67` does
  `[data-theme="dark"] .markdown-content .shiki span { color: var(--shiki-dark) !important }`.
  **No re-render, no second HTML payload.**
- **Requested languages:** 28, listed explicitly in the source.
- **Actually loaded language ids: 52** (measured by running `createHighlighter`
  with exactly that list and printing `getLoadedLanguages()`): the 28 plus
  aliases (`js`, `ts`, `py`, `rb`, `rs`, `md`, `kt`, `yml`, `sh`, `zsh`, `cjs`,
  `mjs`, `cts`, `mts`, `c++`, `shellscript`, `docker`, `gql`, `kts`) and
  transitively-embedded grammars (`glsl`, `haml`, `lua`, `regex`, `regexp`,
  `cpp-macro`).

Fence languages present in the corpus but **not** in that loaded set — these
render today with `lang: 'text'`, i.e. no colour at all (measured, both sides):

| Fence language | Blocks in corpus | Highlighted today? |
|---|---:|---|
| `astro` | 104 | ❌ falls back to `text` |
| `env` | 13 | ❌ |
| `jsonc` | 11 | ❌ |
| `nginx` | 6 | ❌ |
| `diff` | 2 | ❌ |
| `text` | 3 | ❌ (by definition) |

That is **139 unhighlighted fenced blocks out of the corpus today**. Worth
knowing before anyone treats highlighting fidelity as a hard constraint: the
current system already drops the single most-used non-highlighted language
(`astro`, 104 blocks) on the floor.

Highlighting is **build-time / server-side**, not runtime: `codeToHtml` runs
during `parseMarkdownFile`, the HTML is cached, and the browser receives finished
spans. Shiki also runs **client-side** in the live editor
(`dev-tools/editor/renderer/index.ts:34`, dynamic `import('shiki')`), which is a
separate surface.

Package weight, measured: `node_modules/shiki` 3.9 MB + `node_modules/@shikijs`
13 MB = **~17 MB** of the 419 MB `node_modules`.

### 1.8 Preprocessor: `[[path]]` asset embed, in detail

240 lines, and the most intricate single file in the surface. Seven ordered
steps inside one `process()`:

1. Protect fenced code blocks (`` ```…``` `` or `~~~…~~~`), recording each
   block's **start line** so error messages can point at a real line number.
2. Protect inline code (`` `…` ``).
3. Protect escaped `\[[…]]` (renders as literal `[[…]]`, for documentation).
4. Replace `[[path]]` outside code with the target file's bytes (`.trimEnd()`).
   Missing file → `addError({type:'asset-missing'})` into the error cache **and**
   a `console.warn`, and the literal `[[path]]` is left in place.
5. Restore escaped forms.
6. Restore inline code.
7. Restore fenced blocks **and run a second embed pass inside them** — with a
   different, narrower rule: inside a fence, a path is embedded only if it starts
   with `./` or `../` and contains no space or comma. This is what makes
   ` ```mermaid \n [[./assets/x.mmd]] \n``` ` work, and what stops the
   documentation examples in the user guide from being treated as embeds.

Every successful embed writes its absolute path into
`context.embeddedFiles`, which `LoadedContent.embeddedFiles` carries out to the
loaders as a **cache dependency** — without it, editing an embedded file would
never invalidate the page that inlined it (the page's own mtime is unchanged).
`issues.ts:670-674` forwards these into an `embedCollector`.

Measured corpus usage: **168 `[[…]]` embeds across 62 files.**

### 1.9 Postprocessors, in detail

All six are **regex over the HTML string**. There is no DOM, no HTML parser, no
tokeniser anywhere in this surface. That matters for the port (§4).

| Processor | Regex it drives on | What it does |
|---|---|---|
| `heading-ids` | `/<(h[1-6])(?:\s+([^>]*))?>([\s\S]*?)<\/\1>/gi` | Skips headings that already have `id=`. Slug = lowercase → strip HTML tags → drop everything not `[\w\s-]` → spaces to `-` → collapse `-` → trim. Duplicates get `-1`, `-2`, … via a per-document `Set`. **Non-ASCII and emoji are stripped entirely** — a heading of only emoji yields no slug and no id. |
| `internal-links` | `/<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi` | See §1.3. Docs branch: skip URI schemes (`mailto:` guard added because `mailto:guide.md` matched the markdown test), skip absolute/protocol/fragment, skip colocated non-page files, strip page extension (`.md`/`.mdx` **and** the six diagram extensions), strip `NN_` per segment, drop trailing `/index`. `isDiagramPageLink` mirrors the diagram loader's own rule (`NN_` prefix required, never inside `assets/`). |
| `issue-body-links` | same `<a href>` regex | Fires only when the file is exactly `<basePath>/<issue-id>/issue.md`. Re-roots each relative href at the issue folder and emits it relative to the tracker base, because the detail page is served one segment shallower than the file lives. |
| `diagram-embed` | `<img …src="…(\.excalidraw\|\.drawio)"…>` | → `<div class="diagram diagram-{kind}" data-src="/content-assets/…?v=<mtimeMs>" data-title="…">`. Title comes from `alt=`, else the prefix-stripped title-cased filename. `fs.existsSync` + `fs.statSync` — this postprocessor touches the filesystem. Missing file → an inline `.diagram-error` div **and** an entry in the error cache. |
| `asset-src` | `<img src>` then `<a href>` | Resolves the relative path against `fileDir`, finds the longest matching **content root** from `getPathsByCategory('content')`, and emits `/content-assets/<path-relative-to-that-root>`. Leaves `http`, `//`, `/`, `data:`, `@`, `#`, and anything outside every content root alone. The `<a>` pass fires for any href whose extension is not `.md`/`.mdx`. |
| `external-links` | same `<a href>` regex | Adds `target="_blank"` and `rel="noopener noreferrer"` when absent. `internalDomains` option exists; no caller sets it. |
| `table-wrap` | `/<table\b[\s\S]*?<\/table>/gi` | Wraps in `<div class="table-wrapper">`. Non-greedy, so a **nested table would be wrapped at the inner `</table>`** and produce broken nesting. Measured: 928 tables in the corpus; nesting not checked. |

`internal-links.ts` carries a 30-line header comment documenting an **open
defect**: it emits a browser-relative href, and whether that resolves depends on
whether the serving host appends a trailing slash, which this code cannot know.
A `../` shift was added 2026-08-03 and removed 2026-08-04. `trailingSlash:
'always'` was tried and rejected because it 404s the `/artifacts/<file>.html`
route. The stated fix is root-absolute resolution through a build-time path map —
**work the Go rewrite would have to do anyway, and would be well placed to do.**

### 1.10 Content that bypasses the pipeline entirely

Three page kinds never see a preprocessor, a renderer, or a postprocessor. Their
`LoadedContent.content` is a hand-built HTML string.

**Diagram pages** (`loaders/diagram-pages.ts`, 210 lines). `NN_`-prefixed
`.mmd`/`.mermaid`/`.dot`/`.gv`/`.excalidraw`/`.drawio` become first-class docs
pages. Two shapes by transport: mermaid and graphviz are text DSLs inlined
HTML-escaped into `<div class="diagram diagram-{kind}">`; excalidraw and drawio
get `data-src="/content-assets/…?v=<mtimeMs>"` and are fetched client-side. Never
scans `assets/`. Missing `NN_` prefix → warning + skip.

**Artifact pages** (`loaders/artifact-pages.ts`, 287 lines). `NN_*.html` in a
docs section (and in tracker `notes/` / `brainstorm/`) become first-class pages.
The page body is **not the HTML** — it is a by-reference placeholder:

```
<div class="artifact artifact-html"
     data-src="/artifacts/<path>?v=<mtimeMs>"
     data-title="…"
     style="height:…">
</div>
```

`src/scripts/artifacts.ts` (258 lines) turns that into an `<iframe>`. The same
document is therefore both embedded in the docs content area and openable
full-page at `/artifacts/<path>`. So: **artifact HTML never touches the markdown
pipeline in either direction.** It is served raw by
`src/pages/artifacts/[...path].ts`, with two engine-interpreted knobs from the
`.meta.json`/`.meta.jsonc` sidecar:

- `artifact.theme: "site"` → the route rewrites the served HTML to inject the
  active resolved theme CSS before `</head>`, plus a dark-mode init script.
  `"self"` (the default, and the legacy `"self-world"`) → served byte-identical
  to disk.
- `embed_height` → `"full"` (default) | CSS length | `"n/m"` aspect | pixel number,
  translated to an inline style on the container.

Everything else under `artifact:` is an **opaque passthrough** the loader copies
onto `entry.data.artifact` and never parses.

`text/html` is set locally on that route and deliberately kept out of the shared
MIME map, so a stray `.html` anywhere in content is not executable first-party
HTML on the site origin. That is a security decision encoded in route topology,
and it has to survive the port.

**Slug-collision handling** (`loaders/first-class-page.ts`, 55 lines) — markdown,
diagram and artifact entries share one slug pool; a collision renders an explicit
error block at that slug rather than picking a winner.

Measured corpus: **11 artifact `.html` files** outside `assets/`.

---

## 2. What it depends on

### 2.1 npm packages

Only four packages are imported by anything under `src/parsers/`. Measured by
grepping the import statements of all 23 files.

| Package | Version | Where | Portability |
|---|---|---|---|
| `marked` | 17.0.1 | `renderers/marked.ts` | **portable** (pure JS, no Node/browser API) |
| `marked-alert` | 2.1.2 | `renderers/marked.ts` | **portable** |
| `shiki` | 3.22.0 | `renderers/marked.ts` | **portable** (WASM/JS regex engine; runs in Node and browser) |
| `gray-matter` | 4.0.3 | `core/base-parser.ts` | **portable** (bundles `js-yaml`) |
| `js-yaml` | 4.1.0 | `core/base-parser.ts` (`.yaml` page bodies) | **portable** |
| `glob` | 11.0.0 | not in `parsers/`; used by `diagram-pages.ts` / `artifact-pages.ts` / `data.ts` | **Node-only** (fs traversal) |

Node built-ins used in the surface: `fs` (read, `existsSync`, `statSync`),
`path` / `node:path`, `crypto` (in the artifacts route only). All **Node-only**,
all with direct Go equivalents.

### 2.2 Astro-specific APIs in this surface

**Measured: none.** `grep -rn "astro:\|Astro\.\|import.meta.glob\|defineCollection\|getCollection" src/parsers/` returns nothing. `src/content/` (Astro content
collections) does not exist. No `.astro` file is imported by any parser file.

Two Astro touch-points sit at the boundary, not inside it:

- `import.meta.env.PROD` in `loaders/data.ts:147` (draft filtering). Vite-provided,
  trivially replaced by a Go build flag.
- `astro.config.mjs` declares `markdown: { shikiConfig: { theme: 'github-dark', wrap: true } }`.
  **This is dead configuration.** Astro's markdown pipeline only fires for `.md`
  files Astro itself imports; measured, there are no `.md` imports in any
  `.astro`/`.ts` file, no content collections, and no `import.meta.glob` over
  markdown. Every page body in this project is produced by the custom
  `marked` pipeline. Anyone porting should not spend a minute on `shikiConfig`.

### 2.3 MDX — declared, unused

`@astrojs/mdx@^4.3.13` is in `dependencies` and `mdx()` is registered in
`astro.config.mjs:integrations`. **Measured: zero `.mdx` files exist anywhere in
the repo** (`find . -name "*.mdx" -not -path "*/node_modules/*"` → empty). The
`mdx` extension appears in **13 source files** purely as a defensive alternation
in regexes and glob patterns (`**/*.{md,mdx}`, `/\.(mdx|md)$/`).

Concretely: `.mdx` files, if any existed, would be read as **plain markdown** by
`marked` — JSX expressions and component imports would render as literal text or
be mangled. The MDX integration is registered but never handles a file.

**For the port this is a deletion, not a port.** But note what it removes as a
*possibility*: MDX is the only route by which an author could embed a component
in a page today, and it is not actually available.

### 2.4 Vite-specific behaviour

None in the surface. The only Vite dependency in the vicinity is
`import.meta.env.PROD` (above) and the alias map in `astro.config.mjs`
(`@parsers`, `@loaders`, …) — build-time path resolution, replaced by Go package
imports.

### 2.5 Browser APIs the pipeline's output depends on

The pipeline emits markup that is inert until client scripts pick it up. These
are **browser-side and survive any server** — they are Vite-bundle concerns, not
Go concerns:

| Emitted markup | Client consumer | Lines |
|---|---|---|
| `<div class="diagram diagram-mermaid\|graphviz">` | `src/scripts/diagrams.ts` → `mermaid` 11.12.2 / `@hpcc-js/wasm-graphviz` 1.21.0 | 157 |
| `<div class="diagram diagram-excalidraw" data-src>` | `src/scripts/diagrams.ts` → `@excalidraw/excalidraw` 0.18.1 (React 19) | — |
| `<div class="diagram diagram-drawio" data-src>` | `src/scripts/drawio.ts` | 282 |
| `<div class="artifact artifact-html" data-src>` | `src/scripts/artifacts.ts` (builds the iframe) | 258 |
| `<pre data-language="…">` | `src/scripts/code-labels.ts` (label + copy button) | 57 |
| diagram containers | `src/scripts/diagram-actions.ts`, `panzoom.ts`, `lightbox.ts` | 277 / 204 / 320 |
| `data-tip` attributes | `src/scripts/tooltip.ts` | 88 |
| `.shiki span` + `--shiki-dark` | `src/styles/markdown.css:63-67` | — |

Total client-side: **1,643 lines across 8 scripts**, all of which the Go runtime
would ship unchanged inside the Vite bundle.

---

## 3. What a Go rewrite costs

### 3.1 Capability-by-capability

| Capability | Go equivalent | Port shape | Confidence |
|---|---|---|---|
| Markdown → HTML (CommonMark + GFM) | `github.com/yuin/goldmark` + `extension.GFM` | straight port; goldmark gives tables, strikethrough, autolinks, task lists free | read |
| Task-list custom markup (`.task-item` + SVG) | goldmark `NodeRenderer` override for `east.TaskCheckBox` + `ast.ListItem` | small custom renderer, ~60 lines | read |
| GFM alerts (`> [!NOTE]`) | **no first-party goldmark extension**; `go-goldmark-alerts`-style third-party, or write one | custom extension over `ast.Blockquote`, ~120 lines. Must match `marked-alert`'s exact class names + the SVG icon per type, or `markdown.css:181-215` breaks | read |
| Footnotes | `extension.Footnote` | free (9 refs in corpus) | read |
| Definition lists | **not in goldmark core**; `mangoumbrella/goldmark-figure`-class third-party or custom | not used in the corpus today — check before paying for it | assumed |
| Raw HTML passthrough | `goldmark.WithRendererOptions(html.WithUnsafe())` | one line — but it is a **deliberate trust decision**; marked passes raw HTML by default today. Measured: 52 raw HTML blocks in the corpus (`<div>`×29, `<a>`×14, `<img>`×5, `<span>`×2, `<details>`×2) | measured |
| `parseInline` (frontmatter one-liners) | goldmark has no inline-only entry point; render then strip the `<p>` wrapper, or drive the inline parser directly | small redesign, ~30 lines | read |
| Syntax highlighting | `github.com/alecthomas/chroma/v2` | **redesign, with fidelity loss** — see §3.2 | read |
| Frontmatter | `github.com/adrg/frontmatter` or `gopkg.in/yaml.v3` after a manual `---` split | straight port; 15 keys, all scalars/lists | read |
| `[[path]]` embeds incl. inside fences | plain Go string work + `regexp` | straight port, but see §3.3 on regex dialect | read |
| Heading IDs + dedup | goldmark `parser.WithAutoHeadingID` **or** a custom `IDs` implementation | goldmark's default slugger differs from this code's (goldmark keeps unicode, this strips it) — must supply a custom `parser.IDs` to keep existing anchors stable | read |
| Heading extraction for the outline | goldmark AST walk — **strictly better than today's regex** | free improvement | read |
| internal-links / issue-body-links / asset-src / diagram-embed / external-links / table-wrap | `golang.org/x/net/html` AST transforms, or goldmark AST transforms | **redesign, and the right one** — see §3.3 | read |
| Content-root resolution (`getPathsByCategory('content')`) | `filepath` + the ported config loader | straight port | read |
| Error/warning cache (`addError`, `addWarning`) | a struct + mutex | straight port | read |
| `embeddedFiles` cache-dependency contract | a `map[string]struct{}` on the render context | straight port | read |
| Diagram-page bodies | `text/template` + `os.Stat` | straight port | read |
| Artifact-page bodies + sidecar | `encoding/json` (needs a JSONC-tolerant reader for `.meta.jsonc`) | straight port; JSONC needs `tailscale.com/util/jsonc` or `hujson` | read |
| Theme-CSS injection into artifact HTML | string insert before `</head>` | straight port | read |
| Serving routes (`/content-assets`, `/artifacts`) with ETag/304, symlink containment | `net/http` + `http.ServeContent` | **easier in Go than today** | read |

### 3.2 Syntax highlighting — the honest fidelity assessment

This is the one place where "port" is the wrong word.

| Dimension | Shiki today | Chroma | Consequence |
|---|---|---|---|
| Grammar engine | TextMate grammars (the same ones VS Code ships) | hand-written Go lexers | Different tokenisation for the same file. Chroma lexers are coarser: they typically distinguish keyword / string / comment / number well and struggle with embedded languages |
| Embedded languages | Yes — the reason 52 grammars load from a 28-item request (`glsl` inside GLSL-in-JS, `haml`, `cpp-macro`) | No general mechanism | HTML with inline `<script>`/`<style>` highlights worse; markdown-in-markdown likewise |
| Grammar count available | ~200 via `shiki` bundles | ~250 lexers in Chroma | Coverage on paper is comparable |
| Coverage of what the corpus uses | 28 requested / 52 loaded; **`astro`, `env`, `jsonc`, `nginx`, `diff` unhighlighted (139 blocks)** | Chroma **has** `nginx`, `diff`, `docker`, `json` — and **no `astro` lexer** | Chroma would *gain* `nginx`+`diff` (8 blocks) and still lose `astro` (104 blocks). Net: roughly a wash, tilted slightly in Chroma's favour |
| Theme format | VS Code / TextMate JSON themes (`github-light`, `github-dark`) | Chroma's own `.xml` style format, plus a converter for TextMate themes | The two named themes must be re-sourced. `github-dark`/`github-light` do not exist in Chroma's built-in style list under those names; closest built-ins are `github` and `github-dark` (Chroma does ship a `github-dark`), but **the token colours will not match byte-for-byte** |
| Dual light/dark in one HTML payload | Native: `themes:{light,dark}` emits `style="color:#X;--shiki-dark:#Y"` | **Not supported.** Chroma emits one theme per render | **Must be rebuilt by hand**: render twice and diff, or post-process Chroma's inline styles to add a `--shiki-dark` custom property per span. This is the concrete, non-optional work item |
| Output shape | `<pre class="shiki …" style="…"><code><span class="line">…` | `<pre class="chroma"><code><span class="line">…` with `class="k"`/`"s"` short classes or inline styles | `markdown.css:43-100` and `scripts/code-labels.ts` both key off `.shiki` and `data-language`. Either the Go renderer mimics Shiki's shape, or ~60 lines of CSS + the label script change |
| Runtime cost | ~151 ms one-time init (measured), then in-process | Zero init, in-process | Go wins |

**Recommended shape if the migration goes ahead:** wrap Chroma with a custom
HTML formatter that emits Shiki's class and attribute shape (`class="shiki"`,
`data-language`, `--shiki-dark` per span, `.line` spans). That is roughly 150–250
lines of Go and it makes `markdown.css` and `code-labels.ts` port with zero
edits. Doing it any other way means touching the CSS contract, which is Surface
"theming"'s problem, not this one.

### 3.3 The regex-vs-DOM question

All six postprocessors are regex over an HTML string. Go's `regexp` is **RE2**,
which deliberately lacks features these patterns use. Measured — every
occurrence, by exact grep:

| Construct | Site | Pattern | Why it matters |
|---|---|---|---|
| backreference `\1` | `postprocessors/heading-ids.ts:58` | `/<(h[1-6])(?:\s+([^>]*))?>([\s\S]*?)<\/\1>/gi` | matches the closing tag to the opening one |
| backreference `\1` | `core/base-parser.ts:47` | `/<h([1-6])[^>]*\s+id=…>([\s\S]*?)<\/h\1>/gi` | heading extraction for the outline |
| backreference `\1` | `preprocessors/asset-embed.ts:53` | ``/(`{3,}\|~{3,})[\s\S]*?\1/g`` | **fence protection** — matches a closing fence of the same length and character |
| backreference `\1` | `preprocessors/code-protect.ts:31, 75` | same fence pattern | the unused helper's copy |
| negative lookbehind `(?<!\\)` | `preprocessors/asset-embed.ts:146` | `/(?<!\\)\[\[([^\]]+)\]\]/g` | skip escaped `\[[…]]` inside a fence |

So a literal regex transliteration **will not compile in Go**. Confidence:
measured. The fence-protection one is the awkward one — matching a closing
fence of the same run-length is exactly what a backreference is for, and in Go
it becomes a hand-written scanner (or, better, disappears entirely because
goldmark tokenises fences properly).

That is not bad news. The right Go implementation is not regex at all: parse the
rendered HTML with `golang.org/x/net/html` and walk the node tree, or — better —
do the link/image/table transforms as **goldmark AST transformers before
rendering**, which is where they belong and which eliminates the ordering
constraints (`diagram-embed` before `asset-src`) as a class.

**But there is a behaviour-difference trap.** `golang.org/x/net/html` is a full
HTML5 parser: it *normalises*. Given the raw HTML that markdown authors embed
(52 blocks measured), it will insert implied `<tbody>`, close unclosed tags,
reorder misplaced content, and drop stray closers. Today's regex approach passes
all of that through untouched. Two specific consequences to expect:

1. **`table-wrap` gets better.** The current non-greedy regex would mis-wrap a
   nested table; a DOM walk cannot.
2. **Raw HTML in content may come out different.** A `<details>` block or a hand
   written `<div>` with sloppy nesting renders as authored today and will render
   as *normalised* after the port. Whether any of the 52 blocks is affected is
   unverified — this is the concrete diff-test the port owes.

### 3.4 Effort estimate

Measured basis: 2,390 lines of parser plus 552 lines of pipeline-adjacent
loaders plus 332 lines of serving routes = **3,274 lines of TypeScript** in
scope. Go is typically 1.2–1.6× more lines for the same logic (explicit error
handling, no destructuring), so **~4,000–5,200 lines of Go**, minus what
goldmark gives free (the whole `marked` layer, ~200 lines) and plus what has to
be built that does not exist today (the Chroma→Shiki-shape formatter, the alerts
extension, the AST-transform framing).

**Estimate: 3–5 weeks for one engineer**, split roughly:

| Work item | Estimate |
|---|---|
| goldmark setup, GFM, footnotes, task-list renderer, heading IDs with the existing slug rule | 3–4 days |
| GFM alerts extension matching `marked-alert`'s exact output | 2–3 days |
| Chroma + custom Shiki-shape dual-theme formatter | 5–8 days (**the single biggest line item, and the one with the most rework risk**) |
| `[[path]]` embed preprocessor incl. the in-fence pass and the dependency sink | 3–4 days |
| Six postprocessors as AST transforms + the pipeline/structure model | 5–7 days |
| Frontmatter, `LoadedContent`, slug generation, `NN_` grammar, YAML/JSON page bodies | 2–3 days |
| Diagram pages, artifact pages, sidecars, slug-collision pool | 3–4 days |
| Serving routes with ETag/symlink containment/theme injection | 2–3 days |
| Golden-output diff harness against the current renderer over all 1,023 corpus files | 3–5 days |

That last line is not optional and is usually the one that gets cut. With 1,023
markdown files, 4.00 MB of source producing 6.71 MB of HTML (measured), a
byte-diff harness is the only way to know the port did not silently change 900
pages.

### 3.5 Performance — what is actually measurable today

**Measured** on this machine, rendering the full corpus through `marked` +
`marked-alert` + Shiki with the project's exact config (frontmatter stripped by
`gray-matter`, pre/postprocessors excluded):

| Metric | Value |
|---|---|
| Markdown files | 1,023 |
| Source size | 4.00 MB |
| Rendered HTML size | 6.71 MB |
| Shiki highlighter init (one-time) | 151 ms |
| Full-corpus render | 1,392 ms |
| **Mean per file** | **1.36 ms** |

The proposal's `01_overview.md` claims "Markdown re-render on save: 150–400 ms
today → 30–80 ms in Go". The 150–400 ms figure is **not the renderer** — a single
file renders in 1.36 ms mean. Whatever costs 150–400 ms on save lives in the
loader, the cache, or Astro's SSR round-trip, not here. A Go port of *this
surface* would move ~1.36 ms/file to maybe ~0.3 ms/file; that is real but it is
not where the claimed win comes from. Anyone using that row to justify the
migration is attributing the saving to the wrong layer.

---

## 4. What is lost or degraded

| Item | Severity | Why | Mitigation |
|---|---|---|---|
| Shiki dual light/dark in one payload | **major** | Chroma renders one theme per pass; the entire dark-mode code-block story is `--shiki-dark` custom properties emitted inline by Shiki | Write a custom Chroma HTML formatter that renders both themes and emits `color:#X;--shiki-dark:#Y` per span. ~150–250 lines of Go, and then `markdown.css` needs no edit |
| TextMate grammar fidelity | **major** | Chroma lexers are hand-written and coarser; embedded-language highlighting (HTML with inline JS/CSS, markdown-in-markdown) degrades visibly | None that keeps Go single-binary. The alternatives — shelling to a Node sidecar, or embedding a JS engine — give back the whole reason for the migration. Accept it, or pre-render highlighting at build time with Shiki and embed the result (a real option, since highlighting is already build-time) |
| `astro` fence highlighting | **none** | 104 blocks, **already unhighlighted today** | — |
| `nginx`, `diff` fence highlighting | **none** (improves) | Chroma has lexers for both; Shiki config does not load them | — |
| `github-light` / `github-dark` exact token colours | **minor** | Chroma's `github-dark` is a different hand-authored style; colours will shift | Convert the two VS Code theme JSONs to Chroma XML at build time — Chroma ships a TextMate-theme converter |
| MDX | **none** | Declared dependency, registered integration, **zero `.mdx` files**. Nothing is lost because nothing uses it | Delete `@astrojs/mdx` from `dependencies` in the current tree too — it is 100% dead weight today |
| Component-in-markdown as a *future* capability | **minor** | MDX was the only path to it and it is unused/unwired. After the port, adding it means writing a goldmark extension rather than turning on an existing integration | The artifact `.html` mechanism already covers the real use case (rich embedded documents), and it survives untouched |
| Regex transliteration of the postprocessors | **minor** | Go's RE2 lacks the five backreferences and one lookbehind this surface uses (full list in §3.3) | Do not transliterate. Use `golang.org/x/net/html` or goldmark AST transforms — which the architecture notes already call for |
| Raw HTML passthrough behaviour | **minor** | `golang.org/x/net/html` normalises; today's regex passes authored HTML through byte-identical. 52 raw HTML blocks measured in the corpus | Golden-diff those 52 blocks specifically before switching. Alternatively do the transforms as goldmark AST transforms (before HTML serialisation), where raw HTML nodes stay opaque |
| Heading anchor stability | **minor** | goldmark's default auto-ID keeps unicode and uses a different dedup scheme; this code strips non-`[\w\s-]` and dedups with `-1`, `-2` | Supply a custom `parser.IDs` implementation replicating `heading-ids.ts`'s `slugify` + `ensureUniqueId` exactly. ~25 lines. **Skipping this silently breaks every `#anchor` link in the corpus** |
| `[[path]]` embed semantics | **none** | Pure string work; no library involved | Straight port. Keep the seven-step ordering and the in-fence narrower rule |
| Artifact `.html` pipeline | **none** | Artifacts bypass the renderer entirely — a loader builds a placeholder div and a route serves the file | Straight port. The `text/html`-scoped-to-one-route security decision must be carried over deliberately |
| Diagram pages / embeds | **none** | Server side is a template + `os.Stat`; all rendering is browser-side (mermaid, excalidraw, drawio, graphviz-wasm) and ships in the Vite bundle either way | Straight port |
| Error/warning collection with accurate line numbers | **none** | The frontmatter-line-offset arithmetic in `base-parser.ts:121` and `asset-embed.ts` is plain counting | Straight port — and goldmark gives real source positions, which is better than the current `indexOf`-based line finder |
| `parseInline` for `outcome:` / `notes:` frontmatter | **minor** | goldmark has no inline-only public entry point | Render and strip the outer `<p>`, or drive `parser.Parse` on an inline-only context. ~30 lines |
| Second renderer in the live editor | **none** (out of scope here) | `dev-tools/editor/renderer/index.ts` (184 lines) is browser-side `marked`+`shiki` and stays in the Vite bundle | But note it means **`marked` and `shiki` do not leave the dependency tree** — they move from the server to the client bundle. The "no npm at runtime" claim holds; the "delete marked/shiki" one does not |

---

## 5. Claims from the architecture notes, checked against the code

| Claim | Source | Verdict | Evidence |
|---|---|---|---|
| "Markdown pipeline (goldmark + custom extensions for our tags)" is on the *write* list | [01_overview.md](../../../notes/architecture/01_overview.md) | **holds** | Correctly scoped. The custom extensions needed are: alerts, task-list markup, and the Shiki-shape highlighter |
| "Asset embeds (`[[path]]`): registered for docs + blog, *never* for issues — `IssuesParser.getAssetPath()` existed as dead code, nothing called it" | [02_known-issues-content-pipeline.md](../../../notes/architecture-update/02_known-issues-content-pipeline.md) | **false** | `content-types/issues.ts:33-35` registers `createAssetEmbedPreprocessor({ resolvePath: (f,a) => this.getAssetPath(f,a) })`. The method is live |
| "Image srcs: *no* content type rewrites relative `<img src>`" | same | **false** | `assetSrcPostprocessor` is registered in all three parsers (`docs.ts:39`, `blog.ts:40`, `issues.ts:45`) and rewrites `<img src>` **and** colocated `<a href>` to `/content-assets/…` |
| "Custom tags (`src/custom-tags/`): wired into no parser at all — infrastructure without wiring" | same | **false** | `src/custom-tags/` **does not exist**. `find . -type d -name custom-tags -not -path "*/node_modules/*"` returns nothing repo-wide. There is no custom-tag infrastructure to wire |
| "Internal links: full relative-link resolution is gated to `contentType === 'docs'`" | same | **holds** | `internal-links.ts:167` — the only surviving accurate bullet of the four |
| "Three path-resolution mental models exist for the same authoring problem" | same | **holds** | `DocsParser.getAssetPath` (file-relative), `BlogParser.getAssetPath` (central `assets/<slug>/`), `IssuesParser.getAssetPath` (folder-relative with `assets/` fallback) |
| "Every parser re-declares its pipeline by hand" | same | **holds** | Three constructors, each with its own `.addPostprocessor()` chain; six of the seven steps are identical text in all three |
| "Markdown re-render on save: 150–400 ms today" | [01_overview.md](../../../notes/architecture/01_overview.md) performance table | **false as an attribution** | Measured: 1.36 ms mean per file for the full render (1,392 ms / 1,023 files). Whatever costs 150–400 ms is not the markdown pipeline |
| "What stays unchanged: `default-docs/` folder shape, tracker schema (settings.json, frontmatter, agent-log/comments)" | [01_overview.md](../../../notes/architecture/01_overview.md) | **holds** for this surface | The pipeline reads 15 frontmatter keys, all scalars/lists; nothing about the on-disk shape is Astro-derived |
| Implicit: MDX is part of the stack (`@astrojs/mdx` is a declared dependency) | `package.json` | **false in practice** | Zero `.mdx` files repo-wide; the integration handles nothing. `.mdx` appears in 13 source files only as regex/glob defensive alternation |

---

## 6. Open questions for whoever owns the decision

1. **Is byte-identical HTML a requirement, or is "visually equivalent" enough?**
   The answer changes the Chroma work from ~5 days to ~15. If byte-identical is
   required for the code-block markup, the only reliable route is to keep Shiki
   as a **build-time** step (it already is one) and embed pre-highlighted output
   — which is architecturally possible but reintroduces Node into the release
   pipeline.
2. **Do the 52 raw-HTML blocks in the corpus survive `golang.org/x/net/html`
   normalisation unchanged?** Unverified. One afternoon with a diff harness
   settles it.
3. **Should the internal-link defect be fixed *as part of* the port, or before
   it?** `internal-links.ts` documents a live production/dev divergence with a
   named fix (root-absolute resolution through a path map). Fixing it in Astro
   first gives a stable golden output to diff against; fixing it during the port
   means the diff harness has two variables.
4. **`ContentType` has four members, one unused (`'page'`), and `IssuesParser`
   lies about being `'blog'` to get the right link behaviour.** The
   architecture-update model would replace this with self-registering structures.
   Is that in scope for the port, or does the port carry the lie forward and the
   restructure land after?
5. **`.yaml` / `.json` page bodies are unreachable — confirm before porting
   them.** `BaseContentParser.parseYamlFile` / `parseJsonFile` (~50 lines) are
   reachable through `parse()`, but measured, **all five `loadContent()` call
   sites pass a `{md,mdx}` glob** (`route-match.ts:115,144`,
   `static-paths.ts:64,82`, `blogs/default/IndexBody.astro:18`), so no `.yaml`
   or `.json` file ever reaches the parser. `default-docs/data/pages/` holds
   YAML custom-page data, but that is loaded by the config layer, not here.
6. **Is `preprocessors/code-protect.ts` (78 lines) worth porting?** It is
   exported, has no caller, and `asset-embed.ts` reimplements the same logic
   inline. Porting it would be porting dead code.
