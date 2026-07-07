# Docs content type — reference

How to add, organise, and configure pages in a docs section (e.g. `user-guide/`, `dev-docs/`).

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/17_docs/` — read those pages when this reference is unclear.

> **Status:** stub. Detailed spec under `2025-06-25-claude-skills/subtasks/04_docs-layout-skill.md`. For now, this file captures the essentials.

---

## Folder structure

A docs section is a folder under the project's `data/<section>/` (e.g. `data/user-guide/`, `data/dev-docs/`). Both files and subfolders use a numeric `NN_` prefix for ordering (2 digits is the common case; see the width rules below):

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

**Prefix width is 2–5 digits**, ordered by **numeric value** (the validator rejects 1-digit and 6+; `_` separator required). Width and numeric-value sort come from **one shared parser** (`parsers/core/order-prefix.ts`, mirrored in the plugin's `scripts/_order-prefix.mjs`), used by both the docs loader and the issue tracker. Docs use the strict `_` separator; the issue tracker also tolerates a legacy `-` (one grammar — the separator is the only knob). Because order is by value, widths coexist: `05_` (=5), `010_` (=10), `110_` (=110) all sort correctly, so you can widen a single folder without touching its siblings.

**Width is a tier, not a free choice:**

| Width | When |
|---|---|
| `NN_` (2-digit) | **The convention.** Use it almost always. |
| `NNN_` (3-digit) | Only on a **special requirement** — a folder with many entries that needs the headroom, or grouping via the leading digit (below). |
| `NNNN_` / `NNNNN_` (4–5) | **Very rare.** Only when the user explicitly demands it, or a case is genuinely exceptional. |

### Gap numbering — leave room to insert

When you first lay out a folder, **don't number siblings 01, 02, 03…** — space them so a new doc can slot *between* two existing ones without renumbering the rest (renumbering churns URLs and forces a `docs-guide move` to fix links).

- **Default: step 5** → `05_`, `10_`, `15_`, `20_`, … Four free slots between neighbours; ~19 fit in the 01–99 range. This is the house default and what the top-level section folders already use.
- **Denser: step 3** (`03_`, `06_`, `09_`, … ~33 slots) or **step 2** (`02_`, `04_`, … ~49 slots) — use when you expect many siblings in one folder. Smaller gaps, more total capacity.
- Pick the step from how many siblings the folder will realistically hold: a handful of top sections → step 5; a long flat list → step 2–3.

When two neighbours have no gap left between them (e.g. you must insert between `05_` and `06_`), re-prefix with **`docs-guide move`** rather than `mv` — it re-points every link as it renumbers. Squeezing `06_foo.md` between `05_x.md` and `10_y.md` needs no move at all; that's the whole point of the gaps.

Order can also be overridden without renumbering at all via `settings.json` `position` (folders) or frontmatter `sidebar_position` (pages) — but the prefix is the primary, at-a-glance signal, so prefer gap-spaced prefixes and reserve `position` for exceptions.

**Grouping with a wider prefix (optional).** With 3 digits the leading digit can annotate a *group* inside a single flat folder: `110_`, `120_`, `130_` = group 1; `210_`, `220_` = group 2. You get hierarchical grouping without subfolders (the classic line-number trick). Reach for this only when a flat folder genuinely has clusters; otherwise plain 2-digit gap-numbering is simpler.

## Per-folder `settings.json`

Required in every docs folder. Minimal shape:

```json
{
  "label": "Getting Started",
  "position": 5,
  "collapsible": false,
  "collapsed": false
}
```

(A level-1 group — always-open header. See the depth-based defaults below.)

| Field | Type | Default | Notes |
|---|---|---|---|
| `label` | string | folder name | Sidebar label |
| `position` | number | from prefix | Override prefix-based order |
| `collapsible` | boolean | `true` | Whether the sidebar group can be collapsed at all. `false` = a permanently-open section header (no toggle) |
| `collapsed` | boolean | `false` | Initial sidebar state — `true` starts collapsed (only applies when `collapsible` is `true`) |
| `nav_hide` | boolean | `false` | Hide from sidebar (page still accessible by URL) |
| `allow_diagram_pages` | boolean | `true` | **Section root only.** `false` stops diagram files rendering as first-class pages in the section |

### Recommended collapse defaults (depth-based)

The framework's built-in fallback is `collapsible: true` / `collapsed: false` at every depth. Override per folder to this house convention unless the user asks otherwise:

| Folder depth (within a section) | `collapsible` | `collapsed` | Effect |
|---|---|---|---|
| **Level 1** — top-level groups (the major sidebar headings) | `false` | `false` | Always-open section headers — no toggle, content always visible |
| **Level 2+** — nested subfolders | `true` | `true` | Collapsible and **start collapsed**, so the sidebar opens tidy and the reader expands what they need |

Rationale: the top-level groups are the map of the section and should always be readable; deeper nesting is detail that should fold away by default so the sidebar doesn't overwhelm. Set both fields explicitly in each folder's `settings.json` (don't rely on the framework fallback, which differs). Deviate freely when a section is shallow or a specific group should stay open — this is a sensible default, not a rule.

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

The `NN_` prefixes are stripped when building URLs (any width, 2–5 digits).

## Diagram pages — non-markdown pages

A prefixed `.mmd` / `.mermaid` / `.dot` / `.gv` / `.excalidraw` file is a
**first-class page** — same sidebar, same slug rules as markdown
(`20_architecture.mmd` → `/…/architecture`). Rules:

- **Title**: derives from the filename (strip prefix, title-case). Only when
  that isn't enough, add a sidecar `XX_name.meta.json` next to the file —
  the frontmatter equivalent for non-markdown pages. Prefer good filenames
  over sidecars. All fields optional, `.jsonc` (comments, trailing commas)
  accepted:

  ```json
  // 20_architecture.meta.json — sibling of 20_architecture.mmd
  {
    "title": "System Architecture",
    "description": "High-level component diagram",
    "sidebar_label": "Architecture",
    "sidebar_position": 3,
    "draft": false
  }
  ```
- **Slug collisions** (`15_x.md` + `16_x.mmd` → same `/x`) render an explicit
  error page + build error — rename one.
- **No prefix → skipped with a warning** (treated as a stray working file,
  not a page). Files under `assets/` are never scanned — embed-only diagrams
  live there.
- **Opt-out**: `"allow_diagram_pages": false` in the *section-root*
  `settings.json`.
- The outline column auto-hides (no headings); click opens the pan/zoom lightbox viewer;
  excalidraw pages carry an *open file ↗* link to the raw scene.
- **Embed vs page**: figure inside prose → embed from `assets/`
  (see `writing.md`); the diagram IS the content → prefixed file as a page.
- User-guide: `@root/default-docs/data/user-guide/15_writing-content/06_diagram-pages.md`;
  all three types render live on `15_writing-content/07_diagram-showcase.md`.

## Outline (right rail)

The outline is built from `##` and `###` headings in the page body. Use `#` only for the page title (and prefer the frontmatter `title` over an `<h1>` in body).

## Cross-linking between docs pages

Use relative paths or the resolved URL:

```markdown
See [installation](../getting-started/installation) for setup.
See [installation](/user-guide/getting-started/installation) — also works.
```

## Validate

The plugin ships **`docs-guide check section`** (on your `PATH` after install) — runs structural checks against a docs section so you don't have to eyeball it.

```bash
# Section-folder is required (no default — there can be many sections)
docs-guide check section ./data/user-guide
docs-guide check section ./data/dev-docs
```

What it checks:
- `NN_` numeric prefix (2–5 digits) on every folder (except `assets/`) and `.md` file (except `README.md`)
- `settings.json` present in every folder
- Frontmatter `title:` present on every `.md` file
- No prefix collisions within a folder — compared by **numeric value**, so `02_` and `002_` (both = 2) clash; 1-digit and 6+-digit prefixes are rejected

Exit code `0` = clean, `1` = errors found. Run after restructuring a section or before committing a batch of new pages.

## Moving / renaming docs (docs-guide move)

Pages cross-link each other with **relative** paths (see "Cross-linking between docs pages" above). A plain `mv` or `git mv` moves the file but leaves every one of those relative links pointing at the old location — so the moment you reorganise a section, links silently rot: inbound links from sibling pages 404, and the relative links *inside* the moved page now resolve from the wrong directory. Nothing warns you; the build still passes.

The plugin ships **`docs-guide move`** (on your `PATH` after install) to make this safe — it's a link-aware move, the same move-and-update-links behaviour an editor like Obsidian does:

```bash
docs-guide move <from> <to> [--dry-run] [--no-git] [--root <dir>]
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
- `--no-git` — force a plain filesystem move. By default, inside a git work tree `docs-guide move` uses `git mv` so history follows the file.
- `--root <dir>` — widen or override the scan + validation scope. By default the scope is the content root resolved from `.env` (`CONFIG_DIR`); both `<from>` and `<to>` must resolve inside it.

```bash
# preview a rename
docs-guide move data/user-guide/05_getting-started/02_install.md \
          data/user-guide/05_getting-started/03_install.md --dry-run

# move a whole subfolder, fixing links on both sides
docs-guide move data/user-guide/10_configuration data/user-guide/12_configuration
```

On success it prints `moved <N> file(s); rewrote <M> link(s) across <K> file(s)`.

## Cross-references

- `@root/default-docs/data/user-guide/17_docs/` (the framework's bundled user-guide) — full section
- `references/writing.md` — markdown / frontmatter basics
- `references/settings-layout.md` — registering a new docs section in `site.yaml`
