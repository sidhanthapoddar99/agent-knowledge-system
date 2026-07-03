---
title: "M3 — diagram tooling research (Opus): build the CLI, adopt the renderers"
iteration: 3
agent: claude
status: done
date: 2026-07-04
---

## Goal

Research the excalidraw MCP / CLI ecosystem so `subtasks/40_tooling/` starts
from a decided direction: can agents create, view, and surgically edit
`.excalidraw` scenes without reading thousands of lines of raw JSON?

## Result

Report graduated to **`notes/03_diagram-tooling-research.md`**. Headline:
every credible excalidraw MCP (official `excalidraw-mcp`, community
`yctimlin/mcp_excalidraw`) models a **live in-memory/hosted canvas**, not
files on disk — an impedance mismatch with our repo-file workflow. The
`.excalidraw` format itself is flat, stable JSON where labels are separate
`text` elements, so both subtask needs (scene summarizer, targeted edits)
are ~100-line dependency-free builds; no element-level editing library
exists anywhere. Recommendation: **build** `docs-guide excalidraw
summary/edit`; **adopt** a headless exporter (excalirender or
excalidraw-brute-export-cli — official `exportToSvg` needs a browser DOM)
and `mmdc` for mermaid preview; use `yctimlin`'s tool surface as a design
reference only.

## Next

`subtasks/40_tooling/20_diagram-tooling-research.md` moved to `review` —
sidhantha to ratify the build-vs-adopt direction, which then unblocks
`10_excalidraw-scene-tools.md`.
