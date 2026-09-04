# Site configuration

The project structure, the framework `.env`, `site.yaml`, the routes and the path aliases. The user guide sections are `@root/default-docs/data/user-guide/05_getting-started/` and `10_configuration/`.

## Project structure

Consumer mode: the framework is a subfolder of the user's project.

```
<your-project>/
├── config/                     site.yaml, navbar.yaml, footer.yaml
├── data/                       all content; data/README.md maps the folders
├── assets/                     static files served at /assets/: logos, favicon
├── themes/                     optional user themes, one folder each
├── layouts/                    optional custom layout styles; needs LAYOUT_EXT_DIR
└── agent-knowledge-system/     the framework folder; do not edit
    ├── .env                    CONFIG_DIR=../config
    ├── start                   the run wrapper
    ├── astro-doc-code/         framework code
    └── default-docs/           bundled docs, themes, template
```

Dogfood mode: the framework repo is the project, content lives under `default-docs/`, and `.env` has `CONFIG_DIR=./default-docs/config`. Same code path; only `CONFIG_DIR` differs.

`data/README.md` maps each top-level `data/` folder to its purpose and route. Read it first on a structure task. Create it if it is missing. Update it when you add or remove a top-level folder.

## `./start`

Run it inside the framework folder. It installs dependencies when they are missing.

| Command | Does |
|---|---|
| `./start` | The dev server at `http://localhost:4321`. Hot-reloads content, CSS and YAML values |
| `./start build` | A production build into `astro-doc-code/dist/`. Drafts are dropped |
| `./start preview` | Serves the built site |
| `./start doctor` | Update check, install, full build. Run it before you publish |
| `./start stop`, `./start status` | Stop the running server; show what runs. Never `kill` it by hand |
| `./start --help` | Every command |

Every launching command checks `engine_version` first and stops with the migration chain when the content is outside the engine's range: [08_migrations.md](./08_migrations.md).

## `.env`

`.env` lives inside the framework folder, not inside `astro-doc-code/`. Relative paths are relative to the framework folder. Absolute paths work.

| Variable | Required | Value | Meaning |
|---|---|---|---|
| `CONFIG_DIR` | yes | `../config` (consumer) or `./default-docs/config` (dogfood) | The folder that holds `site.yaml`. The CLI derives the content root from it. No default; the framework throws without it |
| `LAYOUT_EXT_DIR` | no | `../layouts` | Custom layout styles: [06_layouts.md](./06_layouts.md). Unset means built-in layouts only, at no cost |
| `PORT` | no | `3088` | Dev server port; the default is `4321` |
| `HOST` | no | `true` | Bind to all interfaces, for LAN, Docker or a tunnel. Pair it with `server.allowedHosts` |

Never commit `.env`. The framework's `.gitignore` already excludes it. `.env.example` beside it documents the keys.

## `site.yaml`

```yaml
site: { name: "My Docs", title: "My Documentation", description: "…" }
engine_version: "0.3.9"                       # the engine version this content targets
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
| `site.name`, `site.title`, `site.description` | string | Site identity. `name` is the navbar label, `title` the `<title>` tag |
| `engine_version` | `"N.N.N"` | Missing counts as `0.0.0`. The engine stops on content outside its range: [08_migrations.md](./08_migrations.md) |
| `server.allowedHosts` | `true` or `string[]` | Vite host allowlist for the dev server. Patterns such as `".ngrok.io"` |
| `paths.<key>` | path | Relative to the config dir, absolute, or `@root/…`. Becomes `@<key>` |
| `theme`, `theme_paths` | string, `string[]` | The active theme name; the folders to scan: [05_themes.md](./05_themes.md) |
| `logo.*` | `@alias/…` paths | `src`, `alt`, `theme.dark`, `theme.light`, `favicon`: [04_navbar-footer.md](./04_navbar-footer.md#the-logo) |
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
| `layout` | `@<type>/<style>` | One field per page, for every type. The styles that ship: [06_layouts.md](./06_layouts.md#what-ships) |
| `data` | a folder, or a YAML file for `custom` | An issues folder holds a root `settings.json` with the vocabulary |

Two patterns. Register several `type: issues` pages for several trackers, each with its own vocabulary. Mount a subfolder as its own entry when it needs a different layout; one docs tree has one layout.

A new entry needs a dev-server restart. The section folder itself: [02_add-section.md](./02_add-section.md).

## Path aliases

| Alias | Resolves to | Used in |
|---|---|---|
| `@docs/…`, `@blog/…`, `@issues/…`, `@custom/…`, `@navbar/…`, `@footer/…` | `astro-doc-code/src/layouts/<type>/<style>/`, or the same path under `LAYOUT_EXT_DIR` | `pages[].layout`, `navbar.yaml`, `footer.yaml` |
| `@ext-layouts` | `LAYOUT_EXT_DIR` | custom layout styles |
| `@theme/<name>` | a theme folder | `theme.yaml → extends:` |
| `@root/<sub>` | the framework folder; not the consumer's project root | the bundled content, `@root/default-docs/…` |
| `@<key>` from `paths:` | the declared path | anywhere the YAML takes a path |

A `paths:` value is relative to the config dir, absolute, or `@root/…`. `@root` is the only alias allowed inside a value. The loader rejects a value that names another user alias, such as `derived: "@data/sub"`, and rejects traversal such as `@root/../x`. Reserved keys: `docs`, `blog`, `issues`, `custom`, `navbar`, `footer`, `theme`, `config`, `root`.

## Dev and production

| Feature | Dev (`./start`) | Prod (`build`, `preview`) |
|---|---|---|
| `draft: true` pages, and a tracker with `"draft": true` in its root `settings.json` | visible | absent; the URL is a 404 |
| The live editor at `/editor`, the dev toolbar, the error logger | present | not mounted |
| Theme CSS | hot-reloads | static |

## Validate

`agent-ks check config [dir]` reads the config dir from `.env` or from the argument. Exit `0` is clean, `1` found errors. It uses regex over the YAML text, so run the dev server for deeper errors. The checks:

- `site.yaml` exists (error). A missing `navbar.yaml` or `footer.yaml` is a warning.
- `site.yaml` has `site`, `paths`, `theme`, `pages`.
- Every `pages:` entry has `base_url`, `type`, `layout`, `data`.
- Every `data:` path resolves on disk after alias substitution.
- Every `footer.yaml` `page:` names a registered page.
