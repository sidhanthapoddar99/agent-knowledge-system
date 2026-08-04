---
title: Switching Layout Styles
description: Picking between built-in layout styles via site.yaml — what ships, which fields, dev-toolbar switcher
sidebar_position: 2
---

# Switching Layout Styles

The framework ships several layout styles for each content type. Switching between them is a one-line change in `site.yaml` — no code edits, no component work.

This page covers: **what styles ship**, **how to pick one in config**, and **how the dev-toolbar switcher works** for quick previewing.

## The `layout` fields in `site.yaml`

### Single-surface types (docs, custom)

```yaml
pages:
  docs:
    base_url: "/docs"
    type: docs
    layout: "@docs/default"     # ← single layout field
    data: "@data/docs"
```

### Index + detail types (blog, issues)

These have two surfaces — the list view and individual items — and accept separate layouts:

```yaml
pages:
  blog:
    base_url: "/blog"
    type: blog
    layout_index: "@blog/default"
    layout_detail: "@blog/default"
    data: "@data/blog"

  todo:
    base_url: "/todo"
    type: issues
    layout_index: "@issues/default"
    layout_detail: "@issues/default"
    data: "@data/todo"
```

You can mix — `layout_index: "@issues/default"` with `layout_detail: "@issues/kanban"` (if a `kanban` detail layout existed).

### Navbar + footer (site-wide)

These live at the top level of `site.yaml`:

```yaml
navbar: "@navbar/default"
footer: "@footer/minimal"
```

A single navbar + footer applies across every page. No per-page overrides currently.

## What ships with the default install

### Docs

| Style | Structure |
|---|---|
| `@docs/default` | Three-column: sidebar · body · outline (TOC) |
| `@docs/compact` | Two-column: body · outline (no sidebar) |

Use `default` when you have meaningful navigation depth (multi-folder docs). Use `compact` for single-folder docs or embedded documentation where space is tight.

### Blog

| Style | Structure |
|---|---|
| `@blog/default` | Card grid on index · narrow-prose post pages with tags + date |

One style ships by default — the blog surface is flat enough that multiple variants rarely earn their keep.

### Issues

| Style | Structure |
|---|---|
| `@issues/default` | Filter bar + state tabs + sortable list on index · three-column detail (sidebar + tabs + metadata form) |

One style ships. See [Issues List View](../19_issues/07_ui/01_list-view.md) and [Issues Detail View](../19_issues/07_ui/02_detail-view.md) for the full detail-page tour.

### Custom

One layout **per page type**, not per content-type collection:

| Style | What it renders |
|---|---|
| `@custom/home` | Hero + features — landing page pattern |
| `@custom/info` | Title + description + optional content — about/contact pattern |
| `@custom/countdown` | Live countdown timer — event landing pattern |

These are less "styles of the same layout" and more "distinct layouts for distinct page intents." Each consumes its own YAML schema. See [Custom Pages / Using Built-in Layouts](../20_custom-pages/02_using-built-in-layouts.md).

### Navbar

| Style | Structure |
|---|---|
| `@navbar/default` | Logo · nav items · dropdowns · theme toggle · optional search |
| `@navbar/minimal` | Logo + theme toggle only — no nav items |

### Footer

| Style | Structure |
|---|---|
| `@footer/default` | Column grid · bottom bar with copyright |
| `@footer/minimal` | Single line — copyright only |

## Swapping styles

The typical workflow:

1. Edit `site.yaml`
2. Change the `layout:` / `layout_index:` / etc. value
3. Save — dev server hot-reloads with the new layout

### Example — tighter docs layout

```diff
 pages:
   docs:
     base_url: "/docs"
     type: docs
-    layout: "@docs/default"
+    layout: "@docs/compact"
     data: "@data/docs"
```

Sidebar disappears, outline moves, content reflows. Theme and content stay identical.

### Example — minimal chrome

```diff
 # Top of site.yaml
-navbar: "@navbar/default"
+navbar: "@navbar/minimal"
-footer: "@footer/default"
+footer: "@footer/minimal"
```

Gets rid of main nav items and footer columns — useful for embedded or single-page deployments.

## Dev-toolbar layout switcher

During development, you can preview layouts **without editing config**. Astro's dev toolbar surfaces a layout-switcher app:

1. Run `./start dev`
2. Navigate to any docs / blog / issues / custom page
3. Click the toolbar icon at the bottom (appears in dev only)
4. Pick a layout from the dropdown

The page reloads with the chosen layout. This is **preview-only** — it doesn't write back to `site.yaml`. To make a switch permanent, edit the config.

The switcher also exposes theme switching — for theme changes it does write persistently, since themes live in CSS. Layouts are a config decision, so the UI respects that boundary.

## Picking the right style

A few rules of thumb:

- **Default is usually right.** Don't switch from `default` to `compact` just because `compact` sounds cooler — check whether you actually need the tradeoff. `compact` drops the sidebar, which is critical for multi-folder docs.
- **Chrome (navbar/footer) follows brand feel.** A minimalist site wants minimal chrome. A rich docs portal wants full nav.
- **Index vs detail can differ.** A blog might use a cards-style index but a simpler minimal-style post layout (if one existed). The separate fields let you mix.
- **Custom pages pick by page type.** Don't try to re-skin a `home` page with an `info` layout — they consume different YAML schemas. They're distinct layouts for distinct pages, not styles of a single layout.

## What you can't do (yet)

- **Per-page layout overrides within a content type** — a single `docs` tree uses one layout for every page. You can't say "use `compact` for this one subfolder." Workaround: mount the subfolder as a separate `pages:` entry with its own layout.
- **Runtime layout switching for end users** — the switcher is dev-only. Site visitors don't see it.
- **Conditional layout selection** (e.g. based on user agent, query param). If you need this, you're building an application, not documentation.

## See also

- [Layout System Overview](./01_overview.md) — the four content types and how resolution works
- [Custom Layout Styles](./03_custom-layout-styles.md) — ship your own style via `@ext-layouts`
- [Page Configuration](../10_configuration/03_site/08_page.md) — the full `pages:` entry schema
- [Navbar Configuration](../10_configuration/04_navbar.md) · [Footer Configuration](../10_configuration/05_footer.md)
