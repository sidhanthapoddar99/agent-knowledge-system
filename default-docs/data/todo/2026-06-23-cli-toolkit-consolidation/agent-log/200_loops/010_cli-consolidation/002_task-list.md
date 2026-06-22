---
title: "Task list — CLI consolidation loop"
---

# Task list — CLI consolidation loop

Live execution checklist (mirrors the subtask plan; update status as the run progresses). Subtask = the plan; this = the working tracker for the run.

## Foundation
- [ ] 01 — decide naming model (GATE for 10/11)
- [ ] 14 — stand up the self-test harness early (run it every iteration after this)
- [ ] 02 — `_cli.mjs` shared contract (parser/help/output/error)
- [ ] 03 — command manifest (`name → {script, category, summary, flags}`)
- [ ] 04 — `help`/discovery command + `help --json`
- [ ] 05 — roll uniform contract to every command (`-h`, stdout help, `--json`, exit codes)

## Correctness & cleanup
- [ ] 06 — wire orphans (`docs-check-issues`, resolve `check-skill-links`)
- [ ] 07 — fix latent bugs (`show --full`, `review-queue` exit)
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
