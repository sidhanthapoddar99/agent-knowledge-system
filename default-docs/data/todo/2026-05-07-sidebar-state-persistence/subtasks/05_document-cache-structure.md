---
title: "Document the sidebar cache structure in dev-docs"
state: open
done: false
---

**Deferred — do this after subtasks 01–04 ship and the cache shapes are settled. Don't write to a moving target.**

- [ ] Add a dev-docs page describing the sidebar cache: where it lives in `localStorage`, key shape per layout (docs vs. issues), TTL behaviour, GC trigger, and the sync-wins-for-ancestors rule.
- [ ] Cross-link from the page to the cache-isolation issue's writeup (when that lands) so the namespacing story is one click away.
- [ ] Likely target: `default-docs/data/dev-docs/05_architecture/` or `20_development/`.

## What to cover

1. **Where keys live.** `localStorage`, prefix scheme.
2. **Key shape.** Concrete examples for both layouts (docs and issues sidebars).
3. **Value shape.** `{ collapsed: bool, ts: number }`, schema rationale (why not just `bool`).
4. **TTL.** 30 days per key, lazy-pruned on read.
5. **Sync interaction.** Sync logic force-expands ancestors of the active entry; this is a render-time concern that doesn't write to the cache.
6. **Cross-project namespacing.** Once the cache-isolation issue lands, keys are wrapped under a site-identity prefix transparently. Document the wrapper layer here too.

## Why this is its own subtask

Documentation of a cache that's still being designed will rot before it's read. Wait until the four implementation subtasks have settled the actual key shapes, then write the docs in one pass.
