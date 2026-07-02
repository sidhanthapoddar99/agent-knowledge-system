---
iteration: 6
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

# Milestone 6 — Agent-log skill/reference overhaul + log consolidation (post-loop)

> Follow-on refinement: loop agent-logs were coming out as unreadable run-on paragraphs. Fix it at the source — the skill guidance and the logs themselves.

## Goal
Make loop/audit/refactor agent-logs readable and meaningful: structured markdown instead of a flat dump, and **consolidated to milestones** instead of one entry per subtask.

## Approach
- **Root cause:** `docs-guide issue add-agent-log` writes `--body` verbatim with no template, so a multi-line entry collapses into one paragraph — and the Goal→Approach→Result→Next shape was only a convention, unenforced and often not loaded during a `/loop`.
- **Skill + reference fix** (`doc-agent/SKILL.md`, `references/layouts/issues/24_agent-logs.md`):
  - Make **writing the file directly** (Write tool, sectioned markdown — `## Goal/Approach/Result/Next`, bullets, **Mermaid/ASCII diagrams**) the default.
  - **Demote** `docs-guide issue add-agent-log` to a one-LINE-only convenience; note it flattens multi-line bodies. Manifest summary updated to say so.
  - Add the **"Log milestones, not steps"** rule: ~3–6 entries per run, agent-decided, *not* synced to the subtask count.
  - Aligned `63_agent-loops.md` (worked example) with the same guidance.
- **Proved it on this very loop:** rewrote the 18 per-subtask iteration logs into these 6 milestone entries, each in the new rich format.

```text
agent-log/200_lp_cli-consolidation/        (was agent-log/200_loops/010_cli-consolidation/ pre-restructure)
  before:  101_naming … 118_post-edit-matrix      18 logs · 1 per subtask · flat prose
  after:   101 foundation
           102 correctness-and-cleanup
           103 feature-buildout
           104 docs-version-closeout
           105 single-entrypoint
           106 agent-log-overhaul  (this entry)    6 logs · 1 per milestone · sectioned + diagrams
```

## Result
- Skill + reference now steer to direct, structured, milestone-level writes — the run-on-paragraph failure is addressed where it originates.
- Tracker validates (`docs-guide check issues` exit 0); harness **91/91**; `skill-links` clean.
- The agent-log for this issue is now skimmable: six milestones a human can read top-to-bottom and understand the whole arc.

## Next
Merge branch `cli-consolidation` into `main` (per maintainer go-ahead).
