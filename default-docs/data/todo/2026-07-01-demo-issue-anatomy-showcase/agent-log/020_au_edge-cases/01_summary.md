---
title: "Summary"
---

# State

> [!NOTE]
> **Closed.** One real defect confirmed by both halves of the pair; one claim
> withdrawn after the executing half failed to reproduce it. Nothing was fixed
> here — the fix belongs to
> [the subtask it became](../../subtasks/04_verify/20_depth-guard.md).

# Goal

Audit the section reader for the edge cases this fixture deliberately carries —
files with no prefix, mixed prefix widths, and nesting right at the loader's cap.

**Trigger:** ad-hoc, and that is the point. No subtask covers it; the reason an
audit was started is exactly the thing no subtask holds, so it lives here.

# Todo

Scope: prefix parsing and depth handling in the section reader. Not a file list —
a concern, so neither half could skim one file and call it done.

- [x] [The reading half](./02_working/011_reading-half.md) — read the parser and the
      depth guard, and named two suspect paths without running anything
- [x] [The executing half](./02_working/012_executing-half.md) — built inputs for
      both, reproduced one and refuted the other
- [x] [Merge as a union](./02_working/010_findings.md) — the iteration file, with
      the verdict per finding

# Out of Scope

Rendering. This audit reads the loader, not the sidebar. A finding about how the
tree *looks* would have belonged to a different run.

# Outcome

**One confirmed defect, one refutation, and the refutation matters as much.** A
folder nested one past the cap was dropped with no warning anywhere a reader
would see — reproduced by the executing half with a built fixture, and now
carried by
[the depth-guard subtask](../../subtasks/04_verify/20_depth-guard.md). The
mixed-width prefix claim looked right on reading and did not survive contact with
an actual input; it is recorded as withdrawn in
[the merged verdict](./02_working/010_findings.md) rather than deleted, so the next
reader does not raise it again.

**Findings merge as a union, never a vote.** One half reproducing a crash is not
outvoted by the other half finding nothing — which is why a pair is two files and
never one. Merging them would have lost which half found what.

What leaves this audit is in [the handover](./03_debrief/01_handover.md).
