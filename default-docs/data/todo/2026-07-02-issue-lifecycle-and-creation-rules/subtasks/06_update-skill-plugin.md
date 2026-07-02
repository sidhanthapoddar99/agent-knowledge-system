---
title: Update the documentation-guide skill plugin
status: open
---

Mirror `notes/01_lifecycle-vocabulary.md` into the plugin — repo source
`plugins/documentation-guide/` AND the installed cache copy, diff-verified in sync.
**Paths below reflect the post-split layout** (the tracker domain now lives in the
`doc-issues` skill; the original file list here predated that split). **Sequencing:**
land this BEFORE subtask 09 restructures `doc-issues/references/` into folders — or
fold both passes into one if 09 runs in the same session; don't rebase each other's
renames.

- [ ] `skills/doc-issues/SKILL.md` — the router's "Lifecycle — states & AI rules"
      section: 4 categories / 7 statuses, auto `in-progress`, the `input-needed`
      question protocol (question inline in the subtask; delete-or-keep after
      answering), ceiling = Review category, `done`/`dropped` human-only with
      `dropped` needing a comment, default search scope = not-Closed, review-debt
      promotion via the Review category. Also the "Executing work" section's state
      mentions.
- [ ] `skills/doc-issues/references/02_settings.md` — **delete the "Assignees double
      as the in-progress signal" section** (including the "do not propose a separate
      in_progress boolean" rule — reversed by this issue); document that status
      values are code-fixed and only colors are overridable.
- [ ] `skills/doc-issues/references/03_vocabulary.md` — the fixed enum + category
      grouping; root settings.jsonc's shrunken role (colors only); `wip` label
      deprecation note.
- [ ] `skills/doc-issues/references/23_subtasks.md` — "state follows the same
      4-state vocabulary" → the shared 7-status enum under the unified `status`
      field name (subtask 07); inline-question convention for `input-needed`.
- [ ] `skills/doc-issues/references/42_updating.md` — creation flow's state
      guidance; `docs-guide issue set-state` examples under the new vocabulary.
- [ ] `skills/doc-issues/references/41_searching.md` + `24_agent-logs.md` +
      worked examples (`61`–`64`) — sweep for `open + review` default-scope and
      old-state mentions; update to category language.
- [ ] `skills/documentation-guide/` — sweep its references for lifecycle mentions
      (the sibling pointer text, `cli-toolkit.md` set-state examples).
- [ ] Repo `CLAUDE.md` — tracker-mental-model paragraph + doc-issues skill
      description: new states/categories, drop any assignee-derivation mention.
- [ ] Bump plugin version once; rsync to installed cache; `diff -r` verified
      identical.
