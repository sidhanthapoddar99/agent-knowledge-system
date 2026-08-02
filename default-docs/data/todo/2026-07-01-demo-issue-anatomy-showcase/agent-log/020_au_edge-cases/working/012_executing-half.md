---
title: "Executing half"
status: done
agent: sol
---

# Goal
Run the parser against the fixture and confirm or refute what the reading half suspected.

# Inputs
- `working/011_reading-half.md`

# Expected Outcome
Findings — each with `file:line`, the failure scenario, and whether it was reproduced.

# Outcome
**Reproduced:** the `00-`/`00_` collision, with the fixture's own
`subtasks/03_no-prefix.md` beside a prefixed sibling.

**Refuted:** mixed widths. Sorted `01_`, `010_`, `70_`, `200_` and got
1, 10, 70, 200 — numeric, as documented.

**A pair is two files, never one.** Merging this with `011` would lose which
half reproduced what, which is the only thing that separates a finding from a
suspicion.
