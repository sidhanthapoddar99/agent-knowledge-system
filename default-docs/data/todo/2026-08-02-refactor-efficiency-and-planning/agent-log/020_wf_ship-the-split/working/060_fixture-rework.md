---
title: "The demo fixture, reworked"
status: done
agent: claude
---

# Goal

Subtask 140 — the demo issue is the fixture every UI change is eyeballed
against, and it was 57 files of the shape being replaced. Rework it, do not patch
it: a fixture that half-shows the new shape is worse than one that shows the old
one honestly, because a reviewer cannot tell which parts are deliberate.

# Inputs

- `subtasks/040_execution/140_rework-demo-showcase.md`
- `notes/20_agent-log-structure.md`, `notes/50_plans-section-spec.md`

# Expected Outcome

The change, and what it touched.

# Outcome

57 files → 74, each exercising something specific: producer numbering
(`010`/`011`/`012` beside a bare `020`), a producer folder, a pair as two files,
a child agent log with a level-4 producer, `input-needed` and `dropped`, a closed
plan beside the active one, a subtask group as an area with three statuses, and
agent-memory with its decisions file deliberately absent.

**Playwright pass: 24 assertions, all PASS. Console errors: 1, and it is the
deliberate 404 probe.** Harness committed at
`verification/fixture-render/check.mjs` — it serves `dist/` from inside its own
process, so nothing outlives the run.

## One decision taken inside the round, and it reverses something built

**A deliberate broken-`subtasks:`-reference fixture was built, worked, and then
removed.** It did exactly what it was meant to — the validator errored and the
plan page rendered its red warning — and that is precisely the problem: it left
`agent-ks check issues` exiting non-zero on this repo permanently, and **a gate
that can only be run with "expect one error" stops being run.**

The case is proven the other way instead: mutate the rule, watch it fire, restore.
The stage that replaced the fixture explains that reasoning in place so nobody
re-adds it.

## What the round could not answer

Whether the five-level tree at 24px **reads**. Automation confirms the rows fit;
only a person can say they are legible rather than merely present. It is in the
fixture as an `input-needed` subtask with the setup, the actions and the artefacts
named — not asserted by a headless browser, which would produce a confident wrong
answer.
