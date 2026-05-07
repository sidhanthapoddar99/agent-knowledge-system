---
title: "Drop `milestone` from the tracker (clean removal — no trace)"
state: open
done: false
---

- [ ] **Relax validator first.** Update `plugins/documentation-guide/scripts/issues/check.mjs` (and any helpers in `_lib.mjs`) so a missing `milestone` field is OK — neither required nor warned. This commit lands on its own and unblocks all the steps below.
- [ ] **Strip `milestone` from every existing issue's `settings.json`.** Sweep `default-docs/data/todo/*/settings.json` and remove the field. One commit, mechanical edit, no behaviour change after the validator relaxation.
- [ ] **Remove from the schema.** Wherever the issue settings shape is typed or documented (look under `astro-doc-code/src/loaders/issues.ts`, any `IssueSettings` interface, JSON schema if one exists). Field disappears from the type system.
- [ ] **Remove from views config.** `default-docs/data/todo/settings.json` declares `milestone` in the `fields:` vocabulary and probably uses it in `views:` (group-by, filter). Strip both. Whatever views referenced milestone need to be deleted or re-pointed (likely to `priority`).
- [ ] **Remove from plugin code.** Audit `plugins/documentation-guide/scripts/issues/*.mjs` for any read of `milestone` (sort, filter, display). Drop the column / argument / view entirely. `docs-list --milestone <x>` arg disappears.
- [ ] **Remove from layouts.** `IssuesTable.astro` / `IssuesCards.astro` / `FilterBar.astro` / `PresetStrip.astro` — anywhere the milestone column / chip / filter chip lives. Gone.
- [ ] **Remove from CLI templates.** Any `add-issue` / `new-issue` plugin script that templates a fresh `settings.json` must stop emitting `milestone`.
- [ ] **Remove from docs.** Search `default-docs/data/user-guide/19_issues/` for any page mentioning `milestone` and prune. Plugin skill `references/issue-layout.md`: same.
- [ ] **No reference means no reference.** No `// removed milestone` comments. No "field deprecated, ignored if present" notes. No migration shim. The field never existed.
- [ ] **Test**: `docs-check-section default-docs/data/todo` exits 0; index renders without errors; `docs-list` works without milestone arg; `docs-show` no longer shows a milestone line.

## Files likely touched

- `plugins/documentation-guide/scripts/issues/check.mjs`, `_lib.mjs`, `list.mjs`, `show.mjs`, `add-*.mjs`
- `default-docs/data/todo/settings.json` (`fields.milestone`, `views.*`)
- `default-docs/data/todo/*/settings.json` (mass strip — scriptable)
- `astro-doc-code/src/loaders/issues.ts` and any `IssueSettings` type definition
- `astro-doc-code/src/layouts/issues/default/parts/index/IssuesTable.astro`, `IssuesCards.astro`, `FilterBar.astro`, `PresetStrip.astro`, `scripts/index/types.ts`, `filters.ts`, `groups.ts`, `client.ts`
- `default-docs/data/user-guide/19_issues/**`
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`, `writing.md`

## Sequence inside this subtask

Validator relaxation first. After that, each step is independent and mechanical.
