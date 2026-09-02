# Writing markdown inside issues

Tracker-specific writing rules for every `.md` under an issue folder. The markdown
mechanics — callouts, collapsibles, diagram fences, Excalidraw and draw.io, asset
embedding, `[[path]]` content embedding, code blocks — and the **linking rule** have one
home: the `agent-ks-docs` skill's [writing.md](../../../agent-ks-docs/references/writing.md).
This page adds only what is different inside a tracker.

## Frontmatter per subdoc type

**`title` is required by convention on every markdown file, and nothing enforces it.**
A titleless file builds fine and ships with the slug as its title. Beyond that, each
subdoc has its own small schema:

| File | Frontmatter |
|---|---|
| `issue.md` | `title` only — metadata lives in `settings.json` |
| `comments/NNN_*.md` | `author` + `date` (YYYY-MM-DD) only — no `title` needed by the loader, but harmless |
| `subtasks/**.md` | `title` + `status` (one of the 8 statuses) |
| `notes/**`, `brainstorm/**`, `agent-memory/**` | `title` (+ optional `color:`) |
| `plans/**/NN_<stage>.md` | `title` + `status`, plus `outcome`, `notes`, `who`, and `subtasks:` — **the only ref list** ([plans](../20_sections/28_plans.md)) |
| `agent-log/**/02_working/*.md` | `title` + `status` + `agent` (+ optional `date`, `color:`) |
| any subdoc | optional `color:` — tints the sidebar label, issue-defined meaning |

- `draft: true` hides a file from the production build (works tracker-wide).
- **Preserve `color:` when editing** — it's user-defined; document meanings in the
  issue's `glossary.md`, and check that glossary before interpreting colours.
- Don't write MDX — pure markdown only.

## Body conventions — write for cold pickup

Tracker prose is read by the *next* agent or a human months later, without your
context:

- **Subtasks / issue.md**: short intro saying what and why; checkboxes with a
  **bolded lead** then the explanation (what/where/how, concrete paths); `##` groups
  when a flat list outgrows itself; link pointers instead of shorthand.
- **Iteration files**: the four-section head — `# Goal / # Inputs / # Expected Outcome
  / # Outcome`, written by `agent-ks issue new-iteration`. Thin but complete: issues
  found get one line each plus a pointer, never the write-up in place.
- **Comments**: a couple of lines + a pointer (the two-paragraph tripwire — see
  [21_comments.md](../20_sections/21_comments.md)).
- **Decision markers**: date + author decided lines (`**Decided (sidhantha,
  2026-07-02):** …`) and graduation markers (`> **Resolved →** <target>`) keep
  provenance in-file.

## Linking — the tracker deltas

> **Reference by link, never by number.** This is the rule most often broken, and it
> is broken by files that are otherwise well written.

```markdown
- [x] `010` — the plans section                                    ← WRONG
- [x] [The plans section](./010_code-the-plans-section.md) — framework,
      CLI and validator                                            ← RIGHT

Blocked by `050` until the version bump ships.                     ← WRONG
Blocked by [the version bump](../050_version-bump.md).             ← RIGHT
```

A number is not a name: *"`050` blocks `100`"* is unreadable to anyone who has not
opened both files. And gap-spaced prefixes exist so `015` can be inserted later; a number
quoted in another file makes the numbering immutable. The rule in full, the backticked-path
exception, the convert-when-found rule and the ordering label (`[040/100 the migration
script](…)`) are in [writing.md → Linking](../../../agent-ks-docs/references/writing.md#linking).

What is specific to the tracker:

- **A tracker URL keeps its ordering prefixes** — `subtasks/020_impl/010_backend.md` is
  served at `…/subtasks/020_impl/010_backend`, unchanged. The path you write and the
  path a reader lands on are the same string. Docs and blog strip prefixes, which is why
  a link *leaving* the tracker is the one case that needs care.
- **`Related:` lines** at the end of a body are the convention for soft references
  (duplicate-check hits, sibling subtasks, superseded issues).
- **A non-markdown sub-doc is marked for you.** A diagram or an artifact beside an
  issue's markdown carries a trailing type glyph in the sidebar. Never hand-label a
  file's type in its own title.

## Diagrams and artifacts as sub-docs

Mermaid and Graphviz fences and ASCII trees render everywhere in the tracker. Diagram
source that should not live inline goes in the issue's `assets/` and is embedded by
reference inside the fence (`[[./assets/flow.mmd]]` from `issue.md`,
`[[../assets/flow.mmd]]` from a file in `notes/`). Any subfolder can have its own
`assets/`; it never appears in a sidebar.

**A diagram file can be a supporting doc itself.** Drop a `.mmd` / `.dot` /
`.excalidraw` / `.drawio` file directly into `notes/`, `brainstorm/`, `agent-memory/` or
`agent-log/` and it renders as a first-class entry with its own sidebar item and URL.
Use this when the diagram *is* the doc; keep embed-only diagrams in `assets/`.
**Subtasks are the exception**: a subtask is a status-bearing checklist item, so it stays
markdown — embed a diagram into its body from `assets/`.

**An `.html` artifact** lives in `notes/` or `brainstorm/` and renders embedded as a
first-class sub-doc, with an open-full-page link to `/artifacts/<path-from-content-root>`.
It is built with the `agent-ks-artifacts` skill; the tracker concern is only where it
lives ([22_notes.md](../20_sections/22_notes.md#first-class-artifacts--diagrams)). When a
design settles from draft to canon, promote it to a published docs section.

Live demo of embeds: `2026-04-10-editor-diagrams/notes/02_embed-verification.md`.

## Ordering prefixes in the tracker

Same shared grammar as everywhere (2–5 digits, sorted by numeric value, `_` canonical,
gap-spaced), but in the tracker **both `NN_` and `NNN_` are conventional**, and the
prefix is **optional** for most subdocs:

| Where | Convention |
|---|---|
| `subtasks/` | `NN_` or `NNN_` freely (leading digit can annotate a group) — see [23_subtasks.md](../20_sections/23_subtasks.md) |
| `comments/` | `NNN_` **auto-numbered by the CLI** — the number is the comment id, never hand-gapped |
| `agent-log/` | `NNN_<code>_<name>/` per run; its slots are `01_summary.md` / `02_working/` / `03_debrief/` and a nested run is `≥ 100`; inside `02_working/`, `NNN_` where the first two digits are the iteration — see [24_agent-logs.md](../20_sections/24_agent-logs.md) |
| `plans/` | `NN_<name>/` per plan; `NN_<stage>.md` gap-spaced by ten — see [28_plans.md](../20_sections/28_plans.md) |
| `brainstorm/`, `notes/` | optional; gap-number only when reading order matters |
| `agent-memory/` | usually none — name by topic |
