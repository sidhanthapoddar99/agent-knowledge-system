# Blog content type — reference

How to add and configure blog posts.

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/18_blogs/` — read those pages when this reference is unclear.

> **Status:** stub. Detailed spec under `2025-06-25-claude-skills/subtasks/05_blog-layout-skill.md`. For now, this file captures the essentials.

---

## File naming

Blog posts are **flat files** (no folders, no `XX_` prefix) under the project's `data/blog/`:

```
blog/
├── 2026-04-19-introducing-issues.md
├── 2026-04-22-typography-tokens.md
└── 2026-04-25-deployment-guide.md
```

**Naming pattern:** `YYYY-MM-DD-<kebab-case-slug>.md`

The date prefix sorts posts chronologically (newest first by default) and becomes the canonical post date.

## Frontmatter

```yaml
---
title: "Post title"               ← required
description: "1-2 sentence lede shown on the index card"
date: 2026-04-25                  ← optional; falls back to filename date
author: "Sidhantha"
tags: ["release", "issues"]
draft: false
featured: false                   ← pinned to top of index
cover: /assets/blog/cover.png     ← optional cover image
---
```

## Index page

Auto-generated at `/blog/`. Shows:
- Featured posts pinned to top
- Reverse-chronological order
- Tag facet (click a tag to filter)

## Asset embedding

Same as other content — assets live in `assets/blog/<post-slug>/` and are referenced as `/assets/blog/<post-slug>/<file>`.

## URL

`data/blog/2026-04-19-introducing-issues.md` → `/blog/introducing-issues` (date stripped from URL).

## Validate

The plugin ships **`docs-check-blog`** (on your `PATH` after install) — runs structural checks against the blog folder so you don't have to eyeball it.

```bash
# Default: resolves the blog path from .env (`<content-root>/blog/`)
docs-check-blog

# Or point at any folder explicitly
docs-check-blog ./data/blog
```

What it checks:
- Filename matches `YYYY-MM-DD-<kebab-case-slug>.md`
- Frontmatter `title:` is present
- No nested folders (the blog is flat — `assets/` is the only allowed subfolder)

Exit code `0` = clean, `1` = errors found. Run after creating a new post or if anything renders unexpectedly.

## Cross-references

- `@root/default-docs/data/user-guide/18_blogs/` (the framework's bundled user-guide) — full section
- `references/writing.md` — markdown / frontmatter basics
- `references/settings-layout.md` — `site.yaml` blog config (per_page, sort, etc.)
