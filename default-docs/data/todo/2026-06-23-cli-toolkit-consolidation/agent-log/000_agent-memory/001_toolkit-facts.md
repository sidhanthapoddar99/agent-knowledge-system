---
title: "Durable facts — CLI toolkit consolidation"
---

# Agent memory — CLI toolkit consolidation

Issue-scoped facts learned mapping the toolkit. Maintain continuously; the next agent should not re-discover these.

## Architecture (verified)

- **Routing is one place:** `skills/documentation-guide/scripts/cli.mjs` `COMMANDS` map (`name → script`). Shims in `bin/` are byte-identical, self-route by basename, prefer `bun` → `node`. Every command has a `.cmd` Windows twin (all 13 confirmed present).
- **Scripts live at** `skills/documentation-guide/scripts/<domain>/`, domains: `issues/`(9) `blog/`(1) `config/`(1) `docs/`(2) `images/`(1). Shared libs: `_env`, `_check-lib`, `_order-prefix`, `issues/_lib`, `images/_lib`.
- **Two civilizations:** `issues/_lib.mjs` (~560 lines) has the only real arg-parser (`parseArgs`) + help renderer (`printHelp`) — **trapped there**; the 5 non-issues scripts hand-roll parsing 3 different ways. `_check-lib.reportAndExit` is the only shared output convention (4 validators).
- **Env resolution is centralized & good:** `_env.resolveProjectContext()` (DOCS_PROJECT_ROOT → walk up for `.env` CONFIG_DIR → consumer-convention probe). Keep it; expose as `resolve-context --json` for polyglot.

## Known bugs / traps

- **`issues/show.mjs --full` throws `ReferenceError`** — uses `path`/`fs` without importing them. (subtask 07)
- **`issues/review-queue.mjs` never sets an exit code** (always 0). (subtask 07)
- **Orphans:** `issues/check.mjs` (real tracker validator) and `check-skill-links.mjs` have NO bin/manifest entry. (subtask 06)
- **`docs-check-section` is the WRONG tool for the tracker** — it applies docs-section rules (NN_ prefix, per-folder settings.json) to issue folders and floods false positives. Use the to-be-wired `docs-check-issues`. The known-good `2026-06-09-astro-6-upgrade` issue trips 16 such false positives.
- **`-h` is second-class:** only `list.mjs` of 9 issues commands honors `-h`.

## Decisions / conventions

- Pre-edit feature matrix (`notes/01`) is **frozen** — never edit during the loop. Post-edit goes in `notes/05`.
- **Loop VC policy (confirmed):** branch `cli-consolidation`, **commit per subtask**, **never push** (human merges/pushes). Separately, the `git` *command* being built (subtask 12) must never auto-commit — its commit verb stays guarded/explicit.
- **Naming (subtask 01) — DECIDED: B + flat aliases.** `docs <group> <verb>` primary, all `docs-*` kept as aliases (zero breakage). Manifest keys on canonical subcommand path; separate `alias → canonical` map. Rationale in `notes/03`.
- **⚠️ TESTING: edit the REPO source, but on-PATH `docs-*` bins run the CACHED install** (`~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.2.1/`). Repo edits are NOT reflected by `docs-list` etc. until the plugin is reloaded/republished. **Always test via `node plugins/documentation-guide/skills/documentation-guide/scripts/cli.mjs <cmd>` (repo source), never the PATH bins.** The self-test harness targets the repo `cli.mjs`.
- **Repo source path:** `plugins/documentation-guide/skills/documentation-guide/scripts/`. Repo `.env` has `CONFIG_DIR=./default-docs/config` (dogfood), so commands resolve content when run from repo root.
- **`docs-add-agent-log` gotcha:** iteration numbering auto-increments from the highest *sequence* in the leaf folder — it does NOT reserve the `1xx` range for iterations, so in an activity folder with `001_goal`/`002_task-list` it writes `003_`, `004_` (colliding with the `0xx` meta range). Had to manually rename to `101_`/`102_` + fix `iteration:` frontmatter. Also wrote `date: 2026-06-22` (off by one). Candidate fix: make the helper activity-aware (write `1xx` when `0xx` meta exists). For now: rename after creating.
- **Baseline self-test: 22/54** (pre-refactor). Target: 54/54 (+ checks added as commands land).
- **Scope:** all 18 subtasks, including 13 (polyglot enablement only).
- Manifest + written spec (not JS helpers) is what makes Python polyglot possible without forking the contract.
