---
title: "New GitHub repo — agent-knowledge-system"
status: done
---

Create the new home: a fresh GitHub repository named for the rebrand
(**agent-knowledge-system** under `sidhanthapoddar99`), seeded from this repo's
history (full clone push, not a squash — the tracker's `updated` derivation
depends on git history). The old repo is NOT deleted — it gets archived with a
pointer ([110](110_archive-old-repo.md)).

Sequencing settled 2026-07-08 (sizes + rationale in
[notes/01](../notes/01_repo-size-and-clone-strategy.md)): push everything to
the new repo, land the [70](70_github-urls-and-branding.md) sweep as commits
on the branch in the **new** repo, delete the stale branch from the old remote
so documentation-template stays frozen at pre-rebrand `main` for archiving.

## Tasks

- [x] Create the GitHub repo — done 2026-07-08:
      `https://github.com/sidhanthapoddar99/agent-knowledge-system`, public,
      new-positioning description, topics (knowledge-management, documentation,
      astro, issue-tracker, ai-agents, claude-code).
- [x] `git gc --aggressive --prune=now`, then pushed full history — all four
      branches (`main`, `rebrand/agent-ks`, `development`,
      `loop/lifecycle-implementation`); default branch `main`. Local remotes
      rewired: new repo is `origin`, old repo demoted to `old-origin`;
      `rebrand/agent-ks` upstream now tracks the new origin.
- [x] Verified tracker `updated` dates still derive correctly
      (`agent-ks git updated` returns real commit dates post-move).
- [x] Deleted `rebrand/agent-ks` from the old remote — documentation-template
      now carries only its pre-rebrand branches, ready for
      [110](110_archive-old-repo.md).
