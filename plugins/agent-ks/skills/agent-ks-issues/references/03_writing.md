# Writing inside the tracker

Markdown mechanics have one home: the docs skill's [writing.md](../../agent-ks-docs/references/writing.md). It holds the link rule, the ordering label, callouts, collapsibles, diagram fences, asset embedding, `[[path]]` embedding and code blocks. This file holds only what differs inside a tracker.

## The one body template

Every work file uses one body shape. The problem statement comes first, with no heading. Five `#` sections follow, numbered. `##` appears only under section 05, for indexed points. The skeletons live in the cli skill's `templates/` folder. The scaffolders write them.

| Section | Holds |
|---|---|
| opening, no heading | why the file exists: a feature, a bug, an upgrade. What it broke and the impact |
| `# 01 To Do` | `- [ ] item`, with sub-items nested one level |
| `# 02 Status and Result` | what is done and what is not. Partial results are fine |
| `# 03 References` | links: agent logs, notes, subtasks, docs, external sources, industry practice |
| `# 04 Decisions` | `- Decided (author, YYYY-MM-DD): ...` |
| `# 05 Notes & Analysis` | indexed points under `## 01 First point`, `## 02 Second point` |

| File | Sections | Frontmatter | Skeleton |
|---|---|---|---|
| subtask | all five | `title`, `status` | [subtask.md](../../agent-ks-cli/templates/subtask.md) |
| plan `overview.md` | all five | `title`. Status lives in the plan's `settings.json` | [plan-overview.md](../../agent-ks-cli/templates/plan-overview.md) |
| plan stage | all five | `title`, `status`, `outcome`, `notes`, `who`, `subtasks:` | [plan-stage.md](../../agent-ks-cli/templates/plan-stage.md) |
| log `01_summary.md` | all five | `title`. Status lives in the log's `settings.json` | [log-summary.md](../../agent-ks-cli/templates/log-summary.md) |
| log round | all five | `title`, `status`, `agent` | [log-round.md](../../agent-ks-cli/templates/log-round.md) |
| note | 03, 04, 05 | `title`, optional `color` | [note.md](../../agent-ks-cli/templates/note.md) |
| `issue.md` | Goal, Context, Done when, Scope decisions | `title` | none |
| comment | none: two lines and a pointer | `author`, `date` | [comment.md](../../agent-ks-cli/templates/comment.md) |
| brainstorm | free | `title` | none |

Frontmatter holds only the fields in this table, plus two optional ones. `color:` tints the sidebar label; its meaning lives in the issue's `glossary.md`. `draft: true` hides the file from the production build.

## Results at three levels

A stage's `02` says what the stage produced. A subtask's `02` says what the item produced. A log's `02` says how the run went. Never copy a status across levels. The renderer pulls live subtask status into the stage.

The flow runs brainstorm → notes → plan (goal, stages, subtasks) → log (execute). Results land in the subtask's `02` and the stage's `02`.

## Frontmatter rules

- `title` is required by convention on every markdown file. Nothing enforces it. A missing title ships the slug as the title.
- Preserve `color:` when you edit. Check the issue's `glossary.md` before you interpret a colour.
- The prefix owns the number. Never repeat it in frontmatter.
- Write pure markdown. No MDX.

## Ordering prefixes

The shared grammar: 2–5 digits, sorted by numeric value, `_` canonical, gap-spaced. In the tracker both `NN_` and `NNN_` are conventional.

| Where | Convention |
|---|---|
| `subtasks/` | `NN_` or `NNN_`, gap-spaced. The leading digit may mark a group |
| `comments/` | `NNN_`, numbered by the CLI. Never hand-gapped |
| `agent-log/` | `NNN_<code>_<name>/` per log. Rounds `NN_`, gap-spaced by ten. Reports `N1`–`N9` |
| `plans/` | `NN_<name>/` per plan. Stages `NN_`, gap-spaced by ten |
| `brainstorm/`, `notes/` | optional. Number only when reading order matters |
| `agent-memory/` | none. Name by topic |

## Links — the tracker deltas

- Reference by link, never by number. Write `Blocked by [the version bump](../050_version-bump.md)`, not "Blocked by `050`". A number is not a name, and a quoted number freezes the numbering.
- A tracker URL keeps its ordering prefixes. `subtasks/020_impl/010_backend.md` is served at `…/subtasks/020_impl/010_backend`. Docs and blog strip prefixes, so a link that leaves the tracker is the one case that needs care. Write the source path; the renderer resolves it.
- A `Related:` line at the end of a body holds soft references: duplicate-check hits, sibling subtasks, superseded issues.
- A graduation marker is `> **Resolved →** <target>` at the top of a brainstorm.
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
