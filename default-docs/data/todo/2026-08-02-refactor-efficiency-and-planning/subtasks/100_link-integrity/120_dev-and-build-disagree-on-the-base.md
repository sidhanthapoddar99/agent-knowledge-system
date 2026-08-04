---
title: "Dev and build resolve the same link differently — the depth shift cannot fix both"
status: input-needed
---

# Overview

**One href, two answers.** The renderer emits a relative href like
`../design-philosophy`. What that resolves to depends entirely on whether the
current page's URL ends in a slash — and the dev server and the built site
disagree about that.

| Environment | Page served at | Base the browser uses | `../x` becomes |
|---|---|---|---|
| `./start dev` | `/user-guide/issues/overview` | `/user-guide/issues/` | `/user-guide/x` |
| built site | `/user-guide/issues/overview/` (directory + `index.html`) | `/user-guide/issues/overview/` | `/user-guide/issues/x` |

**Every conclusion in this group so far was drawn in one of the two
environments, and neither generalises to the other.** That is the actual root
cause behind [`010`](./010_renderer-drops-a-url-level.md), and behind the
retraction in [`110`](./110_live-check.md).

**Done when** a link written once resolves to the same page in dev and in the
built site, and the docs regression below is gone.

# The regression I shipped

🔴 **The depth shift in
`astro-doc-code/src/parsers/postprocessors/internal-links.ts` breaks docs links
on the dev server.** Measured 2026-08-03:

| URL | Title served |
|---|---|
| `/user-guide/design-philosophy` — where the emitted `../design-philosophy` lands | `Page Not Found` |
| `/user-guide/issues/design-philosophy` — the real page | `Design Philosophy` |

It was correct for the built site — that is where 418 → 0 was measured — and it
is wrong for the environment the work actually happens in. **This is not an
argument for reverting it**; reverting simply moves the breakage back to
production. It is an argument that the shift is the wrong mechanism, because a
constant offset cannot be right in two places that differ by one segment.

# The other two defects the live check found

## Cross-content-type links keep the source spelling

A tracker page linking into docs or blog emits the path as written. The tracker
pipeline strips `.md` and stops; it never applies the **target** section's slug
transform.

| Written | Emitted | Actually lives at |
|---|---|---|
| `../../../../user-guide/19_issues/01_overview.md` | `/user-guide/19_issues/01_overview` | `/user-guide/issues/overview` |
| `../../../../blog/2024-01-15-hello-world.md` | `/blog/2024-01-15-hello-world` | `/blog/hello-world` |

Within the tracker this never shows, because tracker URLs **keep** their `NN_`
prefixes — source path and URL path are the same string. The mismatch appears
only at the boundary, which is why 12 of 15 links passed.

## A missing page answers `200`

Both dead URLs above return HTTP `200` with a *Page Not Found* body. **A link
checker that trusts the status code reports them healthy.** Same shape as every
item in [`090`](../090_silent-failure-defects/00_overview.md) — a true statement
about a smaller subject than the reader believes — and it means any future
HTTP-based gate must assert on the rendered page, not the status.

## A plan's `overview.md` is not a route

`…/plans/01_fix-the-tools-then-the-links/overview` is a `404`; the plan's page is
the folder URL itself. So a link to the real file on disk cannot resolve. Sid:
*"this should be automatically resolved."*

> [!IMPORTANT]
> **This was already decided, on 2026-06-09, and the decision was option A.**
> `2026-06-09-issue-link-resolution` subtask
> [`03`](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/030_comprehensive-panel-subdoc-links.md)
> reads: *"stop depending on the browser to resolve relative links. Resolve all
> internal links to root-absolute URLs at render time… also hardens docs/blog"*
> — and it names **"the latent trailing-slash fragility in docs/blog"** as one of
> the things it fixes. That is the exact defect below, written down eight weeks
> before this run rediscovered it.
>
> It is still `open`. This run then built the interim depth shift that subtask
> supersedes. **The routing work now lives on that issue** as
> [`05`](../../../2026-06-09-issue-link-resolution/subtasks/05_dual-slug-url-resolution.md)
> and [`06`](../../../2026-06-09-issue-link-resolution/subtasks/06_plans-auto-resolution.md),
> so URL resolution has one home rather than two. What stays here is this run's
> own damage: the regression, and the instructions it wrote.

# The decision — three ways out, and they are not equivalent

> [!IMPORTANT]
> **This is Sid's call.** Two renderer changes in this run each produced a
> regression, and this one touches routing for every content type.

### A — resolve links to their final URL at render time *(recommended)*

The renderer already knows every page's real URL. Resolve each relative source
link against the target's actual route and emit the **absolute** href.

- Fixes all four problems at once: the dev/build split (an absolute href has no
  base), the `NN_` and date prefixes at content-type boundaries, and the plan
  index case.
- **The source stays relative**, so `agent-ks move` still maintains it and the
  rule in [`020`](./020_relative-links-are-the-contract.md) survives unchanged.
  The absolute form appears only in output, which is the one place it is safe.
- Costs the most: the renderer must be able to resolve any target to its route,
  including across content types.

### B — slug-tolerant routing, Sid's proposal

*"routing `NN_<name>` if present in the route url and its not found then try
removing `NN_<name>` … blogs and docs also accepts both types of url slugs."*

- Fixes 12 and 13 directly, and is the smallest change.
- Two URLs per page. Search engines, the outline, and any link checker now see
  duplicates, and the canonical form stops being obvious.
- **Does not touch the dev/build base problem at all** — that regression stays.

### C — force the two environments to agree

Set `trailingSlash` / `build.format` explicitly in
`astro-doc-code/astro.config.mjs` so dev and build serve the same URL shape.

- Removes the cause of the regression rather than compensating for it, and it is
  a two-line change.
- Still leaves the prefix mismatch at content-type boundaries (12, 13) and the
  plan index case (8).

**A alone is complete. C is the honest minimum and pairs naturally with B.**

# References

- The evidence: [`110`](./110_live-check.md) — fifteen links, clicked
- The finding this replaces: [`010`](./010_renderer-drops-a-url-level.md)
- The shift itself:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
- The rule that survives either way:
  [`020`](./020_relative-links-are-the-contract.md)
- The gate that cannot see any of this yet:
  [`070`](./070_reframe-the-link-checker.md) — it reads `dist/`, so it measures
  the built site only

# Outcomes and Next Steps

> [!IMPORTANT]
> **Waiting on Sid — which of A, B, C.** Nothing is being changed in the
> renderer until that is answered, because the last two changes there each
> looked right and each broke something measured only afterwards.

Whatever is chosen, the check that proves it is the same one that found the
problem: **the same link, opened in dev and in a preview of the built site.**
Not a count, and not a static read of `dist/`.
