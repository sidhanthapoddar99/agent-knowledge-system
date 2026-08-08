---
title: "The route set — nothing checks it now that ./start does not build"
status: open
---

# What this group is

**The set of addresses the site publishes, and the fact that nothing looks at it
on a normal day.**

`./start` used to run a full production build before handing over to dev. That
build was the only routine thing that enumerated the whole address space.
Removing it was correct on measurement — **~6.4 s and ~99 MB written per
invocation**, on a command typed about twenty times a day, for an answer that only
matters at publish time. Dev never reads `dist/`, verified by deleting it and
serving every route.

But it also retired the only day-to-day check on the route set, and nobody decided
that part.

# Why it is here and not in its own issue

**This issue already owns the URL.** Its whole premise is that no single place
produces a final address, and its fix is a build-time path map feeding one shared
resolver that emits root-absolute hrefs. The question *"which addresses does this
site actually publish, and do dev and the build agree on them?"* is the same
question asked from the outside.

Concretely, the two harnesses this group would extend already belong to this issue:

- `scripts/checks/check-links.mjs` — do the links the engine RENDERS resolve?
- `scripts/checks/check-route-parity.mjs` — do dev and the build resolve the same
  URL the same way?

Splitting the route set into its own issue would have meant a second issue editing
the same two files for the same reason.

# Why dev cannot cover it

The two modes ask structurally different questions. This is not a gap in effort:

| | How it produces a page | What it can see |
|---|---|---|
| **dev** (`output: 'server'`) | resolves one incoming request through `matchServerRoute()` | only URLs someone asked for |
| **build** (`output: 'static'`) | enumerates the whole set through `getStaticPaths()` | every address, at once |

A duplicate URL fails the whole build and is invisible in dev. An address the
build emits that dev refuses is invisible in **both**, unless something compares
them.

# The instance already shipping

`src/pages/lib/` holds five plain TypeScript modules — helpers, not pages:

```
astro-doc-code/src/pages/lib/
├── cache-key.ts
├── layout-registry.ts
├── mime.ts
├── route-match.ts
└── static-paths.ts
```

They sit under `src/pages/`, so Astro's file-based routing treats them as routes.
The build emits five files under `dist/lib/`, 9 KB each, 64 KB total, **every one
of them serving the 404 page**:

```
$ grep -o "<title>[^<]*</title>" astro-doc-code/dist/lib/cache-key
<title>Page not found | Agent KS</title>

$ curl -o /dev/null -w '%{http_code}' http://localhost:3088/lib/cache-key
404
```

So the built site publishes five addresses that dev refuses. Three reasons nobody
noticed:

- the build does not warn — a route that renders the 404 page is a successful render;
- dev never enumerates, so it has no opinion;
- **`check-route-parity.mjs` is blind to it by construction.** It enumerates from
  `buildStaticPaths()` — the *framework's* idea of the route set — and these routes
  never appear there. They come from Astro's file-based routing, one layer below.
  Anything Astro adds underneath is outside both sides of the comparison.

That last point is the finding worth keeping. The harness compares the framework
against dev, not the built site against dev.

# The subtasks

| | |
|---|---|
| [300/010 — stop emitting `src/pages/lib/*.ts` as routes](./010_stop-emitting-src-pages-lib-as-routes.md) | the leak itself. Mechanical. |
| [300/020 — decide what guards the route set](./020_decide-what-guards-the-route-set.md) | the absent check, and where it runs. The real design question. |

They are separate on purpose. Fixing the leak without deciding the guard leaves
the next one to be found the same way this one was — by accident, months later.

# Provenance

Found while measuring the reworked `start` CLI, in the same session that removed
the preflight build. The `cache-key.ts` in that list was added by the incremental
build work, so this is partly self-inflicted — and it went unnoticed for exactly
the reason the group describes.
