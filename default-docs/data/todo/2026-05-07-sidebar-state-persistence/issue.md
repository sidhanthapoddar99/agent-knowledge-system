## Goal

Make sidebars **remember where the user is** and **stay where the user left them**, in both the docs layout and the issues layout.

Today, two annoyances stack up:

1. **Selection desync.** Open a deep page (`/user-guide/19_issues/05_sub-docs/04_notes`) and the sidebar doesn't scroll the active item into view, doesn't expand the ancestor chain, and sometimes highlights nothing. The user has to find their place manually.
2. **Auto-collapse on every navigation.** Notes / agent-log / nested doc folders auto-collapse on render. The moment you navigate to a sibling page, your manually-expanded sections snap shut again. State is purely DOM-derived from the layout's "default open" rules — there is no client-side cache.

The fix is two changes: (a) sync sidebar to the opened page on every render, and (b) cache collapse state per sidebar-section in `localStorage`, surviving refresh and navigation. Cache entries get a 30-day per-key TTL so renamed / deleted paths don't accumulate as garbage forever.

## Scope

Applies to: **docs** sidebar (every docs section) and **issues** sidebar (the sub-doc tree on issue detail pages — subtasks, notes, agent-log). Blogs are out of scope (no sidebar today).

## Out of scope

- Settings-driven defaults for "collapsed by default" / "collapsible by default" — the user explicitly skipped that. Cache-only.
- Cross-project cache namespacing — handled by [the cache-isolation issue](../2026-05-07-cache-isolation-cross-project/issue.md).
- Persisting sidebar scroll position (only the active item needs to be visible, not the exact scroll Y).

See subtasks for the breakdown.

## Post-close follow-up

The **storage format** shipped here (one localStorage key per folder, `{c, ts}`
value) was restructured in [`2026-06-10-sidebar-cache-v2`](../2026-06-10-sidebar-cache-v2/issue.md)
after review: one blob per page scope, delete-on-default, plus a Browser Cache
dev-toolbar app. The behaviour designed here (sync-wins, FOUC-free inline
restore, 30-day TTL) is unchanged.
