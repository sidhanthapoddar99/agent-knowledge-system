---
title: "Performance and size"
---

Expect the migration to **cut install size and memory sharply**, and to make builds much faster. Do **not** expect dev-mode page loads or browser-side features to feel faster. The prior audit measured Astro's dev server as already quick, and the browser code does not change.

# 03 References

- [Why and the prior audit](./02_why-and-prior-audit.md) — the measured numbers.

# 04 Decisions

None yet.

# 05 Notes & Analysis

## 01 The user's questions

- Would a Rust or mixed Rust and TypeScript engine improve performance?
- Would it reduce size?
- Would a better file watcher come with it?

## 02 Expected answers

| Area | Measured by the prior audit, before the Astro 7 upgrade | Expected |
|---|---|---|
| Install footprint | 419 MB `node_modules` per project | One binary per machine, likely tens of MB plus the frontend bundle |
| Memory | 874 MB RSS after 24 minutes | Much lower. The audit's Go prototype held the whole corpus in 13.9 MB |
| Start-up and full build | Astro static build of ~1,260 pages | Locally, Rust indexes the site at start-up and renders pages on request (the audit's Go prototype: 1.83 ms per page uncached). The Phase 3 export builds everything once |
| Dev page load | 6–9 ms first byte | Similar. Already fast |
| Browser features (diagrams, editor, video) | JavaScript in the browser | Unchanged. Same code |
| File watching | Vite's watcher | `notify` in Rust, one watcher for the server and CLI |

The footprint numbers above predate the Astro 7 upgrade, which added about 106 MB of disk and cut the built output by 62.8 MB. Memory was never re-measured. Re-measure all of them before using them in a decision.

## 03 Frontend weight

The browser bundle stays large no matter what the back end is. The audit measured the built output at 6.1 MB gzipped, before the Astro 7 changes. Mermaid, Excalidraw and the draw.io viewer dominate it, and they already load only on pages that use them.
