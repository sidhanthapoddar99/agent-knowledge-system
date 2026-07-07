---
title: "Config — path system docs"
status: review
---

Absorbed from `2025-06-25-multiple-data-paths/issue.md` — the only remaining doc task from that (otherwise closed) issue: *"Update documentation for new path system"*.

## Scope

Covers the `@alias` path system that landed in phase 1 but was never documented end-to-end:

- [ ] `user-guide/10_configuration/03_site/03_paths.md` — `paths:` section in `site.yaml`; every `@key` becomes an alias resolvable as `@key/subpath`
- [ ] Document the two path-relativity rules:
  - `CONFIG_DIR` in `.env` is relative to **project root**
  - Paths in `site.yaml`'s `paths:` section are relative to the **config directory** (where `site.yaml` lives)
- [ ] Document absolute vs relative paths behaviour (both work in either surface)
- [ ] Cross-link to system aliases (`@docs`, `@blog`, `@issues`, `@custom`, `@navbar`, `@footer`) resolved at render time — distinct from user-defined `@data` / `@assets` / `@themes` resolved at config load
- [ ] Update `user-guide/05_getting-started/03_aliases.md` with the `@key/subpath` format

## Cross-link

- `src/loaders/paths.ts` — path resolution logic
- `src/loaders/alias.ts` — `resolveAliasPath()`
