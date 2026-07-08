---
title: "Installation scripts — update git links"
status: open
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

- [ ] `/docs-init` printed clone command → new repo URL, `--depth 1`.
- [ ] README + user-guide quick-start clone commands (shallow for consumer
      installs; full clone noted for contributors).
- [ ] Sweep for any remaining `git clone …documentation-template` strings on
      live surfaces.
