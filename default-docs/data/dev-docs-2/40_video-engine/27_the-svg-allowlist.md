---
title: "The SVG allowlist"
description: "Why the video crate rewrites every SVG it inlines through an allowlist, what the allowlist permits, and how ids stay unique."
---

A video inlines SVG from libraries and from a video folder's own `components/`: icons, frames, backgrounds, annotations and illustrations. Inlined SVG becomes part of the page, so it is the one piece of library content that runs on the site's origin. This page explains how the video crate makes that safe. Read it before you change what an SVG component may contain.

## Why an allowlist, not a filter

A denylist removes what it knows to be dangerous, such as `<script>` and `on…` attributes. That misses known attacks:

- a `<style>` block restyles the whole page around the video;
- a `url()` inside a style can load an outside address and track readers;
- an `<animate>` element can rewrite a link's target to `javascript:`;
- a `<use>` element can pull in content from another file.

So the crate does not filter SVG. It parses each file with `quick-xml` and writes back only what the allowlist names. Anything the allowlist does not name is an error, not a silent removal. A component that loses parts silently would draw wrong with no sign, which is worse than an error.

## What the allowlist permits

| Kind | Allowed |
|---|---|
| Elements | `svg`, `g`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `text`, `tspan`, `defs`, `linearGradient`, `radialGradient`, `stop`, `clipPath`, `mask`, `pattern`, `symbol`, `use`, `title`, `desc` |
| Attributes | Geometry, presentation attributes such as `fill` and `stroke`, `transform`, `opacity`, `viewBox`, `preserveAspectRatio`, `vector-effect` and `id` |
| Markers | `data-slot`, `data-label`, `data-drift`, `data-part` and `data-fit`, which the player reads |
| Styles | A `style` attribute that sets allowed properties only |
| References | `url(#id)` and `href="#id"`, to an id in the same file only |

Refused in particular: `style`, `script`, `foreignObject`, `image`, `a`, `animate`, `set`, `animateTransform`, `animateMotion`, `iframe`, every `on…` attribute, and `class`. Each is a `library-bad-component` error that names the element or attribute and its line.

**Colours come through roles.** A component names colours as the player's role variables, such as `var(--vx-accent)`, inside a `style` attribute. Presentation attributes do not accept `var()`, so a role colour written as `fill="var(--vx-accent)"` would not work. A style maps each role to a theme variable, so one component looks right under every style, in light and in dark mode.

## Ids are made safe to repeat

Two inlined SVGs that both define a gradient with the id `g` would break each other, and so would one icon used twice on a slide. So the crate rewrites every id, and every reference to it, with a placeholder: `id="g"` becomes `id="__vx__g"`, and `url(#g)` becomes `url(#__vx__g)`. When the player inserts an SVG, it replaces the placeholder with a prefix unique to that use. The same icon can then appear any number of times.

## The one exception to the sandbox

Library files are otherwise served sandboxed. An artifact loads an element from `/_lib/`, and every HTML or SVG response carries a sandboxing policy that gives it an opaque origin ([the /_lib/ route and the sandbox](../35_libraries/20_lib-route-and-sandbox.md)).

Inlined video SVG is the one sanctioned exception. After the allowlist, an SVG is drawing data, not code: nothing in it can run, load anything, or reach outside itself. `/_lib/` itself does not change, and still serves SVG with the sandbox header.

## One implementation

The allowlist lives once, in the video crate's Rust, with the rest of each category's contract. Three callers share it:

| Caller | Applies it to |
|---|---|
| The compiler | Every SVG component one video uses, from a library or its own `components/` |
| `agentks check video` | The same components, reporting instead of compiling |
| `agentks check libraries` | Every SVG component a library offers |

A library's own CI calls `agentks check libraries`. It never copies the rules into a script of its own, because two copies of a security rule drift apart, and the weaker one is the one that ships.

## Contracts per category

Beyond the allowlist, each SVG category has a small contract that the same code checks:

| Category | Contract |
|---|---|
| Icons | `viewBox="0 0 24 24"`, `currentColor` strokes, no ids |
| Frames | A `viewBox`, and exactly one `<rect data-slot="">` that marks the screen. An optional `<text data-label="">` takes the item's label |
| Backgrounds | `viewBox="0 0 1920 1080"` with `preserveAspectRatio="xMidYMid slice"`, low contrast, no text. An optional `<g data-drift="">` drifts slowly |
| Annotations | `preserveAspectRatio="none"`, strokes with `vector-effect="non-scaling-stroke"`, and a `data-fit` saying where the mark sits around its target |

Every SVG must be well-formed XML: a marker needs a value, `data-slot=""`, never a bare `data-slot`.

## Related

- [The compiler](./25_the-compiler.md): where sanitising sits among the steps.
- [The meaning checks](./20_the-meaning-checks.md): `library-bad-component` among the other kinds.
- The user guide's [library elements](../../user-guide-2/40_libraries/20_using-elements.md): how artifacts load elements.
