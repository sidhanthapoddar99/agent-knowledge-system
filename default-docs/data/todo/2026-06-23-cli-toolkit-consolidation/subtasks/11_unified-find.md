---
title: "Add unified cross-content `find` (Category 1)"
state: closed
---

A schema-agnostic search across **all** content types at once — path + raw-text + `--meta`. Complements the per-type schema-aware `search` (subtask 10): answers "where is this string anywhere in content" vs "find the issue about X".

## Tasks

- [ ] `find` command — path + raw-text + `--meta` over docs + blog + issues + config
- [ ] Reuse the shared output core (`--json`/`--paths-only`/`--count`) from subtask 10
- [ ] Place as a top-level cross-content verb (not under any one type)
- [ ] (Stretch) `link-check` — broken/orphan internal-link validator across content types (builds on the shared `_links.mjs` from subtask 08)
