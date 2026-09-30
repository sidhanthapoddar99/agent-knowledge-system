---
title: "Code splitting and lazy islands"
status: open
---

Mermaid, Excalidraw, draw.io and, in Phase 2, CodeMirror dominate the frontend's weight. A reader of an ordinary docs page should download none of them. This leaf sets up the chunking so the start-up bundle holds only the shell, the router, the socket and the first layout, and every other layout and heavy island arrives on demand. It also sets the Vite build options that keep this true as code grows.

# 01 To Do
- [ ] **Chunk plan** in `apps/agentks-client/vite.config.ts` (`build.rollupOptions.output.manualChunks` or the Vite 8 equivalent):
    - [ ] `shell` — main, router, socket, cache, UI state.
    - [ ] One chunk per layout (`docs`, `blog`, `issues`, `custom-*`, `pages-diagram`, `pages-artifact`, `pages-video`).
    - [ ] One chunk per heavy island: `mermaid`, `graphviz` (the WASM or JS renderer), `excalidraw` (with React), `drawio` (the vendored viewer), `video-player`.
    - [ ] Phase 2 chunks: `devtoolbar`, `editor` (CodeMirror and live preview), one per diagram editor ([110_editing](../110_editing/00_overview.md)).
- [ ] **Dynamic imports only.** Layout and island registries in `agentks-ui` use `import()`; a lint rule forbids static imports of the heavy chunks from the shell.
- [ ] **Preload hints.** When the manifest says the next page is a known layout, the router adds `modulepreload` for that layout's chunk on hover ([50](./50_prefetch.md)).
- [ ] **CSS splitting.** Component CSS goes with its chunk; the shell CSS contains only the reset, the theme link and the navbar and footer.
- [ ] **Bundle report.** `ctl` task `bundle-report` writes the gzipped size of every chunk to `data/builds/bundle-report.json`; [80](./80_perf-budget-checks.md) reads it.

## Guardrails
- Never move a heavy library into the shell to save a request.
- A chunk may import only from the shell or the package, never from another layout's chunk.

## Done when
- The bundle report shows the start-up JavaScript and CSS within the budgets in [00](./00_overview.md).
- A network log of loading a plain docs page shows no diagram, editor or video chunk.
- Opening a page with a Mermaid diagram loads the `mermaid` chunk once and reuses it on later pages.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/vite.config.ts` and the registries in `apps/packages/agentks-ui`.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 05, heavy islands on demand), [the client application](../../notes/03_frontend/02_client-application.md) (section 07), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (risk "Frontend weight").
- **Today's behaviour to keep:** diagram libraries already load only on pages that use them, through [the diagram loader](../../../../../../agent-ks-engine/src/scripts/diagrams.ts).
- **Depends on:** [080/50 islands](../080_ui-and-client/50_islands.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): heavy diagram libraries load only on pages that use them (today's behaviour, carried over).
- Decided (claude, 2026-09-30): the chunk plan above.

# 05 Notes & Analysis
## Watch out
- Vite 8 uses Rolldown for production builds; check the chunking options against its current docs rather than older Rollup examples.
