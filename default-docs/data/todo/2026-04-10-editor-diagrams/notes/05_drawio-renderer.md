---
title: "draw.io — why the renderer is vendored, and why dark mode is native"
---

Two decisions were taken when `.drawio` was added as the fourth diagram
format. Both are binding, both cost something, and neither is obvious from
reading the code.

# Decision 1 — vendor draw.io's own GraphViewer

**draw.io publishes no npm package.** Its renderer ships only inside the
webapp, as `src/main/webapp/js/viewer-static.min.js`. That is the whole
reason this format looks different from the other three, which are one
`bun add` each.

The file is committed at `astro-doc-code/src/vendor/drawio/` — Apache-2.0,
**3.0 MiB raw / 0.81 MiB gzipped**, with its `LICENSE` and a `README.md`
carrying the upstream tag (v31.1.5), the SHA-256, and the upgrade procedure.

## What was rejected, and why

| Option | Rejected because |
|---|---|
| CDN `<script>` from `viewer.diagrams.net` | The built site stops rendering diagrams offline or air-gapped, and every reader hits a third party. Against the project's static/offline posture |
| Build-time export to SVG via `drawio-headless` | Needs a platform-native Rust binary. A consumer could no longer build with `bun install` alone — that breaks the consumer-mode contract |
| Render the mxGraph XML ourselves on `mxgraph@4.2.2` | Partial fidelity only. draw.io's shape catalogue is far larger than the base library's, so anything beyond plain boxes degrades silently |
| Support only `.drawio.svg` / `.drawio.png` (editable exports) | Zero new code, but not the `.drawio` extension asked for, and it makes the author maintain two files |

**The cost accepted:** a 3 MiB minified blob in git that is bumped by hand
per draw.io release, and an attribution obligation. Sid took this decision
explicitly, with the sizes on the table.

## The stencil gap — deliberate, and it has an escape hatch

draw.io's *code-defined* shapes (default palette, flowchart, UML, ER,
arrows, containers) are compiled into the bundle and render fully offline.
Its *stencil* libraries — the AWS / Azure / GCP / Cisco icon sets — are
**~21 MB of XML** and are **not** vendored. A diagram using one renders the
fallback shape: correct geometry and labels, generic box instead of the icon.

`STENCIL_PATH` already points at `/assets/drawio/stencils`, so a project that
needs them drops the upstream tree into its own asset directory. No code
change, and the 21 MB stays out of every clone that does not want it.

## No page may phone home

The bundle's first statement claims six resource paths, each defaulting to a
`viewer.diagrams.net` URL via `window.X = window.X || "<remote>"`. All six
are overwritten before the script executes, and `DRAWIO_LOG_URL` is blanked.

**Verified, not assumed:** a headless run over both the embed and the
first-class page recorded **zero requests to `diagrams.net` or `draw.io`**,
and zero 4xx/5xx responses.

One of the six is fetched eagerly — `Editor.initMath()` runs at load and
appends `${DRAW_MATH_URL}/startup.js` unconditionally. Pointed anywhere that
does not exist, that is a guaranteed 404 on every page carrying a diagram.
It now points at a framework-owned no-op in
`astro-doc-code/public/vendor/drawio/math/startup.js`. MathJax itself is not
bundled: it is large, and it only affects diagrams saved with `math="1"`,
which queue and never typeset — drawio's own graceful path when
`window.MathJax` is undefined.

# Decision 2 — dark mode is native, not the CSS invert filter

draw.io is the **only** diagram format that opts out of
`filter: invert(1) hue-rotate(180deg)`. Every invert rule in `markdown.css`
now carries `:not(.diagram-drawio)`, and the lightbox clone carries a
`lightbox-svg-themed` marker for the same reason.

## The reason is NOT hue shift — that was checked and is false

The obvious-sounding argument — *"an inverted green stops being green"* —
does not hold. `invert(1) hue-rotate(180deg)` roughly **preserves hue** and
flips lightness. Computed against the filter-effects matrix:

| Colour | after invert | after +hue-rotate(180°) |
|---|---|---|
| `#d5e8d4` light green | `#2a172b` | `#0f220e` — dark green |
| `#ff0000` red | `#00ffff` | `#ff9292` — pink-red |
| `#1e5ac8` blue | `#e1a537` | `#73afff` — light blue |

Hue survives. This is exactly why the filter is a good trade for mermaid,
graphviz and excalidraw, and it should not be argued against on those
grounds.

## The two reasons that do hold

1. **Raster content.** The filter applies to the whole container, embedded
   `<image>` elements included. draw.io diagrams routinely carry icons,
   logos and screenshots, which come out as photographic negatives. The
   other three formats rarely carry any.
2. **The dark version ends up in the SVG, not over it.** A filter is a
   presentation trick — the underlying SVG stays light, so anything leaving
   the page (download, copy-as-image, print) carries the light version, and
   every non-diagram child of the container needs a counter-filter to stay
   readable. That is why `.diagram-caption` and `.diagram-tools` are
   counter-inverted for the other formats and need nothing here.

Saturation and lightness *are* shifted by the filter (see the blue row
above), which matters for brand colours — but that is a secondary point, not
the decision.

## Two flags, and they live at different levels

| Flag | Level | Governs |
|---|---|---|
| `graphConfig['dark-mode']` (`'dark'`/`'light'`/`'auto'`) | per viewer | container chrome and background |
| `Editor.darkMode` (boolean) | global | shape fill/stroke resolution at validation time |

Set only the first and the canvas goes dark while the strokes stay black.
Both are set together in `src/scripts/drawio.ts`.

## A theme toggle rebuilds the viewer rather than re-theming it

GraphViewer supports an in-place flip (`darkMode` + `darkModeChanged()`), but
shape fills were already resolved against `Editor.darkMode` when the graph
was validated — an in-place flip leaves stale colours on anything already
drawn. A full rebuild costs a few milliseconds on an action a reader takes
rarely, and is correct by construction.

**The rebuild must preserve `.diagram-tools`.** `lightbox.ts` binds each
container once and skips anything already in its bound set, so a hover
toolbar destroyed during a rebuild would never come back. `clearContent()`
exists for exactly that.

## A colour-scheme that only holds while attached — the follow-up bug

Reported by Sid after the first pass: **the expanded (lightbox) view showed
the light diagram while the page was dark.**

GraphViewer writes its colours as `light-dark(<light>, <dark>)` in inline
`style` attributes and picks the branch from the **inherited**
`color-scheme`, which it sets on the container it owns — *not* on the
`<svg>`. So the dark rendering only survives while the SVG is still inside
that container. Two consumers detach it, and both were wrong:

| Consumer | Symptom |
|---|---|
| the lightbox | clones the SVG into an overlay with no dark ancestor → expanded view rendered light |
| `diagram-actions.ts` | serialises a clone into a standalone SVG document → downloaded SVG was always light |

Making the invert carve-out correct had removed the accidental compensation:
before draw.io, a detached SVG in dark mode at least got inverted.

**Fixed at the source, not per consumer.** `stampColorScheme()` in
`drawio.ts` writes the scheme into the SVG as a `<style>` *child*, so it
survives `cloneNode` and the `removeAttribute('style')` the exporters do.
The selector is class-scoped (`svg.drawio-scheme-dark{…}`) because a
`<style>` inside inline SVG is **not** scoped to that SVG — a bare
`svg { … }` rule would reach every diagram on the page. A control assertion
covers exactly that.

This also makes honest the claim below that the dark version "is really in
the SVG" — before the fix that was only true while it stayed put.

## PNG export: confirmed broken, and withheld

The risk flagged as untested in the first pass is real.
`toBlob` throws `SecurityError: Tainted canvases may not be exported` for
every draw.io diagram: its labels are `<foreignObject>` (10 of them in the
fixture, `textNodes: 0`), and Chromium taints a canvas that such an SVG is
drawn onto. This failed in both themes and predates the dark-mode work.

`ActionTarget.rasterizable: false` now drops the PNG entries and hides the
split button's primary half, in the viewer toolbar and the inline hover
toolbar alike. SVG and source export are unaffected.

**Rejected: `mxClient.NO_FO = true`**, the `htmlLabels: false` trade Mermaid
takes. Mermaid labels are plain text by nature; draw.io labels legitimately
carry rich HTML, and degrading how a diagram *renders* to enable a secondary
export inverts the priority.

**Recorded follow-up, not built:** re-render the stored XML offscreen with
`NO_FO = true` at export time and serialise that. Display stays faithful,
export rasterizes. ~25 lines plus a second render per export — worth doing
only if someone actually wants PNG here.

# Verification

Headless run over the embed (`15_writing-content/20_examples/01_diagram-showcase.md`)
and the first-class page (`…/20_examples/08_drawio-full-page.drawio`), both
themes:

- container reaches `.diagram-rendered`, SVG carries real geometry (41 and 74
  nodes) — **not** an empty or error box;
- computed `filter` is `none` in both themes, so the invert carve-out holds;
- after a `data-theme` flip: `geDarkMode` applied, `Editor.darkMode` true,
  still exactly one SVG (no duplicate from the rebuild), caption survived;
- zero `diagrams.net` requests, zero 4xx/5xx.

A second run after the lightbox fix, over both diagrams × both themes
(27 assertions): the expanded clone carries the stamped `<style>`, its
`color-scheme` matches the site, and **its resolved fill is identical to the
inline diagram's** — `rgb(18,18,18)` dark, `rgb(255,255,255)` light. Three
control assertions confirm the carve-out is scoped: mermaid is still
CSS-inverted, still has all three hover buttons, and its SVG's
`color-scheme` is still `normal` (the stamped style did not leak).

Screenshots of both diagrams in both themes, inline and expanded, were handed
to Sid for the judgement half — nothing above claims the result *looks*
right.
