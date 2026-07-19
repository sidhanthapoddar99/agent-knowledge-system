---
title: Layout Components
description: How components are organized within layout variant folders
sidebar_position: 4
---

# Layout Components

Each layout variant folder owns its components directly — there is no shared `components/` directory. If two variants need the same component, one imports from the other using a relative path.

## Component Organization

```
src/layouts/
├── docs/
│   ├── default/               # Owns all doc components
│   │   ├── Layout.astro
│   │   ├── Sidebar.astro
│   │   ├── SidebarNode.astro   # Recursive node renderer (depth-bounded)
│   │   ├── Body.astro
│   │   ├── Outline.astro
│   │   └── Pagination.astro
│   └── compact/               # Shares components from default
│       └── Layout.astro       # imports ../default/Body.astro etc.
│
├── blogs/
│   └── default/               # Owns all blog components
│       ├── IndexLayout.astro
│       ├── PostLayout.astro
│       ├── IndexBody.astro
│       ├── PostBody.astro
│       └── PostCard.astro
│
├── custom/
│   ├── home/                  # Owns hero + features components
│   │   ├── Layout.astro
│   │   ├── Hero.astro
│   │   └── Features.astro
│   └── info/                  # Owns content component
│       ├── Layout.astro
│       └── Content.astro
│
├── navbar/
│   ├── default/index.astro
│   └── minimal/index.astro
│
└── footer/
    ├── default/index.astro
    └── minimal/index.astro
```

## Docs Components

### Sidebar

**Files:** `src/layouts/docs/default/Sidebar.astro` (shell + collapse script) and
`src/layouts/docs/default/SidebarNode.astro` (the recursive per-node renderer).

Renders a hierarchical navigation tree with collapsible sections. `Sidebar.astro`
owns the `<aside>` wrapper and the collapse-persistence script, then delegates each
node to `SidebarNode.astro`, which renders a file row or folder section and recurses
via `Astro.self` for sub-folders. Draw depth is bounded by `maxDepth` — the single
system-wide `MAX_SUBFOLDER_DEPTH` (5) from `parsers/core/order-prefix`, shared with the
issue tracker. There is no separate depth setting. The tree itself is unlimited;
`maxDepth` only limits how deep it's drawn (a sub-folder is rendered while
`depth + 1 <= maxDepth`; a file inside a drawn folder always renders).

```astro
---
interface Props {
  nodes: SidebarNode[];    // Mixed: items (root files) + sections (folders)
  currentPath: string;
  maxDepth?: number;       // Shared MAX_SUBFOLDER_DEPTH (5) — folder draw depth
}

type SidebarNode = SidebarItem | SidebarSection;

interface SidebarItem {
  type: 'item';
  title: string;
  href: string;
  slug: string;
  position: number;
}

interface SidebarSection {
  type: 'section';
  title: string;
  slug: string;
  href?: string;
  position: number;
  collapsed: boolean;
  collapsible: boolean;
  children: SidebarNode[];
}
---

<aside class="sidebar">
  {nodes.map(node => (
    <SidebarNode node={node} currentPath={currentPath} depth={1} maxDepth={maxDepth} />
  ))}
</aside>
```

**Features:**
- Recursive rendering (`SidebarNode` via `Astro.self`) to the shared `MAX_SUBFOLDER_DEPTH` (5) levels
- Collapsible sections with chevron icons
- Active state highlighting
- Reads `settings.json` for section labels

### Body

**File:** `src/layouts/docs/default/Body.astro`

Main content wrapper with title and description.

```astro
---
interface Props {
  title: string;
  description?: string;
  content: string;
}
---

<article class="doc-body">
  <header>
    <h1>{title}</h1>
    {description && <p class="description">{description}</p>}
  </header>

  <div class="content" set:html={content} />

  <slot />  <!-- For pagination -->
</article>
```

### Outline

**File:** `src/layouts/docs/default/Outline.astro`

Table of contents with scroll spy.

```astro
---
interface Props {
  headings: Heading[];
  title?: string;
}

interface Heading {
  depth: number;   // 1-6
  slug: string;    // heading-id
  text: string;    // Heading text
}
---

<nav class="outline">
  <h4>{title || 'On this page'}</h4>
  <ul>
    {headings.filter(h => h.depth <= 3).map(heading => (
      <li class={`depth-${heading.depth}`}>
        <a href={`#${heading.slug}`}>{heading.text}</a>
      </li>
    ))}
  </ul>
</nav>
```

### Pagination

**File:** `src/layouts/docs/default/Pagination.astro`

Prev/Next navigation links.

```astro
---
interface Props {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}
---

<nav class="pagination">
  {prev && (
    <a href={prev.href} class="prev">
      <span>← Previous</span>
      <span>{prev.title}</span>
    </a>
  )}
  {next && (
    <a href={next.href} class="next">
      <span>Next →</span>
      <span>{next.title}</span>
    </a>
  )}
</nav>
```

## Blog Components

All blog components live in `src/layouts/blogs/default/`.

### IndexBody

**File:** `src/layouts/blogs/default/IndexBody.astro`

Grid of post cards. **Loads posts itself** from `dataPath`:

```astro
---
interface Props {
  dataPath: string;
  postsPerPage?: number;
}
---
```

### PostBody

**File:** `src/layouts/blogs/default/PostBody.astro`

Single post with metadata.

```astro
---
interface Props {
  title: string;
  date: string;
  author?: string;
  tags?: string[];
  content: string;
}
---
```

### PostCard

**File:** `src/layouts/blogs/default/PostCard.astro`

Card for blog listing.

```astro
---
interface Props {
  title: string;
  description?: string;
  date: string;
  slug: string;
  href: string;
  image?: string;
}
---
```

## Custom Components

### Hero

**File:** `src/layouts/custom/home/Hero.astro`

Landing page hero section.

```astro
---
interface Props {
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}
---
```

### Features

**File:** `src/layouts/custom/home/Features.astro`

Feature grid section.

```astro
---
interface Props {
  features: {
    icon?: string;
    title: string;
    description: string;
  }[];
}
---
```

### Content

**File:** `src/layouts/custom/info/Content.astro`

Simple title + description renderer for info pages.

## Navbar & Footer Components

Navbar and footer layouts load their own config internally — they receive no content props from the page.

### NavbarDefault

**File:** `src/layouts/navbar/default/index.astro`

Full-featured navbar with logo, links, and dropdowns.

```astro
---
import { loadNavbarConfig, getSiteLogo } from '@loaders/config';

const config = loadNavbarConfig();
const logo = getSiteLogo();
---
```

### FooterDefault

**File:** `src/layouts/footer/default/index.astro`

Multi-column footer with links and social icons.

```astro
---
import { loadFooterConfig } from '@loaders/config';

const config = loadFooterConfig();
---
```

## Cross-Variant Imports

When a layout variant needs a component from another variant, use a relative import:

```astro
---
// compact/Layout.astro — reuses components from default
import Body from '../default/Body.astro';
import Outline from '../default/Outline.astro';
import Pagination from '../default/Pagination.astro';
---
```

For **external layouts** (outside `src/`), use the Vite alias instead of relative paths:

```astro
---
import Body from '@layouts/docs/default/Body.astro';
import Outline from '@layouts/docs/default/Outline.astro';
---
```

## Composition Example

How `default` composes its components:

```astro
---
// docs/default/Layout.astro
import Sidebar from './Sidebar.astro';
import Body from './Body.astro';
import Outline from './Outline.astro';
import Pagination from './Pagination.astro';
import { MAX_SUBFOLDER_DEPTH } from '@parsers/core/order-prefix';

const { content: allContent, settings } = await loadContentWithSettings(dataPath);
const sidebarNodes = buildSidebarTree(allContent, baseUrl, dataPath);
const { prev, next } = getPrevNext(sidebarNodes, currentPath);
---

<div class="docs-layout">
  <Sidebar
    nodes={sidebarNodes}
    currentPath={currentPath}
    maxDepth={MAX_SUBFOLDER_DEPTH}
  />

  <Body title={title} description={description} content={content}>
    <Pagination prev={prev} next={next} />
  </Body>

  <Outline headings={headings} title={settings.outline?.title} />
</div>
```

Different layouts can mix and match components or exclude them entirely.
