---
title: "Summary"
---

# State

> [!NOTE]
> **Six rounds done. Two review rounds, 44 findings, all closed.** The
> generated index is deleted, the rule has one home, and the blanker is
> CommonMark-correct with a fixture in the tree. Three subtasks at `review`
> ([`015`](../../subtasks/110_tracker-ergonomics/015_the-working-index-is-a-table-of-the-round.md)
> ·[`020`](../../subtasks/110_tracker-ergonomics/020_when-a-run-earns-an-agent-log.md)
> ·[`025`](../../subtasks/110_tracker-ergonomics/025_an-index-is-checked-not-generated.md)),
> plus [`010`](../../subtasks/110_tracker-ergonomics/010_plan-execution-needs-an-agent-log.md).
> The second audit found twenty more, including two that only a shell could
> reach. Ready for hand-off.

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
      decided *regenerated* and built as a generated table — **reversed in round 05**,
      and the reversal is [`025`](../../subtasks/110_tracker-ergonomics/025_an-index-is-checked-not-generated.md)
- [x] [The gate that failed its own scaffold](./02_working/030_the-gate-that-failed-its-own-scaffold.md)
      — unplanned: `check link-form` failed **this run's own summary**, on a code
      span that wraps. Two bugs, the second mine
- [x] [`010`](../../subtasks/110_tracker-ergonomics/010_plan-execution-needs-an-agent-log.md)
      — already shipped; re-verified on every surface it names, and its wording
      is what round 01 replaced with the trigger-and-floor form
- [x] [Four independent reviews](./02_working/040_four-independent-reviews.md) —
      24 findings, merged as a union. Three of them overturn a claim rounds 01–03
      made about their own work
- [x] [Stop hand-rolling the parser](./02_working/060_stop-hand-rolling-the-parser.md)
      — the second review round. The blanker is a parser now, the fixture is
      differential, and the `--group` gap I had dismissed by reasoning was hiding
      every agent-log check
- [x] [Decide and delete](./02_working/050_decide-and-delete.md) — the union acted
      on in one pass. The plugin ends **smaller** than before this run: one CLI verb,
      two scripts, one frontmatter field and one validator rule removed, and zero new
      tools added

# Out of Scope

The four broken-anchor findings and the static-host trailing-slash defect —
those belong to `2026-08-04-absolute-link-resolution` and were not touched.

# Outcome

**Four subtasks at `review`, every gate green — and two of this run's own three
deliverables were reversed by its own review.**

| | |
|---|---|
| `check link-form` | ✅ 0 errors, 52 warnings (unchanged throughout) |
| `check issues` | ✅ its two known unrelated warnings |
| `check skill-links` | ✅ 44 files, repo source tree |
| `code-spans.test.mjs` | ✅ 15 cases, **every one of them a case that failed** |
| `move` dry-run, 8 inbound links | ✅ all 8 rewritten |
| Production build | ✅ |
| Net surface change | **−1** CLI verb · **−2** scripts · **−1** frontmatter field · **−1** validator rule · **0** new tools |

## The one thing this run is actually about

**Every check written here was scoped to the thing it was checking, and each one
therefore passed.**

```
  the acceptance test  →  read the section it had just edited
  the blanker fixture  →  tested the case that motivated it
  the staleness gate   →  compared against a generator sharing its blind spot
```

That is this issue's own subject — *a rule that is technically correct and does
not fire* — reappearing inside the machinery written to enforce it. It was not
caught by any gate. It was caught by **four readers who had not written it**, one
of them with a shell.

## What each round holds that the diff does not

- **Round 01** — the acceptance test *was* the deliverable, and it was the defect.
  Re-running 14 verdicts proves nothing when the corpus is the paragraph you just
  wrote.
- **Round 02** — *derived over typed* was correct reasoning to a wrong conclusion.
  The precedent said a hand-typed table drifts; it did not say a generated one
  cannot be blind. Determinism is not the same property as coverage.
- **Round 03** — the first fix removed one false positive and introduced another,
  in a file whose subject is false positives.
- **Round 04** — the four lenses were chosen so no two could find the same thing
  by the same route. Three of the six highest findings came from exactly one
  reviewer each, and the two nobody reading could have found came from the one
  that ran things.
- **Round 05** — the plan included a new agent and a slash command. Sid killed
  both: *"agent-ks is meant to make things simple, not more complicated."* The
  check went into a skill that is already loaded, and the run ended smaller than
  it started.

## Reported, not fixed

- **No CI job or git hook runs `check issues`.** True, and making it one is a
  decision about this repo's workflow rather than about this run.
- **`check issues` does not descend into `--group` folders.** The staleness error
  it let through no longer exists, so it is now cosmetic — but the gap is real.
- **`020_wf_ship-the-split` round 14 is `in-progress` inside a finished run.**
  Closing a round is not this run's to do.
