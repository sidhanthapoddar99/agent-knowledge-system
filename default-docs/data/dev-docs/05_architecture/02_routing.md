---
title: Routing System
description: How URLs map to content and layouts
---

# Routing System

The framework uses a single dynamic route to handle all pages, with layout resolution based on page configuration.

## Single Entry Point

All routes flow through `src/pages/[...slug].astro`:

```
/                           → slug = undefined (home)
/docs                       → slug = ["docs"]
/docs/getting-started       → slug = ["docs", "getting-started"]
/docs/getting-started/intro → slug = ["docs", "getting-started", "intro"]
/blog                       → slug = ["blog"]
/blog/hello-world           → slug = ["blog", "hello-world"]
```

## Route Resolution Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  URL: /docs/getting-started/overview         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Match Page Config                                   │
│  ─────────────────────────                                   │
│  pages.docs.base_url: "/docs" ✓                              │
│  Remaining path: getting-started/overview                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Select Parser                                       │
│  ────────────────────                                        │
│  Content type: docs → DocsParser                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Resolve Content Path                                │
│  ────────────────────────────                                │
│  data/docs/getting-started/NN_overview.md                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Parse Content                                       │
│  ─────────────────────                                       │
│  Preprocessors → Render → Postprocessors                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 5: Resolve Layout                                      │
│  ──────────────────────                                      │
│  @docs/default → layouts/docs/default/                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 6: Render                                              │
│  ─────────────────                                           │
│  Layout.astro with content, sidebar, pagination              │
└──────────────────────────────────────────────────────────────┘
```

## Page Configuration

Define pages in `site.yaml`:

```yaml
pages:
  # Documentation
  docs:
    type: docs
    base_url: "/docs"
    data: "@data/docs"
    layout: "@docs/default"

  # Blog
  blog:
    type: blog
    base_url: "/blog"
    data: "@data/blog"
    layout: "@blogs/default"

  # Home page
  home:
    type: custom
    base_url: "/"
    data: "@data/pages/home.yaml"
    layout: "@custom/home"

  # About page
  about:
    type: custom
    base_url: "/about"
    data: "@data/pages/about.yaml"
    layout: "@custom/info"
```

## URL Structure

### Documentation URLs

```
File:  data/docs/getting-started/01_overview.md
URL:   /docs/getting-started/overview
       └─┬─┘ └───────┬───────┘ └───┬───┘
     base_url    folder      clean slug
```

The `01_` prefix is stripped from the URL, used only for ordering.

### Blog URLs

```
File:  data/blog/2024-01-15-hello-world.md
URL:   /blog/hello-world
       └─┬─┘ └─────┬─────┘
     base_url  clean slug (date stripped)
```

### Custom Page URLs

```
Config: base_url: "/about"
URL:    /about
```

Custom pages use exact URL matching.

## Layout Resolution

Layout aliases map to filesystem paths:

### Documentation Layouts

```
@docs/default
  ↓
src/layouts/docs/default/Layout.astro
```

### Blog Layouts

```
@blogs/default
  ↓
src/layouts/blogs/default/IndexLayout.astro  (for /blog)
src/layouts/blogs/default/PostLayout.astro   (for /blog/*)
```

### Custom Page Layouts

```
@custom/home
  ↓
src/layouts/custom/home/Layout.astro
```

### Layout Validation

Missing layouts trigger build errors:

```
[CONFIG ERROR] Docs layout "nonexistent" does not exist.
  Page: docs
  Config: @docs/nonexistent
  Expected: src/layouts/docs/nonexistent/Layout.astro
  Available: default, compact
```

## Static Path Generation

At build time, `getStaticPaths()` generates all routes:

```typescript
export async function getStaticPaths() {
  const paths = [];
  const pages = await getPages();

  for (const [name, config] of Object.entries(pages)) {
    switch (config.type) {
      case 'docs':
        // Load all docs and create path for each
        const docs = await loadContent(config.data, 'docs');
        for (const doc of docs) {
          paths.push({
            params: { slug: buildSlug(config.base_url, doc.slug) },
            props: { page: name, content: doc }
          });
        }
        break;

      case 'blog':
        // Blog index
        paths.push({
          params: { slug: config.base_url.split('/').filter(Boolean) },
          props: { page: name, isIndex: true }
        });
        // Individual posts
        const posts = await loadContent(config.data, 'blog');
        for (const post of posts) {
          paths.push({
            params: { slug: buildSlug(config.base_url, post.slug) },
            props: { page: name, content: post }
          });
        }
        break;

      case 'custom':
        // Single custom page
        paths.push({
          params: { slug: config.base_url.split('/').filter(Boolean) },
          props: { page: name }
        });
        break;
    }
  }

  return paths;
}
```

## Index Pages

### Documentation Index

`/docs` behavior:
1. If `index.md` exists in `data/docs/`, render it
2. Otherwise, redirect to first doc in first section

### Blog Index

`/blog` renders `IndexLayout.astro` showing all posts:

```
/blog         → IndexLayout.astro (list of posts)
/blog/my-post → PostLayout.astro (single post)
```

### Section Index

Folder index files (`index.md`) are optional:
- If present: Renders as the section landing page
- If absent: Section shows as non-clickable header in sidebar

## Content Type Routing

| Type | URL Pattern | Content Source | Parser |
|------|-------------|----------------|--------|
| `docs` | `/base/*/**` | Folder of `.md` files | DocsParser |
| `blog` | `/base/*` | Folder of dated `.md` files | BlogParser |
| `custom` | `/base` (exact) | Single YAML/JSON file | - |

## Alias Resolution

Path aliases are resolved at build time:

| Alias | Resolves To |
|-------|-------------|
| `@data/` | `default-docs/data/` |
| `@assets/` | `default-docs/assets/` |
| `@config/` | `default-docs/config/` |
| `@docs/` | `src/layouts/docs/` |
| `@blogs/` | `src/layouts/blogs/` |
| `@custom/` | `src/layouts/custom/` |

## Props Passed to Layouts

### Documentation Layout

```typescript
interface DocsLayoutProps {
  content: LoadedContent;     // Current page content
  sidebar: SidebarItem[];     // Navigation tree
  pagination: {
    prev?: { title: string; slug: string };
    next?: { title: string; slug: string };
  };
  settings: ContentSettings;  // Folder settings
}
```

### Blog Layout

```typescript
// Index
interface BlogIndexProps {
  posts: LoadedContent[];     // All blog posts
  settings: ContentSettings;
}

// Post
interface BlogPostProps {
  content: LoadedContent;     // Current post
  settings: ContentSettings;
}
```

### Custom Layout

```typescript
interface CustomLayoutProps {
  data: Record<string, unknown>;  // YAML/JSON data
}
```

## 404 Handling

Unmatched routes use Astro's default 404.

Create `src/pages/404.astro` for custom 404 page:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
---

<BaseLayout title="Page Not Found">
  <h1>404 - Page Not Found</h1>
  <p>The page you're looking for doesn't exist.</p>
  <a href="/">Go home</a>
</BaseLayout>
```

## Dynamic Imports

Layouts are loaded using Vite's `import.meta.glob`:

```typescript
const layouts = import.meta.glob('/src/layouts/**/*.astro');

async function getLayout(alias: string) {
  const path = resolveLayoutAlias(alias);
  const loader = layouts[path];

  if (!loader) {
    throw new Error(`Layout not found: ${alias}`);
  }

  return (await loader()).default;
}
```

This enables:
- Build-time validation of all layouts
- Tree-shaking of unused layouts
- Type-safe layout props
