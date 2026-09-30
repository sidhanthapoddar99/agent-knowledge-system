---
title: "Phase 2: the dev toolkit"
---

The developer tools come back in **phase 2**, rebuilt in the new frontend. They are kept handy in one dev toolkit, and the toolkit is also where **editing mode is switched on and off**. Phase 1 ships without them: its only job is rendering and getting correct results.

# 03 References

- [Editing mode](./02_editing-mode.md)
- [Rust core and Vite frontend](../01_initial_discussion/03_rust-core-and-vite-frontend.md) — the prior audit found 1,793 lines of toolbar apps tied to Astro's toolbar host, with nothing equivalent outside Astro.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the dev toolkit, its toolbar, cache clearing and the other dev tools move to phase 2.
- Decided (sidhantha, 2026-09-29): the toolkit holds the switch for editing mode.
- Decided (sidhantha, 2026-09-30): the toolkit is a bar, like Astro's dev toolbar. Its Edit option makes an editable page's content editable in place; raw and live preview are the two editing modes ([editing mode](./02_editing-mode.md)).

# 05 Notes & Analysis

## 01 What exists today

The Astro dev toolbar hosts these apps (`agent-ks-engine/src/dev-tools/`):

| App | Job |
|---|---|
| layout-selector | Pick a layout style and theme live |
| error-logger | Show content errors and warnings for the page |
| cache-inspector | Look inside the server's in-memory cache |
| browser-cache | The browser-side cache |
| system-metrics | CPU and memory of the dev server |
| editor | The live editor, which is being discarded ([editing mode](./02_editing-mode.md)) |

## 02 Still to decide

- Which of these are rebuilt and which are dropped. This is [open question](../01_initial_discussion/16_open-questions.md) 04.
- Cache clearing: a button in the toolkit, or `agentks` commands only, or both.
