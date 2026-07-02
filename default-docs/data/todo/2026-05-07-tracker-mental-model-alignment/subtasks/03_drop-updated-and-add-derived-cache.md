---
title: "Drop manual `updated` field; derive it from git history (cache loader + UI integration)"
status: done
---

The third field-drop in this issue. Pairs with subtasks 01 (`milestone`) and 02 (`due`) — same "no reference means no reference" cleanup. Difference: the manual `updated` field gets *replaced* with a server-side derivation, not just deleted, so the index can still show meaningful "last touched" dates.

- [x] **Build the cache loader** — `astro-doc-code/src/loaders/issue-dates.ts`. Single `git log --no-merges --name-only --pretty=format:'§%aI' -- <tracker-path>` walk on cold start. Incremental refresh via `git merge-base --is-ancestor`. `.git/HEAD` watcher for invalidation. In-memory map only — no `.cache/` file.
- [x] **Plumb derived `updated` and parsed `created` through `loaders/issues.ts`.** Issue payload exposes both side-by-side: `created` from the folder-slug `YYYY-MM-DD-...` prefix, `updated` from the cache. Stop reading `settings.json → updated`.
- [x] **Consume in layouts.** `IssuesTable.astro` and `IssuesCards.astro` read `issue.updated` directly. Default index sort becomes `priority desc, updated desc` (matches the priority-column subtask). Detail header shows both `created` and `updated`.
- [x] **Strip `updated` from every existing issue's `settings.json`** in a single mechanical commit. **Relax the validator first** so `docs-check-section` doesn't fail mid-migration — same coupling as the milestone / due drops.
- [x] **Remove `updated` from the schema** (issue settings type / interface) and from CLI templates that emit fresh `settings.json` files.
- [x] **Update plugin skill and CLI**: `docs-list --sort updated`, `docs-show` displays both dates, `references/issue-layout.md` mental model updated, `references/writing.md` drops the "remember to bump `updated`" guidance.
- [x] **No reference means no reference** — same rule as subtasks 01 and 02. No deprecation notes, no `// removed` comments, no migration shim. The manual field never existed.
- [x] **Test**: cache populates correctly on cold start; incremental refresh after a commit updates only the touched issue; index sort by `updated` matches `git log` order; layouts render without errors; `docs-check-section` exits 0 after the migration.

## Background

Full design rationale, cache shape, four-state invalidation discriminator, performance numbers, and fallback policy live in [`../notes/derived-issues-updates/`](../notes/derived-issues-updates/00_design-rationale.md). The six numbered notes (`01–06`) in that folder mirror the bullets above and carry per-step detail (file paths, edge cases, test fixtures).

## Why one subtask, not six

The work is small enough that one human or one agent can pick it up in a single sitting. Splitting into six subtasks added bookkeeping without unblocking parallelism. Notes folder preserves the per-step detail for whoever picks it up; this subtask is the handoff anchor.

## Coupling with subtasks 01 and 02

All three field-drops share the validator-first ordering: `docs-check-section` must accept missing `milestone` / `due` / `updated` before any of those fields are stripped from existing `settings.json` files. Validator commit can be one combined commit covering all three, or three small commits — author's call. The point is: relax before you strip.

## Landed

`astro-doc-code/src/loaders/issue-dates.ts` is the new cache loader (cold-start `git log` walk, incremental via `merge-base --is-ancestor`, `.git/HEAD` + active-branch-ref watcher integration in `dev-tools/integration.ts`, in-memory only). `loaders/issues.ts` parses `created` from the folder slug, calls `getIssueDate()` for `updated`, falls back to `created` on cache miss; `Issue` interface now exposes both fields explicitly. Layouts (`IssuesTable.astro`, `IssuesCards.astro`, `IssueCard.astro`, `MetaPanel.astro`) read `issue.updated` directly. `show.mjs` derives the same value via a one-shot `git log -1` invocation and prints both Created and Updated lines.
