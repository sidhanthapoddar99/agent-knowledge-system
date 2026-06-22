---
title: Data Interface
description: What data docs layouts receive and how to use it
---

# Data Interface

Docs layouts receive processed content, not raw markdown. Understanding this interface is essential for creating or customizing layouts.

## What Layouts Receive

The layout receives **three types of data** with different sources:

| Data | Received As | Source | Layout Responsibility |
|------|-------------|--------|----------------------|
| **Current page content** | Rendered HTML string (`content`) | Route handler (pre-processed) | Just inject with `set:html` |
| **Outline/TOC headings** | Array of heading objects (`headings`) | Route handler (pre-extracted) | Filter and render |
| **Sidebar/navigation** | Path to data folder (`dataPath`) | Route handler passes path | Load and build tree |

```
Route Handler ([...slug].astro)
─────────────────────────────────
1. Loads current page markdown
2. Runs parser pipeline → HTML
3. Extracts headings during parsing
4. Passes to layout:
   • content: "<h1>...</h1>"           ← Already rendered HTML
   • headings: [{depth, slug, text}]   ← Already extracted array
   • dataPath: "/path/to/docs"         ← Just a path string
   • title, description, etc.
            │
            ▼
Layout (default)
───────────────────
• Page content: Just render it (already HTML)
• Outline: Filter headings array, render links
• Sidebar: Must load data using dataPath, then build tree
```

**Summary:**
- **Content & Headings** → Pre-processed by route handler, layout just renders
- **Sidebar** → Layout must load and build (route handler only passes path)

## Props Interface

Every docs layout receives these props:

```typescript
interface DocsLayoutProps {
  // Content metadata (from frontmatter)
  title: string;              // Page title (required)
  description?: string;       // Page description

  // Path information
  dataPath: string;           // Absolute path to docs folder
  baseUrl: string;            // Base URL (e.g., "/docs")
  currentSlug: string;        // Current page slug

  // Rendered content
  content: string;            // HTML string (processed markdown)
  headings?: Heading[];       // Extracted headings for TOC
}

interface Heading {
  depth: number;    // 1-6 (h1-h6)
  slug: string;     // URL-safe ID (e.g., "getting-started")
  text: string;     // Heading text content
}
```

## Content Processing Pipeline

The `content` prop contains **fully processed HTML**, not raw markdown:

```
Raw Markdown                    Processed HTML (content prop)
─────────────                   ────────────────────────────
# Hello World                   <h1 id="hello-world">Hello World</h1>

Some **bold** text.        →    <p>Some <strong>bold</strong> text.</p>

\[[./assets/code.py]]            <pre><code>print("hello")</code></pre>
```

### What's Already Done

By the time content reaches the layout:

| Processing | Status | Example |
|------------|--------|---------|
| Markdown → HTML | ✅ Done | `**bold**` → `<strong>bold</strong>` |
| Heading IDs | ✅ Done | `<h2>` → `<h2 id="slug">` |
| Asset embedding | ✅ Done | `\[[./code.py]]` → `<pre><code>...</code></pre>` |
| External links | ✅ Done | `<a>` gets `target="_blank"` |
| Custom tags | ✅ Done | `<callout>` → styled HTML |
| Code highlighting | ✅ Done | Syntax highlighted |

### Rendering Content

Use Astro's `set:html` directive to render the HTML string:

```astro
---
const { content } = Astro.props;
---

<div class="content">
  <Fragment set:html={content} />
</div>
```

**Important:** Never use `{content}` directly — it will escape the HTML.

## Headings Array

The `headings` prop is an array of extracted headings for building table of contents:

```typescript
// Example headings array
[
  { depth: 2, slug: "installation", text: "Installation" },
  { depth: 3, slug: "prerequisites", text: "Prerequisites" },
  { depth: 3, slug: "npm-install", text: "NPM Install" },
  { depth: 2, slug: "configuration", text: "Configuration" },
]
```

### Building Outline/TOC

```astro
---
const { headings = [] } = Astro.props;

// Filter to show only h2 and h3
const tocHeadings = headings.filter(h => h.depth >= 2 && h.depth <= 3);
---

<nav class="toc">
  <ul>
    {tocHeadings.map(heading => (
      <li class={`depth-${heading.depth}`}>
        <a href={`#${heading.slug}`}>{heading.text}</a>
      </li>
    ))}
  </ul>
</nav>
```

## Path Information

### dataPath

Absolute filesystem path to the docs content folder:

```typescript
const { dataPath } = Astro.props;
// "/Users/.../default-docs/data/docs"
```

Used to:
- Load all content for sidebar building
- Load folder settings
- Resolve relative asset paths

### baseUrl

The URL prefix for docs pages:

```typescript
const { baseUrl } = Astro.props;
// "/docs"
```

Used to:
- Build navigation links
- Determine current page state
- Generate pagination URLs

### currentSlug

The slug of the current page (without base URL):

```typescript
const { currentSlug } = Astro.props;
// "getting-started/overview"
```

Used to:
- Highlight current page in sidebar
- Build current URL: `${baseUrl}/${currentSlug}`

## Folder Structure → Sidebar Mapping

The sidebar tree is built from the docs folder structure. The `NN_` position prefix controls ordering; it is stripped from URLs and sidebar labels.

```
data/docs/
├── 01_getting-started/        → section "Getting Started"  (position 1)
│   ├── settings.json          → section settings (label, collapse)
│   ├── 01_overview.md         →   • Overview      (position 1)
│   └── 02_installation.md     →   • Installation  (position 2)
└── 02_guides/                 → section "Guides"           (position 2)
    ├── settings.json
    └── 01_basics.md           →   • Basics        (position 1)
```

**Slug generation (NN_ prefix stripped):**

```
01_getting-started/01_overview.md  →  getting-started/overview
01_getting-started/02_install.md   →  getting-started/install
02_guides/01_basics.md             →  guides/basics
```

**Section label** resolves in this order:
1. `"label"` field in the folder's `settings.json`
2. Folder name with `NN_` stripped and kebab-case converted to title case

## Folder settings.json

Each docs folder can have a `settings.json` to control sidebar and outline behaviour:

```json
{
  "sidebar": {
    "collapsed": false,
    "collapsible": true,
    "sort": "position",
    "depth": 3
  },
  "outline": {
    "enabled": true,
    "levels": [2, 3],
    "title": "On this page"
  },
  "pagination": {
    "enabled": true,
    "showPrevNext": true
  }
}
```

All fields are optional. Missing fields fall back to these defaults:

| Field | Default | Effect |
|-------|---------|--------|
| `sidebar.collapsed` | `false` | Sections start open |
| `sidebar.collapsible` | `true` | Users can toggle sections |
| `sidebar.sort` | `'position'` | Order by `NN_` prefix number |
| `sidebar.depth` | `3` | Show up to 3 nesting levels |
| `outline.enabled` | `true` | Show outline panel |
| `outline.levels` | `[2, 3]` | Include h2 and h3 headings |
| `outline.title` | `'On this page'` | Outline panel header |
| `pagination.enabled` | `true` | Show prev/next links |
| `pagination.showPrevNext` | `true` | Display navigation buttons |

`settings.json` resolves to a `ContentSettings` object:

```typescript
interface ContentSettings {
  sidebar?: {
    collapsed?: boolean;
    collapsible?: boolean;
    sort?: 'position' | 'alphabetical';
    depth?: number;
  };
  outline?: {
    enabled?: boolean;
    levels?: number[];
    title?: string;
  };
  pagination?: {
    enabled?: boolean;
    showPrevNext?: boolean;
  };
}
```

## Loading Additional Data

Layouts call `loadContentWithSettings` to get both the full content array and the settings in a single call:

### Loading Sidebar Content

```typescript
import { loadContentWithSettings } from '@loaders/data';

const { dataPath } = Astro.props;
const { content, settings } = await loadContentWithSettings(dataPath);

// content: LoadedContent[] — all docs in the folder, sorted by position
// settings: ContentSettings — merged from settings.json + defaults
```

### Building Sidebar Tree

```typescript
import { buildSidebarTree, getPrevNext } from '@/hooks/useSidebar';

const sidebarNodes = buildSidebarTree(content, baseUrl, dataPath);
const { prev, next } = getPrevNext(sidebarNodes, currentPath);
```

## Example: Full Layout Implementation

```astro
---
import { loadContentWithSettings } from '@loaders/data';
import { buildSidebarTree, getPrevNext } from '@/hooks/useSidebar';

import Sidebar from './Sidebar.astro';
import Body from './Body.astro';
import Outline from './Outline.astro';
import Pagination from './Pagination.astro';

interface Props {
  title: string;
  description?: string;
  dataPath: string;
  baseUrl: string;
  currentSlug: string;
  content: string;
  headings?: { depth: number; slug: string; text: string }[];
}

const { title, description, dataPath, baseUrl, currentSlug, content, headings = [] } = Astro.props;

// Load sidebar data
const { content: allContent, settings } = await loadContentWithSettings(dataPath);
const sidebarNodes = buildSidebarTree(allContent, baseUrl, dataPath);

// Pagination
const currentPath = `${baseUrl}/${currentSlug}`;
const { prev, next } = getPrevNext(sidebarNodes, currentPath);

// Filter headings for outline
const outlineHeadings = headings.filter(h => h.depth >= 2 && h.depth <= 3);
---

<div class="docs-layout">
  <Sidebar nodes={sidebarNodes} currentPath={currentPath} />

  <Body title={title} description={description} content={content}>
    <Pagination prev={prev} next={next} />
  </Body>

  {outlineHeadings.length > 0 && (
    <Outline headings={outlineHeadings} />
  )}
</div>
```

## Type Definitions

For TypeScript support, import types from loaders:

```typescript
import type { LoadedContent, ContentSettings, Heading } from '@loaders/data';

// LoadedContent shape:
interface LoadedContent {
  id: string;
  slug: string;
  content: string;
  headings: Heading[];  // Extracted during parsing, cached with content
  data: {
    title: string;
    description?: string;
    sidebar_label?: string;
    sidebar_position?: number;
    draft?: boolean;
  };
  filePath: string;
  relativePath: string;
}

// Heading shape:
interface Heading {
  depth: number;    // 1-6 (h1-h6)
  slug: string;     // URL-safe ID
  text: string;     // Heading text content
}
```
