---
title: "Inside an issue folder"
description: "Every file and folder an issue may hold, what each is for, and what it never holds."
---

This page maps everything an issue folder may contain, with what each part holds and never holds. Most mistakes in a tracker are content in the wrong place. The pages after this one cover each part in depth.

## The full tree

```
2026-10-01-search-index/
├── settings.json        metadata: title, status, priority, component, labels
├── issue.md             the goal, the context, when it is done
├── glossary.md          optional: this issue's terms and colour meanings
├── brainstorm/          working it out: research, options, dead ends
├── notes/               settled conclusions and contracts
├── plans/               the order of work, in stages
├── subtasks/            one file per work item, each with its own status
├── agent-log/           one folder per agent run
├── agent-memory/        facts an agent must not rediscover
└── comments/            a flat log of events
```

Only `settings.json` and `issue.md` are required. The seven folders are the issue's **sections**. Add a section when the work needs it, and leave it out otherwise.

## What each part holds

| Part | Holds | Never holds |
|---|---|---|
| `settings.json` | The metadata the list page shows, sorts and filters by | Prose, or dates that agentks derives |
| `issue.md` | The goal, the context, what "done" means, what is in and out of scope | Research and options weighed. Those are notes |
| `glossary.md` | The issue's own terms, and what each `color:` means | Anything agentks already shows on its own |
| `brainstorm/` | The argument: options, trade-offs, the ones rejected, changes of mind | A conclusion other work relies on. That is a note |
| `notes/` | Conclusions with their reason, and contracts other work builds against | The debate behind them, or a list of steps to do |
| `plans/` | The order of stages, what blocks what, the outcome each stage aims at | The status of the work. The subtasks carry that |
| `subtasks/` | One work item each: what to do, when it is done, what came out | When it runs. Order belongs to a plan |
| `agent-log/` | The path one run took, its bulk output, and its handover | The only copy of a result. The subtask keeps that |
| `agent-memory/` | What is true for this issue, gotchas, and pointers that were hard to find | Decisions, or anything git and the notes already record |
| `comments/` | That something changed, in two lines and a link | The debate or the specification behind the change |

One rule sits behind the table: **each fact has one home.** A copy goes stale, and nobody notices.

## Where does this go?

Two questions route most content:

| | Still moving | Settled |
|---|---|---|
| **Thinking** | `brainstorm/` | `notes/` |
| **Doing** | `subtasks/` and `plans/` | `agent-log/` |

A durable fact that an agent needs every session goes to `agent-memory/`. An event, such as a status change or a hand-off, goes to `comments/`.

## What the checker allows

`agentks check issues` reads every issue and reports anything outside the shape:

| Situation | What happens |
|---|---|
| A markdown file at the issue root other than `issue.md` and `glossary.md` | A warning: supporting markdown belongs in `notes/` |
| A folder at the issue root that is not a section and not `assets/` | A warning: unknown folder |
| No `issue.md` | An error |
| No `settings.json`, or a `status` agentks does not know | An error, and the app does not show the issue |
| Folders more than five levels deep inside a section | The deeper folders are ignored, with a warning. Keep to three levels |

An `assets/` folder may sit anywhere in an issue. It holds the images and files that the pages beside it embed. It never appears on the issue page.

## Numbers in file names

A file or folder name may start with a number of two to five digits and an underscore, such as `05_`, `010_` or `12345_`. Siblings sort by the number's value, so `05_` and `010_` can sit side by side. Leave gaps, such as 10, 20, 30, so a new file fits between two others.

Each section has its own convention. Subtasks, plans and plan stages are numbered. Comments and agent logs take the next number from the command that creates them. Notes and brainstorm files take a number only when reading order matters. Agent memory files take none.

## Pages that are not markdown

Some sections may hold diagram files and HTML artifacts. Each such file shows as its own page in the issue:

| Kind | Files | Allowed in |
|---|---|---|
| Diagram | `.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw`, `.drawio` | `notes/`, `brainstorm/`, `agent-memory/`, `agent-log/` |
| HTML artifact | `.html`, with an optional `<name>.meta.json` beside it for its title | `notes/`, `brainstorm/` |

A subtask is always markdown. To show a diagram in a subtask, embed it from an `assets/` folder. Writing diagrams, embeds and artifacts is covered in [writing content](../10_writing-content/01_overview.md).

> [!CAUTION]
> An HTML artifact runs with the site's own permissions. Never paste HTML from a source you do not trust.

## Where each file is served

An issue is served at its tracker's base URL plus the folder name. Files inside it keep their numbers in the URL.

| File | URL |
|---|---|
| The issue (`issue.md`) | `/todo/2026-10-01-search-index` |
| A subtask | `/todo/2026-10-01-search-index/subtasks/020_ui/010_filters` |
| A note, brainstorm, memory or log file | The same pattern: section, folders, then the file name without its extension |
| A plan | `/todo/2026-10-01-search-index/plans/01_build`, one page with every stage on it |
| Comments and `glossary.md` | Shown on the issue's own page |

You never write these URLs in content. A link from one file to another stays a relative path, such as `[the design](../notes/design.md)`. agentks works out the URL.
