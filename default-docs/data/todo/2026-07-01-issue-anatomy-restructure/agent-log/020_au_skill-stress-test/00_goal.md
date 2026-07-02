---
title: Goal
---

Stress-test the freshly shipped **`doc-issues` skill** (plugin v0.4.0, installed and
reloaded by sidhantha) with an A/B agent experiment: does the skill measurably
change how agents work a tracker versus their unaided judgment?

**Design.** A throwaway tracker (`default-docs/data/todo-testing/`, 9 seeded
issues) with four scenarios, each run by a pair of same-model agents — one told to
read and follow the skill, one barred from the plugin entirely. Same model within
each pair isolates the skill effect from the model effect.

| Scenario | Exercises | Model pair |
|---|---|---|
| S1 work-an-issue | note writing, subtask state (review-not-closed), agent-log activity shape, no-bare-dump | Opus |
| S2 idea capture | creation litmus test — dump entry vs new-issue bloat | Sonnet |
| S3 brainstorm graduation | distil to notes + `Resolved →` marker, trail kept | Opus |
| S4 review queue (read-only) | search scope (open+review), review-debt promotion, closed-issue exclusion | Sonnet |

**Metric.** Per-scenario rubric checklists (graded post-hoc against the operating
rules), plus `docs-guide check issues --tracker` on the artifacts, plus a
qualitative diff of the paired outputs.

**Known caveat.** Baseline agents still receive the repo `CLAUDE.md` (which
summarizes the tracker mental model) — the comparison is skill vs CLAUDE.md-only,
not skill vs nothing. That matches the real question: what does the skill add on
top of project memory?
