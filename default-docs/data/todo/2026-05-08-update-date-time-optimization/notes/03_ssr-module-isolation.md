---
title: "Vite SSR module isolation — why local cache.delete() isn't enough"
sidebar_label: "SSR module isolation"
---

# Vite SSR module isolation — and the dual-invalidation pattern

## The bug, observed

After committing changes to an issue's folder, the running dev server's UI continued to show the *previous* commit's `updated` timestamp. Restarting the dev server fixed it. Until the next commit, when it drifted again.

Concretely on 2026-05-08:
- ~03:20  commit `b9d2c20` lands. Cache populates.
- ~04:22  commit `b64605a` lands. UI keeps showing the 03:20 timestamp.
- ~04:45  commit `7ae55dc` lands. UI still shows 03:20.
- A fresh node process correctly returns 04:45 — so the data + `getIssueDate()` logic are fine.
- The running dev server's renders are wrong.

## The cause

Under Vite 6, the modules loaded by the **plugin context** (our `integration.ts`, which runs the watcher) and the modules loaded by the **SSR context** (the `BaseLayout.astro` / `IssuesTable.astro` that read issue data during a request) can be *separate instances* of the same source file. Same code, two live copies, two distinct module-level `cache: Map<...>` states.

```
┌─ Plugin context ─────────────────┐    ┌─ SSR context ──────────────────────┐
│  issue-dates.ts                  │    │  issue-dates.ts                    │
│    cache: Map = { ... }          │    │    cache: Map = { ... }            │
│    invalidateIssueDateCache() ←──┼──┐ │    (← what layouts read)           │
│                                  │  │ │                                    │
└──────────────────────────────────┘  │ └────────────────────────────────────┘
                                      │
                  watcher fires here ─┘    SSR-context cache stays sticky
                                            until the next restart
```

When a watcher event fires, our handler calls `invalidateIssueDateCache()` — but that imports resolves to the **plugin-context** copy. Renders read from the **SSR-context** copy. They never see the invalidation.

A server restart drops *all* module instances; both contexts re-instantiate empty and align on the next read. That's why restarts "fix" it — until the next commit drifts them apart again.

## The fix

After invalidating in the plugin context, also force-clear in the SSR context using `server.ssrLoadModule`:

```ts
server.watcher.on('change', async (file) => {
  if (!watchedGitPaths.has(file)) return;

  // 1. Clear local (plugin-context) instances.
  invalidateIssueDateCache();
  invalidateIssuesCache();

  // 2. Clear SSR-context instances — same source file, different
  //    in-memory state. Without this, layouts render stale data.
  try {
    const datesMod: any = await server.ssrLoadModule('/src/loaders/issue-dates');
    datesMod?.invalidateIssueDateCache?.();
    const issuesMod: any = await server.ssrLoadModule('/src/loaders/issues');
    issuesMod?.invalidateIssuesCache?.();
  } catch {
    // Path resolution / module load can fail transiently; non-fatal.
  }

  // ... watch-set reconciliation ...
});
```

Belt-and-suspenders: invalidate locally, then invalidate via `ssrLoadModule` to reach whatever instance the SSR layer happens to be holding.

## When this pattern is required

Any time **plugin-context code mutates module-level state that SSR-context code reads.** In this codebase that's:

- `loaders/issue-dates.ts` — the `cache: Map<trackerRoot, CacheEntry>` (this issue).
- `loaders/issues.ts` — the issues content cache (`issuesCache`).
- `loaders/cache-manager.ts` — the unified mtime cache (already had this fix; documented in `MEMORY.md`).

Whenever you add a new module-level cache that gets invalidated by the watcher, **assume Vite will isolate it** and apply the dual-invalidation pattern preemptively. It's cheap insurance.

## When it's NOT required

- Stateless utilities (no module-level mutable state) — fine, only one logical copy of the function in either context.
- Caches that are never invalidated by the watcher (built once at server start, frozen) — both contexts just rebuild on first read.
- Production builds — only one module-load pass, no SSR/plugin dichotomy.

## Why this is brittle but acceptable

The Vite team treats SSR module isolation as expected behaviour, not a bug. It's a consequence of how SSR module graphs work — different roots can share dependencies but instantiate them per-root. There's no clean API to say "both contexts must share state."

The dual-invalidation pattern is the pragmatic response. It's slightly redundant (when both contexts happen to share an instance, we invalidate the same thing twice — harmless) and slightly fragile (the path string `'/src/loaders/issue-dates'` could go stale on a refactor — guard with `try/catch` and the optional-chaining function calls so a missing or moved module doesn't crash the watcher). Worth it because the alternative is silently-stale UI, which destroys trust in the cache.

## Diagnostic — how to check if you're hitting this

When the symptom is "UI shows stale value, fresh process shows correct value":

1. Open `astro-doc-code/src/dev-tools/integration.ts` and check that the watcher handler invalidates via **both** local imports AND `server.ssrLoadModule`.
2. If only local: you're hitting Vite SSR isolation. Add the `ssrLoadModule` block.
3. If both: the watcher might not be firing at all — check `[HMR] Watching git ref:` log lines on dev-server start, and confirm the file actually changes on commit (`stat -c '%y' .git/refs/heads/<branch>`).

## Related notes elsewhere

- `MEMORY.md` (project root) — entry under "Lessons Learned" mentions the same pattern for the cache-manager fix. Same root cause.
- This issue's [walkthrough](./02_walkthrough.md) describes the *intended* invalidation flow, assuming both contexts see the invalidation. This note documents what makes that assumption hold.
