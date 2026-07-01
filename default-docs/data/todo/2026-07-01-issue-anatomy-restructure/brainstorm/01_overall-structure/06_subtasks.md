---
color: var(--color-success)
---

# Subtasks

**Scope:** the plan — a checklist of what's to be done, each with a state
(`open` / `review` / `closed` / `cancelled`). This is the *what*; agent-log records the
*how*. Typically created **after** notes settle the approach; updated as loops close
them out.

## Structure (current — kept as-is)

```
subtasks/
├── 01_setup.md                  ← one subtask per file: NN_<slug>.md
├── 02_build/                    ← group folder: NN_<group>/ — a plan "chapter"
│   ├── settings.json            ←   { "title": "Build the sections" } (display title)
│   ├── 01_backend.md            ←   subtasks inside, same shape
│   └── 02_frontend.md
└── no-prefix.md                 ← unprefixed is valid — sorts last, label-only
```

A subtask file — `title` + `state` frontmatter, body free-form (checklists work well):

```markdown
---
title: Setup fixture scaffolding
state: closed                    # open | review | closed | cancelled
---
- [x] Create the issue folder + settings.json
- [x] Draft issue.md
```

- **`NN_` prefix orders** (2–5 digits, by value); the group folder's prefix orders the
  group among its sibling files. A group's `settings.json` carries its display title.
- **States:** `open` (to do) → `review` (done, awaiting sign-off) → `closed`;
  `cancelled` for dropped work. Terminal = closed + cancelled (the `is-done`
  strikethrough treatment). State is cycled from the UI (dev) or `docs-set-state`.
- **Surfaces:** sidebar tree (state icon + `NN` badge per row) · **Comprehensive**
  panel (every subtask on one page, filter tabs by state) · right-rail subtask index ·
  the overview's progress bar.

## Decided

- **Works as-is** — no structural changes; the shape above is the settled design.
- **Folder count = `done/total`.** A group folder shows completed-over-total
  (e.g. `1/2`) instead of a raw file count — mirroring the section header's count.
  "Done" = terminal states, same as the `is-done` row treatment. Live-updated when a
  state is cycled, scoped per folder.
- **Section header count** stays `done/total` with the amber **review-dot** when any
  subtask sits in `review`.
- When to group vs stay flat is the **author's call** — no rule; grouping exists for
  plans big enough to need chapters.
- The "AI-handoff-bound issues declare ≥1 subtask" best practice stays a **validator
  hint** (per the tracker mental model), not a hard rule.
- For fast change-bursts, a subtask can serve as a **running checklist** — see "Fast
  bursts" in `07_agent-log` for when that beats an `it` agent-log activity.
