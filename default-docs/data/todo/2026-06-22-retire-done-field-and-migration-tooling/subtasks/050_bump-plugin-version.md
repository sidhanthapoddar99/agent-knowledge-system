---
title: Bump the plugin version to 0.2.1
state: closed
---

Final step, after `010`–`040` land. Patch bump (behavior-neutral cleanup + new migration
tooling, no new user-facing capability beyond the migration convention).

- `plugins/documentation-guide/.claude-plugin/plugin.json` `version`: `0.2.0` → `0.2.1`.
- Sync any other in-repo version reference (last time there were none beyond `plugin.json` —
  `marketplace.json` lives in the external `sids-plugin-marketplace`, and the README/CLAUDE.md
  don't cite a version). Re-check and note if still true.

## Verify

`grep -rn "0.2.0" plugins/` shows no stale version strings remain.
