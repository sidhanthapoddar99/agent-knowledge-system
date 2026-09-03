---
title: "Review round"
status: open
agent: claude-fable-5-1
---

# Goal

One independent reviewer per builder output; the cli reviewer runs the code; a rule test on the issues skill

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)
- `010_build-round.md`

# Expected Outcome

Findings — each with `file:line`, the failure scenario, and whether it was reproduced.

# Outcome

> [!NOTE]
> What actually came back — filled when the round lands. `status` above says
> whether the agent FINISHED; this says what it found. An audit that finished
> and found two real defects is `done`, not `dropped`.
