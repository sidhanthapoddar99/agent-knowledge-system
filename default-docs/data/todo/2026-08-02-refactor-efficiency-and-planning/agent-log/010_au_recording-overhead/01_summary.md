---
title: "Summary"
---

# Summary

**Yes, and by roughly an order of magnitude on the recording side.** Over 24
hours across both NeuraSutra repos, **8.8% of all lines written were code**.

Findings, evidence and the root-cause trace:
[the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md). This file is the run narrative; the
numbers have one home and it is that note.

## How the run went

Single pass, no phases. Six measurement passes with `git log --numstat` and a
diff-line classifier, each answering one question: how much was written, of what
kind, where it went, how often the same fact repeats, how often a file is
revisited, and what the worst single window looked like.

The one turn that changed the shape of the answer was isolating the **two-hour
window** rather than staying at 24-hour aggregate. At aggregate the ratio looks
bad but arguable — tests and docs are real work. At two hours the picture is
unambiguous: **five lines of production code, 147 lines of comment about them,
1,928 lines of activity log.** That is the finding everything else supports.

The second turn was checking **restatement** rather than volume. Volume alone
suggests "write less", which is the wrong fix. Counting how many files repeat a
single fact — up to 12 — points at the right one: *fewer copies, not shorter
prose.*

## What this run deliberately did NOT produce

No separate milestone file, and `03_working` / `04_benchmark` carry pointers
rather than copies of the tables. A one-pass audit whose entire output is one
findings note has one natural narrative unit, and this file is it.

Recorded as a deliberate choice, not an omission — and noted because it is
exactly the convention under revision in
[Brainstorm: cutting the recording overhead](../../subtasks/020_brainstorm-efficiency-remedies.md). Total for this activity: ~150
lines against a 1,928-line comparator.

## Status

`010_audit-efficiency-losses` is **done** — closed by Sid's instruction, not
self-certified. Everything downstream is open and gated on the two brainstorms.
