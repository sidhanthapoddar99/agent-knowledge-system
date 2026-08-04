---
title: "Silent-failure defects — tools that passed what they should have refused"
status: done
---

# Overview

**Defects with one shape: a wrong answer that is indistinguishable from a right
one until someone looks.** Nothing errored, nothing warned, and every surface
rendered normally.

- [`010`](./010_using-with-ai-page-stale.md) — a guide page describing a world
  that no longer exists. It reads as current because nothing in a doc can go red.
- [`020`](./020_config-page-missing-data-dir.md) — a page whose data folder does
  not exist builds green and renders an **empty section**, visually identical to
  a section whose content was deleted on purpose.
- [`030`](./030_skill-links-checks-the-wrong-tree.md) — the link gate resolved its
  scan root from its own location on disk, so it checked the *installed* plugin
  and reported clean over files it had never read.

And a fourth, which is `030`'s own fix caught doing the same thing:

- [`040`](./040_two-commands-not-one-guess.md) — the walk-up that fixed `030`
  infers which tree you mean from where you are standing, and in **consumer mode**
  it guesses wrong: the framework clone sits inside the user's project, so it
  scans bundled skills and labels them `[source tree]`. Replaced with two explicit
  commands, `agent-ks` and `agent-ks-dev`.

And a fifth, found while moving an artifact between issues:

- [`050`](./050_move-orphans-the-meta-sidecar.md) — `agent-ks move` moves a
  first-class `.html` or diagram and **leaves its `.meta.json` sidecar behind
  under the old name**, reporting `moved 1 file(s)` and nothing else. `check.mjs`
  already knows sidecars exist; `move.mjs` has never heard of them.

**Done when** every one is fixed and each has a mechanical guard that fails when
the defect is reintroduced — not merely a note describing it.

# References

- The audit round that surfaced the first two:
  [`070` — audit follow-ups](../070_audit-followups/)
- The fourth instance of the same shape, which became its own group:
  [`100` — link integrity](../100_link-integrity/)
- The release that shipped the fixes for `020` and `030`: `releases/0.2.1.md`

# Todo list

- [x] `010` — the using-with-AI page rewritten against reality, every command
      executed rather than transcribed
- [x] `020` — `loadSiteConfig()` now refuses a `pages.*.data` path that does not
      exist, reporting every offender at once
- [x] `030` — the skill-link gate stopped reading the installed plugin. Its own
      fix — a walk-up from the current directory — was itself a guess, corrected
      by [`040`](./040_two-commands-not-one-guess.md)
- [x] Sid signed off on all three, 2026-08-03 — `010`, `020` and `030` are `done`
- [x] `040` — two commands instead of one guess, the walk-up reverted, and
      `agent-ks --version` built after the record claimed it. Closed by the
      reinstall: run from inside this repo, `agent-ks` now reports the plugin
      cache where it used to report the repo

# Outcomes and Next Steps

**`010`, `020` and `030` closed by Sid on 2026-08-03**, all three fixed and
shipped in `0.2.1`. **`040` is open** — the correction to `030`'s resolution
logic, agreed the same day and not yet started.

Two things surfaced while closing them, both recorded in the subtasks rather than
only here:

- **`020`'s hard-stop was applied before Sid ruled on it.** The subtask argues
  both sides and concludes it is his call; it was implemented inline anyway. He
  ruled in favour, so the outcome is right and the sequence was backwards.
- **`030`'s fix carried the defect it was fixing.** Found by Sid asking whether
  these were real issues or presumptions — the answer was that the *defects* were
  observed fact, and the *fix* contained the only unexamined inference. That is
  what `040` is for.

Each fix was control-tested in both directions — the guard must fire on the
defect and stay quiet on correct input. That mattered concretely: the first draft
of `020`'s guard asserted `isDirectory()` and refused **two working pages**
(`home` and `about` point at YAML *files*, which is valid). The control test
caught it; review had not.

# Details

## Why these belong together

The common mechanism is not "a bug in a checker". It is that **the failure mode
produces plausible output**:

| # | What was wrong | What it looked like |
|---|---|---|
| `010` | Documentation describing a retired model | A normal, confident page |
| `020` | A section with no content directory | An empty section — same as an intentionally empty one |
| `030` | A gate reading a tree nobody had edited | `all checks passed` |

A gate that crashes gets fixed the same day. A gate that reports success over
nothing can go unnoticed indefinitely — `030` meant **every "skill-links clean"
line recorded in this issue described a copy nobody had edited.**

## The rule these three produced

Stated here because it is what the group is *for*, and it generalises past these
three:

**A check that cannot see its subject must fail, never pass.** Concretely: assert
a non-zero count of things examined, and treat zero as an error. `030` fell into
this twice. The link checker written afterwards
([`100/070`](../100_link-integrity/070_reframe-the-link-checker.md)) has the
assertion built in for exactly this reason — a run that collected nothing reports
failure, not `all clear`.
