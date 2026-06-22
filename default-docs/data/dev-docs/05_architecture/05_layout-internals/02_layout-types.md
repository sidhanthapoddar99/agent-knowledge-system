---
title: Layout Types
description: Understanding docs, blog, and custom layout types
sidebar_position: 2
---

# Layout Types

The framework provides three layout types, each designed for different content patterns.

## Overview

| Type | Purpose | Layouts | Key Feature |
|------|---------|---------|-------------|
| **Docs** | Documentation | `default`, `compact` | Sidebar navigation, TOC |
| **Blog** | Blog posts | `default` | Date sorting, post cards |
| **Custom** | Arbitrary pages | `home`, `info` | Flexible structure |

## Docs Layouts

Documentation layouts handle hierarchical content with navigation.

### Shared Props

All docs layouts receive:

```typescript
interface DocsLayoutProps {
  title: string;           // Page title from frontmatter
  description: string;     // Page description
  dataPath: string;        // Path to docs folder (@data/docs)
  baseUrl: string;         // Base URL (/docs)
  currentSlug: string;     // Current page slug
  content: string;         // Rendered HTML
  headings: Heading[];     // For outline/TOC
}
```

### default — Three Column

**File:** `src/layouts/docs/default/Layout.astro`

```
┌──────────────────────────────────────────────────────────────┐
│                         Navbar                               │
├────────────┬─────────────────────────────────┬───────────────┤
│            │                                 │               │
│  Sidebar   │            Body                 │   Outline     │
│            │                                 │               │
│  • Section │   Title                         │   • Heading 1 │
│    • Page  │   Description                   │   • Heading 2 │
│    • Page  │                                 │     • Sub     │
│  • Section │   Content...                    │   • Heading 3 │
│            │                                 │               │
│            │   ← Prev    Next →              │               │
│            │                                 │               │
├────────────┴─────────────────────────────────┴───────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Collapsible sidebar with nested sections
- Main content body with title/description
- Right-side outline (table of contents)
- Prev/Next pagination

### compact — Two Column

**File:** `src/layouts/docs/compact/Layout.astro`

```
┌──────────────────────────────────────────────────────────────┐
│                         Navbar                               │
├─────────────────────────────────────────────┬────────────────┤
│                                             │                │
│                   Body                      │    Outline     │
│                                             │                │
│   Title                                     │  • Heading 1   │
│   Description                               │  • Heading 2   │
│                                             │  • Heading 3   │
│   Content...                                │                │
│                                             │                │
│   ← Prev    Next →                          │                │
│                                             │                │
├─────────────────────────────────────────────┴────────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- No sidebar (cleaner for simple docs)
- Wider content area
- Still includes outline and pagination

### Internal Processing

Both layouts use the same data loading:

```typescript
// Inside Layout.astro
const { content: allContent, settings } = await loadContentWithSettings(dataPath);
const sidebarNodes = buildSidebarTree(allContent, baseUrl, dataPath);
const { prev, next } = getPrevNext(sidebarNodes, currentPath);
```

## Blog Layouts

Blog layouts handle date-based content with listing and detail views.

### IndexLayout — Post Listing

**File:** `src/layouts/blogs/default/IndexLayout.astro`

```
┌──────────────────────────────────────────────────────────────┐
│                         Navbar                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Blog Title                                                 │
│                                                              │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│     │   Image     │  │   Image     │  │   Image     │        │
│     │             │  │             │  │             │        │
│     │ Post Title  │  │ Post Title  │  │ Post Title  │        │
│     │ Date        │  │ Date        │  │ Date        │        │
│     │ Excerpt...  │  │ Excerpt...  │  │ Excerpt...  │        │
│     └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

**Props:**

```typescript
interface BlogIndexProps {
  title: string;           // Blog section title
  dataPath: string;        // Path to blog folder
  baseUrl: string;         // Base URL (/blog)
}
```

### PostLayout — Single Post

**File:** `src/layouts/blogs/default/PostLayout.astro`

```
┌──────────────────────────────────────────────────────────────┐
│                         Navbar                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Post Title                                                 │
│   Author · Date · Tags                                       │
│                                                              │
│   ─────────────────────────────────────────                  │
│                                                              │
│   Content...                                                 │
│                                                              │
│   ─────────────────────────────────────────                  │
│                                                              │
│   Tags: [tag1] [tag2] [tag3]                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

**Props:**

```typescript
interface BlogPostProps {
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  content: string;
}
```

## Custom Layouts

Custom layouts handle arbitrary page structures.

### home — Landing Page

**File:** `src/layouts/custom/home/Layout.astro`

```
┌──────────────────────────────────────────────────────────────┐
│                         Navbar                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                     HERO SECTION                             │
│                                                              │
│              Title · Subtitle · CTA Button                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│     │ Feature  │    │ Feature  │    │ Feature  │             │
│     │   Icon   │    │   Icon   │    │   Icon   │             │
│     │  Title   │    │  Title   │    │  Title   │             │
│     │  Desc    │    │  Desc    │    │  Desc    │             │
│     └──────────┘    └──────────┘    └──────────┘             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

**Data Structure (YAML):**

```yaml
hero:
  title: "Welcome"
  subtitle: "Build fast documentation"
  cta:
    label: "Get Started"
    href: "/docs"

features:
  - icon: "rocket"
    title: "Fast"
    description: "Built on Astro"
  - icon: "puzzle"
    title: "Modular"
    description: "Pick your layout"
```

### info — Simple Content Page

**File:** `src/layouts/custom/info/Layout.astro`

```
┌──────────────────────────────────────────────────────────────┐
│                         Navbar                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Title                                                      │
│                                                              │
│   Content (markdown or HTML)                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

## Layout Selection in Config

Specify layouts in `site.yaml`:

```yaml
pages:
  docs:
    base_url: "/docs"
    type: docs
    layout: "@docs/default"    # ← Layout reference
    data: "@data/docs"

  blog:
    base_url: "/blog"
    type: blog
    layout: "@blog/default"
    data: "@data/blog"

  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

Layout references work the same whether the layout is built-in or external. When `LAYOUT_EXT_DIR` is set, the system scans both `src/layouts/` and the external directory, merging them by style name (external overrides built-in).

## Comparison Table

| Feature | Docs | Blog | Custom |
|---------|------|------|--------|
| **Content Source** | Markdown files | Markdown files | YAML/Markdown |
| **Ordering** | `NN_` prefix | Date prefix | Manual |
| **Sidebar** | Yes (optional) | No | No |
| **Outline/TOC** | Yes | No | No |
| **Pagination** | Prev/Next | No | No |
| **Multiple Files** | Yes (hierarchy) | Yes (flat) | Single file |
| **Frontmatter** | title, description | title, date, author, tags | Flexible |
