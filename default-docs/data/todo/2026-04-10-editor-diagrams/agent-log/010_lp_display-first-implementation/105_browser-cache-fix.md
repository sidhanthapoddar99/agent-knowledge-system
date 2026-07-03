---
title: "M5 — browser-cache fix + showcase page (review feedback)"
iteration: 5
agent: claude
status: done
date: 2026-07-03
---

## Goal

Review feedback from sidhantha: edited diagrams (excalidraw scenes,
referenced assets) required a hard reload to show — browser caches never
revalidated. Also: consolidate the diagram demos into a single user-guide
page covering all three types.

## Approach

Root cause: both file-serving routes (`/content-assets/`, `/assets/`) sent
`Cache-Control: public, max-age=31536000` — a year without revalidation.
Three-layer fix:

1. **Dev revalidation** — both routes now send `Cache-Control: no-cache` in
   dev (the existing ETag makes it a cheap 304 when unchanged); the 1-year
   immutable cache stays production-only.
2. **mtime version param** — excalidraw `data-src` URLs carry
   `?v=<mtimeMs>` (embed postprocessor + diagram-pages loader), so
   long-lived browser/CDN caches bust automatically when the scene changes,
   including on static production hosts where response headers aren't ours.
3. **Client fetch** — `renderExcalidraw()` fetches with `cache: 'no-cache'`,
   forcing revalidation past any year-long entries cached before this fix.

Mermaid/graphviz embeds inline their source into the HTML, so they were only
stale via the same asset-route caching when referenced files were involved —
covered by layer 1.

**Showcase relocation:** the two dev-docs first-class demo pages were
removed in favour of one user-guide page —
`15_writing-content/07_diagram-showcase.md` — with all three types
rendering live (mermaid + dot fences, excalidraw embed + plain-link
counter-example, by-reference pattern). References updated
(`06_diagram-pages.md`, skill `docs-layout.md` + cache mirror, subtask
bodies).

## Result

Verified on the dev server with curl + headless chromium:
`cache-control: no-cache` on first response, **304** on If-None-Match with
matching ETag, **200** with fresh content after the file changes; the
showcase page renders all three diagram types with zero console errors on a
plain load. Build green.
