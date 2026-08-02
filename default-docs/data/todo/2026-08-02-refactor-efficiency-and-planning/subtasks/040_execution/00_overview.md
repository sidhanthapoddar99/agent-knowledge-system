---
title: "Execution"
status: in-progress
---

# Overview

The build half of the issue: turn the two brainstorms' decisions into shipped
framework code, CLI, skills, docs, and a fix to the consumer project that
surfaced the problem.

**The gate has fully lifted.** Both brainstorms closed 2026-08-02 —
[the plans section](../../notes/50_plans-section-spec.md) and
[what each section is for](../../notes/60_section-responsibilities.md). Every
subtask here is startable except `130` and `140`, which need something to exist
before they can check it.

# References

- Measured basis: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
- Design gates: `subtasks/020_brainstorm-efficiency-remedies`,
  `subtasks/030_brainstorm-plans-section`
- Test bed for the section work: `2026-07-01-demo-issue-anatomy-showcase`
- Ships as: [Version bump — engine 0.1.3 + plugin 0.7.0](../050_version-bump.md)

# Subtasks

These are **execution** work. That is all this grouping says — it is a category,
not a schedule. Order and blocking belong in a plan
([why](../../brainstorm/03_options_plans-as-references.md)), and the numbers
below are stable ids, not a sequence.


| # | Subtask | Status |
|---|---------|--------|
| 010 | [Code the plans section](./010_code-the-plans-section.md) — framework sections, routes, CLI, validator | review |
| 015 | [Code per-agent-log settings.json](./015_code-agent-log-settings.md) — status as data; **ships independently of the plans section** | review |
| 020 | [Update ~/.claude/CLAUDE.md](./020_update-global-claude-md.md) — the global operating rules | open |
| 030 | [Skill: the plans section](./030_skill-plans-section.md) — teach `plans/`, delete the old shape | open |
| 040 | [Skill: the responsibility split](./040_skill-efficiency-rules.md) — the split, plus the agent-log rewrite. **The one that fixes the measured problem** | open |
| 050 | [Docs: user-guide + bundled guide](./050_docs-update-plans-section.md) — user-guide prose + bundled `guide.ts` | open |
| 070 | [UI: Subtasks and Overview have no icon](./070_ui-subtasks-overview-icons.md) — **not gated**; do it in the same pass as the Plans icon | review |
| 080 | [Skill: subtasks by category, not order](./080_skill-subtasks-by-category.md) — the other half of the plans idea | open |
| 090 | [Framework: a section registry](./090_section-registry.md) — **after** `010`, never merged into it | review |
| 100 | [Migration: agent-log status vocabulary](./100_migration-script.md) — the mandatory half of the release; ships with [`050`](../050_version-bump.md) | open |
| 110 | [Sweep: delete superseded wording](./110_superseded-wording-sweep.md) — and write the rule that replaces it | open |
| 120 | [Agent memory after plans](./120_agent-memory-after-plans.md) — what `agent-memory/` becomes once `plans/` leaves it | open |
| 130 | [Audit: three neutral readers](./130_independent-skill-audit.md) — old skill vs new; **stored, not acted on**. Last | blocked |
| 140 | [Rework the demo showcase](./140_rework-demo-showcase.md) — the fixture, onto the new structure, with a Playwright pass | blocked |

**Not in this group:** the NeuraSutra sidequest moved out to the top level as
[`060`](../060_sidequest-neurasutra.md). It targets a different pair of repos,
runs after everything here, and now covers the consumer's source comments as well
as its rule files.

# Conclusions and Summary

> [!IMPORTANT]
> **PLACEHOLDER** — filled when the series closes.

# Details

## Two ordering rules that are not obvious

**Skill before consumer.** `060` must land *after* `030` and `040`. Consumer
repos' `memory/` files are required to **link** to the upstream rules, never copy
them — so fixing the consumer first would create exactly the stale-copy problem
the precedence rule exists to prevent.

**`guide.ts` moves with the skill.** The bundled anatomy guide
(`astro-doc-code/src/layouts/issues/default/guide.ts`) is the plugin-independent
twin of the `agent-ks-issues` skill. It is rendered on every issue's Guide panel
whether or not the plugin is installed, so a skill change that leaves it stale
ships a contradiction to every consumer. `050` covers it; do not let it slip.

## A CLI defect found while scaffolding this issue — fixed in `010`

`--group 040_execution` sanitised the underscore to a dash and silently created a
*second* folder beside the existing one. `sanitizeGroupSegment` now preserves `_`,
which is the canonical ordering-prefix separator in this framework.
