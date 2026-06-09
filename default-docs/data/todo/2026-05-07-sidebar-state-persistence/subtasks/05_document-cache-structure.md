---
title: "Document the sidebar cache structure in dev-docs"
state: closed
done: true
---

**Done 2026-06-10** — written after subtasks 01–04 shipped and were verified, so the documented shapes are the settled ones.

- [x] Page: `dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md` — covers storage location + why flat keys, key shape per layout (docs vs. issues), value shape (`{c, ts}` rationale), 30-day TTL + lazy GC, the FOUC-free blocking restore, and the sync-wins-for-ancestors rule.
- [x] Cross-links the cache-isolation issue (`2026-05-07-cache-isolation-cross-project`) as planned work — that issue hasn't landed yet, so the page marks the namespacing wrapper as pending and to-be-documented there.
- [x] Also records the known **delete-on-default** improvement (store only deviations from the server-rendered default) discussed during review.

## What to cover

1. **Where keys live.** `localStorage`, prefix scheme.
2. **Key shape.** Concrete examples for both layouts (docs and issues sidebars).
3. **Value shape.** `{ collapsed: bool, ts: number }`, schema rationale (why not just `bool`).
4. **TTL.** 30 days per key, lazy-pruned on read.
5. **Sync interaction.** Sync logic force-expands ancestors of the active entry; this is a render-time concern that doesn't write to the cache.
6. **Cross-project namespacing.** Once the cache-isolation issue lands, keys are wrapped under a site-identity prefix transparently. Document the wrapper layer here too.

## Why this is its own subtask

Documentation of a cache that's still being designed will rot before it's read. Wait until the four implementation subtasks have settled the actual key shapes, then write the docs in one pass.
