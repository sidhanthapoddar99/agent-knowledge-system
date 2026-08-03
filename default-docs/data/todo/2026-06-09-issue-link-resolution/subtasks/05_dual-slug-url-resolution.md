---
title: "Docs and blog accept both URL spellings — the source form redirects to the clean slug"
status: done
---

**Decision (2026-08-03, Sid):** a route should resolve whether it is written the
way the file is spelled on disk or the way the site publishes it. *"blogs and
docs also accepts both types of url slugs and resolve it automatically."*

# Overview

**A link written against the filesystem — which is the only form this project
allows — currently dies at a content-type boundary.** The tracker keeps `NN_`
prefixes in its URLs; docs strip them; blog strips the date. So a tracker page
linking into docs emits exactly what the author wrote, and lands on nothing.

Measured on the dev server, 2026-08-03:

| URL | Title served |
|---|---|
| `/user-guide/19_issues/01_overview` | **`Page Not Found`** |
| `/user-guide/issues/overview` | `Issues Overview` |
| `/blog/2024-01-15-hello-world` | **`Page Not Found`** |
| `/blog/hello-world` | `Hello World` |

Both left-hand URLs name a real file, correctly, by its real path. The routing
layer is the thing that disagrees.

**Done when** both spellings resolve for docs and blog, one of them is canonical,
and a link written against the file tree cannot 404 for spelling alone.

# Why this belongs to the filesystem-first principle

This is the routing half of the rule in the project `CLAUDE.md`: *we build the
app so it works on native documents.* An author who writes
`../../../../user-guide/19_issues/01_overview.md` has written the **true path**.
Asking them to instead write `/user-guide/issues/overview` asks them to know the
publishing transform — to write for the app rather than for the tree — and it
produces a link that is false in Obsidian, false to `grep`, and unmaintainable by
`agent-ks move`.

**So the fix belongs in the router, not in the content.**

# The shape of the fix

Sid's proposal, which is the cheap version:

> *"routing `NN_<name>` if present in the route url and its not found then try
> removing `NN_<name>` — like a slug routing protocol which works for docs."*

A fallback in route matching: try the URL as given; if nothing matches, strip
ordering prefixes (and the blog date) segment by segment and try again.

# Todo list

- [x] Implemented in `route-match.ts` (request time) and `static-paths.ts`
      (build time), which had to be kept in step by hand as this issue warned
- [x] **Canonicality decided: the clean slug wins.** The source form is a
      **302 redirect**, not a second page — so there is still exactly one URL to
      write down, and no duplicate content. Same mechanism as
      [`01`](./01_redirect-issue-to-detail-root.md)
- [x] 🟢 **A missing page now answers `404`** — and still renders the styled
      not-found page rather than bare text. The status was the defect; the page
      was not
- [x] Control-tested in both environments and both directions
- [ ] The reverse direction — a **clean-slug** link into the tracker, whose URLs
      keep their prefixes. Not built: no such link exists today, and the tracker
      resolves correctly as authored. Worth doing only if one appears

# Outcomes and Next Steps

**Shipped 2026-08-03. Both spellings resolve, in dev and in the built site.**

Measured against the running dev server on `:3088`, and against `dist/` after a
clean build:

| URL | Before | After |
|---|---|---|
| `/user-guide/19_issues/01_overview` | `200` · *Page Not Found* | **`302` → `/user-guide/issues/overview`** |
| `/blog/2024-01-15-hello-world` | `200` · *Page Not Found* | **`302` → `/blog/hello-world`** |
| `/user-guide/99_no_such_page/01_nope` | `200` · *Page Not Found* | **`404`** · same styled page |
| `/user-guide/issues/overview` | `200` | `200` — unchanged |

Build: **1,168 pages**, clean. The aliases add **171** redirect pages across
docs and blog, and nothing else moved.

### How the match is made, and why not the obvious way

The proposal was to strip `NN_` from the URL and retry. **Implemented instead
by matching the file**: every content item already carries `relativePath`, so
its source-form URL is that path minus the extension, and a lookup against it is
exact.

A strip-and-retry heuristic would have to re-implement the slug transform in a
second place and drift the moment either side changed — a required rule written
as a lookalike, which is the failure this project keeps meeting. Matching the
real file cannot drift, because there is only one source of truth.

`sourceFormSlug()` and `canonicalContentUrl()` live in `route-match.ts` and are
imported by `static-paths.ts`, so the request-time and build-time paths cannot
disagree — the hand-syncing this issue flagged is now one function.

### Two things guarded, both found by asking rather than by a failure

- **An alias never overwrites a real page.** If one document's source form is
  another's canonical slug, the alias is skipped. Duplicate entries in
  `getStaticPaths()` fail the whole build, and a real page must win.
- **The styled 404 survived.** The first cut returned bare `Not Found` text,
  which fixed the status by removing the page. The status was the defect.

# References

- The measurement that found it: [`110 the live check`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md)
- The diagnosis and the three options: [`120 dev and build disagree`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)
- The deeper fix already decided on this issue:
  [`03 render-time absolute`](./03_comprehensive-panel-subdoc-links.md) — note it
  is **not** a substitute. Render-time absolute resolution fixes links this
  project emits; this subtask fixes URLs a human types, a bookmark holds, or an
  external page links to
- The sibling case: [`06 plans auto-resolution`](./06_plans-auto-resolution.md)
