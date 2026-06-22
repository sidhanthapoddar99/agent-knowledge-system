---
iteration: 13
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Add the `git` content helper (Category 1) — surface the git-derived metadata the framework already computes (tracker derives 'updated' from git history) as first-class, schema-agnostic CLI verbs.

Approach: New _git.mjs shared lib (execFileSync pattern reused from docs-move) + 4 thin verb scripts under git/ + group of 4 manifest entries + flat shim pairs. Verbs: `git updated <path>` (last-commit date/author/subject), `git changed --since <ref> [--type]` (content changed under data/ for review sweeps), `git log <issue|path> [--limit]` (folder history), `git commit --scope <path> --message <msg> [--dry-run]` (GUARDED: stages+commits ONLY that path, never pushes, commit explicit). resolveContentTarget resolves issue-id / abs / cwd-rel / data-rel. NUL field separator (%x00) for safe subject parsing.

Result: harness 113/113 GREEN (28 commands). Verified all 4 verbs: updated (text+json), log --limit, changed --since HEAD~3 --type issues --json (8 files), commit usage+not-found guards (exit 2/1). --json honored on all.

Next: subtask 13 — polyglot/Python readiness (route non-.mjs runtime, interpreter detect, resolve-context, contract spec).
