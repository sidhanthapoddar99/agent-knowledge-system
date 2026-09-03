# Writing inside the tracker

Markdown mechanics have one home: the docs skill's [writing.md](../../agent-ks-docs/references/writing.md). It holds the link rule, the ordering label, callouts, collapsibles, diagram fences, asset embedding, `[[path]]` embedding and code blocks. This file holds only what differs inside a tracker.

## The one body template

Every work file except an agent-log file uses one body shape. The problem statement comes first, with no heading. Five `#` sections follow, numbered: `01 To Do`, `02 Status and Result`, `03 References`, `04 Decisions`, `05 Notes & Analysis`. Each file kind has a standard set of `##` sub-heads. Drop a sub-head you do not need. Never add a `#` section. What each section holds, and a filled example, sits in the file kind's own reference. The skeletons live in the cli skill's `templates/` folder. The scaffolders write them.

| File | Sections | Frontmatter | Skeleton |
|---|---|---|---|
| subtask | all five. Example: [subtasks](06_subtasks.md) | `title`, `status` | [subtask.md](../../agent-ks-cli/templates/subtask.md) |
| plan `overview.md` | all five | `title`. Status lives in the plan's `settings.json` | [plan-overview.md](../../agent-ks-cli/templates/plan-overview.md) |
| plan stage | all five. Example: [plans](07_plans.md) | `title`, `status`, `outcome`, `notes`, `who`, `subtasks:` | [plan-stage.md](../../agent-ks-cli/templates/plan-stage.md) |
| agent log files | guided per kind: [agent-ks-logs](../../agent-ks-logs/SKILL.md) | `title`. Status lives in the log's `settings.json` | one `log-index-<kind>.md` per kind in the cli skill's `templates/` |
| note | 03, 04, 05 | `title`, optional `color` | [note.md](../../agent-ks-cli/templates/note.md) |
| `issue.md` | Goal, Context, Done when, Scope decisions | `title` | none |
| comment | none: two lines and a pointer | `author`, `date` | [comment.md](../../agent-ks-cli/templates/comment.md) |
| brainstorm | free | `title` | none |

Frontmatter holds only the fields in this table, plus two optional ones. `color:` tints the sidebar label; its meaning lives in the issue's `glossary.md`. `draft: true` hides the file from the production build.

## Results at three levels

A stage's `02` says what the stage produced. A subtask's `02` says what the item produced. A log's `## Handover` says how the run went. Never copy a status across levels. The renderer pulls live subtask status into the stage.

The flow runs brainstorm → notes → plan (goal, stages, subtasks) → log (execute). Results land in the subtask's `02` and the stage's `02`.

## Frontmatter and prefixes

The prefix owns the number. Never repeat it in frontmatter. The prefix grammar and each folder's convention: [anatomy](01_anatomy.md). `title` and the no-MDX rule: [writing.md](../../agent-ks-docs/references/writing.md).

## Links — the tracker deltas

The link rule, the ordering label and the backtick exception live in [writing.md](../../agent-ks-docs/references/writing.md). Two forms are tracker-only:

- A `Related:` line at the end of a body holds soft references: duplicate-check hits, sibling subtasks, superseded issues.
- A decision line is `- Decided (author, YYYY-MM-DD): ...` in `04 Decisions`.

## Diagrams and artifacts as sub-docs

- Mermaid and Graphviz fences and ASCII trees render everywhere in the tracker.
- Diagram source that does not sit inline goes in an `assets/` folder beside the file. Embed it inside the fence: `[[./assets/flow.mmd]]` from `issue.md`, `[[../assets/flow.mmd]]` from a file in `notes/`.
- A diagram file (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) may sit in `notes/`, `brainstorm/`, `agent-memory/` or `agent-log/`. There it renders as a first-class entry with its own sidebar item and URL. Use this when the diagram is the doc.
- A subtask stays markdown. Embed a diagram into its body from `assets/`.
- An `.html` artifact lives in `notes/` or `brainstorm/` only ([notes](05_brainstorm-notes-memory.md)). Build it with [agent-ks-artifacts](../../agent-ks-artifacts/SKILL.md).
- A non-markdown sub-doc gets a type glyph in the sidebar. Never hand-label a file's type in its title.
- Images: [images.md](../../agent-ks-docs/references/images.md).

## Write for cold pickup

The next reader has none of your context. Say what and why in the opening. Write checkboxes with a bold lead, then the explanation with concrete paths. Use `##` groups when a flat list grows. Link instead of shorthand. Record a finding as one line plus a link, never the write-up in place.
