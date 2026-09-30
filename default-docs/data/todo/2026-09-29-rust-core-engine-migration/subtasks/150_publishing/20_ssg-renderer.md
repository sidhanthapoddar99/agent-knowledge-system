---
title: "The static renderer: apps/agentks-ssg"
status: open
---

The static renderer is the JavaScript program that turns page data into finished HTML using the same components the local client renders. Rust starts it as a child process during `agentks build`, streams page data to it, and receives HTML back. This leaf builds `apps/agentks-ssg`, the protocol between Rust and the renderer, island marking, and how the bundle ships compressed inside the binary and runs with Bun or Node. The whole design stands on the Phase 1 safeguards: one data interface and pure shared components.

# 01 To Do
- [ ] **Package.** `apps/agentks-ssg/` built with Vite 8 in SSR-bundle mode (a single ES module file with the UI framework's server renderer and `agentks-ui`), no runtime npm install needed on the user's machine.
- [ ] **Protocol over stdin/stdout** (newline-delimited JSON; claude's proposal, record the final form):
    - [ ] Rust → renderer: `{ "type": "site", "base": "/docs", "theme_css": "_assets/theme.<hash>.css", "islands": {…bundle paths…}, "chrome": {…navbar, footer…} }` once, then `{ "type": "page", "path": "/user-guide/intro/", "data": <page data> }` per page, then `{ "type": "end" }`.
    - [ ] Renderer → Rust: `{ "type": "html", "path": …, "html": "<!doctype html>…", "islands": ["search","theme-toggle"] }` per page, `{ "type": "error", "path": …, "message": … }` on failure, `{ "type": "done" }`.
    - [ ] Versioned: the first message carries `protocol`; mismatch → error.
    - [ ] Back-pressure: Rust sends the next page only after a reply, or keeps a bounded queue; measure and pick.
- [ ] **Rendering.** For each page, render the page kind's layout from `agentks-ui` with the data, wrap it in the document shell (head from [150/60](./60_seo-sitemap-feeds.md) data, theme CSS link, island scripts), and return the string.
- [ ] **Islands.** Components mark themselves as islands in `agentks-ui`. The renderer emits each island's markup plus a small loader that hydrates only that island with its props (serialised into the page). A page with no island ships no JavaScript. Island bundles are built once per build by Vite and hashed.
- [ ] **Runtime.** Rust looks for `bun`, then `node` (≥ 24), runs the unpacked bundle, and stops with install instructions if neither exists.
- [ ] **Shipping.** The bundle is embedded compressed in the binary (like the client, [080/70](../080_ui-and-client/70_embed-in-binary.md)) and unpacked on first use into the build cache for this version ([040/40](../040_caching/40_build-cache-on-disk.md)); later builds reuse it.
- [ ] **Parity test.** For a fixture set of pages, the HTML the renderer produces and the DOM the client renders for the same data must match after normalising (whitespace, island placeholders). This is the check that one component tree really serves both.
- [ ] **Performance.** Render this repository's docs (~1,300 pages) in under 30 seconds on a laptop; record the number.

## Guardrails
- The renderer holds no rules: no sorting, no link resolution, no status mapping. It renders what it is given.
- No network access from the renderer.
- No full-page hydration.

## Done when
- `agentks build` on the fixture docs produces valid HTML (checked with an HTML validator) for every page.
- The client/renderer parity test passes.
- A page with no interactive parts has no `<script>` tags.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-ssg/`, `apps/packages/agentks-ui/`, and the child-process side in `apps/agentks-engine/`.

**Read first**
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), sections 01, 02, 05, 11.
- [Shared UI package](../../notes/03_frontend/01_shared-ui-package.md) — pure components, the data interface, the island contract.
- [Toolchain versions](../../agent-memory/toolchain-versions.md) — Vite 8.3.1, Bun 1.4.2, Node 24.

**Depends on:** [080/10 UI framework](../080_ui-and-client/10_ui-framework-decision.md), [080/20 shared UI package](../080_ui-and-client/20_shared-ui-package.md), [080/50 islands](../080_ui-and-client/50_islands.md), [030/80 page data](../030_rust-engine/80_page-data-interface.md).
**Unblocks:** [150/10 agentks build](./10_agentks-build.md), [150/30 diagrams](./30_diagrams-to-svg.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the layouts and components live in `apps/packages/agentks-ui`; `apps/agentks-ssg` renders them to static HTML once, for publishing ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Decided (sidhantha, 2026-09-30), on claude's proposal: the build needs Bun or Node; the renderer ships compressed inside the binary.

# 05 Notes & Analysis
## Watch out
- Keep the page data handed to the renderer identical to what the WebSocket sends; if the renderer needs something extra, add it to the one interface, not a side channel.
- Large pages (a big tracker index) can exceed default pipe buffers; stream, do not build one giant string on the Rust side.

## Open until the work starts
- The UI framework is decided in [080/10](../080_ui-and-client/10_ui-framework-decision.md); islands at build time are a hard requirement of that choice. This leaf starts after it.
