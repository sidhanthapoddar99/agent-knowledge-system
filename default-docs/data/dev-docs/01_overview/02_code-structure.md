---
title: Code Structure
description: Understanding the framework source code organization
sidebar_position: 2
---

# Code Structure

The `src/` directory contains the framework code. Generally, you won't need to modify these files unless creating custom layouts.

## Directory Overview

```
src/
├── layouts/                # Layout components
│   ├── docs/               # Documentation layouts
│   ├── blogs/              # Blog layouts
│   ├── custom/             # Custom page layouts
│   ├── navbar/             # Navbar variants
│   ├── footer/             # Footer variants
│   └── BaseLayout.astro    # Root HTML layout
│
├── loaders/                # Configuration & data loading
│   ├── index.ts            # Main exports
│   ├── config.ts           # YAML config loader
│   ├── data.ts             # Content loader
│   ├── alias.ts            # Path alias resolver (@data, @assets)
│   └── paths.ts            # Path resolution (two-phase init from site.yaml)
│
├── parsers/                # Content parsing pipeline
│   ├── core/               # Base parser & pipeline
│   ├── preprocessors/      # Run before markdown (asset embed)
│   ├── renderers/          # Markdown → HTML (marked)
│   ├── transformers/       # Custom tags (callout, tabs)
│   ├── postprocessors/     # Run after HTML (heading IDs, links)
│   └── content-types/      # Docs vs Blog parsing
│
├── hooks/                  # Reusable logic
│   ├── useSidebar.ts       # Sidebar tree building & pagination
│   ├── useNavigation.ts    # Navigation helpers
│   ├── useTheme.ts         # Theme utilities
│   └── index.ts            # Barrel exports
│
├── pages/                  # Astro routes
│   ├── [...slug].astro     # Universal dynamic route
│   └── assets/             # Asset serving endpoint
│
└── styles/
    └── globals.css         # CSS variables & base styles
```

## Core Flow

```
site.yaml (pages config)
       ↓
[...slug].astro (route handler)
       ↓
   ┌───┴───┐
   ↓       ↓
Layout  Content
Resolver  Loader
   ↓       ↓
   └───┬───┘
       ↓
  BaseLayout
  + Navbar
  + Content Layout
  + Footer
```

## Layouts

### Layout Organization

Each content type has a `styles/` folder with complete layouts:

```
layouts/
├── docs/
│   ├── styles/
│   │   ├── default/           # Complete layout bundle
│   │   │   ├── Layout.astro   # Main component
│   │   │   └── index.ts       # Exports
│   │   └── compact/
│   │
│   └── components/            # Shared components
│       ├── sidebar/default/
│       ├── body/default/
│       └── outline/default/
│
├── blogs/
│   └── styles/
│       └── default/
│           ├── IndexLayout.astro   # Blog index
│           └── PostLayout.astro    # Single post
│
└── custom/
    └── styles/
        ├── home/
        └── info/
```

### Layout Resolution

The `[...slug].astro` route resolves layouts using glob imports:

```typescript
// Auto-discover all layouts
const docsLayouts = import.meta.glob('/src/layouts/docs/styles/*/Layout.astro');
const blogIndexLayouts = import.meta.glob('/src/layouts/blogs/styles/*/IndexLayout.astro');
const customLayouts = import.meta.glob('/src/layouts/custom/styles/*/Layout.astro');

// Config reference
layout: "@docs/default"  // → /src/layouts/docs/styles/default/Layout.astro
layout: "@blog/default" // → /src/layouts/blogs/styles/default/*.astro
layout: "@custom/home"      // → /src/layouts/custom/styles/home/Layout.astro
```

## Loaders

### `config.ts` - Configuration Loading

Loads and validates YAML configuration:

```typescript
import { loadSiteConfig, loadNavbarConfig, getSiteLogo } from '@loaders/config';

const site = loadSiteConfig();      // site.yaml → pages, metadata
const navbar = loadNavbarConfig();  // navbar.yaml → nav items
const logo = getSiteLogo();         // site.yaml → logo with resolved URLs
```

### `data.ts` - Content Loading

Loads markdown content using the parser system:

```typescript
import { loadContent, loadContentWithSettings } from '@loaders/data';

// Load docs (requires NN_ prefix)
const docs = await loadContent(dataPath, 'docs', {
  pattern: '**/*.{md,mdx}',
  sort: 'position',
  requirePositionPrefix: true,
});

// Load blog posts (sorted by date)
const posts = await loadContent(dataPath, 'blog', {
  pattern: '*.{md,mdx}',
  sort: 'date',
  order: 'desc',
});
```

### `alias.ts` - Path Aliases

Resolves `@` prefixed paths:

```typescript
import { resolveAliasPath, resolveAssetUrl } from '@loaders/alias';

// Filesystem paths
resolveAliasPath('@data/docs');      // → /abs/path/to/default-docs/data/docs
resolveAliasPath('@docs/default'); // → /abs/path/to/src/layouts/docs/default

// Web URLs (for assets)
resolveAssetUrl('@assets/logo.svg'); // → /assets/logo.svg
```

## Parser System

The modular parser processes markdown content through a pipeline:

```
Raw Markdown
     ↓
┌─────────────────────┐
│   Preprocessors     │  ← Asset embedding \[[./assets/code.py]]
└─────────────────────┘
     ↓
┌─────────────────────┐
│     Renderer        │  ← Markdown → HTML (marked)
└─────────────────────┘
     ↓
┌─────────────────────┐
│   Postprocessors    │  ← Heading IDs, external links
└─────────────────────┘
     ↓
Final HTML
```

### Content Type Parsers

```typescript
// docs.ts - Documentation parser
class DocsParser extends BaseContentParser {
  // Pipeline: asset-embed → render → heading-ids → external-links
  // Filename: 01_getting-started.md → position: 1, slug: getting-started
}

// blog.ts - Blog parser
class BlogParser extends BaseContentParser {
  // Filename: 2024-01-15-hello.md → date: 2024-01-15, slug: hello
}
```

## Hooks

### Hooks Overview

| File | Purpose |
|------|---------|
| `useSidebar.ts` | Builds sidebar tree, calculates prev/next pagination |
| `useNavigation.ts` | Navigation state and active-link helpers |
| `useTheme.ts` | Theme utilities (resolved CSS variables, dark mode) |
| `index.ts` | Barrel exports |

### `useSidebar.ts`

Builds sidebar navigation tree from flat content array:

```typescript
import { buildSidebarTree, getPrevNext } from '@/hooks/useSidebar';

// Build hierarchical tree from flat content
const sections = buildSidebarTree(content, '/docs', dataPath);

// Get prev/next for pagination
const { prev, next } = getPrevNext(sections, currentPath);
```

**Sorting**: Uses `NN_` prefix from folder/file names as the sole ordering mechanism.

## Pages

### `[...slug].astro` - Universal Route

Handles all page requests:

1. **getStaticPaths()**: Generates all routes from `site.yaml` pages config
2. **Validates layout**: Throws descriptive errors if layout missing
3. **Loads content**: Uses appropriate parser (docs/blog)
4. **Renders**: Composes BaseLayout + Navbar + Content Layout + Footer

### `assets/[...path].ts` - Asset Endpoint

Serves static files from all asset-category directories (configured via `paths:` in `site.yaml`):

- Searches all asset directories in order (first match wins)
- Sets appropriate MIME types
- Enables caching headers

## Key Files Reference

| File | Purpose |
|------|---------|
| `layouts/BaseLayout.astro` | HTML structure, head meta, favicon, theme |
| `pages/[...slug].astro` | Universal route, layout resolution |
| `loaders/config.ts` | YAML config loading, validation |
| `loaders/data.ts` | Content loading with parser |
| `loaders/alias.ts` | `@` prefix path resolution |
| `parsers/content-types/docs.ts` | Docs parsing (NN_ prefix) |
| `parsers/content-types/blog.ts` | Blog parsing (date prefix) |
| `hooks/useSidebar.ts` | Sidebar tree, pagination |
