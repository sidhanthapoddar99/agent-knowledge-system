---
title: "Wire the orphaned commands (issues check + skill-links)"
status: done
---

Two scripts ship with no command name. `issues/check.mjs` is the real tracker validator — its absence is why `docs-check-section` gets misused on the tracker and floods false positives.

## Tasks

- [ ] Add `docs-check-issues` → `issues/check.mjs` to the manifest + shim pair (bash + `.cmd`)
- [ ] Confirm it validates the tracker schema (vocabulary, subtask states, folder shape) and exits `0` clean / `1` errors
- [ ] Verify it passes on the current `data/todo/` content that `docs-check-section` wrongly fails
- [ ] Decide `check-skill-links.mjs`: wire as `docs-check-skill-links` (maintainer tool) or leave intentionally internal — document the choice
- [ ] Update validator tables (CLAUDE.md, skill, user-guide) — deferred to subtasks 15/16
