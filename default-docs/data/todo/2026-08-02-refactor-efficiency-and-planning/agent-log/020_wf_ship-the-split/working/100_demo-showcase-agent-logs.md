---
title: "The demo fixture — ten agent logs down to three"
status: done
agent: claude
---

# Goal

Rebuild the demo showcase's agent logs so they teach the shape by being
realistic, rather than by being a catalogue.

# Inputs

- Sid, in session: *"reduce the amount in the demo, but make it proper and a
  little bit structured and more realistic, not just one one two two files. Have
  three agent logs that make it proper. No need to show all the examples
  available."*
- The revised spec:
  [the agent-log structure](../../../notes/20_agent-log-structure.md)
- The fixture:
  `default-docs/data/todo/2026-07-01-demo-issue-anatomy-showcase/`

# Expected Outcome

Three agent logs, each substantial enough to be read as a real run, with every
inbound link from the issue's plans, subtasks, glossary and memory repointed —
and the fixture's own `issue.md` and `settings.json` describing what is actually
there.

# Outcome

## What was wrong with it

**Ten agent logs, 50 files, and most of them were stubs.** The fixture had been
built to exercise one of everything — every kind code, an undefined kind code, a
2-digit prefix beside 3-digit ones, status-present against status-absent, a
high-numbered gap. Six of the ten existed only to make a loader branch fire.

That is a coverage matrix, not a fixture. A reader opening it to learn what an
agent log looks like met six examples that a real run would never produce, and
the two that were realistic were buried among them.

## What is there now

| Log | Kind | Status | What it demonstrates |
|---|---|---|---|
| `010_lp_implement-sections` | loop | `done` | Six iterations; producer files beside their iteration file (`011`, `012`); a producer folder holding several artifacts including a `.mmd`; a two-file debrief; a **child agent log** whose status is `in-progress` while the parent is `done` |
| `020_au_edge-cases` | audit | `done` | A pair is **two** files plus the merged iteration file — one confirmed defect, one claim refuted by the executing half and kept as refuted; a debrief that points at the subtask rather than repeating it |
| `030_ex_one-pass-spike` | experiment | `dropped` | A run that deliberately did not land: the custom `ex` kind, `status: dropped`, `# State` as a `> [!WARNING]`, and both signals a failed run needs — the colour and the callout |

28 files, down from 50. Every summary is in the new shape, and every `# Todo`
item is a link carrying a line of what it did — the rule from
[the summary-shape round](./090_summary-shape-and-links.md), demonstrated where
someone will actually copy it.

## What was deliberately dropped, and it is not free

Two things the old fixture covered are gone, said plainly rather than left to be
discovered:

- **Folder-level "status absent renders grey".** It had a whole fake agent log
  (`310_au_status-absent`) to exercise one loader branch. Not worth a folder.
- **The undefined kind code.** `70_nt_test` existed to show the no-symbol
  fallback — and it tripped a validator warning on every run, permanently. **A
  fixture that keeps the validator at "1 warning, ignore that one" trains people
  to ignore warnings**, which costs more than the branch it covered.

Removing it took the tracker-wide count from 2 warnings to 1, and the one that
remains is in a different issue.

## The part that generalises

**Consolidating the logs broke four links, in four different sections** — the
glossary's colour legend, `agent-memory/history/`, a plan stage's `agent-logs:`
frontmatter, and a verification subtask. Each was a real markdown link, so each
was findable with one grep and fixable in one edit.

Had they been written as bare numbers — *"see `050`"* — the same consolidation
would have left four sentences that still read correctly and pointed at nothing.
This round is the concrete case for
[reference by link, never by number](../../../notes/70_reference-by-link-never-by-number.md),
and it happened by accident rather than as a demonstration.

**The fixture's own `issue.md` and `settings.json` were both stale**, still
describing activity folders and the six `0NN` slots deleted in an earlier round.
Both rewritten. A fixture that misdescribes itself is worse than no fixture,
because the description is what a reader trusts before opening anything.

## Gate

| Check | Result |
|---|---|
| `./start build` | clean, **936 pages** (949 before; 13 fewer, all from the consolidated fixture) |
| Issue validator | 51 folders, **1 warning**, down from 2 |
| Dangling references to removed logs | 0 — grep across the issue source *and* the built HTML |
| `verification/fixture-render/check.mjs` | re-run: **24 assertions, all PASS**; 1 console error, the deliberate past-the-cap 404 |

The harness needed exactly one edit — the child agent log's path — which is a
fair measure of what the consolidation cost anything downstream.

Empty directories survive a `git rm` — `050_it_ui/working/` was left behind and
the validator caught it as an agent log with no `summary.md`. Worth knowing: the
build rendered happily around it, so the validator was the only thing that
noticed.
