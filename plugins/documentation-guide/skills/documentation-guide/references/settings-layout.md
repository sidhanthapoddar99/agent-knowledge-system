# Site-level settings — reference

Site chrome, routing, theming, aliases. Everything *above* the per-content-type layer.

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/05_getting-started/`, `10_configuration/`, `16_layout-system/`, `20_custom-pages/`, `25_themes/` — read those when this reference is unclear or when you need depth this file doesn't cover.

**Contents** (this file is long — jump to the section you need):

1. [Project structure](#1-project-structure) · 2. [`.env` — bootstrap layer](#2-env--the-bootstrap-layer) · 3. [`site.yaml`](#3-siteyaml--the-main-config-file) · 4. [`pages:` routing](#4-pages--routing--content-type-binding) · 5. [`navbar.yaml`](#5-navbaryaml--top-level-navigation) · 6. [`footer.yaml`](#6-footeryaml--site-footer) · 7. [Path aliases](#7-path-aliases--built-in-vs-user-defined) · 8. [Themes](#8-themes) · 9. [Worked example](#9-worked-example--adding-a-new-section) · 10. [Common patterns](#10-common-patterns) · 11. [Validate](#11-validate) · 12. [Cross-references](#12-cross-references)

---

## 1. Project structure

**Consumer mode** (default — framework is a subfolder of the user's project):

```
<your-project>/                            ← user's project root
├── config/                                ← site.yaml, navbar.yaml, footer.yaml
├── data/                                  ← all content (docs, blog, issues, custom)
│   └── README.md                          ← MAP of every top-level data folder (see SKILL.md)
├── assets/                                ← static assets served at /assets/
├── themes/                                ← OPTIONAL — your custom themes
├── layouts/                               ← OPTIONAL — your custom layouts
└── documentation-template/                ← FRAMEWORK FOLDER — don't edit
    ├── start                              ← bash wrapper: `./start [dev|build|preview]`
    ├── .env                               ← CONFIG_DIR=../config (consumer mode)
    ├── astro-doc-code/                    ← framework code
    ├── default-docs/                      ← framework's bundled docs/themes/template
    └── plugins/                           ← repo-local plugins
```

**Dogfood mode** — the framework repo *is* the project; content lives under `documentation-template/default-docs/`, `.env` has `CONFIG_DIR=./default-docs/config`. Same code path, only `CONFIG_DIR` differs.

Clone the framework into a project:
```bash
# Inside your project root:
git clone https://github.com/sidhanthapoddar99/documentation-template.git
cd documentation-template
./start          # preflight: pick bun (else npm) → install if needed → sanity build → dev
```

---

## 2. `.env` — the bootstrap layer

The framework reads exactly one thing from `.env`: where to find `config/`. Everything else lives in the YAML files inside that config dir. **`.env` lives inside the framework folder** (`documentation-template/.env`, not inside `astro-doc-code/`). Paths are relative to the framework folder.

```bash
# Consumer mode — config sits beside the framework folder
CONFIG_DIR=../config                 # REQUIRED — path to the folder containing site.yaml
LAYOUT_EXT_DIR=../layouts            # OPTIONAL — only when shipping custom layout styles
PORT=3088                            # dev server port
HOST=true                            # bind to all interfaces (for LAN access)

# Dogfood mode — config inside the framework's bundled default-docs/
# CONFIG_DIR=./default-docs/config
# LAYOUT_EXT_DIR=./default-docs/layouts
```

Absolute paths work too. The plugin's helper scripts (and `_env.mjs`) derive the project's content root from `CONFIG_DIR`, so this single env var locates everything.

---

## 3. `site.yaml` — the main config file

Everything site-wide. The full schema (taken from a working example):

```yaml
# 3a. Site identity
site:
  name: "My Docs"
  title: "My Documentation"
  description: "Modern documentation built with Astro"

# 3a½. Version contract — engine version this content targets (N.N.N).
# The engine hard-stops when content is outside its supported range; missing →
# treated as 0.0.0. After running repo-root migration/ scripts, bump to match
# the engine. See references/doc-migration.md for the upgrade flow.
engine_version: "0.7.0"

# 3b. Vite dev server
server:
  allowedHosts: true                       # true | array of host patterns
  # Example: allowedHosts: [".localhost", "127.0.0.1", "my-app.local", ".ngrok.io"]

# 3c. Path aliases — each key becomes an @key alias
paths:
  data: "../data"                          # @data/...
  assets: "../assets"                      # @assets/...
  themes: "../themes"                      # @themes/...
  # User-defined aliases work the same way:
  # data2: "/other/project/data"

# 3d. Theme
theme: "full-width"                        # active theme name (folder name under @themes)
theme_paths:                               # where to scan for custom themes
  - "@themes"

# 3e. Logo + favicon
logo:
  src: "@assets/astro-dark.svg"            # default
  alt: "Docs"
  theme:                                   # optional dark/light variants
    dark: "@assets/astro-dark.svg"
    light: "@assets/astro-light.svg"
  favicon: "@assets/astro.png"

# 3f. Live editor (dev toolbar)
editor:
  autosave_interval: 10000                 # ms
  presence:
    ping_interval: 5000
    stale_threshold: 30000
    cursor_throttle: 100
    content_debounce: 150
    render_interval: 5000
    sse_keepalive: 15000
    sse_reconnect: 2000

# 3g. Pages — see §4 below (the most important block)
pages:
  user-guide:
    base_url: "/user-guide"
    type: docs
    layout: "@docs/default"
    data: "@data/user-guide"
  # … more entries …
```

**Field-by-field cheatsheet:**

| Block | Field | Type | Notes |
|---|---|---|---|
| `site` | `name` / `title` / `description` | string | Site identity, used in `<title>` + meta tags |
| `server` | `allowedHosts` | `true` or `string[]` | Vite host whitelist for dev server |
| `paths` | `<key>: <path>` | object | Each becomes `@<key>` — relative to config dir or absolute |
| top-level | `theme` | string | Folder name of the active theme |
| top-level | `theme_paths` | `string[]` | Dirs to scan for theme folders |
| `logo` | `src`, `alt`, `theme.dark`, `theme.light`, `favicon` | strings | All accept `@<alias>/...` paths |
| `editor` | nested timing knobs | numbers (ms) | Defaults are sane; tune only if you have a reason |
| top-level | `pages` | object (keyed) | **Routes — see §4** |

---

## 4. `pages:` — routing & content-type binding

This is the heart of `site.yaml`. **`pages` is an object, not an array** — each key is the route's internal id; the value binds a URL prefix to a content type, layout, and data source.

```yaml
pages:
  # Docs section — sidebar-driven, uses NN_ prefix folders
  user-guide:
    base_url: "/user-guide"
    type: docs
    layout: "@docs/default"                # or @docs/compact, or a custom @ext-layouts alias
    data: "@data/user-guide"               # FOLDER

  # Issues tracker — folder-per-item
  todo:
    base_url: "/todo"
    type: issues
    layout: "@issues/default"
    data: "@data/todo"                     # FOLDER (with root settings.json declaring vocabulary)

  # Blog — flat YYYY-MM-DD-<slug>.md files
  blog:
    base_url: "/blog"
    type: blog
    layout: "@blog/default"
    data: "@data/blog"                     # FOLDER

  # Custom page — single YAML file backing a layout
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"                 # @custom/home | @custom/info | @custom/countdown | custom layouts
    data: "@data/pages/home.yaml"          # FILE (YAML)

  about:
    base_url: "/about"
    type: custom
    layout: "@custom/info"
    data: "@data/pages/about.yaml"
```

**Required fields per `pages:` entry:**

| Field | Type | Notes |
|---|---|---|
| `base_url` | string | URL prefix; `/` for the homepage |
| `type` | enum | `docs` \| `issues` \| `blog` \| `custom` |
| `layout` | string | `@<type>/<style>` — see "Layout" section below |
| `data` | string | Folder for `docs` / `issues` / `blog`; YAML file for `custom` |

**Choosing a layout** — every type has a `default` style; some have alternatives:

| Type | Available styles | Located at |
|---|---|---|
| `docs` | `@docs/default`, `@docs/compact` | `astro-doc-code/src/layouts/docs/<style>/` |
| `blog` | `@blog/default` | `astro-doc-code/src/layouts/blogs/<style>/` |
| `issues` | `@issues/default` | `astro-doc-code/src/layouts/issues/<style>/` |
| `custom` | `@custom/home`, `@custom/info`, `@custom/countdown`, plus user-shipped ones | `astro-doc-code/src/layouts/custom/<style>/` |

User-shipped layouts under your `layouts/<type>/<style>/` (consumer mode — sibling of `config/` and `data/`) are picked up automatically when `LAYOUT_EXT_DIR=../layouts` is set in `.env`; they override built-in styles of the same name.

---

## 5. `navbar.yaml` — top-level navigation

```yaml
layout: "@navbar/default"                  # or @navbar/minimal
# layout: "@navbar/minimal"                # tighter, no logo block

items:
  - label: "Home"
    href: "/"
  - label: "User Guide"
    href: "/user-guide"
  - label: "Blog"
    href: "/blog"
  - label: "GitHub"
    href: "https://github.com/sidhanthapoddar99/documentation-template"
```

| Field | Type | Notes |
|---|---|---|
| `layout` | string | `@navbar/default` (full-featured) or `@navbar/minimal` |
| `items` | `array` | Top-level nav items — flat list; order matters |
| `items[].label` | string | Display text |
| `items[].href` | string | Internal path (`/user-guide`) or external URL |

**Grouping** — the default navbar layout is a flat list. For dropdown groups (e.g. "Resources ▾" expanding to multiple links), check the layout source under `astro-doc-code/src/layouts/navbar/<style>/` to see what nested item shape it accepts. Some layouts support `items[].children: [...]`. If the layout you've chosen doesn't, either pick a different layout or build a custom one.

**External links** — any `href` starting with `http://` or `https://` is treated as external (opens in new tab, may render an external icon).

**Logo** — lives in `site.yaml` under `logo:`, NOT here. The navbar layout reads it from there.

---

## 6. `footer.yaml` — site footer

```yaml
layout: "@footer/default"

copyright: "© {year} My Docs. All rights reserved."   # {year} is auto-substituted

columns:
  - title: "Documentation"
    links:
      - label: "Getting Started"
        href: "/docs/getting-started"
      - label: "API Reference"
        href: "/docs/api"

  - title: "Community"
    links:
      - label: "Blog"
        page: "blog"                       # ← resolves to the page's base_url
      - label: "Discord"
        href: "https://discord.gg/example"

social:
  - platform: "github"
    href: "https://github.com/user/repo"
  - platform: "twitter"
    href: "https://twitter.com/user"
  - platform: "discord"
    href: "https://discord.gg/example"
```

| Field | Type | Notes |
|---|---|---|
| `layout` | string | `@footer/default` (or a minimal variant if shipped) |
| `copyright` | string | Supports `{year}` token (substituted at render) |
| `columns` | array | **Each column is a grouping** — `title` + `links[]` |
| `columns[].links[].label` | string | Display text |
| `columns[].links[].href` | string | Direct URL (internal or external) |
| `columns[].links[].page` | string | **Page id** — resolves to that page's `base_url` (single source of truth; survives URL renames) |
| `social` | array | Auto-rendered with platform icons |
| `social[].platform` | string | `github`, `twitter`, `discord`, etc. (icons live in the layout) |
| `social[].href` | string | The social profile URL |

**`href` vs `page`** — prefer `page:` for any link to one of your own routes. If you ever change `base_url:` for that page in `site.yaml`, footer links update automatically.

**Grouping** — each column IS a group. Use 3-4 columns max; more becomes visually noisy on narrow viewports.

---

## 7. Path aliases — built-in vs user-defined

**Built-in aliases (always available):**

| Alias | Resolves to | Used when |
|---|---|---|
| `@docs/<style>` | `astro-doc-code/src/layouts/docs/<style>/` | `pages[].layout` for docs |
| `@blog/<style>` | `astro-doc-code/src/layouts/blogs/<style>/` | `pages[].layout` for blog |
| `@issues/<style>` | `astro-doc-code/src/layouts/issues/<style>/` | `pages[].layout` for issues |
| `@custom/<style>` | `astro-doc-code/src/layouts/custom/<style>/` | `pages[].layout` for custom |
| `@navbar/<style>` | `astro-doc-code/src/layouts/navbar/<style>/` | `navbar.yaml → layout` |
| `@footer/<style>` | `astro-doc-code/src/layouts/footer/<style>/` | `footer.yaml → layout` |
| `@ext-layouts` | `LAYOUT_EXT_DIR` from `.env` | for user-shipped layouts (overrides built-ins by name) |
| `@theme/<name>` | a theme folder | inside `theme.yaml → extends:` |
| `@root/<sub>` | the framework folder + `<sub>` (i.e. the framework's install location on disk — `documentation-template/` in consumer mode, the repo root in dogfood mode) | reaching the framework's bundled content (`@root/default-docs/...`); path-traversal blocked. **NOT the consumer's outer project root** — see env.md for the two-mode model |

**User-defined aliases** — declared in `site.yaml → paths:`:

```yaml
paths:
  data: "../data"                            # → @data/<sub>
  assets: "../assets"                        # → @assets/<sub>
  themes: "../themes"                        # → @themes/<sub>
  # Add your own (relative to config dir, absolute, or @root-prefixed):
  shared: "../shared"                        # → @shared/<sub>
  default-docs: "@root/default-docs/data"    # → @default-docs/<sub>
```

Values can be relative (to config dir), absolute, or `@root/<path>` — that last form is the only alias allowed inside `paths:` values. User-aliases-referencing-other-user-aliases (e.g. `derived: "@data/sub"`) and other system aliases (`@docs`, `@theme`, …) are rejected with a clear error to keep declaration order unambiguous.

These are resolved at config load (paths become absolute), then used wherever the YAML accepts a path-like string (`pages[].data`, `logo.src`, etc.).

---

## 8. Themes

The full theme contract (46 required CSS variables) lives in the framework's bundled `@root/default-docs/data/user-guide/25_themes/` — **read it before doing any theme work**. Don't invent variable names. Don't hardcode colours / fonts / spacing.

Quick orientation:

| What | Where |
|---|---|
| Built-in default theme | the framework's `astro-doc-code/src/styles/` (read-only — don't edit) |
| Framework-bundled themes | `@root/default-docs/themes/<name>/` (e.g. `full-width`, `minimal`) — accessed via `theme_paths: ["@root/default-docs/themes"]` |
| User themes | the project's `themes/<name>/theme.yaml` (usually `extends: "@theme/default"`) — accessed via `theme_paths: ["@themes"]` |
| Active theme selector | `site.yaml → theme: "<name>"` |
| Theme discovery | `site.yaml → theme_paths: ["@themes"]` (and/or `["@root/default-docs/themes"]`) |

**For any non-trivial theme work, read `@root/default-docs/data/user-guide/25_themes/` first. The skill doesn't duplicate the theme contract.**

---

## 9. Worked example — adding a new section

**Goal:** add a "Tutorials" section served at `/tutorials/`.

```bash
# 1. Create the folder + root settings.json (sidebar label)
#    (Paths shown for consumer mode — adjust to default-docs/data/tutorials/ in dogfood mode.)
mkdir -p data/tutorials
cat > data/tutorials/settings.json <<'EOF'
{
  "label": "Tutorials",
  "position": 17
}
EOF

# 2. Add a starter page
cat > data/tutorials/01_overview.md <<'EOF'
---
title: Tutorials Overview
description: Hands-on tutorials for common workflows.
---

# Tutorials

…
EOF
```

```yaml
# 3. Register the route in site.yaml under pages:
pages:
  # … existing entries …
  tutorials:
    base_url: "/tutorials"
    type: docs
    layout: "@docs/default"
    data: "@data/tutorials"
```

```yaml
# 4. Add a navbar entry (navbar.yaml)
items:
  # … existing entries …
  - label: "Tutorials"
    href: "/tutorials"
```

```markdown
<!-- 5. Update data/README.md so future agents see the new folder -->
| `tutorials/` | Hands-on workflow walkthroughs | NN_ docs | `/tutorials/…` | `@docs/default` |
```

Restart the dev server (`./start dev` from the framework folder, or `bun run dev` inside `astro-doc-code/`) — the new route is live.

---

## 10. Common patterns

- **Multiple trackers** — register more than one `type: issues` page, each pointing at a different folder (e.g. `todo/` for active, `archive/` for resolved). Each gets its own vocabulary file.
- **Same layout, different content** — same `layout: "@docs/default"`, different `data:` paths. Cheap to scale.
- **Per-section theming** — not currently supported via `pages:`. Themes are site-wide.
- **Subpath deployment** — set `base:` (top-level in `site.yaml`) to the subpath; all routes shift accordingly. Used when serving at `app.com/docs`.

---

## 11. Validate

The plugin ships **`docs-guide check config`** (on your `PATH` after install) — runs presence + structural checks against `site.yaml` / `navbar.yaml` / `footer.yaml` so you don't have to eyeball each.

```bash
# Default: resolves the config dir from .env
docs-guide check config

# Or point at any config dir explicitly
docs-guide check config ./config
```

What it checks:
- All three files exist (`site.yaml` is hard-required; `navbar.yaml` / `footer.yaml` warned)
- `site.yaml` has the required top-level keys (`site`, `paths`, `theme`, `pages`)
- Each `pages:` entry has the required fields (`base_url`, `type`, `layout`, `data`)
- Each page's `data:` path resolves on disk (after `@alias` substitution)
- `footer.yaml` `page:` references resolve to a registered page in `site.yaml`

Uses regex over the YAML text — no YAML library dependency. Catches the common breakage; for deeper schema validation, run the dev server and watch its startup warnings. Exit code `0` = clean, `1` = errors found.

---

## 12. Cross-references

- `data/README.md` (the project's) — map of every top-level data folder (read this first for orientation)
- `@root/default-docs/data/user-guide/05_getting-started/` (framework's bundled) — installation, aliases, structure
- `@root/default-docs/data/user-guide/10_configuration/` — every config file in microscopic detail (per-field reference)
- `@root/default-docs/data/user-guide/16_layout-system/` — picking + customising layouts
- `@root/default-docs/data/user-guide/20_custom-pages/` — custom page definitions + creating custom layouts
- `@root/default-docs/data/user-guide/25_themes/` — theme contract + creation walkthroughs
- `references/writing.md` — markdown content authoring (per-content-type concerns are NOT in this file)
- `references/layouts/docs-layout.md` / `blog-layout.md` / `issues/` (entry `00_overview.md`) — per-content-type structure
