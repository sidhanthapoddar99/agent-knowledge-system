## Goal

Restructure the sidebar collapse cache (shipped in `2026-05-07-sidebar-state-persistence`) so storage and restore cost scale with *pages the user customized*, not *folders the user ever touched* — and give devs a one-click way to inspect/clear the browser-side state.

## Why (review feedback on v1)

The v1 format stored **one localStorage key per folder** (`sidebar-collapse:<root>:<folder-path>`, value `{c, ts}`). Two real weaknesses surfaced in review:

1. **Restore scanned everything.** Every page load iterated *all* `sidebar-collapse:*` keys (lazy GC + map build) — visit 20 issues and the 21st load still parses all 20 issues' keys to restore one page, with a TTL check per folder key.
2. **Defaults were stored.** Every toggle wrote, including toggles back to the server-rendered default — so the store accumulated `{c:0}` entries carrying zero information.

## The v2 design

**One blob per page scope**, storing **only deviations from the server-rendered default**:

| Layout | Key | Scope |
|---|---|---|
| Docs | `sidebar-collapse:<section-root>` | 0th route segment (sidebar is per-section) |
| Issues | `issues-sidebar-collapse:<tracker>:<issue-id>` | one blob per issue |

Value: `{ts, f: {<folder-path>: 0|1}}` — single TTL per scope. Empty blob → key removed.

- **Restore** = one `getItem` + one parse for exactly the current page's scope.
- **GC scan** still exists (a never-revisited page's blob must expire somehow) but now checks one `ts` per scope instead of one per folder, and also drops legacy v1 per-folder keys (payload without `.f`) — self-migrating, no version flag needed.
- **Delete-on-default**: toggling a folder back to its server-rendered default deletes its entry; storage holds only intentional customization, so a user who only browses never creates keys.
- **Granularity rationale**: per-page blobs keep the writes-clobber-each-other and write-amplification problems of a single global blob away (cross-tab conflict now requires two tabs on the *same* issue), while all folders on a page restore together anyway — the blob is the natural read unit.
- The issues `toggle` listener gained a `suppress` guard: `<details>` toggle events fire as queued tasks, so programmatic restore/sync changes would otherwise reach listeners bound "after" them and write sync's forced expansion back to the cache.

Sync-wins-for-ancestors and the blocking `is:inline` restore (no FOUC) are unchanged from v1.

## Browser Cache toolbar app

New dev-toolbar app (`src/dev-tools/browser-cache/`), registered directly below Cache Inspector in the 3-dot overflow. Lists the framework's localStorage keys grouped by prefix (docs sidebar collapse, issues sidebar collapse, issues list filters, editor UI prefs) with count + size, per-group **Clear** and **Clear all framework keys**. Complements Cache Inspector, which covers the *server-side* in-memory caches.

## Related

- **`2026-05-07-sidebar-state-persistence`** (closed) — v1 implementation this supersedes the storage format of.
- Cross-project cache isolation — the browser-side namespacing plan (former
  `2026-05-07-cache-isolation-cross-project` issue) was folded into the runtime
  migration: dev-mode UI state moves server-side into a per-project cache
  (`2026-05-08-runtime-stack-migration/brainstorm/05_idea_backend-side-cache-isolation.md`).
  Per-scope blobs stay useful either way (fewer keys, one blob per scope).
- Dev-docs: `dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md` documents the format.
