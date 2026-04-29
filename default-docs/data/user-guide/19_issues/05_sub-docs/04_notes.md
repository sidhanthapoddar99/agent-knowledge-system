---
title: Notes
description: Supporting design docs — deep-dive content that doesn't belong in issue.md
sidebar_position: 4
---

# Notes

Notes are supporting markdown documents that live in `<issue-folder>/notes/`. Use them for deep content that would overwhelm `issue.md` — design proposals, research, file structures, decision records, reference material.

## File naming

Free-form. The convention mirrors subtasks but isn't enforced:

```
notes/
├── 01_proposed-file-structure.md
├── 02_design-decisions.md
└── review-traces.md               ← un-numbered is fine
```

Numeric prefixes help order notes in the sidebar; the slug after becomes the default title.

## Subfoldering — up to 2 levels

`notes/` accepts up to **two levels of subfolders** so long-running issues can group related notes by theme or phase. Folder names are freeform — no naming convention required.

```
notes/
├── overview.md                     ← root-level, no group
├── design/                         ← level-1 group
│   ├── api-shape.md
│   ├── data-model.md
│   └── phase-1/                    ← level-2 subgroup
│       ├── kickoff.md
│       └── decisions.md
└── research/
    └── prior-art.md
```

Rules:

- Mix files and folders freely at every level that allows folders. `notes/overview.md` can sit beside `notes/design/`, and `notes/design/api-shape.md` can sit beside `notes/design/phase-1/`.
- The deepest folder (level 2) is **files-only**. Anything nested deeper than `notes/<group>/<subgroup>/<file>.md` is logged as a warning by the loader and silently skipped.
- Subgroups appear as collapsible nested sections in the sidebar. Each level shows a count of descendant notes.
- Filenames within a folder must be unique — but the *same* filename can appear in different folders (`notes/design/intro.md` and `notes/research/intro.md` coexist; they have distinct URLs).

If you find yourself wanting a third level, that's usually a signal to split into a sibling group at level 1, or — if the notes have outgrown a single issue — to split into a separate issue.

## Frontmatter

Notes support standard markdown frontmatter. Only `title` is interpreted by the loader:

```markdown
---
title: "Proposed file structure"
---

# Proposed file structure

…
```

If `title` is absent, the loader derives it from the slug (`01_proposed-file-structure` → `proposed file structure`).

No `state` field — notes aren't work items. They're documentation.

## When to use a note vs…

| If you want to… | Use |
|---|---|
| State the issue's goal / context | `issue.md` |
| Discuss / update progress | `comments/` |
| Track a chunk of work with its own state | `subtasks/` |
| **Capture a design proposal, ADR, or research** | **`notes/`** |
| Record an AI iteration | `agent-log/` |

Notes are long-form. A comment is a paragraph or two; a note is a section, multi-heading, possibly with embedded diagrams. The distinction:

- **Comment** — *I think we should do X.*
- **Note** — *Here's the full proposal for X: motivation, alternatives, tradeoffs, decision, followups.*

## Typical contents

- **Design proposals.** "Here's how we'd restructure the issues tracker: folder-per-item vs flat, with pros/cons."
- **Architecture decisions.** ADR-style — context, decision, consequences.
- **Research traces.** "I surveyed how other tools solve this — here's what I found."
- **File structure proposals.** New IA for a docs section, new layout split, etc.
- **Migration plans.** Step-by-step of how we'll get from A to B.

## Example

```markdown
---
title: "Design philosophy: tracker shape for the 1–4 person AI-augmented team"
---

# Design philosophy — why this tracker is shaped the way it is

This note captures the design conversations behind the tracker's data model and UX.
The short version: this isn't a generic project management tool. It's deliberately
narrow — built for a 1–4 person team that uses AI agents heavily and ships
continuously.

## The team profile we're optimising for

…
```

(From `2026-04-10-issues-layout/notes/02_design-philosophy-and-review-state.md`.)

## Rendering

Notes render:

- **In the detail page's left sidebar** as a list of links, each linking to an anchor in the Comprehensive tab.
- **In the Comprehensive tab** as standalone sections under a "Notes" heading, in filename order. Each note's headings get ID-prefixed to avoid collisions with subtasks or other notes.

Separate per-note URLs (`/todo/<id>/notes/<slug>`) are planned — same subtask as sub-doc URLs (`2026-04-10-issues-layout/subtasks/17_subdoc-separate-urls.md`).

## Relationship to issue.md

A healthy split:

- **`issue.md`** — 50–200 lines. Orients a reader in 2 minutes.
- **`notes/`** — as long as necessary. Readers go here for detail after `issue.md` hooked them.

If `issue.md` creeps past 300 lines, it probably wants to be split — extract the deep sections into notes and leave `issue.md` as an overview with pointers.

## See also

- [issue.md](./issue-md) — the body that notes support
- [Subtasks](./subtasks) — for breaking the work into trackable units
- [Agent Log](./agent-log) — for AI iteration audit trails
