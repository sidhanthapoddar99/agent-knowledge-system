---
title: "Archive the old repo with a pointer README"
status: open
---

The old `documentation-template` repo is **archived, not deleted** — existing
clones keep fetching, old links keep resolving, history stays browsable. Its
README gets a prominent banner at the very top: this project is archived and
continues as **agent-knowledge-system** (link), with the one-line migration
instruction (run `./start`, which walks you through the remote switch — see
[100](100_start-migration-flow.md)).

## Tasks

- [ ] Final commit to the old repo: README banner (big, first thing on the
      page), plus the migration-aware `start` script
      ([100](100_start-migration-flow.md)) so archived clones can self-migrate.
- [ ] Archive the repo in GitHub settings (read-only).
- [ ] Order matters: the banner + migration script must land BEFORE archiving
      (archived repos are read-only).
