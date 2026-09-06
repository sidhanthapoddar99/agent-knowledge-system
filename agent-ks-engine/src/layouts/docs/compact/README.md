# docs/compact — Two-Column Layout (no sidebar)

Body + Outline + Pagination. Wider content area, no sidebar navigation.

## Props (received from route handler)

Same interface as `docs/default`:

```typescript
interface Props {
  title: string;
  description?: string;
  dataPath: string;           // Used for pagination (prev/next) — not for sidebar
  baseUrl: string;
  currentSlug: string;
  content: string;            // Pre-rendered HTML
  headings?: { depth: number; slug: string; text: string }[];
}
```

## Data loaded internally

Loads content for pagination only (no sidebar is rendered):

```typescript
const { content: allContent } = await loadContentWithSettings(dataPath);
const sidebarNodes = buildSidebarTree(allContent, baseUrl, dataPath);
const { prev, next } = getPrevNext(sidebarNodes, currentPath);
```

## Components

`Body.astro`, `Outline.astro`, and `Pagination.astro` are imported from `../default/`:

```typescript
import Body from '../default/Body.astro';
import Outline from '../default/Outline.astro';
import Pagination from '../default/Pagination.astro';
```

## Visual structure

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────────────────────────────────┬───────────────────┤
│                                          │                   │
│               Body                       │     Outline       │
│                                          │                   │
│   Title                                  │  On this page     │
│   Description                            │  • Heading 1      │
│                                          │  • Heading 2      │
│   Content...                             │  • Heading 3      │
│                                          │                   │
│   ← Prev                    Next →       │                   │
│                                          │                   │
├──────────────────────────────────────────┴───────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```
