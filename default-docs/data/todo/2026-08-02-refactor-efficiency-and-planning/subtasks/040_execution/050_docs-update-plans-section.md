---
title: "Docs — define what every section is FOR, in the guide and the user-guide"
status: review
---

# Overview

State what **each** section means, in the two places a human reads it: the
framework-bundled anatomy guide on every issue's **Guide** panel
(`guide.ts`), and the user-guide prose under `19_issues/`.

**Broadened 2026-08-02** from *document the plans section* to *define every
section*. The plans section was only ever one symptom; the cause is that no
document says what any section is exclusively for, so every section holds
everything.

**Done when** a reader who has never seen the tracker can take an arbitrary
paragraph of work-in-progress and place it in the right section from the Guide
panel alone, and the guide no longer states any rule the responsibility split
overturned.

# References

- **The source this restates:**
  [What each section is for](../../notes/60_section-responsibilities.md) —
  the seven one-word purposes, what each section must not hold, and the two
  overturned rules
- Agent-log shape: [the agent-log structure](../../notes/20_agent-log-structure.md)
- Plans shape: [the plans section](../../notes/50_plans-section-spec.md)
- Skill twin that must not contradict this:
  [Skill — teach the plans section](./030_skill-plans-section.md)
- Targets: `astro-doc-code/src/layouts/issues/default/guide.ts`,
  `default-docs/data/user-guide/19_issues/`

# Todo list

- [x] `guide.ts` — rewrite the **section one-liners** (~L96–103) to the seven
      purposes
- [x] `guide.ts` — fix the **routing line** (~L114): *"the plan → Subtasks"* is
      wrong, the plan is `plans/`. **Leave *"how it actually went → Agent log"* —
      that half is correct**
- [x] `guide.ts` — replace the `## Subtasks` opener (~L183): a subtask is
      **scope**, not the plan, and *"agent-log records the how"* reads as
      *method*, which is the thing it must not carry
- [x] `guide.ts` — rewrite `## Agent log` as **execution + outcome**: the run is
      carried out and made visible there, the outcome is recorded there, the
      scope stays in the subtask, and its todo list references subtasks or plan
      stages
- [x] `guide.ts` — add `## Plans`, and the section to the anatomy tree
- [x] `guide.ts` — the six standard slots, the milestone block and the milestone
      frontmatter table all go (they no longer exist)
- [x] User-guide — the same seven purposes on the anatomy overview, and a
      *"what does NOT belong here"* line on each per-section page
- [x] User-guide — the design-philosophy page: why the plan is not agent-memory
- [x] Grep the user-guide for `agent-memory/plans` and fix every hit
- [x] Rebuild and read the Guide panel on the demo fixture
- [x] `agent-ks check section` / `check issues` clean

# Outcomes and Next Steps

Both twins updated in the same pass, so neither ships a contradiction.

## `guide.ts` — the bundled anatomy guide

Rewritten where it stated the old shapes: the section one-liners became the
**seven-purpose table**, the routing line became **the four boundaries**, the
anatomy tree gained `plans/` and the new agent-log shape, and the whole
**milestone block** (`MNN_` naming, the `#N` badge tinting, the milestone
frontmatter table, the six standard slots) is gone.

Two overturned statements corrected, and in **different directions**, which is
the part that was easy to get wrong:

- *"Subtasks are the plan"* → subtasks are **scope**; `plans/` is the plan.
- *"The agent log records the how"* → it records **how it went** — the execution
  and the outcome. It does not record how to do the work, which is the subtask's.

New `## Plans` block; `## Agent memory` down to two buckets with the reason the
index must not grow a state section; `## Notes` restated as **conclusions**, with
the line that catches the most common duplication — *a note that reads like a
work order is a subtask*.

## `default-docs/data/user-guide/19_issues/`

| Page | Change |
|---|---|
| `05_sub-docs/05_agent-log.md` | **Rewritten** — the whole new shape, both worked examples, the `settings.json` contract, the four explicit cases, decision routing |
| `05_sub-docs/09_plans.md` | **New** — the section had no user-guide page at all |
| `05_sub-docs/07_agent-memory.md` | Two buckets; ~150 lines of plan-file documentation removed |
| `01_overview.md`, `03_folder-structure.md` | trees, section table and the numbering note |
| `07_ui/02_detail-view.md` | how the sidebar renders agent-log status and the pinned plan |
| `04_setup/02_vocabulary.md`, `06_lifecycle-and-review.md`, `10_setup-new-tracker.md`, `01_per-issue.md`, `02_design-philosophy.md` | the retired labels |
| `05_sub-docs/04_notes.md`, `08_glossary.md` | vocabulary |

## Verified

- `./start build` clean, **933 pages**.
- Vocabulary sweep across the whole user guide returns no stale term; the one
  remaining hit is *"Branch-scoped WIP"* in the design-philosophy trade-off
  table, which is ordinary English.
- The guide panel renders from `guide.ts` on every issue page — confirmed live,
  no console errors.

# Details

## The guide currently teaches the defect

`guide.ts:183` reads *"Subtasks — the plan, the **what**; agent-log records the
**how**."*

- *"Subtasks are the plan"* — wrong. `plans/` is the plan; a subtask is **scope**.
- *"agent-log records the **how**"* — wrong in the sense the word carries there.
  It reads as **method**, and a log written to that instruction narrates how the
  code was written. The agent log records **how it went** — execution and
  outcome — which is a different thing.

The routing line at ~L114 has the first error and not the second: *"the plan →
Subtasks"* is wrong, *"how it actually went → Agent log"* is right and should
survive the rewrite.

**The distinction to hold on to: execution belongs to the agent log; scope and
method do not.**

## Why `guide.ts` is not optional and not a duplicate

Per the project's own rule, `guide.ts` is the **plugin-independent twin** of the
`agent-ks-issues` skill — a static anatomy legend compiled into the site, present
at every build whether or not anyone has the plugin installed. The skill carries
the manual; `guide.ts` carries the map.

That makes it the one place where restating content is correct rather than
wasteful, and it also makes it the easiest thing in this issue to forget. A skill
change that leaves it stale ships a visible contradiction to every consumer site.

## Scope boundary

Prose and the legend only. Routing, sidebar and panel work is
[`010`](./010_code-the-plans-section.md) — if this subtask finds itself editing
an `.astro` file, it has drifted.
