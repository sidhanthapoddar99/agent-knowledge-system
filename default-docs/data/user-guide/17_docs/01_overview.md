---
title: Docs Overview
description: Quick introduction to writing documentation
sidebar_position: 1
---

# Writing Documentation

Documentation files are `.md` files stored under `data/<doc-name>/` (the actual path is whatever you register via `site.yaml pages:` and resolve through the `@data` alias — the default convention is `data/docs/` but you can have multiple doc sections, e.g. `data/user-guide/`, `data/dev-docs/`). This section covers everything you need to know to create well-organized documentation.

Sibling content types: [Blogs](/user-guide/blogs/overview) for date-ordered posts, [Issues](/user-guide/issues/overview) for the folder-per-item tracker.

## Quick Reference

| Topic | Description |
|-------|-------------|
| [Structure](./structure) | Naming conventions with `NN_` prefix (2–5 digits) |
| [Folder Settings](./folder-settings) | Configure `settings.json` for each folder |
| [Frontmatter](./frontmatter) | Required and optional metadata fields |
| [Asset Embedding](./asset-embedding) | Detailed asset management for docs |

## Key Rules Summary

1. **All files and folders must have an `NN_` prefix** (2–5 digits, sorted by numeric value)
2. **Every folder needs `settings.json`** (except root doc folder)
3. **Every file needs frontmatter** with at least `title`
4. **Assets folder is excluded** from sidebar indexing

## Example Structure

```
data/docs/
├── 01_getting-started/
│   ├── settings.json
│   ├── 01_overview.md
│   ├── 02_installation.md
│   └── assets/
│       └── diagram.png
│
├── 02_guides/
│   ├── settings.json
│   ├── 01_basics.md
│   └── 02_advanced.md
│
└── 03_api/
    ├── settings.json
    └── 01_endpoints.md
```

## Processing

Docs are processed using the `DocsParser` which:

- Parses `NN_` prefix (2–5 digits) for ordering
- Resolves assets relative to the file
- Generates clean URLs (prefix stripped)
