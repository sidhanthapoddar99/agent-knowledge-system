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
- [ ] 08 — dedup (links, walkers, tool-detection, constants)

## Feature fills
- [ ] 09 — search-scoping flags `--path` / `--meta` / `--count`
- [ ] 10 — docs + blog `list`/`show`/`search` (after 01)
- [ ] 11 — unified cross-content `find` (+ stretch `link-check`)
- [ ] 12 — `git` content helper (guarded commit)

## Forward-enable
- [ ] 13 — polyglot/Python readiness (route non-`.mjs`, interpreter detect, `resolve-context`, spec)

## Close-out (in order)
- [ ] 15 — update skills + preferences + CLAUDE.md
- [ ] 16 — update docs (user-guide / dev-docs)
- [ ] 17 — version bump (plugin.json)
- [ ] 18 — recreate POST-EDIT feature matrix + delta (FINAL)

## Gate check before declaring done
- [ ] self-test harness green
- [ ] `docs help --json` matches the manifest
- [ ] all subtasks at `review`/`closed`
