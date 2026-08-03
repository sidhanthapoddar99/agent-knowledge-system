---
title: Custom Pages Overview
description: Single-file, YAML-driven pages for home, about, countdown, and other layout-specific surfaces
sidebar_position: 1
---

# Custom Pages

Custom pages are the fourth content type — for surfaces that don't fit the docs/blog/issues pattern. Think: landing pages, about pages, countdown banners, dashboards, anything where the **shape of the page** matters more than a stream of prose content.

A custom page is **one YAML file rendered by a layout that knows its schema**. Unlike docs (markdown + frontmatter) or issues (folder + settings.json), custom pages don't impose a content model — the layout decides what the YAML should contain.

## When to use a custom page

| If you're building... | Use |
|---|---|
| Landing / marketing / home page | **Custom** (`@custom/home`) |
| About / contact / legal page | **Custom** (`@custom/info`) |
| Event countdown / milestone banner | **Custom** (`@custom/countdown`) |
| Dashboard / status board / changelog-hero | **Custom** (build your own layout) |
| A document with headings, prose, code blocks | [Docs](../17_docs/01_overview.md) |
| A dated post (article, announcement) | [Blog](../18_blogs/01_overview.md) |
| A work item with metadata + state | [Issues](../19_issues/01_overview.md) |

The rule of thumb: **if the page is primarily structured (hero + features, timer + target, form + fields), it's custom.** If the page is primarily prose (paragraphs + headings + code), it's docs or blog.

## The three built-in layouts

The framework ships with three custom layouts. Each consumes its own YAML schema.

| Layout | For | Schema summary |
|---|---|---|
| [`@custom/home`](./using-built-in-layouts#home) | Landing pages | `{ hero: {…}, features: [{…}] }` |
| [`@custom/info`](./using-built-in-layouts#info) | About / simple content pages | `{ title, description }` |
| [`@custom/countdown`](./using-built-in-layouts#countdown) | Event countdowns | `{ title, subtitle?, targetDate, amount?, note? }` |

Full schemas + examples: [Using Built-in Layouts](./using-built-in-layouts).

## Anatomy of a custom page

Three things make a custom page:

### 1. A YAML file in `data/pages/`

```yaml
# data/pages/home.yaml
hero:
  title: "Modern Documentation Framework"
  subtitle: "Build beautiful, fast documentation sites"
  cta:
    label: "Get Started"
    href: "/docs/getting-started"

features:
  - title: "Lightning Fast"
    description: "Built on Astro — zero JS by default"
    icon: "⚡"
```

One file per page. Name it anything (by convention: the URL slug).

### 2. A `pages:` entry in `site.yaml`

```yaml
pages:
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

Four fields: URL, content type, layout alias, data file. That's it.

### 3. A layout that knows the YAML's shape

The layout reads the YAML with `loadFile(dataPath)` and renders whatever schema it expects. `@custom/home` expects `hero` + `features`; `@custom/countdown` expects `title` + `targetDate` + friends.

**No schema validation** happens at the framework level. If the YAML doesn't match what the layout expects, the layout renders with empty/default values or shows "undefined." This is the tradeoff for flexibility — the layout, not the framework, owns the schema.

## What custom pages DON'T have

Deliberately missing, compared to other content types:

| Feature | Docs | Blog | Issues | **Custom** |
|---|:---:|:---:|:---:|:---:|
| Markdown body | ✅ | ✅ | ✅ | ❌ |
| Folder structure | ✅ | — | ✅ | ❌ |
| `settings.json` | ✅ | — | ✅ | ❌ |
| Sidebar / outline | ✅ | — | — | ❌ |
| Index page | — | ✅ | ✅ | ❌ |
| Frontmatter | ✅ | ✅ | — | ❌ |
| Asset embedding (`[[path]]`) | ✅ | ✅ | planned | ❌ |

Everything is YAML, every page stands alone. That's the point — custom pages are for **structured one-offs**, not content trees.

## Picking between the three built-ins

The three built-in layouts cover the most common custom surfaces. If one of them fits, use it — don't write a new layout.

**Use `@custom/home` when** the page is a product/project landing with a hero + feature grid. This is the most common custom page.

**Use `@custom/info` when** the page is a simple title + description. About pages, contact pages, legal pages, "404 not found" screens. The minimum viable custom layout.

**Use `@custom/countdown` when** you're building hype for an event, sale, launch, or deadline. Very specific, but highly effective when the use case hits.

**Write a new layout when** none of these fit the shape of your page. See [Creating Custom Layouts](./creating-custom-layouts).

## URL shapes

A custom page renders at its declared `base_url`:

```yaml
home:
  base_url: "/"              → renders at /
about:
  base_url: "/about"         → renders at /about
launch:
  base_url: "/launch"        → renders at /launch
```

Each custom page is **one URL**. No detail routes, no sub-pages. If you need multiple pages with the same layout, declare multiple `pages:` entries:

```yaml
about:
  base_url: "/about"
  type: custom
  layout: "@custom/info"
  data: "@data/pages/about.yaml"

contact:
  base_url: "/contact"
  type: custom
  layout: "@custom/info"
  data: "@data/pages/contact.yaml"

privacy:
  base_url: "/privacy"
  type: custom
  layout: "@custom/info"
  data: "@data/pages/privacy.yaml"
```

Three pages, same layout, different data files. Standard pattern.

## What's in this section

| Page | For |
|---|---|
| [Using Built-in Layouts](./using-built-in-layouts) | The three built-in layouts + their YAML schemas + full examples |
| [Creating Custom Layouts](./creating-custom-layouts) | Writing your own custom layout · `loadFile` pattern · schema discipline |

## See also

- [Layout System Overview](../16_layout-system/01_overview.md) — how layouts are picked in general
- [Layout System / Custom Layout Styles](../16_layout-system/03_custom-layout-styles.md) — shipping layouts via `LAYOUT_EXT_DIR`
- [Page Configuration](../10_configuration/03_site/08_page.md) — full `pages:` entry schema
- [Data Structure](../05_getting-started/04_data-structure.md) — where `data/pages/` sits
