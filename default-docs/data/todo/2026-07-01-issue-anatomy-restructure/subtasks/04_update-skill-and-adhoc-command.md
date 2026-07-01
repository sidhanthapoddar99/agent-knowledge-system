---
title: Update the skill + add an adhoc-issue capture command
state: open
---

Bring the `documentation-guide` / `doc-agent` skills in line with the new structure,
and add tooling for the issues dump (subtask 02).

- [ ] Rewrite `doc-agent` for flat `NNN_<name>/` agent-logs (drop category wrappers)
- [ ] Document Brainstorm, Notes-as-product, flat Comments, Agent-memory in the skill
      reference (`references/layouts/issues/`)
- [ ] **New command** to quickly note down an adhoc idea/issue into the dump without
      hand-building a folder (pairs with subtask 02's "issues dump")
- [ ] Update the CLI wrappers (`docs-*`) for any new sections
- [ ] **Split the monolith skill into 4 (skill-per-domain).** Instead of one
      `documentation-guide` skill carrying everything, add three domain skills —
      **docs**, **issues**, **blogs** — each with a tight trigger surface for sharper
      activation. The original `documentation-guide` **stays** as the shared reference
      hub (CLI toolkit + options, common tooling, cross-cutting conventions); the three
      domain skills **defer to it** for those shared references instead of duplicating
      them. Net: four focused skills, better triggering, no reference drift.
      - Keep in mind the existing `doc-agent` skill (execution-time companion) — decide
        whether it folds into the issues skill or stays a separate thin trigger.
