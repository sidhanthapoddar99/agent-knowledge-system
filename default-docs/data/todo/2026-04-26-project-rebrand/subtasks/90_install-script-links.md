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
- [ ] Future `install.sh` (blocked on the CLI-tool distribution shipping) uses
      the new URL + shallow clone from day one.
