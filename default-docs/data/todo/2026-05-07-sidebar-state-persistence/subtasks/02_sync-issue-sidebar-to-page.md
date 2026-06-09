---
title: "Issues sidebar: sync selection + scroll-into-view to opened sub-doc"
state: closed
done: true
---

- [ ] On every navigation (initial load + client-side route changes), find the sub-doc tree entry matching the current URL — issue body, subtask, comment, note, or agent-log entry — and mark it active.
- [ ] Expand the ancestor chain (e.g. `notes/` group, or a 2-level note folder from subtask 20) so the active entry is visible.
- [ ] Scroll active entry into view with `scrollIntoView({ block: "nearest" })`.
- [ ] Test on the deepest path: open a 2-level-nested note (e.g. `agent-log/exploration/phase-1/test-level-2.md`) → sidebar opens with that entry highlighted, both ancestor folders expanded, scrolled into view.

## Same interaction rule as subtask 01

Sync wins over the collapse cache (subtask 04) for ancestors of the active entry only. Other folders respect the cache. Sync is read-only from the cache's perspective.

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/parts/detail/SubdocTree.astro`
- `astro-doc-code/src/layouts/issues/default/parts/detail/DetailSidebar.astro`
- `astro-doc-code/src/layouts/issues/default/scripts/detail/panels.ts` (or sibling client script)
