---
title: "Document the cleanup + new mechanisms in dev-docs"
state: open
---

**Deferred — write this after subtasks 1–8 land. Don't write to a moving target.**

- [ ] Add (or extend) a dev-docs page describing the tracker's schema as it now stands: what fields exist, what each is for, what was removed and why, what mechanisms run server-side (the derived `updated`-date cache from [subtask 03](./03_drop-updated-and-add-derived-cache.md), with full rationale in [`notes/derived-issues-updates/`](../notes/derived-issues-updates/00_design-rationale.md)).
- [ ] Likely target: `default-docs/data/dev-docs/05_architecture/` — under a tracker-architecture subsection. Or a new dedicated page if the topic grows.
- [ ] Cross-link from the page to: the outward-facing user-guide overview (subtask 07), the internal design-philosophy note (subtask 08), and the derived-date subtask 03.

## What to cover

1. **Final schema** — concrete list of `settings.json` fields and what each is for. Mark the ones that are best-practice-constrained (priority is preferred for sorting; component is typically singular).
2. **What's NOT in the schema and why** — record the removals (`due`, `milestone`, `type`, in-progress / blocked statuses). One sentence each.
3. **Server-side mechanisms** — the derived `updated` cache. Two authoritative sources to draw from / link to:
   - [`notes/derived-issues-updates/00_design-rationale.md`](../notes/derived-issues-updates/00_design-rationale.md) — original design rationale.
   - [`agent-log/010_au_cache-and-update-mechanism/101_writeup.md`](../agent-log/010_au_cache-and-update-mechanism/101_writeup.md) — **canonical implementation reference** post-landing: cache shape, lazy invalidation flow, watcher specifics, what was rejected and why, fallbacks. Quote or link as the dev-docs source-of-truth for "how the cache actually works after subtasks 03 and 10 landed".
4. **Validators** — what `docs-check-section` enforces vs. what it warns about as soft hints.
5. **CLI surface** — quick reference to the plugin's `docs-list` / `docs-show` flags after the cleanup.
6. **Migration history** — pointer to this issue itself, so future readers can find the *why* behind every schema removal in one place.

## Why this is deferred

Documentation of a schema that's still being shaped will rot before it's read. Wait for subtasks 1–8 to settle the actual final state, then write the dev-docs page in one pass. Reviewing the diff post-implementation is also a useful sanity check that the writeup matches reality.
