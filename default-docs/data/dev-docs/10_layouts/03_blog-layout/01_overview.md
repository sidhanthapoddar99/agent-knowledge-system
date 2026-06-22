---
title: Blog Layouts Overview
description: Understanding blog layouts and their dual-page structure
---

# Blog Layouts

Blog layouts handle date-based content with two distinct views: an index page showing all posts, and individual post pages showing full content.

## Key Difference from Docs

Unlike docs layouts (single `Layout.astro`), blog layouts require **two components**:

| Component | Purpose | URL Pattern |
|-----------|---------|-------------|
| `IndexLayout.astro` | Post listing/grid | `/blog` |
| `PostLayout.astro` | Single post view | `/blog/{slug}` |

```
src/layouts/blogs/default/
├── IndexLayout.astro    # List of posts (cards/grid)
└── PostLayout.astro     # Individual post page
```

## Available Layouts

| Layout | Index Style | Post Style |
|--------|-------------|------------|
| `default` | Card grid | Full-width article |

## Visual Structure

### IndexLayout (Post Listing)

```
┌──────────────────────────────────────────────────────────────────┐
│                           Navbar                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Blog                                                           │
│   Latest posts and updates                                       │
│                                                                  │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│   │     Image       │  │     Image       │  │     Image       │  │
│   │                 │  │                 │  │                 │  │
│   │   Post Title    │  │   Post Title    │  │   Post Title    │  │
│   │   Jan 15, 2024  │  │   Jan 10, 2024  │  │   Jan 5, 2024   │  │
│   │   Description   │  │   Description   │  │   Description   │  │
│   │   [tag] [tag]   │  │   [tag]         │  │   [tag] [tag]   │  │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                           Footer                                 │
└──────────────────────────────────────────────────────────────────┘
```

### PostLayout (Single Post)

```
┌──────────────────────────────────────────────────────────────────┐
│                           Navbar                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Post Title                                                     │
│   By Author Name · January 15, 2024                              │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│                                                                  │
│   Post content goes here...                                      │
│                                                                  │
│   Lorem ipsum dolor sit amet, consectetur adipiscing elit.       │
│   Sed do eiusmod tempor incididunt ut labore et dolore magna.    │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│                                                                  │
│   Tags: [announcement] [feature]                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                           Footer                                 │
└──────────────────────────────────────────────────────────────────┘
```

## File Location

```
src/layouts/blogs/
└── default/                     # All blog components in one folder
    ├── IndexLayout.astro        # Post listing
    ├── PostLayout.astro         # Single post
    ├── IndexBody.astro          # Grid logic
    ├── PostBody.astro           # Post rendering
    └── PostCard.astro           # Individual card
```

All styling for blog layouts is provided by the theme (e.g., `blogs.css` in `src/styles/`). Layout and component files contain only HTML structure with CSS classes -- no CSS files, no `<style>` blocks, and no CSS imports.

## Routing

Blog layouts are used when:

1. Page type is `blog` in `site.yaml`
2. URL matches the `base_url` pattern

```yaml
# site.yaml
pages:
  blog:
    base_url: "/blog"
    type: blog                    # ← Triggers blog layouts
    layout: "@blog/default"
    data: "@data/blog"
```

**URL patterns:**
- `/blog` → IndexLayout (post listing)
- `/blog/hello-world` → PostLayout (single post)
- `/blog/2024-feature-update` → PostLayout (single post)

## Content Organization

Blog posts use date-prefixed filenames:

```
data/blog/
├── 2024-01-15-hello-world.md
├── 2024-01-20-feature-update.md
├── 2024-02-01-roadmap.md
└── assets/
    └── images/
```

**Filename pattern:** `YYYY-MM-DD-slug.md`

- Date is extracted for sorting and display
- Slug becomes the URL: `/blog/hello-world`
- Posts sorted newest first by default

## Features

### Automatic Sorting

Posts are automatically sorted by date (newest first):

```typescript
const posts = await loadContent(dataPath, {
  pattern: '*.{md,mdx}',
  sort: 'date',
  order: 'desc',    // Newest first
});
```

### Post Cards

The IndexLayout displays posts as cards with:

- Featured image (optional)
- Title
- Date
- Author (optional)
- Description/excerpt
- Tags

### Metadata Display

PostLayout shows rich metadata:

- Title
- Author
- Publication date
- Reading time (if configured)
- Tags

### Tag System

Posts can have tags for categorization:

```yaml
---
title: New Feature Announcement
tags: [announcement, feature, v2]
---
```

Tags appear on both cards and post pages.

## Configuration

### Site Configuration

```yaml
# site.yaml
pages:
  blog:
    base_url: "/blog"
    type: blog
    layout: "@blog/default"
    data: "@data/blog"
    options:
      postsPerPage: 10     # Optional: posts on index
```

### Post Frontmatter

```yaml
---
title: Post Title              # Required
description: Brief summary     # Optional - shown on cards
date: 2024-01-15              # Optional - overrides filename date
author: John Doe              # Optional
tags: [news, update]          # Optional
image: ./assets/cover.jpg     # Optional - featured image
draft: true                   # Optional - hides in production
---
```

## No Sidebar or Outline

Unlike docs layouts, blog layouts typically don't include:

- **Sidebar navigation**: Posts are accessed via the index or direct links
- **Table of contents**: Post pages are usually linear reads

This keeps the focus on content consumption rather than navigation.

## Differences from Docs

| Feature | Docs | Blog |
|---------|------|------|
| Layout files | 1 (`Layout.astro`) | 2 (`Index` + `Post`) |
| Navigation | Sidebar tree | Card grid |
| Ordering | `NN_` prefix (position) | Date prefix (chronological) |
| URL structure | Hierarchical | Flat |
| Content focus | Reference | Narrative |
| TOC/Outline | Yes | No |
| Pagination | Prev/Next by position | None (or by date) |
