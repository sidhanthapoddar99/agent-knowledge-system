---
title: "Prefetch page data"
status: review
---

On localhost a page fetch takes milliseconds, but a click still feels instant only when the data is already there. This leaf prefetches page data the user is likely to open next — a hovered link, the next and previous pages — within strict limits, so navigation hits the warm budget without flooding the socket.

# 01 To Do
- [x] **Hover and focus prefetch.** After 80 ms of hover (or on keyboard focus, or `touchstart`) on a link whose path is in the manifest, request its page data through `DataSource` (a cache hit sends only `have`). Also preload its layout chunk ([40](./40_code-splitting-and-lazy-islands.md)).
- [x] **Next and previous.** After a docs page paints and the browser is idle (`requestIdleCallback`), prefetch the `next` and `prev` pages the page data names.
- [x] **Limits.** At most 4 prefetches in flight, at most 30 per minute, none while the tab is hidden or `navigator.connection.saveData` is on, none of the tracker index or other large payloads.
- [x] **Priority.** A real navigation cancels queued prefetches and jumps the queue.
- [x] **Tests**: hover triggers one request, limits hold under a synthetic storm of hovers, prefetch does not run in a hidden tab.

## Guardrails
- Prefetch uses the same `DataSource` and cache; no side channel.
- Never prefetch anything with side effects (Phase 2 `open` for editing is not a prefetch).

## Done when
- Navigating to a hovered link paints within the cached-navigation budget in [00](./00_overview.md) on the corpus.
- The server log shows no more than the limits above during a scripted browsing session.

# 02 Status and Result
Review. Prefetch on hover, focus, touch and for the previous and next links in view is built, with the limits, and checked in a real browser.

## Result
Where: the main repository, branch `wave3/client-perf`, file `apps/agentks-client/src/data/prefetch.ts` (`Prefetcher`). It is created in `src/main.ts`; the controller calls `navigating()` when a navigation starts and `watch(main)` after each draw, and gives it `routeKey(path)` from the manifest's route table. `./ctl gate` green; `tests/prefetch.test.ts` has 4 tests in about 20 ms.

- Hover of 80 ms (`mouseover`/`mouseout`), `focusin` and `touchstart` on a same-origin link whose path the manifest lists. `a[rel~="next"]` and `a[rel~="prev"]` are watched with an `IntersectionObserver` and fetched on idle once they come into view.
- It asks the same `DataSource` (`fresh(key)` first, so a current copy costs nothing and does not count), then loads the page's layout through the package's registry.
- Limits: 4 in flight, 30 requests a minute (only real requests count), none while `document.visibilityState` is `hidden` or `navigator.connection.saveData` is on, `page:` keys only. A prefetch over a limit is dropped, and a navigation drops the queue.
- Tests: one request per 80 ms hover and none for a shorter one; a storm of 60 focus events keeps 4 in flight and 30 in total; a navigation drops the queue; none in a hidden tab, for an index, for another site, or for a current copy.
- Browser check (headless Chromium over the mock engine): the cold load fetched the previous and next pages once the pagination was in view, and hovering the "Benchmark report" row sent one `get` for that page.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/router/prefetch.ts`.
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (sections 03, 07), [the Rust engine](../../notes/02_engine/03_rust-engine.md) (section 05, `prev` and `next` in page data).
- **Depends on:** [20](./20_data-cache-indexeddb.md), [080/30](../080_ui-and-client/30_client-shell-and-routing.md).

# 04 Decisions
- Decided (claude, 2026-09-30): prefetch on hover, focus and for next and previous, with the limits above.

- Decided (claude, 2026-10-01): the prefetcher lives in `src/data/prefetch.ts`, not `src/router/prefetch.ts`. This is because it is a use of the `DataSource` and cache; the router only provides the path-to-key lookup (`AppController.routeKey`).
- Decided (claude, 2026-10-01): the previous and next pages are fetched when their links come into view, on idle, not straight after every paint. On a short page that is right after the paint; on a long one it waits until the reader nears the end. This is because it spends the 30-a-minute budget on pages the reader is closer to opening.
- Decided (claude, 2026-10-01): only `page:` keys are prefetched. A prefetch over a limit is dropped, not delayed, and a current copy neither sends nor counts. This is because a delayed prefetch is usually stale by the time it runs.
- Decided (claude, 2026-10-01): "jumps the queue" needs no priority system. A navigation asks the `DataSource` directly and never waits for a prefetch slot, and it shares an in-flight prefetch of the same key.

# 05 Notes & Analysis
## Watch out
- In a shared network session many clients prefetching at once load the server; the limits are per tab, and the server's own cache makes repeated page requests cheap ([040_caching](../040_caching/00_overview.md)).
