---
title: "Audit round"
status: open
agent: codex
---

# Goal

Run the executor followability checks.

# Inputs

- `plugins/agent-ks/skills/agent-ks-issues/SKILL.md`

# Expected Outcome

Findings — each with `file:line`, the failure scenario, and whether it was reproduced.

# Outcome

> [!NOTE]
> What actually came back — filled when the round lands. `status` above says
> whether the agent FINISHED; this says what it found. An audit that finished
> and found two real defects is `done`, not `dropped`.
