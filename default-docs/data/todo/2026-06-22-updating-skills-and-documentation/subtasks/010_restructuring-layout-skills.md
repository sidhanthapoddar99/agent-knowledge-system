---
title: Restructuring layout skills
status: done
---

Group the three content-type layout references under one folder so the skill's
`references/` directory reads cleanly.

**Done:**

- Moved `docs-layout.md`, `blog-layout.md`, `issue-layout.md` → `references/layouts/`
  (the move itself was already in commit `2da8ab6`; this closed out the loose ends).
- Updated **every live pointer** to the new path:
  - Skill: `SKILL.md` (triage table + 5 inline mentions), `references/writing.md`,
    `references/settings-layout.md`, the moved `issue-layout.md`'s own cross-ref, and the
    three `scripts/{docs,blog,issues}/check.mjs` header comments.
  - Framework docs: `user-guide/05_getting-started/05_claude-skills.md`,
    `dev-docs/25_plugins/05_creating-plugins/03_capabilities.md`,
    `user-guide/19_issues/01_overview.md`.
- Left tracker history under `data/todo/` untouched (those are snapshots, not live pointers).

`references/writing.md`, `settings-layout.md`, and `images.md` stay at the `references/`
root — only the three content-type *layout* files moved. Build green (295 pages).
