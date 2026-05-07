---
title: "Subtasks: 2-level folder subgrouping (mirror notes / agent-log)"
state: open
done: false
---

- [ ] **Loader: discover folders inside `subtasks/` up to 2 levels deep.** Today `subtasks/` contains flat `NNN_*.md` files. Extend the loader so a `NNN_<group>/` folder is treated as a logical group containing leaf subtasks. Each leaf `NNN_*.md` inside (at any depth ≤ 2) remains a **first-class subtask** — full `state`/`done` frontmatter, its own URL, counted independently in totals, surfaced individually in `docs-list` search. The folder itself has **no body file**; it's a grouping label, not a parent subtask.
- [ ] **Routing: extend URL shape to `/<tracker>/<issue>/subtasks/<group>/<slug>` and `/<tracker>/<issue>/subtasks/<group>/<subgroup>/<slug>`.** Update `route-match.ts` and `static-paths.ts` mirroring how subtask 20 extended notes / agent-log.
- [ ] **UI: render grouped subtasks in `SubdocTree.astro` as labelled sections with the group's `NNN_` prefix preserved.** Visual goal: the whole folder displays as a single numbered group (e.g. "02. Implementation"), with its leaf subtasks rendered nested underneath using their own numbers. Numbering stays visible at every level so reordering is unambiguous.
- [ ] **Folder-level `settings.json` override (optional).** Allow each group folder to ship a `settings.json` with at minimum a `title` field overriding the slug-derived label (and any future per-group metadata). Absent file → fall back to slug → human label conversion. Mirrors the way issue tracker root + section folders already use `settings.json`.
- [ ] **CLI: `docs-subtasks` defaults to grouped output, `--flat` to flatten.** Default tree output lets the agent see the human's grouping intent. `--flat` gives the agent a one-shot list when grouping doesn't matter. Cross-issue mode (`--all`) should also support `--flat`.
- [ ] **Validator: `docs-check-section` warns on >2 level subtask nesting.** Same shape as the agent-log / notes nesting cap landed in subtask 20.
- [ ] **Test fixtures.** Add at least one issue with 2-level nested subtasks (e.g. `subtasks/02_impl/01_backend.md`, `subtasks/02_impl/02_polish/01_styles.md`) so loader / routing / UI all exercise the deepest path.
- [ ] **Update docs.** Refresh `default-docs/data/user-guide/19_issues/` pages that describe the issue folder structure and subtask conventions — call out the optional 2-level folder grouping, the `NNN_` numbering rule, and the optional `settings.json` override per group folder.
- [ ] **Update plugin skill.** Reflect the same in `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md` so the skill's mental model matches reality. Update any subtask-related script docs (`subtasks.mjs`, `set-state.mjs`, `_lib.mjs`) that assume flat layout.

## Background

This is the same shape as subtask 20 (which gave `notes/` and `agent-log/` a 2-level subfolder tree), re-applied to `subtasks/`. The folder is a **grouping label**, not a parent subtask with its own body — that's the key conceptual choice. Every `.md` leaf is still a regular subtask; the folder just renders them as a labelled section.

### Why grouping instead of true sub-subtasks

Two options were on the table earlier:

1. **Folder-per-subtask (sub-subtask hierarchy)** — `subtasks/21_foo/issue.md` plus child subtasks. Treats each subtask as a mini-issue with its own breakdown.
2. **Folder-as-group-label** *(this subtask)* — `subtasks/02_implementation/` with leaves `01_backend.md`, `02_frontend.md`, etc. No body file in the folder. Children are first-class subtasks, just visually grouped.

Option 2 wins because: (a) it's the same pattern as notes / agent-log, so users learn one folder shape, not two; (b) no new body-file convention to debate (`subtask.md` vs `index.md` vs `issue.md`); (c) no parent/child state-inheritance design (does the parent's `done` come from children? — gone); (d) counting and search stay simple — every `.md` is one subtask, period.

If a subtask grows complex enough to warrant its own breakdown, promote it to a sibling issue.

## Visual rendering target

```
Subtasks
  01. Setup
  02. Implementation              ← group label, single number
      1. Backend                  ← leaf subtask
      2. Frontend
      3. Polish                   ← nested group
          1. Styles
          2. A11y
  03. Docs
```

Numbering stays visible at every level. The group folder owns one number; its leaves own their own numbering scheme inside.

## Files likely touched

- `astro-doc-code/src/loaders/issues.ts` — recursive folder scan in the subtasks loader (cap at 2 levels).
- `astro-doc-code/src/pages/lib/route-match.ts`, `static-paths.ts` — URL extension.
- `astro-doc-code/src/layouts/issues/default/parts/detail/SubdocTree.astro` — grouped rendering of subtasks.
- `astro-doc-code/src/layouts/issues/default/parts/detail/DetailSidebar.astro` — possibly minor wiring.
- `plugins/documentation-guide/scripts/issues/subtasks.mjs`, `_lib.mjs`, `check.mjs`, `set-state.mjs` — handle nested paths; add `--flat`; warn on >2 levels.
- `default-docs/data/user-guide/19_issues/03_folder-structure.md` and any subtask-related page.
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`.
