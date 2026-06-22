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
- [ ] 15 — update skills + preferences + CLAUDE.md
- [ ] 16 — update docs (user-guide / dev-docs)
- [ ] 17 — version bump (plugin.json)
- [ ] 18 — recreate POST-EDIT feature matrix + delta (FINAL)

## Gate check before declaring done
- [ ] self-test harness green
- [ ] `docs help --json` matches the manifest
- [ ] all subtasks at `review`/`closed`
