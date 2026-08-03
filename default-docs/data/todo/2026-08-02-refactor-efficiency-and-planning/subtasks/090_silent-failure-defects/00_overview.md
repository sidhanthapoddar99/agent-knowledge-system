---
title: "Silent-failure defects — three gates that passed what they should have refused"
status: in-progress
---

# Overview

**Three defects found in the same week, all with one shape: a wrong answer that
is indistinguishable from a right one until someone looks.** Nothing errored,
nothing warned, and every surface rendered normally.

- [`010`](./010_using-with-ai-page-stale.md) — a guide page describing a world
  that no longer exists. It reads as current because nothing in a doc can go red.
- [`020`](./020_config-page-missing-data-dir.md) — a page whose data folder does
  not exist builds green and renders an **empty section**, visually identical to
  a section whose content was deleted on purpose.
- [`030`](./030_skill-links-checks-the-wrong-tree.md) — the link gate resolved its
  scan root from its own location on disk, so it checked the *installed* plugin
  and reported clean over files it had never read.

**Done when** all three are fixed and each has a mechanical guard that fails when
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
- [x] `030` — the skill-link gate now anchors on the current directory, falls
      back to the installed copy **with a warning**, and names which tree it read
- [ ] Sid to sign off — all three are at `review`; `done` is his

# Outcomes and Next Steps

**All three at `review`, fixed and shipped in `0.2.1`.** `done` is Sid's call.

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
