# Vendored: draw.io GraphViewer

`viewer-static.min.js` is draw.io's own read-only renderer, taken verbatim from
the upstream release. It is vendored rather than installed because **draw.io
publishes no npm package** — the viewer ships only inside the webapp.

| | |
|---|---|
| Upstream | https://github.com/jgraph/drawio |
| Path | `src/main/webapp/js/viewer-static.min.js` |
| Version | **v31.1.5** |
| SHA-256 | `13f6a01d141f8edd23213242f2472c7a3eb7637c76144bf7917c76858477c251` |
| License | Apache-2.0 — full text in [`./LICENSE`](./LICENSE) |
| Size | 3.0 MiB raw · 0.81 MiB gzipped |

## How it is loaded

`src/scripts/drawio.ts` imports it with Vite's `?url` suffix, so it is emitted
as a content-hashed asset and injected as a `<script>` tag **only on pages that
contain a `.drawio` diagram**. It is never part of the main bundle.

## Why the globals are overridden before it loads

The first statement in the file points six resource paths at
`viewer.diagrams.net`:

```
PROXY_URL · STYLE_PATH · SHAPES_PATH · STENCIL_PATH · DRAW_MATH_URL · GRAPH_IMAGE_PATH
```

Each uses the `window.X = window.X || "<remote>"` form, so setting them first
wins. `src/scripts/drawio.ts` sets all six to local paths and blanks
`DRAWIO_LOG_URL`, because **a built site must not make third-party requests
when a reader opens a page**.

## What that costs, and the escape hatch

draw.io's *code-defined* shapes — the default palette, flowchart, UML, ER,
arrows, containers — are compiled into this bundle and render fully offline.
Its *stencil* libraries (the AWS / Azure / GCP / Cisco / Kubernetes icon sets)
are ~21 MB of XML that is **not** vendored; a diagram using one renders the
fallback shape instead of the icon.

To get them, drop the upstream `stencils/` tree into
`default-docs/assets/drawio/stencils/` — `STENCIL_PATH` already points there.

## Upgrading

1. Download `viewer-static.min.js` from the new tag.
2. Replace the file, and update the version + SHA-256 in the table above.
3. Re-check the globals block at the head of the file — if upstream adds a
   seventh remote path, `src/scripts/drawio.ts` must override it too.
