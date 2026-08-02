---
title: "The worked examples still teach the retired model"
status: open
---

# Overview

Five files under `references/60_examples/` and `references/40_operations/` were
**not touched** by the rewrite. They are byte-identical to the old skill, so they
now teach a model the rest of the skill abolished — and they teach it in the
place a reader goes to see the model *applied*.

**All three readers found this independently, and one changed its verdict over
it.** Sonnet preferred the new skill's architecture and still picked the old
version overall, on this ground alone: *"following B carries a real risk of
copying a stale pattern that contradicts B's own current rules."*

**Done when** every file under `60_examples/` demonstrates the model the rest of
the skill describes, and a reader following any example produces a shape the
skill's own rules would accept.

# References

- The verdicts that raised it:
  [reader 2 — Sonnet](../../agent-log/020_wf_ship-the-split/working/072_verdict-sonnet.md)
  (decisive), [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/working/071_verdict-opus.md)
  (*"What my winner does worse"*, item 4),
  [reader 3 — sol](../../agent-log/020_wf_ship-the-split/working/073_verdict-sol.md)
- The rules the examples contradict:
  [subtasks by category](../040_execution/080_skill-subtasks-by-category.md) ·
  [the agent-log shape](../../notes/20_agent-log-structure.md)

# Todo list

- [ ] `64_phase-index.md:31` — delete *"Numbering encodes sequence"*; the phase's
      ordering is a **plan**, which is what the example should now show
- [ ] `61_multiple-subtasks.md:43,57` — replace `Goal / Approach / Result / Next`
      with the four-section iteration head; drop the "flat `agent-log/`" fallback
- [ ] `41_searching.md:46` — `add-agent-log` no longer auto-increments an
      `iteration` field; the field is gone
- [ ] `41_searching.md` — the "8 issue-tracker CLI wrappers" list omits all four
      new commands
- [ ] `62_research-focused.md:31` — *"`comments/` is load-bearing … the
      back-and-forth belongs here"* against the new `comments/` boundary, which
      excludes the debate
- [ ] `42_updating.md` — read for the same class of drift
- [ ] Re-read every example against the section it illustrates, not just against
      the list above

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — nothing done. This is a proposal.

# Details

## The two quotes that decide it

`64_phase-index.md:31`, verbatim and still in the tree:

> **Numbering encodes sequence.** The subtask prefixes (`00_`, `01_`, … `16_`)
> are a real ordering — the order the phase intends to tackle steps — not just
> sort sugar.

Against `23_subtasks.md:20`:

> A subtask's number is a stable id and a sort key within its category. **It does
> not imply sequence.**

Two files apart, stated as fact both ways. Worse: `23_subtasks.md:40` names the
exact anti-pattern *"a group whose overview says 'reading order is execution
order' — that chain is a plan"*, which is a description of what `64` does.

`61_multiple-subtasks.md:43`:

> append an agent-log entry summarising Goal / Approach / Result / Next

That head was replaced by `# Goal / # Inputs / # Expected Outcome / # Outcome`.
An agent following `61` writes a file the rest of the skill does not recognise.

## Why this is the highest-severity finding in the audit

An example is not decoration — it is where a reader goes when the rule is
abstract. A stale rule and a stale example are not equally bad: **the reader who
consults the example is the reader who did not understand the rule**, so the
example catches them at exactly the moment they cannot spot the contradiction.

It is also the cheapest class of defect to have avoided, which is the honest
lesson: the rewrite changed the rules and the section pages and left the
demonstrations behind.

## Scope note

`64_phase-index.md` may not survive as an example at all. Its whole subject —
a phase issue whose subtask numbers carry the execution order — **is** the
pattern the plans section exists to replace. Converting it is a rewrite, not an
edit, and the honest options are to rewrite it as a plans-based example or to
drop it and let `63_agent-loops.md` carry that ground.
