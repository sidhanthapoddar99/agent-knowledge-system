---
title: "First-class artifact component — scan, sidebar, sidecar, embedded render"
status: review
---

## Goal

Make an `NN_`-prefixed `.html` file inside a docs section behave like any other
page: it appears in the sidebar, and selecting it **replaces the central content
area with the embedded artifact** (an iframe) while the navigational sidebar
stays in place. The vision's "sidebar and outline/TOC chrome stay" resolves here
to **sidebar-only**: an artifact carries no headings (`headings: []`), so the
outline/TOC column has nothing to list and intentionally collapses, handing its
width to the artifact — this is the accepted reading of the vision, deliberated
in [`../brainstorm/01_discuss_component-and-route-architecture.md`](../brainstorm/01_discuss_component-and-route-architecture.md)
Thread C, not an oversight. This is the load-bearing subtask — everything else
(`20_route`, `30_reserved-url-guard`, docs) hangs off the shape decided here.

The feature is a near-exact mirror of the **first-class diagram pipeline** built
in [[2026-04-10-editor-diagrams]]. That pipeline lives in essentially one loader
plus one integration hook plus shared client machinery, and the artifact type
reuses that foundation rather than inventing a parallel one. The architecture
trade-offs (mirror the diagram loader vs. a new content type/route/layout; where
the iframe HTML is emitted; how dark mode reaches the iframe) are deliberated in
the component + route architecture brainstorm under `../brainstorm/` — read that
before starting. This subtask is the implementation order for the option it
recommends.

**Dependency note.** The embed's "open full page" button targets the reserved
route built in [`20_route.md`](./20_route.md), and the iframe's `src` *is* that
route — so the two subtasks share the `/artifacts/<path>` URL shape. Land the
route (or at least freeze its URL contract) alongside this one; the settled
decision (dedicated URL is the primitive, in-place expand is secondary) is
recorded in the settled-decisions note under `../notes/`.

## Precedent to copy (verified file:line)

- **Loader**: `astro-doc-code/src/loaders/diagram-pages.ts` (216 lines) — the
  whole scan/register/sidecar/collision machinery. `DIAGRAM_KINDS` map and
  `DIAGRAM_PAGE_GLOB` at `:36-44`; `assets/` exclusion via `glob(..., { ignore:
  '**/assets/**' })` at `:131-135`; prefix parsing via `parseOrderPrefix`
  (`src/parsers/core/order-prefix.ts`); missing-prefix **skip-with-warning**
  (`addWarning`, not a hard error) at `:148-156`; opt-out `allow_diagram_pages`
  read via `readSettings` at `:126-129`; sidecar read at `:160-165`; entry shape
  (a `LoadedContent` with `headings: []`, `fileType`, `data.diagram_kind`) at
  `:170-186`; the by-reference `data-src` container (the excalidraw form, our
  model) built by `diagramContainerHtml` at `:56-71`; slug-collision handling at
  `:189-210`.
- **Integration hook**: `astro-doc-code/src/loaders/data.ts:269-274` — after
  markdown parsing, docs sections only:
  ```ts
  if (contentType === 'docs') {
    const diagramPages = await loadDiagramPages(absolutePath, content);
    content.push(...diagramPages.entries);
    dependencyFiles = diagramPages.dependencyFiles;
  }
  ```
- **Type union**: `astro-doc-code/src/parsers/types.ts:10` —
  `export type FileType = 'mdx' | 'md' | 'yaml' | 'json' | 'diagram';`
- **Layout render path**: `astro-doc-code/src/layouts/docs/default/Layout.astro`
  composes `Body.astro` (`<Fragment set:html={content} />` inside
  `.docs-body.markdown-content`) and renders `<Outline>` **only when**
  `outlineHeadings.length > 0` (~`:65`) — so `headings: []` auto-hides the TOC
  column while the sidebar stays.
- **Client + CSS**: `astro-doc-code/src/scripts/diagrams.ts` (registered from
  `BaseLayout.astro:139`) is the peer to clone; container chrome lives in
  `astro-doc-code/src/styles/markdown.css:360-470` (which is already global, so
  it styles runtime-created nodes — see CLAUDE.md layout rule 5).

## Tasks

- [x] **Extend the `FileType` union.** Add `'artifact'` to
      `src/parsers/types.ts:10`. Grep for exhaustive `switch`/`===` checks on
      the `FileType` union — the real consumers are the `switch (fileType)` in
      `src/parsers/core/base-parser.ts:255` and the type mapping in
      `src/loaders/cache-manager.ts:328-335` — and make sure a new member doesn't
      fall through a `never`-typed default. (Note the editor's `fileIcon()` in
      `src/dev-tools/editor/layout/icons.ts` switches on the *file extension*
      `.md`/`.html`/…, not the `FileType` union, so it is unaffected by this
      change.) Done when `bun run build` typechecks clean.

- [x] **Create `src/loaders/artifact-pages.ts`** as a structural clone of
      `diagram-pages.ts`. Glob `**/*.html` with `{ ignore: '**/assets/**' }`;
      parse the `NN_` prefix with the shared `parseOrderPrefix`; **skip files
      without a prefix with a warning, not a hard throw** (stray `.html` exports
      are common working files — mirror `diagram-pages.ts:148-156`, do NOT copy
      the markdown hard-throw at `data.ts:252-265`). Honor a section opt-out
      `allow_artifact_pages: false` in the section-root `settings.json` via
      `readSettings`. Each entry is a `LoadedContent` with `headings: []`,
      `fileType: 'artifact'`, `sidebar_position` defaulted from the prefix, and
      the container HTML (next task) as its `content`. Done when a scan of a
      folder containing `05_demo.html` yields one entry with the right slug and
      empty headings.

- [x] **Load the metadata sidecar.** Optional same-name `<NN_name>.meta.json` /
      `<NN_name>.meta.jsonc` sibling — the naming settled in
      [`../notes/02_settled-decisions.md`](../notes/02_settled-decisions.md) and
      matching the diagram twin (`${basename}.meta.json` at
      `diagram-pages.ts:161`). The `.meta.` infix is deliberate: a bare
      `<NN_name>.json` would collide with a colocated data file the artifact
      itself fetches. Define an `ArtifactMeta` interface that carries the diagram
      fields (`title`, `description`, `sidebar_label`, `sidebar_position`,
      `draft`) **plus** the vision's explicit declared values for AI comprehension
      (`palette`, `purpose`, `key_data` / `data` — the values an agent needs so it
      never has to parse the HTML). Title falls back to the prefix-stripped,
      title-cased filename when no sidecar is present. **Do not replicate the
      diagram dependency-tracking bug**: `diagram-pages.ts:162` reads both
      `.meta.json` and `.meta.jsonc` but `:165` only pushes the `.meta.json` form
      into `dependencyFiles`, so a `.meta.jsonc`-only sidecar edit never
      invalidates the cache — push whichever form actually exists. Done when
      editing a `.meta.jsonc` sidecar in dev re-renders the page.

- [x] **Emit the embed container.** Write `artifactContainerHtml()` mirroring the
      excalidraw by-reference form: `<div class="artifact artifact-html"
      data-src="/artifacts/<rel>?v=<mtimeMs>" data-title="…"></div>`. The URL is
      the reserved route from [`20_route.md`](./20_route.md); the `?v=<mtimeMs>`
      cache-buster defeats the prod `public, max-age=31536000` (no `immutable`
      directive) year-long cache exactly as `diagram-pages.ts:65-66` does. Resolve the relative path with the same
      helper family the diagram loader uses (`resolveContentAssetUrl` in
      `src/parsers/postprocessors/asset-src.ts`), adjusted to the `/artifacts/`
      prefix. Done when the emitted string points at a URL the route in `20`
      actually serves.

- [x] **Wire the loader into `data.ts`, sharing one collision pool.** Call
      `loadArtifactPages(absolutePath, content)` **after** the diagram push at
      `data.ts:273`, passing the already-collected markdown **and** diagram
      entries so all three scanners resolve slug collisions against one pool
      (the shared-collision-pool rationale is worked out in
      [`../brainstorm/01_discuss_component-and-route-architecture.md`](../brainstorm/01_discuss_component-and-route-architecture.md)
      Thread A). The current code *assigns*
      `dependencyFiles` at `:274` — a second loader must **append**
      (`dependencyFiles.push(...artifactPages.dependencyFiles)`), not overwrite,
      or artifact edits won't bust the section cache. Done when a deliberate
      `05_foo.html` + `05_foo.md` collision renders an explicit collision error
      at that slug (not a silent winner).

- [x] **Create the client renderer `src/scripts/artifacts.ts`** and register it
      in `BaseLayout.astro` beside the diagram script (~`:139`). It queries
      `.artifact-html:not(.artifact-rendered)`, creates an `<iframe>` with the
      `data-src`, handles `load`/`error` states, and adds the **"open full page"**
      button linking to the same `/artifacts/<path>` URL (target `_blank` or a
      real navigation — decide with the brainstorm). On iframe `load`, propagate
      the site theme into the same-origin iframe document
      (`iframe.contentDocument.documentElement.setAttribute('data-theme',
      current)`) and re-sync on the site's theme toggle — **do not** apply the
      diagram dark-mode CSS invert filter (`markdown.css:456-465`); inverting
      arbitrary HTML destroys images and brand colors (the theme-interplay
      deliberation is in the brainstorm's Thread E).
      Provide the **secondary in-place expand** affordance (fullscreen the iframe
      or `window.open` the raw route — cheaper than the SVG-oriented pan/zoom in
      `src/scripts/lightbox.ts`). Done when clicking a sidebar artifact shows the
      iframe filling the content column with a working "open full page" button.

- [x] **Style `.artifact` in `markdown.css`** (global scope so runtime-created
      iframes are covered). The artifact fills the content column: `width: 100%`
      and a viewport-relative height (e.g. `calc(100vh - <navbar>)`), tokens per
      the theme contract (no hardcoded colors/sizes — CLAUDE.md Theming). Add
      `.artifact-error` chrome consistent with the diagram error styling. Done
      when the embed fills the area cleanly in both light and dark themes at a
      typical docs content width.

- [x] **Verification.** Drop a real `NN_demo.html` (a small self-contained page
      that honors `data-theme`) plus a same-name `.meta.json` sidecar under an
      existing docs section (e.g. `default-docs/data/dev-docs/15_scripts/`). Run
      `./start dev` and confirm: (1) the artifact shows in the sidebar in
      prefix order with the sidecar title; (2) selecting it renders the iframe in
      the content area with the sidebar intact and **no** TOC column; (3) the
      "open full page" button navigates to `/artifacts/<path>`; (4) toggling the
      site theme flips the artifact when it honors `data-theme`; (5) editing the
      `.meta.jsonc` sidecar live-updates. Then `bun run build` and confirm the page is
      emitted. Finally run `docs-guide check section` on that section — zero new
      errors.

## Implementation record (status → review)

**Files created (framework):**
- `astro-doc-code/src/loaders/artifact-pages.ts` — the artifact scanner (clone of
  `diagram-pages.ts`): `**/*.html` glob with `assets/` ignore, `NN_` prefix
  (missing → warning, not throw), `allow_artifact_pages: false` opt-out,
  `.meta.json`/`.meta.jsonc` sidecar, `artifactContainerHtml()`, `embed_height`
  override, opaque `artifact:` passthrough onto `entry.data`.
- `astro-doc-code/src/loaders/first-class-page.ts` — shared `resolveSlugCollisions()`
  (Thread A recommendation): one collision pool / one implementation for both the
  diagram and artifact scanners. `diagram-pages.ts` refactored to call it (its own
  error styling preserved via a factory arg).
- `astro-doc-code/src/scripts/artifacts.ts` — client renderer: builds the same-origin
  iframe, open-full-page (primary, clean route URL) + in-place expand (secondary),
  `data-theme` propagation into the iframe on load + re-sync via a `data-theme`
  MutationObserver (no invert filter). Registered in `BaseLayout.astro`.

**Files changed (framework):** `parsers/types.ts` (`FileType` += `'artifact'`),
`loaders/data.ts` (artifact scan after diagram push — shared pool, concatenated
`dependencyFiles`), `loaders/diagram-pages.ts` (uses the shared helper; the diagram
`.meta.jsonc` dependency-tracking bug is NOT replicated in the artifact loader),
`loaders/cache.ts` (`WarningType` += `'config'` — makes both loaders type-clean;
the shipped diagram loader had the same latent tsc error), `styles/markdown.css`
(global `.artifact` chrome — viewport-fill height via `calc(100vh - navbar - 2·xl)`,
tokens only), `layouts/BaseLayout.astro` (register `scripts/artifacts.ts`).

**Verified (dev :3099 + prod build):** demo artifact copied into
`user-guide/15_writing-content/` → sidebar entry with sidecar title, iframe fills
content column, **no** outline column, open-full-page → clean `/artifacts/<path>`
(target `_blank`), `data-theme` propagates into the same-origin iframe in BOTH themes
and re-syncs on toggle (headless screenshots + `iframe.contentDocument` probe),
`.meta.jsonc` edit live-updates the title (cache-dep fix confirmed), deliberate
`.html`+`.md` collision renders an explicit error naming both files. Prod build green
(752 pages with demo, 751 after removal); tsc: my files clean (27 remaining errors all
pre-existing in untouched files). Demo removed; dev server killed. Nothing committed.

**Handoff to subtask 50 (skills-integration):** `docs-guide check section` warns
"non-md file in docs folder" on the artifact `.html` + `.meta.jsonc` (0 errors). The
CLI checker isn't artifact-aware yet — teaching it to recognize `NN_`-prefixed `.html`
+ `.meta` sidecars belongs to subtask 50.
