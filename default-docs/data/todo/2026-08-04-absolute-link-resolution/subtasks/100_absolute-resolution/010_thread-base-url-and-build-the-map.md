---
title: "Thread base_url into the parser layer and build the file → URL map"
status: open
---

# Overview

**The parsers do not know which section they are in, so they cannot produce a
URL.** `grep base_url src/parsers/` returns nothing (checked 2026-08-04);
`ProcessContext` carries `filePath`, `fileDir`, `contentType`, `frontmatter` and
`basePath`, and none of those says whether this file publishes under
`/user-guide`, `/dev-docs` or `/todo`.

That single missing field is why every fix so far has been a string edit on the
href instead of a resolution. This subtask supplies it, and builds the lookup
that turns a file path into a URL.

**Done when** a resolver can be handed any absolute source-file path in the
project and return the exact URL that file is published at — verified against the
routes the build actually emits, not against a re-derivation of the slug rules.

# Deliverables

1. **`baseUrl` and the file's own url-path on `ProcessContext`**, threaded from
   the loaders. `route-match` and `static-paths` already hold
   `pageConfig.base_url`, so the value exists at the call sites — this is
   plumbing, not discovery.
2. **A path map built during the content scan**, keyed by absolute file path:
   ```
   absolute file path  →  { url, contentType, section }
   ```
   Built by the loader that already computes the slug, so there is one producer
   and no mirrored rule to drift.
3. **A lookup miss is reportable** — it carries the source file and, where
   available, the line, so the failure names the file to fix.

# Done when

- [ ] `ProcessContext` carries `baseUrl` and the file's url-path, populated for
      **docs, blog and issues** alike
- [ ] The map exists, is built once per scan, and participates in the existing
      mtime cache rather than being rebuilt per file
- [ ] **Control the map against the router, both directions.** For every entry,
      the URL is one the build actually emits; for every route the build emits,
      there is an entry. A map that agrees with a re-implementation of the slug
      rules proves nothing — it has to agree with the thing that serves pages
- [ ] Deliberately break one entry and confirm the miss is reported with the
      source file named; restore it and confirm zero
- [ ] `tsc` clean, `./start build` clean, page count unchanged

# References

- The design and why a map rather than arithmetic:
  [the path map](../../notes/30_the-path-map.md)
- The slug rule this must agree with: `DocsParser.generateSlug`, and its mirror
  in `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
  (`isIndexPage`, which exists only to track that one `.replace(/\/index$/, '')`)
- The consumer that cannot start without this:
  [the shared resolver](./020_the-shared-resolver.md)
- An assumption the map must not inherit:
  [base_url and folder name are not tied](./040_base-url-and-folder-name-are-not-tied.md)

# Details

## Why the map is built by the loader, not the parser

The loader already walks every file and already computes each one's slug in order
to register routes. Building the map there costs one insert per file and cannot
disagree with routing, because it *is* routing's own output. Building it in the
parser would mean a second implementation of the slug rules, which is the drift
this project has already paid for twice — `isIndexPage` exists today purely to
mirror a single line of `generateSlug`.

## The one thing to get right early

**`addLevel` in `internal-links.ts` is deliberately computed and unused** — it
encodes which pages collapse onto their own directory (`index.md`). The resolver
needs exactly that fact. Take it from the map rather than recomputing it, and
delete the mirror when [`020`](./020_the-shared-resolver.md) lands.
