---
title: Data Loading Engine
description: How content is loaded from disk, parsed, cached, and passed to layouts
---

# Data Loading Engine

The loading engine (`src/loaders/data.ts`) bridges the file system and the layout layer. It reads markdown, YAML, and MDX files from disk, runs them through the parser pipeline, caches results, and returns typed `LoadedContent` objects that layouts consume.

## Core API

```typescript
import { loadContent, loadFile, loadSettings, loadContentWithSettings } from '@loaders/data';
```

| Function | Purpose | Caches? |
|----------|---------|---------|
| `loadContent(dataPath, contentType, options)` | Load all files in a directory | Yes (mtime) |
| `loadFile(filePath, contentType)` | Load a single file | No |
| `loadSettings(dataPath)` | Load `settings.json` from a directory | Yes (mtime) |
| `loadContentWithSettings(dataPath, contentType, options)` | Load content + settings together | Both |

## LoadedContent Shape

Every parsed file becomes a `LoadedContent` object:

```typescript
interface LoadedContent {
  id: string;           // Unique ID derived from slug
  slug: string;         // URL-friendly path (NN_ prefix stripped)
  content: string;      // Rendered HTML — ready for set:html
  headings: Heading[];  // Extracted TOC headings
  data: ContentData;    // Frontmatter fields
  filePath: string;     // Absolute path to source file
  relativePath: string; // Path relative to the content directory
  fileType: FileType;   // 'md' | 'mdx' | 'yaml' | 'json' | 'diagram' | 'artifact'
}

interface Heading {
  depth: number;   // 1–6 (h1–h6)
  slug: string;    // URL-safe ID added to the heading element
  text: string;    // Heading text content
}
```

### ContentData — Frontmatter Fields

The `data` field contains parsed frontmatter. Common fields used across content types:

```typescript
interface ContentData {
  title: string;             // Required in all doc files
  description?: string;      // Shown below title, used for SEO
  sidebar_position?: number; // Extracted from NN_ prefix; used for ordering
  sidebar_label?: string;    // Overrides title in the sidebar
  date?: string;             // Blog: extracted from YYYY-MM-DD filename prefix
  author?: string;           // Blog: post author
  tags?: string[];           // Blog: categories/tags
  draft?: boolean;           // Hidden in production when true
  image?: string;            // Blog: featured image path
  [key: string]: unknown;    // Any extra frontmatter fields pass through
}
```

## loadContent — Directory Load Flow

```
loadContent(dataPath, 'docs')
│
├─ 1. Validate absolute path
├─ 2. Check mtime cache → return if valid
├─ 3. glob('**/*.{md,mdx}', { cwd: dataPath })
│        │
│        └─ For each file:
│             parser.parse(file, dataPath)
│             └─ Preprocessors → Renderer → Postprocessors
│                Returns: LoadedContent { id, slug, content, headings, data, ... }
│
├─ 4. sortContent(sort='position', order='asc')
├─ 5. cacheManager.setCache('content', key, results, filePaths)
└─ 6. Filter drafts (includeDrafts defaults to true in dev, false in prod)
```

### LoadOptions

Control how `loadContent` behaves:

```typescript
interface LoadOptions {
  pattern?: string;           // Default: '**/*.{md,mdx}'
  sort?: 'position' | 'date' | 'title' | 'alphabetical'; // Default: 'position'
  order?: 'asc' | 'desc';    // Default: 'asc'
  filter?: (c: LoadedContent) => boolean; // Custom filter
  includeDrafts?: boolean;    // Default: true in dev, false in prod
  maxDepth?: number;          // Limit directory traversal depth
  requirePositionPrefix?: boolean; // Throw if NN_ prefix missing
}
```

### Sort Behaviour

| Sort | Source | Example |
|------|--------|---------|
| `position` | `sidebar_position` from `NN_` prefix | `01_overview.md` → position 1 |
| `date` | `data.date` (ISO string) | `2024-01-15` → sorted by time |
| `title` | `data.title` (localeCompare) | Alphabetical by title |
| `alphabetical` | Same as `title` | Alias for `title` |

## Diagram Pages — Non-Markdown Content in the Same Flow

For the `docs` content type only, `loadContent()` runs a **second scan**
after the markdown glob: `loadDiagramPages()` in `src/loaders/diagram-pages.ts`
picks up prefixed diagram files and merges them into the same result array.

```
loadContent(dataPath, 'docs')
│
├─ glob('**/*.{md,mdx}')                    → markdown LoadedContent
├─ loadDiagramPages(dataPath, content)
│    ├─ glob('**/*.{mmd,mermaid,dot,gv,excalidraw}', ignore: '**/assets/**')
│    ├─ DIAGRAM_KINDS: .mmd/.mermaid → mermaid · .dot/.gv → graphviz
│    │                 .excalidraw → excalidraw
│    └─ each file → LoadedContent { fileType: 'diagram', … }
└─ merged + sorted together → one array, one sidebar
```

The design trick: a diagram page's `content` is the **same
`<div class="diagram diagram-<kind>">` container the embed postprocessor
emits** — so the client script, lightbox, and dark mode that already serve
embeds render the page with zero new machinery. Mermaid/graphviz pages
inline their (escaped) source into the div; excalidraw pages carry a
`data-src` URL (+ `?v=<mtimeMs>`) and fetch the scene client-side, keeping
the file as the single source of truth.

Per-file rules (enforced in the loader):

- **`XX_` prefix required** — a diagram file without one is skipped with a
  *warning* (a stray working file), unlike markdown's hard error.
- **`assets/` never scanned** — the glob's explicit ignore; embed-only
  diagrams are invisible to routing by construction.
- **Title** — filename (strip prefix, title-case), overridable by an
  optional sibling `XX_name.meta.json` sidecar (`title`, `description`,
  `sidebar_label`, `sidebar_position`, `draft`; `.jsonc` accepted) read via
  the same `readSettings` used for `settings.json`.
- **Slug collisions** — a diagram slug that collides with a markdown page
  (or another diagram) mutates the surviving entry into an explicit error
  box and reports a build error; extra diagram entries are dropped.
- **Opt-out** — `"allow_diagram_pages": false` in the *section-root*
  `settings.json` disables the scan for that section.
- **Cache** — diagram sources **and** their sidecars are appended to the
  content cache's dependency files, so editing either invalidates the
  section in dev exactly like editing a markdown file.

The issue tracker has its own variant: `src/loaders/issues.ts` accepts
diagram files in `notes/`, `brainstorm/`, `agent-memory/`, and `agent-log/`
via the shared `diagramContainerHtml()` helper — the file becomes a
first-class supporting doc with its own URL, no `XX_` prefix requirement
(prefixes are optional by convention there). Subtasks and comments stay
markdown-only: a subtask is a status-bearing checklist item and a comment
is a dated log entry — diagrams embed into their bodies from `assets/`.

Consumer-facing view of the same feature: user-guide
`15_writing-content/06_diagram-pages.md`.

## Artifact Pages — the Same Seam, a Second Time

First-class **artifacts** (`.html` files — reports, dashboards, design-system
showcases) plug into the identical seam. `loadContent()` for the `docs` type
runs a **third scan** after the diagram push:
`loadArtifactPages()` in `src/loaders/artifact-pages.ts`
(`data.ts:279-284`). The design intent is that an artifact is **additive** — it
introduces no new content type, no new layout, no new route table entry. It is a
`LoadedContent` like any other, so the same sort, cache, draft filter, sidebar
builder, and `Body.astro` render path carry it with zero new machinery.

```
loadContent(dataPath, 'docs')
│
├─ glob('**/*.{md,mdx}')                       → markdown LoadedContent
├─ loadDiagramPages(dataPath, content)         → diagram entries (pushed)
├─ loadArtifactPages(dataPath, content)        → artifact entries
│    ├─ glob('**/*.html', ignore: '**/assets/**')
│    ├─ each file → artifactContainerHtml(): a by-reference
│    │              <div class="artifact artifact-html" data-src="/artifacts/<path>?v=<mtime>">
│    └─ each entry → LoadedContent { fileType: 'artifact', headings: [], … }
└─ merged + sorted together → one array, one sidebar
```

The render trick is the diagram trick again: an artifact page's `content` is a
container `<div>`, and the BaseLayout client script (`scripts/artifacts.ts`)
turns it into an `<iframe>` at runtime — see
[Artifacts Script](/dev-docs/scripts/artifacts). Because the artifact carries
`headings: []`, the outline column auto-hides and the artifact gets the full
content width.

Per-file rules mirror diagram pages exactly:

- **`NN_` prefix required** — a prefix-less `.html` is skipped with a *warning*
  (`artifact-pages.ts:189-198`), not the hard error markdown gets: a stray
  `.html` export is a common working file.
- **`assets/` never scanned** — embed-only / working `.html` files live there.
- **Title** — filename (strip prefix, title-case), overridable by an optional
  sibling `NN_name.meta.json` / `.meta.jsonc` sidecar read via the same
  `readSettings`. See [Sidecar shape](#sidecar-shape) below.
- **Opt-out** — `"allow_artifact_pages": false` in the *section-root*
  `settings.json`.

Two integration details the loader gets right where a naive clone would not:

- **One shared collision pool.** The scan runs *after* the diagram push and is
  handed the already-augmented `content`, so its slug-collision pass sees
  markdown **and** diagram entries — a `05_x.html` clashing with a `05_x.md` or
  a `05_x.mmd` is caught. The pass itself lives in
  `resolveSlugCollisions()` (`src/loaders/first-class-page.ts`), a small shared
  helper both the diagram and artifact scanners call, so there is **one**
  collision implementation over **one** pool (only the error-box HTML differs,
  passed in as a factory).
- **`dependencyFiles` is concatenated, not overwritten.**
  `data.ts:284` does `[...diagramPages.dependencyFiles, ...artifactPages.dependencyFiles]`
  — a second loader that *assigned* would drop the first's dependencies and
  artifact edits wouldn't bust the section cache. Each scanner pushes the
  artifact source **and** whichever sidecar form (`.json` / `.jsonc`) actually
  exists (`artifact-pages.ts:206-212`) — the artifact loader deliberately does
  **not** repeat the diagram loader's bug of pushing only the `.json` form.

### Sidecar shape

The sidecar is a **hybrid**: typed rendering fields the loader consumes, plus an
opaque passthrough block it never parses.

```typescript
interface ArtifactMeta {
  // Rendering fields — consumed by the loader, same as the diagram sidecar
  title?: string;
  description?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  draft?: boolean;
  // Rendering override (Thread C) — "full" (default) | CSS length | "n/m" aspect | px number
  embed_height?: number | string;
  // Opaque AI-legibility block — stored on entry.data.artifact untouched,
  // never parsed by the engine; its key conventions belong to the
  // agent-ks-artifacts skill (purpose, palette, key data, …).
  artifact?: Record<string, unknown>;
}
```

The split keeps the engine's typed surface tiny and stable while giving agents a
predictable place to read an artifact's declared purpose/palette/data without
parsing a several-hundred-line HTML file. `embed_height` translates to an inline
container style (`embedHeightStyle()`, `artifact-pages.ts:117-124`); everything
under `artifact:` is passed straight through onto `entry.data.artifact`.

Consumer-facing view: user-guide `15_writing-content/08_artifact-pages.md` and
the live `20_examples/02_artifact-showcase.md`. The route that serves the iframe `src` and
the reserved-URL guard are in [Routing System](/dev-docs/architecture/routing);
the client renderer, theme handshake, and full design rationale are in
[Artifacts Script](/dev-docs/scripts/artifacts).

## loadFile — Single File Load

Used for custom pages that point to a single YAML file:

```typescript
const page = await loadFile('/abs/path/to/pages/home.yaml', 'page');
// page.data → parsed YAML fields
// page.content → '' (no markdown content for YAML)
```

The `data` field contains whatever keys are in the YAML file — no fixed schema.

## loadSettings — Folder Settings

Reads `settings.json` from a content directory and merges with defaults:

```typescript
const settings = loadSettings('/abs/path/to/data/docs');
```

**Default values** (applied when `settings.json` is missing or fields are omitted):

```typescript
{
  sidebar: {
    collapsed: false,     // All sections start open
    collapsible: true,    // Sections can be toggled
    sort: 'position',     // Order by NN_ prefix
  },
  outline: {
    enabled: true,
    levels: [2, 3],       // Show h2 and h3 headings
    title: 'On this page',
  },
  pagination: {
    enabled: true,
    showPrevNext: true,
  },
}
```

**Example `settings.json`:**

```json
{
  "sidebar": {
    "collapsed": true,
    "collapsible": true
  },
  "outline": {
    "enabled": true,
    "levels": [2, 3],
    "title": "Contents"
  },
  "pagination": {
    "enabled": false
  }
}
```

Only set fields you want to override — missing fields fall back to defaults.

## ContentSettings Type

```typescript
interface ContentSettings {
  sidebar?: {
    collapsed?: boolean;       // Start collapsed
    collapsible?: boolean;     // Allow user to toggle
    sort?: 'position' | 'alphabetical';
  };
  outline?: {
    enabled?: boolean;
    levels?: number[];         // Heading depths to include (e.g., [2, 3])
    title?: string;            // Outline panel header text
  };
  pagination?: {
    enabled?: boolean;
    showPrevNext?: boolean;
  };
}
```

## How Folder Structure Maps to the Sidebar

`loadContent` returns a flat array of `LoadedContent`. The sidebar tree is built from this array by `buildSidebarTree()` in `src/hooks/useSidebar.ts`:

```
data/docs/
├── 01_getting-started/        → sidebar section "Getting Started" (position 1)
│   ├── settings.json          → section settings (label override, collapse)
│   ├── 01_overview.md         →   • Overview      (position 1)
│   └── 02_installation.md     →   • Installation  (position 2)
└── 02_guides/                 → sidebar section "Guides" (position 2)
    ├── settings.json
    ├── 01_basics.md            →   • Basics        (position 1)
    └── 02_advanced.md          →   • Advanced      (position 2)
```

**Slug mapping:**

```
File path (relative)              →  URL slug (NN_ stripped)
──────────────────────────────────────────────────────────────
01_getting-started/01_overview.md →  getting-started/overview
01_getting-started/02_install.md  →  getting-started/install
02_guides/01_basics.md            →  guides/basics
```

**Sidebar section label** comes from (in order of precedence):
1. `"label"` in the folder's `settings.json`
2. Folder name with `NN_` stripped and kebab-case converted to title case

## How the Route Handler Uses Loaded Data

`src/pages/[...slug].astro` orchestrates the full flow and passes props to the layout:

```
Request: /docs/getting-started/overview
                │
                ▼
[...slug].astro
  │
  ├─ loadFile(resolvedPath, 'docs')
  │    └─ Returns: LoadedContent for the requested page
  │
  ├─ Extracts from LoadedContent:
  │    • content  = rendered HTML
  │    • headings = TOC array
  │    • data.title, data.description
  │
  └─ Passes to Layout.astro:
       title:       data.title
       description: data.description
       content:     rendered HTML
       headings:    [{depth, slug, text}, ...]
       dataPath:    absolute path to docs folder
       baseUrl:     "/docs"
       currentSlug: "getting-started/overview"
```

The layout then calls `loadContentWithSettings(dataPath)` internally to build the sidebar from the full content directory.

## Caching

Content is cached using mtime-based validation — no hash computation. Cache is cleared automatically when files change (via HMR in dev, fresh build in production).

See [Unified Cache System](/docs/architecture/optimizations/unified-cache-system) for full caching details.

## Error Handling

| Error Code | Cause | Effect |
|------------|-------|--------|
| `DIR_NOT_FOUND` | `dataPath` doesn't exist | Throws, page fails to render |
| `FILE_NOT_FOUND` | Single file missing | Throws |
| `MISSING_POSITION_PREFIX` | `NN_` prefix absent when `requirePositionPrefix: true` | Throws with file list |
| `UNSUPPORTED_FILE_TYPE` | Parser returns null | Throws |
| Parse errors | Malformed frontmatter or markdown | Logged, file skipped |
