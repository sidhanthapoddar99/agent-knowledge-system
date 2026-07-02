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
deliberate   →   write down   →   plan       →   execute        →   record
brainstorm/      notes/           subtasks/      agent-log/         comments/
(process)        (product)        (the what)     (the how)          (what changed)
```

There's a natural flow, but **no required order** — sections are organized by *what they hold*, used as the work needs.

- **`issue.md`** is the goal: what the work is, why, success criteria.
- **`brainstorm/`** is active deliberation — research, options, trade-offs. The *process* of deciding; its conclusion **graduates into notes** (marked `**Resolved →** <target>`).
- **`notes/`** is the finalized output + durable references — the *product* you build on.
- **`subtasks/`** is the work breakdown. Each subtask is one explicit "did this happen yet?" checkbox — the AI handoff anchor.
- **`agent-log/`** is the execution record — one **activity folder** per loop / audit / refactor run, milestones inside. Failed milestones are kept; they're as informative as successes.
- **`agent-memory/`** is the AI's mutable working state — durable facts worth not rediscovering.
- **`comments/`** is the flat evolution log — what changed, status shifts, hand-offs.

When unsure where a piece of content belongs, two questions route it — is it *thinking* or *doing*, and is it *in motion* or *settled*:

| | In motion | Settled |
|---|---|---|
| **Thinking** | `brainstorm/` | `notes/` |
| **Doing** | `subtasks/` (the plan) | `agent-log/` (how it went) |

Comments deliberately fit no box — they're the changelog *of the issue itself*, not of the work.

A complete issue folder:

```
2026-04-19-docs-phase-2/
├── settings.json                    ← metadata (status, priority, component, labels)
├── issue.md                         ← the goal
├── glossary.md                      ← optional per-issue glossary
├── brainstorm/
│   └── 01_research_prior-art.md
├── notes/
│   ├── 01_decided-architecture.md
│   └── 02_reference/
│       └── 01_links.md
├── subtasks/
│   ├── 01_issues-layout-docs.md
│   └── 02_theme-system-docs.md
├── agent-log/
│   └── 010_lp_implement-x/
│       ├── 00_goal.md
│       └── 101_milestone.md
├── agent-memory/
│   └── memory.md
└── comments/
    └── 001_opened.md
```

The ordering signals are **priority** + **status**. The recency signal is **derived from git** (most recent commit touching anything under the issue folder). That's the whole model.

## The team profile this is built for

A 1–4 person team that uses AI agents heavily and ships continuously. Coordination is one chat message away. The bottleneck isn't capacity — it's *deciding what's worth doing next*. The artefact that survives shouldn't be a sprint plan; it should be a record of what was tried, what worked, and why.

## Best-practice rules

Two conventions, both soft (validator hints, never errors):

- **One component per issue.** Assign the single component the issue most belongs to — its center of gravity — even when the work touches several surfaces (a migration that spans loaders + layouts + plugin scripts is still tagged by the one it's *most* about). If two feel equally central, that's the signal to split into two issues.
- **AI-handoff-bound issues should declare ≥1 subtask.** The subtask is the agent's anchor: an explicit checkbox the next agent (or human reviewer) can resume from. Trivial human-only fixes don't need this.

The validator emits an info-level hint when these are violated; both stay legal (the hint nudges, it doesn't block). One-line fixes have their place too.

## What makes an issue different from a doc page

| | Docs / Blogs | **Issues** |
|---|---|---|
| Purpose | Published reading material | Recorded thought-work |
| Storage | One file per page | **One folder per item** |
| Metadata | Frontmatter | **`settings.json`** (UI-editable) |
| Lifecycle | Published / not | **open → review → closed \| cancelled** |
| Sub-content | Nothing | `brainstorm/` · `notes/` · `subtasks/` · `agent-log/` · `agent-memory/` · `comments/` |
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
