---
title: "Rework the demo showcase issue onto the new structure"
status: blocked
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

- [ ] **`plans/`** — at least two plans, one active and one closed, with stages
      in every status so the table renders every colour
- [ ] **`agent-log/`** — rebuild on `summary.md` + `working/` + `debrief/`.
      Delete the six slots and the `101_` milestones
- [ ] Demonstrate an **iteration with producer files** beside it — `010`, `011`,
      `012` — since that is the part of the numbering people get wrong
- [ ] Demonstrate a **child agent log**, and the depth limit one level below it
- [ ] **`agent-memory/`** — index + `knowledge/` + `history/`, and nothing that
      looks like a live plan
- [ ] **More subtasks**, including a group folder with mixed statuses so the
      done/total count and the category filters have something to bite on
- [ ] **More brainstorm** — a resolved thread with its `Resolved →` pointer, and
      a live one, so graduation is visible
- [ ] Keep the existing deliberate edge cases (no-prefix files, deep nesting,
      the unknown kind code) — they are the fixture's job

## Verification

- [ ] `./start build` clean
- [ ] **Playwright pass** — see below
- [ ] `agent-ks check issues` clean, and the two long-standing warnings on this
      fixture either fixed or documented as deliberate

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
