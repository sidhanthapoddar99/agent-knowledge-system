---
title: "Milestone 1 — code + migration landed (subtasks 03 + 07)"
iteration: 1
status: success
---

## Goal

Implement the decided 4-category / 7-status model end-to-end in code, migrate the
tracker data to the unified `status` vocabulary, and reach a green checkpoint
(build + `docs-guide check issues`) — subtasks 03 (code) and 07 (state→status
unification + migration).

## Approach

Order chosen to keep every checkpoint green (per `00_goal.md`): ship the loader +
frontend first with **read-time legacy normalization** (loader maps
`closed→done`, `cancelled→dropped` and tolerates the old `state:` field name with a
warning), so the new code runs against un-migrated data without a hard failure.
Then wrote + ran the migration to clean the data, then updated the CLI to the new
vocabulary, then flipped nothing else — the hard "unknown status" error was safe to
enable from the start because legacy values are *mapped*, not *rejected* (only
genuinely-invented statuses throw).

## Result — shipped

**The single constant.** New `astro-doc-code/src/loaders/issue-status.ts` is the
sole source of the 7 statuses, 4 categories, default colors, legacy map, and
helpers (`categoryOf`, `normalizeStatus`, `isValidStatus`, `unknownStatusMessage`).
The loader re-exports it; the CLI mirrors it in `_lib.mjs` (JS side of the wall).

**Loader** (`issues.ts`): reads `status:` (legacy `state:` tolerated + warns),
renamed in-memory `IssueSubtask.state` → `.status` + added derived `.category`,
issue `meta.status` validated/normalized, **unknown status throws** the detailed
copy-pasteable error, silent default-to-open removed. Toggle endpoint
(`middleware.ts`) now writes `status:` and strips any legacy `state:`.

**Frontend** (all of `layouts/issues/default/`): list tabs are now the 4
categories + Active + All (Active default, preserves "closed hidden by default");
review-debt promotion keyed off the Review *category*; 7-status icons + colors;
Comprehensive panel tabs are categories; subtask click-cycle is the happy path
`open → in-progress → review → done`; badges/pills/progress bars remapped. Field
rename `.state` → `.status` rippled through ~20 files (DOM attribute `data-state`
kept as an internal rendering detail).

**Migration** (`migration/2026-07-02_state-to-status.py`, modeled on the
`done-to-state` precedent): renames subtask `state:` → `status:` and maps
`closed→done` / `cancelled→dropped` in both subtask frontmatter and issue
settings.json. Ran on `data/todo`: **248 files changed** (229 subtask field
renames + 19 settings value remaps). `verify` exits 0, idempotent on re-run.

**CLI** (`docs-guide`, repo source + installed cache, `diff -rq` identical):
`_lib.mjs` vocabulary + reader (`status` w/ legacy `state` fallback),
`check.mjs` validates both levels against the 7 (legacy → warn-to-migrate,
unknown → error), `set-state.mjs` writes `status` + **the subtask-targeting bug is
fixed** (new `--subtask <num|slug>` resolves the file; an unresolved selector
errors instead of silently flipping the issue status), `list.mjs` default scope =
non-closed + `--include-closed`, `subtasks.mjs` / `show.mjs` / `review-queue.mjs`
category-aware.

**Root `settings.jsonc`:** status shrunk to colors-only (7 decided colors) with a
"fixed in code" comment; `wip` + `blocked` labels annotated DEPRECATED (kept, not
stripped — per decision); "Blocked" view now filters `status: blocked`; "Assigned"
view removed (assignees no longer signal progress).

## Verification

- `bun run build` — green (636 pages; zero legacy warnings after migration).
- `docs-guide check issues` — green (only 4 pre-existing unrelated warnings).
- set-state `--subtask 03 in-progress` → subtask changed, **issue status stayed
  `open`** (bug fix confirmed). Invalid `banana` → rejected with the 7-value message.

## Next

Subtasks 04 (user-guide), 05 (guide.ts), 06 (skill plugin) — propagate the model
into prose; then 08 (consistency sweep), then 09 (skill restructure). Product
choices made this iteration that sidhantha may want to revisit in the sweep: the
"Active" default meta-tab, and the click-cycle happy-path subset (blocked /
input-needed / dropped are set by editing, not cycling).
