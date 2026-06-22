---
title: "Summary — CLI consolidation loop"
date: 2026-06-23
agent: claude-opus-4-8
---

# Summary — CLI toolkit consolidation loop

All 18 subtasks landed on branch `cli-consolidation` (one commit per subtask, **never pushed** — human merges). Self-test **117/117 green (bun)**; `docs help --json` matches `_manifest.mjs` exactly (28/28). Loop complete.

## What shipped

**Surface: 13 → 28 commands** behind a single manifest-driven dispatcher. Every command is reachable as `docs <group> <verb>` *and* as a flat `docs-*` alias.

- **Category 0 — contract (closed).** `_cli.mjs` (shared `parseArgs`/`emitJson`/`writeStdout`/`die`/`usageError`); `cli.mjs` central `--help`/`-h` interceptor rendered from the manifest; uniform `--json` and exit codes (`0`/`1`/`2`, `127` for missing interpreter); `docs help` + `docs help --json` discovery; `docs resolve-context`; the written `CONTRACT.md`.
- **Category 1 — cross-content.** `docs find` (schema-agnostic search over docs+blog+issues+config, `--meta`/`--path`/`--type`/`--count`/`--paths-only`); `git` group (`updated`/`changed`/`log` + guarded `commit` that never pushes); existing `move`/`img`.
- **Category 2.** docs/blog `list`/`show`/`search` (`_content.mjs` + 6 commands) — the root-cause fix for the original search failure; orphaned issues validator wired as `docs-check-issues`; `docs-check-skill-links`.
- **Search-scoping flags** `--path`/`--meta`/`--count` on `docs-list` (and `find`) — `docs-list --path astro` now finds the astro issue in one call (the trigger for this whole issue).
- **Polyglot-ready** dispatcher: `_runtime.mjs` interpreter detection (py→python3→python), runtime routing in `cli.mjs`, proven end-to-end with a throwaway `.py` (reverted). No Python ships.
- **Plugin 0.2.1 → 0.3.0**; CLAUDE.md, both skills (where relevant), `41_searching.md`, the user-guide catalogue + installation pages, and the dev-docs bin-wrappers architecture all synced; project memory recorded.

## Notable fixes found mid-loop

- **stdout truncation bug** — `process.exit()` truncates large async stdout on a pipe (corrupted `--json` past ~65KB). Fixed with synchronous `writeStdout` (`fs.writeSync(1,…)`) across `emitJson` and all bulk emitters. Verified 244KB `find --json` parses clean.
- **`show --full`** ReferenceError (unimported fs/path) — fixed.
- **`docs` bare-name collision** (CUDA ships a `docs` binary) — documented; flat `docs-*` aliases are the collision-safe form.

## Deferred by design (filed as issue comment 001)

`link-check`, `settings`, CLI `new/create`, `renumber`, `vocabulary` — all additive future commands; none blocks the consolidation goal. See `notes/05_post-edit-feature-matrix.md` delta.

## Handoff

Branch `cli-consolidation` is ready for human review/merge. The frozen PRE-EDIT baseline (`notes/01`) and the re-scored POST-EDIT matrix (`notes/05`) bracket the change. After merge, set the issue + all 18 subtasks to `closed`.
