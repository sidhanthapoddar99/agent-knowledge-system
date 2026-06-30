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
