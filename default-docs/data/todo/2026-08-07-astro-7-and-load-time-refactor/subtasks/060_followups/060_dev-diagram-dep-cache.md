---
title: "Diagrams stop rendering in dev when the Vite dep cache goes stale"
status: review
---

# Overview

**Mermaid, graphviz and excalidraw silently stop rendering in `./start dev`.** The
container stays on the page showing its raw source, no error surfaces to the
reader, and the same pages are perfect in a production build.

Found by Sid during
[060/040 the eyeball round](./040_eyeball-the-dev-surfaces.md), reported as "everything
works except diagrams", with the exactly-right question attached: *is this prod or
dev?* It is dev, only.

Recovery is one command — `./start clean dev` — and the value of this subtask is
almost entirely that the command is now written down next to the symptom, because
nothing about the symptom suggests it.

# References

- [060/040 the eyeball round](./040_eyeball-the-dev-surfaces.md) — where it was found
- [060/020 the ./start wrapper](./020_start-wrapper-against-astro-7.md) — the leading
  suspect for the trigger, and the thing that would prevent a recurrence
- [060/030 the dropped memory test](./030_dev-server-memory-controlled-test.md) —
  where the orphaned dev server was found
- `astro-doc-code/src/scripts/diagrams.ts` — the three dynamic imports
- `start` line 146 — what `clean` wipes

# Todo list

- [x] **Establish which environment** — dev only. Prod build verified good.
- [x] **Get the actual error** — a 504 on Vite's pre-bundled dep URLs.
- [x] **Find the recovery** — clear `node_modules/.vite`.
- [x] **Test whether a plain restart is enough** — it is not the trigger and not
      the cure; the cache has to go.
- [x] **Try `optimizeDeps.include` as a permanent fix** — tested, **rejected**.
      The control showed it changes nothing. See below.
- [ ] ➡️ **Prevent the trigger** — belongs to
      [060/020](./020_start-wrapper-against-astro-7.md), not here.

# Outcomes and Next Steps

**Diagnosed, recovery documented, no code change.** The honest state is: the
failure is understood, the cure is one command, and the *trigger* is a strong
hypothesis rather than a reproduction.

## What is actually happening

`src/scripts/diagrams.ts` reaches all three renderers through `import()`. In dev
those resolve to Vite's pre-bundled dep URLs. When the cache goes stale, they
answer **504**, the promise rejects, and `renderMermaid` / `renderGraphviz` /
`renderExcalidraw` never run:

```
[Unhandled rejection] TypeError: Failed to fetch dynamically imported module:
  http://localhost:3088/node_modules/.vite/deps/mermaid.js?v=e781bdb0
```

The container never gains `.diagram-rendered`, so the reader sees raw source. **No
error reaches the page** — the rejection is logged server-side, in a dev log the
author is not reading.

Measured, same three pages, same commit:

| | dev, stale cache | dev, cleared cache | production build |
|---|---|---|---|
| mermaid | `diagram-mermaid`, **0 svg** | `diagram-rendered`, 1 svg | `diagram-rendered`, 1 svg |
| graphviz | 504 on dep | `diagram-rendered`, 1 svg | `diagram-rendered`, 1 svg |
| excalidraw | 504 on dep | `diagram-rendered`, 1 svg | `diagram-rendered`, 1 svg |

**The build is structurally immune.** Rollup follows dynamic imports at build time
and emits real chunks; there is no optimizer and no cache to go stale.

The stale cache's own metadata is the tell — it carried
`browserHash: bb88158d` while the page was asking for `?v=e781bdb0`, and its
`optimized` map contained **none** of the three diagram libraries.

## The fix that was tried and rejected

The obvious remedy is to name the three in `optimizeDeps.include` so they are
pre-bundled at boot rather than discovered on the first diagram page. It was
written, with a confident comment, and then controlled:

```
  with    include: ['mermaid', '@hpcc-js/wasm-graphviz', '@excalidraw/excalidraw']
          → all three pre-bundled at boot
  without include: []
          → all three pre-bundled at boot
```

**Identical.** Vite's scanner already reaches them through `BaseLayout` →
`diagrams.ts`, so late discovery was never the mechanism and the change was a
no-op wearing an explanation. It was reverted rather than shipped: a no-op with a
convincing comment is worse than no change, because the next person reads the
comment instead of measuring.

That control is the reason this subtask ships a diagnosis instead of a patch.

## The trigger — hypothesis, stated as one

**Two dev servers sharing one `node_modules/.vite`.** Vite's optimizer writes that
directory; two processes writing it interleave, and the surviving cache can be one
neither browser session has the hash for. That matches the signature exactly: a
cache present, coherent, and describing a different optimize run.

The circumstantial support is strong. An orphaned dev server from the previous day
was found alive during this same round, and
[stage 40](../../plans/01_implementation/40_the-upgrade.md) records the upgrade
leaking **eleven** of them. Astro 7's per-project lock exists to stop exactly this,
and it arrived in the same version as the auto-backgrounding that manufactures the
orphans.

**Not reproduced on demand.** A plain restart with the cache kept did *not* break
it. Calling this proven would be inventing the part that is missing.

## What to do about it

**Recovery, for anyone who hits it:**

```bash
./start clean dev     # wipes .astro/, dist/, node_modules/.vite/
```

**Prevention** is [060/020](./020_start-wrapper-against-astro-7.md) — stop leaking dev
servers and the shared-cache hypothesis has nothing to act on. That subtask was
already the highest-probability breakage left; this makes it the fix for a
user-visible defect as well.

**Next:** nothing here. If diagrams break in dev again *after* 020 lands, that
falsifies the hypothesis and this becomes a real bug hunt with a much smaller
search space.

# Details

## Why no error reaches the reader

The three render paths are pushed onto a promise array and awaited together. A
rejected dynamic import rejects the whole group before any container is touched,
so the failure mode is silence rather than a broken diagram. **A visible
`.diagram-error` state already exists** — the selectors in `diagrams.ts` skip
`.diagram-error` — but nothing routes an import failure into it.

That is worth fixing on its own merits and is deliberately not folded in here:
this subtask is about a stale cache, and a rendering-error surface is a change to
how every diagram fails, which deserves its own decision.
