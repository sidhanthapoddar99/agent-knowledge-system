---
title: "Architecture survival — what stays editable after the migration"
sidebar_label: "02 · Architecture"
---

# Architecture survival — site.yaml, themes, layouts, custom pages

The natural worry on hearing "single binary" is: *if you embed everything into a Go binary at compile time, how can users still customise?* This note answers that — the single-binary story does **not** mean a closed-world, recompile-to-customise framework. The user's customisation surface is preserved or improved.

## The mental model in one sentence

**The binary owns the engine (HTTP server, markdown pipeline, file watcher, layout/theme loader). The user's `default-docs/` folder owns the content + configuration + customizations. Everything that's editable today stays editable.**

## What lives where after migration

| Asset | Today (Astro) | Go + Vite version | Runtime-editable? |
|---|---|---|---|
| `site.yaml`, `navbar.yaml`, `footer.yaml` | YAML, Astro reads at startup | YAML, Go reads at startup via `gopkg.in/yaml.v3` | ✅ yes — hot-reloaded |
| `themes/<name>/theme.yaml` + `*.css` | YAML + CSS, Vite re-bundles | YAML + CSS on disk, Go serves directly with mtime caching | ✅ yes — *faster* hot-reload than today (no bundling step) |
| `data/pages/*.yaml` (custom pages) | YAML, drives custom layout | YAML, Go reads + routes by `type:` | ✅ yes |
| `data/docs/...`, `data/blog/...`, `data/issues/...` | Markdown, content-loader pipeline | Markdown, Go pipeline (goldmark + chroma + custom extensions) | ✅ yes |
| `assets/*` | Files | Files served by Go with mtime hashing | ✅ yes |
| `.astro` layout files | JSX-flavoured templates | Go `html/template` or `templ` files | ⚠️ shipped in binary; user can override (see below) |
| Markdown pipeline + custom-tag handlers | TS modules | Go modules (compiled into binary) | ❌ binary-only |

## The "user-editable layout" path

Today, advanced users can drop a custom Astro layout into `default-docs/layouts/<type>/<style>/` and it overrides the built-in. That path **stays** in the Go version — Go scans the directory at startup and uses it as an overlay over the embedded built-in templates.

```
default-docs/layouts/
└── docs/myfancy/
    ├── layout.html        ← Go template — user writes
    ├── style.css
    └── island.ts          ← optional; needs `doc-engine dev` (Vite subprocess) to bundle
```

Pure HTML/CSS layout edits hot-reload via the Go file watcher. Adding interactive JS islands needs the dev mode (which spawns Vite as a subprocess) — but most users never write islands.

## What requires a binary rebuild

- Built-in layout templates (we ship ~5 docs styles, 2 blog, 1 issues, 3 custom)
- Built-in custom-tag handlers (callouts, tabs, collapsible — ~10 of them)
- Markdown pipeline plugins
- Anything in the Go source tree

Compare to today: the equivalent is "edit `astro-doc-code/src/`." Same kind of change — framework-level, not user-level. **The customisation surface available to users is unchanged.**

## What the user's project folder looks like after migration

```
my-docs-project/
├── doc-engine                       ← single binary (replaces astro-doc-code/ + node_modules/)
├── doc-engine.toml                  ← optional run config (port, mode, framework version pin)
└── default-docs/                    ← unchanged
    ├── config/
    │   ├── site.yaml
    │   ├── navbar.yaml
    │   └── footer.yaml
    ├── themes/
    │   └── tokyo-night/
    ├── layouts/                     ← optional user overrides
    ├── data/
    │   ├── pages/
    │   ├── docs/
    │   ├── blog/
    │   └── issues/
    └── assets/
```

Drop the binary, run `./doc-engine serve`, the site is up. No `bun install`, no `node_modules`, no version juggling.

## Why this is *better* than today, not just equivalent

- **Theme CSS hot-reload**: today Vite re-bundles theme CSS on change (~200–500ms). Go just serves the file with a cache-busting query (~5ms). HMR feels instant.
- **No SSR isolation**: the bug class that produced `05_issue.md` is structurally impossible. One process, one module graph, one cache instance.
- **Cold start**: Astro dev-server cold start ~2–4s; Go server cold start ~50–100ms. Restarts stop being a friction point.
- **Theme variable contract validation** runs at startup with structured errors instead of silently freezing var-fallback values.

## Companion notes

- **`../../notes/architecture/05_runtime-config-surface.md`** — full enumeration of what stays user-editable, with code-level detail.
- **`../../notes/architecture/03_vite-frontend-and-dist.md`** — how the Vite bundle gets embedded and why that doesn't reduce customisation.
