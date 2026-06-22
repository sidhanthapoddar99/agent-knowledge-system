---
title: "`docs:docs_layout` skill"
state: closed
---

New skill covering the `docs` content type's file / folder / settings shape (not the markdown content itself — that's `docs:writing`).

## Reference docs — read before authoring

Every documentation-template install ships with a user-guide under `dynamic_data/data/user-guide/`. The skill spec must align with what the user-guide says — **read the relevant pages first** so the skill stays in sync with the docs (and update both together if anything is missing).

For this skill, the canonical user-guide section is:

- `dynamic_data/data/user-guide/17_docs/` — docs-specific overview, structure, folder settings (per-folder `settings.json`), frontmatter, asset embedding
- `dynamic_data/data/user-guide/05_getting-started/05_claude-skills.md` — skill catalogue page (must add a row for `docs:docs_layout`)

## Scope

- Docs folder structure — nested sections, `XX_` prefixes, depth discipline
- Per-folder `settings.json` — label, position, collapsed, nav-hide
- Frontmatter fields specific to docs (`title`, `description`, `sidebar_label`, `sidebar_position`, `draft`)
- Sidebar generation model — which files appear, in what order, under what label
- Outline (right-rail) heading discipline — `##`/`###` vs `#`
- Cross-linking between docs pages (relative paths, `[link](../other-section/page)`)

## Relationship to other skills

- `docs:writing` — markdown / frontmatter basics that span all types
- `docs:docs_layout` — docs-specific folder, settings, sidebar

## Authoring notes

- Follow the pattern established by `02_issues-skill.md`.
- Needs namespace decision (see comment 001).
