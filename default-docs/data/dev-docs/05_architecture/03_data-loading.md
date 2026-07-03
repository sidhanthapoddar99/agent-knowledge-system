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
  fileType: FileType;   // 'md' | 'mdx' | 'yaml' | 'json'
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
    depth: 3,             // Show up to 3 levels of nesting
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
    depth?: number;            // Max nesting depth shown
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
