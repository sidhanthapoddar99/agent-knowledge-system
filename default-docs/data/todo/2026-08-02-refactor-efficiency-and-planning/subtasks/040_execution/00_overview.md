---
title: "Execution"
status: open
---

# Overview

The build half of the issue: turn the two brainstorms' decisions into shipped
framework code, CLI, skills, docs, and a fix to the consumer project that
surfaced the problem.

**Half the gate has lifted.** The plans-section shape is **settled** —
[the spec](../../notes/50_plans-section-spec.md) — so `010`, `015`, `070` and
`090` can start. Everything touching the **skills** still waits on
[Brainstorm: cutting the recording overhead](../020_brainstorm-efficiency-remedies.md),
because writing the rules before deciding them is how you get a section the skill
then has to apologise for.

# References

- Measured basis: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
- Design gates: `subtasks/020_brainstorm-efficiency-remedies`,
  `subtasks/030_brainstorm-plans-section`
- Test bed for the section work: `2026-07-01-demo-issue-anatomy-showcase`
- Ships as: [Version bump — engine 0.1.3 + plugin 0.6.8](../050_version-bump.md)

# Subtasks

These are **execution** work. That is all this grouping says — it is a category,
not a schedule. Order and blocking belong in a plan
([why](../../brainstorm/03_options_plans-as-references.md)), and the numbers
below are stable ids, not a sequence.

> [!NOTE]
> This block used to read *"Reading order is execution order"* and list a
> dependency chain — the exact confusion
> [`080`](./080_skill-subtasks-by-category.md) exists to cure, in the issue that
> cures it. Fixed 2026-08-02. The dependency it stated is real and now lives in
> *Two ordering rules that are not obvious*, below, until plans can hold it.

| # | Subtask | Status |
|---|---------|--------|
| 010 | [Code the plans section](./010_code-the-plans-section.md) — framework sections, routes, CLI, validator | open |
| 015 | [Code per-agent-log settings.json](./015_code-agent-log-settings.md) — status as data; **ships independently of the plans section** | open |
| 020 | [Update ~/.claude/CLAUDE.md](./020_update-global-claude-md.md) — the global operating rules | open |
| 030 | [Skill: the plans section](./030_skill-plans-section.md) — teach `plans/`, delete the old shape | open |
| 040 | [Skill: the proportionality rules](./040_skill-efficiency-rules.md) — the proportionality rules | open |
| 050 | [Docs: user-guide + bundled guide](./050_docs-update-plans-section.md) — user-guide prose + bundled `guide.ts` | open |
| 060 | [Sidequest: NeuraSutra's memory](./060_sidequest-neurasutra-memory.md) — fix the consumer that surfaced this | open |
| 070 | [UI: Subtasks and Overview have no icon](./070_ui-subtasks-overview-icons.md) — **not gated**; do it in the same pass as the Plans icon | open |
| 080 | [Skill: subtasks by category, not order](./080_skill-subtasks-by-category.md) — the other half of the plans idea | open |
| 090 | [Framework: a section registry](./090_section-registry.md) — **after** `010`, never merged into it | open |
| 100 | [Migration: agent-log status vocabulary](./100_migration-script.md) — the mandatory half of the release; ships with [`050`](../050_version-bump.md) | open |

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

## A CLI defect found while scaffolding this issue — fix it in `010`

`agent-ks issue new-subtask --group 040_execution` **sanitises the underscore to
a dash** and silently creates a *second* folder, `040-execution/`, beside the
existing `040_execution/`. The same defect exists in `new-agent-log --group`.
It is currently worked around by scaffolding and then `mv`-ing, which is a
trap for anyone who does not already know.

The fix belongs with `010` because both touch the same path-sanitising helper.
The sanitiser should preserve `_` — it is the canonical ordering-prefix separator
in this framework, so stripping it is straightforwardly wrong.
