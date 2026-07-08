---
title: "Open-issue consistency pass — new names in unclosed issues"
status: open
---

Closed issues keep their historical names (history lives in git and the
tracker). But issues still in flight — open / in-progress / review — contain
*forward-looking* references (planned work naming `docs-guide` commands,
`artifact-authoring` skill pointers, subtask instructions that an agent will
execute later). Those must speak the new vocabulary or a future executor will
chase names that no longer exist.

## Tasks

- [ ] `agent-ks issue list` over every non-closed issue; grep their subtasks /
      notes / issue bodies for `docs-guide`, `doc-issues`,
      `artifact-authoring`, `documentation-guide` (skill sense).
- [ ] Rewrite forward-looking references to `agent-ks`, `agent-ks-issues`,
      `agent-ks-artifacts`, `agent-ks-docs`; leave retrospective records
      (agent-logs, comments, closed subtasks) as written.
- [ ] Special case: `2026-07-07-artifact-component` subtasks 110/120 point at
      the artifact skill by name — update before they're executed.
