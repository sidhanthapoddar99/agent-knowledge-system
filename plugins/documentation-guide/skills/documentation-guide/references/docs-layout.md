# Docs content type — reference

How to add, organise, and configure pages in a docs section (e.g. `user-guide/`, `dev-docs/`).

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/17_docs/` — read those pages when this reference is unclear.

> **Status:** stub. Detailed spec under `2025-06-25-claude-skills/subtasks/04_docs-layout-skill.md`. For now, this file captures the essentials.

---

## Folder structure

A docs section is a folder under the project's `data/<section>/` (e.g. `data/user-guide/`, `data/dev-docs/`). Both files and subfolders use a 2-digit `XX_` prefix for ordering:

```
user-guide/
├── settings.json                        ← required: section label, position
├── 05_getting-started/
│   ├── settings.json                    ← subfolder label, position, collapsed
│   ├── 01_overview.md
│   ├── 02_installation.md
│   └── 03_aliases.md
├── 10_configuration/
│   ├── settings.json
│   ├── 01_overview.md
│   └── 03_site/
│       ├── settings.json
│       └── ...
└── ...
```

**Prefixes are 01-99.** They control sidebar order. Re-prefix to insert (e.g. squeeze `06_foo.md` between `05_x.md` and `10_y.md`).

## Per-folder `settings.json`

Required in every docs folder. Minimal shape:

```json
{
  "label": "Getting Started",
  "position": 5,
  "collapsed": false
}
```

| Field | Type | Default | Notes |
|---|---|---|---|
| `label` | string | folder name | Sidebar label |
| `position` | number | from prefix | Override prefix-based order |
| `collapsed` | boolean | `false` | Initial sidebar state |
| `nav_hide` | boolean | `false` | Hide from sidebar (page still accessible by URL) |

## Page frontmatter

```yaml
---
title: "Page title"               ← required
description: "Meta tag summary"
sidebar_label: "Short label"      ← override sidebar text (defaults to title)
sidebar_position: 3               ← override prefix-based order
draft: false
---
```

## Routing

URL = section base + nested path (without prefixes):

- `data/user-guide/05_getting-started/02_installation.md`
- → `/user-guide/getting-started/installation`

The `XX_` prefixes are stripped when building URLs.

## Outline (right rail)

The outline is built from `##` and `###` headings in the page body. Use `#` only for the page title (and prefer the frontmatter `title` over an `<h1>` in body).

## Cross-linking between docs pages

Use relative paths or the resolved URL:

```markdown
See [installation](../getting-started/installation) for setup.
See [installation](/user-guide/getting-started/installation) — also works.
```

## Validate

The plugin ships **`docs-check-section`** (on your `PATH` after install) — runs structural checks against a docs section so you don't have to eyeball it.

```bash
# Section-folder is required (no default — there can be many sections)
docs-check-section ./data/user-guide
docs-check-section ./data/dev-docs
```

What it checks:
- `XX_` numeric prefix on every folder (except `assets/`) and `.md` file (except `README.md`)
- `settings.json` present in every folder
- Frontmatter `title:` present on every `.md` file
- No `XX_` prefix collisions within a folder (e.g. two `05_` siblings)

Exit code `0` = clean, `1` = errors found. Run after restructuring a section or before committing a batch of new pages.

## Moving / renaming docs (docs-move)

Pages cross-link each other with **relative** paths (see "Cross-linking between docs pages" above). A plain `mv` or `git mv` moves the file but leaves every one of those relative links pointing at the old location — so the moment you reorganise a section, links silently rot: inbound links from sibling pages 404, and the relative links *inside* the moved page now resolve from the wrong directory. Nothing warns you; the build still passes.

The plugin ships **`docs-move`** (on your `PATH` after install) to make this safe — it's a link-aware move, the same move-and-update-links behaviour an editor like Obsidian does:

```bash
docs-move <from> <to> [--dry-run] [--no-git] [--root <dir>]
```

- `<from>` may be a single `.md` file **or** a folder (moved recursively, all depths).
- `<to>` must not already exist; parent directories are created as needed.

It rewrites links on **both sides** in one atomic pass:

- **Inbound** — every page (anywhere in the content root) whose relative link resolved to the moved file (or, for a folder move, to anything inside it) is repointed at the new location. Any `#anchor` fragment is preserved.
- **Outbound** — relative links *inside* the moved files that pointed at targets which did **not** move are recomputed from the file's new directory, so they still resolve to the same target. Links between two files that moved together stay correct automatically.
- **Text-mirror** — when a link's visible text is *itself the path* (optionally wrapped in a single pair of backticks, with or without the `#anchor`) — e.g. `` [`../a/b.md`](../a/b.md) ``, common in index tables — the text is rewritten to mirror the new target too, so the rendered text never disagrees with where it points. Descriptive labels (`[the guide](../a/b.md)`) are left untouched.

External links (`http://`, `https://`, `mailto:` …), site-absolute links (leading `/`, including `/assets/…`), and pure-anchor links (`#section`) are left untouched. Every candidate link is resolved as a real filesystem path before being rewritten, so it never string-replaces a coincidental match.

Flags:

- `--dry-run` — print the planned move and every link edit (`file:line  old  →  new`), change nothing, exit `0`. Run this first when reorganising.
- `--no-git` — force a plain filesystem move. By default, inside a git work tree `docs-move` uses `git mv` so history follows the file.
- `--root <dir>` — widen or override the scan + validation scope. By default the scope is the content root resolved from `.env` (`CONFIG_DIR`); both `<from>` and `<to>` must resolve inside it.

```bash
# preview a rename
docs-move data/user-guide/05_getting-started/02_install.md \
          data/user-guide/05_getting-started/03_install.md --dry-run

# move a whole subfolder, fixing links on both sides
docs-move data/user-guide/10_configuration data/user-guide/12_configuration
```

On success it prints `moved <N> file(s); rewrote <M> link(s) across <K> file(s)`.

## Cross-references

- `@root/default-docs/data/user-guide/17_docs/` (the framework's bundled user-guide) — full section
- `references/writing.md` — markdown / frontmatter basics
- `references/settings-layout.md` — registering a new docs section in `site.yaml`
