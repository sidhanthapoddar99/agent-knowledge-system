---
title: "Milestone 103 — skill-plugin propagation + CLI naming unification (subtask 06)"
---

## Goal

Propagate the new 7-status / 4-category lifecycle into the plugin's operating manual —
both skills (`doc-issues` and the sibling `documentation-guide`) plus the repo
`CLAUDE.md` — then bump the plugin version and mirror the whole plugin into the installed
cache so `docs-guide` (which runs the cache copy) reflects the change. This is subtask 06;
it deliberately lands **before** subtask 09 restructures `doc-issues/references/` into
folders, so 09 rebases onto final content rather than the reverse.

## Approach

Parallelised the mechanical half and did the semantic half by hand:

- **Subagent (Haiku):** the five reference files that were pure vocabulary swaps —
  `41_searching.md` (heaviest — default-scope prose, the discoverability-tip example,
  `--include-cancelled`→`--include-closed`), `42_updating.md`, `43_moving-restructuring.md`,
  `21_comments.md`, `10_writing.md`. It reported five judgment calls back; three were real
  and I actioned them (below).
- **By hand:** `SKILL.md` (Lifecycle section → 7-status table + 5 condensed AI rules; the
  operating-model line that still called transient state a *label*), `references/00_overview.md`
  (same transient-state reversal + ordering line), `02_settings.md` (assignee-derivation
  section was already reversed in an earlier pass — confirmed), `03_vocabulary.md`,
  `23_subtasks.md`, and the four worked examples `61`–`64` (`state:`→`status:`,
  `closed`→`done`, the `wip`-label example → real `status: in-progress`).
- **Sibling `documentation-guide` skill:** `cli-toolkit.md` (removed a stale duplicate
  `set-state` row; corrected the flags), `_manifest.mjs`, `review-queue.mjs`, and the CLI
  scripts' help/comment text.
- **Repo `CLAUDE.md`:** enriched the `doc-issues` skill blurb with the 7-status /
  4-category model; confirmed the mental-model paragraph had no assignee-derivation to strip
  and its ordering line (`priority desc, updated desc`) already matched the code.

## Result — what changed beyond the plain vocabulary swap

Three things surfaced that were more than find-replace:

1. **CLI naming unification finished (the subtask-07 tail).** The framework TS side had
   already renamed the subtask field `.state`→`.status`, but the JS CLI mirror still exposed
   `.state`. That left a real user-facing split: `issue show --json` emitted `status` for
   issues but `state` for subtasks. Renamed the internal property across `_lib.mjs`,
   `list.mjs`, `subtasks.mjs` (incl. the grouped-tree leaf — which would otherwise have
   rendered `[undefined]`), and `show.mjs`. The frontmatter reader still accepts legacy
   `state:`, and the CLI `set-state` verb / `--state` flag alias stay (deliberate — like the
   DOM `data-state`). Verified with live `--json` + filter runs.
2. **User-facing tip text was stale.** `list.mjs` still printed `showing open,review only …
   --include-cancelled`. The doc (`41_searching.md`) already described the new text, so the
   code was the drift — now `showing active only … --include-closed`, matching the doc
   exactly. Also fixed the accompanying comments and `subtasks.mjs`'s stale "open + review"
   default-scope comment and `check.mjs`'s stale 4-value status list.
3. **AI-rule cross-reference numbers.** `00_overview.md` now has six AI rules; two references
   still cited the old numbering — `21_comments.md` (dropped-needs-comment is #6, was #5) and
   `41_searching.md` (default-search-scope is #3, was #2). Fixed.

**Version:** `plugin.json` 0.4.0 → 0.5.0 (minor — new lifecycle vocabulary, CLI flag
additions, breaking status-value change). The install is git-sourced and the loader pins
`installPath: …/0.4.0` via `installed_plugins.json`, so the established dev-sync is to mirror
into the active `0.4.0/` dir (a real `/plugin` re-install from git will mint the `0.5.0/`
dir later); did **not** hand-edit Claude Code's lockfile.

## Verification

- `bun run build` — exit 0, 639 pages, Complete! (only the pre-existing unrelated
  `03_standalone-theme.md` YAML warning).
- CLI self-test (`_selftest.mjs` under bun) — PASS.
- `docs-guide check issues` — exit 0, `✓ no errors` (4 pre-existing unrelated warnings).
- Live exercise of the renamed CLI: `subtasks` (grouped + `--flat` + `--json`), `show`,
  `list --has-open-subtasks` / `--has-review-subtasks`, `review-queue` — all correct;
  `--has-review-subtasks` returns exactly the 3 issues `review-queue` surfaces.
- `rsync` repo plugin → cache `0.4.0/` then `diff -rq` (excluding `.in_use`/`.orphaned_at`
  transient markers) → **IDENTICAL**. Confirmed `docs-guide` on PATH now runs the new code.

## Next

Subtask 06 → review. Then subtask 08 (post-completion consistency sweep) — carry these
out-of-scope finds into it: `25_themes/…/07_issues-styles.md` still names
`.issue-subtask__state--cancelled`/`closed` CSS classes; also sweep dev-docs and re-check
the user-guide's own `AI rule #N` cross-references against the 6-rule list. Then subtask 09
(skill restructure — foldered references, documentation-guide prerequisite note, scripts
home decision), which will rename files 06 just edited.
