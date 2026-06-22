---
title: "Add the `git` content helper (Category 1)"
state: review
---

Surface the git-derived metadata the framework already computes (the tracker derives `updated` from git history). Schema-agnostic, runs over any content path.

## Tasks

- [ ] `git updated <path>` — last-commit date for any issue/doc/post
- [ ] `git changed --since <ref>` — content changed under `data/` (review sweeps)
- [ ] `git log <issue>` — git history of one folder
- [ ] *(guarded)* `git commit --scope <path>` — stage + commit only that content with a conventional message; **commit/push stay explicit, never automatic**
- [ ] Reuse `docs-move`'s proven `child_process` git pattern (already ships a working `.cmd`)
- [ ] `--json` output; honor the uniform contract
