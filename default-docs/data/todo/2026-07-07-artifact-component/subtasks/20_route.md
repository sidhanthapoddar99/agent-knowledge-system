---
title: "Reserved /artifacts/<path> route — full-page artifact view"
status: done
---

## Goal

Serve every artifact `.html` file full-page at a reserved, bookmarkable,
shareable URL: `/artifacts/<path-to-artifact>`. This route is the **primitive**
the whole feature is built on, not an alternative view — the embed's iframe in
[`10_component.md`](./10_component.md) uses this URL as its `src`, and the
embed's "open full page" button links here. The settled decision that the
dedicated URL (not an in-place expand) is the primary full-view mechanism is
recorded in the settled-decisions note under `../notes/`; the route/serving
trade-offs are worked in the component + route architecture brainstorm under
`../brainstorm/`.

Because this route claims the `/artifacts` prefix, no docs section may use
`artifacts` as its base URL — that guard is [`30_reserved-url-guard.md`](./30_reserved-url-guard.md),
which depends on this route existing.

## The serving precedent (verified)

The framework already serves colocated files from content dirs via
`astro-doc-code/src/pages/content-assets/[...path].ts`. Its `isServable`
(`:24-29`) blocks only dotfiles, `.md`/`.mdx`, and `settings.json(c)` — **`.html`
is already servable today**. `getStaticPaths` enumerates every servable file at
build (`:52-65`); `GET` does symlink-proof containment (`:74-87`) and ETag/304
with dev `no-cache` / prod `public, max-age=31536000` (no `immutable` directive)
(`:93-115`). Static route segments like
`content-assets/` beat the `[...slug].astro` catch-all — the header comment at
`content-assets/[...path].ts:12-15` documents this, plus the caveat that the
segment name can't be `_`-prefixed (Astro excludes `_`-dirs from routing).

**The one real gap:** `astro-doc-code/src/pages/lib/mime.ts` has **no `.html`
entry** (verified — the map ends at `.eot`), so the shared serving routes would
send an artifact as `application/octet-stream`, which browsers download and
iframes refuse to render. Adding `'.html': 'text/html'` to the shared `mimeTypes`
map would make **every** colocated `.html` anywhere in content (docs, blog, the
issue tracker) executable on the site origin — a broad trust decision. The recommended stance
(deliberated in
[`../brainstorm/01_discuss_component-and-route-architecture.md`](../brainstorm/01_discuss_component-and-route-architecture.md)
Thread D) is to **scope `text/html` to this
dedicated `/artifacts/` route** rather than widening the shared map, so the
origin-trust decision is explicit and contained.

## Tasks

- [x] **Create `src/pages/artifacts/[...path].ts`** by cloning
      `src/pages/content-assets/[...path].ts`. Keep the symlink-proof containment
      check, the ETag/304 handling, and the dev-`no-cache` /
      prod-`public, max-age=31536000` (no `immutable` directive) caching. Narrow
      `getStaticPaths` to enumerate only `.html` files across the
      content-category dirs (`getPathsByCategory('content')`,
      `src/loaders/paths.ts`), and set the response `Content-Type: text/html`
      locally in this file (do **not** add `.html` to the shared `mime.ts` map,
      per the scoping decision above). Done when the file compiles and lists the
      artifact `.html` paths at build.
      <!-- DONE. Cloned; `isServable` replaced by `isArtifact` (only `.html`, no
      dotfiles); `getAllArtifactFiles`/`getStaticPaths` enumerate `.html` across
      `getPathsByCategory('content')`. `mime.ts` NOT imported/edited — response
      hardcodes `Content-Type: text/html; charset=utf-8`. Symlink-proof
      containment, ETag/304, dev-`no-cache` / prod-`public, max-age=31536000` all
      preserved verbatim. Build lists the fixture at
      dist/artifacts/todo/2026-07-07-artifact-component/notes/03_planning-overview.html
      (byte-identical to source). No LSP diagnostics. -->



- [x] **Confirm route priority over the catch-all.** The static `artifacts/`
      segment must win against `[...slug].astro`. Verify by loading
      `/artifacts/<section>/<name>` in dev and confirming raw HTML is served, not
      a docs-page 404 or a rendered layout. Done when the raw artifact document
      renders full-viewport with its own `<head>`.
      <!-- DONE. curl of the fixture URL returns the raw document beginning
      `<!DOCTYPE html>` with the artifact's OWN `<title>Artifacts as first-class
      content — planning overview</title>` and 0 `data-astro-cid` markers.
      Control: /dev-docs (followed) has 4 `<nav>` + 255 sidebar refs (full site
      chrome); the artifact has none of the site layout. Headless screenshot
      shows it rendering full-viewport with its own styling + theme toggle. -->



- [x] **Reserve the slug in server-mode routing.** Add `'artifacts'` to
      `isInternalSlug` in `src/pages/lib/route-match.ts:49-51` (which today
      reserves only `api/`, `_*`, and `editor`) so `[...slug].astro` never tries
      to render an `/artifacts/...` path in dev/SSR. Note `assets` and
      `content-assets` are *not* listed there today — they win by route priority
      but a page named for them would shadow-fight; flag that latent hole for the
      guard subtask (`30`) to close alongside `artifacts`. Done when a request to
      `/artifacts/x` never enters the page-type matcher.
      <!-- DONE. `isInternalSlug` now also returns true for `slug === 'artifacts'
      || slug.startsWith('artifacts/')` (mirroring the api/ pattern). The latent
      hole for assets/content-assets is closed by 30's RESERVED_BASE_URLS guard
      (they already win by route priority; the config-load throw now also blocks
      a page from claiming those base URLs). -->



- [x] **No alias change needed.** A serving route is not a layout or `paths:`
      concept, so `src/loaders/alias.ts` (reserved aliases `@docs`/`@blog`/…) and
      `RESERVED_KEYS` in `src/loaders/paths.ts` need **no** edit — record this
      explicitly so a future reader doesn't add a phantom `@artifacts` alias.
      (Only if `artifacts` ever became a settable `paths:` key would
      `RESERVED_KEYS` matter.) Done when a code comment in the new route file
      states why no alias is registered.
      <!-- DONE. `alias.ts` and `paths.ts` untouched. The new route file's header
      comment has a dedicated "No alias is registered for this route" paragraph
      explaining exactly this. -->



- [x] **Close the cache-busting handshake with the embed.** The iframe `src`
      emitted in `10` carries `?v=<mtimeMs>`; confirm this route ignores the
      query for content but that the prod year-long `max-age` plus the changing
      `?v=` gives correct invalidation (same benign behavior as excalidraw in
      static builds — the query is ignored by static hosts but the ETag still
      revalidates in dev). Done when editing an artifact and reloading the
      embedding page shows the new version without a hard refresh in dev.
      <!-- DONE. `?v=123456789` on the fixture URL returns the same body + same
      ETag as the bare URL — the query is ignored for content lookup. In dev the
      route sends `cache-control: no-cache` + ETag, and a conditional GET with
      `If-None-Match: <etag>` returns 304, so a plain reload revalidates. The
      ETag is `"<size>-<mtimeMs>"`, so an artifact edit changes the ETag (and the
      embed's `?v=<mtimeMs>`) → new content served. The embed emission itself is
      10_component's concern; this route honours the contract. -->



- [x] **Verification.** With an artifact present (`NN_demo.html` from `10`), run
      `./start dev` and load `/artifacts/<section>/demo` directly: the artifact
      fills the browser viewport, has its own URL, and is bookmarkable. Then
      `bun run build` and confirm `dist/artifacts/<section>/demo.html` (or the
      equivalent output path) exists and opens standalone. Finally load an
      embedding docs page and confirm the iframe (whose `src` is this route)
      renders — proving the route is the shared foundation. Check the `Network`
      panel shows `Content-Type: text/html` for the artifact request.
      <!-- DONE (route half). Used the pre-existing test fixture
      notes/03_planning-overview.html (the embedding docs page comes with
      10_component). Dev: GET /artifacts/todo/2026-07-07-artifact-component/notes/
      03_planning-overview.html → 200, `content-type: text/html; charset=utf-8`,
      full body (29004 bytes, identical to source), renders full-viewport
      (screenshot). Build: dist/artifacts/todo/.../03_planning-overview.html
      exists, byte-identical to source. Also verified: 304 on conditional GET,
      404 for a nonexistent `.html`, 404 for a non-`.html` path under /artifacts.
      The iframe-embed render is 10_component's deliverable; the route it targets
      is confirmed serving `text/html`. -->

