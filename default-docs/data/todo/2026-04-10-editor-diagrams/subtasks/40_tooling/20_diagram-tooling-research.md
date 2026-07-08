---
title: "Research: tools/MCPs for creating & viewing diagrams without raw reads"
status: done
---

Research the ecosystem before building anything under
`10_excalidraw-scene-tools.md`. Mermaid (`.mmd`) is mostly fine — the source
is compact and human/agent-readable; the concern is **excalidraw**, where the
JSON is huge and unreadable in practice.

**Researched 2026-07-04** (Opus agent, activity
`agent-log/011_au_display-first-audit/103_tooling-research.md`). Full report:
`notes/03_diagram-tooling-research.md`. Verdict: **build** a small
`agent-ks excalidraw summary/edit` subcommand (flat stable JSON, no
library does file-in-place edits); **adopt** a headless exporter
(excalirender / excalidraw-brute-export-cli) + `mmdc` for rendering.
Awaiting sign-off on that direction.

## Tasks

- [x] **Excalidraw MCP** — official `excalidraw/excalidraw-mcp` and community
      `yctimlin/mcp_excalidraw` verified: both model a live in-memory/hosted
      canvas, neither edits local `.excalidraw` files; `yctimlin`'s 26-tool
      surface (`describe_scene`, element CRUD) is a good design reference
      only.
- [x] **Excalidraw CLI / library tooling** — official `exportToSvg` needs a
      browser DOM (never server-side); renderers: excalirender (binary/
      Docker), excalidraw-brute-export-cli (Playwright); authoring reference:
      swiftlysingh/excalidraw-cli; official `@excalidraw/mermaid-to-excalidraw`
      for scaffolding (flowcharts only). **No element-level editing library
      exists** — confirms the build path.
- [x] **Mermaid preview tooling** — `mmdc` (official mermaid-cli) covers it;
      browserless Python port exists for CI; mermaid MCPs add nothing over
      readable `.mmd` text.
- [x] **Recommendation** — build-vs-adopt written up in
      `notes/03_diagram-tooling-research.md`; `10_excalidraw-scene-tools.md`
      starts from the build direction once ratified.
