## Goal

Make relative markdown links inside issue content resolve correctly, and canonicalize the legacy `/issue` path.

## The bug

`issue.md` is the issue **folder's** body, but it's rendered into the detail page served at `/<tracker>/<issue>` — **one path segment shallower** than the file's own position on disk (`<issue>/issue.md`). Relative links in `issue.md` are authored relative to the issue folder, so in the browser they under-resolve by one level: the `/<tracker>` (and issue) segment gets dropped. e.g. a link to `../<other>/issue.md` wrongly resolved to `/<other>/issue` instead of `/<tracker>/<other>/…`. Sub-doc pages (subtasks/notes/agent-log) are served at a URL depth that matches their file depth, so their links already resolved correctly.

## What shipped (mostly done — see subtasks 01 & 02, both in review)

1. **`/issue` → detail-root redirect.** `/<tracker>/<issue>/issue` (previously a 404 — `issue` isn't a sub-doc kind) now canonically redirects to `/<tracker>/<issue>`. Base-agnostic (`pageConfig.base_url`), works in dev SSR (302) and static build (per-issue redirect page). Files: `pages/lib/route-match.ts`, `pages/lib/static-paths.ts`, `pages/[...slug].astro` (a `redirectTo` prop checked early, mirroring the existing `docs-index` redirect).
2. **`issue-body-links` postprocessor (issues pipeline only).** Re-roots relative links in the root `issue.md` at the issue folder so they survive the URL collapse; gated to `issue.md`, sub-docs untouched. File: `parsers/postprocessors/issue-body-links.ts`, wired only into `IssuesParser` (`parsers/content-types/issues.ts`). Verified in built HTML both directions; `./start build` clean (469 pages).

## Known remaining gap → the real fix (subtask 03, open)

Sub-doc bodies (subtasks / notes) embedded **inline in the Comprehensive / overview panel** are shown at the *shallow* detail URL while carrying relative links authored for their *own* (deeper) URL — so `../..` over-climbs and drops the `/tracker` prefix (→ 404). Same bug class as `issue.md`, mirrored.

**Decided fix:** stop depending on the browser for relative resolution — resolve **all** internal links to **root-absolute** URLs at render time (needs `base_url` + the file's url-path threaded into `ProcessContext`). This is browser-position-independent, fixes the whole class at once (issue.md, the embed, and the latent trailing-slash fragility in docs/blog), and **supersedes the interim `issue-body-links` postprocessor** from subtask 02. Full worked example + plan in `subtasks/03`.

## Why it matters beyond the bug

This is the concrete instance of the **centralized-URL / structure-coupling smell**: the URL half of the fix had to touch *two* shared switch files (`route-match` + `static-paths`) kept in sync by hand, while the pipeline half was clean because the parser is already per-structure. That asymmetry is captured in `2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md` — the proper long-term fix (self-registering structures owning their own URL rules).

## Related

- **`2026-05-08-runtime-stack-migration`** — `notes/architecture-update/01_the-structure.md`: the structure/layout/theme separation this bug motivates.
- **`2026-05-07-sidebar-state-persistence`** — where the broken cross-link was first spotted.
