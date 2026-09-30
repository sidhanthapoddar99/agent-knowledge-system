---
title: "Docs: the issue tracker"
status: open
---

The tracker is agentks's most distinctive content type and today's largest user-guide section (about twenty pages under `19_issues/`). This leaf rewrites it for 1.0: the issue folder anatomy, the lifecycle, the workflows, the views and filters, and working with AI. The ideas carry over; every command becomes `agentks …`, and the UI pages describe the new issues layout. Added to the group because the tracker is too large to share a leaf with the other content types.

# 01 To Do
- [ ] **`30_issue-tracker/01_overview.md`** — what the tracker is, the four content types table, why it is built for AI-augmented teams.
- [ ] **Design philosophy** — the 1–4 person AI-augmented team, no sprints or release buckets, why `review` exists. Carry the argument from today's page.
- [ ] **Folder anatomy** — `issue.md`, `settings.json`, `brainstorm/`, `notes/`, `plans/`, `subtasks/`, `agent-log/`, `agent-memory/`, `comments/`, `glossary.md`: what each holds and never holds.
- [ ] **Setup** — per-issue `settings.json`, the tracker-wide vocabulary, draft issues, several trackers in one project.
- [ ] **Lifecycle and review** — the eight statuses in four categories, who may close (only the person who owns the work marks `done` or `dropped`), `superseded` with its `→` line.
- [ ] **Views** — the list view (state tabs, filters, preset views, URL state) and the detail view, as rendered by the 1.0 issues layout ([100/25](../100_layouts/25_issues-layouts.md)).
- [ ] **Workflows** — create an issue, work an issue, review and close; each with the `agentks issue …` commands.
- [ ] **Using with AI** — the skills, the CLI, the rules an agent follows. Present tense only.
- [ ] **Verify** every command example by running it against a fixture tracker.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- The engine and the CLI are the source of truth for statuses, log kinds and templates. Check each claim with `agentks help` or `agentks check issues`, not from today's pages.
- Keep the tracker skill and these pages as one set: the skill is the full manual, the pages are the user-facing summary ([95](./95_skills-update.md)).

## Done when
- The section exists under `docs/data/user-guide/30_issue-tracker/` and renders with the new engine.
- Every status, log kind and command named on these pages exists in the 1.0 binary (checked against `agentks help --json`).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/30_issue-tracker/`.
- **Read first:**
  - Today's section, the main source: [user-guide/19_issues](../../../../user-guide/19_issues) (overview, design philosophy, folder structure, setup, sub-docs, UI, workflows, using with AI).
  - The agent-ks-issues skill in this repository's plugin: [plugins/agent-ks/skills/agent-ks-issues](../../../../../../plugins/agent-ks/skills/agent-ks-issues).
  - [Content format](../../notes/02_engine/01_content-format.md) — the tracker rules the engine enforces.
  - Absorbed: [docs-phase-2 subtask 01](../../../2026-04-19-docs-phase-2/subtasks/01_issues-layout-docs.md) (its user-guide half shipped for 0.x; rewrite it for 1.0) and [subtask 08](../../../2026-04-19-docs-phase-2/subtasks/08_using-with-ai-present-tense.md).
- **Depends on:** [100/25 issues layouts](../100_layouts/25_issues-layouts.md), [070/20 content commands port](../070_cli/20_content-commands-port.md).
- **Unblocks:** [180/95 skills update](./95_skills-update.md), [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the tracker gets its own leaf and section, because it is the largest part of the user guide and changes with its own layout.

# 05 Notes & Analysis

## Watch out
- Today's UI pages describe the Astro layout's controls. Rewrite them from the new layout as built, not from memory.
