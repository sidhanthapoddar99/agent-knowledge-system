---
title: "Compact mode for the search & filter box"
status: done
---

Current expanded view stays as the default. Add a **compact** alternative that takes less vertical space.

## Compact layout

Two rows:

1. Search input + clear-all-filters button
2. Filters (chips / add-filter menus) — collapsed onto a single row

## Toggle

- Simple chevron / arrow button (down = expand, up = collapse) on the filter bar
- Mode persists per-tracker in `localStorage` (`issues-filter-mode:<base_url>`)
- No URL involvement — purely a display preference
- Default: expanded (matches current behaviour)
