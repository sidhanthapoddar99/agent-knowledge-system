---
title: "10 — The recording-overhead audit (measured 2026-08-02)"
---

# The recording-overhead audit

**Subject:** the `neurasutra-docs` + `neurasutra-canvas` pair, a mature consumer
of this framework running the paired-audit orchestration loop.
**Method:** `git log --numstat` over a 24-hour window, plus diff parsing to
classify every added `.ts` line as comment, blank, or code. Nothing estimated —
every figure below is counted.

**Why this project is the right subject:** it is the heaviest, most
rule-dense consumer we have. Whatever is structurally wrong with the recording
conventions shows up there first and largest. It is not an outlier caused by one
careless session — the rules it follows are ours.

## Finding 1 — 8.8% of written output was code

| What was written (24h) | Lines added | Share |
|---|---:|---:|
| Tracker markdown | 18,799 | 78.7% |
| Source comments + blanks in `.ts` | 2,839 | 11.9% |
| **Actual code** | **2,111** | **8.8%** |
| Non-`.ts` (CLAUDE.md, config) | 151 | 0.6% |

By volume: **1.13 MB of markdown against 315 KB of code diff** — roughly **282k
tokens written into docs versus 79k into the code repo**, and half of that 79k
is comment prose too.

Comment density inside the code itself was **53.4% comment, 42.6% code, 3.9%
blank** across all added `.ts` lines.

## Finding 2 — the ratio is worst on the smallest changes

The sharpest two-hour window, a run closing two test-oracle defects:

| Production file | Comment lines added | Code lines added |
|---|---:|---:|
| `core/container/format.ts` | 58 | **1** |
| `editor/engine.ts` | 65 | **2** |
| `editor/createCanvas.ts` | 24 | **2** |
| **Total** | **147** | **5** |

Alongside those 5 lines: 380 lines of new test (a legitimate deliverable) and
**2,716 lines of tracker markdown**, of which the run's own activity folder was
**1,928 lines across 13 files**.

**This is the shape of the problem.** Recording cost does not scale down with
change size, because nothing in the rules takes change size as an input.

## Finding 3 — the cost is restatement, not detail

The same fact is written into a dozen files. Distinct markers, counted across
the audited issue:

| Marker | Files repeating it |
|---|---:|
| the changed constant | 12 |
| one mutant's id | 12 |
| a test count | 11 |
| a table row count | 8 |

One run's three findings were retold in `00_goal`, `01_summary`,
`02_task_list`, `04_benchmark`, the milestone, `audit/00_verdict`, three scope
reports, the subtask, the plan file, and the questions file — **eleven
retellings, each rewritten from scratch rather than linked.**

A twelfth copy went into the source: a 65-line code comment restating the call
census, the rejected alternative, and two open holes — all three already in the
tracker.

## Finding 4 — almost none of it is ever read back

Of **749 files** in the audited issue's `agent-log/`:

| Times the file was touched | Files |
|---|---:|
| 1 (written once, never revisited) | **588** |
| 2 | 149 |
| 3 or more | 12 |

The issue as a whole is now **872 markdown files, 132,567 lines, 7.6 MB**. No
session can read that; the CLI can search it, but the volume means real findings
have already been lost inside it more than once.

## Finding 5 — where the markdown goes

| Section | Lines (24h) | Share |
|---|---:|---:|
| `agent-log/*/audit/` — audit reports | 8,781 | 46.7% |
| `agent-log/*/0N_` — the six standard slots | 2,894 | 15.4% |
| `agent-log/*/03_working/` — agent brief files | 2,037 | 10.8% |
| `subtasks/` | 1,812 | 9.6% |
| `agent-memory/` | 1,480 | 7.9% |
| milestones | 923 | 4.9% |
| repo rule files | 597 | 3.2% |

**73% of all writing is `agent-log/`**, and the plurality of that is audit
reports. `03_working/` alone holds **160 committed agent-brief files** — prompts
written as files, which is a rule, and which nobody reads afterwards.

## Root cause — every rule points one way and nothing points back

This is not a discipline failure. It is a gradient with no counter-force.

| Rule, and where it lives | What it produces |
|---|---|
| *"Keep all six present even when blank"* (activity scaffold) | A **six-file floor per activity**, regardless of size. A stub reads as unfinished, so it gets filled. |
| `agent-ks-issues`: *"detailed, line-rich records"*, *"a few vague bullets is a malformed milestone"*, *"whenever in doubt, persist"* | Maximal persistence is the literal instruction. **The skill contains no size-proportionality rule at all.** |
| *"Every file … is structured, context-setting prose, never a bare dump"* | Applies unconditionally — turning a two-line note into a two-hundred-line essay for a five-line change. |
| Orchestration: one report per audit scope, per-finding schema, *plus* "name the areas checked and found clean" | Report length scales with **area examined**, not with **risk found**. |
| *"Instructions as files, prompts as pointers"* | Every agent launch becomes a committed 80–150 line file. |
| *"corrected in place with the superseded wording kept"* | Files only grow. **No compaction, no supersession, no decay.** |

## What earned its cost — stated so the fix does not overshoot

The audited run's audit **found a real defect in the fix it was auditing**, one
that had survived 3,834 tests. Verification is not the waste. Neither are the
decision records, which exist so a human can overturn a call in one message, and
which work.

The waste is that each of those was recorded **eight to twelve times, in prose,
at essay length, plus once more in the source.**

A defensible version of that same run: the same code, the same tests, one ~60-line
activity note (why, what shipped, what is open, what is next), one ~40-line
findings list, and 15-line source comments. **~120 lines instead of 1,928**, with
nothing lost that anyone would later want.

## What this implies for the fix

1. **One canonical home per fact**, links from everywhere else. The tracker
   already has link syntax; the rules never say to prefer it over retelling.
2. **A size input.** Any rule that mandates structure needs a clause that scales
   it to the size of the change.
3. **Slots that may stay empty**, and a stub form that reads as *deliberately
   empty* rather than *not yet done*.
4. **Briefs summarised, not dumped** — why the run was commissioned and what it
   was to produce.
5. **A plan with a real home**, so runs stop re-deriving the state of the work in
   their own folders. This is the connection to the other half of the issue —
   see [Brainstorm: the plans section](../subtasks/030_brainstorm-plans-section.md).
