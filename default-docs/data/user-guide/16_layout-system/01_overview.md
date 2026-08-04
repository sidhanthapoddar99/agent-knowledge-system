---
title: Layout System Overview
description: What layouts are, the 4 content types, how a layout gets picked, and when to write your own
sidebar_position: 1
---

# Layout System

A **layout** is an Astro component that renders a specific type of page. The framework ships with layouts for every content type (docs, blogs, issues, custom pages) plus navbar and footer variants. Layouts are **pluggable** — the framework picks one at route time based on `site.yaml` configuration.

This section covers the user-facing side of layouts: what's available, how to switch between them, and how to ship your own. For the deep internals (`parts/` splitting, client-side JS patterns, routing additions), see the dev-docs.

## Layout vs theme

| | **Layout** | **Theme** |
|---|---|---|
| What | Astro components (structure) | CSS files (styling) |
| Defines | HTML structure, page regions, component tree | Colours, fonts, spacing, chrome styles |
| Swappable? | Yes — pick different layouts per page in `site.yaml` | Yes — one active theme per site |
| Analogy | The skeleton | The skin |

A single layout can render radically differently under different themes (light/dark, minimal/full-width). A single theme can apply across many layouts. They're orthogonal.

See [Themes](../25_themes/01_overview.md) for the styling side.

## The four content types

Every page in the site belongs to one of four content types. Each has its own layout conventions:

| Type | Data shape | Routing | Example layouts |
|---|---|---|---|
| **docs** | Folder of markdown + `settings.json` | `/<base>/<slug>` | `@docs/default` (sidebar + outline), `@docs/compact` (no sidebar) |
| **blog** | Flat markdown files (`YYYY-MM-DD-<slug>.md`) | `/<base>` index + `/<base>/<slug>` detail | `@blog/default` (cards + posts) |
| **issues** | Folder-per-item (`YYYY-MM-DD-<slug>/`) with `settings.json` + sub-docs | `/<base>` index + `/<base>/<id>` detail | `@issues/default` (filter bar + three-column detail) |
| **custom** | Single YAML file per page, schema defined by layout | `/<base>` | `@custom/home`, `@custom/info`, `@custom/countdown` |

Plus two chrome layouts applied to every page:

| Type | Purpose | Example variants |
|---|---|---|
| **navbar** | Site-wide top bar | `@navbar/default`, `@navbar/minimal` |
| **footer** | Site-wide bottom block | `@footer/default`, `@footer/minimal` |

## Layout resolution — the `@<type>/<style>` alias

Layouts are referenced with a two-segment alias:

```
@<type>/<style>
```

- **`<type>`** — the content type: `docs`, `blog`, `issues`, `custom`, `navbar`, `footer`
- **`<style>`** — the style name: `default`, `compact`, `minimal`, `home`, `info`, `countdown`, etc.

The alias resolves through `src/loaders/alias.ts`:

| Alias | Resolves to |
|---|---|
| `@docs/default` | `src/layouts/docs/default/` |
| `@docs/compact` | `src/layouts/docs/compact/` |
| `@blog/default` | `src/layouts/blogs/default/` |
| `@issues/default` | `src/layouts/issues/default/` |
| `@custom/home` | `src/layouts/custom/home/` |
| `@navbar/minimal` | `src/layouts/navbar/minimal/` |

## How layouts get picked

In `site.yaml`, each page entry declares which layout(s) to use:

```yaml
pages:
  docs:
    base_url: "/docs"
    type: docs
    layout: "@docs/default"      # ← here
    data: "@data/docs"

  blog:
    base_url: "/blog"
    type: blog
    layout_index: "@blog/default"   # index view (list of posts)
    layout_detail: "@blog/default"  # detail view (single post)
    data: "@data/blog"

  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

Index+detail types (blog, issues) accept `layout_index` + `layout_detail` separately. Single-surface types (docs, custom) accept one `layout:`.

At route time, `src/pages/[...slug].astro` reads the page config, resolves the alias, and invokes the matching Astro component. Full detail: [Switching Layout Styles](./02_switching-styles.md).

## The flow, end to end

```
Request to /docs/getting-started/overview
       │
       ▼
Route handler (src/pages/[...slug].astro)
       │
       ▼
Match URL → find page config in site.yaml
       │
       ├── type:   docs
       ├── layout: "@docs/default"
       └── data:   "@data/docs"
       │
       ▼
Resolve alias @docs/default → src/layouts/docs/default/
       │
       ▼
Load Layout.astro from that folder
       │
       ▼
Layout receives props (content, headings, dataPath, etc.)
       │
       ▼
Layout renders HTML (with theme CSS injected by BaseLayout)
       │
       ▼
Response
```

`BaseLayout.astro` wraps every page — it injects the active theme's CSS into `<head>` and provides the root HTML shell. It's **not swappable** (every layout renders inside it).

## User-shippable layouts — `@ext-layouts`

You can ship your own layout style without editing `src/layouts/`. Drop it in a user-configured directory (typically `layouts/<type>/<style>/` at your project root, sibling of `config/` and `data/`), set `LAYOUT_EXT_DIR` in `.env`, and the new layout is immediately available via the same `@<type>/<style>` alias — with **override-by-name** semantics against built-ins.

Full walkthrough: [Custom Layout Styles](./03_custom-layout-styles.md).

## When you need a new layout

Common customisation paths, in order of how often you'll reach for each:

| Want to change | Use |
|---|---|
| Colours, fonts, spacing | [Theme](../25_themes/01_overview.md) override — no layout work |
| Component styling (navbar look, footer feel) | Theme override of `navbar.css` / `footer.css` |
| Switch to a simpler docs chrome (no sidebar) | `layout: "@docs/compact"` in `site.yaml` |
| Swap navbar / footer style | `layout_navbar: "@navbar/minimal"` etc. in `site.yaml` |
| Render a completely different page structure (Kanban view, card grid) | **New layout** — ship via `@ext-layouts` |

Most projects never write a custom layout. **If theme overrides + style switching can cover the need, they should.** Writing a layout is the last resort, not the first.

## What's in this section

| Page | Covers |
|---|---|
| [Switching Layout Styles](./02_switching-styles.md) | Picking built-in styles · `site.yaml` fields · what ships · dev-toolbar switcher |
| [Custom Layout Styles](./03_custom-layout-styles.md) | `LAYOUT_EXT_DIR` setup · `@ext-layouts` alias · import rules · override behaviour |

## See also

- [Themes](../25_themes/01_overview.md) — styling layer (where most customisation happens)
- [Docs content type](../17_docs/01_overview.md) · [Blogs](../18_blogs/01_overview.md) · [Issues](../19_issues/01_overview.md) · [Custom pages](../20_custom-pages/01_overview.md)
- [Page Configuration](../10_configuration/03_site/08_page.md) — full `pages:` entry schema in `site.yaml`
