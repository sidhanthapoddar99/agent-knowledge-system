---
title: "Archive the old repo with a pointer README"
status: done
---

The old `documentation-template` repo is **archived, not deleted** — existing
clones keep fetching, old links keep resolving, history stays browsable. Its
README gets a prominent banner at the very top: this project is archived and
continues as **agent-knowledge-system** (link), with the one-line migration
instruction (run `./start`, which walks you through the remote switch — see
[100](100_start-migration-flow.md)).

## Tasks

- [x] Final commit to the old repo: README banner (big, first thing on the
      page), plus the migration-aware `start` script
      ([100](100_start-migration-flow.md)) so archived clones can self-migrate.
- [x] Archive the repo in GitHub settings (read-only).
- [x] Order matters: the banner + migration script must land BEFORE archiving
      (archived repos are read-only).

## Executed 2026-07-08

- Final commit `f703db8` on old `main`: README top callout (CAUTION block:
  moved, migration one-liner + manual steps), CLAUDE.md deprecation pointer
  for agents in old checkouts, plugin.json description prefixed DEPRECATED
  with the new URL, plugin README banner, and the `./start`/`start.ps1`
  migration flow ([100](100_start-migration-flow.md)).
- Repo description set to "ARCHIVED — moved to agent-knowledge-system: <url>"
  (before archiving — archived repos are read-only), then archived via
  `gh repo archive`. Verified `isArchived: true`.
- Local cleanup: `old-origin` remote removed; local `main` deleted;
  `rebrand/agent-ks` renamed to `main`, pushed (fast-forward
  7fee583→fc5a3dd), remote branch `rebrand/agent-ks` deleted;
  `development` force-updated to match `main`. Default branch: `main`.
