---
title: "Watcher debounce — coalesce rapid git events"
state: open
done: false
---

Rapid git activity (interactive rebase, scripted commits, squash/fixup runs) can fire many `change` events on `.git/HEAD` and the active branch ref in <1 s. Each one currently triggers an invalidation + rebuild. Debounce by ~100 ms so bursts coalesce into one rebuild. Marginal in normal use; useful for scripted operations.

Full rationale in [`../notes/02_optimization-options.md`](../notes/02_optimization-options.md) § 5.

- [ ] **Wrap the git watcher's change handler** in a `setTimeout`-based debounce in `dev-tools/integration.ts`. Reset the timer on each event; only invalidate + reconcile when the burst has settled (~100 ms idle).
- [ ] **Watch-set reconciliation** stays inside the debounced callback — that means the second of a fast `commit && checkout` pair will be served as one event, but the post-debounce `getIssueDateWatchPaths()` call sees the final state, so the watch set ends up correct.
- [ ] **Choose 100 ms** as the default debounce window. Long enough to coalesce typical bursts (rebase, scripted commits), short enough that humans don't notice the delay between commit and cache-update.
- [ ] **Test**: run `git rebase -i HEAD~5` and pick/squash some commits; confirm only one rebuild fires (visible in `[HMR] Watching git ref:` logs after reconciliation). A single `git commit` should still feel instant.

## Trade-off

Events are merged for ~100 ms, so a fast `git commit && git checkout` pair is served as one invalidation. Cache still rebuilds correctly because the second event includes the latest state — the post-debounce reconciliation sees `getIssueDateWatchPaths()` return the new branch's ref, not the old one.

## Files likely touched

- `astro-doc-code/src/dev-tools/integration.ts` — wrap the change-listener body in a debounced closure.
