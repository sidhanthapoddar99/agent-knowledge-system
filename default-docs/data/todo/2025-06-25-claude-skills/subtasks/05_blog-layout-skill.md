---
title: "`docs:blog_layout` skill"
state: closed
---

New skill covering the `blog` content type's file / folder / frontmatter shape. Blog-specific (not shared markdown basics — those are `docs:writing`).

## Reference docs — read before authoring

Every documentation-template install ships with a user-guide under `dynamic_data/data/user-guide/`. The skill spec must align with what the user-guide says — **read the relevant pages first** so the skill stays in sync with the docs (and update both together if anything is missing).

For this skill, the canonical user-guide section is:

- `dynamic_data/data/user-guide/18_blogs/` — blog-specific overview, index page, file structure (`YYYY-MM-DD-<slug>.md`), frontmatter, asset embedding
- `dynamic_data/data/user-guide/05_getting-started/05_claude-skills.md` — skill catalogue page (must add a row for `docs:blog_layout`)

## Scope

- Flat file naming — `YYYY-MM-DD-<slug>.md` (no folders, no `XX_` prefix)
- Frontmatter fields — `title`, `description`, `date`, `tags`, `draft`, `author`, `featured`
- Post body conventions — summary / lede, headings, assets, pull quotes
- Index page behaviour — sort order, featured pinning, tag facet
- Post detail page — related posts, next/prev, tag chips
- Asset embedding specific to blog posts (cover images, inline figures)

## Relationship to other skills

- `docs:writing` — markdown / frontmatter basics that span all types
- `docs:blog_layout` — blog-specific file naming, tags, and index behaviour

## Authoring notes

- Follow the pattern established by `02_issues-skill.md`.
- Needs namespace decision (see comment 001).
