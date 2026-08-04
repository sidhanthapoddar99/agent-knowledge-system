---
title: "Summary"
---

# State

> [!WARNING]
> **Four reviews are in and the diff does not stand.** Two of the three subtasks
> it closed are wrong in ways their own acceptance tests were built not to see —
> the replaced rule is still shipped in ~10 other files, and a folder-form round
> is silently dropped from the generated table. **Nothing has been fixed**;
> waiting on Sid before round 05 decides the merged findings.

# Goal

Land the three entries in
[`110_tracker-ergonomics`](../../subtasks/110_tracker-ergonomics/00_overview.md).
They share one mechanism, and it is the one this issue has been chasing a layer
down: **a rule that is technically correct and does not fire** — either because
it lives in a skill that may not be loaded, or because the tool shows a shape
that contradicts it.

Sid, 2026-08-04, opening the run: *"create an agent log for tracker ergonomics
where you would complete all the 3 changes one after another."*

# Todo

References: the group
[`00_overview`](../../subtasks/110_tracker-ergonomics/00_overview.md) · the
precedent that decided `015`'s design,
[the execution group's overview](../../subtasks/040_execution/00_overview.md).

- [x] [The agent-log rule lands](./02_working/010_land-the-agent-log-floor.md) —
      [`020`](../../subtasks/110_tracker-ergonomics/020_when-a-run-earns-an-agent-log.md)
      on four surfaces; all 14 worked verdicts re-run and unchanged
- [x] [The round table](./02_working/020_the-round-table.md) —
      [`015`](../../subtasks/110_tracker-ergonomics/015_the-working-index-is-a-table-of-the-round.md)
      decided *regenerated*, built as [the round table](./02_working/00_index.md), with a staleness
      error and a `reindex` verb to answer it
- [x] [The gate that failed its own scaffold](./02_working/030_the-gate-that-failed-its-own-scaffold.md)
      — unplanned: `check link-form` failed **this run's own summary**, on a code
      span that wraps. Two bugs, the second mine
- [x] [`010`](../../subtasks/110_tracker-ergonomics/010_plan-execution-needs-an-agent-log.md)
      — already shipped; re-verified on every surface it names, and its wording
      is what round 01 replaced with the trigger-and-floor form
- [x] [Four independent reviews](./02_working/040_four-independent-reviews.md) —
      24 findings, merged as a union. Three of them overturn a claim rounds 01–03
      made about their own work
- [ ] **Round 05 — decide and fix.** Not started; the union is decided once,
      after Sid reads it, rather than patched per reviewer

# Out of Scope

The four broken-anchor findings and the static-host trailing-slash defect —
those belong to `2026-08-04-absolute-link-resolution` and were not touched.

# Outcome

**Three subtasks at `review`, three gates green, one unplanned defect fixed.**

| | |
|---|---|
| Files changed | 4 skill/framework surfaces, 6 CLI scripts (2 new), 1 manifest entry |
| New CLI verb | `agent-ks issue reindex <id> [--log] [--check]` |
| `check link-form` | **1 error → 0**; warnings unchanged at 52 |
| `check issues` | clean, down to its two known unrelated warnings |
| `check skill-links` | ✓ 44 files, repo source tree |
| Production build | ✓ 1,203 pages |
| Control tests | 14 rule verdicts re-run · 2-direction floor test · 2-direction staleness gate · 8-case blanker fixture |

**The run's own shape is the thing it built.** This log was opened before the
first round because a three-part plan fires trigger 1 — and its `02_working/`
carries the generated round table that round 02 added, populated by rounds 01–03.
Round 03 exists because round 02's verification returned something that changed
the work, which is the trigger stated as a fact rather than as prose.

## What each round found that the diff does not show

- **Round 01** — the acceptance test was the point, not the edit. *One bounded
  delegated job* is the case that could have moved: under the old five factors
  *whose hands* was co-equal and might have carried it. It did not move, because
  the new shape demotes delegation to a weight that never triggers alone.
- **Round 02** — rendered was rejected for a reason that is easy to miss. It
  cannot drift at *all*, which sounds strictly better; but it leaves no file, and
  git does not track empty directories, so the folder vanishes on clone — which
  is the entire subtask. Regenerated plus a gate was the answer.
- **Round 03** — the first fix removed one false positive and introduced another,
  in a file whose subject is false positives. A regex that backtracks into a
  backtick run is the cause; the fixture that catches it is the one asking
  whether a *real link after a stray run* survives, which "is it quiet now?"
  would never have asked.

## Still open, and reported rather than fixed

`020_wf_ship-the-split` round 14 is `in-progress` inside a finished run — a stale
round file the new table surfaced on its first use. Closing a round is not this
run's to do.
