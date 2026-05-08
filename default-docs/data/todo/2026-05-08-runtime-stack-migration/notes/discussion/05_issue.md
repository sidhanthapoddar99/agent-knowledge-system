---
title: "The triggering issue — Vite SSR module isolation"
sidebar_label: "05 · The trigger"
---

# The bug that started this thread

This whole migration discussion was triggered by an unfixable (within Astro/Vite) cache-staleness bug. This note captures it for posterity so future readers understand *why* we considered abandoning Astro at all.

## Symptom

After committing changes to an issue's folder:

- The dev-server's UI continued to show the **previous** commit's `updated` timestamp
- Restarting the dev server fixed it
- Until the next commit, when it drifted again
- Concretely on 2026-05-08:
  - 03:20 — commit `b9d2c20` lands. Cache populates.
  - 04:22 — commit `b64605a` lands. UI keeps showing 03:20.
  - 04:45 — commit `7ae55dc` lands. UI still shows 03:20.
  - A fresh node process correctly returned 04:45 — so the data and `getIssueDate()` logic were fine.
  - The running dev server's renders were wrong.

## Root cause (Vite SSR module isolation)

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

When a watcher event fires, our handler calls `invalidateIssueDateCache()` — but that import resolves to the **plugin-context** copy. Renders read from the **SSR-context** copy. They never see the invalidation.

A server restart drops *all* module instances; both contexts re-instantiate empty and align on the next read. That's why restarts "fix" it — until the next commit drifts them apart again.

## Attempted fixes (all failed or partial)

1. **`server.ssrLoadModule('/src/loaders/issue-dates')` then call exported invalidator on that module instance** — unreliable because the URL is project-root-relative and may resolve to a different canonical key than the SSR layer uses internally; failures fall into a `try/catch` and silently drop, looking identical to "no fix at all."
2. **`server.moduleGraph.invalidateModule(mod)` keyed by absolute file ID** — closer; this forces re-instantiation on next request. Worked on a fresh node process but the user reported "still showing 1 hour" in their actual session.
3. **Dual invalidation (both 1 + 2)** — what the current code does, with diagnostic logging. Behaves correctly in synthetic tests; user couldn't reliably reproduce a fix in real use.

The full fix detail is in [`2026-05-08-update-date-time-optimization/notes/03_ssr-module-isolation.md`](../../../2026-05-08-update-date-time-optimization/notes/03_ssr-module-isolation.md).

## Why this is structural, not a bug we can fix

The Vite team treats SSR module isolation as **expected behaviour, not a defect**. It's a consequence of how SSR module graphs work — different roots can share dependencies but instantiate them per-root. There's no clean API to say "both contexts must share state."

Our cache lives in module-level state (`const cache = new Map(...)`). Any module-level mutable state that's mutated by the watcher and read by SSR is at risk of this bug. Today it's `issue-dates.ts`. Tomorrow if we add a search index, a settings cache, a permission cache — same bug, same brittle workaround.

The pragmatic response is the dual-invalidation pattern (in `MEMORY.md` lessons-learned). The structural response is **don't have an SSR module graph at all**.

In Go: one process, one set of module instances, one cache. The bug class is impossible by construction.

## Why we didn't escalate to Astro / Vite

- The issue is documented behaviour; not a bug report territory.
- Even if Vite added an opt-in "shared modules" mode, it'd be on us to use it correctly across every cached module — same brittleness, just one layer up.
- The fundamental issue (two module graphs per running dev server) is structural to how Vite SSR works.

## Companion reading

- **`../../../2026-05-08-update-date-time-optimization/notes/03_ssr-module-isolation.md`** — the engineering investigation, the dual-invalidation fix code, and the diagnostic logging.
- **`../architecture/02_go-runtime.md`** — how Go's single-process model eliminates the bug class.
- **MEMORY.md → "Vite 6 SSR module isolation"** — the saved lesson-learned.
