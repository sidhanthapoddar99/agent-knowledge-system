---
title: "Reader"
status: done
agent: claude
---

# Goal
Point the codec reader at the shared parser.

# Inputs
- `../../working/010_fanout.md`

# Expected Outcome
The change, and what it touched.

# Outcome
Reader swapped, fixture output unchanged.

**Depth check:** this file sits at level 3 — agent log, child agent log,
`working/`. One more level is available for a producer folder, and that is the
budget. Two levels of child log is the working ceiling, not five.
