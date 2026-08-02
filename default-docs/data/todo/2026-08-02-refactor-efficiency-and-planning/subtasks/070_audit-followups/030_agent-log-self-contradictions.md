---
title: "24_agent-logs.md contradicts itself in four places"
status: open
---

# Overview

The agent-log reference is the largest file in the skill (491 lines) and the one
a reader consults most often. Two readers found four internal contradictions in
it, one of them naming a passage from which *"an agent cannot safely build the
folder tree"*.

These are not stale cross-references to other files — they are the same document
disagreeing with itself, which means no amount of reading elsewhere resolves
them.

**Done when** the four passages below agree with the rest of the file, and the
worked example matches the rule it illustrates.

# References

- [reader 3 — sol](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md)
  — the child-log passage is its *worst passage in my winner*
- [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md)
  — the numbering defect, under *flatly wrong*
- The intended shape: [the agent-log structure](../../notes/20_agent-log-structure.md)

# Todo list

- [ ] **`:69-70`** — *"A ten-stage plan gives ten child agent logs"* against
      `:378-390`, which says plan stages *"do not appear in `agent-log/` at
      all"*. Decide which is the rule and delete the other
- [ ] **`:420`** — the flagship example numbers a producer folder `060_`, where
      `:83` numbers the same artifact `061_` and `:136` reserves `0` for the
      iteration file. **Verified: both numbers are in the file.**
- [ ] **`:486`** — *"Iteration files are write-once by nature"* against `:95,97`
      (Task List ticked as work lands, Outcome Summary written at close) and
      `:182` (orchestrator writes the head, producer writes the Outcome later)
- [ ] **`:75-84`** — *"Two levels of child agent log is the working ceiling"*
      against the worked example's *"Depth stops at four"* (`:444`) and a table
      showing one level. State whether a second nested child log is legal
- [ ] Re-read the file end to end afterwards — four found by two readers is a
      floor, not a census

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — nothing done. This is a proposal.

# Details

## The one that is provably wrong rather than ambiguous

Line 136 states the numbering rule:

> First two digits = the iteration. Last digit = which file within it — `0` for
> the iteration file itself, `1`…`9` for a producer's own file.

Line 83 applies it correctly: `061_research-codecs/`, a producer's artifact
folder. Line 420, in the flagship worked example, writes the **same artifact** as
`060_research-codecs/` — a producer in the slot reserved for the iteration file,
inside an iteration that has no iteration file.

Both lines are in the tree today. This one needs no design call, only the fix.

## Why sol called `:69-70` the worst passage

> A ten-stage plan gives ten child agent logs; a loop with four named goals gives
> four; the agents running inside any of them give iteration files.

It contradicts the file twice over: `:378-390` says stages are *not* folders in
`agent-log/` (they are iteration digits), and `:118-132` says file count follows
**produced output**, not agent count. The sentence quietly reinstates
one-unit-one-folder, which is the exact rule this issue removed.

**A reader building a tree from that sentence builds the shape the rewrite
deleted.** That is the same failure as the stale worked examples
([`010`](./010_migrate-the-worked-examples.md)), one level in.

## On "write-once"

The write-once claim is defensible as *intent* — an iteration file is not
rewritten the way `01_summary.md`'s State is. But the file also instructs a
two-phase write (head before the work, Outcome after), which is by definition not
write-once. The wording needs to distinguish **written twice, at two known
moments** from **live**.
