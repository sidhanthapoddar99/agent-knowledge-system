---
title: "Brainstorm: how to cut the recording overhead"
status: done
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

- [x] Open a `brainstorm/` thread per candidate lever → five threads, sliced by
      subject rather than by lever
- [x] Decide the **proportionality rule** — **structural, not measured**: an
      agent log opens only when work is delegated or runs over multiple rounds;
      small changes are grouped against a larger block
- [x] Decide the **one-canonical-home rule** → *no file stores a fact another
      file owns*, plus the seven one-word section purposes
- [x] Decide what happens to the **six standard slots** → removed; three slots
      instead. **Renamed 2026-08-03** to `01_summary.md` + `02_working/` +
      `03_debrief/` — the count and the purposes are unchanged, only the
      filenames ([the numbering spec](../notes/80_agent-log-numbering-spec.md))
- [x] Decide the **brief policy** → `01_summary.md` **is** the brief
- [x] Decide whether anything ever gets **compacted or superseded** →
      superseded wording is **deleted**, and non-contributing content is deleted
- [x] Graduate the resolved threads into `notes/` as the rule set
- [x] **Back-test against the audited run** — **not run, by Sid's call.**
      Replaced by [`130`](./040_execution/130_independent-skill-audit.md): three
      neutral auditors compare the old and new skill at the end of the work, and
      the result is stored rather than acted on

# Outcomes and Next Steps

**The rule set:**
[What each section is for](../notes/60_section-responsibilities.md) — the
responsibility split, which is what the brainstorm converged on instead of the
density rules this subtask originally scoped.

**The reframe, and it is the finding worth keeping.** This was scoped as *how do
we get agents to write less*. It is not a density problem. **Every section is
currently permitted to hold everything, so every section holds everything** — the
same fact written eight to twelve times because no file was ever told it was not
that fact's home. Volume is the symptom. Give each section one purpose and the
duplication has nowhere to go.

That reframe is why the answer is enforceable: a responsibility split lives in
templates, scaffolders and a validator, whereas a density rule lives only in an
agent's memory of an instruction it read at session start.

**Levers rejected:**

| Rejected | Why |
|---|---|
| A measured size input (lines changed) | Gameable, and wrong for a one-line fix to a frozen invariant. Replaced by a structural trigger: delegated or multi-round work opens a log, nothing else does |
| A word or line budget | Produces jargon. The target is fewer copies, never shorter prose |
| Shorter audit reports | Sid does not read them; depth below the summary is the agent's business. The rule became *conclusive in themselves, plus a simplified table in `01_summary.md`* |
| Dropping "areas checked and found clean" | It distinguishes *checked* from *never reached*. It becomes a table row instead of prose |

**Two rules overturned by the ruling**, both recorded in the rule set: *one
agent, one iteration file*, and *"subtasks are the what, the agent log is the
how"* — which `guide.ts` still states.

**The back-test was dropped by Sid, and replaced rather than skipped.** Instead of
re-deriving the audited run against the new rules by hand, the check moves to the
end of the work and becomes
[`130` — the independent skill audit](./040_execution/130_independent-skill-audit.md):
three neutral auditors compare the old and the new skill side by side. Better
evidence than a self-assessment, and it costs nothing until there is something to
compare.

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
