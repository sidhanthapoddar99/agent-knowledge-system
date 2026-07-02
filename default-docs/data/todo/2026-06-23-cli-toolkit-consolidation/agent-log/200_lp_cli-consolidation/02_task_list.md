---
title: "Task list — CLI consolidation loop"
---

# Task list — CLI consolidation loop

Live execution checklist (mirrors the subtask plan; update status as the run progresses). Subtask = the plan; this = the working tracker for the run.

## Foundation
- [x] 01 — decide naming model (GATE for 10/11) → **B + flat aliases** (notes/03)
- [x] 14 — stand up the self-test harness early → `scripts/_selftest.mjs`, **true baseline 30/54 (bun)**
- [x] 02 — `_cli.mjs` shared contract (parser/help/output/error) → lifted, no regression
- [x] 03 — command manifest (`_manifest.mjs`; routing + harness manifest-driven; subcommand form live)
- [x] 04 — `help`/discovery command + `help --json` → `help.mjs`, harness 35/59
- [x] 05 — roll uniform contract to every command → global --help/-h interceptor + validator --json; **harness 59/59 GREEN**

## Correctness & cleanup
- [x] 06 — wire orphans → `docs-check-issues` (tracker passes: 0 err/15 warn), `docs-check-skill-links`
- [x] 07 — fix latent bugs → `show --full` imports fixed; review-queue exit reviewed-OK
- [x] 08 — dedup → `_links.mjs` (MD_LINK_RE + helpers; move+img wired); tool-detection/walker merges declined w/ rationale

## Feature fills
- [x] 09 — search-scoping flags `--path` / `--meta` / `--count` → `--path astro` solves the original failure
- [x] 10 — docs + blog `list`/`show`/`search` → `_content.mjs` + 6 cmds; `docs` dispatcher shim added; harness 93/93
- [x] 11 — unified cross-content `find` → `find.mjs` + `_content.mjs` collectors; **fixed stdout-truncation bug** (sync `writeStdout`); harness 97/97
- [x] 12 — `git` content helper → `_git.mjs` + 4 verbs (updated/changed/log/commit, guarded); harness 113/113

## Forward-enable
- [x] 13 — polyglot/Python readiness → `_runtime.mjs` (interpreter detect) + cli.mjs runtime routing + `resolve-context` + `CONTRACT.md`; proven with throwaway .py; harness 117/117

## Close-out (in order)
- [x] 15 — update skills + preferences + CLAUDE.md → CLAUDE.md, documentation-guide SKILL.md, 41_searching.md, claude-skills.md, project memory; skill-links GREEN
- [x] 16 — update docs (user-guide / dev-docs) → bin-wrappers dispatcher/manifest architecture + `docs` collision caveat + polyglot; installation count; sections validate
- [x] 17 — version bump (plugin.json) → 0.2.1 → **0.3.0**; description refreshed to 28-command surface; harness 117/117
- [x] 18 — recreate POST-EDIT feature matrix + delta (FINAL) → notes/05 re-scored vs frozen baseline; deferred items filed as issue comment

## Gate check before declaring done
- [x] self-test harness green → **117/117 (bun)** (now 91/91 after the single-entrypoint refactor below)
- [x] `docs help --json` matches the manifest → **28/28, no missing/extra**
- [x] all subtasks at `review`/`closed` → **18/18 review**

## Post-loop refinements (review feedback)
Beyond the original 18 subtasks — substantial follow-on work, logged as milestones:
- [x] **Milestone 5** — single `docs-guide` entrypoint: renamed `docs`→`docs-guide` (collision-safe), removed all 28 flat shims, swept docs (→ `105_single-entrypoint.md`)
- [x] **Milestone 6** — agent-log overhaul: direct-write default + "log milestones, not steps"; demoted `add-agent-log`; consolidated this loop's 18 logs → 6 (→ `106_agent-log-overhaul.md`)
