---
title: "Make component a multi-select field (list)"
status: done
---

`component` is currently a single string per issue (`"component": "live-editor"`). Many issues genuinely span multiple components (e.g. editor work that touches the content pipeline) and forcing a single value loses information and skews the "By component" grouping.

Convert `component` from `string` to `string[]` everywhere — same shape `labels` already uses.

## Tasks

### 1. Code — make component multi-select end-to-end

- [x] **Schema / loader** (`src/loaders/issues.ts`) — `IssueMetadata.component: string[]`; `normalizeComponent()` accepts string-or-array-or-missing.
- [x] **Filter logic** — `MULTI_FIELDS` set in `types.ts` + shared `rowValues()` helper in `filters.ts`; component now uses `.some(selected.has)` like labels.
- [x] **Group-by-component view** — `client.ts` apply() now iterates `rowValues(r, groupField)` and pushes the row into every matching bucket (clone-per-placement on the cards side).
- [x] **Detail-page sidebar** — `MetaPanel.astro` renders one StatusBadge per component; existing `dd` flex-wrap covers layout.
- [x] **Editor / form widgets** — N/A for now: issues' `settings.json` is edited as text in the live editor (no structured form widget exists).
- [x] **Vocabulary** — unchanged; root `settings.json` `fields.component.values` is still a string list.
- [x] **Type updates** — `IssueMetadata.component: string[]`; downstream display in `IssuesTable.astro` / `IssuesCards.astro` / `IssueCard.astro` / `MetaPanel.astro` updated.

### 2. Migration — convert existing issues

- [x] One-shot script ran across all 30 per-issue `settings.json` under `dynamic_data/data/todo/*/`. Single-token JSON replace preserves indentation / key order.
- [x] Verified: 30/30 now array-form, zero remaining string values.
- [x] Promotion candidates surfaced (e.g. `editor-diagrams` → `["live-editor", "content-pipeline"]`); none auto-promoted, list captured in commit message for manual review.

### 3. Documentation

- [x] **`19_issues/04_settings/01_per-issue.md`** — schema row, semantics section split (status/priority/milestone single-select; component multi-select), bigger example updated.
- [x] **`19_issues/04_settings/02_vocabulary.md`** — required-fields table marks `component` as multi-select; clarifying paragraph that vocabulary shape is identical for single vs multi.
- [x] **`19_issues/07_ui/01_list-view.md`** — Group-by section explains multi-valued grouping + why per-group counts can exceed unique-issue total; row-fields table mentions chip group.
- [x] **`19_issues/02_design-philosophy.md`** — verified: makes no single-component claim, no edit needed.
- [ ] **Migration note** — short callout in changelog or release notes once shipped (deferred until release notes exist).

## Why now

Cheap to do before more issues accumulate, and the grouping bug ("issue X belongs to live-editor *and* content-pipeline but only shows under live-editor") is already noticeable in the phase-2 view.
