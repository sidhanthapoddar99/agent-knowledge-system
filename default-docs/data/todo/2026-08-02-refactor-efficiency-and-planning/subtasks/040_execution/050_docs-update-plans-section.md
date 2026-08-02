---
title: "Docs — define what every section is FOR, in the guide and the user-guide"
status: open
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

- [ ] `guide.ts` — rewrite the **section one-liners** (~L96–103) to the seven
      purposes
- [ ] `guide.ts` — fix the **routing line** (~L114): *"the plan → Subtasks"* is
      wrong, the plan is `plans/`. **Leave *"how it actually went → Agent log"* —
      that half is correct**
- [ ] `guide.ts` — replace the `## Subtasks` opener (~L183): a subtask is
      **scope**, not the plan, and *"agent-log records the how"* reads as
      *method*, which is the thing it must not carry
- [ ] `guide.ts` — rewrite `## Agent log` as **execution + outcome**: the run is
      carried out and made visible there, the outcome is recorded there, the
      scope stays in the subtask, and its todo list references subtasks or plan
      stages
- [ ] `guide.ts` — add `## Plans`, and the section to the anatomy tree
- [ ] `guide.ts` — the six standard slots, the milestone block and the milestone
      frontmatter table all go (they no longer exist)
- [ ] User-guide — the same seven purposes on the anatomy overview, and a
      *"what does NOT belong here"* line on each per-section page
- [ ] User-guide — the design-philosophy page: why the plan is not agent-memory
- [ ] Grep the user-guide for `agent-memory/plans` and fix every hit
- [ ] Rebuild and read the Guide panel on the demo fixture
- [ ] `agent-ks check section` / `check issues` clean

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
