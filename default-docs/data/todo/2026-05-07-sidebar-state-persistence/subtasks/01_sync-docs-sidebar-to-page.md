---
title: "Docs sidebar: sync selection + scroll-into-view to currently opened page"
status: done
---

- [ ] On every navigation (initial load + client-side route changes), find the sidebar entry that matches the current URL and mark it active.
- [ ] Expand all ancestor folders so the active entry is visible (don't fight any user-pinned collapse cache from subtask 03 — see "Interaction with collapse cache" below).
- [ ] Scroll the active entry into view if it's outside the sidebar's viewport. Use `scrollIntoView({ block: "nearest" })` so we don't over-scroll when the entry is already visible.
- [ ] Test on a deep page (e.g. `/user-guide/19_issues/05_sub-docs/04_notes`) — opens with the right entry highlighted, ancestors expanded, entry visible.

## Interaction with collapse cache (subtask 03)

The collapse cache says "this folder was collapsed by the user". The sync logic says "expand the ancestors of the active entry". When they conflict, **sync wins for ancestors of the active entry** — otherwise the user can't see where they are. Other folders respect the cache.

Don't write to the cache from the sync logic — sync is a render-time view concern, not a user action. The cache only updates on user click (subtask 03).

## Files likely touched

- `astro-doc-code/src/layouts/docs/default/Sidebar.astro` (and any `parts/`).
- `astro-doc-code/src/layouts/docs/compact/` if it has a sidebar variant.
- A small client-side script that runs on `DOMContentLoaded` and on `astro:page-load`.
