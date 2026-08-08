---
title: "The hosting path prefix — serving the site from a sub-path"
---

# What it is

**A `.env` setting that prepends a path segment to every URL the engine
generates**, so a built site can be served from a sub-path of a domain rather
than from its root:

```
PREFIX_PATH=/xyz

/user-guide/getting-started/installation   →   /xyz/user-guide/getting-started/installation
```

The use case is hosting several static sites under one domain — the common shape
for project docs on GitHub Pages, an internal portal, or a shared bucket behind
one CDN.

# Why it belongs in this issue rather than its own

**A prefix is only implementable once something owns the final URL.** You cannot
prepend a segment to an href that the browser is going to compute for itself —
the whole point of a relative link is that the final URL does not exist until the
reader is standing somewhere.

So the prefix is not an extra feature bolted onto [the path map](./30_the-path-map.md);
it is the map's first real customer, and roughly one line inside it. Building
them as separate issues means building the seam twice, and the second one would
discover it needs the first.

# What it has to cover

The prefix is only correct if it reaches **everything the engine emits**, not just
in-body links. Anything missed produces a link that works at the root and breaks
under a prefix — the same class of environment-dependent bug this whole issue is
about, which is a reason to be exhaustive rather than incremental:

| Surface | Notes |
|---|---|
| In-body content links | through the shared resolver |
| Sidebar, pagination, breadcrumbs | layout-generated hrefs |
| The issue index, filters, and the Comprehensive panel | including client-side navigation in `parts/client.ts` |
| Asset URLs — `/content-assets/…` and `/assets/…` | both are engine-owned routes |
| The `/artifacts/<path>` route, and the `src` of every embed iframe | |
| Canonical / meta / OpenGraph URLs | |
| Redirects | the issue `/issue` → detail-root redirect, and dual-slug resolution |

# Open questions, to settle inside the work

- **Does `astro.config.mjs`'s own `base` option do this already, and is it
  enough?** Astro has a `base` setting that prefixes its generated routes. The
  question is what it does *not* cover — our hand-built hrefs, the artifact
  route, the client-side navigation — and whether a `.env` variable should feed
  Astro's `base` rather than exist beside it. **Feeding it is almost certainly
  right**; two independent prefix mechanisms is the drift this project keeps
  paying for. Confirm before designing anything.
- **Trailing-slash interaction.** The prefix must not reintroduce the question
  this issue exists to delete. With absolute resolution it should not, but it
  needs one explicit check rather than an assumption.
- **Dev parity.** The prefix must behave the same in `./start dev` as in a built
  site, or it recreates the dev-versus-production split that caused every problem
  recorded here.

# Done when

A built site serves correctly from a sub-path with **no link, asset, redirect or
client-side navigation broken** — verified by `scripts/checks/check-links.mjs` against a
static host mounted at that sub-path, not by inspection.
