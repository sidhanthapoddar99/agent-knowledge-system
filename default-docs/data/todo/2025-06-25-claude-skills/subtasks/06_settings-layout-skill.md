---
title: "`docs:settings_layout` skill"
status: done
---

Site-level configuration skill. Supersedes / expands the existing `docs-settings`. Covers everything *above* the per-content-type layer — the site chrome, routing, theming, aliases.

## Reference docs — read before authoring

Every documentation-template install ships with a user-guide under `dynamic_data/data/user-guide/`. The skill spec must align with what the user-guide says — **read the relevant pages first** so the skill stays in sync with the docs (and update both together if anything is missing).

For this skill, the canonical user-guide sections are:

- `dynamic_data/data/user-guide/05_getting-started/` — overview, installation, aliases, data-structure
- `dynamic_data/data/user-guide/10_configuration/` — `.env`, `site.yaml` (metadata, paths, theme, server, editor, logo, page, reference), `navbar.yaml`, `footer.yaml`, dev-mode
- `dynamic_data/data/user-guide/16_layout-system/` — overview, switching styles, custom layout styles (`LAYOUT_EXT_DIR`)
- `dynamic_data/data/user-guide/20_custom-pages/` — custom-page definitions (the `pages:` block in `site.yaml`) + built-in custom layouts + creating custom layouts
- `dynamic_data/data/user-guide/25_themes/` — for theme-related questions; the skill should *point users here* rather than duplicate the theme contract (see also §1 cross-references)
- `dynamic_data/data/user-guide/05_getting-started/05_claude-skills.md` — skill catalogue page (must update the `docs-settings` row or add a new `docs:settings_layout` row)

## Content checklist

Mini todo list of what the skill must cover. More items will be added as the spec evolves.

### 1. Docs project structure

The very first thing the skill teaches — *where everything lives* before any config file is opened.

- [ ] **Where the docs folder lives** —
    - **Standalone docs site:** the docs *is* the project root.
    - **Docs alongside an app:** the docs lives in a `docs/` folder inside the larger project.
- [ ] **The two parts of the docs folder** —
    - **`data/`** — content + config + assets (the user's editable layer).
    - **`documentation-template/`** — the framework code itself. Get it via:
      ```bash
      git clone https://github.com/sidhanthapoddar99/documentation-template.git
      ```
- [ ] **The `.env` requirement** in the template code — `CONFIG_DIR` must point to the config folder inside `data/`. For the typical sibling layout that's:
      ```
      CONFIG_DIR=../data/config
      ```
- [ ] **Layout of `data/`** (not fixed; conventional shape) —
    - `assets/` — images, downloads, anything served as a static asset
    - `config/` — `site.yaml`, `navbar.yaml`, `footer.yaml`
    - `data/` — all content (docs, blog, issues, custom pages); arbitrary nesting / structure
    - `layouts/` — *optional*; only when shipping custom page layouts (then set `LAYOUT_EXT_DIR=../data/layouts` in `.env`)
    - `themes/` — *optional*; only when shipping custom themes
- [ ] **Cross-references — when to hand off to other skills / docs:**
    - **Themes** — to create or edit a theme, read `documentation-template/dynamic_data/data/user-guide/25_themes/`. The skill should point users there rather than duplicate the theme contract.
    - **Layouts** — to add a custom layout, read the layouts user-guide section, and load `docs:docs_layout` (or the relevant content-type skill) for the type-specific shape.
    - **Content authoring** — markdown / frontmatter handled by `docs:writing`; per-type structure handled by `docs:docs_layout`, `docs:blog_layout`, `docs:issue_layout`.

## Scope

- `site.yaml` — all fields (site metadata, paths, theme, base, server, editor, page definitions)
- `navbar.yaml` — items, dropdowns, icons, external links, theme toggle
- `footer.yaml` — columns, bottom row, compact variants
- `.env` — runtime environment vars (dev vs prod, API keys)
- Path aliases — `@docs`, `@blog`, `@issues`, `@data`, `@assets`, `@themes`, plus user-defined
- Theme selection — `theme:` field, `theme_paths:` discovery, extends chain
- Adding a new section — wiring a content-type into the right layout + section label
- Custom page definitions — `pages:` block in `site.yaml`

## Out of scope

- Per-content-type structure — handled by `docs:docs_layout`, `docs:blog_layout`, `docs:issue_layout`
- Writing markdown — handled by `docs:writing`
- Creating a whole new layout — if we later add a `/layout-builder` skill, that's separate

## Relationship to existing skills

Supersedes `docs-settings`. Decision pending (see `comments/001_five-skill-plan.md`): rename + expand in place, or deprecate and replace.

## Authoring notes

- Follow the pattern established by `02_issues-skill.md`.
- Needs namespace + supersession decisions (see comment 001).
