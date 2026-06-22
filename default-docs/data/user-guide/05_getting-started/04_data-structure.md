---
title: Data Structure
description: How your content, configuration, and assets are organised at your project root.
---

# Data Structure

This page covers **your project's content folders** — `config/`, `data/`, `assets/`, `themes/`. These live at the root of *your* docs project (the parent of the framework folder), and they're the only files you actually author or edit. Everything inside the framework folder (`astro-doc-code/`, `default-docs/`, `plugins/`) is shipped by the framework and shouldn't be touched.

For the framework's internal code layout, see the [dev-docs](/dev-docs/overview/code-structure). For what `default-docs/` is and why it ships inside the framework, see the [Overview](./overview).

## What the framework actually requires

Only **one path is fixed**: a `.env` inside the framework folder with `CONFIG_DIR` pointing at a folder that contains `site.yaml`. Everything else flows from `site.yaml`'s `paths:` section and can live anywhere on disk.

```
                        REQUIRED CHAIN
                        ══════════════

   .env  (inside the framework folder)
     │
     │  CONFIG_DIR=<path-to-config-dir>     ◀── only this line is fixed
     ▼
   <config dir>/
     ├── site.yaml      ◀── framework bootstraps from this file
     ├── navbar.yaml
     └── footer.yaml
           │
           │  paths:    declares every other location
           │            (any alias name, any path on disk)
           │
           ├──▶ @data/     →  content  (docs · blog · issues · custom)
           ├──▶ @assets/   →  static files  (served at /assets/*)
           └──▶ @themes/   →  custom theme packages  (optional)
```

Because `@data/`, `@assets/`, and `@themes/` are pointed wherever `site.yaml` says, the **physical layout is convention, not requirement**. The recommended consumer layout (below) groups everything at your project root because that's what `init` produces and it's easy to reason about — but you could set `CONFIG_DIR=/etc/my-docs/config/`, point `@data/` at `/var/content/`, and the site would build identically.

## Recommended layout (consumer mode)

After running `/docs-init`, your project looks like this:

```
your-docs-folder/                # YOUR project root
├── config/                      # ← YOU EDIT — site/navbar/footer YAML
├── data/                        # ← YOU EDIT — docs · blog · issues · custom pages
├── assets/                      # ← YOU EDIT — logos, images served at /assets/
├── themes/                      # ← YOU EDIT — custom themes (optional)
│
└── documentation-template/      # the framework — added as a clone or git submodule
    ├── .env                     #   CONFIG_DIR=../config (reaches up to YOUR config/)
    ├── start                    #   ./start dev | build | preview
    ├── astro-doc-code/          #   framework source — don't touch
    ├── default-docs/            #   framework's bundled content (user-guide, dev-docs, themes,
    │                            #     placeholder branding, the init template) — don't touch
    └── plugins/                 #   framework's bundled plugin source — don't touch
```

| Directory | Purpose | Accessed via |
|---|---|---|
| `config/` | Site metadata, page definitions, navbar + footer | `CONFIG_DIR` in `.env` |
| `data/` | Your actual content (docs, blog, issues, pages) | `@data/` |
| `assets/` | Logos, favicons, images served at `/assets/*` | `@assets/` |
| `themes/` | Optional custom themes | `@themes/` |

## Alternative: dogfood / framework-dev mode

If you're working *on the framework itself* (not consuming it), the layout collapses — you don't need a wrapping project, the framework repo IS your project root and you edit `default-docs/` directly:

```
documentation-template/          # the framework repo (you cloned this)
├── .env                         #   CONFIG_DIR=./default-docs/config
├── start
├── astro-doc-code/
├── default-docs/                # ← YOU EDIT — when changing the bundled docs/themes/template
│   ├── config/
│   ├── data/
│   ├── assets/
│   └── themes/
└── plugins/
```

This is what the framework's own development uses — see [Overview → What's in `default-docs/`](./overview) for why this dogfood mode exists.

## 1. YAML configuration — `config/`

```
config/
├── site.yaml      # Site metadata, paths, theme, pages
├── navbar.yaml    # Navigation bar items
└── footer.yaml    # Footer columns and links
```

See [Configuration](/user-guide/configuration/overview) for field-by-field reference.

## 2. Static assets — `assets/`

Static files served at `/assets/*` URLs.

```
assets/
├── logo.svg
├── logo-dark.svg     # optional dark-mode variant
├── favicon.png
└── images/
```

Referenced in config files via the `@assets/` alias:

```yaml
# site.yaml
logo:
  src: "@assets/logo.svg"
  favicon: "@assets/favicon.png"
```

| Alias | Web URL |
|---|---|
| `@assets/logo.svg` | `/assets/logo.svg` |
| `@assets/images/hero.png` | `/assets/images/hero.png` |

## 3. Content — `data/`

This is the default starting point — **how you organise content inside `data/` is entirely up to you**. Multiple doc sections, independent issue trackers side by side, any set of custom pages — declare each folder in `site.yaml` (under `paths:` for the alias, and `pages:` for the URL + layout) and the framework renders it.

A richer real-project example:

```
data/
├── doc1/              # docs layout   (e.g. "User Guide")
├── doc2/              # docs layout   (e.g. "Dev Docs")
├── doc3/              # docs layout   (e.g. "API Reference")
│
├── blogs/             # blog layout
│
├── issues/            # folder of independent issue trackers
│   ├── proj1/         #   issues layout — one tracker (each is standalone)
│   └── proj2/         #   issues layout — a separate tracker
│
└── pages/             # custom layouts (YAML-driven)
    ├── home/          #   landing page
    ├── countdown/     #   launch countdown
    └── roadmap/       #   public roadmap
```

Nothing in that tree is hard-coded. Rename folders, drop sections, add new ones, point `@data/` at a completely different path in `site.yaml` — the framework doesn't care, as long as each section is declared. See [Path Aliases](./aliases) for custom alias declarations.

The file-level structure *inside* each content type is specific to its layout family. Each has its own authoring guide:

| Default folder | URL base | Naming pattern | Layout family | Authoring guide |
|---|---|---|---|---|
| `data/docs/` | `/docs` | `NN_folder/NN_file.md` | `@docs/*` | [Docs section](/user-guide/docs/overview) |
| `data/blog/` | `/blog` | `YYYY-MM-DD-slug.md` | `@blog/*` | [Blogs section](/user-guide/blogs/overview) |
| `data/issues/` | `/issues` | `YYYY-MM-DD-slug/` (folder) | `@issues/*` | [Issues section](/user-guide/issues/overview) |
| `data/pages/` | (per page) | Any `.yaml` / `.md` | `@custom/*` | [Custom Pages section](/user-guide/custom-pages/overview) |

## 4. Themes — `themes/`

```
themes/
└── my-theme/
    ├── theme.yaml       # theme manifest (extends, overrides)
    ├── color.css
    └── font.css
```

Custom themes inherit from the default via `extends: "@theme/default"` in `theme.yaml`. The framework's bundled themes live under `default-docs/themes/` and are automatically picked up — point `theme_paths:` in `site.yaml` at both your folder AND `@root/default-docs/themes` to see all of them. See [Themes](/user-guide/themes/overview).
