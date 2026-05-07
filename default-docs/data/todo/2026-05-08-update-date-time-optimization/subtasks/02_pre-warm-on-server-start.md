---
title: "Pre-warm the cache at server start"
state: open
done: false
---

Today the first `getIssueDate()` call after `bun run dev` triggers the cold rebuild synchronously inside whatever request asked for it (typically the first navigation to `/todo`). Move that work to server-start so the cache is already warm by the time any request lands.

Full rationale in [`../notes/02_optimization-options.md`](../notes/02_optimization-options.md) § 2.

- [ ] **Add a pre-warm call** in `astro-doc-code/src/dev-tools/integration.ts` inside the `astro:server:setup` hook, after watchers are wired. Wrap in `queueMicrotask()` (or just call directly — the cost is paid before any request anyway).
- [ ] **Use `prefetchIssueDates()`** from subtask 01 if that's already landed; otherwise call `getAllIssueDates(defaultTrackerPath)` synchronously (one-shot at startup, not in the request path, so blocking is fine).
- [ ] **Discover the default tracker path** the same way the loader does — read `defaultTracker` from config, or use a single hardcoded `data/todo` lookup. Keep it tiny.
- [ ] **Test**: restart `bun run dev`, immediately navigate to `/todo`, confirm the issues table renders with no perceptible cold-start pause.

## Trade-off

None worth mentioning. The walk is going to happen at some point in the server's lifetime; doing it before any request just removes the user-perceived stutter.

## Files likely touched

- `astro-doc-code/src/dev-tools/integration.ts` — single call inside the setup hook.

## Coupling

Pair with subtask 01. Together they cover the perceived-lag concern up to ~3 K issues.
