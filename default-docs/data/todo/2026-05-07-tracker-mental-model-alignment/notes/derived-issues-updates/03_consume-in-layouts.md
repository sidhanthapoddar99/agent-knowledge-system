---
title: "Consume `updated` in issue layouts (index + detail)"
---

- [ ] **Index — `IssuesTable.astro`**: the "Updated" column reads `issue.updated` directly (no longer `issue.settings.updated`). Format remains the same as today (relative or short ISO; preserve current behaviour).
- [ ] **Index — `IssuesCards.astro`**: same field swap.
- [ ] **Detail — `DetailLayout.astro`** (or wherever the issue header renders dates): show both `created` and `updated`. Suggested label pair: "Created Apr 10, 2026 · Updated 3 days ago". Format choice is layout-author's call; no design lock here.
- [ ] **Sort by `updated` descending** in the index (default sort order). With the cache feeding accurate dates, sorting by recency now produces the expected order — the most-recently-touched issue floats to the top.
- [ ] Test in browser: open `/todo`, confirm column shows accurate dates, sort-by-updated produces correct order, detail page shows both dates.

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/parts/index/IssuesTable.astro`
- `astro-doc-code/src/layouts/issues/default/parts/index/IssuesCards.astro`
- `astro-doc-code/src/layouts/issues/default/DetailLayout.astro` (or wherever the issue header lives)
- Possibly a small date-format helper if one doesn't already exist (e.g. `formatDate(iso, 'relative' | 'short')`).
