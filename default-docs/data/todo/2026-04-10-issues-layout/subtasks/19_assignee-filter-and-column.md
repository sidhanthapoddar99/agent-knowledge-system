---
title: "Assignee filter · assignee column · in-progress semantics"
state: closed
---

Add `assignee` as a first-class filter dimension in the UI, surface assignees as a table column, and codify the **"in-progress = has assignee"** model across the docs and the skill.

The script side (`list.mjs`) already supports `--assignee`, `--due-after`, `--due-before` from subtask 08. This subtask wires the **assignee** dimension into the visual UI and pulls the *meaning* through the rest of the system so a human and an agent both reach for the same lever. The `due` date-range filter is **deferred** — `--due-after` / `--due-before` cover the CLI agent path, and the date-range UX is a separate UI question (calendar vs date inputs vs presets like "this week / overdue") worth its own design pass.

## Conceptual model — `assignees` is the in-progress signal

An issue with **at least one assignee** is "actively being worked on." An issue with `assignees: []` is unassigned and idle. Multiple people may be assigned to one issue (the field is already `string[]` in the schema — see `04_settings/01_per-issue.md`).

We deliberately do **not** add a separate `in_progress` boolean. Two sources of truth for the same fact rot — they drift the moment someone updates one and forgets the other. `assignees.length > 0` is enough.

### Two-tier filter on assignees

1. **Coarse** (two pseudo-values): `assigned` / `unassigned` — "is anybody on this?"
2. **Fine** (vocabulary-driven): specific names from the tracker root's `authors[]`

The coarse filter is the primary "in-progress" indicator. The fine filter narrows to "what is X working on." Both compose AND across fields, OR within a field — same as every other filter row.

## Parts (track each as a checkbox)

- [x] **Script** — `--assignee assigned` keyword added (mirror of `unassigned`); pseudo + literal values OR-compose; `--help` updated
- [x] **Filter — UI**
  - `assignees` row added to the FilterBar with pseudo-values `assigned` / `unassigned` above a divider, then per-person values from `vocabulary.authors`
  - `IndexBody.astro` synthesises the filter group (authors come from `vocabulary.authors`, not `vocabulary.fields`)
  - `types.ts` extends `FIELDS` and `MULTI_FIELDS`; new `PSEUDO_VALUES` table drives the special-case match logic
  - `filters.ts` `rowFieldMatches()` handles the pseudo-values (OR-composed with literal-name matches)
  - `client.ts` `renderAddMenus()` counts pseudo-value rows by checking array length, not literal `.includes()`
- [x] **Column — UI**
  - `Assignees` column added to `IssuesTable.astro` between `Milestone` and `Subtasks`
  - Renders avatar circles (deterministic colour from name, first 3 visible, `+N` for the rest, `—` if unassigned)
  - `data-assignees` on table AND cards rows so the same client filter path works in both views
  - Sort by first assignee alphabetically; unassigned sinks to the bottom (`~` suffix exploits ASCII ordering)
- [x] **Update the docs + the skill**
  - `dynamic_data/data/user-guide/19_issues/04_settings/01_per-issue.md` — under "`author` vs `assignees`", explicitly state that `assignees.length > 0` powers the in-progress filter; mention the coarse vs fine modes
  - `dynamic_data/data/user-guide/19_issues/07_ui/` — document the new column and the `assigned` / `unassigned` pseudo-values in the filter bar
  - `.claude/skills/documentation-guide/references/issue-layout.md` §2 (Properties) — call out the in-progress derivation and warn agents against suggesting a redundant `in_progress` field
  - Same file §6 (Searching) — add example commands: `list.mjs --assignee unassigned --priority high` ("high-priority work nobody's picked up"), `list.mjs --assignee assigned --has-open-subtasks` ("things in flight with open work left")

## Out of scope

- Adding an `in_progress` boolean to the schema. The whole point of this subtask's model is that we *don't* duplicate state.
- Real avatar images. Initials in deterministic-coloured circles is enough. Avatars-from-URL is a separate, optional polish.
- The `due` date-range filter UI. CLI agents already have `--due-after` / `--due-before` via `list.mjs`; the visual UX (date inputs vs calendar picker vs presets like "this week / overdue") is a separate design question and gets its own subtask if/when needed.
- A new `views` preset that uses the assignee filter — easy to add later once the filter is live.
