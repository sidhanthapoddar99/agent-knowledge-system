---
title: "Diagram tooling research — excalidraw MCP / CLI landscape + build-vs-adopt"
---

Research report (Opus agent, 2026-07-04) for `subtasks/40_tooling/`. Question:
what existing tools/MCPs let agents create, view, and surgically edit
diagrams — especially huge `.excalidraw` scenes — without reading raw JSON?

## Verdict (one line)

**Build** a small dependency-free `agent-ks excalidraw` subcommand for
*summarize* and *surgical edit* (the flat, stable JSON makes both easy and
nothing off-the-shelf does them file-in-place); **adopt** an existing
headless exporter for rendering and `mmdc` for mermaid preview; treat
`yctimlin/mcp_excalidraw` as a design reference, not a runtime dependency.

## Excalidraw MCP landscape

Every credible MCP models a **live canvas**, not files on disk — file I/O is
only import/export at the boundary. That's the structural mismatch with our
repo-file workflow.

| Server | Maturity | Model | Fit |
|---|---|---|---|
| [excalidraw/excalidraw-mcp](https://github.com/excalidraw/excalidraw-mcp) (official) | ~4.8k★, v0.3.2 Feb 2026 | Hosted/interactive canvas streamed into the chat client (`mcp.excalidraw.com`) | Weak — generation/viewing surface, not a repo-file editor |
| [yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw) | ~2.1k★, active, on npm | 26 tools: element CRUD, query, `describe_scene`, screenshots, mermaid import — but **state is in-memory** behind a canvas daemon | Closest conceptually; wrong storage model. Copy its tool surface (`update`/`delete`/`query`/`describe_scene`), not its runtime |
| Others (i-tozer, whallysson, cmd8; Excalidraw+ MCP) | WIP / small / SaaS-bound | Same canvas pattern | Skip |

## Why building is cheap — the `.excalidraw` format

Stable schema (`version: 2`, breaking-change-only bumps): flat
`elements[]` of simple objects (`id`, `type`, geometry, colors, `groupIds`,
`boundElements`). **Labels are separate `text` elements** carrying the string
in `.text`, linked to their shape via `containerId`/`boundElements` — so
"rename a label" is a lookup + one field edit, no Excalidraw runtime, no
browser. A scene reader is a ~100-line JSON walk.
Schema docs: <https://docs.excalidraw.com/docs/codebase/json-schema>

## Build (the two subtask needs)

- **`agent-ks excalidraw summary <file>`** — element counts by type, all
  text strings attributed to their container shape, bounding box, groups,
  connector topology (`startBinding`/`endBinding`). Turns a 3,000-line scene
  into a ~20-line digest.
- **`agent-ks excalidraw edit`** — locate by `id` or label-text match;
  mutate `text` / `strokeColor` / `backgroundColor` or splice an element
  (cleaning `boundElements`/`containerId` refs on delete); write back with
  stable key order for minimal git diffs. Guardrail: bump the per-element
  `version` + keep `versionNonce`/`updated` sane so Excalidraw accepts the
  file; validate `version: 2` on load.

## Adopt (the genuinely hard parts)

- **Rendering `.excalidraw` → SVG/PNG needs a real browser** — the official
  `exportToSvg` requires a DOM; never call it server-side. Options:
  [excalirender](https://github.com/JonRC/excalirender) (Docker/native
  binary, cleanest deps) or
  [excalidraw-brute-export-cli](https://github.com/realazthat/excalidraw-brute-export-cli)
  (Playwright, exact-fidelity). Kroki also renders excalidraw if a service
  is acceptable.
- **Mermaid → excalidraw scaffolding**: official
  [`@excalidraw/mermaid-to-excalidraw`](https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/api)
  (~186k weekly downloads) — only flowcharts convert to native shapes,
  other types become embedded images.
- **`.mmd` preview**: official `mmdc`
  ([mermaid-cli](https://github.com/mermaid-js/mermaid-cli), Puppeteer);
  Python browserless `mmdc` port exists for CI. Mermaid MCPs add nothing —
  `.mmd` is already agent-readable text.
- Programmatic authoring reference:
  [swiftlysingh/excalidraw-cli](https://github.com/swiftlysingh/excalidraw-cli)
  (DSL → flowchart with ELK.js auto-layout, 288★, Mar 2026).

**No element-level editing library exists anywhere** — the ecosystem either
runs the full React runtime or touches raw JSON. That confirms the build
path for edits.
