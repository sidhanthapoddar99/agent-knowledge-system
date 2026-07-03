---
title: "First-class mermaid pages (+ shared loader foundation)"
status: open
---

`.mmd` / `.mermaid` files with the `XX_` prefix render as first-class docs
pages — same sidebar, same routing as markdown. Mermaid is the pathfinder
format: the shared loader/routing/sidebar work lands here, and the graphviz
and excalidraw subtasks extend it. Core trick: the page body is the same
`<div class="diagram diagram-mermaid">` container embeds emit, so the existing
BaseLayout client script renders it — no new render machinery.

**Decided (sidhantha, 2026-07-03):** slug collisions (`01_foo.md` +
`01_foo.mmd`) are an explicit collision error for that slug — no silent
winner. See `brainstorm/01_discuss_display-first-architecture.md`.

## Shared foundation (this subtask)

- [ ] **Extend the docs scan** — widen the glob in `src/loaders/data.ts`
      (currently `**/*.{md,mdx}`) to diagram extensions, per-section
      opt-out flag in `settings.json` (e.g. `allow_diagram_pages: false`),
      enabled by default.
- [ ] **Explicit `assets/` exclusion** — hard prerequisite: today assets
      folders escape the sidebar only because they hold no `.md`; once the
      glob widens, embed-only diagrams in `assets/` would match and break the
      build on the missing prefix. Skip `assets/` directories by name in the
      docs scanner.
- [ ] **Diagram content handler** — a parser path that skips frontmatter,
      wraps source into the `.diagram` container, and derives `title` from
      the filename (strip prefix, title-case) when no sidecar exists.
- [ ] **Metadata sidecar** — title/description/position/draft for
      non-markdown pages. Naming still under discussion (sidecar
      `XX_name.meta.json` vs inline in folder `settings.json`) — see the
      brainstorm's open points.
- [ ] **Slug rules + collision error** — strip extension + `XX_` prefix like
      markdown; on collision surface an explicit error for that slug.
- [ ] **Sidebar tree** — diagram files as leaves alongside markdown, ordered
      by the same prefix grammar.

## Mermaid-specific

- [ ] **Page rendering** — `.mmd` page body renders via the existing lazy
      mermaid loader; verify outline/pagination behave sanely on a page with
      no headings (outline behaviour under discussion — see brainstorm).
