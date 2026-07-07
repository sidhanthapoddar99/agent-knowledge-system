---
title: "File-type icons in the docs sidebar"
status: review
---

Extend the issues-layout file-type-icon pattern to the docs sidebar: leaf rows that are *not* markdown get a small monochrome trailing icon naming their kind. Markdown is the default and stays unmarked. Images are out of scope (embed-only, never sidebar pages — see the issue's scope decisions).

The underlying data already exists — every loaded page carries `fileType` (`'md' | 'diagram' | 'artifact' | …`, `astro-doc-code/src/parsers/types.ts`), set by `src/loaders/diagram-pages.ts` and `src/loaders/artifact-pages.ts` — but the sidebar tree model drops it before render.

- [x] **Thread `fileType` into the sidebar model.** `src/layouts/docs/default/useSidebar.ts` — add a `fileType` (or `kind`) field to `SidebarItem` and copy it from `LoadedContent` in `nodeToSection()` / `buildSidebarTree`.
- [x] **Render trailing icons in `Sidebar.astro`.** For `fileType === 'diagram'` and `'artifact'`, render a small (~12px) monochrome SVG glyph trailing the label — same placement the issues tree uses for its artifact glyph. Leaf rows only; folders keep the collapse chevron (no conflict — icons and chevrons never co-occupy a row).
- [x] **Hover tooltip on the icon.** `data-tip="Diagram"` / `"Artifact"` + `data-tip-always` (the site-wide `src/scripts/tooltip.ts` already loads on every page via `BaseLayout.astro`; the docs sidebar labels already carry truncation-aware `data-tip`).
- [x] **No color, theme-contract only.** Icon inherits text color (muted); no status tinting — color stays reserved for status meaning.
