---
title: "Rework the demo showcase issue onto the new structure"
status: review
---

# Overview

`2026-07-01-demo-issue-anatomy-showcase` is the fixture every UI change is
eyeballed against, and it is **57 files of the shape we are replacing** — six
standard slots, `101_` milestones, no `plans/`, and an `agent-memory/` still
built around the three-bucket model.

**Rework it, do not patch it.** A fixture that half-shows the new shape is worse
than one that shows the old one honestly, because a reviewer cannot tell which
parts are deliberate.

It also has to get **bigger**: it is the only place the framework demonstrates
its own anatomy, so every section the rewrite touches needs enough content there
to actually exercise the rendering.

**Done when** every section renders the new shape, the fixture exercises the
nesting and depth limits on purpose, and a Playwright pass confirms each section
page loads with the expected structure.

# References

- The shapes it must demonstrate:
  [What each section is for](../../notes/60_section-responsibilities.md) ·
  [The agent-log structure](../../notes/20_agent-log-structure.md) ·
  [The plans section](../../notes/50_plans-section-spec.md) ·
  [Agent memory after plans](./120_agent-memory-after-plans.md)
- Fixture: `default-docs/data/todo/2026-07-01-demo-issue-anatomy-showcase/`
- Blocked on the code: [`010`](./010_code-the-plans-section.md),
  [`015`](./015_code-agent-log-settings.md), [`090`](./090_section-registry.md)

# Todo list

## Content

- [x] **`plans/`** — at least two plans, one active and one closed, with stages
      in every status so the table renders every colour
- [x] **`agent-log/`** — rebuild on `summary.md` + `working/` + `debrief/`.
      Delete the six slots and the `101_` milestones
- [x] Demonstrate an **iteration with producer files** beside it — `010`, `011`,
      `012` — since that is the part of the numbering people get wrong
- [x] Demonstrate a **child agent log**, and the depth limit one level below it
- [x] **`agent-memory/`** — index + `knowledge/` + `history/`, and nothing that
      looks like a live plan
- [x] **More subtasks**, including a group folder with mixed statuses so the
      done/total count and the category filters have something to bite on
- [x] **More brainstorm** — a resolved thread with its `Resolved →` pointer, and
      a live one, so graduation is visible
- [x] Keep the existing deliberate edge cases (no-prefix files, deep nesting,
      the unknown kind code) — they are the fixture's job

## Verification

- [x] `./start build` clean
- [x] **Playwright pass** — see below
- [x] `agent-ks check issues` clean, and the two long-standing warnings on this
      fixture either fixed or documented as deliberate

# Outcomes and Next Steps

Reworked, not patched. The fixture went from **57 files of the old shape to 74 of
the new one**, and every section it demonstrates now exercises something specific.

## What it demonstrates now

| Fixture | Teaches |
|---|---|
| `010_lp_implement-sections/` | the **large end** — an iteration with two producer files (`010`/`011`/`012`), an iteration with none (`020`), a benchmark round, a **producer folder** (`040_research-codecs/` with a report and a `.mmd`), and a two-file `debrief/` |
| `020_au_edge-cases/` | an audit as **two halves of a pair** — `011` read, `012` executed, `010` merged them as a **union, not a vote**; one finding refuted on evidence |
| `030_rf_label-parser/` | the **small end** — two files, and **no `debrief/`**, called out as the correct shape |
| `040_wf_migration/` | a **child agent log**, and the depth budget: a producer folder at **level 4**, the deepest the loader accepts |
| `050_it_ui/` | `input-needed` with the question inline, and why a look is not delegable |
| `060_ex_spike/` | `dropped` — the run did not deliver; what it *found* is prose |
| `200_it_stress/` | numbering under load: 4 iterations, 6 files |
| `70_nt_test/` | two-digit prefix sorting as 70, and an **unknown kind code** degrading rather than throwing |
| `300`/`310` | status declared vs **absent** — the defined grey, distinct from `open` |
| `plans/01_` | a **closed** plan with its `## Closed` section, and a `dropped` stage |
| `plans/02_` | the **active** plan — derived, pinned — with `in-progress`/`blocked`/`open` stages |
| `subtasks/04_verify/` | a group as an **area**, with a `00_` index leaf and three different statuses |
| `agent-memory/` | index + `knowledge/` + `history/`, and **no decisions file** |
| `brainstorm/05_` | a graduated thread with its `Resolved →` marker and the option that lost |

## The Playwright pass — 24 assertions, all PASS

Harness committed at `verification/fixture-render/check.mjs`; it serves `dist/`
from inside its own process, so nothing outlives the run.

Routing (9 pages 200) · the Plans group exists with both plans listed and the
**active** one pinned (`● Hardening the edges`) · **clicking it navigates and
changes the DOM** · the plan table renders 3 rows with the status column
populated (`in-progress, blocked, open`) and **12 live count badges** · an agent
log shows `summary.md`, `working/`, `debrief/` and its child log, with the open
sub-doc marked active · a level-4 producer file renders and one level past the
cap **404s**.

**Console errors: 1, and it is the deliberate 404 probe.**

Everything felt — whether the dense tree *reads* at five levels — is in the
fixture as an `input-needed` subtask, not asserted by a headless browser.

## One decision taken inside the round

**The deliberate broken-`subtasks:`-reference fixture was removed after being
built.** It worked — the validator errored and the plan page rendered the red
warning — but it left `agent-ks check issues` exiting non-zero on this repo
forever, and a gate that can only be run with *"expect one error"* stops being
run.

The case is proven the other way instead: by mutating the rule and watching it
fire, which is the mutation-testing discipline rather than a permanently-broken
fixture. `plans/02_hardening-the-edges/30_*.md` now explains that reasoning in
place, so nobody re-adds it.

## The two long-standing warnings

- `70_nt_test/` — **deliberate**, and now documented as such in its own
  `summary.md`: an unknown kind code must degrade, and the warning firing is the
  validator doing its job.
- `2026-04-10-issues-layout/agent-log/exploration/` — a different issue's folder,
  out of this subtask's scope.

## Verified

`./start build` clean at **933 pages** (from 915); `agent-ks check issues`
**exit 0**, 0 errors.

# Details

## The Playwright pass — what it may and may not check

**Mechanical yes/no only.** Playwright confirms a thing *happened*; whether the
result reads well is Sid's call and cannot be delegated to a headless browser.

| Check with Playwright | Do not |
|---|---|
| Every section page loads without a console error | Judge whether a layout looks right |
| The Plans sidebar group exists and the active plan is pinned in it | Judge spacing, colour or density |
| The plan table renders one row per stage, with the status column populated | Assert on exact pixel positions |
| An agent log page shows `summary.md`, `working/` and `debrief/` | Compare against a screenshot as a pass condition |
| The deep-nesting fixture stops rendering at the depth cap | Time anything |

Anything the pass cannot decide goes to Sid as a named artefact, not as a
paragraph describing it.

## Why the fixture has to grow

The current fixture predates half the sections it is meant to demonstrate, and
its `agent-log/` folders are thin — one or two files each. That is enough to
prove a folder renders, and not enough to prove the **numbering** does, which is
where the new shape is most likely to be implemented subtly wrong.

The specific case to build: one iteration with several producer files beside it
(`010`, `011`, `012`), plus one iteration with none (`020`). If the sidebar
renders those four as four peers with no visible relationship, the numbering is
carrying meaning the UI is throwing away — and it is better to learn that here
than in a live issue.

## Blocked on

The code has to exist before a fixture can exercise it. `010` (the plans
section), `015` (per-log settings) and `090` (the section registry) all land
first.
