---
title: "Rounds"
---

# Rounds

- [the agent-log rule lands](./010_land-the-agent-log-floor.md) — the rule
  restructured onto four surfaces. **The acceptance test was the flaw**: it re-ran
  the 14 cases against the section it had just edited, so it could not see the ten
  other files still carrying the old rule.
- [the round table](./020_the-round-table.md) — built `02_working/00_index.md`
  as a generated table with a staleness gate. **Round 05 deleted all of it.** The
  reasoning for *derived over typed* was sound and the conclusion was still wrong.
- [the gate that failed its own scaffold](./030_the-gate-that-failed-its-own-scaffold.md)
  — unplanned. `check link-form` failed **this run's own summary**: the scaffolder
  template quotes a link inside a code span that wraps, so every agent log the tool
  had ever made was failing. Two bugs, the second one mine.
- [four independent reviews](./040_four-independent-reviews.md) — 24 findings,
  merged as a union. Three of them overturned claims rounds 01–03 made about their
  own work. Producers:
  [Opus](./041_opus-the-rule-as-behaviour.md) · [Sonnet](./042_sonnet-the-index-as-a-system.md) ·
  [Fable](./043_fable-commonmark-and-coherence.md) · [Sol](./044_sol-the-reviewer-that-executes.md)
- [decide, and delete](./050_decide-and-delete.md) — the findings acted on.
  The generator is gone, the rule has one home, and the blanker is CommonMark-correct
  with a fixture **in the repo** this time.

- [stop hand-rolling the parser](./060_stop-hand-rolling-the-parser.md) — the second
  review round, all 20 findings. The blanker is now a **parser** rather than a third
  hand-written approximation, and the fixture is a differential test against micromark
  instead of a list of bugs I remembered. Two findings only a shell could reach: I had
  called the `--group` validator gap cosmetic by reasoning, and it was hiding every
  agent-log check; and a **fourth** link-walking caller nobody had counted.

# The slots

| | |
|---|---|
| [`01_summary.md`](../01_summary.md) | the run's one conclusive file, and the brief |
| `02_working/` | this folder — one file per round, plus a file per producer |
| `03_debrief/` | not opened: everything actionable became a subtask instead |
