---
title: "Render artifacts inside the issue tracker (notes/, brainstorm/)"
status: done
---

Scope extension accepted by sidhantha (2026-07-07, during first live testing):
first-class artifact rendering must ALSO work inside the issue tracker, not
just docs sections. An `.html` artifact in an issue's `notes/` or `brainstorm/`
(e.g. this issue's own `notes/03_planning-overview.html`) should surface in the
issue detail view like any other supporting document and render embedded —
the same treatment the docs layout gives artifact pages.

Why: the tracker is exactly where design thinking lives — a design system
deliberated in a `brainstorm/` folder, visual specs in `notes/` — and that
information has to be *representable* in place, descriptively, next to the
markdown that comments on it. Today the `/artifacts/<path>` route serves
tracker-hosted artifacts fine (verified live on this issue's fixture); the gap
is purely the issues layout: `issues.ts` lists markdown supporting docs only,
so the artifact never appears in the issue's file navigation.

Grounding: mirror `10_component.md`'s docs-side decisions wherever they carry
over (iframe embed, `.meta.json`/`.meta.jsonc` sidecar for title/description,
open-full-page affordance to the existing route, theme propagation, first-party
trust). Differences to respect: the tracker has no `NN_` requirement for
sub-docs (numbering is convention for subtasks only), `assets/` stays
embed-only/excluded as in docs, and the issues layout has its own parts
(`astro-doc-code/src/layouts/issues/default/` + `parts/`) and its own loader
(`loaders/issues.ts`).

## Tasks

- [x] **Loader** — `issues.ts`: pick up `.html` files (with optional
      `.meta.json`/`.meta.jsonc` sidecar) in an issue's `notes/` and
      `brainstorm/` folders ONLY (per sidhantha — not issue root, and never
      `assets/`) as supporting documents,
      with sidecar/filename-derived titles, participating in the issue's
      `updated` derivation and cache dependencies like `.md` siblings.
      *(`readFreeformDocs` gates `.html` to notes/brainstorm via `subName`,
      emits the shared `artifactContainerHtml()`; `isTrackedDocFile` now counts
      `.html` + `.meta.json`/`.meta.jsonc` for the cache signature; `updated` is
      git-derived so it already includes the `.html`.)*
- [x] **Detail layout** — the issue detail view lists artifact docs in its
      navigation alongside markdown notes (distinguishable — e.g. a small
      type marker), and selecting one renders the embedded iframe (src = the
      `/artifacts` route with the `?v=` cache-buster) with the open-full-page
      affordance, consistent with the docs-side embed container.
      *(New `IssueNote.docType`; `SubdocTree` renders an embed-glyph type marker
      on artifact rows; `NotePage` now shows the true filename+extension. The
      note's `html` is the `.artifact-html` container — no new client JS.)*
- [x] **Theme propagation** — the site theme toggle reaches tracker-embedded
      artifacts the same way it does docs-embedded ones.
      *(Rides the global `BaseLayout` `scripts/artifacts.ts` + global
      `.artifact` CSS — verified dark propagates into the iframe.)*
- [x] **Skills + docs touch-up** — `doc-issues` skill (repo source + installed
      cache) and the user-guide/dev-docs artifact pages state that tracker
      notes/brainstorm artifacts render first-class in the issue view (current
      system only, history-free); bundled `guide.ts` legend updated if it
      enumerates supporting-doc types.
      *(Skill: `22_notes.md` new section, `25_brainstorm.md` + `SKILL.md` notes,
      mirrored to the live 0.5.4 cache. Docs: user-guide `08_artifact-pages.md`
      "In the issue tracker", dev-docs `12_artifacts.md` "Reuse in the issue
      tracker". Legend: `guide.ts` Notes + Brainstorm sections.)*
- [x] **Full-width artifact view** (sidhantha, follow-up): when the selected
      note IS an artifact, hide the issue detail view's right-side index
      column and extend the artifact embed across that reclaimed width — the
      tracker twin of the docs layout's outline auto-hide, so the page view
      gets maximum real estate. Markdown notes keep the index as today.
      *(`SubDocLayout.astro`: `isArtifactDoc` off `IssueNote.docType` skips
      `SubDocMetaSidebar` + stamps `issue-layout--artifact`; `detail.css`
      drops the grid to two columns, centre gains the rail's width, cluster
      max-width and breakpoint collapses unchanged. Browser-verified on the
      planning-overview note: no `issue-meta` aside, markdown notes keep
      theirs.)*
- [x] **Verify** — browser check on this issue's own
      `notes/03_planning-overview.html`: appears in the issue detail
      navigation, renders embedded in both themes, opens full-page; tracker
      validator still clean; a diagram-page and a markdown note regression
      check.
      *(Headless screenshots both themes — iframe + theme-synced; `/artifacts`
      route 200; `docs-guide check issues` clean (only pre-existing unrelated
      warnings); diagram note (`editor-diagrams/notes/04_first-class-demo.excalidraw`)
      and markdown note both still render, marker only on the artifact.)*
