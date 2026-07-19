---
title: 04 · Notes
description: Finalized output + durable references — the decided approach you build on; the product, not the process
sidebar_position: 4
---

# Notes

Notes live in `<issue-folder>/notes/` and hold the issue's **finalized output + durable references** — the decided architecture, the agreed spec, research links worth keeping. Notes are defined by contrast with [Brainstorm](./brainstorm): brainstorm is *what we're figuring out*, notes are *what we know*.

Content arrives two ways: by **graduating** out of a resolved brainstorm (the conclusion distilled, the trail left behind with a `> **Resolved →** notes/…` marker), or fully formed (a reference, a how-to, a link dump). Once here it should be **stable** — a note that keeps changing is a brainstorm wearing the wrong hat.

## File naming

Free-form. The convention mirrors subtasks but isn't enforced:

```
notes/
├── 01_proposed-file-structure.md
├── 02_design-decisions.md
└── review-traces.md               ← un-numbered is fine
```

A numeric prefix is **optional** for notes (folders and files) — but when you want a fixed reading order, `NN_` and `NNN_` are both good conventions, using the same 2–5 digit, sort-by-value grammar as the rest of the tracker. The prefix orders the note in the sidebar; the slug after it becomes the default title. The numbering is a **curated reading order** (the author's intended sequence), not a timeline — no kind words, no machinery.

## Subfoldering — up to 5 levels (up to 3 recommended)

`notes/` accepts nested subfolders up to 5 levels deep so long-running issues can group related notes by theme or phase; the recommended convention is up to 3 levels. Folder names are freeform — no naming convention required.

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
- Folders may nest up to 5 levels deep; a folder nested beyond level 5 is logged as a warning by the loader and silently skipped. Files may live at any level, and the recommended convention is up to 3 levels.
- Subgroups appear as collapsible nested sections in the sidebar. Each level shows a count of descendant notes.
- Filenames within a folder must be unique — but the *same* filename can appear in different folders (`notes/design/intro.md` and `notes/research/intro.md` coexist; they have distinct URLs).

If you find yourself wanting a fourth level (past the recommended three), that's usually a signal to split into a sibling group at level 1, or — if the notes have outgrown a single issue — to split into a separate issue. The hard cap is 5.

## Frontmatter

Notes support standard markdown frontmatter. Only `title` and `color` are interpreted by the loader:

```markdown
---
title: "Proposed file structure"
color: "#7aa2f7"     # optional — tints only the sidebar icon
---

# Proposed file structure

…
```

If `title` is absent, the loader derives it from the slug (`01_proposed-file-structure` → `proposed file structure`).

No `status` field — notes aren't work items. They're documentation.

### `color` — optional sidebar-label tint

Any string the browser accepts as a CSS color: named (`red`, `salmon`), hex (`#e06c75`), or a theme token (`var(--color-success)` — preferred, so the tint stays readable in dark and light mode). **The sidebar label is tinted** — row background and borders stay default. The framework doesn't impose semantics — document what your colours mean in the issue's **`glossary.md`** (per-section legends: the same colour can mean different things in Notes than in Agent log).

## When to use a note vs…

| If you want to… | Use |
|---|---|
| State the issue's goal / context | `issue.md` |
| Record that something changed / a hand-off | `comments/` |
| **Deliberate — research, options, trade-offs** | **`brainstorm/`** |
| Track a chunk of work with its own state | `subtasks/` |
| **Capture the decided approach, ADR, or reference** | **`notes/`** |
| Record an execution run / milestone | `agent-log/` |
| Store durable AI working facts | `agent-memory/` |

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

Notes render in the detail page's left sidebar (Notes section, `NN` badge + clean label) and each note has **its own URL**: `/<tracker>/<issue>/notes/<name>` (nested: `/notes/<group>/<name>`), with a per-page TOC in the right rail.

## Relationship to issue.md

A healthy split:

- **`issue.md`** — 50–200 lines. Orients a reader in 2 minutes.
- **`notes/`** — as long as necessary. Readers go here for detail after `issue.md` hooked them.

If `issue.md` creeps past 300 lines, it probably wants to be split — extract the deep sections into notes and leave `issue.md` as an overview with pointers.

## See also

- [Brainstorm](./brainstorm) — the deliberation that graduates into notes
- [issue.md](./issue-md) — the body that notes support
- [Subtasks](./subtasks) — for breaking the work into trackable units
- [Agent Log](./agent-log) — the execution record
