---
title: "Code splitting and lazy islands"
status: in-progress
---

Mermaid, Excalidraw, draw.io and, in Phase 2, CodeMirror dominate the frontend's weight. A reader of an ordinary docs page should download none of them. This leaf sets up the chunking so the start-up bundle holds only the shell, the router, the socket and the first layout, and every other layout and heavy island arrives on demand. It also sets the Vite build options that keep this true as code grows.

# 01 To Do
- [ ] **Chunk plan** in `apps/agentks-client/vite.config.ts` (`build.rollupOptions.output.manualChunks` or the Vite 8 equivalent):
    - [x] `shell` — main, router, socket, cache, UI state.
    - [x] One chunk per layout (`docs`, `blog`, `issues`, `custom-*`, `pages-diagram`, `pages-artifact`, `pages-video`). (Every registered layout is its own chunk; the diagram and artifact page bodies ride in their section's layout chunk, see Decisions.)
    - [ ] One chunk per heavy island: `mermaid`, `graphviz` (the WASM or JS renderer), `excalidraw` (with React), `drawio` (the vendored viewer), `video-player`.
    - [ ] Phase 2 chunks: `devtoolbar`, `editor` (CodeMirror and live preview), one per diagram editor ([110_editing](../110_editing/00_overview.md)).
- [x] **Dynamic imports only.** Layout and island registries in `agentks-ui` use `import()`; a lint rule forbids static imports of the heavy chunks from the shell. (A build check does this job instead of a lint rule, see Decisions.)
- [ ] **Preload hints.** When the manifest says the next page is a known layout, the router adds `modulepreload` for that layout's chunk on hover ([50](./50_prefetch.md)).
- [x] **CSS splitting.** Component CSS goes with its chunk; the shell CSS contains only the reset, the theme link and the navbar and footer.
- [x] **Bundle report.** `ctl` task `bundle-report` writes the gzipped size of every chunk to `data/builds/bundle-report.json`; [80](./80_perf-budget-checks.md) reads it.

## Guardrails
- Never move a heavy library into the shell to save a request.
- A chunk may import only from the shell or the package, never from another layout's chunk.

## Done when
- The bundle report shows the start-up JavaScript and CSS within the budgets in [00](./00_overview.md).
- A network log of loading a plain docs page shows no diagram, editor or video chunk.
- Opening a page with a Mermaid diagram loads the `mermaid` chunk once and reuses it on later pages.

# 02 Status and Result
In progress (claude, 2026-10-01): the islands' side of the chunk plan works and a build check guards it; preload hints, the video-player chunk and the Phase 2 chunks are left.

## Result
- **Built** on branch `wave3/layout-artifacts` (worktree `.agentks-worktrees/layout-artifacts`):
    - Every island in `apps/packages/agentks-ui/src/islands/registry.ts` is a dynamic import, and so is each diagram renderer (`islands/diagram/render/index.ts`). The build puts each in its own chunk: `Diagram`, `ArtifactFrame`, `CodeCopy`, `Tooltip`, the sidebar and outline islands, `mermaid`, `graphviz`, `excalidraw` (with React) and `drawio`. The draw.io viewer is a separate script file, outside every chunk.
    - `apps/agentks-client/tools/island-chunks.ts` (a Vite plugin, build only) fails the build when a start-up chunk holds `mermaid`, `@hpcc-js`, `@excalidraw`, `react`, `react-dom` or the vendored draw.io viewer, naming the module and the chunk. It writes `data/builds/bundle-report.json` on every build: each chunk and stylesheet with raw and gzipped bytes and a start-up flag, plus the start-up totals.
- **Numbers** (`bunx vite build` in `apps/agentks-client`, 1.8 s): start-up JavaScript 14.9 KB gzipped (budget 120 KB), start-up CSS 0.7 KB gzipped (budget 40 KB).
- **Checked** in a browser against the mock: a page loads only the islands it holds, and each diagram page fetched only its own renderer.
- **Tests:** `apps/agentks-client/tests/build-tools.test.ts` (vitest) checks the start-up walk and the heavy-module check on a made-up bundle. `./ctl gate` is green (30 s).
- **Left:** preload hints on hover ([50](./50_prefetch.md)), the `video-player` chunk (video pages), and the Phase 2 chunks.

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
- Decided (claude, 2026-10-01): the chunk plan comes from dynamic imports, with no `codeSplitting` groups in `vite.config.ts`, because a group that gathers `mermaid` would also merge Mermaid's own per-diagram lazy chunks into one large chunk.
- Decided (claude, 2026-10-01): a build check (`tools/island-chunks.ts`) replaces the lint rule, because it checks the chunks the build actually made, which catches a heavy import through any path. A lint rule sees only direct imports.
- Decided (claude, 2026-10-01): every client build writes the bundle report, rather than a separate `ctl bundle-report` task, because the numbers come from the same build that ships and cannot go stale.
- Decided (claude, 2026-10-01): diagram and artifact page bodies are part of their section's layout chunk, not chunks of their own, because each is a few dozen lines of markup; the heavy parts are the islands, which are lazy.

# 05 Notes & Analysis
## Watch out
- Vite 8 uses Rolldown for production builds; check the chunking options against its current docs rather than older Rollup examples.
