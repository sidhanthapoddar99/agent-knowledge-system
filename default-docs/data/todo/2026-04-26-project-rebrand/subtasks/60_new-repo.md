---
title: "New GitHub repo — agent-knowledge-system"
status: open
---

Create the new home: a fresh GitHub repository named for the rebrand
(**agent-knowledge-system** under `sidhanthapoddar99`), seeded from this repo's
history (full clone push, not a squash — the tracker's `updated` derivation
depends on git history). The old repo is NOT deleted — it gets archived with a
pointer ([110](110_archive-old-repo.md)).

Human-owned steps (repo creation, settings); agent can prepare the push and
verify remotes.

## Tasks

Sequencing settled 2026-07-08 (sizes + rationale in
[notes/01](../notes/01_repo-size-and-clone-strategy.md)): `rebrand/agent-ks`
is already on the old remote — after the new repo exists, push everything
there, land the [70](70_github-urls-and-branding.md) sweep as commits on the
branch in the **new** repo, then delete the stale branch from the old remote
so documentation-template stays frozen at pre-rebrand `main` for archiving.

## Tasks

- [ ] Create the GitHub repo (name, description using the new positioning,
      topics).
- [ ] `git gc --aggressive --prune=now`, then push full history + branches
      (pack is ~6 MB); set default branch.
- [ ] Delete `rebrand/agent-ks` from the old remote once it lives in the new
      repo.
- [ ] Verify tracker `updated` dates still derive correctly from the moved
      history.
- [ ] Downstream URL updates are [70](70_github-urls-and-branding.md); the old
      repo's archive banner is [110](110_archive-old-repo.md).
