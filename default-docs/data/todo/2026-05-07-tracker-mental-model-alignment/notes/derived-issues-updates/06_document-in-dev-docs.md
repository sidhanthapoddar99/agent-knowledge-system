---
title: "Document the issue-date cache architecture in dev-docs"
---

**Deferred — write this after subtasks 01–05 ship and the cache shape is settled.**

- [ ] Add a dev-docs page describing the issue-date cache: location, cache shape, invalidation strategy, performance characteristics, fallback policy.
- [ ] Likely target: `default-docs/data/dev-docs/05_architecture/` (under a "loaders" subsection) or a new dedicated page if the cache topic grows.
- [ ] Cross-link with the cache-isolation issue's writeup once that lands — the namespacing wrapper applies to this cache too if it ever moves to localStorage / persistent storage.

## What to cover

1. **Why git-only.** Briefly: manual fields rot; mtime is unreliable across clones; git is the version of record.
2. **Cache shape.** Concrete TypeScript-ish shape for the in-memory map.
3. **Invalidation.** The four-state diagnosis (equal / ancestor / not-in-history / descendant) and how the discriminator collapses to one `git merge-base --is-ancestor` call.
4. **Performance.** Cold-start cost (sub-2s at 200k files), incremental cost (~50ms per commit), why pathspec scoping is essential.
5. **Fallbacks.** Never-committed issue, missing `.git/`, etc.
6. **Per-file vs per-issue scope.** Note that the cache could expand to per-file granularity at the same git cost, and what would change in the loader if so.
7. **What does NOT use this cache.** Docs and blog dates remain manual frontmatter — out of scope by design, not by oversight.

## Why deferred

Documentation of a cache that's still being designed will rot before it's read. Wait until the implementation has settled key shapes and edge-case behaviours, then write the dev-docs page in one pass against the real code.
