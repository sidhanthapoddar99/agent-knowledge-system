---
title: "Outward-facing mental-model writeup (user-guide + plugin skill + CLAUDE.md)"
state: closed
---

- [x] **User-guide front page for the issues section.** Add (or rewrite) the overview page at `default-docs/data/user-guide/19_issues/01_*.md` so the *first thing* anyone reads is what this tracker is for: structured memory of thought-work for AI-augmented development, not project planning. Spell out the planning → execution flow (issue → notes → subtasks → agent-log → comments) and the deliberate omissions (no sprints, no due dates, no milestones).
- [x] **Plugin skill `references/issue-layout.md`.** Add an "Operating model" or "What this tracker is" section near the top so agents pick up the framing before they touch a tracker. Cross-link to the user-guide page.
- [x] **`CLAUDE.md`.** One-paragraph addition near the existing tracker section: same framing, telegraphic. Plus one sentence telling future agents not to re-introduce milestone / due / sprint-style fields without an explicit policy reversal.
- [x] **Cross-references.** Each of the above three should link to the others, so a reader landing on any one finds the rest. The user-guide page is the canonical source; the others summarise and point.
- [x] **Test**: `docs-check-section default-docs/data/user-guide/19_issues` exits 0; render the user-guide page in a browser and read it cold — does it explain the philosophy in under three minutes?

## Landed

`default-docs/data/user-guide/19_issues/01_overview.md` rewritten end-to-end to lead with the mental model. `references/issue-layout.md` gained a `## 0. Operating model` section before the folder layout. `CLAUDE.md` gained a "Tracker mental model" paragraph after the wrapper command list, with the explicit "do not re-introduce milestone / due / sprint-style fields without an explicit policy reversal" line. All three cross-link.

## What to capture (concrete content)

Pull from the existing internal note `2026-04-10-issues-layout/notes/02_design-philosophy-and-review-state.md` (already very good — most of the writeup can quote / adapt from there) **plus** the framing the user articulated this round:

- **Issue = unit of recorded thought-work**, not a ticket.
- **Phases**: planning (`issue.md` + `notes/`) → execution (`agent-log/`) → dialog (`comments/`). Subtasks are the AI-handoff units inside that flow.
- **What's deliberately absent and why**: no sprints, no due dates, no milestones, no `type` field, no `in-progress` / `blocked` as primary statuses. Each absence has a reason; document it so the absences look intentional, not forgotten.
- **The team profile**: 1–4 humans + AI agents shipping continuously. Coordination overhead is near zero; bookkeeping that survives only adds friction.
- **Best practices** (cross-link to subtasks 04 and 05): 1 component per issue (typically); ≥1 subtask for AI-handoff-bound issues.

## Why this is the highest-leverage subtask

Without this writeup, the dropped fields look arbitrary. Someone — human or AI — will eventually re-introduce milestone, due, or a `type` field with the best of intentions. A clearly-articulated mental model is the only durable defence; the writeup is what that model rests on.

## Files likely touched

- `default-docs/data/user-guide/19_issues/01_*.md` (likely an existing overview page; check current shape and rewrite, don't add a new page if one already covers this)
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`
- `CLAUDE.md`
