---
title: "Component contracts"
description: "The rules a video component must follow, in a library or in a video folder's components/: the SVG rules and allowlist, and the JSON shape of each data category."
---

Every category of video component has a **contract**: the rules a file must follow so that agentks can build it into a video and the player can draw it. The contracts are the same for a library and for a video folder's own `components/`. This page gives the rules for SVG components and the shape of each JSON category. `agentks video schema --component <category>` prints the exact schema of a JSON category, and `agentks check libraries` checks every component against its contract.

## Colour roles

A component never holds a colour value. It uses the player's **role variables**, which the style maps to your site's theme, so one component looks right under every style and in light and dark mode:

`--vx-bg`, `--vx-surface`, `--vx-text`, `--vx-muted`, `--vx-line`, `--vx-accent`, `--vx-good`, `--vx-warn`, `--vx-bad`, `--vx-info`

In SVG, set a role colour through a `style` attribute, such as `style="fill:var(--vx-surface)"`. A presentation attribute such as `fill=` does not accept a variable.

## SVG components

| Category | View box | Colour | Special parts | Size cap |
|---|---|---|---|---|
| `icons` | `0 0 24 24` | `currentColor` strokes, width 2, round caps and joins, no fill | No ids | 2 KB |
| `illustrations` | Any | `currentColor` and role variables | Optional `data-part` names on parts | 30 KB |
| `backgrounds` | `0 0 1920 1080`, with `preserveAspectRatio="xMidYMid slice"` | Role variables, low contrast, no text | An optional `<g data-drift="">`, which drifts slowly across the slide | 8 KB |
| `frames` | Any; the frame keeps its proportions | Role variables | Exactly one `<rect data-slot="">`, the screen. An optional `<text data-label="">`, which receives the item's label | 12 KB |
| `annotations` | Any, with `preserveAspectRatio="none"` so it stretches to its target | `currentColor` strokes with `vector-effect="non-scaling-stroke"` | `data-fit`: `around`, `under`, `over`, `left` or `right` of the target | 4 KB |

Every SVG must be well-formed XML. A marker attribute needs a value: write `data-slot=""`, never a bare `data-slot`. An `rx` on a frame's slot rounds the bottom corners of an image that covers the screen.

**The allowlist.** agentks puts each SVG straight into the page, so it reads every file and keeps only what an allowlist names:

- **Elements:** `svg`, `g`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `text`, `tspan`, `defs`, `linearGradient`, `radialGradient`, `stop`, `clipPath`, `mask`, `pattern`, `symbol`, `use`, `title`, `desc`.
- **Attributes:** geometry, presentation attributes such as `fill` and `stroke`, `transform`, `opacity`, `viewBox`, `preserveAspectRatio`, `vector-effect`, `id`, the `data-` markers above, and `style` with allowed properties only.
- **References:** `url(#id)` and `href="#id"`, to an id in the same file only.

Anything else is an error, `library-bad-component`, which names the element or attribute and its line. Nothing is removed silently. That refuses, among others, `<style>`, `<script>`, `<foreignObject>`, `<image>`, `<a>`, the animation elements, every `on…` attribute and `class`. You need not worry about ids: agentks makes every id unique each time the SVG is used, so the same icon can appear twice on a slide.

## Animations

```json
{
  "role": "enter",
  "duration": 0.7,
  "easing": "cubic-bezier(.16,1,.3,1)",
  "keyframes": [
    { "opacity": 0, "transform": "translateY(24px)", "filter": "blur(8px)" },
    { "opacity": 1, "transform": "none", "filter": "none" }
  ],
  "stagger": 0.08,
  "reduced": "fade"
}
```

- `role` is `enter`, `emph`, `exit` or `move`.
- `duration` is in seconds. `easing` is a `cubic-bezier()`, a `linear()` curve, `steps()` or a keyword. A `linear()` curve lists sampled points, so a spring or a bounce is data, not code. Leave either out to take the style's.
- `keyframes` may animate only `opacity`, `transform`, `filter`, `clipPath`, `strokeDashoffset`, `offsetDistance`, colours as `var(--vx-…)` and a stat's counter, `--vx-n`. These stay smooth. Layout properties such as `width` or `top` are refused.
- `target` is `self` (the default), `mark` (the highlight bar behind a part), `stroke` (every path of an SVG item, drawn as a line) or `overlay` (an annotation, named in `overlay`, drawn around the target).
- `split` is `none`, `word`, `letter` or `line`, and `stagger` is the seconds between pieces.
- `reduced` names the built-in preset to play when the reader asks for reduced motion.

How an animation holds and combines with others is set by the verb, not by the preset. Size cap: 2 KB.

## Transitions

```json
{
  "duration": 0.65,
  "easing": "cubic-bezier(.65,0,.35,1)",
  "out": [ { "transform": "none" }, { "transform": "translateX(-100%)" } ],
  "in":  [ { "transform": "translateX(100%)" }, { "transform": "none" } ],
  "reduced": "fade"
}
```

`out` animates the old slide and `in` the new one, at the same time. An empty list leaves that slide still. Size cap: 2 KB.

## Layouts

```json
{ "areas": { "main": "1-7/1-6", "side": "8-12/2-5" } }
```

Each area is a lower-case name and a span of the body grid, `columns/rows`: columns 1 to 12, rows 1 to 6. The first area is where an item with no `at` goes. Size cap: 2 KB.

## Slide templates

```json
{
  "layout": "full",
  "slots": {
    "title":    { "type": "text", "required": true, "max": 80 },
    "subtitle": { "type": "text", "max": 120 }
  },
  "bg": "self:soft-gradient",
  "items": {
    "title":    { "text": "{title}", "at": "2-11/2-4", "size": "xl", "align": "bl" },
    "subtitle": { "text": "{subtitle}", "at": "2-11/5", "size": "m", "tone": "muted", "align": "tl" }
  },
  "do": ["show title rise", "show subtitle fade @+0.4s"]
}
```

- `slots` are the keys a slide fills. A slot's type is `text`, `list`, `number`, `image`, `icon` or `code`. `{slot}` in an item is replaced by the slide's value.
- `items` use the same item format as a video.
- `do` runs at the start of the slide's first beat.

Inside a library's component, `self:` names another component of the same library, as `self:soft-gradient` does here. Size cap: 8 KB.

## Chart templates

```json
{
  "mark": "bar",
  "orient": "horizontal",
  "look": { "radius": 8, "gap": 0.28, "labels": "end", "format": "0.0" },
  "show": { "preset": "grow", "stagger": 0.12 }
}
```

The player draws the marks and works out the scale. The template chooses the mark, its look and its entrance. Size cap: 4 KB.

## Styles

```json
{
  "roles": { "bg": "--color-bg-primary", "surface": "--color-bg-secondary", "text": "--color-text-primary",
             "muted": "--color-text-muted", "line": "--color-border-default", "accent": "--color-brand-primary",
             "good": "--color-success", "warn": "--color-warning", "bad": "--color-error", "info": "--color-info" },
  "fonts": { "text": "--font-family-base", "code": "--font-family-mono" },
  "type": { "head": 56, "s": 28, "m": 36, "l": 48, "xl": 72, "code": 26 },
  "icon": { "s": 64, "m": 96, "l": 144, "xl": 208 },
  "stat": { "s": 48, "m": 72, "l": 96, "xl": 144 },
  "space": { "gap": 32, "radius": 16 },
  "motion": { "easing": "cubic-bezier(.16,1,.3,1)", "duration": 0.6, "stagger": 0.09 },
  "defaults": { "bg": "self:soft-grid", "in": "fade", "emph": "pulse", "hide": "fade", "head": "rise", "wait": 0.3, "tail": 0.6 }
}
```

`roles` and `fonts` name variables of the site's theme contract. Sizes are in stage pixels, on the 1920 by 1080 stage. `type.s` is the smallest size text ever shrinks to. Every key except `defaults` is required. Size cap: 4 KB.
