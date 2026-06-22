---
title: Issues Overview
description: What this tracker is — comprehensive memory of thought-work for AI-augmented development, not project planning
sidebar_position: 1
---

# Issues

This tracker is **comprehensive memory of thought-work for AI-augmented development**. Not a ticket queue, not a project-management tool. Each issue is a folder of markdown that captures one coherent unit of *thinking + execution* — planning notes, work breakdown, AI execution log, dialog. The value is the recorded reasoning. "What's left to do" is a side effect.

If that framing surprises you, read [Design Philosophy](./design-philosophy) before going further. The shape of every field below depends on it.

## The flow inside an issue

```
planning  →  execution  →  dialog
issue.md     agent-log/     comments/
notes/                      (and back to notes/ when something
subtasks/                    needs to be properly written down)
```

- **`issue.md`** is the goal: what the work is, why, success criteria.
- **`notes/`** is supporting design material — the thinking that didn't fit in `issue.md`. Multiple files, optional 2-level subfolder tree.
- **`subtasks/`** is the work breakdown. Each subtask is one explicit "did this happen yet?" checkbox — the AI handoff anchor.
- **`agent-log/`** is the audit trail. One file per AI iteration: what was tried, what worked, what failed, what's next. Failed iterations are kept; they're as informative as successes.
- **`comments/`** is the dialog — humans, agents, and review pushback.

A complete issue folder:

```
2026-04-19-docs-phase-2/
├── settings.json                    ← metadata (status, priority, component, labels)
├── issue.md                         ← the goal
├── notes/
│   ├── 01_proposed-file-structure.md
│   └── design/
│       └── 01_overview.md
├── subtasks/
│   ├── 01_issues-layout-docs.md
│   └── 02_theme-system-docs.md
├── agent-log/
│   └── 001_initial-triage.md
└── comments/
    └── 001_2026-04-19_sidhantha.md
```

The ordering signals are **priority** + **status**. The recency signal is **derived from git** (most recent commit touching anything under the issue folder). That's the whole model.

## The team profile this is built for

A 1–4 person team that uses AI agents heavily and ships continuously. Coordination is one chat message away. The bottleneck isn't capacity — it's *deciding what's worth doing next*. The artefact that survives shouldn't be a sprint plan; it should be a record of what was tried, what worked, and why.

## Best-practice rules

Two conventions, both soft (validator hints, never errors):

- **One component per issue.** Multi-component is allowed for genuinely cross-cutting work (a refactor that hits loaders + layouts + plugin scripts simultaneously). When tempted to list two, ask "should this be two issues instead?" — usually yes.
- **AI-handoff-bound issues should declare ≥1 subtask.** The subtask is the agent's anchor: an explicit checkbox the next agent (or human reviewer) can resume from. Trivial human-only fixes don't need this.

The validator emits an info-level hint when these are violated; both stay legal. Cross-cutting work and one-line fixes have their place.

## What makes an issue different from a doc page

| | Docs / Blogs | **Issues** |
|---|---|---|
| Purpose | Published reading material | Recorded thought-work |
| Storage | One file per page | **One folder per item** |
| Metadata | Frontmatter | **`settings.json`** (UI-editable) |
| Lifecycle | Published / not | **open → review → closed \| cancelled** |
| Sub-content | Nothing | `notes/` · `subtasks/` · `agent-log/` · `comments/` |
| Audience | End users | Team + AI agents |

## AI-native by design

Every file is plain markdown in a predictable folder. No API, no auth, no schema — an agent can `ls` the tracker, read any issue, write subtasks, append to agent logs. The 4-state lifecycle (`open → review → closed | cancelled`) exists specifically so AI-driven work can ship to **review** and hand the final call to a human. Subtasks carry their own 4-state independently — an issue can stay `open` while three of five subtasks are already `closed` or in `review`.

Agents working with the tracker should invoke the `documentation-guide` skill — its `references/layouts/issues/` folder (entry `00_overview.md`) is the canonical agent-facing companion to this page.

## What to read next

- [Design Philosophy](./design-philosophy) — the full rationale for the shape
- [Folder Structure](./folder-structure) — the data layout in detail
- [Per-Issue Settings](./settings/per-issue) — metadata schema
- [Vocabulary](./settings/vocabulary) — tracker-root `settings.json`
- [Lifecycle and Review](./lifecycle-and-review) — the 4-state model
- [Sub-Documents](./sub-docs/issue-md) — each file type's conventions
- [List View](./ui/list-view) and [Detail View](./ui/detail-view)
- [Workflows](./workflows/create-an-issue) — step-by-step guides
- [Using with AI](./using-with-ai) — the skill + agent discipline
- [Setup a new tracker](./setup-new-tracker) — spinning one up from scratch
