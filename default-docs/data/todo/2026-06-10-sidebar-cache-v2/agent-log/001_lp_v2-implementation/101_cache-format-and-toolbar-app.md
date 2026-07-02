---
iteration: 1
agent: claude
status: success
date: 2026-06-10
---

## Iteration 1 — v2 cache format + Browser Cache toolbar app

**What was done**

1. **Per-scope blobs + delete-on-default** — rewrote the inline persistence scripts in `layouts/docs/default/Sidebar.astro` and `layouts/issues/default/parts/detail/DetailSidebar.astro`. Keys: `sidebar-collapse:<section-root>` and `issues-sidebar-collapse:<tracker>:<issue-id>`; value `{ts, f:{path:0|1}}`, deviations only, empty blob removed. GC drops expired blobs (one ts per scope) and legacy v1 per-folder keys (no `.f`) — self-migrating. Issues toggle listener gained a `suppress` guard (toggle events are queued tasks; programmatic restore/sync changes would otherwise write back).
2. **Browser Cache toolbar app** — `src/dev-tools/browser-cache/index.ts`, registered in `integration.ts` below Cache Inspector. Groups: docs sidebar collapse / issues sidebar collapse / issues list filters / editor UI prefs; per-group Clear + Clear-all; dynamic values HTML-escaped.
3. **Dev-docs** — `dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md` rewritten for v2; Browser Cache app documented.
4. Cross-linked from the closed v1 issue (`2026-05-07-sidebar-state-persistence`).

**Verification** — `./start build` clean, 481 pages. Browser runtime not yet human-verified: subtasks 01/02 in review.

**Design rationale** — user-driven during v1 review: restore cost should scale with the page, not with history (one getItem vs full prefix scan); storage should hold only intentional customization (delete-on-default). Per-page granularity avoids the global-blob race/write-amplification trade-offs.
