## Goal

Make relative markdown links inside issue content resolve correctly, and canonicalize the legacy `/issue` path.

## The bug

`issue.md` is the issue **folder's** body, but it's rendered into the detail page served at `/<tracker>/<issue>` — **one path segment shallower** than the file's own position on disk (`<issue>/issue.md`). Relative links in `issue.md` are authored relative to the issue folder, so in the browser they under-resolve by one level: the `/<tracker>` (and issue) segment gets dropped. e.g. a link to `../<other>/issue.md` wrongly resolved to `/<other>/issue` instead of `/<tracker>/<other>/…`. Sub-doc pages (subtasks/notes/agent-log) are served at a URL depth that matches their file depth, so their links already resolved correctly.

## What shipped (subtasks 01, 02 & 04 — verified + closed)

1. **`/issue` → detail-root redirect.** `/<tracker>/<issue>/issue` (previously a 404 — `issue` isn't a sub-doc kind) now canonically redirects to `/<tracker>/<issue>`. Base-agnostic (`pageConfig.base_url`), works in dev SSR (302) and static build (per-issue redirect page). Files: `pages/lib/route-match.ts`, `pages/lib/static-paths.ts`, `pages/[...slug].astro` (a `redirectTo` prop checked early, mirroring the existing `docs-index` redirect).
2. **`issue-body-links` postprocessor (issues pipeline only).** Re-roots relative links in the root `issue.md` at the issue folder so they survive the URL collapse; gated to `issue.md`, sub-docs untouched. File: `parsers/postprocessors/issue-body-links.ts`, wired only into `IssuesParser` (`parsers/content-types/issues.ts`). Verified in built HTML both directions; `./start build` clean (469 pages).
3. **Colocated issue assets (subtask 04).** `[[path]]` embeds wired into `IssuesParser` (issue-folder resolver), plus `issue-asset-src` postprocessor rewriting relative `<img src>` to absolute `/issue-assets/<tracker-rel>` URLs served by a new `pages/issue-assets/[...path].ts` endpoint. Absolute srcs are depth-proof, so this also covers images inside Comprehensive-panel embeds — the same render-time-absolute principle subtask 03 applies to links.

## Known remaining gap → the real fix (subtask 03, open)

Sub-doc bodies (subtasks / notes) embedded **inline in the Comprehensive / overview panel** are shown at the *shallow* detail URL while carrying relative links authored for their *own* (deeper) URL — so `../..` over-climbs and drops the `/tracker` prefix (→ 404). Same bug class as `issue.md`, mirrored.

**Decided fix:** stop depending on the browser for relative resolution — resolve **all** internal links to **root-absolute** URLs at render time (needs `base_url` + the file's url-path threaded into `ProcessContext`). This is browser-position-independent, fixes the whole class at once (issue.md, the embed, and the latent trailing-slash fragility in docs/blog), and **supersedes the interim `issue-body-links` postprocessor** from subtask 02. Full worked example + plan in `subtasks/03`.

## Why it matters beyond the bug

This is the concrete instance of the **centralized-URL / structure-coupling smell**: the URL half of the fix had to touch *two* shared switch files (`route-match` + `static-paths`) kept in sync by hand, while the pipeline half was clean because the parser is already per-structure. That asymmetry is captured in `2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md` — the proper long-term fix (self-registering structures owning their own URL rules).

## Re-confirmed from a second direction (2026-08-03)

A separate run rediscovered this issue's core finding the hard way, and two new
routing subtasks landed here as a result.

**Subtask 03's decision was right, and the interim fix it warned against got
built anyway.** `2026-08-02-refactor-efficiency-and-planning` shipped a one-level
URL-depth shift in `internal-links.ts` for the docs pipeline — measured 418 → 0
broken links **against the built site**, and wrong on the dev server, which
serves the same page without a trailing slash. That is exactly the *"latent
trailing-slash fragility"* this issue names: a relative href resolves against
whatever base the current address happens to have, and dev and build do not
agree on it. A constant offset cannot be correct in both.

So **[`03`](../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/030_comprehensive-panel-subdoc-links.md) is now the fix for
docs and blog as well, not only the Comprehensive panel** — and it is the highest
priority thing on this issue.

**What that run also established, by clicking fifteen links rather than reading
`dist/`:** the tracker's own relative links resolve **correctly**. Tracker pages
are served without a trailing slash and keep their `NN_` prefixes, so source path
and URL path are the same string. A claim that they 404 en masse was recorded by
two independent reviews and is retracted — both read the built tree, neither
opened a URL. Record: [`110 the live check`](../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md).

**Two new subtasks**, both from failures in that live check:

- [`05 dual-slug URL resolution`](./subtasks/05_dual-slug-url-resolution.md) — a
  link leaving the tracker into docs or blog keeps the source spelling, because
  the target section's slug transform is never applied
- [`06 plans auto-resolution`](./subtasks/06_plans-auto-resolution.md) — a plan
  folder collapses to one page, so `overview.md` has no route. The same collapse
  this issue already fixed for `issue.md`

**And one defect that makes all of this hard to test:** a missing page answers
HTTP `200` with a *Page Not Found* body. Any status-based link checker calls dead
links healthy. Carried on `05`.

## Related

- **`2026-05-08-runtime-stack-migration`** — `notes/architecture-update/01_the-structure.md`: the structure/layout/theme separation this bug motivates.
- **`2026-05-07-sidebar-state-persistence`** — where the broken cross-link was first spotted.
