---
title: Artifacts
description: Client-side rendering of first-class .html artifact pages — the same-origin iframe, the theme handshake, and the embed affordances.
sidebar_position: 12
---

# Artifacts Script

**File:** `src/scripts/artifacts.ts`

Turns each server-emitted `.artifact-html` placeholder into a same-origin
`<iframe>` pointing at the reserved `/artifacts/<path>` route, propagates the
site theme into it, and hangs the embed affordances off it. It is the
client-side half of the artifact content type; the loader that emits the
placeholder is [`artifact-pages.ts`](/dev-docs/architecture/data-loading#artifact-pages-the-same-seam-a-second-time)
and the route it points at is the
[reserved artifact route](/dev-docs/architecture/routing#the-reserved-artifact-route).

## How It Works

The loader emits a by-reference container (never a raw `<iframe>` — a runtime
iframe is where load/error handling, the theme handshake, and the affordance bar
naturally live):

```
Build time:  10_dashboard.html  →  <div class="artifact artifact-html"
                                        data-src="/artifacts/<path>?v=<mtime>"
                                        data-title="Dashboard"></div>
Browser:     <div class="artifact-html">  →  <iframe class="artifact-frame" src="…"> + <div class="artifact-tools">
```

`renderArtifact()` (`artifacts.ts:49`) builds the iframe from `data-src`, appends
the affordance bar, and marks the container `.artifact-rendered`. `initArtifacts()`
selects every `.artifact-html:not(.artifact-rendered):not(.artifact-error)`, so
it is idempotent and safe to re-run.

## The theme handshake

The site's light/dark state is a `data-theme` attribute on `<html>`. Because the
`/artifacts` route is **same-origin** (a deliberate first-party-content trust
decision), the parent can reach into `iframe.contentDocument` and set the same
attribute on the artifact's own `<html>`:

- `currentTheme()` is **attribute-only**: it reads the root's `data-theme` and
  returns `dark` only when that says `dark`; an absent attribute means `light`. It
  deliberately does **not** fall back to `prefers-color-scheme`. The site's CSS is
  attribute-driven (no site CSS reads the media query), so an absent attribute means
  the chrome is rendering light *even on a dark-OS machine* — an OS fallback here
  would desync the embed from the chrome.
- On iframe `load`, `applyTheme(iframe)` writes that value into the artifact document
  and registers the iframe in a live `Set`.
- A `MutationObserver` on `document.documentElement`'s `data-theme` re-syncs
  **every** registered iframe when the site theme toggles — covering the default
  navbar, the minimal navbar, and the dev toolbar uniformly, since they all just flip
  the root attribute (no custom event).

An artifact that styles off `data-theme` flips instantly with no reload; one that
ignores it is left untouched.

## Site-theme injection (route-side)

The handshake above only *propagates the attribute*. What makes a `site`-mode
artifact actually inherit the theme is a **route-side rewrite**, not this client
script. When an artifact's sidecar declares `artifact.theme: "site"`, the
`/artifacts` route (`pages/artifacts/[...path].ts`) injects the resolved theme CSS —
`getThemeCSS(getTheme())`, the same merged stylesheet `BaseLayout` gives the chrome —
plus an attribute-only dark-mode init script, at the start of the served document's
`<head>`. So the theme arrives *with the document*, for the embed **and** the
full-page view (this script's propagation would leave the full-page view unthemed on
its own), with no flash of unthemed content. `theme: "self"` (the default) is served
byte-for-byte. The mechanism, the head-start insertion point, and the content-hash
ETag that busts on a theme change are documented in
[the reserved artifact route](/dev-docs/architecture/routing#the-reserved-artifact-route);
authoring the two modes lives in the `agent-ks-artifacts` skill, and
`agent-ks theme tokens --json` prints the live variable→value map the route injects
(it resolves the active theme the same way the engine does — `site.yaml` name →
`theme_paths` scan → `extends` inheritance → CSS merge).

A maintenance coupling follows. That skill enumerates the theme's `required_variables`
**inline in its own text**, so `site`-mode authoring has the token names even if the
plugin is ever distributed standalone with no theme CSS on disk. A change to
`theme.yaml → required_variables` (add / rename / remove) must therefore update the
skill's inline variable section in the same change — recorded in the repo `CLAUDE.md`
theming section.

> **Why not the diagram invert filter?** Diagrams get dark mode via a blanket
> `filter: invert(1) hue-rotate(180deg)` on the rendered SVG (see
> [Diagrams](/dev-docs/scripts/diagrams#dark-mode)). That is correct for
> monochrome SVG but would **destroy** an artifact's photographs, gradients, and
> brand colors. Artifacts are never inverted — the attribute handshake is the
> only theme mechanism, and honoring it is the artifact's own job.

## Embed affordances

The affordance bar (created at runtime, so its styles live in the global
`markdown.css`, not a scoped Astro block) carries two controls:

| Control | Element | Behavior |
|---|---|---|
| **Open full page ↗** (primary) | `<a class="artifact-open">` | Links to the route with the `?v=` stripped, `target="_blank"`. This is the durable, shareable primitive — the embed is just that same page inside the docs frame. |
| **Expand** (secondary) | `<button class="artifact-expand">` | `toggleExpand()` (`:104`) adds `.artifact-expanded` (a fixed, full-viewport overlay) and locks body scroll — an in-place grow with **no navigation**, so the reader keeps their scroll position. `Escape` or the button closes it (`:111`). |

Expand deliberately does **not** reuse the diagram lightbox: `bindDiagrams`
targets `.diagram-rendered` elements with an SVG child and a pan/zoom engine that
assumes SVG/IMG geometry — an iframe fits neither. The overlay is a far cheaper
fixed-position CSS state instead.

## CSS

Artifact chrome is in `src/styles/markdown.css` (global, because the iframe and
bar are runtime-created and never carry Astro's scoped `data-cid`):

```css
.markdown-content .artifact {
  position: relative;
  width: 100%;
  /* Viewport-fill default — a sidecar embed_height overrides via inline style */
  height: calc(100vh - var(--navbar-height) - 2 * var(--spacing-xl));
  min-height: 420px;
  /* … */
}
.markdown-content .artifact-frame { width: 100%; height: 100%; border: 0; }
.markdown-content .artifact.artifact-expanded { position: fixed; inset: 0; z-index: 9998; }
```

The `.artifact-error` rule uses `height: auto` and is ordered *after* the
fixed-fill rule so it wins the equal-specificity tie — a missing `data-src`, a
failed load, or a slug-collision box shrink-wraps instead of leaving a tall empty
frame.

## Loading and events

Registered in `BaseLayout.astro` beside the other content scripts:

```astro
<script src="../scripts/diagrams.ts"></script>
<script src="../scripts/artifacts.ts"></script>
<script src="../scripts/lightbox.ts"></script>
```

| Event | Direction | Purpose |
|---|---|---|
| `diagrams:render` | Listens | The live editor re-emits content on this signal; the artifact script re-scans on the same event so a freshly-edited preview re-renders its embeds. |

## Reuse in the issue tracker

This exact script and CSS also drive artifacts **inside the issue tracker** —
nothing here is docs-specific. The issues loader
([`src/loaders/issues.ts`](/dev-docs/architecture/data-loading#artifact-pages-the-same-seam-a-second-time))
treats a `.html` file in an issue's `notes/` or `brainstorm/` folder as a
supporting doc and emits the identical `.artifact-html` container by calling the
shared `artifactContainerHtml()` from `artifact-pages.ts` — same `<name>.meta.json`
sidecar for the title, same `?v=<mtime>` cache-buster. Because the container
renders inside `.markdown-content` and `BaseLayout` loads this script on every
page, the iframe, the theme handshake, and the affordance bar all work with **no
issues-layout JavaScript** — the tracker only had to pick the file up in its loader
and mark the sub-doc row with a type badge. Scope is `notes/` and `brainstorm/`
only (never an issue's `assets/`).

## Extension points

- **postMessage auto-height** — an artifact could advertise a cooperating script
  that posts its `scrollHeight`; the parent would resize the frame to fit. It is
  mutually exclusive with the viewport-fill default and is an opt-in enhancement,
  not the baseline.
- **`?theme=` on the full-page URL** — a minor nice-to-have for sharing an
  explicitly-dark link; deferred, since the full-page view already falls back to
  `prefers-color-scheme`.
- **A new first-class file kind** — anything that renders as an `NN_`-prefixed
  page from a non-markdown file should clone this pattern: a `load*Pages` scanner
  that calls the shared `resolveSlugCollisions()`, a container `<div>` body, and
  (if interactive) a peer client script. Artifacts and diagrams are the two
  worked examples.

## Design rationale

Two choices define the feature; both are recorded as settled decisions in the
artifact-component issue (`data/todo/2026-07-07-artifact-component/`, see
`notes/02_settled-decisions.md` and `brainstorm/01_…`).

- **Additive, not a new content type.** An artifact mirrors the first-class
  **diagram** pipeline: a loader scan plus a client script, reusing the existing
  `docs` content type, the `Body.astro` render path, the sidebar, the cache, and
  the draft filter. No new `page.type`, no new layout, no router branch. The
  cheapest correct design is to slot into a seam that already solved
  "a non-markdown file becomes a sidebar page."
- **The dedicated URL is the primitive.** `/artifacts/<path>` is not a
  convenience wrapper around the embed — it is the foundation the embed is built
  on. The iframe needs a `src` regardless, and that `src` *is* the route. A real
  URL is durable, bookmarkable, and shareable, and it sidesteps the Fullscreen
  API's weaknesses (intrusive chrome, awkward exit, not linkable). So the
  "open full page" link is both trivial (an `<a href>`) and complete, and the
  in-place expand is explicitly secondary — convenience only, no new capability.
