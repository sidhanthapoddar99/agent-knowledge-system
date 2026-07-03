---
title: "Step 2.3: Post-processing"
description: Postprocessors that enhance HTML output after rendering
sidebar_position: 6
---

# Post-processing

**Folder:** `src/parsers/postprocessors/`

Postprocessors run **after** HTML rendering to enhance the output.

## Role in the Pipeline

```
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
 ┌─────────────────┐      ┌─────────────────┐     ┌────────────────────┐
 │  PREPROCESSORS  │      │    RENDERERS    │     │ POSTPROCESSORS     │
 │                 │ ──>  │                 │ ──> │ <── YOU ARE HERE   │
 │                 │      │                 │     │ • heading-ids      │
 │                 │      │                 │     │ • internal-links   │
 │                 │      │                 │     │ • excalidraw-embed │
 │                 │      │                 │     │ • asset-src        │
 │                 │      │                 │     │ • external-links   │
 │                 │      │                 │     │ • table-wrap       │
 └─────────────────┘      └─────────────────┘     └────────────────────┘
```

## Postprocessor Files

| File | Purpose |
|------|---------|
| `heading-ids.ts` | Adds IDs to headings for anchor links |
| `internal-links.ts` | Rewrites relative links to match generated slugs |
| `issue-body-links.ts` | Issues only: re-roots `issue.md` links for the detail-URL collapse |
| `excalidraw-embed.ts` | Converts `![x](./y.excalidraw)` images into client-rendered diagram placeholders |
| `asset-src.ts` | Rewrites relative `<img src>` and `<a href>` to colocated files → `/content-assets/…` URLs |
| `external-links.ts` | Adds security attributes to external links |
| `table-wrap.ts` | Wraps tables in a scroll container for horizontal overflow |
| `index.ts` | Module exports (`excalidraw-embed` is imported directly by the content types, not barrel-exported) |

## Available Postprocessors

### Heading IDs

Automatically adds IDs to headings for anchor links:

```html
<!-- Input -->
<h2>Getting Started</h2>

<!-- Output -->
<h2 id="getting-started">Getting Started</h2>
```

This enables:
- Direct linking to sections via `#getting-started`
- Table of contents generation
- In-page navigation

**Usage:**

```typescript
import { headingIdsPostprocessor, createHeadingIdsPostprocessor } from '@parsers/postprocessors';

// Use default
pipeline.addPostprocessor(headingIdsPostprocessor);

// Or create with options
const customHeadingIds = createHeadingIdsPostprocessor({
  prefix: 'section-',  // Add prefix to all IDs
});
```

### Internal Links

Rewrites relative markdown links to match the generated URL slugs by stripping `NN_` position prefixes and `.md`/`.mdx` file extensions:

```html
<!-- Input -->
<a href="./02_consensus-mechanism.md">Consensus</a>
<a href="../03_advanced/01_setup.md#config">Setup</a>

<!-- Output -->
<a href="./consensus-mechanism">Consensus</a>
<a href="../advanced/setup#config">Setup</a>
```

**What it does:**

| Transform | Before | After |
|-----------|--------|-------|
| Strip `.md`/`.mdx` extension | `./guide.md` | `./guide` |
| Strip `NN_` prefix | `./02_getting-started` | `./getting-started` |
| Strip `/index` suffix | `./section/index` | `./section` |
| Preserve fragments | `./02_guide.md#setup` | `./guide#setup` |
| Skip absolute URLs | `https://example.com` | *(unchanged)* |
| Skip root-relative | `/docs/guide` | *(unchanged)* |

**Content-type behavior:**
- **Docs:** Strips both `NN_` prefixes and extensions
- **Blog:** Only strips `.md`/`.mdx` extensions (no `NN_` prefixes)

**Usage:**

```typescript
import { internalLinksPostprocessor } from '@parsers/postprocessors';

pipeline.addPostprocessor(internalLinksPostprocessor);
```

### External Links

Adds security attributes to external links:

```html
<!-- Input -->
<a href="https://example.com">Link</a>

<!-- Output -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>
```

**Security Attributes:**

| Attribute | Purpose |
|-----------|---------|
| `target="_blank"` | Opens in new tab |
| `rel="noopener"` | Prevents `window.opener` access |
| `rel="noreferrer"` | Prevents referrer header |

**Usage:**

```typescript
import { externalLinksPostprocessor, createExternalLinksPostprocessor } from '@parsers/postprocessors';

// Use default
pipeline.addPostprocessor(externalLinksPostprocessor);

// Or create with options
const customExternalLinks = createExternalLinksPostprocessor({
  excludeDomains: ['example.com'],  // Don't mark as external
});
```

### Excalidraw Embeds

`excalidraw-embed.ts` turns image syntax pointing at a `.excalidraw` file into
a placeholder the client-side diagram script renders:

```html
<!-- Input (marked has already rendered the markdown image) -->
<img src="./assets/arch.excalidraw" alt="Architecture">

<!-- Output -->
<div class="diagram diagram-excalidraw"
     data-src="/content-assets/user-guide/…/arch.excalidraw?v=1751600000000"
     data-title="Architecture"></div>
```

The mechanism, end to end:

1. **Match** — only `<img>` tags whose `src` ends in `.excalidraw`. A plain
   markdown link (`<a href>`) to the same file is deliberately left alone —
   it stays a link (asset-src later rewrites its href so it downloads/opens).
2. **Resolve + verify** — the relative src is resolved against the source
   file's directory via `resolveContentAssetUrl()` (shared with asset-src).
   A missing file is a **build-time `asset-missing` error**, not a broken
   embed at runtime.
3. **Cache-bust** — the emitted URL carries `?v=<mtimeMs>` of the scene file,
   so long-lived browser/CDN caches invalidate when the scene changes even
   on static hosts where we don't control response headers.
4. **Render client-side** — no JSON is inlined and no SVG is baked at build
   time. `src/scripts/diagrams.ts` fetches the scene (with `cache:
   'no-cache'`, so dev edits revalidate via ETag) and converts it with
   Excalidraw's `exportToSvg` in the browser at view time. The scene file
   stays independently openable — that's the *reference-based* embed
   decision: one source of truth on disk.

`data-title` falls back to a title-cased filename when the image has no alt
text; the client renders it as a caption with an *open file ↗* link.

### Asset Sources

`asset-src.ts` makes colocated files work. Content folders aren't served at
any browser-relative position, so a relative `src`/`href` written next to a
markdown file would 404 once the page renders at its slug URL. The
postprocessor rewrites both:

```html
<img src="./assets/screenshot.png">     → <img src="/content-assets/<section>/…/screenshot.png">
<a href="./assets/spec.pdf">spec</a>    → <a href="/content-assets/<section>/…/spec.pdf">spec</a>
```

- **`<img src>`** — any relative path, extension-agnostic.
- **`<a href>`** — only hrefs with a real file extension that is **not**
  `.md`/`.mdx` (page links belong to `internal-links.ts`).
- Skipped in both cases: absolute URLs, `//`, `/`-rooted, `data:`, `@`
  aliases, and pure `#anchor` links. Paths that escape every content root
  resolve to `null` and are left untouched.

The rewritten URLs are served by `src/pages/content-assets/[...path].ts`:
in dev it streams the file with `Cache-Control: no-cache` + an ETag (cheap
304s, edits show on plain reload); in prod `getStaticPaths` copies every
servable colocated file into the build output and responses get a 1-year
immutable header. Markdown and `settings.json` are never served.

### Issue Body Links

`issue-body-links.ts` (issues pipeline only) compensates for the tracker's
URL collapse: `<issue-id>/issue.md` renders at `/<issue-id>` (one level
higher than the file lives), so relative links written in `issue.md` would
resolve one directory off. The postprocessor re-roots them. Supporting docs
(comments, notes, subtasks) render at their real depth and are not touched.

### Table Wrap

`table-wrap.ts` wraps each `<table>` in a `.table-scroll` container so wide
tables scroll horizontally inside their own box instead of stretching the
page — the layout CSS can't do this alone because scoped styles don't reach
rendered markdown without `:global`.

## Custom Postprocessors

Create custom postprocessors by implementing the `Processor` interface:

```typescript
import type { Processor, ProcessContext } from '@parsers/types';

const myPostprocessor: Processor = {
  name: 'my-postprocessor',
  async process(html: string, context: ProcessContext): Promise<string> {
    // Transform HTML here
    return transformedHtml;
  }
};

// Add to pipeline
pipeline.addPostprocessor(myPostprocessor);
```

### Example: Add Copy Buttons to Code Blocks

```typescript
const copyButtonPostprocessor: Processor = {
  name: 'copy-buttons',
  async process(html) {
    return html.replace(
      /<pre><code/g,
      '<pre class="has-copy-button"><button class="copy-btn">Copy</button><code'
    );
  }
};
```

### Example: Lazy Load Images

```typescript
const lazyImagePostprocessor: Processor = {
  name: 'lazy-images',
  async process(html) {
    return html.replace(
      /<img /g,
      '<img loading="lazy" '
    );
  }
};
```

## Processing Order

Postprocessors run in the order they are added. The real registration
(docs/blog; issues adds `issueBodyLinksPostprocessor` after internal-links):

```typescript
pipeline
  .addPostprocessor(headingIdsPostprocessor)      // anchor IDs
  .addPostprocessor(internalLinksPostprocessor)   // page-link slugs
  .addPostprocessor(excalidrawEmbedPostprocessor) // img → diagram placeholder
  .addPostprocessor(assetSrcPostprocessor)        // colocated file URLs
  .addPostprocessor(externalLinksPostprocessor)   // security attrs
  .addPostprocessor(tableWrapPostprocessor);      // scroll containers
```

One ordering is load-bearing: **excalidraw-embed must run before asset-src**.
The embed matcher needs the author-written relative `src` to resolve the
scene file; once it converts the `<img>` to a `<div data-src>`, asset-src no
longer sees an `<img>` and can't double-rewrite it.

## Adding a New Embed Type — the Excalidraw Pattern

Excalidraw is the reference implementation for "author references a file,
the browser renders it". To add another render-by-reference format (e.g.
`.drawio`, `.tldraw`), follow the same four pieces:

1. **Postprocessor** — copy the `excalidraw-embed.ts` shape: match
   `<img src="…\.<ext>">`, resolve via `resolveContentAssetUrl()`, verify the
   file exists (build error if not), emit
   `<div class="diagram diagram-<kind>" data-src="<url>?v=<mtimeMs>">`.
   Register it in all three content types (docs, blog, issues), **before**
   `assetSrcPostprocessor`.
2. **Client renderer** — add a branch in `src/scripts/diagrams.ts`: select
   `.diagram-<kind>:not(.diagram-rendered)`, lazy-`import()` the render
   library (Vite code-splits it — pages without the format load nothing),
   fetch `data-src` with `cache: 'no-cache'`, render, then add
   `diagram-rendered`. Errors get `.diagram-error`. The lightbox and dark
   mode come free — both key off `.diagram-rendered`.
3. **MIME entry** — add the extension in `src/pages/lib/mime.ts` so
   `/content-assets/` serves it with a sane type.
4. **First-class pages (optional)** — register the extension in
   `DIAGRAM_KINDS` in `src/loaders/diagram-pages.ts` and prefixed files
   become sidebar pages with no further work (see
   [Data Loading → Diagram pages](/docs/architecture/data-loading)).

What you should **not** do: inline the file's content into the HTML (breaks
the one-source-of-truth rule and bloats pages), render at build time
(server-side DOM dependencies, stale output), or add a new syntax — the
image grammar `![Title](./file.ext)` is the embed grammar.

## Error Handling

### Missing Position Prefix

```
[DOCS ERROR] Files missing required NN_ position prefix:
  - overview.md
  - installation.md

Docs files must be named with a 2–5 digit position prefix.
Examples:
  01_getting-started.md
  02_installation.md
```

### File Not Found

```
[PARSER ERROR] Content file not found: /path/to/missing.md
  Code: FILE_NOT_FOUND
```

### Directory Not Found

```
[PARSER ERROR] Content directory not found: /path/to/missing/
  Code: DIR_NOT_FOUND
```
