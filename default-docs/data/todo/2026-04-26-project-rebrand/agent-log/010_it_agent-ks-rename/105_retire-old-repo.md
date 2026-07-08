---
title: "M5 — retire documentation-template: deprecation commit, archive, main promotion"
iteration: 1
agent: claude-fable-5
date: 2026-07-08
status: success
---

## Goal

Sidhantha's closing sequence: take documentation-guide out of the loop —
final deprecation commit on the old repo, archive it, and promote the
rebrand branch to `main` on agent-knowledge-system.

## Approach

Improved the dictated steps in four places (kept the same end state):
shallow clone in the migration flow; a consumer-vs-dogfood guard before any
folder deletion (the "no data will be lost" promise is verified, not
asserted); self-delete via `exec bash -c` so the script never reads from its
deleted folder; repo description updated BEFORE archiving (archived = read-
only). Windows port stops short of self-delete (folder lock) and prints the
exact manual step.

## Result

1. Old `main` final commit `f703db8`: README CAUTION callout (new URL,
   assisted + manual migration), CLAUDE.md agent pointer, plugin.json
   DEPRECATED prefix, plugin README banner, `deprecation_migrate` in
   `start` + `start.ps1`. Sandbox-tested: happy path, dogfood refusal,
   decline. Pushed to the old remote.
2. Description → "ARCHIVED — moved to agent-knowledge-system: <url>";
   `gh repo archive` → `isArchived: true`.
3. Local: `old-origin` removed; `main` (old) deleted; `rebrand/agent-ks` →
   `main`, pushed fast-forward; remote rebrand branch deleted;
   `development` force-aligned to `main`. Remaining origin branches:
   `main`, `development`, `loop/lifecycle-implementation`.

## Next

The rebrand is repo-complete. Outstanding: 80 (sids-plugin-marketplace entry
→ new repo, path `plugins/agent-ks`, name `agent-ks`; unblocks the real
reinstall on 50) and human review of subtasks 10–110. The CLAUDE.md legacy
note's deletion condition now hinges only on 80.
