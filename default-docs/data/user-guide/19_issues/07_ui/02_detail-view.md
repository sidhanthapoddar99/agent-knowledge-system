---
title: Detail View
description: The single-issue page — panel-based layout, sub-doc pages at their own URLs, Guide + Glossary panels
sidebar_position: 2
---

# Detail View

The detail view renders at `/<base>/<YYYY-MM-DD-slug>`. It's the surface for working an issue: reading context, inspecting sub-docs, transitioning state. Three columns; the centre is **panel-based**, and every sub-doc has its **own page**.

![Detail view — the demo issue's overview: sidebar with all sections, metadata header, issue body, right-rail TOC](../assets/demo-overview.webp)

## Anatomy

```
┌──────────────┬────────────────────────────────────────┬────────────┐
│ THIS ISSUE   │  Documentation update — phase 2        │  META /    │
│  Overview    │  status · priority · labels chips      │  TOC RAIL  │
│  Comments    ├────────────────────────────────────────┤            │
│  Comprehens. │                                        │  On this   │
│  Guide       │  ## Goal                               │  page…     │
│  Glossary    │  Rewrite user-guide around 4 content   │            │
│              │  types…                                │  (per-     │
│ Brainstorm   │                                        │   panel    │
│  01 research │                                        │   index)   │
│ Notes        │                                        │            │
│  01 decided… │                                        │            │
│ Plans        │                                        │            │
│  ◐ 02 hard…  │                                        │            │
│ Subtasks 1/3 │                                        │            │
│  ○ 01 setup  │                                        │            │
│ Agent log    │                                        │            │
│  10 ⟳ impl 5 │                                        │            │
│ Agent memory │                                        │            │
│  · memory    │                                        │            │
└──────────────┴────────────────────────────────────────┴────────────┘
```

## Three columns

| Column | Role |
|---|---|
| **Left — Detail Sidebar** | Two groups: **This issue** (panel switchers) + the **content sections** (links to sub-doc pages) |
| **Center — Main** | The active panel (overview by default), or — on a sub-doc URL — that sub-doc's body |
| **Right — Meta rail** | A per-panel index: comment index on Comments, subtask index on Comprehensive, "On this page" TOC on Guide and on sub-doc pages |

## The panels ("This issue" group)

Panel switching is hash-addressable — `#comments`, `#comprehensive`, `#guide`, `#glossary` (no hash = overview). Deep links: `#comment-3`, `#comprehensive-<subtask>`, `#guide-<section>`.

| Panel | Holds |
|---|---|
| **Overview** | `issue.md` only — the body, rendered. Metadata header above. |
| **Comments** | The GitHub-style thread: issue body as opening post, then the flat comment log in sequence. Right rail = per-comment index (`#NNN`, author · date). |
| **Comprehensive** | Every subtask's full body on one page, filterable by state, heading ids prefixed. |
| **Guide** | The issue-anatomy reference — static template + **generated islands** (this issue's effective agent-log kind table: symbol · code · name · use-for). Ordered most-complex-first; right rail = "On this page". |
| **Glossary** | The optional root `glossary.md`, rendered as-is (never generated). Themed blank-state prompting for one when absent. |

![Guide panel on the demo issue — the generated kinds table (five defaults + the issue's custom `ex`) with the right-rail outline](../assets/demo-guide.webp)

## Content sections (sidebar)

Each section lists its files as links to **their own URLs** (`/<issue>/notes/<name>`, `/<issue>/agent-log/<folder>/<file>`, …):

- Rows render `NN` badge + clean label (prefix stripped, separators → spaces); an optional `color:` frontmatter tints the label (meaning documented in the issue's glossary).
- **Non-markdown sub-docs** (first-class diagrams, `.html` artifacts in notes/brainstorm) carry a small trailing **type glyph** on the right — hover names the type. Markdown is the default and stays unmarked.
- **Subtasks** — a status icon per row; hovering any icon names its status. The full set:

  | Icon | Status | Tint |
  |---|---|---|
  | hollow square | `open` | neutral |
  | circle with a slash | `blocked` | neutral |
  | half-filled circle | `in-progress` | blue (`--color-info`) |
  | question mark | `input-needed` | amber (`--color-warning`) |
  | filled dot | `review` | amber (`--color-warning`) |
  | check | `done` | green (`--color-success`) |
  | cross | `dropped` | red (`--color-error`) |

  Group folders show a **done/total** count; the section header shows the issue-wide done/total with an amber dot when anything is in the Review category. The same legend renders live (real symbols, real colors) on every issue's **Guide** panel.
- **Agent log** — each run's folder renders `NN <symbol> <name> … <count>` — the **number** leads, because an activity is referred to by its number ("run 020") while its kind is a property of the run; the subtask and plan rows above it still lead with their status icon, being read for state rather than identity; the kind symbol's tooltip names the kind and its colour comes from that folder's optional `settings.json` status (a folder without one renders a defined grey, distinct from `open`). Inside, nothing is pinned: the run's slots are numbered, so plain prefix order gives `01_summary.md`, `02_working/`, `03_debrief/`, then any child agent log (prefix `100` and up).
- **Plans** — rows read `<status icon> NN <name>`, in plain ascending prefix order. The active plan (highest-numbered not `done`/`dropped`) is **marked in bold, not moved**; clicking one swaps the main panel to its page, table first.
- **Agent memory** — `memory.md` pins first.
- Ordering everywhere: the `memory.md` index pin (agent-memory only, since it carries no prefix) → numeric prefix value → name. Ascending, one rule for all sections — the agent log has no special case, because its slots carry the numbers that used to need one.
- Collapse state of sections and folders persists per issue.

## Interactions

- **Subtask status cycling** — clicking a subtask's status icon cycles the happy path `open → in-progress → review → done` (dev-mode editor endpoint writes the frontmatter); the other statuses (`blocked`, `input-needed`, `dropped`) are set by editing; counts update live.
- **Tooltips** — one site-wide cursor-anchored tooltip: kind symbols, status icons, type glyphs, and the review dot always show theirs; text tips appear only when the text is actually cropped.
- **Sub-doc pages** — each has the same three-column shell with its own right-rail TOC; the sidebar keeps your place.

## See also

- [List View](/user-guide/issues/ui/list-view) — how you get here
- [Per-Issue Settings](/user-guide/issues/setup/per-issue) — the metadata fields
- [Sub-Documents](/user-guide/issues/sub-docs/issue-md) — each file type's conventions
