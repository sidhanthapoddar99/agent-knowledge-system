---
title: Writing Content Overview
description: Common markdown conventions for every content type in the system
sidebar_position: 1
---

# Writing Content

This section covers the markdown conventions that apply to **every** content type in the system — docs, blogs, issues, and custom pages alike. Each content type has its own folder structure, frontmatter, and routing rules (covered in their own sections); what you'll find here is the writing layer that sits on top of all of them.

## The four content types

| Type | Authoring guide | Folder | URL shape |
|------|-----------------|--------|-----------|
| **Docs** | [/user-guide/docs/overview](/user-guide/docs/overview) | `data/<doc-name>/` | `/<base>/<slug>` |
| **Blogs** | [/user-guide/blogs/overview](/user-guide/blogs/overview) | `data/<blog-name>/` | `/<base>` + `/<base>/<slug>` |
| **Issues** | [/user-guide/issues/overview](/user-guide/issues/overview) | `data/<issues-name>/` | `/<base>` + `/<base>/<id>` |
| **Custom pages** | via `site.yaml pages:` | `data/pages/` | configurable |

Folder names (`docs`, `blog`, `issues`, `pages`) are convention — the actual paths come from `site.yaml paths:` aliases. See [Data Structure](/user-guide/getting-started/data-structure) for the full picture.

## What this section covers

| Page | Purpose |
|------|---------|
| [Markdown Basics](./markdown-basics) | Standard markdown syntax, callouts, collapsibles, and diagrams |
| [Asset Embedding](./asset-embedding) | The `[[path]]` syntax for inlining file contents |
| [Page Outline](./outline) | How the auto-generated table of contents works |
| [Drafts](./drafts) | `draft: true` — visible in dev, hidden in production |

For the broader dev vs prod runtime story (what differs when you run `./start dev` vs `./start build`, and how to hide whole sections / navbar items), see [Dev Mode](/user-guide/configuration/dev-mode) in the Configuration section.

## What this section does **not** cover

- **Frontmatter fields** — each content type defines its own (title, description, date, status, etc.). See the relevant authoring guide.
- **Folder structure and `settings.json`** — covered under [Docs](/user-guide/docs/overview) and [Issues](/user-guide/issues/overview) respectively. Blogs are flat and need neither.
- **Layouts** — [Layout System](/user-guide/layout-system/overview) explains how content renders.

## Common processing pipeline

All markdown — regardless of content type — flows through the same parser:

```
Raw markdown
   ↓
Preprocessors     ← frontmatter extraction, [[asset]] embedding
   ↓
Renderer          ← markdown → HTML (+ syntax highlighting, diagrams)
   ↓
Postprocessors    ← heading IDs, link rewriting, final HTML
```

The same source file behaves the same way in every content type. The only things that differ are: where frontmatter fields are interpreted, how paths inside `[[...]]` resolve, and what the surrounding layout renders around the HTML.
