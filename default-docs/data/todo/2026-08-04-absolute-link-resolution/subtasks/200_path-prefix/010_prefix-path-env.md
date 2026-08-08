---
title: "PREFIX_PATH in .env — prepend a hosting segment to every generated URL"
status: blocked
---

# Overview

**Blocked on [the shared resolver](../100_absolute-resolution/020_the-shared-resolver.md)** —
structurally, not by scheduling. A prefix has nowhere to live until one place
owns the final URL.

Add a `.env` setting that prepends a path segment to every URL the engine
generates:

```
PREFIX_PATH=/xyz

/user-guide/getting-started/installation   →   /xyz/user-guide/getting-started/installation
```

**Done when** a built site serves correctly from a sub-path with no link, asset,
redirect or client-side navigation broken — verified by crawling a host mounted
at that sub-path, not by inspection.

# Settle this before designing anything

**Does Astro's own `base` option already do most of this?** Astro has a `base`
setting that prefixes its generated routes. The real question is what it does
*not* cover:

- hrefs our own layouts build by hand — sidebar, pagination, breadcrumbs, the
  issue index
- the `/artifacts/<path>` route and the `src` of every embed iframe
- client-side navigation in `parts/client.ts`
- the `/content-assets/` and `/assets/` routes

**If `base` covers the routing half, `PREFIX_PATH` should feed it rather than
exist beside it.** Two independent prefix mechanisms is precisely the drift this
project keeps paying for — the same shape as three link postprocessors for one
question. Confirm this first; it changes the whole design.

# Deliverables

1. `PREFIX_PATH` read from `.env` at config load, normalised (leading slash, no
   trailing slash, empty = today's behaviour), and rejected loudly if malformed.
2. Applied **once**, inside the shared resolver and whatever single place the
   layouts get URLs from — never sprinkled at call sites.
3. Documented on both sides: usage in user-guide `10_configuration/`, mechanism
   in dev-docs.

# Done when

- [ ] The open question above is answered in writing, in
      [the note](../../notes/40_the-hosting-path-prefix.md), before code
- [ ] Every surface in that note's table is covered — in-body links, layout
      chrome, assets, the artifact route, redirects, canonical/meta URLs,
      client-side navigation
- [ ] **Crawl a static host mounted at the prefix** with
      `scripts/checks/check-links.mjs` and get the same result as the unprefixed build.
      Two configurations, same number
- [ ] **Dev parity:** `./start dev` behaves identically with the prefix set, or
      the prefix recreates the dev-versus-production split that caused every
      problem this issue records
- [ ] Empty / unset `PREFIX_PATH` is byte-identical to today — control it, don't
      assume it
- [ ] The prefix does not reintroduce a trailing-slash dependency; check one
      slash-form and one no-slash URL under the prefix

# References

- The reasoning and the surface list:
  [the hosting path prefix](../../notes/40_the-hosting-path-prefix.md)
- The prerequisite:
  [the shared resolver](../100_absolute-resolution/020_the-shared-resolver.md)
- The gate: repo-root `scripts/checks/check-links.mjs`
- The `.env` and config surface: `astro-doc-code/astro.config.mjs`, which already
  reads `.env` from the repo root rather than `process.cwd()`

# Details

## Why an env var rather than `site.yaml`

The prefix is a property of **where this build is being deployed**, not of the
content — the same content ships to a root-hosted site and a sub-path-hosted one.
`site.yaml` is content configuration and is committed; `.env` is per-environment
and is not. That split is the existing convention here and this fits it cleanly.

Worth stating explicitly in the docs, because `base_url` in `site.yaml` looks
like the natural home and is not: that field is *which section a page belongs
to*, which is content structure, and it is
[not tied to the folder name either](../100_absolute-resolution/040_base-url-and-folder-name-are-not-tied.md).
