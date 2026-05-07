---
title: "Best-practice: ≥1 subtask per AI-handoff-bound issue"
state: closed
done: true
---

- [x] Document the convention: any issue intended for AI execution should declare **at least one subtask**. The subtask is the handoff anchor — it gives the agent an explicit "did this happen yet?" checkbox and a place to record progress. Issues a human will resolve in five seconds don't need this.
- [x] Phrase the rule as *"every AI-handoff-bound issue has ≥1 subtask"*, not *"every issue must have ≥1 subtask"*. The conditional matters — trivial human-only fixes shouldn't carry bookkeeping overhead.
- [x] Document in user-guide (alongside subtask 04's writeup — same target page).
- [x] Document in plugin skill `references/issue-layout.md` and `references/writing.md` so AI agents creating issues for themselves know to break the work down.
- [x] **Optional soft warning** in `docs-check-section`: if an issue has `assignees` containing an AI agent (e.g. `claude`) and no subtasks, emit a hint ("AI-handoff-bound issue has no subtasks — consider adding one"). Hint only; never an error. Decide during implementation whether the value is worth the validator complexity.

## Landed

Documented in user-guide overview, plugin skill `issue-layout.md`, and `writing.md`. The validator (`check.mjs`) emits a hint when an open / review issue lists a known AI agent in `assignees` but has no subtasks; the agent allow-list (`claude`, `gpt`, `gpt-4`, `gpt-5`, `codex`, `cursor`, `aider`) is intentionally narrow and easy to extend.

## Why this matters

Subtasks are the unit of AI handoff. An agent that picks up an issue without subtasks must invent its own breakdown, lose continuity if interrupted, and has no place to record partial progress. With even one subtask declared, the agent has a target and a checkbox; the next agent (or human reviewer) can pick up exactly where the previous one stopped.

## Files likely touched

- `default-docs/data/user-guide/19_issues/` — same page as subtask 04.
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`
- `plugins/documentation-guide/skills/documentation-guide/references/writing.md`
- Optionally `plugins/documentation-guide/scripts/issues/check.mjs`.
