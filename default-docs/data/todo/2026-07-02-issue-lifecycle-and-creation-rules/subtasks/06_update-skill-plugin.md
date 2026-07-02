---
title: Update the documentation-guide skill plugin
state: open
---

Mirror the new model into the plugin (repo source `plugins/documentation-guide/` AND
the installed cache copy — keep both in sync).

- [ ] `references/layouts/issues/00_overview.md` — lifecycle section: new states,
      categories, transition table, updated AI rules
- [ ] `references/layouts/issues/02_settings.md` — **delete the "Assignees double as
      the in-progress signal" section** (including the "do not propose a separate
      in_progress boolean" rule — reversed by this issue)
- [ ] `references/layouts/issues/03_vocabulary.md` — new status enum + grouping
- [ ] `references/layouts/issues/23_subtasks.md` — "state follows the same 4-state
      vocabulary" → the expanded shared enum (subtasks mirror issue states)
- [ ] `references/layouts/issues/42_updating.md` — creation flow gains the
      threshold rules from subtask 01 (duplicate-check → threshold-check)
- [ ] Repo `CLAUDE.md` tracker-mental-model paragraph — update the states + drop the
      assignee derivation
- [ ] Bump plugin version
