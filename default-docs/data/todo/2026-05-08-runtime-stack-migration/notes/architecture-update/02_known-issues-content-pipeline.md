---
title: "Known issue: per-parser pipeline divergence (assets, embeds, custom tags)"
---

# Known issue the migration must solve: content-pipeline divergence

> Captured 2026-06-09. Companion to `01_the-structure.md` — that note records the
> URL/structure smell; this one records the **processing-pipeline** smell. Both
> are inputs to the same design rule: a structure **owns one shared pipeline**,
> not a hand-wired copy of it.

## The symptom (verified in the Astro code)

Each content-type parser wires its own pre/postprocessor list independently
(`parsers/content-types/docs.ts` / `blog.ts` / `issues.ts`), so capabilities
drift per type:

- **Asset embeds** (`[[path]]`): registered for docs + blog, *never* for issues —
  `IssuesParser.getAssetPath()` existed as dead code, nothing called it.
- **Image srcs**: *no* content type rewrites relative `<img src>`; anything that
  renders at a URL depth different from its file depth (the issues detail-page
  collapse, embedded sub-doc panels) 404s in the browser.
- **Custom tags** (`src/custom-tags/`): wired into no parser at all —
  infrastructure without wiring (tracked in `2026-04-20-custom-tags`).
- **Internal links**: full relative-link resolution is gated to
  `contentType === 'docs'` (`parsers/postprocessors/internal-links.ts`).

Three path-resolution mental models exist for the same authoring problem
(docs file-relative, blog central `assets/<slug>/`, issues folder-relative).

## Patched in Astro, solved in Go

The narrow bugs get point fixes in the Astro code as they bite
(`2026-06-09-issue-link-resolution` — re-rooting, `/issue` redirect, colocated
issue assets). But the class of bug exists *because* every parser re-declares
its pipeline by hand. The full unification — single pipeline factory, URL-native
reference registry, wiki links, knowledge graph — is specced in
**`2026-04-19-knowledge-graph-and-wiki-links`** (see its
`subtasks/01_unified-pipeline-and-graph.md`). Decision 2026-06-09: **do not
build that engine restructure into the Astro codebase** — it becomes a design
requirement of the Go runtime's content pipeline:

- One pipeline, declared once; structures contribute *deltas* (a resolver, an
  extra pass), never their own copy of the standard set.
- References (links, images, embeds) resolve against a **URL registry** at
  render time — absolute, browser-position-independent — instead of three
  filesystem conventions plus browser-relative resolution.
- Capabilities (embeds, custom tags, diagrams) are pipeline-level, so a new
  structure gets them for free; per-type drift becomes impossible by
  construction.
