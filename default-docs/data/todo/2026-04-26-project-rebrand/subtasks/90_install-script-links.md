---
title: "Installation scripts — update git links"
status: open
---

Every place an installation path bakes in the old repo URL must move to the
new one: the framework-clone command `/docs-init` prints at the end of
scaffolding, the clone commands in user-guide installation pages and the root
README quick-start, and any future `install.sh` (the issue's original scope
item 7 — install domain — stays open until the CLI-tool distribution ships).

## Tasks

- [ ] `/docs-init` printed clone command → new repo URL.
- [ ] README + user-guide quick-start clone commands.
- [ ] Sweep for any remaining `git clone …documentation-template` strings on
      live surfaces.
