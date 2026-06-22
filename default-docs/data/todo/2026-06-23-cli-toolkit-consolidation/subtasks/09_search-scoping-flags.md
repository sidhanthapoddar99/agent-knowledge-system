---
title: "Add search-scoping flags: --path, --meta, --count"
state: review
---

The flags that fix the original failure (a broad full-text query flooding output and missing the target). Land on the issue search engine (`docs-list` / future `search`).

## Tasks

- [ ] `--path <regex>` — match against file/folder path text (descriptive slugs + note paths; absorbs the "title only" idea)
- [ ] `--meta <regex>` — match only the structured layer: all YAML frontmatter + all JSON, across every file (a vertical cut, distinct from `--search-fields`)
- [ ] `--count` — print matches + titles only, suppress per-line excerpts
- [ ] Update generated help (manifest flags) + `references/layouts/issues/41_searching.md`
- [ ] Do **not** add `--depth` / `--group-by-depth` — rejected as a vaguer proxy for `--search-fields`
