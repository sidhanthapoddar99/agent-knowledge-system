# Data layout

User-editable content layer for the agent-knowledge-system framework. Every directory here serves a specific purpose; if you add or remove a top-level folder, update this file in the same change.

The `agent-ks-docs` Claude skill (`plugins/documentation-guide/skills/agent-ks-docs/SKILL.md`) reads this README at the start of every task to orient itself — keeping it current means the skill stays accurate.

## Top-level directories

| Folder | Purpose | Content shape | Served at | Layout |
|---|---|---|---|---|
| `user-guide/` | End-user docs about the framework — setup, configuration, content authoring, themes. The canonical reference for how things work. | Sidebar-driven docs with `XX_` prefix + per-folder `settings.json` | `/user-guide/…` | `@docs/default` |
| `dev-docs/` | Developer-facing docs — architecture, layouts, scripts, dev tooling, internals. | Sidebar-driven docs with `XX_` prefix + per-folder `settings.json` | `/dev-docs/…` | `@docs/default` |
| `docs/` | General-purpose docs section (e.g. `components/` documentation). | Sidebar-driven docs with `XX_` prefix + per-folder `settings.json` | `/docs/…` | `@docs/default` |
| `blog/` | Blog posts. | Flat `YYYY-MM-DD-<slug>.md` files (no `XX_` prefix, no folders). Frontmatter: `title`, `description`, `date`, `tags`, `draft`. | `/blog/…` | `@blog/default` |
| `todo/` | Issue tracker. | Folder-per-item (`YYYY-MM-DD-<slug>/`) with `settings.json`, `issue.md`, `comments/`, `subtasks/`, `notes/`, `agent-log/`. Vocabulary lives in the tracker's root `settings.json`. | `/todo/…` | `@issues/default` |
| `pages/` | Custom page YAML data (home, about, countdown, etc.). | One YAML file per page, referenced from `site.yaml` `pages:`. | varies (see `site.yaml`) | `@custom/<style>` (e.g. `@custom/home`, `@custom/info`) |

## Conventions

- **`XX_` prefix** on files and folders inside `user-guide/`, `dev-docs/`, `docs/` (NOT in `blog/`, NOT in `todo/`). Controls sidebar order — re-prefix to insert.
- **`settings.json`** required in every docs folder (sidebar `label`, `position`, `collapsed`). Issues use a different shape (root vocabulary + per-issue metadata).
- **`title:` frontmatter** required on every `.md` file. Astro builds fail without it.
- **Drafts** — `draft: true` in frontmatter or in `settings.json` excludes the item from production builds.

## Routing — where pages are wired

Every top-level folder is registered as a route in `default-docs/config/site.yaml` under the `pages:` block. Each entry binds a `source:` (filesystem path) to a `base:` (URL prefix) and a `layout:`. To add a new top-level data folder, also register it in `site.yaml`.

## Adding a new top-level folder

1. Create the folder under `default-docs/data/<name>/`.
2. Add a root `settings.json` (for docs sections — sidebar `label`).
3. Register the route in `default-docs/config/site.yaml` under `pages:`.
4. **Update this README** with a row describing the new folder's purpose.
5. (Optional) Add a navbar entry in `default-docs/config/navbar.yaml`.

## See also

- `default-docs/config/site.yaml` — route definitions for each folder above
- `user-guide/05_getting-started/04_data-structure.md` — end-user explanation of this layout
- `plugins/documentation-guide/skills/agent-ks-docs/SKILL.md` — the agent skill that reads this README for orientation
- `plugins/documentation-guide/skills/agent-ks-docs/references/` — per-content-type detail (writing, docs-layout, blog-layout, settings-layout, images)
