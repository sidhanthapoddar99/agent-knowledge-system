---
title: "Idea — backend-side cache solves cross-project cache isolation"
---

# Backend-side cache → cross-project isolation for free

This thread absorbs the cancelled issue `2026-05-07-cache-isolation-cross-project`
(its browser-side design is summarized below; full text in git history). Folded in on
2026-07-02 after sidhantha proposed that the Go runtime makes the whole problem
disappear.

## The original problem

`localStorage` is keyed by **origin** (`http://localhost:<port>`), while project
identity lives on disk. Everyone reuses a small port pool across projects, so stopping
Project A and starting Project B on the same port hands B all of A's browser state —
editor state, filter chips (`FILTER_CACHE_KEY`), sidebar collapse, theme prefs, layout
selector. B silently reads and overwrites A's cache.

## The original (browser-side) fix design — now superseded

A workaround that teaches browser storage about project identity:

- **Site-identity hex** (`id:` in `site.yaml`, 64-bit, auto-generated on first load).
- **Inline the ID at SSR time** in `<head>` before any cache reads.
- **`cache.ts` wrapper** — every consumer keys through `<SITE_ID>:<key>`, never raw
  `localStorage`.
- **Archive-on-mismatch bootstrap** — namespace-swap on project switch, `archive:` slots
  with a 60-day TTL, restore on return, sweep expired.
- Open questions it carried: `id` placement (sibling vs `cache:` block),
  `sessionStorage`, concurrent same-port tabs (acknowledged out-of-scope), dev-server
  in-memory cache on id change.

All of it is machinery compensating for state living in the wrong place.

## The proposal (sidhantha, 2026-07-02)

With the Go + Vite unified application, move UI state **server-side**: the Go binary
maintains its own cache folder, keyed/linked to the **project dir it's invoked from**
(e.g. `~/.cache/doc-engine/<project-path-hash>/` or `<project>/.cache/`). State then
travels with the *project*, not the *origin*:

- Switch projects on the same port → different cache folder → no collision, by
  construction. No site-id, no namespacing wrapper, no archive/TTL dance.
- "Restore on return" comes free — the folder is still there.

## Assessment

Solves the issue at the root (removes the cause rather than patching around it). Design
points to settle when the migration's cache surface is drawn:

- **Write path** — UI prefs become small debounced API writes instead of synchronous
  `localStorage`. Fine for single-user local dev; needs a tiny state endpoint in the Go
  server.
- **Deployed mode keeps browser storage** — deployed origins are unique, so the
  collision never existed there; server-persisted UI state on a shared deployment would
  wrongly share one user's filters with everyone. Dev/local → per-project-dir
  server-side cache; deployed → client-side as today.
- **Key by project path** — hash of the resolved project dir (follow the same identity
  the binary uses for `doc-engine.toml`); moving a project dir starts a fresh cache
  (acceptable; old one ages out).
- **Concurrent tabs** — moot; two projects can't share one port simultaneously.

Related: `../../2026-06-10-sidebar-cache-v2/issue.md` (per-scope cache blobs — its
"namespacing wraps these keys" note referred to the superseded browser-side wrapper;
under this proposal those blobs simply live server-side in dev).
