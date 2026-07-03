---
title: "Summary — versioning contract implemented"
---

# Summary — versioning contract implemented

One-session run (2026-07-03) that took the versioning design from dictation to
shipped: brainstorm + pinned notes, then subtasks 20–50 executed and verified.

Landed (evidence in milestones #1–#2): the `engine_version` contract in
site.yaml (missing → 0.0.0), the hard startup gate in `loadSiteConfig()` —
proven to prevent the dev server from ever binding a port, not just to print an
error — root-owned version-named `migration/` scripts with README, skill
references pointing at the root (cache-mirrored), the user-guide versioning
page, and the CLAUDE.md contract entry.

Where things stand: subtasks 10–50 all at `review`, issue `in-progress` pending
human sign-off. Changes uncommitted — the working tree holds the full set.
