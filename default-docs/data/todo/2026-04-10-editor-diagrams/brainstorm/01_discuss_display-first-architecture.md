---
title: "Display-first diagram architecture — audit + decisions"
---

# Display-first diagram architecture

Brainstorm session (sidhantha + agent, 2026-07-03). Scope reset for this issue:
**display view first** — embeds and first-class pages must render on the built site;
editor-side editing is deferred to its own subtask group. This entry records the
code audit and the decisions taken; two points remain open at the bottom.

## Code audit — what already exists

More works than the issue originally assumed:

- **Mermaid + Graphviz embeds already render everywhere.**
  `src/parsers/renderers/marked.ts:75` turns ` ```mermaid ` / ` ```dot ` /
  ` ```graphviz ` fences into `<div class="diagram diagram-*">` containers;
  `src/layouts/BaseLayout.astro:139` loads `src/scripts/diagrams.ts` globally,
  which lazy-loads `mermaid` and `@hpcc-js/wasm-graphviz` (both already in
  `package.json`) only on pages containing diagrams. Because it sits in
  BaseLayout, this covers docs, blog **and** issues. Dark mode = CSS invert
  filter. The editor preview already re-triggers rendering via the
  `diagrams:render` event (`src/dev-tools/editor/layout/preview-panel.ts:26`).
- **Embed-by-reference already works for those two, accidentally.** The
  `[[file]]` asset-embed preprocessor inlines raw file content *inside code
  fences too*, so a ` ```mermaid ` fence containing `[[./assets/arch.mmd]]`
  renders the referenced file. Undocumented, but functional. **Verified by
  build 2026-07-03** (live artifact: `notes/02_embed-verification.md`).
  **Decided (sidhantha, 2026-07-03):** in-fence references are file-relative
  — both `./` and `../` are allowed (framework patched in
  `asset-embed.ts` the same day; originally `./`-only). Bare names stay
  skipped inside fences so documentation examples don't expand. Both embed
  subtasks closed on this basis.
- **Excalidraw: nothing exists.** No dependency, no tag, no renderer — neither
  embed nor page. The old plan in `notes/01_excalidraw.md` assumed the full
  React editor; for display-only, `@excalidraw/utils` `exportToSvg()` can
  convert scene JSON → SVG client-side without mounting the editor. Needs a
  bundle-weight / React-peer-dependency spike before committing.
- **First-class pages: nothing exists.** The docs glob is `**/*.{md,mdx}`
  (`src/loaders/data.ts:139`); diagram files are invisible to loader, routing
  and sidebar.

## The assets landmine

Assets folders are hidden from the **docs** sidebar only *implicitly* — there is
no name-based exclusion anywhere; they simply contain no `.md`/`.mdx`, so the
glob never matches. The moment the glob is extended to `.mmd`/`.dot`/
`.excalidraw`, every embed-only diagram sitting in `assets/` matches the scan
and either pollutes the sidebar or fails the build on the missing `XX_` prefix.
**First-class-pages work must therefore add an explicit `assets/` exclusion to
the docs scanner.**

The **issues** sidebar is safe by construction: `src/loaders/issues.ts` scans
only the six known collections (`notes/`, `brainstorm/`, `subtasks/`,
`comments/`, `agent-log/`, `agent-memory/`), each filtered to `*.md`. An
issue-root `assets/` is never read. (Cosmetic edge: a stray `.md` inside
`notes/assets/` would surface as a group named "assets" — `walkTwoLevels` has no
name-based skip.)

## Decisions

- **Decided (sidhantha, 2026-07-03): Excalidraw embeds are reference-based
  from the get-go, never inline JSON.** The embed fetches the `.excalidraw`
  file by reference and renders it; clicking/expanding opens a bigger,
  scrollable view and/or links out to the file as an independently openable
  asset. Inlining the scene into the page would lose the
  open-as-independent-file affordance — rejected.
- **Decided (sidhantha, 2026-07-03): slug collisions are an error, not a
  silent winner.** By rule, two pages in one folder cannot share a name
  (`01_foo.md` + `01_foo.mmd`). On collision, render/report an explicit
  collision error for that slug instead of embedding or showing either page.
- **Decided (sidhantha, 2026-07-03): three subtask groups, display-first.**
  `10_embeds/` (everything as embeds — inline fence *and* `[[]]`-reference),
  `20_first-class/` (diagram files as pages), `30_editor/` (editing surfaces,
  deferred). Each of the first two groups leads with three coding subtasks
  (mermaid, graphviz, excalidraw) followed by its own skills and documentation
  subtasks — skills/docs live per-group, not shared.
- **Decided (agent proposal, accepted by structure): first-class pages reuse
  the embed renderer.** A `.mmd` page body is the same
  `<div class="diagram diagram-mermaid">` container the embeds emit — the
  existing BaseLayout client script renders it; no new render machinery for
  mermaid/graphviz pages. The excalidraw first-class page doubles as the
  "bigger view" target that embeds expand into.
- **Noted: explicit `assets/` exclusion** is a hard prerequisite inside the
  first-class loader work (see landmine above).
- **Scope: docs sections only** for first-class pages, opt-out per section via
  `settings.json`. Issue `notes/` stay `.md`-only; the tracker's diagram needs
  are covered by embeds referencing `assets/`, which stays hidden regardless.

## Open — under discussion

- **Sidecar metadata naming** — where do title/description/position for a
  non-markdown page come from: sibling `XX_name.meta.json` vs inline entry in
  the folder's `settings.json`? (Fallback either way: derive title from
  filename.)
- **Outline panel behaviour** on diagram pages (no headings): hide the right
  "on this page" column and let the diagram use the width, or keep it for
  layout consistency?
