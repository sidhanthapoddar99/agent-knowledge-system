---
title: "Rework the demo showcase issue onto the new structure"
status: done
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
- [x] **`agent-log/`** — rebuild on the three slots. Delete the six slots and the
      `101_` milestones. **Renamed 2026-08-03** to `01_summary.md` +
      `02_working/` + `03_debrief/`
      ([the numbering spec](../../notes/80_agent-log-numbering-spec.md)), so the
      fixture has to be renamed with the rest of the tracker
- [x] Demonstrate an **iteration with producer files** beside it — `010`, `011`,
      `012` — since that is the part of the numbering people get wrong
- [x] Demonstrate a **child agent log**, and the depth limit one level below it
- [x] **`agent-memory/`** — index + `knowledge/` + `history/`, and nothing that
      looks like a live plan
- [x] **More subtasks**, including a group folder with mixed statuses so the
      done/total count and the category filters have something to bite on
- [x] **More brainstorm** — a resolved thread with its `Resolved →` pointer, and
      a live one, so graduation is visible
- [x] Keep the deliberate edge cases that cost nothing — no-prefix files, deep
      nesting. **The unknown kind code was later removed** on the second pass;
      see *The second pass* below

## Verification

- [x] `./start build` clean
- [x] **Playwright pass** — see below
- [x] `agent-ks check issues` clean, and the two long-standing warnings on this
      fixture either fixed or documented as deliberate

# Outcomes and Next Steps

Reworked, not patched — then reduced on a second pass. The fixture reached **74
files of the new shape**, and the agent-log half was then cut to three logs
because breadth had become the problem rather than the point.

## What it demonstrates now

| Fixture | Teaches |
|---|---|
| [The section loop](../../../2026-07-01-demo-issue-anatomy-showcase/agent-log/010_lp_implement-sections/01_summary.md) | the **large end** — six iterations, two producer files beside their round (`011`, `012`), a benchmark round, a **producer folder** with a report and a `.mmd`, a two-file debrief, an `input-needed` round, and a **child agent log** at level 4 whose status is independent of its parent |
| [The edge-case audit](../../../2026-07-01-demo-issue-anatomy-showcase/agent-log/020_au_edge-cases/01_summary.md) | an audit as **two halves of a pair** — one read, one executed, merged as a **union, not a vote**; one finding refuted on evidence and kept as refuted |
| [The abandoned spike](../../../2026-07-01-demo-issue-anatomy-showcase/agent-log/030_ex_one-pass-spike/01_summary.md) | a run that **did not land** — the custom `ex` kind, `status: dropped`, `# State` as a `> [!WARNING]`, and both signals a failed run needs |
| `plans/01_` | a **closed** plan with its `## Closed` section, and a `dropped` stage |
| `plans/02_` | the **active** plan — derived, pinned — with `in-progress`/`blocked`/`open` stages |
| `subtasks/04_verify/` | a group as an **area**, with a `00_` index leaf and three different statuses |
| `agent-memory/` | index + `knowledge/` + `history/`, and **no decisions file** |
| `brainstorm/05_` | a graduated thread with its `Resolved →` marker and the option that lost |

## The Playwright pass — 24 assertions, all PASS

Harness committed at `verification/fixture-render/check.mjs`; it serves `dist/`
from inside its own process, so nothing outlives the run.

Routing (9 pages 200) · the Plans group exists with both plans listed and the
**active** one marked (`Hardening the edges`, bold) · **clicking it navigates and
changes the DOM** · the plan table renders 3 rows with the status column
populated (`in-progress, blocked, open`) · an agent
log shows its summary, working and debrief slots and its child log, with the open
sub-doc marked active · a level-4 producer file renders and one level past the
cap **404s**.

**The harness asserts those three by path, so confirm it was repointed with the
2026-08-03 rename** to `01_summary.md` / `02_working/` / `03_debrief/` — the
rename is
[number the agent log's own slots](../100_agent-log-slot-numbering.md), whose
todo list does not name this harness. Same class of edit as the one-path repoint
the fixture consolidation already cost it, below, and it fails loudly if missed.

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

## The second pass — ten agent logs down to three

**Sid, 2026-08-03:** *"reduce the amount in the demo, but make it proper… not
just one one two two files. Have three agent logs that make it proper."*

The first pass optimised for coverage and produced ten logs, six of which existed
only to make a loader branch fire. That is a coverage matrix, not a fixture: a
reader opening it to learn the shape met six examples a real run would never
produce. Cut to the three in the table above — **50 files to 28, none of them a
stub** — with every summary rewritten into the revised shape
([`# State` as a callout, `# Todo` as links carrying detail, `# Outcome` as a
detail area](../../notes/20_agent-log-structure.md)).

Two coverage items were **deliberately given up**, and it is not free:

- **Folder-level "status absent renders grey"** had an entire fake agent log to
  exercise one loader branch.
- **The undefined kind code** (`70_nt_test/`) tripped a validator warning on
  every run, permanently. A fixture that keeps the gate at *"1 warning, ignore
  that one"* trains people to ignore warnings, which costs more than the branch
  it covered. That reverses the "keep it, it is deliberate" call recorded here on
  the first pass.

The narrative, and the four inbound links the consolidation broke, are in
[the fixture round](../../agent-log/020_wf_ship-the-split/02_working/100_demo-showcase-agent-logs.md).

## Verified

`./start build` clean at **935 pages**; the repo's own validator at 51 issue
folders with **1 warning** — down from 2, since removing the unknown-kind fixture
removed the warning it existed to trigger. The one that remains belongs to a
different issue.

**The Playwright pass was re-run against the reduced fixture: 24 assertions, all
PASS.** One path in the harness needed repointing — the child agent log moved
from `040_wf_migration/010_wf_codec-migration/` to
`010_lp_implement-sections/100_wf_codec-migration/` — and that one edit is the
whole cost of the consolidation to the harness. Console errors: 1, and it is
still the deliberate past-the-cap 404 probe.

# Details

## The Playwright pass — what it may and may not check

**Mechanical yes/no only.** Playwright confirms a thing *happened*; whether the
result reads well is Sid's call and cannot be delegated to a headless browser.

| Check with Playwright | Do not |
|---|---|
| Every section page loads without a console error | Judge whether a layout looks right |
| The Plans sidebar group exists and the active plan is marked in it | Judge spacing, colour or density |
| The plan table renders one row per stage, with the status column populated | Assert on exact pixel positions |
| An agent log page shows `01_summary.md`, `02_working/` and `03_debrief/` | Compare against a screenshot as a pass condition |
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
