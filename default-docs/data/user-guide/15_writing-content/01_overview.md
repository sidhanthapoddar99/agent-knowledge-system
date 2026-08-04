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
| **Docs** | [/user-guide/docs/overview](../17_docs/01_overview.md) | `data/<doc-name>/` | `/<base>/<slug>` |
| **Blogs** | [/user-guide/blogs/overview](../18_blogs/01_overview.md) | `data/<blog-name>/` | `/<base>` + `/<base>/<slug>` |
| **Issues** | [/user-guide/issues/overview](../19_issues/01_overview.md) | `data/<issues-name>/` | `/<base>` + `/<base>/<id>` |
| **Custom pages** | via `site.yaml pages:` | `data/pages/` | configurable |

Folder names (`docs`, `blog`, `issues`, `pages`) are convention — the actual paths come from `site.yaml paths:` aliases. See [Data Structure](../05_getting-started/04_data-structure.md) for the full picture.

## What this section covers

| Page | Purpose |
|------|---------|
| [Markdown Basics](./02_markdown-basics.md) | Standard markdown syntax, callouts, collapsibles, and diagrams |
| [Asset Embedding](./03_asset-embedding.md) | The `[[path]]` syntax for inlining file contents |
| [Page Outline](./04_outline.md) | How the auto-generated table of contents works |
| [Drafts](./05_drafts.md) | `draft: true` — visible in dev, hidden in production |
| [Naming & the Sidebar](./10_naming-and-sidebar/01_overview.md) | How files and folders are named, and exactly what shows in the navigation sidebar for each content type — a shared prefix-grammar reference plus visual file-tree → sidebar artifacts for docs, blogs, and issues |

For the broader dev vs prod runtime story (what differs when you run `./start dev` vs `./start build`, and how to hide whole sections / navbar items), see [Dev Mode](../10_configuration/06_dev-mode.md) in the Configuration section.

## What this section does **not** cover

- **Frontmatter fields** — each content type defines its own (title, description, date, status, etc.). See the relevant authoring guide.
- **Folder structure and `settings.json`** — covered under [Docs](../17_docs/01_overview.md) and [Issues](../19_issues/01_overview.md) respectively. Blogs are flat and need neither.
- **Layouts** — [Layout System](../16_layout-system/01_overview.md) explains how content renders.

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
