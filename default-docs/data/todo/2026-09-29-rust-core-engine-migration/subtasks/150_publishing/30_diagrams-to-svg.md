---
title: "Diagrams to SVG at build time"
status: open
---

Published pages should show diagrams without JavaScript where possible, so search engines read their text and pages load fast. This leaf pre-renders Mermaid, Graphviz, Excalidraw and draw.io diagrams (fenced blocks, `[[path]]` embeds and first-class diagram pages) to inline SVG during `agentks build`, and falls back to an island only where a static render is not reliable. It starts with a short spike, because some of these libraries need a browser DOM.

# 01 To Do
- [ ] **Spike first (one day).** For each format, test a Node/Bun-only render path and record the result in 05 Notes:
    - [ ] Graphviz: `@hpcc-js/wasm-graphviz` (pure WASM) → SVG.
    - [ ] Mermaid: renders need text measurement from a DOM. Try Mermaid with a light DOM shim; if output is wrong, the candidates are a headless browser (too heavy to require) or the island fallback.
    - [ ] Excalidraw: `exportToSvg` from its utils package in a DOM shim.
    - [ ] draw.io: its SVG export needs the draw.io viewer in a browser; check for a headless path, else fall back.
- [ ] **Build the chosen paths** in the renderer ([150/20](./20_ssg-renderer.md)) as step 5 of the pipeline.
    - [ ] Output inline SVG with the diagram's text as real text elements; theme-aware colours through CSS variables where the format allows.
    - [ ] Cache by content hash in the build cache so unchanged diagrams are not re-rendered.
- [ ] **Fallback island.** A format that cannot render statically ships as an island that renders in the browser, with the diagram source in a `<pre>` for no-JS readers and crawlers.
- [ ] **Interactive diagrams.** A zoomable Excalidraw scene keeps its island even when a static SVG exists (SVG first, island enhances).
- [ ] **First-class diagram pages** (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) become pages with the SVG in the body.
- [ ] **Failure.** A diagram that fails to render fails the build with the file and line (a fallback island is a planned path, not a failure).
- [ ] **Tests.** One fixture per format, embedded and first-class; assert SVG output or the planned island; a broken diagram fails the build.

## Guardrails
- Do not require a headless browser on the user's build machine.
- The same diagram must look the same in the local client and the published page (within the limits of each renderer); compare screenshots in the test for each format.

## Done when
- The spike results are recorded, and each format is either pre-rendered or on the island fallback by decision.
- Building this repository's docs pre-renders every Graphviz diagram and whatever else the spike cleared, with no browser installed.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-ssg/`.

**Read first**
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), section 06.
- Today's client-side diagram code: [diagrams.ts](../../../../../../agent-ks-engine/src/scripts/diagrams.ts), [drawio.ts](../../../../../../agent-ks-engine/src/scripts/drawio.ts), [diagram-pages.ts](../../../../../../agent-ks-engine/src/loaders/diagram-pages.ts).
- [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) — diagrams as first-class content.

**Depends on:** [150/20 SSG renderer](./20_ssg-renderer.md), [100/35 diagram pages](../100_layouts/35_diagram-pages.md).
**Unblocks:** [150/10 agentks build](./10_agentks-build.md) step 5.

# 04 Decisions
- Decided (sidhantha, 2026-09-30), on claude's proposal: diagrams can render to SVG in the build step ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Decided (claude, 2026-09-30): a format that cannot render reliably without a browser ships as an island with its source as a no-JS fallback, rather than requiring a headless browser.

# 05 Notes & Analysis
## Watch out
- "Can render" in the decision is a goal, not a promise for every format. Record per format what was achieved.
