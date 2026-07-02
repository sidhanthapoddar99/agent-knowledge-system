---
title: "Iteration 2 — code ↔ user-guide bidirectional audit"
iteration: 2
status: success
---

## Goal

One Opus agent, read-only: trace every factual claim in
`user-guide/19_issues/` (all pages) + the themes `07_issues-styles.md` against
the actual code — loaders (`issue-status.ts`, `issues.ts`), the
`issues/default/` layout (index client scripts included), and CLI `check.mjs` —
in **both** directions: docs→code (is each claim true?) and code→docs (is each
user-facing behaviour documented?). JSONC examples were mentally traced through
`resolveVocabulary` to confirm they'd pass the validator.

## Result — 5 discrepancies (all docs-wrong-code-fine) + 2 minor omissions

1. **Preset `filters: { "status": [...] }` is a silent no-op** (wrong).
   `02_vocabulary.md:100` and `01_list-view.md:67` both showed a "Blocked" preset
   filtering on `status` — but presets only iterate the fixed filterable fields
   (`priority`/`component`/`labels`/`assignees`, `scripts/index/types.ts:52`);
   a `status` key renders a button that filters nothing and never highlights.
   Status is filtered only by the category tabs. The same doc's *second* example
   correctly used `labels`. **Our own `data/todo/settings.jsonc` "Blocked" view
   had the same dead filter** — a live instance of the bug the docs taught.
2. **"Table — default for ≥10 visible issues"** (wrong, `01_list-view.md:139`) —
   no count-based logic exists; table is always the default (`client.ts:791`).
3. **View choice "persists via URL param (`?view=cards`)"** (wrong,
   `01_list-view.md:142`) — it persists in `localStorage`
   (`issues-view-mode`), never in the URL.
4. **"An extra description … is flagged too"** (wrong, `02_vocabulary.md:211`) —
   neither the loader nor `check.mjs` flags orphan descriptions; both check
   *missing* only.
5. **Themes page `07_issues-styles.md` documents CSS classes that don't exist**
   (`.issues-state-tab`, `.issues-row`, `.issues-filter-chip`, …) — pre-existing
   and already ticketed separately; not part of the v0.7.0 changes.

Omissions: the preset-view schema table skips the working `search` field; and
`09_using-with-ai.md` still frames the skill/CLI as "planned" (pre-existing,
separate ticket).

Verified correct (highlights): all seven status names/colours and four categories
everywhere they're stated; `fields.status` hard error, `statusColors` top-level
subset-of-seven with merge-over-defaults; descriptions required/optional split;
both big JSONC examples pass `resolveVocabulary`; review-debt badge/tab
inheritance semantics exactly as documented; six index tabs in order with Active
default; default sort `priority desc, updated desc`; folder regex, git-derived
`updated`, draft semantics.

## Next

Items 1–4 + the `search` omission fixed in the fix wave (milestone 105); item 5
and `09_using-with-ai.md` stay with their separate tickets.
