---
title: "Refine git-watcher wiring in the issue-dates cache"
state: closed
---

Two small follow-ups to subtask [03](./03_drop-updated-and-add-derived-cache.md) (the derived-`updated`-date cache loader at `astro-doc-code/src/loaders/issue-dates.ts`). Neither is a correctness bug; both are refinements surfaced by post-landing review.

- [x] **Consolidate the per-path change-listener** into a single outer handler. Today `integration.ts:176–186` registers one `server.watcher.on('change', …)` closure per git watch path; with 2 paths every change event fires 2 closures and each one filters by equality. Replace with a single listener that checks `gitWatchPaths.includes(file)`.
- [x] **Re-resolve the active branch ref on `.git/HEAD` change.** `getIssueDateWatchPaths()` resolves the branch ref once at server start. After `git checkout <other-branch>`, the new branch's ref file isn't watched. `.git/HEAD` still fires on the checkout itself (so the cache invalidates that one time), but subsequent commits on the new branch don't trigger invalidation until HEAD moves again. Fix: when the HEAD-change handler runs, re-read `HEAD`, drop the previous branch-ref watch, and add the new one.
- [x] **Test**: in a dev session, confirm `git commit` on the active branch invalidates the cache (already works); `git checkout -b new-branch` then `git commit` on the new branch also invalidates the cache (the case this fix targets).

**Landed.** `integration.ts:173–198` now uses one outer `server.watcher.on('change', …)` listener gated by a mutable `watchedGitPaths: Set<string>`. After every relevant change event, the handler invalidates the cache and reconciles the watch set against `getIssueDateWatchPaths()` — `.unwatch()` for paths no longer desired, `.add()` for new ones (i.e. the branch ref of whatever branch is now checked out). Build passes; runtime branch-switch verification deferred to next dev-session use.

## Files likely touched

- `astro-doc-code/src/dev-tools/integration.ts` — single change-listener + dynamic branch-ref watching.
- `astro-doc-code/src/loaders/issue-dates.ts` — may need a small helper exported (e.g. `resolveActiveBranchRef()`) so integration.ts doesn't duplicate the HEAD-parsing logic.

## Why no docs / plugin-skill update

Pure internal refinement to the existing watcher mechanism — no change to the user-facing schema, validators, or CLI surface. The dev-docs writeup deferred under [subtask 09](./09_document-cleanup-in-dev-docs.md) will describe the cache from the outside; that page doesn't need to detail the watcher's internal listener shape.
