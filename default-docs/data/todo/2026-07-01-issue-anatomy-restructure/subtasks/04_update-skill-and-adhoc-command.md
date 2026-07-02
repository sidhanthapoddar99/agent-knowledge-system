---
title: Update the skill + add an adhoc-issue capture command
state: open
---

Bring the `documentation-guide` / `doc-agent` skills in line with the new structure,
and add tooling for the issues dump (subtask 02).

- [ ] Rewrite `doc-agent` for `NNN_<code>_<name>/` activity folders (kind code in the
      folder name; drop category wrappers)
- [ ] Document Brainstorm, Notes-as-product, flat Comments, Agent-memory in the skill
      reference (`references/layouts/issues/`)
- [ ] **How to write a subtask** — add authoring guidance to the skill reference. A
      subtask should read without prior context: a short intro saying what it is and
      why; `##` groups when it outgrows a flat list; checkboxes with a **bolded lead**
      followed by the explanation (what/where/how, concrete paths and examples);
      spell out pointers instead of shorthand. Use this issue's subtasks 03/05 as the
      worked examples of the format.
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
