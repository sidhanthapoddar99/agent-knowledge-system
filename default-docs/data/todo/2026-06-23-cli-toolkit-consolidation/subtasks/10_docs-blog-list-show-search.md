---
title: "Add list / show / search for docs and blog (Category 2 fill)"
state: review
---

The core Category-2 gap: listing, showing, and searching content exist only for issues. Add type-specific implementations for docs and blog, backed by a shared core. Depends on the naming decision (subtask 01).

## Tasks

- [ ] Extract a shared list/search core (filtering, regex, `--json`/`--paths-only`/`--count` output) from `issues/list.mjs` into a reusable module
- [ ] `docs` list/show/search — sidebar/section-aware; reads `settings.json` + frontmatter
- [ ] `blog` list/show/search — `YYYY-MM-DD-<slug>` + frontmatter (tags, date)
- [ ] Wire into manifest + shims under the chosen naming model
- [ ] Self-test coverage for each new command (subtask 14)
