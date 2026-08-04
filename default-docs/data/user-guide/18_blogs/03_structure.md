---
title: Blog Structure
description: Date-based file naming for blog posts
sidebar_position: 3
---

# Blog File Structure

Blog posts use date-based naming for organization and automatic sorting.

## Naming Convention

**Format:** `YYYY-MM-DD-slug.md`

```
blog/
├── 2024-01-15-hello-world.md
├── 2024-01-20-getting-started.md
├── 2024-02-01-advanced-features.md
└── 2024-02-15-tips-and-tricks.md
```

## Naming Rules

| Component | Format | Example |
|-----------|--------|---------|
| Year | `YYYY` | `2024` |
| Month | `MM` | `01`, `12` |
| Day | `DD` | `05`, `31` |
| Slug | lowercase, hyphens | `hello-world` |
| Extension | `.md` | `.md` |

## URL Generation

The date prefix is stripped from the URL:

| Filename | URL |
|----------|-----|
| `2024-01-15-hello-world.md` | `/blog/hello-world` |
| `2024-02-01-new-feature.md` | `/blog/new-feature` |
| `2024-12-25-year-review.md` | `/blog/year-review` |

## Sorting

Posts are sorted by date (newest first). The date comes from:

1. **Frontmatter `date`** (takes priority)
2. **Filename date** (fallback)

```yaml
---
title: My Post
date: 2024-03-01  # This date is used for sorting
---
```

Even if the filename is `2024-01-15-my-post.md`, the post will be sorted as March 1st.

## Flat Structure

Unlike docs, blogs use a **flat structure** (no nested folders):

```
# Good - flat structure
blog/
├── 2024-01-15-intro.md
├── 2024-02-01-guide.md
└── 2024-03-01-update.md

# Not supported - nested folders
blog/
├── 2024/
│   └── january/
│       └── intro.md  # Won't work
```

## Assets Folder

Blog assets are stored in a central location:

```
blog/
├── 2024-01-15-hello-world.md
├── 2024-02-01-new-feature.md
└── assets/
    ├── 2024-01-15-hello-world/
    │   ├── cover.jpg
    │   └── diagram.png
    └── 2024-02-01-new-feature/
        └── screenshot.png
```

See [Asset Embedding](./05_asset-embedding.md) for details.

## Best Practices

1. **Use meaningful slugs** - `building-rest-api` not `post-1`
2. **Keep slugs short** - For cleaner URLs
3. **Use lowercase** - Always lowercase with hyphens
4. **Be consistent** - Use same naming patterns
5. **Use frontmatter date** - For accurate sorting when backdating posts
