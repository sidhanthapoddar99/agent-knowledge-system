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
| 020 | [Update ~/.claude/CLAUDE.md](./020_update-global-claude-md.md) — the global operating rules | input-needed |
| 030 | [Skill: the plans section](./030_skill-plans-section.md) — teach `plans/`, delete the old shape | review |
| 040 | [Skill: the responsibility split](./040_skill-efficiency-rules.md) — the split, plus the agent-log rewrite. **The one that fixes the measured problem** | review |
| 050 | [Docs: user-guide + bundled guide](./050_docs-update-plans-section.md) — user-guide prose + bundled `guide.ts` | review |
| 070 | [UI: Subtasks and Overview have no icon](./070_ui-subtasks-overview-icons.md) — **not gated**; do it in the same pass as the Plans icon | review |
| 080 | [Skill: subtasks by category, not order](./080_skill-subtasks-by-category.md) — the other half of the plans idea | review |
| 090 | [Framework: a section registry](./090_section-registry.md) — **after** `010`, never merged into it | review |
| 100 | [Migration: agent-log status vocabulary](./100_migration-script.md) — the mandatory half of the release; ships with [`050`](../050_version-bump.md) | in-progress |
| 110 | [Sweep: delete superseded wording](./110_superseded-wording-sweep.md) — and write the rule that replaces it | review |
| 120 | [Agent memory after plans](./120_agent-memory-after-plans.md) — what `agent-memory/` becomes once `plans/` leaves it | review |
| 130 | [Audit: three neutral readers](./130_independent-skill-audit.md) — old skill vs new; **stored, not acted on**. Last | review |
| 140 | [Rework the demo showcase](./140_rework-demo-showcase.md) — the fixture, onto the new structure, with a Playwright pass | review |

**Not in this group:** the NeuraSutra sidequest moved out to the top level as
[`060`](../060_sidequest-neurasutra.md). It targets a different pair of repos,
runs after everything here, and now covers the consumer's source comments as well
as its rule files. The audit's own follow-ups went to a new group,
[`070_audit-followups/`](../070_audit-followups/00_overview.md) — findings are not
execution work until someone decides to take them.

# Conclusions and Summary

**Twelve of fourteen are at `review`.** Two are not, both deliberately: `020` is
`input-needed` because it proposes a diff to `~/.claude/CLAUDE.md`, and that file
is Sid's; `100` went **back** to `in-progress` on 2026-08-03 when three todo
items were added to it after its original scope was already complete.

The `100` reopening is worth a line rather than a silent status flip. Dropping
the `iteration:` frontmatter field moved the number into the filename and left
nothing comparing the two — and **the migration is the only pass that ever sees
both values**, so the disagreement check has to happen there or not at all.

**The gates:** `./start build` clean at 948 pages; the repo's own issue validator
clean over 51 issue folders; the four new scaffolders smoke-tested end to end.
The link checker's 4 reported errors are all illustrative paths inside one code
fence — see the run's
[summary](../../agent-log/020_wf_ship-the-split/summary.md) for why that is
stated rather than ticked.

**What the audit changed about this group's own claim to be finished.** `130`
came back with the new skill winning readability and structure unanimously, and
losing the overall verdict 2–1 on one ground: the worked examples under
`60_examples/` were never migrated, so they still teach the model this group
deleted. Two other execution defects are reproduced —
[nine CLI examples that error](../070_audit-followups/050_cli-examples-do-not-run.md)
and a
[design gap in what a stage's `status` means](../070_audit-followups/040_stage-status-semantics.md).

So the honest summary is: **the design survived three independent reads
unchallenged, and the execution has seven known defects, none of them acted on.**
That is what `130` was for, and it is a better position than a clean report would
have been.

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
