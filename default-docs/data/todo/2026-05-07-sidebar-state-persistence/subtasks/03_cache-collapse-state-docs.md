---
title: "Docs sidebar: cache collapse / expand state per section (localStorage, 30-day TTL)"
status: done
---

- [ ] On user click of a folder's collapse / expand toggle, write the new state to `localStorage` keyed by section + folder path.
- [ ] On sidebar render, read the cache and apply each folder's stored state. Fall back to the layout's default if no entry is stored.
- [ ] **30-day TTL per key.** Each cache entry stores `{ collapsed: bool, ts: number }`. On read, prune entries older than 30 days (lazy GC — runs on every sidebar mount). Prevents orphan keys for renamed / deleted folders from accumulating forever.
- [ ] State **must survive page refresh and cross-page navigation** within the same site. Test: collapse a folder, navigate to another doc page, refresh, navigate again — folder stays collapsed throughout. Only resets on user click or after 30 days of disuse.
- [ ] Don't break the sync logic from subtask 01: ancestors of the active entry are force-expanded for visibility (sync wins for ancestors only; the cache still owns every other folder).

## Cache key shape

```
sidebar-collapse:<section>:<folder-path>
```

`<section>` is the docs section root (e.g. `user-guide`, `dev-docs`). `<folder-path>` is the sidebar tree path of the folder. Keys must be stable across refresh — derive deterministically from the sidebar tree, not from runtime DOM ordering.

## Cross-project caveat

Two projects deployed on the same `localhost:<port>` will share `localStorage` for now.
The isolation direction changed: instead of browser-side site-identity namespacing (the
former `2026-05-07-cache-isolation-cross-project` issue), dev-mode UI state is planned to
move server-side under the Go runtime — see the
[backend-side cache brainstorm](../../2026-05-08-runtime-stack-migration/brainstorm/05_idea_backend-side-cache-isolation.md).
Don't pre-empt it here — write the keys flat for now.

## Files likely touched

- `astro-doc-code/src/layouts/docs/default/Sidebar.astro` and any `parts/`.
- A client-side helper module — e.g. `astro-doc-code/src/layouts/docs/default/scripts/sidebar-cache.ts` (mirroring the issues layout's `scripts/index/` pattern) — that exports `read()`, `write()`, `pruneExpired()`.
