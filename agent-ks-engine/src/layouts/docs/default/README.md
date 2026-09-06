# docs/default — Full Three-Column Layout

Sidebar + Body + Outline (table of contents) + Pagination.

## Props (received from route handler)

```typescript
interface Props {
  title: string;              // Page title from frontmatter
  description?: string;       // Page description from frontmatter
  dataPath: string;           // Absolute path to the docs folder
  baseUrl: string;            // Base URL prefix (e.g. "/docs")
  currentSlug: string;        // Current page slug (e.g. "getting-started/overview")
  content: string;            // Pre-rendered HTML — inject with set:html, never escape
  headings?: { depth: number; slug: string; text: string }[];  // Extracted during parsing
}
```

## Data loaded internally

The layout loads sidebar and settings data itself using `dataPath`:

```typescript
const { content: allContent, settings } = await loadContentWithSettings(dataPath);
const sidebarNodes = buildSidebarTree(allContent, baseUrl, dataPath);
const { prev, next } = getPrevNext(sidebarNodes, currentPath);
```

`content` and `headings` are **pre-processed by the route handler** — the layout just renders them.
`dataPath` is just a path string — the layout is responsible for loading sidebar content from it.

## Components in this folder

| File | Purpose |
|------|---------|
| `Layout.astro` | Entry point — composes the 3-column structure |
| `Sidebar.astro` | Hierarchical navigation tree with collapsible sections |
| `Body.astro` | Main content area with title, description, and HTML content |
| `Outline.astro` | Right-column table of contents (scroll spy) |
| `Pagination.astro` | Prev/Next links at bottom of body |

`compact` imports `Body.astro`, `Outline.astro`, and `Pagination.astro` from this folder.

## Visual structure

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────┬──────────────────────────────┬────────────────┤
│              │                              │                │
│   Sidebar    │           Body               │   Outline      │
│              │                              │                │
│  • Section   │   Title                      │  On this page  │
│    • Page    │   Description                │  • Heading 1   │
│    • Page    │                              │    • Sub       │
│              │   Content...                 │  • Heading 2   │
│              │                              │                │
│              │   ← Prev        Next →       │                │
│              │                              │                │
├──────────────┴──────────────────────────────┴────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```
