---
title: "Documentation — user-guide (author/embed) + dev-docs (mechanism/route/rationale)"
status: done
---

## Goal

Ship the feature's documentation on **both** sides of the mandatory audience
split (CLAUDE.md): **user-guide** teaches an author *how to use* artifacts (create
an `.html` page, the sidecar, how it embeds, the reserved-URL limitation);
**dev-docs** documents *how the framework implements* it (the loader scan, the
`/artifacts` route, parser/render integration, the design rationale and extension
points). A page that explains internals in user-guide, or usage in dev-docs, is
misfiled.

The precedent to mirror is the first-class-diagram documentation, which already
lives on both sides. This subtask depends on the code being real
([`10`](./10_component.md), [`20`](./20_route.md), [`30`](./30_reserved-url-guard.md))
so every documented path/behavior is true, and it must state the same
reserved-word list as the guard (`30`) and the skills (`50`).

## Where the pages go (verified section tree)

- **user-guide** `default-docs/data/user-guide/15_writing-content/` already holds
  `06_diagram-pages.md` and `07_diagram-showcase.md` (plus `01_overview`…`05`).
  The artifact authoring page is the natural next sibling (e.g.
  `08_artifact-pages.md`), with an optional showcase peer. The reserved-URL
  limitation belongs in `default-docs/data/user-guide/10_configuration/`
  (base-URL / settings territory).
- **dev-docs** `default-docs/data/dev-docs/05_architecture/` holds
  `02_routing.md`, `03_data-loading.md`, and the `04_parser/` folder. Artifact
  loader mechanism extends `03_data-loading.md` (or a new sibling page); the
  route extends `02_routing.md`; render/embed integration touches `04_parser/`
  and `05_layout-internals/`.
- Every new page needs the framework requirements: an `NN_` prefix (2 digits,
  gap-spaced), a `settings.json` in its folder (already present in these
  sections), and a `title` in frontmatter.

## Tasks

- [x] **user-guide: authoring artifacts page.** DONE — `15_writing-content/08_artifact-pages.md`. Create
      `user-guide/15_writing-content/08_artifact-pages.md` (or the next free
      gap-spaced prefix). Cover: dropping an `NN_.html` file into a docs section;
      what happens (sidebar entry, embed fills the content area, chrome stays,
      "open full page" button); the same-name `.meta.json`/`.meta.jsonc`
      **sidecar contract** (title, description, sidebar fields, and the explicit
      declared
      values — palette/purpose/key data — that let an agent understand the
      artifact without reading the HTML); the self-containment expectation; and
      how to view it full-page at `/artifacts/<path>`. Point to the
      `agent-ks-artifacts` skill for *building* artifacts well. Done when an author
      can create and embed an artifact from this page alone.

- [x] **user-guide: reserved-URL limitation.** DONE — added "Reserved base URLs" section + enriched "Route Validation" in `10_configuration/03_site/08_page.md` (list matches `RESERVED_BASE_URLS`). In
      `user-guide/10_configuration/` (the base-URL / settings page), document that
      a docs section's `base_url` may not be `artifacts` (nor the other reserved
      words `assets`, `content-assets`, `api`, `editor`), that config load
      hard-fails with an actionable error, and why (`/artifacts` is the full-page
      route). Match the list to the `30` code and the `50` skills. Done when the
      limitation is discoverable where authors choose base URLs.

- [x] **user-guide (optional): showcase page.** DONE — `09_artifact-showcase.md` + a self-authored live demo artifact `10_design-system-demo.html` (+ `.meta.json` sidecar). Verified rendering embedded (light+dark) and full-page. Consider an
      `09_artifact-showcase.md` peer to `07_diagram-showcase.md` that embeds a
      real demo artifact, exercising the client render in production docs (the
      diagram showcase is the pattern). Done when a live artifact renders inside a
      published docs page.

- [x] **dev-docs: loader mechanism.** DONE — "Artifact Pages" subsection in `05_architecture/03_data-loading.md` (scan, shared collision pool, dependencyFiles concat, sidecar shape, opt-out; real file/line refs). Extend
      `dev-docs/05_architecture/03_data-loading.md` (or add a sibling) documenting
      `loaders/artifact-pages.ts`: the `**/*.html` scan, `assets/` exclusion, the
      `NN_` skip-with-warning policy, `allow_artifact_pages` opt-out, the sidecar
      load, and how entries join the shared collision pool and `dependencyFiles`
      alongside markdown and diagrams in `data.ts`. Reference real files/lines.
      Done when a framework dev can trace an `.html` file to a rendered page.

- [x] **dev-docs: the route.** DONE — "The Reserved Artifact Route" + "Reserved Base URLs" sections in `05_architecture/02_routing.md` (static-segment priority, scoped `text/html` MIME, `isInternalSlug`, cache-buster handshake, `validateRoutes` guard). Extend
      `dev-docs/05_architecture/02_routing.md` documenting the reserved
      `src/pages/artifacts/[...path].ts` serving route: static-segment priority
      over the `[...slug]` catch-all, the scoped `text/html` MIME decision (and
      why `.html` was *not* added to the shared `mime.ts`), the
      `isInternalSlug` reservation, and the caching/cache-buster handshake. Done
      when the route's design is explained with its trade-offs.

- [x] **dev-docs: render/embed integration + rationale.** DONE — new `15_scripts/12_artifacts.md` (embed container, `scripts/artifacts.ts`, theme handshake + why-no-invert, expand, CSS, extension points, "Design rationale" with issue link) + updated `15_scripts/05_overview.md`. Document the embed
      container HTML, the `scripts/artifacts.ts` client renderer, the
      theme-propagation-into-iframe approach (and why the diagram dark-mode invert
      is deliberately *not* applied to artifacts), and the extension points.
      Include the design rationale: why artifacts mirror the diagram pipeline
      (additive, no new content type/layout), and why the dedicated URL is the
      primitive with expand as secondary — sourced from the settled-decisions note
      under `../notes/`. Done when the rationale is captured on the dev side, not
      just in the tracker.

- [x] **Verification.** DONE — `agent-ks check section` = 0 errors on all 4 touched sections (2 expected non-md-file warnings on the demo `.html`/`.meta.json` are subtask 50's scope). `bun run build` = 755 pages green; full-page route emits byte-identical. Dev server + headless browser: embedded demo fills the content column (sidebar stays, outline auto-hides), open-full-page URL correct, both light + dark verified (embedded follows the site via `data-theme`; full-page via `prefers-color-scheme`), demo is self-contained; every cross-link resolves (fixed `page` slug + em-dash anchor against built heading IDs). Audience split intact. Run `agent-ks check section` on both
      `user-guide/15_writing-content` and the touched `dev-docs` sections — zero
      errors (frontmatter, prefixes, links). Run `./start build` and navigate the
      new pages in `preview`; confirm the showcase artifact renders and every
      cross-link (to the skill, to the reserved-URL note) resolves. Confirm the
      user-guide pages contain no framework-internals and the dev-docs pages
      contain no step-by-step authoring instructions (audience split intact).
