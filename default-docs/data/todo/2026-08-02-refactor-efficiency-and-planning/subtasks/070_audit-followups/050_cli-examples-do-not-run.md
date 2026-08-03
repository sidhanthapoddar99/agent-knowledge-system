---
title: "Every new CLI example is a command that errors"
status: review
---

# Overview

The four commands this issue added — `new-plan`, `new-stage`, `new-agent-log`,
`new-iteration` — take the issue id **positionally**. Every example of them in
the new skill passes it as `--issue <id>`, which is not a flag any of them
accepts.

**Reproduced, not inferred.** Running the exact line from `SKILL.md:209` prints
the usage text and creates nothing; the positional form creates the plan.

```bash
# what SKILL.md:209 tells an agent to type — errors, creates nothing
bun new-plan.mjs --issue 2026-08-03-cli-smoke --name audit-followup
  Usage: agent-ks issue new-plan <issue-id> --name <slug> …

# what works
bun new-plan.mjs 2026-08-03-cli-smoke --name audit-followup
  Created …/plans/01_audit-followup/ — settings.json overview.md
```

**Done when** every command example in the skill runs as written.

# References

- [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md)
  — reported it under *flatly wrong*, as an inconsistency between the old
  positional grammar and the new commands
- The commands themselves: `plugins/agent-ks/skills/agent-ks-docs/scripts/issues/`

# Todo list

- [x] `SKILL.md:209-210` — `new-plan`, `new-stage`
- [x] `24_agent-logs.md:453,463,464` — `new-agent-log`, `new-iteration` ×2
- [x] `28_plans.md:168-170` — `new-plan`, `new-stage` ×2
- [x] `63_agent-loops.md:47,51` — `new-agent-log`, `new-iteration`
- [x] Grep the whole skill for `--issue` afterwards; the list above is what one
      pass found
- [x] Decide the opposite way if preferred — **add** `--issue` as an alias in the
      four scripts and leave the docs alone. Either fixes it; only one is a doc
      change

# Outcomes and Next Steps

**Already fixed — closed on evidence 2026-08-03**, not by doing the work again.
[The round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).

The nine examples were corrected by the skill-consistency sweep that ran after
this subtask was written, so the todo list above was stale before anyone picked
it up. Verified rather than assumed:

```bash
$ grep -rn -- "--issue" plugins/agent-ks/skills/
agent-ks-issues/references/40_operations/41_searching.md:54:
  **Every scaffolder takes the issue id positionally**, not as `--issue`
```

**One hit in the whole skills tree, and it is the sentence forbidding the form.**
Zero remaining examples use it.

The positional grammar was also exercised end to end this session — subtask
[`130`](../130_skill-links-checks-the-wrong-tree.md) was scaffolded with
`agent-ks issue new-subtask <issue-id> --name <slug>` and created correctly. All
four scaffolders answer `--help` with a usage line naming `<issue-id>`
positionally.

**The decision offered in the last todo — add `--issue` as an alias instead —
was not taken, and deliberately.** Two spellings for one argument is a second
thing to keep in sync, which is the defect class this entire issue is about. One
grammar, documented once.

**The structural suggestion in Details stands and is NOT done:** nothing yet
extracts ` ```bash ` lines and asserts the subcommand and flags exist. That gate
would have caught all nine for free, and it would have caught the
[wrong-tree defect](../130_skill-links-checks-the-wrong-tree.md) found the same
day. Worth opening when someone picks up the checker work.

# Details

## Severity, and the one thing that keeps it from being worse

**Nine examples across four files, and every one of them fails.** These are the
commands an agent runs to scaffold the structure this whole issue introduced, so
the first thing anyone does with the new skill is the thing that does not work.

It **fails loudly** — a usage line, exit before any write, nothing created. That
is the safe direction and it matters: an agent gets an immediate, self-correcting
error rather than a plausible wrong result. Had `--issue` been silently ignored
in favour of a default, this would be a data defect instead of a documentation
one.

## How it got past everything

The commands were built and smoke-tested by calling the scripts directly with
their real positional grammar; the docs were written from the design, where
`--issue` reads more naturally beside `--plan` and `--log`. **Both halves were
checked, neither was checked against the other**, and no gate compares a code
fence to a binary.

That is the actual lesson and it generalises past this subtask: `./start build`
and `agent-ks check issues` both pass on a skill full of commands that do not
run, because nothing executes a documented command line.

## Worth considering: make the gate catch it

A check that extracts every ` ```bash ` line beginning `agent-ks ` and asserts
the subcommand and its flags exist would have caught all nine, and would catch
the next drift for free. Cheaper than re-reading the docs each release, and it is
the structural fix rather than the one-time one.

Out of scope for this subtask as written — noted here so the option is on the
record rather than rediscovered.

## A second gate defect, found the same way

**Not an audit finding** — this one surfaced running the closing gate, and it is
recorded here because it is the same class and the same fix area.

`check-skill-links.mjs` **does not skip fenced code blocks.** Pointed at the
issues skill it reports four broken links, all four inside one ` ```yaml ` fence
in `28_plans.md:64-84` that shows an example stage file:

```
✗ references/20_sections/28_plans.md:71: broken link → ../../subtasks/16_slide-type/80_mandatory-catalog.md
```

Those are illustrative paths in a code sample. They are not links, they do not
render as links, and they cannot resolve by design — the example describes an
issue that does not exist.

**The consequence is the one that matters.** A checker that reports four
permanent errors on a correct file is a checker people learn to run with "expect
four" — and a gate that has to be read past stops being read at all. It is the
same reasoning that removed the deliberate broken-ref fixture from this issue's
own test data earlier in the run: a gate whose clean state is not zero is not a
gate.

### Fixed 2026-08-03 — this half only

The extractor now tracks fenced-block state and skips lines inside one. A fence
opens on 3+ backticks or tildes and closes only on the **same character at
equal-or-greater length**, so a ```` block containing ``` lines does not close
early.

**Why this half was taken now rather than waiting with the rest of this
subtask.** Writing the worked examples for the summary-shape round added four
more illustrative links inside fences, taking the checker from 4 false errors to
8 — so the same session that would have left it alone made it materially worse.
Cleaning up after that is not a scheduling decision.

**Control-tested, because a checker that stops reporting is indistinguishable
from a checker that has nothing to report.** A fixture with two genuinely broken
links outside fences, three illustrative ones inside, and a four-backtick block
wrapping a three-backtick block: it reported exactly the two real ones. All three
skills now pass at zero.

**Written while the nine CLI examples were still untouched.** They were fixed by
the skill-consistency sweep shortly afterwards and verified clean on 2026-08-03
— see Outcomes above. Left in place rather than edited: it dates the fenced-block
fix correctly relative to the rest.
