---
title: "Search scope — global / section-local / filter-scoped"
status: open
---

The same search box behaves differently depending on which page the user is on. One engine, three scope modes.

## Scope matrix

| Location | Default scope | Global escape |
|---|---|---|
| Site-wide (navbar) | **Global** — all content types | already global |
| `/user-guide/*` page | **Local** — `section=user-guide` | "Search all" toggle |
| `/dev-docs/*` page | **Local** — `section=dev-docs` | "Search all" toggle |
| Blog index / post | **Local** — `type=blog` | "Search all" toggle |
| Issues index | **Local** — `type=issue` + active filter chips | "Clear filters" toggle |
| Issue detail | **Local** — `parent_id=<issue>` (search inside this issue's subtasks/notes/logs) | "Search all issues" |

## UX rules

- Scope indicator always visible inside the search box: `[Scope: User Guide ▾]` dropdown on the left.
- Dropdown shows all available scopes; switching is instant and re-runs the query.
- When filter chips are active on the issues page, the search auto-applies them. Visible affordance: "Searching 5 of 47 issues".
- **Global shortcut**: `Ctrl+Shift+F` / `⌘+Shift+F` always opens the global search modal, regardless of current page.

## Implementation

- Scope is just a set of filters passed to `/api/search`. No special code path.
- The active scope is derived from the current route via a `useSearchScope()` hook (or equivalent in the layout's `client.ts`).
- Results list shows which scope produced them (small label on each result).

## Out of scope
- Saved scope presets (future).
- Per-user default scope (future; no user accounts yet).
