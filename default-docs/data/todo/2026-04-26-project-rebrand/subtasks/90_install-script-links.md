---
title: "Installation scripts — update git links"
status: review
---

Every place an installation path bakes in the old repo URL must move to the
new one: the framework-clone command `/docs-init` prints at the end of
scaffolding, the clone commands in user-guide installation pages and the root
README quick-start, and any future `install.sh` (the issue's original scope
item 7 — install domain — stays open until the CLI-tool distribution ships).

**Decision (see [notes/01](../notes/01_repo-size-and-clone-strategy.md)):**
consumer-facing clone commands become **`git clone --depth 1`** — consumers
don't need history (the tracker's `updated` derivation is a framework-dev
concern), and a shallow clone stays ~10 MB no matter how history grows.
Framework-dev instructions keep full clones.

## Tasks

- [x] `/docs-init` printed clone command → new repo URL, `--depth 1`
      (landed with the [70](70_github-urls-and-branding.md) sweep, 2026-07-08).
- [x] README + user-guide quick-start clone commands: consumer clones
      (README consumer mode, installation.md, init-and-template, storage page,
      settings-layout reference) are `--depth 1`; the framework-dev clone in
      README dogfood mode stays full (history needed for tracker dates).
- [x] Swept — zero `git clone …documentation-template` strings remain on live
      surfaces (legacy note, migration docstrings, and closed issues excepted).
- [x] **Script-side enforcement** (sidhantha: "shouldn't it be part of the
      script itself?", 2026-07-08): `./start` + `start.ps1` now run a
      `shallow_check` after the update check — consumer-mode clones
      (CONFIG_DIR resolves outside the framework folder) with full history
      get a one-time y/N offer to shrink in place (`git fetch --depth 1` +
      reflog expire + gc). Guards: TTY-only, skips dogfood / dirty / diverged
      / already-shallow, decline writes `.git/.start-shallow-declined` so it
      never nags. Sandbox-tested: convert (3 commits → 1, shallow=true),
      decline-marker, and dogfood-skip paths all green.
- [ ] Future `install.sh` (blocked on the CLI-tool distribution shipping) uses
      the new URL + shallow clone from day one.
