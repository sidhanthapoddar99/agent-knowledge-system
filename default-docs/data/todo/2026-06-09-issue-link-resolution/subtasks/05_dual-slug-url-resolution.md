---
title: "Docs and blog should accept both URL spellings — the source form and the clean slug"
status: open
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

- [ ] Implement the fallback in `astro-doc-code/src/pages/lib/route-match.ts`,
      and the static-build equivalent in `static-paths.ts` — the two files this
      issue already noted must be kept in sync by hand
- [ ] **Decide canonicality.** Two live URLs per page is a real cost: search
      engines see duplicates, and "which one do I write" becomes a question
      again. Recommended: the clean slug stays canonical and the source form
      **redirects** to it, exactly as `/…/<issue>/issue` already redirects to the
      detail root (subtask [`01`](./01_redirect-issue-to-detail-root.md))
- [ ] Cover the reverse direction too — a clean-slug link into the **tracker**,
      whose URLs keep their prefixes
- [ ] 🔴 **Make a missing page answer `404`.** All four URLs above return HTTP
      `200`; two render a *Page Not Found* body. Any checker that trusts the
      status code reports dead links as healthy — including the obvious way to
      write one. This is a prerequisite for testing anything here
- [ ] Control-test both directions: both spellings resolve, and a genuinely
      absent page still fails

# References

- The measurement that found it: [`110 the live check`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md)
- The diagnosis and the three options: [`120 dev and build disagree`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)
- The deeper fix already decided on this issue:
  [`03 render-time absolute`](./03_comprehensive-panel-subdoc-links.md) — note it
  is **not** a substitute. Render-time absolute resolution fixes links this
  project emits; this subtask fixes URLs a human types, a bookmark holds, or an
  external page links to
- The sibling case: [`06 plans auto-resolution`](./06_plans-auto-resolution.md)
