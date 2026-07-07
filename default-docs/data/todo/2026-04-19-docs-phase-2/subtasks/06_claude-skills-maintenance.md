---
title: "Claude skills — catalogue maintenance"
status: review
---

Keep the user-guide Claude-skills page in sync with the actually-installed skill set. The authoritative list lives at `user-guide/05_getting-started/05_claude-skills.md` as a single four-column table (**Skill / Command / Use for / Triggers on**).

## Trigger conditions

Rewrite / extend the table whenever **any** of these happen:

- [ ] A new skill is added to `.claude/skills/` (e.g. the planned `issues` skill — see `2025-06-25-claude-skills/subtasks/02_issues-skill.md`).
- [ ] An existing skill's trigger vocabulary changes (the "Triggers on" column drifts if we don't update).
- [ ] A skill is renamed or removed.
- [ ] The install one-liner changes (new script URL, different flags).

## Per-skill checklist

For every skill added, update:

- [ ] The **Skill catalogue** table — one row with all four columns.
- [ ] The **decision tree** bullets at the top of "When to reach for which" if the new skill shifts how users should pick.
- [ ] The **Task → Skill** table — add any new task patterns the skill handles.
- [ ] The **Installation permissions block** (`.claude/settings.local.json`) — add a `Skill(<name>)` entry.
- [ ] The **Example prompts** section — 2–4 prompts per new skill.

## Concrete pending skills to add

These are already in the tracker and will need rows when they land:

- [ ] `issues` — Claude skill for navigating the issue tracker (scope lives in `2025-06-25-claude-skills/subtasks/02_issues-skill.md`).

## Cross-reference

- Source of truth for the catalogue: `.claude/skills/` directory.
- Installation: Claude Code plugin marketplace (this repo's root has `.claude-plugin/marketplace.json`; consumers run `/plugin marketplace add <repo-url>` then `/plugin install documentation-guide@<marketplace>`). The earlier `download-skills.{sh,mjs}` approach was abandoned — see `2025-06-25-claude-skills/subtasks/09_plugin-marketplace-dogfood.md`.
- Skill permissions: `.claude/settings.local.json`.
