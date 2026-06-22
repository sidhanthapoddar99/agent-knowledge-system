---
title: Pages Configuration
description: Define pages and their layouts in site.yaml
---

# Pages Configuration

The `pages:` block in `site.yaml` defines all pages on your site.

## Location

```
config/site.yaml → pages:
```

## Structure

```yaml
# site.yaml
site:
  # ... site metadata

pages:
  docs:
    base_url: "/docs"
    type: docs
    layout: "@docs/default"
    data: "@data/docs/final_docs"

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

## Page Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `base_url` | `string` | Yes | URL path for this section |
| `type` | `string` | Yes | Content type: `docs`, `blog`, `issues`, or `custom` |
| `layout` | `string` | Yes | Layout alias to use |
| `data` | `string` | Yes | Path to content directory or file |

## Page Types

### `type: docs`

Documentation pages with sidebar navigation:

```yaml
docs:
  base_url: "/docs"
  type: docs
  layout: "@docs/default"
  data: "@data/docs/final_docs"
```

- Uses `NN_` prefix for ordering
- Generates sidebar from folder structure
- Supports nested folders

### `type: blog`

Blog posts with date-based ordering:

```yaml
blog:
  base_url: "/blog"
  type: blog
  layout: "@blog/default"
  data: "@data/blog"
```

- Uses `YYYY-MM-DD-slug` naming
- Automatic chronological sorting
- Generates blog index page

### `type: issues`

Issue tracker — folder-per-item content with supporting sub-docs:

```yaml
todo:
  base_url: "/todo"
  type: issues
  layout: "@issues/default"
  data: "@data/issues"
```

- Each issue is its own folder (`YYYY-MM-DD-<slug>/`)
- Supports subtasks, notes, comments, and agent-log sub-documents
- Tracker-wide vocabulary declared in the data folder's root `settings.json`

### `type: custom`

Custom pages with YAML data:

```yaml
home:
  base_url: "/"
  type: custom
  layout: "@custom/home"
  data: "@data/pages/home.yaml"
```

- Single YAML data file
- Complete design control

## Layout Aliases

| Alias Pattern | Resolves To |
|---------------|-------------|
| `@docs/<style>` | `src/layouts/docs/<style>/` |
| `@blog/<style>` | `src/layouts/blogs/<style>/` |
| `@issues/<style>` | `src/layouts/issues/<style>/` |
| `@custom/<style>` | `src/layouts/custom/<style>/` |

## Data Aliases

| Alias Pattern | Resolves To |
|---------------|-------------|
| `@data/path` | `paths.data/path` |
| `@data/file.yaml` | `paths.data/file.yaml` |

## Multiple Documentation Sections

You can define multiple independent doc sections:

```yaml
pages:
  docs:
    base_url: "/docs"
    type: docs
    layout: "@docs/default"
    data: "@data/docs/final_docs"

  layouts:
    base_url: "/docs/layouts"
    type: docs
    layout: "@docs/default"
    data: "@data/docs/layouts"

  components:
    base_url: "/docs/components"
    type: docs
    layout: "@docs/default"
    data: "@data/docs/components"
```

Each section:
- Has its own URL path
- Has its own sidebar
- Can use different layouts
- Is independent in navigation

## Page References

Other configs can reference pages by name:

```yaml
# In footer.yaml
links:
  - label: "Blog"
    page: "blog"    # Resolves to "/blog"
  - label: "About"
    page: "about"   # Resolves to "/about"
```

## TypeScript Interface

```typescript
type PageType = 'docs' | 'blog' | 'issues' | 'custom';

interface PageConfig {
  base_url: string;
  type: PageType;
  layout: string;
  data: string;
}

interface SiteConfig {
  site: SiteMetadata;
  pages: Record<string, PageConfig>;
}
```

## Helper Functions

```typescript
import { getPages, getPage, resolvePageUrl } from '@loaders/config';

// Get all pages
const pages = getPages();

// Get specific page
const blogConfig = getPage('blog');

// Resolve page name to URL
const blogUrl = resolvePageUrl('blog'); // "/blog"
```

## Route Validation

The system validates routes at build time:

```typescript
import { validateRoutes, getPages } from '@loaders/config';

const errors = validateRoutes(getPages());
// Returns errors for overlapping routes (except /)
```

Example error:
```
Overlapping routes: "docs" (/docs) and "api" (/docs/api)
```
