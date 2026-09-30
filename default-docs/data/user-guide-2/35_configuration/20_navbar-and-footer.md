---
title: "Navbar and footer"
description: "Set the navbar's links and menus in navbar.yaml, and the footer's columns, social links and copyright in footer.yaml."
---

`config/navbar.yaml` sets the bar across the top of every page. `config/footer.yaml` sets the footer at the bottom. Both files are required, but an empty file is valid, so you can start with nothing and add links as sections appear.

## Linking to a section or an address

Every link in both files takes one of two targets, never both:

| Target | Use it for | Example |
|---|---|---|
| `page: <name>` | A section of this site, by its name under `pages:` in `site.yaml` | `page: guide` |
| `href: <address>` | Anything else: another website, or a path on this site | `href: "https://github.com/acme/handbook"` |

Prefer `page:` for your own sections. It follows the section's current `base_url`, so changing a section's address needs no edit here. A `page:` that names no section is an error, and when the name is close to a real one, the error suggests it.

## navbar.yaml

```yaml
layout: "@navbar/default"

items:
  - label: "Home"
    href: "/"
  - label: "Guide"
    page: guide
  - label: "More"
    items:
      - label: "Tracker"
        page: todo
      - label: "GitHub"
        href: "https://github.com/acme/handbook"
```

| Key | Required | Meaning |
|---|---|---|
| `layout` | No | The navbar style: `@navbar/default` or `@navbar/minimal`. Default `@navbar/default` |
| `items` | No | The links, in order |

Each item has:

| Key | Required | Meaning |
|---|---|---|
| `label` | Yes | The text shown |
| `page` or `href` | No | Where the item leads |
| `items` | No | Child items. An item with children shows as a menu |

The smallest valid file is:

```yaml
items: []
```

The default navbar also shows the site's logo, or its name when no logo is set, and a switch between light and dark mode. The logo is set in `site.yaml`; see [site.yaml](./05_site-yaml.md).

## footer.yaml

```yaml
layout: "@footer/default"
copyright: "© {year} Acme"

columns:
  - title: "Documentation"
    links:
      - label: "Guide"
        page: guide
      - label: "Changelog"
        href: "https://github.com/acme/handbook/releases"

social:
  - platform: github
    href: "https://github.com/acme/handbook"
```

| Key | Required | Meaning |
|---|---|---|
| `layout` | No | The footer style: `@footer/default` or `@footer/minimal`. Default `@footer/default` |
| `copyright` | No | The copyright line. `{year}` becomes the current year |
| `columns` | No | Columns of links, each with a heading |
| `social` | No | Links shown as the icon of their platform |

Each column has a `title`, which is required, and `links`. A link has a `label` and a `page` or `href`. Footer links do not nest.

Each social link has a `platform`, such as `github`, and an `href`. Both are required. The layout chooses the icon from the platform name.

The smallest valid file is:

```yaml
columns: []
```

## Check your changes

```sh
agentks check config
```

It reports an unknown key, a link with both `page` and `href`, a `page` that names no section, and a layout that is not built in, each with its line and fix.
