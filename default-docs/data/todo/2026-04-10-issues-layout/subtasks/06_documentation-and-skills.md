---
title: "Documentation & skills (split & moved)"
status: done
---

> **✅ Closed — work split and relocated.**
>
> This subtask originally bundled three things: user-guide docs for the issues content type, dev-docs for the issues layout, and the design for a Claude `issues` skill (with helper Node scripts). All three have moved to dedicated homes — leaving this subtask empty, so it's closed.

## Where the work went

- **User guide for the issues content type** → absorbed into `2026-04-19-docs-phase-2/subtasks/01_issues-layout-docs.md` (and shipped as the `19_issues/` section under the user guide).
- **Dev docs for the issues layout** → covered by `2026-04-19-docs-phase-2` alongside the typography token / theme system docs.
- **Claude `issues` skill + `scripts/issues/*.mjs` helper CLI** → moved to `2025-06-25-claude-skills/subtasks/02_issues-skill.md`. All skill work is now consolidated under the `2025-06-25-claude-skills` issue so there's a single source of truth.

## Why it was split

Three different audiences (end users, framework developers, AI agents) and three different surfaces (user-guide pages, dev-docs pages, `.claude/skills/` + CLI scripts) made one subtask too coarse. Each new home tracks the work for its own audience.
