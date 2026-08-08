---
title: Nothing checks the route set on a normal day, now that ./start does not build
---

# Nothing checks the route set on a normal day

## What changed

`./start` used to mean *update check → install → full production build → dev*. That
preflight build was removed, on measurement: **~6.4 s and ~99 MB written per
invocation**, on a command typed roughly twenty times a day, for an answer that only
matters at publish time. Dev never reads `dist/` — verified by deleting it and serving
every route. The build moved to `./start doctor`.

That decision stands. What it also did, without anyone deciding it, is retire the only
routine check on **the set of addresses the site publishes**.

## Why dev cannot cover it

The two modes ask different questions, and this is structural rather than a gap in
effort:

| | How it produces a page | What it can see |
|---|---|---|
| **dev** (`output: 'server'`) | resolves one incoming request through `matchServerRoute()` | only URLs someone asked for |
| **build** (`output: 'static'`) | enumerates the whole set through `getStaticPaths()` | every address, at once |

A duplicate URL fails the whole build and is invisible in dev. An address the build
emits that dev refuses is invisible in *both*, unless something compares them. Dev
cannot be fixed into covering this — it never holds the set.

## The instance already shipping

`src/pages/lib/` holds five plain TypeScript modules — helpers, not pages:

```
astro-doc-code/src/pages/lib/
├── cache-key.ts
├── layout-registry.ts
├── mime.ts
├── route-match.ts
└── static-paths.ts
```

They sit under `src/pages/`, so Astro's file-based routing treats them as routes. The
build emits five files under `dist/lib/` — `cache-key`, `layout-registry`, `mime`,
`route-match`, `static-paths` — 9 KB each, 64 KB total, **every one of them serving the
404 page**:

```
$ grep -o "<title>[^<]*</title>" astro-doc-code/dist/lib/cache-key
<title>Page not found | Agent KS</title>

$ curl -o /dev/null -w '%{http_code}' http://localhost:3088/lib/cache-key
404
```

So the built site publishes five addresses that dev refuses. Nobody noticed, because:

- the build does not warn — a route that renders the 404 page is a successful render;
- dev never enumerates, so it has no opinion;
- **`check-route-parity.mjs` is blind to it by construction** — it enumerates from
  `buildStaticPaths()`, the framework's own path list, and these routes never appear
  there. They come from Astro's file-based routing, one layer below.

That last point is the interesting one. The parity harness compares *the framework's
idea of the route set* against dev. Anything Astro adds underneath is outside both
sides of the comparison.

## Scope

Two separate things, and they should not be conflated:

1. **The leak itself** — `src/pages/lib/*.ts` should not be routes. Mechanical.
2. **The absent check** — what runs, and when, so that the next one is caught.
   `doctor` is the obvious host; whether the parity harness should compare against
   `dist/` rather than `buildStaticPaths()` is the real design question.

## Provenance

Found while measuring the reworked `start` CLI, in the same session that removed the
preflight build. The `cache-key.ts` module in that list was added by the incremental
build work — so this is partly self-inflicted, and it went unnoticed for the same
reason everything else here did.
