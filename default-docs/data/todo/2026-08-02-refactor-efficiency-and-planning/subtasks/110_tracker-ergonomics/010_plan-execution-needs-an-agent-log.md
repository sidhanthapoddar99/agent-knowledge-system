---
title: "Executing a plan opened no agent log — the rule covered it and did not fire"
status: done
---

# Overview

**A four-stage plan was executed end to end and no agent log was opened.** Sid
caught it afterwards: *"this was a plan execution and had multiple steps, an
agent log was warranted even if I did not explicitly say."*

The rule already covered it. `24_agent-logs.md` said:

> *"An agent log opens when work is delegated, or when it runs over multiple
> rounds."*

Four stages is multiple rounds. It still did not fire, because **"executing a
plan" does not read as "multiple rounds" in the moment** — the plan already has
stages, each stage already has a record, and the work feels covered.

**Done when** the rule names plan execution explicitly, in the skill and in the
bundled guide, and the missing log for that run exists.

# References

- The run that skipped it:
  [`040_wf_fix-the-tools-then-the-links`](../../agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md)
- The plan it executed:
  [`01_fix-the-tools-then-the-links`](../../plans/01_fix-the-tools-then-the-links/overview.md)
- The rule: `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md`
- Its bundled twin: `astro-doc-code/src/layouts/issues/default/guide.ts`

# Todo list

- [x] Add the explicit case to `24_agent-logs.md` — plan execution is always
      multiple rounds, and the log opens **before the first stage**
- [x] Mirror the one-liner into `agent-ks-issues/SKILL.md` and `guide.ts`, which
      both carry the short form of the same rule
- [x] Open the log that was missing, and write it from the commits

# Outcomes and Next Steps

**Fixed 2026-08-03, in three files, one line each plus a short paragraph of
reasoning in the reference.**

The wording now says *"and executing a plan is always multiple rounds. Open the
log before the first stage, not after the last."* The "before, not after" half
matters as much as the rest: a log written afterwards from commit messages is a
reconstruction, and it cannot contain the thing an agent log is for — what was
tried and abandoned, and what the gates said at the time.

# Details

## Why this is worth a line rather than a shrug

It is the same defect this whole issue has been chasing, one layer up: **a rule
that is technically correct and does not fire.** Compare:

| Rule | Technically covered | Did not fire because |
|---|---|---|
| *"or the resolved URL — also works"* | the absolute form was documented as allowed | the consequence was 44 lines away |
| *"delegated, or multiple rounds"* | four stages is multiple rounds | "executing a plan" does not read as "rounds" |

Neither was wrong. Both were **unenforced and easy to read past**, which is the
same failure mode as a required rule written as a preference.

## What a stage record cannot do

A plan stage records the outcome of a step. The agent log records the **run** —
in order, including the parts that are not outcomes:

- that the renderer fix introduced an asset-link regression, which was found and
  fixed mid-run;
- that the cross-section exception was checked and turned out not to exist,
  which changed the shape of the work;
- what each gate said at each step, so a later reader can tell a measured claim
  from a remembered one.

None of that has a home in a stage file, and none of it survives in a commit
message someone has to go looking for.
