---
title: "Brainstorm: how to cut the recording overhead"
status: in-progress
---

# Overview

Turn the audit's root-cause list into a small set of rules an agent can follow
mid-run. Output is a **written rule set**, argued in `brainstorm/` and graduated
to `notes/`, which [Skill: the proportionality rules](./040_execution/040_skill-efficiency-rules.md) then
implements.

The hard part is not knowing we write too much. It is finding a rule that
**bites without being a word budget** — a length target makes agents write
jargon, which is worse than writing too much.

# References

- The measurements: [the recording-overhead audit](../notes/10_efficiency-audit-2026-08-02.md)
- Runs in parallel with [Brainstorm: the plans section](./030_brainstorm-plans-section.md); both gate the
  execution group
- Feeds: `040_execution/040_skill-efficiency-rules`,
  `040_execution/020_update-global-claude-md`

# Todo list

- [ ] Open a `brainstorm/` thread per candidate lever (table below), argued
      rather than asserted
- [ ] Decide the **proportionality rule** — what size input, measured how
- [ ] Decide the **one-canonical-home rule** — where each kind of fact belongs,
      and what the other files write instead of a retelling
- [ ] Decide what happens to the **six standard slots** — kept, trimmed, or made
      conditional
- [ ] Decide the **brief policy** — what replaces the committed verbatim prompt
- [ ] Decide whether anything ever gets **compacted or superseded**, and by whom
- [ ] Back-test each rule against the audited run: would it have cut 1,928 lines
      to ~120 *without losing the defect that audit found?*
- [ ] Graduate the resolved thread into `notes/` as the rule set

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion: the agreed rule set, the levers
> rejected and why, and the link to the graduated note.

# Details

## Candidate levers — starting positions to attack, not decisions

| Lever | The idea | The obvious objection |
|---|---|---|
| **Proportionality clause** | Every structural mandate gains "…scaled to the size of the change". Small/mechanical work gets one file. | What is "size"? Lines changed is gameable, and wrong for a one-line invariant fix on a frozen surface. |
| **Link, don't retell** | A fact gets one home; every other file writes one line plus a link. | Links rot under `move`, and a reader following six links may be worse off than one reading a self-contained summary. |
| **Conditional slots** | The six slots become *available*, not *mandatory*, with a stub form that reads as deliberately empty. | The stub exists because a missing slot is invisible. Need a form that says "nothing here, on purpose". |
| **Brief as pointer** | Agent briefs stop being committed verbatim; the agent log records why the run was commissioned and what it was to return. | Re-issuing a fix round currently reuses the brief file. Losing it costs a rewrite. |
| **Report by risk, not by area** | Audit reports drop "areas checked and found clean" as prose — findings only, plus a one-line coverage statement. | "A named clean area is signal; silence is not" exists for a reason: it distinguishes *checked* from *never reached*. |
| **Supersession** | Corrections replace rather than accumulate; superseded wording lives in git. | The never-delete rule exists because a decision whose reasoning is lost gets re-litigated. |

## Two constraints any answer must satisfy

1. **It must not reduce verification.** The audited run's audit found a real
   defect that had survived 3,834 tests. A rule that would have skipped that
   audit is wrong regardless of what it saves.
2. **It must not be a length target.** Brevity as a goal produces jargon. The
   target is **fewer copies**, not shorter prose.

## Shape of the deliverable

One note: per rule, the rule itself, one sentence of why, and the concrete
before/after from the audited run. **A rule with no worked example will not
survive contact with a live session** — that is precisely how the current
"detailed, line-rich records" instruction became a licence for essays.
