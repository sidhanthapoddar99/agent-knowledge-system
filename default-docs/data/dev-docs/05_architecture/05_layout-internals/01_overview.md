---
title: Layout System Overview
description: Understanding the modular layout architecture and shared data pipeline
sidebar_position: 1
---

# Layout System

The layout system (`src/layouts/`) implements a **shared data, different structure** pattern where multiple layouts receive identical data but render it with different visual structures.

## Core Concept

```
┌──────────────────────────────────────────────────────────────────┐
│                     COMMON DATA PIPELINE                         │
│   site.yaml → [..slug].astro → loadContent() → Parser → HTML     │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 │  Same props passed to all layouts
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   ┌───────────┐           ┌───────────┐           ┌───────────┐
   │default    │           │compact    │           │doc_style3 │
   │           │           │           │           │           │
   │ Sidebar   │           │           │           │ Sidebar   │
   │ Body      │           │ Body      │           │ Body      │
   │ Outline   │           │ Outline   │           │           │
   └───────────┘           └───────────┘           └───────────┘
    3-column                2-column                2-column
```

All doc layouts receive the **same props**:

```typescript
{
  title: string;
  description: string;
  dataPath: string;      // For loading sidebar/settings
  baseUrl: string;       // For URL generation
  currentSlug: string;   // For active state highlighting
  content: string;       // Rendered HTML from parser
  headings: Heading[];   // For outline/TOC
}
```

The difference is purely **structural** — which components are rendered and how they're arranged.

## Layout Layer in Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          4. LAYOUT LAYER                                │
│                                                                         │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │
│   │  BaseLayout     │   │  Layout Variants │   │  Components     │       │
│   │  (HTML shell)   │   │  @docs/default  │   │  Sidebar, Body  │       │
│   │                 │   │  @blog/default  │   │  Outline, etc.  │       │
│   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘       │
│            │                     │                     │                │
│            └─────────────────────┴─────────────────────┘                │
│                                  │                                      │
│                          Composition                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/layouts/
├── BaseLayout.astro              # Root HTML structure (all pages)
│
├── docs/                         # Documentation layouts
│   ├── default/                  # 3-column: sidebar + body + outline
│   │   ├── Layout.astro
│   │   ├── Sidebar.astro
│   │   ├── SidebarNode.astro     # Recursive node renderer (depth-bounded)
│   │   ├── Body.astro
│   │   ├── Outline.astro
│   │   └── Pagination.astro
│   └── compact/                  # 2-column: body + outline (no sidebar)
│       └── Layout.astro          # imports components from ../default/
│
├── blogs/                        # Blog layouts
│   └── default/
│       ├── IndexLayout.astro     # Post listing page
│       ├── PostLayout.astro      # Single post page
│       ├── IndexBody.astro
│       ├── PostBody.astro
│       └── PostCard.astro
│
├── custom/                       # Custom page layouts
│   ├── home/
│   │   ├── Layout.astro
│   │   ├── Hero.astro
│   │   └── Features.astro
│   ├── info/
│   │   ├── Layout.astro
│   │   └── Content.astro
│   └── countdown/
│       └── Layout.astro
│
├── navbar/                       # Navbar variants
│   ├── default/index.astro
│   └── minimal/index.astro
│
└── footer/                       # Footer variants
    ├── default/index.astro
    └── minimal/index.astro
```

Each layout variant folder owns its own components. If two variants share a component (e.g. `compact` using `Body` from `default`), `compact` imports it relatively: `../default/Body.astro`.

## Key Principles

### 1. Composition Over Inheritance

Layouts compose from components in the same folder rather than extending base classes:

```astro
<!-- default/Layout.astro -->
<div class="docs-layout three-column">
  <Sidebar nodes={sidebarNodes} currentPath={currentPath} />
  <Body title={title} content={content}>
    <Pagination prev={prev} next={next} />
  </Body>
  <Outline headings={headings} />
</div>
```

### 2. Automatic Discovery

Layouts are discovered via dual glob patterns — built-in and external — with no manual registry:

```typescript
// In [...slug].astro — built-in + external globs
const builtinDocsLayouts = import.meta.glob('/src/layouts/docs/*/Layout.astro');
const extDocsLayouts = import.meta.glob('@ext-layouts/docs/*/Layout.astro');

// Merged: external overrides built-in with the same style name
const layoutNamePattern = /\/([^/]+)\/[^/]+\.astro$/;
const docsLayouts = mergeLayouts(builtinDocsLayouts, extDocsLayouts, layoutNamePattern);
```

Adding a new layout is just creating a folder with the right file — either in `src/layouts/` or in the external `LAYOUT_EXT_DIR` directory.

### 3. Strict Validation

Missing or invalid layouts throw descriptive errors at build time:

```
[LAYOUT ERROR] Docs layout "doc_style99" does not exist.
  Page: docs
  Config: @docs/doc_style99
  Expected: src/layouts/docs/doc_style99/Layout.astro
  Available: default, compact
```

### 4. Standardized Paths

All layout types follow a consistent path pattern:

```
src/layouts/{type}/{style}/Layout.astro
```

| Type | Pattern | Example |
|------|---------|---------|
| Docs | `docs/{style}/Layout.astro` | `default` |
| Blog | `blogs/{style}/*.astro` | `default` |
| Custom | `custom/{style}/Layout.astro` | `home` |

## Data Flow Summary

```
1. [..slug].astro reads page config from site.yaml
       │
       ▼
2. loadContentWithSettings() loads all content + folder settings
       │
       ▼
3. buildSidebarTree() creates navigation structure
       │
       ▼
4. Layout receives standardized props
       │
       ▼
5. Layout composes components (Sidebar, Body, Outline)
       │
       ▼
6. BaseLayout wraps with Navbar + Footer
       │
       ▼
7. Final HTML output
```
