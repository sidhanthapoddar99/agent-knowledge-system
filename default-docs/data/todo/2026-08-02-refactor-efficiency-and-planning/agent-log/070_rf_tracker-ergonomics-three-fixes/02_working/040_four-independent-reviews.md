---
title: "Four independent reviews on one diff — and the diff did not survive"
status: done
agent: claude
unit: audit
---

# Goal

Four reviewers on `b7cccb9`, each with a different lens, one of them with a
shell. Sid, 2026-08-04: *"use four agent system for independent review, Opus,
Sonnet, Fable, and Sol. And note down their final audit responses then we can
discuss."*

The lenses were assigned so that no two could find the same thing by the same
route — a rule reviewed as *behaviour*, an index reviewed as a *system over
time*, a parser reviewed against a *specification*, and everything reviewed by
*running it*.

# Inputs

- commit `b7cccb9` and this run's [summary](../01_summary.md)
- the four reports: [Opus](./041_opus-the-rule-as-behaviour.md) ·
  [Sonnet](./042_sonnet-the-index-as-a-system.md) ·
  [Fable](./043_fable-commonmark-and-coherence.md) ·
  [Sol](./044_sol-the-reviewer-that-executes.md)

# Expected Outcome

Findings — each with `file:line`, the failure scenario, and whether it was
reproduced.

# Outcome

**Merged as a union, not a vote. 24 findings, and the commit does not stand.**

Two of the three subtasks it closed are wrong in ways their own acceptance tests
were built not to see. Nothing has been fixed yet — that is the next round, after
Sid has read this.

## The three that overturn a claim this run made

| | The claim | What is actually true |
|---|---|---|
| 🔴 | *"landed on four surfaces"* | The **replaced** rule is still shipped in three more skill files and ~7 published docs — including `24_agent-logs.md:746`, the same file as the new rule, which says *"inline work opens no folder however much reasoning it carried"* and reverses the flagship trigger-2 case |
| 🔴 | *"14 of 14 verdicts unchanged"* | Re-run against the rewritten **section**, not the shipped **skill**. Two verdicts are unstable and two more are unreachable — the loops fall between a trigger written for sequential work and a floor written as *"one self-contained pass"* |
| 🔴 | *"every cell comes from a round file's frontmatter"* | A folder-form round is silently **omitted**. Reproduced on real tracked data: the demo showcase's table jumps `03 → 05`, dropping `040_research-codecs/` |

**The third is the design's own failure mode arriving through the door it left
open.** The table exists because a hand-typed one silently disagrees with the
files it describes. This one silently omits them — and the staleness gate cannot
see it, because the gate compares the file to a generator carrying the same blind
spot.

## Independent verification before recording anything

Every countable claim was re-run locally rather than transcribed, and two did not
survive:

| Claim | Reviewer said | Measured |
|---|---|---|
| rounds carrying `unit:` | 3 of 38 | **3 of 50** — the finding is stronger than reported |
| CI or hook running `check issues` | none | **none** — confirmed, `.github/` and `.git/hooks/` both empty of it |
| the five CommonMark blanker inputs | wrong | **all five reproduce** |
| the folder-form omission | dropped | **reproduced on real tracked data** |

## The pattern across all four, which is one pattern

**Every finding is a check that was scoped to the thing it was written for.**

- the acceptance test read the section it edited, not the tree
- the blanker fixture tested the case that motivated it, not the specification
- the staleness gate compares against a generator with the same blind spot
- the drift gate has nothing forcing anyone through it

That is the same defect this whole issue has been chasing — **a rule that is
technically correct and does not fire** — now found in the checks written to
enforce it. A gate is only as wide as the question it asks, and each of these
asked the narrow one.

## Two process findings against this run itself

- **The eight-case fixture was never committed.** It lives outside the repo, and
  a harness that is not in the tree stops being a reproduction the moment it is
  cleared. It also contained none of the five inputs that broke it.
- **The watcher on the long external job was wrong twice** — first matching the
  word `completed` inside a progress line, then parsing a header row instead of
  the record. It reported a terminal state that had not happened, and later a
  stall that had not happened either. The job was fine both times; the watcher
  was not.

# Next

Round 05 decides on the merged findings — **fix / reject / defer** per item — and
carries them out. Nothing in this round was fixed, deliberately: the union is
decided once, not patched per reviewer.
