---
title: "Rust engine and Vite frontend"
---

The engine splits in two. The **Rust engine** loads config, watches files, indexes the site, parses markdown, renders page bodies to HTML and computes every derived value. The **Vite frontend**, built once and embedded in the binary, is a single-page app that owns every layout and all UI. The two talk over one WebSocket. The full reasoning is in [the architecture note](./17_local-spa-over-websocket.md).

# 03 References

- [The architecture: a local SPA over WebSocket](./17_local-spa-over-websocket.md)
- [WASM and HTMX](./04_wasm-and-htmx.md) — why neither is used.
- [Server and WebSocket](./09_server-websockets-and-editing.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): Rust owns the engine logic and the back end. The front end is a Vite build.
- Decided (sidhantha, 2026-09-29): the mix is Rust plus TypeScript, not all Rust. Browser code stays TypeScript.
- Decided (sidhantha, 2026-09-29): the new engine's output may differ from today's only in small visual improvements. Nothing drastic.
- Decided (sidhantha, 2026-09-29): the frontend is a single-page app that renders all layouts. Rust renders page bodies, not page layouts.
- Decided (sidhantha, 2026-09-29): the frontend holds display and UI logic only; every rule stays in Rust.

# 05 Notes & Analysis

## 01 What goes where

| Part | Lives in | Why |
|---|---|---|
| Config loading, aliases, paths | Rust | Shared with the CLI |
| File watching and the site index | Rust | Fast, one watcher for server and CLI |
| Markdown parsing, pre- and postprocessors, body HTML | Rust | One renderer, shared with the CLI |
| Issue tracker loading, validation, status categories | Rust | The CLI already does most of it in Rust |
| Every derived value: order, URLs, sidebar trees, outlines, filter options | Rust | The frontend must never recompute a rule |
| Theme CSS compilation | Rust | Cached per project |
| Page layouts: docs, blog, issues, custom pages, navbar, footer | Frontend | Standard layout components chosen by config |
| Mermaid, Excalidraw, draw.io, Graphviz rendering | Frontend | JavaScript libraries that already run in the browser |
| Issue tracker UI, filters, video player, artifact iframes | Frontend | Display and interaction |
| Editing UI (Phase 2) | Frontend | Display; saving and preview rendering go through Rust |

## 02 No static site in Phases 1 and 2

agentks is a local tool. The local site is the SPA, served by the Rust server. A static, search-engine-friendly site is produced only by the [Phase 3 export](../02_future-stages/07_phase-3-publishing.md). Until then, anyone publishing a site stays on the last 0.x release ([versioning](./12_versioning-and-forced-migrations.md)).

## 03 Rendering fidelity

Routes, heading IDs, links and text must match today's engine exactly. Visual differences are allowed only when they are small improvements. Code highlighting will change a little: the plan is a Rust highlighter that outputs CSS classes, so light and dark mode come from CSS. That also removes the prior audit's concern about Shiki's two-colour output.

## 04 Risks carried from the prior audit

- **Scoped CSS.** 1,364 lines of Astro component-scoped CSS must become plain CSS. With layouts in the frontend, that CSS moves with its components; a class prefix per layout keeps it from colliding and doubles as the stable CSS hooks from [CSS and theming](./10_css-and-theming.md).
- **The dev toolbar.** 1,793 lines of toolbar apps hang off Astro's toolbar host. They return in the [Phase 2 dev toolkit](../02_future-stages/03_dev-toolkit.md).
- **The `.html` MIME boundary.** Which files Rust serves as HTML is a security decision; artifacts run their own scripts. See [note 02](./02_why-and-prior-audit.md).
