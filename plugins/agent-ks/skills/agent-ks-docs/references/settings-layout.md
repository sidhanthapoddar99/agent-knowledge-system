# Site settings

Site chrome, routing, aliases and themes: everything above the content types. The user guide sections are `@root/default-docs/data/user-guide/05_getting-started/`, `10_configuration/`, `16_layout-system/`, `20_custom-pages/` and `25_themes/`.

## Project structure

Consumer mode: the framework is a subfolder of the user's project.

```
<your-project>/
├── config/                     site.yaml, navbar.yaml, footer.yaml
├── data/                       all content; data/README.md maps the folders
├── assets/  themes/  layouts/  static files served at /assets/; optional themes; optional layouts
└── agent-knowledge-system/     the framework folder; do not edit
    ├── start  .env             ./start [dev|build|preview|doctor]; CONFIG_DIR=../config
    ├── astro-doc-code/         framework code
    └── default-docs/           bundled docs, themes, template
```

Dogfood mode: the framework repo is the project, content lives under `default-docs/`, and `.env` has `CONFIG_DIR=./default-docs/config`. Same code path; only `CONFIG_DIR` differs. Install: in the project root run `git clone --depth 1 https://github.com/sidhanthapoddar99/agent-knowledge-system.git`, then `./start` inside the clone.

## `.env`

`.env` lives inside the framework folder, not inside `astro-doc-code/`. Paths are relative to the framework folder. Absolute paths work.

| Variable | Required | Value | Meaning |
|---|---|---|---|
| `CONFIG_DIR` | yes | `../config` (consumer) or `./default-docs/config` (dogfood) | The folder that holds `site.yaml`. The CLI derives the content root from it |
| `LAYOUT_EXT_DIR` | no | `../layouts` | Custom layout styles at `<LAYOUT_EXT_DIR>/<type>/<style>/`. A style with a built-in name overrides it |
| `PORT` | no | `3088` | Dev server port; the default is `4321` |
| `HOST` | no | `true` | Bind to all interfaces, for LAN access |

## `site.yaml`

```yaml
site: { name: "My Docs", title: "My Documentation", description: "…" }
engine_version: "0.3.7"                       # the engine version this content targets
server: { allowedHosts: true }                # true, or a list of host patterns
paths: { data: "../data", assets: "../assets", themes: "../themes" }   # each key becomes @key
theme: "full-width"                           # the active theme name
theme_paths: ["@themes"]                      # folders to scan for themes
logo: { src: "@assets/logo.svg", alt: "Docs", theme: { dark: "…", light: "…" }, favicon: "@assets/favicon.png" }
editor: { autosave_interval: 10000 }          # required; presence timing keys are optional
pages: …                                      # the routes; next section
```

| Field | Type | Meaning |
|---|---|---|
| `site.name`, `site.title`, `site.description` | string | Site identity for `<title>` and meta tags |
| `engine_version` | `"N.N.N"` | Missing counts as `0.0.0`. The engine stops on content outside its range: [doc-migration.md](./doc-migration.md) |
| `server.allowedHosts` | `true` or `string[]` | Vite host allowlist for the dev server |
| `paths.<key>` | path | Relative to the config dir, absolute, or `@root/…`. Becomes `@<key>` |
| `theme`, `theme_paths` | string, `string[]` | The active theme name; the folders to scan |
| `logo.*` | `@alias/…` paths | `src`, `alt`, `theme.dark`, `theme.light`, `favicon` |
| `editor` | object | Required. `autosave_interval` and `presence` timings in ms. The defaults are fine |

## Pages: routing

`pages` is an object, not a list. Each key is the route id. The value binds a URL prefix to a content type, a layout and a data source.

```yaml
pages:
  user-guide: { base_url: "/user-guide", type: docs, layout: "@docs/default", data: "@data/user-guide" }
  todo:       { base_url: "/todo", type: issues, layout: "@issues/default", data: "@data/todo" }
  blog:       { base_url: "/blog", type: blog, layout: "@blog/default", data: "@data/blog" }
  home:       { base_url: "/", type: custom, layout: "@custom/home", data: "@data/pages/home.yaml" }
```

| Field | Value | Note |
|---|---|---|
| `base_url` | a URL prefix | `/` for the home page. Reserved: `artifacts`, `assets`, `content-assets`, `api`, `editor`. A reserved value stops config load with an error that names the clash |
| `type` | `docs`, `issues`, `blog`, `custom` | Fixed by the framework |
| `layout` | `@<type>/<style>` | `@docs/default`, `@docs/compact`, `@blog/default`, `@issues/default`, `@custom/home`, `@custom/info`, `@custom/countdown`. Built-ins live at `astro-doc-code/src/layouts/<type>/<style>/` |
| `data` | a folder, or a YAML file for `custom` | An issues folder holds a root `settings.json` with the vocabulary |

## `navbar.yaml`

```yaml
layout: "@navbar/default"        # or @navbar/minimal
items:
  - { label: "Home", href: "/" }
  - { label: "Resources", items: [ { label: "Blog", href: "/blog" }, { label: "GitHub", href: "https://github.com/user/repo" } ] }
```

| Field | Value | Note |
|---|---|---|
| `layout` | `@navbar/default` or `@navbar/minimal` | `default` has dropdowns, a mobile menu and the theme toggle. `minimal` is a flat list |
| `items[].label` | string | Display text |
| `items[].href` | an internal path or an external URL | An `http` URL opens in a new tab with an external icon |
| `items[].items` | nested items | Makes the parent a dropdown in `@navbar/default`; the framework ignores its `href` |
| the logo | `site.yaml → logo:` | Not here |

## `footer.yaml`

```yaml
layout: "@footer/default"        # or @footer/minimal
copyright: "© {year} My Docs."   # the renderer substitutes {year}
columns:
  - { title: "Community", links: [ { label: "Blog", page: "blog" }, { label: "Discord", href: "https://discord.gg/example" } ] }
social:
  - { platform: "github", href: "https://github.com/user/repo" }
```

| Field | Value | Note |
|---|---|---|
| `columns[]` | `title` plus `links[]` | Each column is a group. Three or four columns at most |
| `links[].href` | a URL | A direct link, internal or external |
| `links[].page` | a page id from `site.yaml` | Prefer it for your own routes. A `base_url` change updates the link |
| `social[]` | `platform` plus `href` | Icons exist for `github`, `twitter`, `linkedin`, `youtube`, `discord` |

## Path aliases

| Alias | Resolves to | Used in |
|---|---|---|
| `@docs/…`, `@blog/…`, `@issues/…`, `@custom/…`, `@navbar/…`, `@footer/…` | `astro-doc-code/src/layouts/<type>/<style>/` | `pages[].layout`, `navbar.yaml`, `footer.yaml` |
| `@ext-layouts` | `LAYOUT_EXT_DIR` | custom layout styles |
| `@theme/<name>` | a theme folder | `theme.yaml → extends:` |
| `@root/<sub>` | the framework folder; not the consumer's project root | the bundled content, `@root/default-docs/…` |
| `@<key>` from `paths:` | the declared path | anywhere the YAML takes a path |

A `paths:` value is relative to the config dir, absolute, or `@root/…`. `@root` is the only alias allowed inside a value. The loader rejects a value that names another user alias, such as `derived: "@data/sub"`, and rejects traversal such as `@root/../x`. Reserved keys: `docs`, `blog`, `issues`, `custom`, `navbar`, `footer`, `theme`, `config`, `root`.

## Themes

Read the user guide section `25_themes/` before any theme work. Do not invent variable names. Do not hardcode colours, fonts or spacing. The contract is `required_variables` in `astro-doc-code/src/styles/theme.yaml`. `agent-ks theme tokens --json` prints the live values for light and dark. Themes are site-wide; a `pages:` entry cannot set one.

| What | Where |
|---|---|
| The built-in default theme | `astro-doc-code/src/styles/`; read-only |
| The bundled themes `full-width` and `minimal` | `@root/default-docs/themes/<name>/`; scan with `theme_paths: ["@root/default-docs/themes"]` |
| User themes | the project's `themes/<name>/theme.yaml`, usually `extends: "@theme/default"`; scan with `theme_paths: ["@themes"]` |
| The active theme | `site.yaml → theme: "<name>"` |

## Add a section

Use the [add-section skill](../../agent-ks-add-section/SKILL.md). It creates `data/<name>/` with a `settings.json` and a starter page, registers the route in `site.yaml`, and adds the navbar item. Then add a row to `data/README.md` and restart the dev server with `./start`.

Two patterns. Register several `type: issues` pages for several trackers, each with its own vocabulary. Reuse one layout with different `data:` paths.

## Validate

`agent-ks check config [dir]` reads the config dir from `.env` or from the argument. Exit `0` is clean, `1` found errors. It uses regex over the YAML text, so run the dev server for deeper errors. The checks:

- `site.yaml` exists (error). A missing `navbar.yaml` or `footer.yaml` is a warning.
- `site.yaml` has `site`, `paths`, `theme`, `pages`.
- Every `pages:` entry has `base_url`, `type`, `layout`, `data`.
- Every `data:` path resolves on disk after alias substitution.
- Every `footer.yaml` `page:` names a registered page.
