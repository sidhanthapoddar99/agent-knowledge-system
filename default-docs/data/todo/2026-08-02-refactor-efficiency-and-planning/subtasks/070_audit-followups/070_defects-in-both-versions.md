---
title: "Defects present in BOTH versions — not regressions"
status: review
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

- [x] **`10_writing.md:14-24`** — says `title` is required on every markdown file
      and that builds fail without it, then exempts comments; both notes pages
      then call `title` optional when adding a note. At least one of the three is
      false — find out which by testing a build, not by reading
- [x] **`43_moving-restructuring.md`** — states flatly that `agent-log/` is
      append-only, while each version's own agent-log document names a section
      that is rewritten in place (old: `02_task_list.md`; new: `# State` in
      `01_summary.md`)
- [ ] ~~Confirm both really are unchanged between the two versions before
      acting~~ — **moot, and deliberately left unticked.** It existed to decide
      whether this issue *caused* the two defects; both are now fixed on their
      merits, so provenance changes nothing. A box ticked for work never run is
      how a record starts lying

# Outcomes and Next Steps

**Both fixed 2026-08-03** — [the round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).

This subtask was heading for `dropped` as "pre-existing, not ours". Both items
turned out to be a few minutes' work once measured, so they were done instead.

## The `title` claim is FALSE, and the build says so

Settled the way Details demanded — by running it, not reading it. A note with
frontmatter but no `title` was written into the demo fixture and `./start build`
run against it:

| Result | |
|---|---|
| Build | **succeeded** — no error, no warning naming the file |
| Page | **built** at `…/notes/_titleless-probe/` |
| Title | fell back to the slug: `<title>_titleless-probe · Demo: issue anatomy showcase (fixture) | Agent KS</title>` |

So *"Astro builds fail without it"* is simply wrong, and it was wrong in both
versions. The notes pages calling `title` optional were the accurate ones.

Corrected in the two places that asserted it — `SKILL.md:403` and
`10_writing.md:14` — to say what actually happens: **nothing enforces `title`.**
A missing one is not caught by any gate; it is caught by someone noticing an ugly
heading later. The probe was removed after measuring.

This matters more than a wording fix, because the false claim was doing real
work: an agent that believes the build enforces `title` has no reason to check
its own output, and the failure is silent and permanent.

## Append-only now names its exception, in both files a reader would consult

`43_moving-restructuring.md:56` and `42_updating.md:129` both stated
append-only absolutely. Both now carry the exception: **`# State` in a run's
`01_summary.md` is rewritten in place by design** — that is what makes it the
run's current position rather than a diary entry — and everything else is
appended, with a closed iteration never re-narrated.

Which is exactly the resolution Details argued for: append-only with one named,
documented exception is a fine rule; the defect was the rule stated absolutely in
one file and contradicted in another.

**The third todo — confirming both were genuinely unchanged between versions —
was not run, and did not need to be.** It existed to decide whether this issue
caused them. Both are now fixed on their merits, so the provenance question is
moot.

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
