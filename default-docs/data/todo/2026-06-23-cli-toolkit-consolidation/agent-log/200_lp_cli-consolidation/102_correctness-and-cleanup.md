---
iteration: 2
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

# Milestone 2 — Correctness & cleanup

> Consolidates the original subtasks 06, 07, 08.

## Goal
Before adding features, make the existing surface correct: surface commands that existed in code but weren't reachable, fix latent bugs, and remove duplicated logic.

## Approach
- **06 — wire orphans:** registered `docs-check-issues` (the tracker validator existed as a script but had no command) and `docs-check-skill-links`.
- **07 — latent bugs:** fixed `show --full` (unimported `fs`/`path` → `ReferenceError`); reviewed `review-queue` exit codes.
- **08 — dedup:** extracted the markdown-link primitives (`MD_LINK_RE`, anchor/ignore helpers, file walker) into `_links.mjs`; wired `move` + `img` to it. Tool-detection/walker merges were declined with rationale (genuinely different shapes).

## Result
- `docs-check-issues` now validates `data/todo/` (schema, vocabulary, subtask states) — previously the tracker had no first-class validator command.
- `show --full` works; no more crash on body expansion.
- One definition of the link regex instead of two drifting copies.
- Harness green across the milestone.

## Next
Feature build-out — the search-scoping flags that triggered this whole issue, plus the missing content commands.
