---
title: Summary
---

This refactor split the plugin's skills in two — extracting the issue-tracker domain
into a new self-contained `doc-issues` skill and refreshing its content against the
finalized anatomy (`notes/01_issue-anatomy/`) — executing subtask 04 phase 2 plus the
reference half of phase 3. Shipped in one session (2026-07-02), plugin version
0.3.3 → 0.4.0:

- **`doc-issues` skill created** — SKILL.md router (operating model, creation rules,
  lifecycle + AI rules, agent-log quick guide, 20-file triage table) with a dual
  noun + verb trigger description; 16 references moved in via `git mv`; new
  `10_writing.md`, `25_brainstorm.md`, `26_agent-memory.md`,
  `27_guide-and-glossary.md`; `24_agent-logs.md` + `63_agent-loops.md` rewritten to
  the `NNN_<code>_<name>/` activity-folder anatomy; overview / folder-layout /
  settings / comments / notes / subtasks / updating refreshed against
  `notes/01_issue-anatomy/**` + `notes/02_operating-rules.md`.
- **`doc-agent` retired** (absorbed); **`documentation-guide` trimmed** to
  docs / blog / config / writing / images with mutual cross-references and writing
  sync notes.
- **Propagated**: repo `CLAUDE.md`, skill catalogue page (incl. "why two skills"
  rationale), plugin README, manifest description; mirrored to the installed cache
  (diff-verified identical).
- **Validation**: `docs-guide check skill-links` green for both skills (repo +
  cache), `check issues` green, CLI sanity green.

Remaining in subtask 04 phase 3: the `/docs-quick-idea-note` slash command (a
command, not a CLI tool) and any CLI-surface updates — plus subtask 07's
vocabulary/dump groundwork (`issue-dump` component, blessing
`future-feature-ideas`).
