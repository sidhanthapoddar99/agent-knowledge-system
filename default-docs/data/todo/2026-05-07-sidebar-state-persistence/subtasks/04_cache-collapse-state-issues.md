---
title: "Issues sidebar: cache collapse / expand state per sub-doc folder (30-day TTL)"
state: open
done: false
---

- [ ] On user click of any collapse / expand toggle in the sub-doc tree (subtasks group, notes folder, agent-log folder, including 2-level nests from subtask 20), write the new state to `localStorage`.
- [ ] On sub-doc tree render, read the cache and apply stored state. Fall back to layout default (auto-collapse) when no entry is stored.
- [ ] **30-day TTL per key**, lazy-GC'd on every render — same logic as subtask 03.
- [ ] Survives refresh and same-site navigation. Test: in an issue with multi-level notes / agent-log, expand a deep folder, navigate to a subtask, navigate to a comment, refresh, navigate back to notes — folder stays expanded throughout.
- [ ] Same sync interaction rule as subtask 02: ancestors of the active entry force-expand for visibility; cache owns every other folder.

## Cache key shape

```
issues-sidebar-collapse:<tracker>:<issue-id>:<folder-path>
```

`<tracker>` is the tracker root slug (`todo`, etc.). `<issue-id>` is the issue's folder slug. `<folder-path>` is the sub-doc tree path inside the issue (e.g. `notes/design/phase-1`).

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/parts/detail/SubdocTree.astro`
- `astro-doc-code/src/layouts/issues/default/scripts/detail/panels.ts` (or a new sibling — e.g. `sidebar-cache.ts`).
- Reuse the same `read` / `write` / `pruneExpired` helper as subtask 03 if its shape is generic enough; otherwise duplicate the small helper. Decide during implementation — don't over-engineer a shared module if shapes differ.

## Cross-project caveat

Same as subtask 03: keys are written flat for now. The cache-isolation issue namespaces them automatically once it lands.
