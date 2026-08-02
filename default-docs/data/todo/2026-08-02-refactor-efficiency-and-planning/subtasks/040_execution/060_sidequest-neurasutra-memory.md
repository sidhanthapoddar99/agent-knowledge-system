---
title: "Sidequest — fix NeuraSutra's own memory"
status: open
---

# Overview

The project that surfaced this problem carries its own always-on rule files, and
several of them are local causes rather than inherited ones. Once the upstream
rules land, bring the consumer into line — and **only then**.

**Done when** `neurasutra-docs/memory/*` and its `CLAUDE.md` contain no rule that
duplicates an upstream one, its plans have moved to the new section, and a run
there produces log proportional to its change.

# References

- What is wrong and by how much: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
- Upstream gates — **all three must land first**:
  [Skill: the plans section](./030_skill-plans-section.md),
  [Skill: the proportionality rules](./040_skill-efficiency-rules.md),
  [Update ~/.claude/CLAUDE.md](./020_update-global-claude-md.md)
- Target repo: `neurasutra-docs` — `CLAUDE.md`, `memory/orchestration.md`,
  `memory/standing-rules.md`, `memory/codex-sol.md`, `memory/testing-rules.md`

# Todo list

- [ ] Re-read all five always-on files against the new upstream rules
- [ ] Remove the *"keep all six present even when blank"* mandate — or restate
      it as the upstream conditional form
- [ ] Revise the audit-record schema (`<activity>/audit/<scope>.md`) per the
      new report policy
- [ ] Revise the sol-brief convention so briefs are summarised, not committed
      verbatim
- [ ] Migrate `agent-memory/plans/` → the new section (migration script from
      `010`)
- [ ] Verify: nothing in `memory/` restates an upstream rule — links only
- [ ] Re-measure one run afterwards and compare against the audit's numbers

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why this is last, not first

NeuraSutra's `memory/` files are required to **link** upstream rather than copy —
its own precedence note says so: *"a copy cannot know it was replaced, so it goes
stale silently."* Fixing the consumer before the upstream would put a divergent
copy in the field, which is the exact failure that rule exists to prevent.

## The locally-owned rules — the ones that are genuinely NeuraSutra's

Not everything there is inherited. These are its own, and are the ones to change
here rather than upstream:

| Rule | Effect measured |
|---|---|
| *"Keep all six present even when blank — a stub plus a fill-me callout beats a missing slot"* (`standing-rules.md`) | The six-file agent log floor; 15.4% of all writing |
| *"One file per scope… per finding: severity, `file:line`, the failure scenario, whether it was REPRODUCED… also name the areas checked and found clean"* (`orchestration.md`) | Audit reports at 46.7% of all writing |
| The sol-brief convention — *"write the detail as a file in the agent log's `03_working/`"* (`codex-sol.md`) | 160 committed brief files |

## Measurement is part of the deliverable

The audit gave a baseline: 8.8% code, 1,928 log lines for a five-line change,
73% of writing in `agent-log/`. **Re-measure one comparable run after the change
with the same commands** and put both numbers side by side. Without that, this
subtask is an assertion that things improved.

## Scope

Rule files, plan migration, and the measurement. **Not** a retro-edit of existing
agent-log folders — history stays as written. This changes what gets recorded
next.
