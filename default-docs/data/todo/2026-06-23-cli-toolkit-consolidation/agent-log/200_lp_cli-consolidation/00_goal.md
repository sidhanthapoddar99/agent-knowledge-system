---
title: "Loop goal — CLI toolkit consolidation"
---

# Loop goal — CLI toolkit consolidation

## Goal of completion

Consolidate the `documentation-guide` CLI toolkit into a uniform, discoverable, agent-first surface, and extend it to cover all content types. The loop is **complete** when **all 18 subtasks are `review`/`closed`**, the self-test harness is green, and the POST-EDIT feature matrix (`notes/05`) is recreated with verified values.

**Definition of done (every item true):**

1. **Shared contract** — `_cli.mjs` exists; every command honors `--help` **and** `-h` (to stdout, exit 0), `--json`, and the `0/1/2` exit scheme. (subtasks 02, 05)
2. **Manifest + discovery** — `COMMANDS` is a rich manifest; `docs help`, `docs help <cmd>`, and **`docs help --json`** work and list every command. (subtasks 03, 04)
3. **Orphans wired** — `docs-check-issues` exists and passes on `data/todo/`; `check-skill-links` resolved. (subtask 06)
4. **Bugs fixed** — `docs-show --full` runs; `review-queue` exit code correct. (subtask 07)
5. **Dedup** — link-rewriting / tree-walkers / tool-detection unified. (subtask 08)
6. **Gaps filled** — `--path`/`--meta`/`--count`; docs+blog list/show/search; unified `find`; `git` command. (subtasks 09–12)
7. **Polyglot-ready** — dispatcher can route non-`.mjs`; `resolve-context` exists; contract spec written. (subtask 13)
8. **Self-test green** — `scripts/_selftest.mjs` passes for every command. (subtask 14)
9. **Docs synced** — skills + preferences + CLAUDE.md, then user-guide/dev-docs, updated; plugin version bumped. (subtasks 15, 16, 17)
10. **POST-EDIT matrix** — `notes/05` recreated with shipped values + delta summary. (subtask 18)

**Naming model (subtask 01) is the gate** — decide flat vs `docs <group> <verb>` before building the per-type trio (subtasks 10/11). Don't start those until 01 is decided.

## Order of execution

`01 (decide)` → `02 → 03 → 04 → 05` (contract foundation) → `06, 07, 08` (correctness/cleanup, parallel-safe) → `09 → 10 → 11 → 12` (features) → `13` (polyglot) → `14` (harness — actually start early and run every iteration) → `15 → 16 → 17` (docs/version) → `18` (post-edit matrix). Build `14` early enough to guard each change.

## Testing methodology

Run the **self-test harness** (`bun scripts/_selftest.mjs` once built — subtask 14) at the end of every iteration. It must assert:

- **Contract:** every manifest command — `--help` exits `0` with non-empty **stdout**; `--json` (where applicable) parses via `JSON.parse`; exit codes follow `0` ok / `1` err·no-match / `2` usage.
- **Discovery:** `docs help --json` parses and contains an entry for **every** command in the manifest (catches drift between manifest and reality).
- **Validators:** each `docs-check-*` returns `0` on a known-good fixture and `1` on a known-bad one. `docs-check-issues` returns `0` on the current `data/todo/`.
- **Regression:** `docs-list --json`, `docs-show 2026-06-23-cli-toolkit-consolidation`, `docs-subtasks 2026-06-23-cli-toolkit-consolidation` still produce expected output; `docs-show <id> --full` runs without `ReferenceError`.
- **Cross-platform:** every command in the manifest has a matching `bin/<name>.cmd` twin.

Manual spot-checks per feature: actually run the new command (`docs help`, `find`, `git updated`, docs/blog `list`/`search`) and eyeball output. Record evidence (command + output snippet) in each iteration file.

**Per-iteration file:** `101_…`, `102_…` with **Goal → Approach → Result (with evidence) → Next**. Keep failed iterations. Update `002_task-list.md` as you go. Write `003_summary.md` when the loop wraps; raise blockers in `004_attention-needed.md` if any. Do **not** edit the pre-edit matrix or recreate subtasks here — `agent-log/` is execution record, `subtasks/` is the plan.

## Version control (confirmed policy)

- **First iteration:** create a feature branch `git checkout -b cli-consolidation` (off `main`).
- **Per subtask:** commit the subtask's changes with a clear conventional message (e.g. `feat(cli): add shared _cli.mjs contract`). Granular, revertable, bisectable.
- **Never push.** The human reviews the branch, merges, and pushes. Do not open a PR or push unless explicitly told.
- End commit messages with the standard co-author trailer.

## Scope (confirmed)

**All 18 subtasks**, including 13 (polyglot/Python readiness — enablement only, no Python script ships unless trivial). **Naming model (subtask 01): the loop decides** A vs B in-run and records rationale in `notes/03`.
