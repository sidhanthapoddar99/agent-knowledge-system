---
title: "Advanced search — regex, field-restricted queries, operators"
status: open
---

Full-text fuzzy handles 90% of queries. The remaining 10% wants precision: "find me the literal string `const foo = 3`", "only in titles", "exclude agent-log".

## Features

### Regex mode
- Activated by wrapping query in `/pattern/` (a la VS Code).
- Bypasses Orama's fuzzy/prefix pipeline — runs a direct regex scan over indexed `content` + `title`.
- At 15 MB corpus, in-memory regex is a few hundred ms worst case. Warn in the UI if regex is slow; require an anchor (`^` or `$` or a literal prefix) for large corpora.
- Safe-regex check (reject catastrophic backtracking patterns).

### Field-restricted queries
- `title:foo` → search only the title field.
- `tag:bug status:open` → filter shortcuts.
- `-status:closed` → negation.
- Parser lives in `src/search/query-parser.ts`. Lean on [lucene-query-parser](https://www.npmjs.com/package/lucene-query-parser) or roll a tiny custom one — probably the latter, ~50 lines.

### Boolean operators
- `auth AND middleware`, `auth OR login`, `auth NOT legacy`.
- Default join: AND.
- Quoted phrases: `"exact phrase"`.

### Synonyms
- Small project-scoped synonym map in `site.yaml → search.synonyms`:
  ```yaml
  search:
    synonyms:
      ram: [memory, heap]
      bug: [issue, defect]
  ```
- Expanded at query time, not index time (keeps the index stable when the map changes).

## UI affordances

- Show the parsed query ("you searched: title:foo AND -status:closed") as a chip list above results — makes the query language discoverable.
- Syntax hints in a tooltip on the search box.

## Out of scope
- Semantic / vector search. Tracked separately; this subtask stays keyword-only.
- Query history / saved searches (future phase).
