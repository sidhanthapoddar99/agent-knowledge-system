---
title: "Sizing tweaks"
status: input-needed
agent: claude
---

# Goal
A five-level tree overflows the sidebar before the deepest row is reachable.

# Inputs
- `notes/01_decided-architecture.md`

# Expected Outcome
The change, and what it touched.

# Outcome
Row height 28px → 24px, behind `?dense=1`. The five-level fixture now fits.

> [!IMPORTANT]
> **Question, inline, where a fresh session will see it.**
> **Do this:** open the fixture's `brainstorm/04_nesting-demo/` tree with and
> without `?dense=1`.
> **Watch for:** whether the fifth level is readable, or merely present.
> **Send back:** both screenshots.
> **Why it matters:** if 24px is unreadable the fix is horizontal, not vertical,
> and that is a different change.

Automation can confirm the rows *fit*. Only a person can say they read well —
`status: input-needed` rather than `done`, because the agent did not finish.
