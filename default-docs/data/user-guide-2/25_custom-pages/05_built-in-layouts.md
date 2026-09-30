---
title: "The built-in layouts"
description: "The YAML fields of the home, info and countdown custom page layouts, each with a complete example."
---

# The built-in layouts

Each custom page layout reads its own set of fields from the page's YAML file. This page lists the fields of `@custom/home`, `@custom/info` and `@custom/countdown`, with an example of each that you can copy. How to add a custom page to a project is in the [custom pages overview](./01_overview.md).

## home

A landing page: a hero at the top, with a title, a subtitle and up to two buttons, and a grid of features below it.

| Field | Meaning |
|---|---|
| `hero.title` | The large title at the top of the page |
| `hero.subtitle` | A sentence under the title |
| `hero.cta.label`, `hero.cta.href` | The main button: its text and where it goes |
| `hero.secondaryCta.label`, `hero.secondaryCta.href` | A second button |
| `features` | A list of features, each with a `title`, a `description` and an optional `icon` |

```yaml
# data/pages/home.yaml
hero:
  title: "Acme Docs"
  subtitle: "Everything you need to run Acme in production."
  cta:
    label: "Get started"
    href: "/guide"
  secondaryCta:
    label: "Source code"
    href: "https://github.com/acme/acme"

features:
  - title: "Install in a minute"
    description: "One binary, no runtime to set up."
    icon: "◆"
  - title: "Search everything"
    description: "Docs, posts and issues in one place."
    icon: "▲"
  - title: "Works offline"
    description: "Everything runs on your own machine."
    icon: "●"
```

A button's `href` is an address: a path on the site, such as `/guide`, or a full `https://` address. Leave out `features` for a hero on its own. Leave out the buttons for a hero with no action. An `icon` is a short piece of text, such as a symbol or an emoji.

## info

A simple page with a title and a description: an About page, a Contact page, a short legal notice.

| Field | Meaning |
|---|---|
| `title` | The page's heading |
| `description` | The text under it |

```yaml
# data/pages/about.yaml
title: "About Acme Docs"
description: "Acme Docs is written by the Acme team and published every week."
```

When the page grows sections, headings or code, move it to a [docs section](../15_docs/01_overview.md).

## countdown

A countdown to a date and time: for a launch, an event or a deadline. The page shows the time left until that moment.

| Field | Meaning |
|---|---|
| `title` | The page's heading |
| `subtitle` | A sentence under the heading |
| `targetDate` | The moment the countdown ends, as an ISO 8601 date and time |
| `amount` | A short value to highlight, such as a price or a quantity |
| `note` | A short line of small print |

```yaml
# data/pages/launch.yaml
title: "Acme 2.0 launch"
subtitle: "We are shipping something big."
targetDate: "2026-12-01T18:00:00Z"
amount: "50% off"
note: "For the first 100 sign-ups only."
```

Write `targetDate` with a time zone, `Z` for UTC or an offset such as `+05:30`, so every reader counts down to the same moment.

## Wire the page into the site

Each page needs its entry under `pages:` in `config/site.yaml`:

```yaml
pages:
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
  about:
    base_url: "/about"
    type: custom
    layout: "@custom/info"
    data: "@data/pages/about.yaml"
  launch:
    base_url: "/launch"
    type: custom
    layout: "@custom/countdown"
    data: "@data/pages/launch.yaml"
```

To put a custom page in the navbar, point a navbar item at the page's name under `pages:`. The [configuration section](../35_configuration/01_overview.md) shows how.
