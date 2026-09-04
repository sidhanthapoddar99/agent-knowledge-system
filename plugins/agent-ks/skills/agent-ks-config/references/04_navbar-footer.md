# Navbar, footer and logo

This file covers the site chrome: the navbar above and the footer below every page. The user guide pages are `@root/default-docs/data/user-guide/10_configuration/04_navbar.md`, `05_footer.md` and `03_site/07_logo.md`.

One navbar and one footer apply to every page. There is no per-page override. Both files are optional. When `navbar.yaml` or `footer.yaml` is missing, the site loads the `default` style with no items, and `agent-ks check config` warns.

## `navbar.yaml`

```yaml
layout: "@navbar/default"        # or @navbar/minimal
items:
  - { label: "Home", href: "/" }
  - { label: "User Guide", href: "/user-guide" }
  - label: "Resources"
    items:
      - { label: "Blog", href: "/blog" }
      - { label: "GitHub", href: "https://github.com/user/repo" }
```

| Field | Value | Note |
|---|---|---|
| `layout` | `@navbar/default` or `@navbar/minimal` | `default`: logo, items, dropdowns, a mobile menu and the theme toggle. `minimal`: logo and the theme toggle, no items |
| `items[].label` | string | Display text |
| `items[].href` | an internal path or an external URL | An internal path is the `base_url` of a `pages:` entry. An `http` URL opens in a new tab with an external icon |
| `items[].items` | nested items | Makes the parent a dropdown in `@navbar/default`. The framework ignores the parent's `href`. One level deep |
| the logo | `site.yaml → logo:` | Not here |

The navbar `href` is a URL, not a file path. That is the one place a leading `/` is right, because the file is config, not a document.

## `footer.yaml`

```yaml
layout: "@footer/default"        # or @footer/minimal
copyright: "© {year} My Docs."   # the renderer substitutes {year}
columns:
  - title: "Docs"
    links:
      - { label: "User Guide", page: "user-guide" }
      - { label: "Blog", page: "blog" }
  - title: "Community"
    links:
      - { label: "Discord", href: "https://discord.gg/example" }
social:
  - { platform: "github", href: "https://github.com/user/repo" }
```

| Field | Value | Note |
|---|---|---|
| `layout` | `@footer/default` or `@footer/minimal` | `default`: a column grid and a bottom bar. `minimal`: one line, the copyright only |
| `copyright` | string | `{year}` becomes the current year at build |
| `columns[]` | `title` plus `links[]` | Each column is a group. Three or four columns at most; `minimal` ignores them |
| `links[].page` | a page id from `site.yaml` | Prefer it for your own routes. A `base_url` change updates the link, and `check config` catches a wrong id |
| `links[].href` | a URL | A direct link, internal or external. Use it only for a target that is not a `pages:` entry |
| `social[]` | `platform` plus `href` | Icons exist for `github`, `twitter`, `linkedin`, `youtube`, `discord` |

## The logo

The logo and favicon live in `site.yaml`, because both the navbar and the `<head>` read them.

```yaml
logo:
  src: "@assets/logo.svg"         # the fallback, used when theme: is absent
  alt: "My Docs"
  theme:
    dark: "@assets/logo-dark.svg"   # shown in dark mode
    light: "@assets/logo-light.svg" # shown in light mode
  favicon: "@assets/favicon.png"
```

| Field | Note |
|---|---|
| `src` | Required. An `@assets/…` path, or any `@alias/…` from `paths:` |
| `alt` | The alt text. Usually the site name |
| `theme.dark`, `theme.light` | Optional. The navbar swaps them with the theme toggle. Give both or neither |
| `favicon` | Optional. PNG, SVG or ICO |

The files sit in the project's `assets/` folder. `paths.assets` maps that folder, and the site serves it at `/assets/`. That folder holds the site chrome only. A document never links into it. A document's images sit beside the document.

## Change the style only

To swap the chrome without touching items, change the `layout` line and save. The dev server hot-reloads.

```diff
-layout: "@navbar/default"
+layout: "@navbar/minimal"
```

A custom navbar or footer style is a folder `navbar/<style>/index.astro` or `footer/<style>/index.astro` under `LAYOUT_EXT_DIR`: [06_layouts.md](./06_layouts.md#custom-layout-styles). Styling alone, such as colours or spacing, is a theme change, not a new style: [05_themes.md](./05_themes.md).

## Validate

`agent-ks check config` warns on a missing file. It errors on a `footer.yaml` `page:` that names no `pages:` entry. It does not check `href` targets. Open the dev server and click each item once after a change.
