---
title: "Update ~/.claude/CLAUDE.md"
status: open
---

# Overview

The global operating rules carry three of the six root causes the audit found.
They are outside every repo, so they cannot be fixed by a plugin release — this
subtask is a deliberate, reviewed edit to the user's own global instructions.

**Done when** the proportionality rule, the brief policy, and the audit-report
schema are updated, and each change names the audit finding it answers.

# References

- Root causes: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md) — "Root cause" table
- Rules decided by: [Brainstorm: cutting the recording overhead](../020_brainstorm-efficiency-remedies.md) — **gate**
- Must stay consistent with: `030_skill-plans-section`, `040_skill-efficiency-rules`

# Todo list

- [ ] Add the proportionality rule to the orchestration loop section
- [ ] Revise *"Instructions as files, prompts as pointers"* per the agreed brief
      policy
- [ ] Revise the audit-report expectations — findings-first, coverage as a line
      not an essay
- [ ] Re-point the agent-memory/plans references at the new plans section
- [ ] Re-read the whole file for rules that now contradict each other
- [ ] Confirm with Sid before writing — this is his personal global file

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## The three rules that need changing, and why

**1. "Instructions as files, prompts as pointers."** Written to stop detail being
retyped across re-issues — a good reason. The cost measured: **160 committed
agent-brief files**, 2,037 lines in a single day, that nobody reads afterwards.
The replacement should keep the re-issue benefit (a brief that a fix round can
point at again) while ending the practice of committing the prompt verbatim as
the run's record.

**2. The audit-report expectations.** "Per finding: severity, `file:line`, the
failure scenario, whether it was reproduced… also name the areas checked and
found clean." Report length therefore scales with **area examined** rather than
**risk found** — this is why audit reports are 46.7% of all writing. The
"named clean area is signal" principle is sound and must survive; the question is
whether it needs prose or a line.

**3. Nothing scales to change size.** The loop's sizing table has a
"small / mechanical / one-site → battery alone" row, but the surrounding rows
("terminal, invariant-touching, or a frozen surface → 2 pairs") match nearly
everything on a mature project, so the small row almost never fires. The
proportionality rule has to be stated where it cannot be routed around.

## Scope discipline

**This file is Sid's.** Propose the diff, explain each change against the finding
it answers, and get explicit sign-off before writing. It governs every project on
the workstation, not just this one — a change that helps here and hurts elsewhere
is a net loss, and only Sid can see the other projects.

Do **not** copy the new rules into any project's `CLAUDE.md` or `memory/`.
Project files link upstream; that precedence rule is what keeps a fixed rule from
going stale in five places at once.
