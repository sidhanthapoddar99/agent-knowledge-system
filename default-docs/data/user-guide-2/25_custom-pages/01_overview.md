---
title: "Custom pages"
description: "A custom page is one YAML file drawn by a built-in page layout: a home page, an info page or a countdown."
---

# Custom pages

A custom page is a single page whose shape matters more than its prose, such as a home page with a hero and a grid of features. You write its content as one YAML file. A built-in page layout draws it. agentks has three: `home`, `info` and `countdown`.

## What makes a custom page

Two things: a YAML file with the page's content, and an entry under `pages:` in `config/site.yaml` that gives the page its URL and its layout.

```yaml
# data/pages/home.yaml
hero:
  title: "Acme Docs"
  subtitle: "Everything you need to run Acme in production."
  cta:
    label: "Get started"
    href: "/guide"
features:
  - title: "Install in a minute"
    description: "One binary, no runtime to set up."
  - title: "Search everything"
    description: "Docs, posts and issues in one place."
```

```yaml
# config/site.yaml
pages:
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

The page is served at its `base_url`, here the site root. The YAML file can live anywhere in the project. `data/pages/` is the usual place, one file per page, named after the page. The [configuration section](../35_configuration/01_overview.md) explains every key of a `pages:` entry.

## The three layouts

| Layout | For | Its YAML holds |
|---|---|---|
| `@custom/home` | A landing page | A hero with buttons, and a grid of features |
| `@custom/info` | A simple page, such as About or Contact | A title and a description |
| `@custom/countdown` | A countdown to a launch or an event | A title, a target date and some short text |

[The built-in layouts](./05_built-in-layouts.md) gives each layout's fields with an example.

## What a custom page is not

A custom page is one page at one URL. It has no sidebar, no markdown body, no outline and no sub-pages. For several pages with the same layout, write one YAML file and one `pages:` entry for each:

```yaml
pages:
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
```

## Choosing the right kind of page

| You are making | Use |
|---|---|
| A landing page with a hero and features | A custom page, `@custom/home` |
| A short About, Contact or legal page | A custom page, `@custom/info` |
| A countdown to a date | A custom page, `@custom/countdown` |
| A page of prose, headings and code | A [docs section](../15_docs/01_overview.md) |
| A dated announcement | A [blog post](../20_blog/01_overview.md) |
| A page with a design of its own, such as a report or a dashboard | An artifact page in a docs section; see [writing content](../10_writing-content/01_overview.md) |

agentks has no way to add a layout of your own. The built-in layouts are the whole set. To change how they look, such as colours, fonts and spacing, write CSS in your theme; see [themes and layouts](../45_themes-and-layouts/01_overview.md). When a page needs a design no layout offers, build it as an HTML artifact page.

## When something is wrong

- **The data file does not exist.** agentks refuses to start and names the `pages:` entry whose `data` is missing.
- **The layout name is not a built-in one**, such as `@custom/landing`. agentks refuses to start, and the error lists the layouts it has: `@custom/home`, `@custom/info` and `@custom/countdown`.
- **A field is misspelled.** The layout only reads the fields it knows, so a misspelled field does not show on the page. Check the spelling against [the built-in layouts](./05_built-in-layouts.md).
