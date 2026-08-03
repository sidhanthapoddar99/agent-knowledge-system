---
title: "Four way audit of the rewrite"
status: done
agent: claude
---

# Goal

Audit the proposed replacement `CLAUDE.md`
([`03_debrief/01`](../03_debrief/01_proposed-claude-md.md)) adversarially, and —
Sid's design, and the better half of it — **test it behaviourally** by having
every auditor answer the same three situations *as if the new file were already
in force*.

# Inputs

- The proposal, at the state it was in when the audits launched. It was
  deliberately **not** edited while they ran; changing the ground under four live
  reviewers produces four reviews of four different documents.
- Four auditors, none seeing another's work: **Opus**, **Fable**, **Sonnet**
  in-harness, and **Codex `gpt-5.6-sol`** external with its own shell.
- Three fixed scenarios, identical for all four: a reading question, a
  blast-radius decision, and a mixed end-of-session wrap-up.

# Expected Outcome

A merged defect list and a ship / do-not-ship verdict. Merged as a **union**: any
finding raised by one auditor stands on that basis alone.

# Outcome

**All four returned *ship with changes*. Not one said ship as written.** The
architecture holds; the wording has holes, and four of them are severe enough to
block.

## 1. The doubt rule is on the wrong axis — and authorises the incident it was built from

**Found by Opus, confirmed independently by Codex.** The most serious finding in
the run.

The proposal says: *"Check before an expensive or irreversible action. Before a
reversible one, do not."* And precedence rule 4 says: *"take the action that
costs me one message to reverse."*

**The 341-link rewrite was reversible.** It was reverted with git. An agent
classifying it correctly as reversible is told by one rule not to check, and
encouraged by the other to proceed. The worked example says the opposite —
Opus's phrasing is the one to keep: *"the example is a story and the rule is a
rule."*

**Fix:** the axis is **blast radius and cost, independently of reversibility**.
Skip the check only when the action is *both* cheap *and* easily reversible.
Delete *"before a reversible one, do not."*

## 2. Hard limits versus an explicit grant — unresolved, and it already bit

**Found by Sonnet, confirmed by Codex.** Precedence rule 1 says an explicit grant
from Sid beats anything in the file. *Hard limits* says `done`/`dropped` are his
alone, *"no trigger, no exception"*. The file cannot say which governs when Sid
says *"close it."*

**This is not hypothetical — it happened in the session that produced this run.**
Sid instructed a subtask be closed, and it was closed.

Codex's resolution is the sharper one and is adopted: **a direct instruction may
authorise the primary agent to *apply Sid's own decision*, but never overrides
the safeguards on subagents, destruction, or history.** Closing on his word is
carrying out his decision; a subagent closing anything is not.

## 3. Precedence rule 3 re-encodes the bug it was written to fix

**Found by Fable and Sonnet independently.** Round 1 established that conflicts
resolved by *"the narrower or later rule wins — never the more important one"*,
and named that as the defect. The proposal then makes *"the narrower rule wins"*
official policy at rank 3.

**Fix:** qualify it — *the narrower rule wins **when both are protecting the same
thing**; a narrow convenience never beats a broad protection* — or drop rank 3
and let "cheaper mistake" absorb the untied cases.

## 4. The reference files are a deletion wearing a disguise

**Found by Opus, Fable and Codex.** Two independent halves:

- **No load trigger.** *Pointers* lists two paths in backticks. Nothing states
  when to read them. Fable's phrasing: **a pointer without a trigger is a deleted
  rule.** The Codex safety rails and the mutation-testing controls become text
  the agent never sees at the moment it matters.
- **Untracked.** Verified directly rather than taken on trust:
  `~/.claude/.gitignore` ignores everything (`*`) and re-includes exactly four
  files by exception. So `references/` is *already* ignored — Sid's instruction to
  add it changes nothing — and the real effect is that 738 words of hard-won
  procedure move from a **tracked** file into **untracked, unbacked-up** ones.

**Fix:** a trigger line on every pointer (*"before launching, polling or resuming
a Codex job, read this first — every time"*), and `!references/` plus
`!references/*.md` added to the allowlist so they are version-controlled.

## 5. The doubt section re-imports the failure it exists to stop

**Found only by Codex, and it is the subtlest defect in the file.**

*"When you do check, control it both directions"* is written unconditionally
inside the very section that limits checking. Bidirectional controls are a
mutation-testing discipline; applied to every check they reproduce exactly the
five-control-tests-for-a-reading-question failure this run was commissioned over.

**Fix:** require both-directions controls only for **new harnesses, coverage
claims, and suspiciously clean results** — never for established deterministic
gates.

## The silent losses

Every auditor independently identified the same class as the one the compaction
handled worst, and Opus stated why: **an over-applying rule announces itself in
every reply; a dropped rule never announces itself at all.**

| Cut | Flagged by | Why its absence is silent |
|---|---|---|
| One reviewer must **execute**, not only read | all four | a reading-only review looks identical to a complete one; arithmetic and offset bugs walk through |
| Before-and-after numbers on any speed / memory / size claim | Opus, Fable, Sonnet | an unmeasured improvement claim reads exactly like a measured one |
| Verdict vocabulary + *"not ready ends the round"* | Opus, Fable, Sonnet | findings get patched one at a time and a wrong approach is iterated instead of scrapped |
| *"What to look for first"* — the required-rule-as-optional-setting pattern | Opus, Fable, Sonnet | produces shallower reviews with no visible symptom; Opus rates it the highest-yield item in the old file |
| A named owner for long external jobs | Opus, Fable, Codex | a finding that lives only in a job record dies with the run |
| Git grant scoping — per-project **and** per-activity, does not carry forward, fetch before committing on auto-push | Codex | grants silently became global and permanent |
| No hard limit on **irreversible deletion or overwrite inside the repo**, especially of uncommitted work | Codex | nothing in the new file protects it at all |
| The cheap-reversal fallback has **no authorisation boundary** | Codex | a request to *read* or *diagnose* would silently authorise edits, because edits are cheap to reverse |

## The rules I introduced that are themselves unconditional

The file's own thesis is triggers over absolutes. It ships four fresh absolutes:

| New rule | Flagged by | The boundary it needs |
|---|---|---|
| Coloured dots on grouped output | all four | only when items **differ in state** and that state is what Sid needs; a list of equals gets none. Opus also warns the harness may strip emoji, overriding it silently |
| *"Answer first. One or two lines"* | Opus | no exemption for a wrap-up or a finding set, where no one-line answer exists — the risk is now a two-line reply that drops item four |
| *"Never `cd` inside a command"* | Fable | a subshelled `cd` does not persist and is correct; stated absolutely, a competent reader violates it and learns the absolutes here are soft |
| *"One command, one question"* | Codex | forbids coherent multi-part diagnostic commands, and invites narrating the purpose of every call |

## The worked examples are the weakest part

| Example | Defect | Found by |
|---|---|---|
| Status mismatch | Teaches **normalising** the mismatch — *"one line to fix"* — without first establishing who authorised the closures. The correct behaviour, which the real session demonstrated, is to touch **neither side** until Sid confirms | Codex |
| Link rewrite | Predeclares the answer (*"find the three-line omission"*) and enumerates only two hypotheses; routing, configuration, deployment and generated output are omitted. It should demonstrate **tracing one link through the whole pipeline**, not recite the known diagnosis | Codex |
| Link rewrite | *"When every user of a thing uses it wrongly, suspect the thing"* misfires on the copy-pasted-template case, where uniform failure genuinely does mean the content is wrong. Better: **uniform failure means you have not discriminated yet — open the tool and reproduce one case** | Fable, Sonnet |
| Status mismatch | It is Scenario 1 verbatim, so the auditors were graded on the example they were given. Its surface features — a table, a `status` field, that exact path — are what it makes salient, not the principle | Opus |

## The behavioural test earned its place

Sid's addition — *"ask them how they would reply"* — was the most informative
part of the round, and it validated the architecture that the text review could
not.

| Scenario | What all four did |
|---|---|
| **1 — reading question** | Answered in one to three lines. No builds, no control tests, no report. The failure that started this run did not reproduce in any of the four |
| **2 — 341 edits pending** | **All four held.** Every one labelled the diagnosis as unverified, named the cheap discriminator, and refused the bulk edit before running it |
| **3 — mixed wrap-up** | All four surfaced the authorisation gap unprompted, and **three explicitly refused to touch either side of it** — behaviour stronger than the file's text requires |

That last row is the useful signal: the examples transmitted judgement the rules
did not state. It is the clearest evidence for Sid's *"3 examples beat 10
instructions."*

## Two more numbers asserted without measuring

Recorded because it is now a pattern, not an incident, and the pattern is the
finding:

| Claim | Stated | Measured |
|---|---|---|
| Old file length | ~10,000 words | **3,580** |
| Proposal length | 1,980 words | **2,229** |

Both were asserted inside a run whose subject is *do not state what you have not
measured*. The proposal's own *Doubt* section is the fix, and it did not fire
because a word count feels too small to check — which is precisely how the
cheap check gets skipped.

# Next

Round 3 applies all of the above in a single revision pass, then hands Sid the
final text plus the two reference files. Sid's three governance lines — do not
edit without confirmation, finalisation needs independent review, and the pointer
to [`03_debrief/02`](../03_debrief/02_proposed-reference-writing-claude-md.md) —
fold in during that pass, having been deliberately held back while the audits ran.
