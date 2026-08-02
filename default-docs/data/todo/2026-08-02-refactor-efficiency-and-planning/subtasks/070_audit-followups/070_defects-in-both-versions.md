---
title: "Defects present in BOTH versions — not regressions"
status: open
---

# Overview

Two findings sit in the old skill and the new one **identically**. They are not
caused by this issue and they were not introduced by the rewrite — they are
long-standing defects the audit happened to surface because it read both versions
with equal attention.

Filed separately for exactly that reason: **a pre-existing defect is a different
decision from a regression.** Mixing them would let this issue take credit for
breaking something it did not break, or take blame for it.

**Done when** each is fixed or dropped with a reason.

# References

- [reader 2 — Sonnet](../../agent-log/020_wf_ship-the-split/02_working/072_verdict-sonnet.md)
  — the append-only contradiction, flagged as *"technically wrong in both,
  identically"*
- [reader 3 — sol](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md)
  — the `title` requirement

# Todo list

- [ ] **`10_writing.md:14-24`** — says `title` is required on every markdown file
      and that builds fail without it, then exempts comments; both notes pages
      then call `title` optional when adding a note. At least one of the three is
      false — find out which by testing a build, not by reading
- [ ] **`43_moving-restructuring.md`** — states flatly that `agent-log/` is
      append-only, while each version's own agent-log document names a section
      that is rewritten in place (old: `02_task_list.md`; new: `# State` in
      `01_summary.md`)
- [ ] Confirm both really are unchanged between the two versions before acting —
      the claim is the readers', and it is the thing that puts them in this file
      rather than in [`060`](./060_countable-defects.md)

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — nothing done. This is a proposal.

# Details

## The `title` one should be settled by a build, not a discussion

The claim *"Astro builds fail without it"* is testable in about a minute: create
a note with no `title`, run `./start build`, see what happens. Whichever way it
comes out, one of the two statements in the skill is wrong and the other becomes
enforceable.

Worth doing that first — the fix depends entirely on the answer, and reading the
loader is slower and less conclusive than running it.

## Append-only is the interesting one

`agent-log/` being append-only is a real and load-bearing rule: it is what makes
the log trustworthy as a record, and it is why `agent-memory/` exists as a
separate mutable sibling. But both versions define exactly one live section
inside it — the old `02_task_list.md`, the new `# State` — so the rule as
written has always had an exception it does not name.

The new version arguably made this **more** visible rather than worse: `# State`
is explicitly documented as *"the only section rewritten during the run"*, which
is a named exception rather than a silent one. What is missing is the other half
of that sentence appearing in `43_moving-restructuring.md`, where a reader asking
"can I edit this?" actually goes.

**Append-only with one named, documented exception is a fine rule.** Append-only
stated absolutely in one file and contradicted in another is not, and that is
what both versions have.
