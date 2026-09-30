---
title: "Prefetch page data"
status: open
---

On localhost a page fetch takes milliseconds, but a click still feels instant only when the data is already there. This leaf prefetches page data the user is likely to open next — a hovered link, the next and previous pages — within strict limits, so navigation hits the warm budget without flooding the socket.

# 01 To Do
- [ ] **Hover and focus prefetch.** After 80 ms of hover (or on keyboard focus, or `touchstart`) on a link whose path is in the manifest, request its page data through `DataSource` (a cache hit sends only `have`). Also preload its layout chunk ([40](./40_code-splitting-and-lazy-islands.md)).
- [ ] **Next and previous.** After a docs page paints and the browser is idle (`requestIdleCallback`), prefetch the `next` and `prev` pages the page data names.
- [ ] **Limits.** At most 4 prefetches in flight, at most 30 per minute, none while the tab is hidden or `navigator.connection.saveData` is on, none of the tracker index or other large payloads.
- [ ] **Priority.** A real navigation cancels queued prefetches and jumps the queue.
- [ ] **Tests**: hover triggers one request, limits hold under a synthetic storm of hovers, prefetch does not run in a hidden tab.

## Guardrails
- Prefetch uses the same `DataSource` and cache; no side channel.
- Never prefetch anything with side effects (Phase 2 `open` for editing is not a prefetch).

## Done when
- Navigating to a hovered link paints within the cached-navigation budget in [00](./00_overview.md) on the corpus.
- The server log shows no more than the limits above during a scripted browsing session.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/router/prefetch.ts`.
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (sections 03, 07), [the Rust engine](../../notes/02_engine/03_rust-engine.md) (section 05, `prev` and `next` in page data).
- **Depends on:** [20](./20_data-cache-indexeddb.md), [080/30](../080_ui-and-client/30_client-shell-and-routing.md).

# 04 Decisions
- Decided (claude, 2026-09-30): prefetch on hover, focus and for next and previous, with the limits above.

# 05 Notes & Analysis
## Watch out
- In a shared network session many clients prefetching at once load the server; the limits are per tab, and the server's own cache makes repeated page requests cheap ([040_caching](../040_caching/00_overview.md)).
