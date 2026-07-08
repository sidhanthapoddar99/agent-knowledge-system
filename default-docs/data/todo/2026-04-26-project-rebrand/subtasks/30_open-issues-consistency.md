---
title: "Open-issue consistency pass — new names in unclosed issues"
status: review
---

Closed issues keep their historical names (history lives in git and the
tracker). But issues still in flight — open / in-progress / review — contain
*forward-looking* references (planned work naming `docs-guide` commands,
`artifact-authoring` skill pointers, subtask instructions that an agent will
execute later). Those must speak the new vocabulary or a future executor will
chase names that no longer exist.

## Tasks

- [x] `agent-ks issue list` over every non-closed issue; grep their subtasks /
      notes / issue bodies for `docs-guide`, `doc-issues`,
      `artifact-authoring`, `documentation-guide` (skill sense).
- [x] Rewrite forward-looking references to `agent-ks`, `agent-ks-issues`,
      `agent-ks-artifacts`, `agent-ks-docs`.
- [x] **Scope widened by sidhantha:** sweep *every* file in non-closed issues —
      agent-logs, comments, brainstorms, notes, done subtasks, HTML notes, the
      integrity manifest's path strings — 188 occurrences across 65 files.
      Plugin-sense `documentation-guide` stays; only CLOSED issues keep the
      historical names. The runtime-stack-migration plugin-upgrade notes were
      de-staled along the way (their "current state" still described the
      retired flat wrappers; now `agent-ks <group> <verb>`).
- [x] Special case: `2026-07-07-artifact-component` subtasks 110/120 point at
      the artifact skill by name — update before they're executed.
