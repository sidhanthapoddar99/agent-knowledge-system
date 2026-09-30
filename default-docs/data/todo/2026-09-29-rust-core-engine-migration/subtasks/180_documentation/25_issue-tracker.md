---
title: "Docs: the issue tracker"
status: review
---

The tracker is agentks's most distinctive content type and today's largest user-guide section (about twenty pages under `19_issues/`). This leaf rewrites it for 1.0: the issue folder anatomy, the lifecycle, the workflows, the views and filters, and working with AI. The ideas carry over; every command becomes `agentks …`, and the UI pages describe the new issues layout. Added to the group because the tracker is too large to share a leaf with the other content types.

# 01 To Do
- [x] **`30_issue-tracker/01_overview.md`** — what the tracker is, the four content types table, why it is built for AI-augmented teams.
- [x] **Design philosophy** — the 1–4 person AI-augmented team, no sprints or release buckets, why `review` exists. Carry the argument from today's page.
- [x] **Folder anatomy** — `issue.md`, `settings.json`, `brainstorm/`, `notes/`, `plans/`, `subtasks/`, `agent-log/`, `agent-memory/`, `comments/`, `glossary.md`: what each holds and never holds.
- [x] **Setup** — per-issue `settings.json`, the tracker-wide vocabulary, draft issues, several trackers in one project.
- [x] **Lifecycle and review** — the eight statuses in four categories, who may close (only the person who owns the work marks `done` or `dropped`), `superseded` with its `→` line.
- [ ] **Views** — the list view (state tabs, filters, preset views, URL state) and the detail view, as rendered by the 1.0 issues layout ([100/25](../100_layouts/25_issues-layouts.md)).
- [x] **Workflows** — create an issue, work an issue, review and close; each with the `agentks issue …` commands.
- [x] **Using with AI** — the skills, the CLI, the rules an agent follows. Present tense only.
- [ ] **Verify** every command example by running it against a fixture tracker.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- The engine and the CLI are the source of truth for statuses, log kinds and templates. Check each claim with `agentks help` or `agentks check issues`, not from today's pages.
- Keep the tracker skill and these pages as one set: the skill is the full manual, the pages are the user-facing summary ([95](./95_skills-update.md)).

## Done when
- The section exists under `docs/data/user-guide/30_issue-tracker/` and renders with the new engine.
- Every status, log kind and command named on these pages exists in the 1.0 binary (checked against `agentks help --json`).

# 02 Status and Result
Written: 17 pages in `default-docs/data/user-guide-2/30_issue-tracker/`, from the notes, the 1.0 `content` and `cli` worktrees and the agent-ks-issues skills. Views and command examples wait on 100/25 and 070/20 to be checked against the built code.

## Result
The section passes `agent-ks check section` and `agent-ks check link-form` with 0 errors and 0 warnings. Every command example parses in the 1.0 debug binary (it exits 1 at config discovery, never 2 for usage), but none could run, because the tracker commands are not implemented yet. The pages could not be viewed: today's viewer returns 500 for all of `user-guide-2`, because another section's file, `10_writing-content/assets/support-note.md`, has no prefix and no title.

- [The issue tracker](../../../../user-guide-2/30_issue-tracker/01_overview.md): what an issue is, why it is a folder, the flow through its sections, and how an issue differs from a docs page.
- [Why the tracker is shaped this way](../../../../user-guide-2/30_issue-tracker/05_design-philosophy.md): the team it is built for, the ordering signals, derived dates, fixed statuses, the Review category, and when it fits.
- [Inside an issue folder](../../../../user-guide-2/30_issue-tracker/10_the-issue-folder.md): every part with what it holds and never holds, a routing grid, the checker's shape rules, numbering, non-markdown pages and URLs.
- [Statuses, categories and review](../../../../user-guide-2/30_issue-tracker/15_statuses-and-review.md): the eight statuses, closing authority, the three closed statuses and the arrow line, the review queue, and the five run statuses.
- [Issue settings](../../../../user-guide-2/30_issue-tracker/20_issue-settings.md): every `settings.json` field with its check level, derived values, author and assignees, `draft` and `agentLogKinds`.
- [Tracker settings and vocabulary](../../../../user-guide-2/30_issue-tracker/25_tracker-vocabulary.md): the root file, its keys and `fields` rules, designing values, the dump component, preset views, and a second tracker.
- [The issue body, comments and glossary](../../../../user-guide-2/30_issue-tracker/30_issue-comments-glossary.md): `issue.md`, `add-comment` and the comment rules, `glossary.md`, and the Guide.
- [Brainstorm and notes](../../../../user-guide-2/30_issue-tracker/35_brainstorm-and-notes.md): brainstorm kinds and graduation, note placement and shape, diagrams and artifacts.
- [Subtasks](../../../../user-guide-2/30_issue-tracker/40_subtasks.md): subtask versus log, groups as areas, the index leaf, the template, the template check, `new-subtask` and `set-state`.
- [Plans and stages](../../../../user-guide-2/30_issue-tracker/45_plans-and-stages.md): plan shape and rules, stage numbering, the stage file and its `subtasks` list, stage status, the plan page, the active plan, closing, and the commands.
- [Agent logs](../../../../user-guide-2/30_issue-tracker/50_agent-logs.md): when a run earns a log, the six kinds, the folder with its index, rounds, reports and child logs, run status, and the commands.
- [Agent memory](../../../../user-guide-2/30_issue-tracker/55_agent-memory.md): what it holds, the three tiers, the index, and the rules.
- [The tracker in the app](../../../../user-guide-2/30_issue-tracker/60_the-tracker-in-the-app.md): the issue list and the issue page, drafts, colours, and what to check when something looks wrong.
- [Tracker commands](../../../../user-guide-2/30_issue-tracker/65_tracker-commands.md): the conventions, then read, list filters, write, check, move and history commands.
- [Create and work an issue](../../../../user-guide-2/30_issue-tracker/70_create-and-work-an-issue.md): the creation test and duplicate check, the folder, subtasks, working a subtask, the hand-off, and restructuring.
- [Review and close](../../../../user-guide-2/30_issue-tracker/75_review-and-close.md): finding the queue, answering `input-needed`, reviewing, deciding, closing the issue, and what to do when review goes wrong.
- [Working with AI agents](../../../../user-guide-2/30_issue-tracker/80_working-with-ai-agents.md): the six skills, the pickup order, the rules an agent follows, briefing a run, and the rules to give an agent without the skills.

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
- Decided (claude, 2026-10-01): the section is 17 flat pages with two-digit prefixes in steps of five, with no subfolders. Today's viewer sorts files by text and puts files after subfolders, so a flat folder keeps the same order in both engines.
- Decided (claude, 2026-10-01): the views page describes only what the design and the `api` types settle: category tabs, the Review tab, filters by status, category, priority, component and labels, presets, table or cards, the Guide, and the parts of the issue page. URL state, sort, group-by, an assignee filter in the app and status cycling wait for [100/25](../100_layouts/25_issues-layouts.md).
- Decided (claude, 2026-10-01): a superseded issue's arrow line is documented as belonging in `issue.md` only, because the 1.0 check reads only `issue.md`. The skill also allows a comment.
- Decided (claude, 2026-10-01): a subtask promoted to an issue stays behind as `superseded` with its arrow line, because the lifecycle defines `superseded` for work reshaped into another item. The skill's operations reference says `review`; [95](./95_skills-update.md) should settle one.
- Decided (claude, 2026-10-01): preset views are documented with `name` and `filters` only, because the 1.0 engine passes `views` through as written and the layout that reads the other keys is not built.
- Decided (claude, 2026-10-01): agent logs follow the skill's shape (`00_index.md`, rounds `10_`, reports `11_`, child logs from `120_`), because the skill and the 1.0 loader agree on it. Today's agent-log page describes an older shape.
- Decided (claude, 2026-10-01): the delegation steps leave out today's "let the agent close trivial subtasks", because only a person sets `done` or `dropped` on work items, and the 1.0 status writer refuses them from an agent.
- Decided (claude, 2026-10-01): the review pages say that `agentks issue set-state` to `done` or `dropped` asks the person to type the status word at a terminal, that `--yes` does not skip it, that an agent's run with no terminal is refused, and that a person without a terminal edits the status in the file, because that is the rule recorded in [070/20](../070_cli/20_content-commands-port.md).
- Decided (claude, 2026-10-01): `60_the-tracker-in-the-app.md` names only what [100/25](../100_layouts/25_issues-layouts.md) decides and the page data in `agentks-api` carries: the list's order, fields, filters and presets, the issue page's parts, the Guide and the sub-document pages. Sidebar marks, colour tints, the problems panel, table or cards and the Review tab come out until the layout is built, because unbuilt specifics stated as fact mislead readers.
- Decided (claude, 2026-10-01): pages over 900 words were trimmed by cutting repeated context, never facts, and none was split, because each covers one task.

# 05 Notes & Analysis

## Watch out
- Today's UI pages describe the Astro layout's controls. Rewrite them from the new layout as built, not from memory.
