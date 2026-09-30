---
title: "Built-in layouts"
---

agentks ships a fixed set of layouts, and each section of your site uses one of them by name. This page lists every layout and shows how to choose one. Every layout works on a phone and on a desktop.

## The layouts

A layout name has two parts, `@<group>/<style>`: the kind of page, then the style.

| Group | Styles | What it draws |
|---|---|---|
| `docs` | `@docs/default`, `@docs/compact` | Every page of a docs section. `default` has the sidebar, the page, an outline of its headings, and previous and next links. `compact` is the same without the sidebar, for a wider page |
| `blog` | `@blog/default` | The list of posts and each post |
| `issues` | `@issues/default` | The issue tracker: the list of issues, each issue's page, and a page for each of its notes, subtasks, logs and comments |
| `custom` | `@custom/home`, `@custom/info`, `@custom/countdown` | A single page drawn from one YAML file: a home page, an information page, a countdown |
| `navbar` | `@navbar/default`, `@navbar/minimal` | The bar at the top of every page |
| `footer` | `@footer/default`, `@footer/minimal` | The block at the bottom of every page |

Some kinds of page have their own view inside a section, and you do not choose a layout for them:

| Page kind | How it shows |
|---|---|
| Diagram pages (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) | The diagram, drawn from its source file. No outline |
| Artifact pages (`.html`) | The page's own HTML, in a frame inside the page. No outline |
| Video pages | The video player |

Each of these sits among the text pages of its section, with the same navigation around it.

## Choose a layout for a section

Each section in `config/site.yaml` names its layout. The group must match the section's `type`:

```yaml
pages:
  guide:
    base_url: "/guide"
    type: docs
    layout: "@docs/compact"      # the guide without a sidebar
    data: "@data/guide"
  blog:
    base_url: "/blog"
    type: blog
    layout: "@blog/default"
    data: "@data/blog"
  todo:
    base_url: "/todo"
    type: issues
    layout: "@issues/default"
    data: "@data/todo"
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

Every section needs a `layout`. Different sections can use different styles: a handbook with `@docs/default` and a single long guide with `@docs/compact`, for example. [Configuration](../35_configuration/01_overview.md) covers the other keys of a section.

## Choose the navbar and footer

`config/navbar.yaml` and `config/footer.yaml` each take an optional `layout`. Without it, agentks uses the `default` style.

```yaml
# config/navbar.yaml
layout: "@navbar/minimal"
```

```yaml
# config/footer.yaml
layout: "@footer/minimal"
```

## When a name is wrong

agentks accepts only the names in the table above. A misspelt name, a style from another group (such as `@blog/default` on a docs section), or a name without the leading `@` stops agentks with an error. The error names the key in `site.yaml` and lists the styles you can use. agentks never falls back to another layout in silence.

## When no layout fits

You cannot add a layout of your own. For branding, use a theme and CSS: see [themes](./10_themes.md) and [overriding CSS](./20_overriding-css.md). For a page that needs its own structure, such as a dashboard or a landing page with custom sections, write an artifact page: a self-contained HTML page that sits in a section like any other page ([writing content](../10_writing-content/01_overview.md)).

The agentks team adds built-in layouts when there is real demand for them. The sections on the [blog](../20_blog/01_overview.md), [custom pages](../25_custom-pages/01_overview.md) and the [issue tracker](../30_issue-tracker/01_overview.md) describe what their layouts show.
