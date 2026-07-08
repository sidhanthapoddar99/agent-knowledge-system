---
title: "./start migration flow — archived clones self-migrate their origin"
status: open
---

The migration UX for existing users, designed by sidhantha (2026-07-08): a
clone of the archived repo should carry itself over to the new repo with no
manual git surgery.

The flow:

1. User runs `./start` in an old clone. The existing update check fetches
   upstream (the archived repo — still fetchable) and fast-forwards, which
   delivers the final archived commit containing the migration-aware `start`.
2. That `start` detects its origin still points at the old repo, rewrites
   `origin` to the new agent-knowledge-system URL, and asks the user to re-run
   `./start`.
3. The re-run fetches from the new origin and updates normally from then on.

## Tasks

- [ ] Implement origin detection + rewrite in `start` (and `start.ps1` for the
      Windows port): old-repo URL match → `git remote set-url origin <new>` →
      clear message + exit asking for a re-run. Respect
      `START_SKIP_UPDATE_CHECK=1`.
- [ ] Guard rails: dirty tree / diverged history → print the manual
      instructions instead of touching the remote; never rewrite a remote that
      isn't the known old URL.
- [ ] Test matrix: old clone with clean tree (happy path), dirty tree,
      diverged, offline, non-interactive (CI) — the flow must degrade to
      no-ops, mirroring the existing update-check behaviour.
- [ ] This script must be in the FINAL commit of the archived repo
      ([110](110_archive-old-repo.md)) — sequencing constraint.
