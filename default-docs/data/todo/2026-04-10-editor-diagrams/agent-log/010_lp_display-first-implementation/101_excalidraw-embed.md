---
title: "M1 — excalidraw embed shipped (spike + implementation + verification)"
iteration: 1
agent: claude
status: done
date: 2026-07-03
---

## Goal

Iterations I1+I2 of the task list, merged: prove `exportToSvg` works without
the React editor, then ship the full excalidraw embed —
`![Name](./assets/x.excalidraw)` → fetched, client-rendered, expandable.

## Approach

- **Spike:** `@excalidraw/utils` on npm is a stale test release
  (`0.1.3-test32`) — used `exportToSvg` from `@excalidraw/excalidraw@0.18.1`
  instead (react/react-dom installed as peers; only the lazy chunk ever loads
  them).
- **Server:** new `src/parsers/postprocessors/excalidraw-embed.ts` converts
  `<img src="*.excalidraw">` → `.diagram-excalidraw` placeholder div
  (data-src = served URL, data-title = alt or filename-derived), registered in
  all three content-type pipelines before `asset-src`; build-time existence
  check feeds the standard error channel. `asset-src` gained
  `resolveContentAssetUrl()` (exported) and now also rewrites plain
  `<a href>` links to colocated non-page files (fixes PDFs/code links too).
- **Client:** `renderExcalidraw()` branch in `src/scripts/diagrams.ts` —
  lazy import, fetch scene, `exportToSvg`, inject; caption with title +
  "open file ↗" link (stopPropagation so it doesn't trigger the lightbox).
- **CSS:** `.diagram-caption` + upgraded `.diagram-error` (theme-contract
  vars); dark-mode counter-invert on the caption.
- **Also:** `.excalidraw` mime entry; removed the dead unregistered
  `postprocessors/diagrams.ts`.

## Result

All verified on the built site via headless chromium
(`notes/02_embed-verification.md` is the living artifact):
5/5 diagrams rendered (2 mermaid, 2 graphviz, 1 excalidraw with caption),
plain link rewritten to `/content-assets/…`, lightbox opens with the SVG,
dark-mode screenshot confirms invert + readable caption.
Subtask `10_embeds/30_excalidraw.md` → **review**.

Gotcha worth remembering: installing excalidraw hoisted its pinned
`clsx@1.1.1` (CJS) over Astro's `^2.1.1` (ESM), breaking the static build —
fixed by adding `clsx@^2.1.1` as a direct dependency. Excalidraw's font
subset worker logs a harmless fallback error in headless runs.

## Next

I3 — embeds skills + docs subtasks (`10_embeds/40_skills.md`,
`50_documentation.md`): teach the image-syntax embed + fence reference forms,
mirror plugin cache, user-guide asset-embedding section.
