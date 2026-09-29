---
title: "WASM and HTMX — neither is used"
---

**Neither WASM nor HTMX is part of the design.** Both were raised early in the discussion. WASM was meant to let the browser run the Rust core, first as a frontend engine and then for the Phase 2 live preview. HTMX was meant for special pages. Once the frontend became a single-page app that only displays data Rust sends over the WebSocket, neither had a job left.

# 03 References

- [The architecture: a local SPA over WebSocket](./17_local-spa-over-websocket.md)
- [Editing mode](../02_future-stages/02_editing-mode.md) — where the preview is rendered instead.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): no WASM build of the core. The Phase 2 live preview asks Rust to render over the WebSocket.
- Decided (sidhantha, 2026-09-29): no HTMX. Special kinds of pages are layout components in the frontend.

# 05 Notes & Analysis

## 01 The original proposals

- The user first proposed a WASM-based frontend engine.
- Specific kinds of pages could have used HTMX for their special rendering.

## 02 Why WASM dropped out

- The frontend holds no rules, so it never needs the core's logic in the browser.
- The only remaining use was the editing preview. Editing only happens while the local Rust server runs, so the preview can be rendered by Rust and sent back over the WebSocket. On localhost that takes milliseconds, and it is the same renderer that renders every other page.
- One less build target, one less toolchain, and no risk of the browser's copy of the renderer drifting from the server's.

## 03 Why HTMX dropped out

- HTMX swaps in HTML fragments rendered by a server. In this design the server does not render layouts; the frontend does.
- A special page is a frontend layout component fed by JSON, like every other page.

## 04 If WASM comes back

A case would be a feature that must work with no server at all, such as search or filtering in the Phase 3 static export. Decide it then, for that feature only.
