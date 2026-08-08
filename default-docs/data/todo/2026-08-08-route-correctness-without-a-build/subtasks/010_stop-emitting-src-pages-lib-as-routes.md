---
title: Stop emitting src/pages/lib/*.ts as routes
status: open
---

# Stop emitting `src/pages/lib/*.ts` as routes

## Overview

Five helper modules live under `src/pages/lib/`. Astro's file-based routing does not
distinguish a helper from a page — anything under `src/pages/` is an address — so the
build emits five URLs that serve the 404 page and dev refuses.

They are helpers by every other measure: nothing imports them as a component, they
export functions, and `check-route-parity.mjs` imports `static-paths.ts` directly as a
module. Only their location says otherwise.

## References

- [the issue](../issue.md) — why nothing caught this
- `astro-doc-code/src/pages/lib/` — the five modules
- `astro-doc-code/src/pages/[...slug].astro` — the real route, and their only consumer
- `scripts/checks/check-route-parity.mjs` — imports `static-paths.ts` as a module, by path

## Todo list

- [ ] Record the current emitted set first: `ls astro-doc-code/dist/lib/` after a build,
      so "gone" is checkable rather than assumed.
- [ ] Move the five modules to `astro-doc-code/src/lib/` (peer of `pages/`, not inside
      it). `mime.ts` and `layout-registry.ts` are pure helpers; `route-match.ts` and
      `static-paths.ts` are the routing pair; `cache-key.ts` belongs with them.
- [ ] Update importers. Known: `src/pages/[...slug].astro`, the asset routes under
      `src/pages/assets/`, and `scripts/checks/check-route-parity.mjs` (which imports by
      absolute path — `path.join(FRAMEWORK, 'src/pages/lib/static-paths.ts')`, so a
      TypeScript rename will NOT catch it).
- [ ] Consider a `@lib` alias in `tsconfig.json` if the relative paths get deep, matching
      the `@modules` precedent.
- [ ] Rebuild. `dist/lib/` must not exist.
- [ ] Re-run `scripts/checks/check-route-parity.mjs` — it must still pass, and it must
      still be able to import `static-paths.ts`.

## Done when

- `astro-doc-code/dist/lib/` does not exist after a clean `./start build`.
- `./start doctor` passes.
- `check-route-parity.mjs` runs and reports the same divergence count as before the move
  (the baseline recorded in step 1 of the todo list).
- No file under `src/pages/` is anything other than a route.

## Details

The five files and what they are:

| File | What it is |
|---|---|
| `route-match.ts` | resolves a REQUEST → a page (dev / SSR path) |
| `static-paths.ts` | enumerates the SET of pages (build path) |
| `cache-key.ts` | per-entry cache keys for `experimental.incrementalBuild` |
| `layout-registry.ts` | layout alias → component resolution |
| `mime.ts` | content-type lookup for the asset routes |

None of them render. The move is mechanical; the only trap is the by-path import in the
check script, which no rename tool will follow.
