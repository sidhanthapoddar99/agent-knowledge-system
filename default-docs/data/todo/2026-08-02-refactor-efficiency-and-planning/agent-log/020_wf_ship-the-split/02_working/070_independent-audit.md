---
title: "The three-reader audit"
status: done
agent: claude
---

# Goal

Subtask 130 — the last thing that happens. Put the previous version of the
`agent-ks-issues` skill and the new one side by side and ask three independent
readers which is better, none of them having seen this issue or the reasoning
behind either version.

**Store the verdicts; act on none of them.** An audit acted on immediately
becomes a fix round with no independent check of its own.

# Inputs

- `subtasks/040_execution/130_independent-skill-audit.md`
- The brief all three read verbatim — reproduced in this file's Setup below
- **Version A (old):** commit `8f0ce28`, 21 files, 2,412 lines
- **Version B (new):** commit `a3c5603`, 22 files, 2,718 lines

Reproduce the comparison in two commands:

```bash
git archive 8f0ce28 plugins/agent-ks/skills/agent-ks-issues | tar -x -C <dir>   # A
git archive a3c5603 plugins/agent-ks/skills/agent-ks-issues | tar -x -C <dir>   # B
```

# Expected Outcome

A verdict per reader: a winner on each of the four questions with its reason, the
worst passage in its own winner, and anything it could not follow. **A reader
that says "both are fine" has not answered.**

# Outcome

Three readers, one brief, no sight of each other. Verdicts stored verbatim as
producer files beside this one — [`071`](./071_verdict-opus.md) ·
[`072`](./072_verdict-sonnet.md) · [`073`](./073_verdict-sol.md) — because each is
a substantial output that has to live somewhere, and re-typing them here would be
the duplication this whole issue exists to remove.

**Merged as a union, not a vote.** If one reader finds a real incoherence, that
finding stands regardless of what the other two said.

## What they concluded

| Reader | Q1 reads | Q2 coherent | Q3 structured | Q4 follow | Overall |
|---|---|---|---|---|---|
| 1 — Opus | B | B | B | B | **B** |
| 2 — Sonnet | B | **A** | B | **A** | **A** |
| 3 — sol | B | B | B | B | **B** |

**Unanimous on readability and structure**, and all three named the same cause:
the `Holds / Does not hold` table at the top of every section page. That was the
rewrite's central bet and it is the one thing no reader argued with.

**The split is one disagreement, not two.** Sonnet flipped Q2 and Q4 on a single
ground — the worked examples were never migrated, so following the new skill can
mean copying a pattern it forbids elsewhere. Opus found the same defect and
ranked it fourth; sol found a third instance. **It is the most corroborated
finding in the audit and it is the one that cost the new version its clean
sweep.**

## Verification — what I checked before recording it

A merged record that repeats a false claim as fact is a bad record, so the
countable claims were checked mechanically against the files. **Checking whether
a claim is true is not acting on it** — nothing in the skill was changed.

| Claim | Result |
|---|---|
| `64_phase-index.md:31` still says "Numbering encodes sequence" | **confirmed**, verbatim |
| `03_…vocabulary.md:57` heading says "Three", list has four | **confirmed** |
| `24_agent-logs.md` numbers one artifact `060_` at `:420` and `061_` at `:83` | **confirmed** |
| `24_agent-logs.md:395` uses `plans/020_…` against the `NN_` spec | **confirmed** |
| The `--issue <id>` CLI examples do not run | **reproduced** — usage error, nothing created |
| `63_agent-loops.md:81-85` "flatly wrong" | **narrowed to an ambiguity** — see below |

**One claim came back weaker than reported.** sol filed the two-round-bugfix
passage as *flatly wrong*; in context *"any of this"* refers to the whole
apparatus just demonstrated, not to the agent log, so the passage is defensible
and only the word "two-round" collides with the rule beside it. Recorded as an
ambiguity in [`060`](../../../subtasks/070_audit-followups/060_countable-defects.md)
rather than a contradiction — an overstated severity gets fixed at the wrong
altitude.

**One claim came back stronger.** Opus reported the `--issue` grammar as a style
inconsistency. It is not: **nine examples across four files, and every one of
them errors.** They are the commands that scaffold the structure this issue
introduced, so the first thing anyone does with the new skill is the thing that
does not work. It fails loudly and writes nothing, which is the only reason it is
a documentation defect rather than a data one.

## What no reader attacked

Named clean areas are signal; silence is not. **Nobody argued the responsibility
split itself was wrong** — not the seven one-word purposes, not "no file stores a
fact another file owns", not moving order out of `agent-memory/` into `plans/`.
sol called the ownership model *"substantially easier to navigate and operate"*;
Sonnet, which preferred the **old** version overall, still called the new
architecture *"genuinely better factored"* and listed the missing plans section
as a capability the old skill lacks.

**Every finding is an execution defect, not a design defect.** That is why none
of them is a not-ready, and why the follow-ups are edits rather than a re-scope.

## Stored, not acted on

Seven follow-up subtasks written at
[`subtasks/070_audit-followups/`](../../../subtasks/070_audit-followups/00_overview.md),
all at `open`. **Nothing in the skill was changed in response**, which is the
condition subtask 130 sets for being done.

The two that make the skill actively wrong to follow —
[the unmigrated examples](../../../subtasks/070_audit-followups/010_migrate-the-worked-examples.md)
and [the CLI examples](../../../subtasks/070_audit-followups/050_cli-examples-do-not-run.md)
— are both mechanical. The one worth thinking about is
[what a stage's `status` means](../../../subtasks/070_audit-followups/040_stage-status-semantics.md),
which is a real gap rather than a contradiction: the resolving distinction exists
in the user-guide page and never made it into the skill.

**That last one is the audit paying for itself.** Anyone who had read the design
notes would have supplied the missing distinction from memory and never noticed
it was absent. A reader with no context could not — which is the whole reason the
audit was run without one.

## Setup notes worth keeping

**The mix is deliberate:** two model families, two tiers, so a shared blind spot
is less likely than with three of the same.

**The first sol launch failed on a path, not on the work.** `--cwd` pointed at a
scratch directory outside the trusted root in `~/.codex/config.toml`, so the job
resolved to `/home/sid/.claude`, found nothing, and returned in 27 seconds.
Relaunched **`--fresh`** from inside `/home/sid/projects` — never resumed, since
a thread carries its own sandbox state and resuming would have inherited the
wrong one.
