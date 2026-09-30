---
title: "Diagram, artifact and video sources — page data for the non-markdown page kinds"
status: open
---

Beside markdown, a section holds diagram pages (`.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw`, `.drawio`), artifact pages (self-contained `.html`) and video pages (`NN_*.video.yaml` files, or video folders whose `settings.json` says `"kind": "video"`). Diagram and artifact pages have a sidecar `.meta.json` for what the file cannot say itself. The engine does not draw diagrams or run artifacts: it sends the source or the URL with the sidecar options, and the browser does the rest. This leaf builds that page data, carrying today's loaders over exactly.

# 01 To Do
- [ ] **Diagram pages** (today's [diagram-pages.ts](../../../../../../agent-ks-engine/src/loaders/diagram-pages.ts)): a file with an `NN_` prefix and a diagram extension, outside `assets/`, unless the section root sets `allow_diagram_pages: false`. Page data: `kind: "diagram"`, the diagram type, the source text, the sidecar's title and display options, the sidebar label. The source file's hash is the page hash (plus the sidecar's).
- [ ] **Artifact pages** (today's [artifact-pages.ts](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts)): `NN_*.html` in docs sections and tracker `notes/`/`brainstorm/`. Page data: `kind: "artifact"`, its `/artifacts/<path>` URL, the sidecar's title and options, and `artifact.theme` (whether the site theme's CSS applies inside). The file itself is served as-is by the server's artifacts route ([050/10](../050_server/10_http-and-routes.md)).
- [ ] **Sidecars**: `<same name>.meta.json` or `.meta.jsonc`; parse errors are content errors with the sidecar's file and line; unknown keys are drift warnings.
- [ ] **Video pages**: an `NN_*.video.yaml` file, or an `NN_` folder whose `settings.json` says `"kind": "video"`, in a docs section or a tracker's `notes/` or `brainstorm/` is a page of kind `video`; its slug drops the prefix, and `.video.yaml` for a file. The format and the compiler belong to the video issue ([2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md), [T3 format and compiler](../../../2026-09-29-narrated-video-pages/subtasks/040_format-and-compiler.md)); this leaf only provides the kind and the hook where the video compiler (`crates/video`) plugs in. It is not a flag on markdown pages.
- [ ] **Diagrams inside markdown**: fenced `mermaid` and `dot` blocks, and diagram files embedded inside such fences, are handled by [50](./50_markdown-pipeline.md) and [020/40](../020_content-contract/40_embeds-and-dependencies.md); a linked or embedded diagram file is a dependency of the page.
- [ ] **Slug collisions** with markdown pages go through the shared pool ([020/50](../020_content-contract/50_ordering-settings-frontmatter.md)).
- [ ] **Parity**: every diagram and artifact page in the corpus appears in the same sidebar position with the same URL and title as in the golden snapshot.

## Guardrails
- The engine never executes or rewrites an artifact's HTML. The only HTML routes are `/artifacts/` and `/_lib/` (the MIME boundary, [050/50](../050_server/50_security.md)).
- Diagram rendering stays in the browser from source. Pre-rendering to SVG is a static-build step ([150/30](../150_publishing/30_diagrams-to-svg.md)), not an engine step.

## Done when
- Every diagram and artifact page of the corpus has page data matching the snapshot (URL, title, sidebar position, type).
- A section with `allow_diagram_pages: false` shows no diagram pages and still embeds diagram files in markdown.
- A broken sidecar produces a content error with its file and line, and the page still renders with default options.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `agentks-content` (kinds, sidecars), `agentks-site` (page data).
- **Read first:** [02/01 Content format](../../notes/02_engine/01_content-format.md) section 03; today's [diagram-pages.ts](../../../../../../agent-ks-engine/src/loaders/diagram-pages.ts), [artifact-pages.ts](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts), [first-class-page.ts](../../../../../../agent-ks-engine/src/loaders/first-class-page.ts); the `agent-ks-artifacts` skill (sidecar and theme modes); [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) and [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) (the shipped behaviour).
- **Depends on:** [40](./40_site-index.md), [020/50](../020_content-contract/50_ordering-settings-frontmatter.md).
- **Unblocks:** [80](./80_page-data-interface.md), [100/30 artifact pages](../100_layouts/30_artifact-pages.md), [100/35 diagram pages](../100_layouts/35_diagram-pages.md), [100/40 video pages](../100_layouts/40_video-pages.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): first-class diagram and artifact pages with their sidecars keep appearing in sidebars and routes as today.
- Decided (sidhantha, 2026-09-29): video stays rendered in the browser from source; no MP4 files.

# 05 Notes & Analysis
## Watch out
- Artifacts run with no sandbox today, as the project's own trusted code; library HTML under `/_lib/` is sandboxed ([04/01](../../notes/04_ecosystem/01_library-system.md)). Do not add a sandbox to project artifacts here.
