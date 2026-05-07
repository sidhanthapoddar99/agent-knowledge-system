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

## The fix — `moduleGraph.invalidateModule`

After invalidating in the plugin context, also invalidate the modules in **Vite's module graph** by their absolute file IDs. This forces Vite to re-instantiate them on the next request, which means a fresh empty `cache: Map<...>` and a fresh git walk:

```ts
const issueDatesModuleId = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../loaders/issue-dates.ts',
);
const issuesLoaderModuleId = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../loaders/issues.ts',
);

server.watcher.on('change', async (file) => {
  if (!watchedGitPaths.has(file)) return;

  // 1. Clear local (plugin-context) instances.
  invalidateIssueDateCache();
  invalidateIssuesCache();

  // 2. Invalidate SSR-context modules via moduleGraph. This forces a
  //    fresh re-instantiation on next render — guaranteed-clean state.
  for (const id of [issueDatesModuleId, issuesLoaderModuleId]) {
    const mod = server.moduleGraph.getModuleById(id);
    if (mod) server.moduleGraph.invalidateModule(mod);
  }

  // ... watch-set reconciliation ...
});
```

### Why moduleGraph rather than ssrLoadModule

An earlier attempt used `server.ssrLoadModule('/src/loaders/issue-dates')` to grab the SSR-context's instance and call its exported invalidate function. That was unreliable because:

1. The URL is project-root-relative; if Vite resolves it to a different canonical key than what the SSR layer used to import the module, you get a fresh instance whose `cache` clear has no effect on the *real* SSR instance.
2. Failures fall into a `try/catch` and silently drop — the bug looks identical to "no fix at all".

`moduleGraph.invalidateModule` keys by **absolute file ID**, which is unambiguous: there's exactly one module record per absolute path, regardless of how many import URLs resolve to it. Invalidating it forces every consumer in any context to re-import on next access, which is the strongest possible "be fresh" signal we can give Vite.

### Diagnostic logging

The watcher logs three lines so the dev console makes it obvious whether the chain is working end-to-end:

```
[issue-dates] git ref changed: main
[issue-dates] SSR module invalidated: issue-dates.ts
[issue-dates] SSR module invalidated: issues.ts
```

If you commit and the first line doesn't appear → the watcher isn't firing (chokidar issue, file-system quirk, or the dev server isn't running). If the first appears but the others don't → no SSR module is in Vite's graph yet (first-load case; will work next time). If all three appear and the UI is still stale → there's a different layer caching (browser HTTP cache, Astro page cache, etc.) — hard-refresh.

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
