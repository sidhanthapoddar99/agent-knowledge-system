---
title: "Three reads and sids taste"
status: done
agent: claude
---

# Goal

Establish **why** the global operating file produces miscalibrated behaviour —
too little doubt in one place, far too much everywhere else — before proposing
any rewrite of it. Three independent reviews on three different lenses, plus the
one input no reviewer can supply: Sid's own taste.

# Inputs

- `~/.claude/CLAUDE.md` — the target. **Measured at 3,580 words**, not the
  ~10,000 asserted at the start of this run. That estimate was stated as fact
  without being checked, and it changed a decision: Sid picked a cut target
  against the wrong baseline and had to be re-asked. It is the same error class
  the run exists to fix, committed while fixing it.
- [The run brief](../01_summary.md) — the two measured failures that triggered
  this.
- The reverted link rewrite:
  [`190`](../../020_wf_ship-the-split/02_working/190_the-link-rewrite-was-wrong.md).

# Expected Outcome

A merged, evidence-backed statement of the defect and a size target that can be
defended with numbers — not a rewrite. The rewrite is the next round.

# Outcome

**All three reviews independently converged on the same root cause, and it is
not verbosity.** Verbosity is the symptom.

## The defect, stated once

**The rules are unconditional.** Each says what to do and never when it stops
applying. An unconditional rule cannot be over-applied *by mistake* — it can only
be over-applied *correctly*, which is why the behaviour looked like obedience.

Codex made this measurable rather than arguable: it was asked to find rules that
are unconditional but only sometimes right, with the test being *can you build a
realistic input where obeying it is clearly wrong*. **It produced roughly 55.**
A sample, each with the input that breaks it:

| Rule as written | Input where obeying it is wrong |
|---|---|
| *"Erring long is cheap"* | "does this one field disagree with this one file?" — the long answer buries the one-line one |
| *"Explain in plain terms — always"* | a request for a filename, an exit code, or an exact command |
| *"Say how sure you are"* | every deterministic fact gains a confidence label, which is noise |
| *"Read the existing log before starting work"* | reporting one visible status field, against a log of hundreds of rounds |
| *"An agent log opens when work is DELEGATED"* | a delegated ten-second read-only check |
| *"Never below `high`"* (Codex effort) | a mechanical lookup that costs more reasoning than the task |
| *"Do it whenever a suite claims to cover something"* (mutation testing) | a routine status question against a slow destructive suite |
| *"Large information goes in a table"* | a stack trace, a diff, or a chronological narrative |

## Eight places the file contradicts itself

Codex's conflict pass. In each, it also named which side an agent would actually
follow — always the narrower or later-stated one, never the more important one:

| One rule | The other | Which wins as written |
|---|---|---|
| *"A project file links to a rule here — it never copies it"* | *"Put this rule in any brief that drives it"* | the copy instruction — it is narrower and imperative |
| *"The prompt is three lines: read this, do it, report"* | *"inline the exact shape in the prompt"* | the schema rule — later, and it explains a failure mode |
| *"Never cancel or kill a running job. Absolute."* | *"stop the others rather than let them finish reviewing code about to be deleted"* | "Absolute" — so doomed reviewers keep running |
| *"you read the diff, run the gates, merge the findings, commit"* | *"Do not commit unless this project's instructions grant it"* | the git rule — it supplies a condition |
| *"An agent log opens when work is DELEGATED — and nothing else opens one"* | *"A one-line fix earns a line, not a folder"* | the log trigger — a delegated one-line fix gets a folder |
| *Build → Review → Decide → Fix → Measure* | *"review only what you cannot verify yourself"* | the narrower one, making a "mandatory" pipeline stage optional |
| *"Does it look right… Mine — you cannot see"* | *"Ask for artefacts, not impressions"* | the artefact rule — but subjective acceptance cannot come from an artefact |

## The duplication, counted

Eleven ideas are stated in two or more sections. The four heaviest:

| Idea | Sections | Approx words |
|---|---|---|
| Runtime/performance claims need measurement, not inference | 3 | 360 |
| The primary takes design decisions, not the agent and not Sid | 3 | 254 |
| Durable facts go in the tracker, not the transcript | 5 | 250 |
| Records scale to the change, not the ceremony | 2 | 244 |

## Where the words actually are

Codex's per-section counts, classified. **Procedure — how to run a tool — is
1,701 of 3,580 words, 48% of the file**, and it is loaded into every session
including the ones that touch neither the tracker nor Codex.

| Section | Words | Kind |
|---|---:|---|
| Agent KS | 493 | procedure |
| What makes the loop work | 419 | judgement |
| Reply style | 416 | judgement |
| Codex Companion | 410 | procedure |
| Agents and background work | 335 | procedure |
| Breaking code to test the tests | 328 | procedure |
| What only I can answer | 323 | judgement |
| Deciding without me | 254 | judgement |
| Orchestration (intro) | 218 | judgement |
| Git | 135 | procedure |
| What to look for first | 130 | judgement |
| Preamble · Language | 119 | judgement |

## The file breaks its own rule

Sonnet's finding, and it is the cleanest argument for the whole compaction. The
file says:

> *"The skills own the detail — never copy their content into a repo. They ship
> versioned with the plugin, so a local copy goes stale silently."*

Two paragraphs later it copies, near sentence-for-sentence, from
`agent-ks-issues/SKILL.md`: the `input-needed` versus `blocked` distinction, and
the `agent-memory/` split into `knowledge/` and `history/` with its precedence
rule. **`CLAUDE.md` is not versioned with the plugin**, so when the skill's
wording moves, this copy goes stale silently — exactly the failure the rule was
written to prevent. The rule is right; the file does not obey it.

## The mechanism nobody had named

Fable's verdict, which is the most useful sentence produced by any of the three:

> *"The register teaches louder than the content. An agent reading thousands of
> words of dense, hedged, aphoristic prose learns to PRODUCE dense, hedged,
> thorough output, because that is what the file demonstrates on every line —
> even as several of its rules ask for the opposite."*

And its conclusion: *"it states conclusions where it needed to demonstrate
calibration — and calibration cannot be stated, only shown."*

**Consequence for the rewrite: the file must be written in the voice it wants
back.** A short, plain, example-led file does not merely *describe* the target
behaviour, it *is* an instance of it. This is the second reason "3 examples beat
10 instructions" — the examples carry the judgement and the register at once.

## The best operational line in any of the three

Also Fable, on the link failure:

> *"Check it at a cost proportional to the blast radius — here, one HTTP request
> before 341 edits."*

That is the verification rule, in a form that needs no interpretation. It
answers Sid's framing directly: **doubt is a budget, and the allocation key is
blast radius, not confidence.** A cheap check before an expensive irreversible
action; no check at all before a reversible one.

## What the reviews do NOT support

**Examples cannot replace everything, and Fable argued the limit itself.**
Absolute prohibitions have no other side, so a contrastive pair cannot teach
them — and worse, an example invites pattern-matching (*"that specific case was
banned"*) where the ban is total. These stay as flat imperatives:

- `done` / `dropped` are Sid's alone; agents never run git write commands; never
  rewrite pushed history; no squash merges.
- The safety floor on what stops an autonomous run — a safety rule must be
  stated exhaustively, because the dangerous case is precisely the one that does
  *not* resemble the example.
- Machine facts with no judgement in them — `ls` is aliased and corrupts paths,
  job state is scoped to its launch directory.

**And a risk none of the three raised:** cutting to ~2,000 words leaves genuinely
novel situations under-specified. The precedence scheme is what makes the
compaction safe — when no rule and no example covers the case, an ordering still
decides it. Precedence is load-bearing here, not a tidy-up.

# Sid's taste, asked rather than inferred

Seven decisions taken directly, so the rewrite is not guessing:

| Question | His answer |
|---|---|
| Default when unsure whether to verify | **Read it, then label it** — `measured` / `read` / `assumed`, and let him call for the check |
| Reply shape | Answer first, then detail — **sized to what the thing deserves**, not a fixed shape |
| Size target | **~2,000 words** (from 3,580) — chosen against the corrected baseline |
| Tie-break between conflicting rules | **The cheaper mistake wins** — prefer the action easier to reverse in one message |
| Rules bare, or with the reason | **Reason attached, one line.** A rule he understands, he can apply to a case not foreseen |
| Where moved-out procedure lives | **Reference files beside `CLAUDE.md`**, and the folder goes in `~/.claude/.gitignore` |
| What the examples are built from | **His real incidents** — the link misdiagnosis, the one-line answer delivered as a report |

## Two things only he could have supplied

**Coloured status marks.** When output is a *group* of things rather than a
single answer, mark each so they are distinguishable at a glance. Not on single
answers, where it is noise.

**Re-anchor on a context switch.** This one no reviewer could have found, because
it is not a property of the file — it is a property of the reader. Saying
`00_overview.md` after switching topic from the migration is meaningless to him:
he is not carrying the agent's context, and a bare filename assumes he is. The
correct form names the path —
`subtasks/040_execution/00_overview.md`. **Brevity that drops the anchor is not
brevity, it is a broken reference.** This had been filed as verbosity to cut,
and it is the opposite.

## Convergence

The three lenses were chosen to not overlap, and they still agreed on the
target size independently:

| Source | Proposed cut | Lands at |
|---|---|---|
| Codex — 1,701 words are procedure; keep triggers and pointers | ~45% | ~1,970 |
| Sonnet — per-section budget | ~62% | ~1,350 |
| Sid | — | **~2,000** |

Codex and Sid agree almost exactly. Sonnet's lower figure comes from also
deleting the tracker rules duplicated in the skill; that deletion is adopted, and
the difference is spent on the worked examples, which are new words the reviewers
were not budgeting for.

**Merged as a union, not a vote.** Every finding above was raised by one reviewer
and is kept on that basis; none was put to a majority.
