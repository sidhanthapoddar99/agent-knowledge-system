---
title: Split the issue skill reference into multiple files
state: closed
---

`references/layouts/issue-layout.md` is ~586 lines across 10 sections (§0–§9). When the
skill triages any issue-tracker task it reads the whole file, bloating context even for a
narrow question ("how do I add a comment?"). Split it into a **folder of focused files**
so a narrow task reads one ~60–150 line file.

The split itself **dogfoods the leading-digit grouping convention** (see
`references/layouts/docs-layout.md`): first digit = part (0/2/4/6), second = order within
the part, gaps (1/3/5/7) reserved for future parts. `NN_` (2-digit) prefixes, kebab-case
filenames.

## Target layout

```
references/layouts/issues/        ← replaces references/layouts/issue-layout.md

# Part 1 — Overall
00_overview.md
01_folder-layout.md
02_settings.md
03_vocabulary.md

# Part 2 — Content (the sub-document types)
20_issue-md.md
21_comments.md
22_notes.md
23_subtasks.md
24_agent-logs.md

# Part 3 — Tools / activity
41_searching.md
42_updating.md
43_moving-restructuring.md

# Part 4 — Examples
61_multiple-subtasks.md
62_research-focused.md
63_agent-loops.md
64_phase-index.md
```

Source `§` references below point at the current `issue-layout.md` sections.

## Per-file spec — what each file is + what fills it

### Part 1 — Overall (orientation + schema)

- **`00_overview.md` — the entry point.** What the tracker *is* (§0 operating model:
  comprehensive memory of AI-augmented thought-work, one folder per coherent unit) + the
  **lifecycle**: the 4 states `open → review → closed | cancelled` and the **AI rules**
  (§4 — the most important rules in the whole skill: ship to `review`, hand the final call
  to a human, etc.; these MUST live in the entry file so they're always read). Ends with
  the **"where to find what" index table** linking every sibling. Fold §9 cross-references
  in here too. Target ~70 lines.
- **`01_folder-layout.md`** — §1: the `<issue>/` folder tree (settings.json, issue.md,
  comments/, subtasks/, notes/, agent-log/), the 2-level subfolder rule, file/folder mixing
  rules, URL shapes.
- **`02_settings.md`** — §2: the per-issue `settings.json` properties (title, description,
  status, priority, component, labels, author, assignees), which are derived (created from
  slug, updated from git) vs stored, and the one-component best-practice.
- **`03_vocabulary.md`** — §3: the tracker-root `settings.json` — the `fields` vocabulary
  (status/priority/component/labels values + colors), authors, saved views. "Don't add
  scheduling/milestone fields" policy note.

### Part 2 — Content (one self-contained file per sub-document type)

Each Part-2 file is **self-contained**: it documents the shape/naming/frontmatter of that
sub-doc type **and** the recipe to add one (the per-type write recipes move here from §7;
`42_updating.md` keeps only the cross-cutting flow).

- **`20_issue-md.md`** — §5 `issue.md`: the goal/context body, what belongs in it vs a
  note, when it's drifting too long.
- **`21_comments.md`** — §5 comments (shape + `NNN_YYYY-MM-DD_<author>.md` naming, append-
  only, auto-numbered) **+ §7 "add a comment" recipe** (find next NNN, write file).
- **`22_notes.md`** — §5 notes (freeform supporting docs, optional `NN_`/`NNN_` numbering,
  optional `color:`, 2-level grouping) **+ §7 "add a note" recipe**.
- **`23_subtasks.md`** — §5 subtasks (first-class leaf, own state/URL/count; folder = label
  only; `NN_`/`NNN_` numbering, both conventional, leading-digit grouping; 2-level tree)
  **+ §7 "create a subtask" and "update a subtask state" recipes**.
- **`24_agent-logs.md`** — §5 agent-log (iteration audit trail, "read these first when
  picking up work", `NNN_` convention/CLI default, sequence vs `iteration:` frontmatter,
  per-leaf-folder sequence) **+ §7 "add an agent-log entry" recipe**.

### Part 3 — Tools / activity

- **`41_searching.md`** — §6: default search scope; the **"don't use `Grep`/`find` on the
  tracker — use `docs-list`/`list.mjs`"** steering + synonym list; when to spawn a Haiku
  subagent (with the TaskA/TaskB patterns); the **helper-scripts table** (all 8 issue CLIs).
- **`42_updating.md`** — §7 **cross-cutting flow only**: duplicate-check-before-creating
  (when context is thin), creating a brand-new issue (folder + settings.json + issue.md),
  validating after writes, "when NOT to edit." Ends with a pointer table to the per-type
  add-recipes now living in Part 2.
- **`43_moving-restructuring.md`** — NEW/relocated: using **`docs-move`** on the tracker to
  rename/move issues, subtasks, and notes **link-aware** (pull the tracker-relevant bits
  currently in `docs-layout.md`); plus restructuring guidance — promoting a subtask to its
  own issue, splitting/merging issues, regrouping subtask folders. Connects to the
  phase-index pattern (promotion). [Original "etc" file, renamed.]

### Part 4 — Examples (mostly NEW content — only §8 exists today)

Concrete, end-to-end worked examples. Each shows a *kind* of issue so an agent recognizes
the shape and follows the matching workflow.

- **`61_multiple-subtasks.md`** — adapts the current §8 worked example: a standard
  implementation issue with several subtasks — laying them out (gap-numbered), picking up,
  working one, logging, shipping to review.
- **`62_research-focused.md`** — NEW: a research/design issue — heavy `notes/` (design
  decisions, alternatives, rationale), few or no code subtasks, oriented toward a written
  conclusion and review. Models the "thinking" half of the tracker.
- **`63_agent-loops.md`** — NEW: an issue worked across **multiple agent-log iterations** —
  the iterate → agent-log → comment → re-iterate loop; failed iterations kept as signal;
  how the iteration counter + sequence behave across a long autonomous run.
- **`64_phase-index.md`** — NEW: the **phase / index issue** — a meta/epic that represents
  a whole phase or cycle. Its subtasks are *lightweight pointers* (little individual
  context); each is **promoted to its own issue when work begins**, while this issue stays
  the index + roadmap + overall "what is to be done." Model it on the real
  [`2026-04-29-00-phase-one-ideation-and-planning`] pattern used in the parent project
  (parks ordered subtasks → promotes each to its own issue).

## Conventions & wiring (apply during implementation)

- **Entry point:** the SKILL.md triage row for the tracker points at
  `references/layouts/issues/00_overview.md`; the where-to-find-X index lives in that file
  (progressive disclosure — read overview, drill into one sibling).
- **Numbering:** `NN_` prefixes with leading-digit grouping (parts 0/2/4/6; 1/3/5/7
  reserved). Kebab-case filenames. (These reference files aren't sidebar-rendered, but the
  numbering aids navigation and demonstrates the convention.)
- **Self-contained files** — each readable on its own (the skill's stated principle).
- **Link-aware pointer sweep** on implementation: update every live reference to the new
  `issues/<file>.md` paths/entry — `SKILL.md` (triage + inline), `references/writing.md`,
  `references/settings-layout.md`, the three `scripts/{docs,blog,issues}/check.mjs`
  headers, and the framework docs (`user-guide/05_getting-started/05_claude-skills.md`,
  `dev-docs/25_plugins/05_creating-plugins/03_capabilities.md`,
  `user-guide/19_issues/01_overview.md`). Leave `data/todo/` history untouched.
- Build (`bun run build`) must stay green; spot-check the CLI still parses an issue.

## Resolved discussion points

1. **Per-type write recipes → colocated** with their content file (Part 2), not centralized.
2. **Part 4 examples are net-new content** to author (`62`/`63`/`64`); `61` adapts §8.
3. **`64_phase-index`** modeled on the parent project's `2026-04-29-00-phase-one` issue.
