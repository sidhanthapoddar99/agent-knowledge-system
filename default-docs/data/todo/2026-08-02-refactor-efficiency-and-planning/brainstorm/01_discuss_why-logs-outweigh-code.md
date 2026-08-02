---
title: "01 — Why the logs outweigh the code (the mechanism)"
---

# Why the logs outweigh the code

Thread question: **what actually generates 80% log / 10% comment / 10% code?**
Numbers in [the audit](../notes/10_efficiency-audit-2026-08-02.md); this thread
is the causal account, because the fix has to attack a mechanism, not a symptom.

**The code volume is not the anomaly.** 2,111 lines of code in a day is a normal
amount of work. The other two are inflated.

## The arithmetic — this is the whole thing

Two rules multiply:

> *"Every file is structured, context-setting prose"* × *the standard six slots*
> × *"reread it as someone with no context"*

A cold reader needs the full story. **Thirteen files, each obliged to stand
alone, is thirteen copies of the story.** The 80% does not come from any file
being too long. It comes from the *count of files* each independently required
to be self-sufficient.

That is why a length limit is the wrong fix: every file was individually
defensible.

## Six compounding causes

1. **Prose has no gate.** Code must compile and pass tests. Markdown must do
   nothing. Anything ungated expands to fill available effort.
2. **Restatement is the cheapest output available.** Once findings are in
   context, writing them again is the highest-fluency, lowest-effort thing an
   agent can produce. Deciding what to *exclude* is strictly harder than filling
   the slot. So an empty slot attracts the whole story.
3. **Slots are named, not scoped.** `00_goal` / `01_summary` / `04_benchmark` /
   `05_notes` are nouns. A noun invites everything; a **question** excludes
   everything that does not answer it.
4. **No plan, so every run rebuilds the state of the work.** With nowhere
   canonical for *"here is where we are"*, each activity reconstructs it — goal,
   context, what came before, what is next. Roughly 40% of a typical
   goal+summary pair.
5. **Nothing decays.** Corrections add rather than replace, facts never retire,
   folders never compact. Growth is monotonic by design.
6. **Same disease one layer down, in the code.** A 65-line source comment
   carrying a call census, a rejected alternative and two open holes is *tracker
   content in a code file* — written because there is no confidence the tracker
   will be found.

## The doubling nobody counted

Discovered in discussion, not in the measurement pass, and it may be the largest
single line item:

An audit scope report is written **to a file** by the subagent (~200–440 lines),
**returned in full** to the orchestrator as its result, and then **restated** in
the merged verdict. That is the same content produced three times, two of them
billed as output tokens.

Sid's framing: *"if I send you a letter and I also messaged you the letter again,
the whole content as it is — rather, I sent you a letter and a two-line message
referring to it."*

Same doubling on the way in: agent **briefs** are re-typed per launch (80–150
lines each, 160 files) instead of pointing at standing instructions that already
exist in `agent-memory/`. The mechanism to avoid this was already built and was
not being used.

Fix shape: [04 — the agent-log's shape](./04_discuss_agent-log-shape.md).

## What the fix must NOT do

- **Not a word budget.** Brevity as a target produces jargon, and jargon is worse
  than length. Every remedy here must cut *copies*, not prose.
- **Not less verification.** The run that triggered this found a real defect that
  had survived 3,834 tests. The audit earned its cost; the eleven retellings of
  its result did not.
