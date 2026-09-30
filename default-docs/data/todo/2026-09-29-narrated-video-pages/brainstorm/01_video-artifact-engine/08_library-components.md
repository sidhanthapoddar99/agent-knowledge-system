---
title: "Library components"
---

**The player holds the mechanics; libraries hold the looks.** Every library keeps its components in `components/<category>/`, one folder per category, with fifteen fixed categories. Most video components are data (JSON presets, transitions, layouts, slide templates, chart templates, styles) or SVG (icons, illustrations, backgrounds, frames, annotations). The Rust compiler reads the ones a video uses, checks them against their category's contract, and inlines them into the video's compiled data. So a video plays with no extra requests and no library code runs. Inlined SVG passes an allowlist first. Code components (`scripts`) have a contract but wait for a later version. The manifest gains one field, `category`. The default library ships the full Lucide icon set and about 115 video components on day one, so videos look good from the first one.

## 01 Who owns what

| The player owns (built in, bare names) | Libraries own (`alias:name`) |
|---|---|
| The stage, the grid and the layout engine | Layouts beyond the nine built in |
| The twelve item kinds and how each draws | Frames, icons, illustrations, images, backgrounds |
| The chart marks: bar, column, line, area, donut, funnel | Chart templates: which mark, its look, its choreography |
| The animation runner, and a minimal preset pack | Most presets and transitions |
| A plain default style | Styles: type scale, spacing, colour roles, default presets |
| Slide building from items | Slide templates with slots |
| The timeline, the clock, audio, captions, controls | Nothing here |

The built-in set exists so a project that removes every library still plays its videos, which the library system requires. Libraries add to it and never replace a built-in, because the alias keeps the names apart.

## 02 The fixed structure

```text
<library root>/
  manifest.json
  components/
    icons/           *.svg
    illustrations/   *.svg
    images/          *.webp  *.avif  *.png  *.jpg
    backgrounds/     *.svg
    frames/          *.svg
    annotations/     *.svg
    widgets/         *.html
    charts/          *.json
    layouts/         *.json
    slides/          *.json
    animations/      *.json
    transitions/     *.json
    styles/          *.json
    scripts/         *.js
    fonts/           *.woff2
```

The default library's repository keeps its other top-level folders beside `components/`: `templates/` for starter projects (`agentks init`), `scripts/` for its own tooling, `preview/`, `LICENSES/`. Those are not components.

**The structure is the same for every library**, not only the default one. A manifest-less local library follows it too: each file's category is its folder and its name is its file name without the extension.

## 03 The categories

| Category | Holds | Type | A video names it in | Artifacts use it | Size cap |
|---|---|---|---|---|---|
| `icons` | Single-colour glyphs | SVG | `icon:` | `<img>` or inline, from `/_lib/` | 2 KB |
| `illustrations` | Multi-part artwork: people, devices, scenes | SVG | `image:` | Yes | 30 KB |
| `images` | Photos, screenshots, textures, before-and-after states | WebP, AVIF, PNG, JPEG | `image:` | Yes | 250 KB, 1920 px long side |
| `backgrounds` | Slide backgrounds: gradients, dots, grids, meshes | SVG | `bg:` | Yes | 8 KB |
| `frames` | Anything with a screen slot: device and window chrome (browser, phone, terminal) and containers (card, callout, speech bubble, sticky note) | SVG | `frame:` | Yes, as images, or through a widget | 12 KB |
| `annotations` | Marks drawn around, under or over an item: hand-drawn circles, underlines, brackets, highlight boxes, arrows, ticks | SVG | an emphasis preset's `overlay` | Yes | 4 KB |
| `widgets` | Interactive HTML for artifacts | HTML | not used | In a sandboxed iframe | 15 KB |
| `charts` | Chart templates over the player's marks | JSON | `chart:` | No | 4 KB |
| `layouts` | Named areas on the body grid | JSON | `layout:` | No | 2 KB |
| `slides` | Slide templates with slots and a default choreography | JSON | `template:` | No | 8 KB |
| `animations` | Entrance, emphasis, exit and motion presets | JSON | a preset in `do` | No | 2 KB |
| `transitions` | Slide transitions | JSON | `in:` | No | 2 KB |
| `styles` | Type, spacing, colour roles, motion, defaults | JSON | `style:` | No | 4 KB |
| `scripts` | Code components for what data cannot express | JavaScript module | later | No | 20 KB |
| `fonts` | Typefaces for styles | WOFF2 | through a style | Yes | 80 KB |

**Why frames cover containers.** sidhantha asked for "many good frames". In a slide deck, a frame can mean device chrome or a box that holds content, such as a card or a callout. Both have the same shape in the design: an SVG with one slot that becomes a layout area. So one category and one contract serve both meanings, and no question needs asking. The other sense, smooth motion with many frames a second, is the player's job ([the player](./06_player.md#02-why-the-web-animations-api)).

**Why annotations are their own category.** Explainers point at things constantly: a circle around a number, an underline under a word, an arrow at a button. An annotation is a stretchable SVG line drawing that an emphasis preset draws around its target with a line-draw animation. It has its own contract (below), so it gets its own folder.

**Why `scripts` keeps its name.** The review suggested `programs` or `code`, because the library repository also has a `scripts/` folder for its own tooling. The design keeps `scripts`, for two reasons. sidhantha used that word for the category ([migration comment 003](../../../2026-09-29-rust-core-engine-migration/comments/003_2026-09-30_library-components-layout.md)). And the two folders never meet: one is `components/scripts/`, the other is the repository's top-level `scripts/`.

## 04 Names

- **Element names stay unique within a library**, lower-case with hyphens, as the library system already decided. That keeps `/_lib/<alias>/<element>` unchanged for artifacts.
- **The field in the video gives the category**, so a name needs no prefix: `frame: ks:phone-frame`, `icon: ks:phone`.
- **Where two categories want the same word**, one of them takes a suffix that says its kind. Frames end in `-frame`, so the icon `phone` and the frame `phone-frame` never clash, and both read naturally.
- **Inside a component**, `self:name` names another component of the same library, and a bare name is a player built-in. Libraries cannot depend on other libraries, so nothing else is allowed.

## 05 The manifest

One new required field per element, `category`, which must match the element's folder. Everything else is as the [library system](../../../2026-09-29-rust-core-engine-migration/notes/04_ecosystem/01_library-system.md) defines it.

```json
"phone-frame": {
  "category": "frames",
  "file": "components/frames/phone-frame.svg",
  "description": "A phone with a screen slot. In a video, place an image or code on its screen with at: <frame id>.",
  "tags": ["frame", "mobile", "device"]
},
"rise-blur": {
  "category": "animations",
  "file": "components/animations/rise-blur.json",
  "description": "Entrance. Rises 24 px while coming into focus. Soft; good for headings and cards.",
  "tags": ["enter", "soft", "blur"]
}
```

`agentks library find` and `library show` gain `--category`, so an agent can list, say, every entrance preset in one short command. `library show ks --category slides` prints each template's slots.

## 06 The contract of each category

The engine owns one JSON Schema per data category and prints it with `agentks video schema --component <category>`. `agentks check libraries` and the library's own check apply these rules.

### SVG categories

| Rule | Icons | Illustrations | Backgrounds | Frames | Annotations |
|---|---|---|---|---|---|
| View box | `0 0 24 24` | Any | `0 0 1920 1080`, `preserveAspectRatio="xMidYMid slice"` | Any | Any; `preserveAspectRatio="none"` so it stretches to its target |
| Colour | `currentColor` only; stroke 2, round caps and joins, no fill | `currentColor` and the player's role variables | Role variables, low contrast, no text | Role variables | `currentColor` strokes with `vector-effect="non-scaling-stroke"`, so the line keeps its weight when stretched |
| Special parts | No ids | `data-part` names on parts, which may be targeted later | An optional `<g data-drift>` the player moves slowly | One `<rect data-slot>` marks the screen; an optional `<text data-label>` takes the item's label | `data-fit`: `around`, `under`, `over`, `left` or `right` of the target |

### SVG safety: an allowlist

The compiler inlines SVG into the page, so SVG is the one library content that runs on the site's origin. A denylist (no script, no event attributes …) misses known attacks: a `<style>` block restyles the whole page, a `url()` in a style can track readers, an `<animate>` can rewrite a link to `javascript:`, and a `<use>` can pull in outside content. So the compiler does not filter SVG. It parses each file (with `quick-xml`) and writes back only what the allowlist names:

| Allowed | Everything else |
|---|---|
| **Elements:** `svg`, `g`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `text`, `tspan`, `defs`, `linearGradient`, `radialGradient`, `stop`, `clipPath`, `mask`, `pattern`, `symbol`, `use`, `title`, `desc` | **An error, `library.bad-component`,** naming the element or attribute and its line. Never stripped silently. Refused in particular: `style`, `script`, `foreignObject`, `image`, `a`, `animate`, `set`, `animateTransform`, `animateMotion`, `iframe`, every `on…` attribute, `class` |
| **Attributes:** geometry, presentation attributes (fill, stroke and the rest), `transform`, `opacity`, `viewBox`, `preserveAspectRatio`, `vector-effect`, `id`, and the `data-slot`, `data-label`, `data-drift`, `data-part` and `data-fit` markers | |
| **`style` attributes** with allowlisted properties only | |
| **References:** `url(#id)` and `href="#id"` to an id in the same file only | |

**Ids are made unique.** Two inlined SVGs that both define `#g` for a gradient would break each other. So the compiler rewrites every id and every reference to it with a placeholder prefix, and the player fills in a prefix unique to each use when it inserts the SVG. The same icon can then appear twice on a slide safely.

**This is a sanctioned exception** to the library system's rule that library files are sandboxed. After the allowlist, an SVG is drawing data, not code: nothing in it can run, load, or reach outside itself. The library system note records the exception and this reason ([what this changes elsewhere](./11_changes-to-existing-design.md)).

**One implementation.** The allowlist and every per-category rule live once, in Rust. `agentks check libraries` runs them. The library repository's CI calls that command, and its own `scripts/check.py` keeps only what is about the repository itself, such as the manifest and the frame-to-widget sync. Two copies of the rules would drift.

**The player's role variables** are `--vx-bg`, `--vx-surface`, `--vx-text`, `--vx-muted`, `--vx-line`, `--vx-accent`, `--vx-good`, `--vx-warn`, `--vx-bad` and `--vx-info`. A style maps each to a theme contract variable. Components use only these names, so one component looks right under every style and in light and dark mode.

### Animations

```json
{
  "role": "enter",
  "duration": 0.7,
  "easing": "cubic-bezier(.16,1,.3,1)",
  "keyframes": [
    { "opacity": 0, "transform": "translateY(24px)", "filter": "blur(8px)" },
    { "opacity": 1, "transform": "none", "filter": "none" }
  ],
  "split": "none",
  "stagger": 0.08,
  "reduced": "fade"
}
```

| Field | Meaning |
|---|---|
| `role` | `enter`, `emph`, `exit` or `move`. A preset used in the wrong verb is an error |
| `duration`, `easing` | Seconds and a CSS easing: `cubic-bezier()` or `linear()` with sampled points for springs and bounces. Omit them to take the style's |
| `keyframes` | Web Animations keyframes. Allowed properties only: `opacity`, `transform`, `filter` (blur, brightness), `clip-path` (inset, circle), `stroke-dashoffset`, `offset-distance`, colours as `var(--vx-*)` |
| `target` | `self` (default), `mark` (the highlight bar behind a part), `stroke` (an SVG's paths) or `overlay` (the annotation named in `overlay`) |
| `overlay` | For emphasis only: an annotation, `self:scribble-circle`, drawn around the target by its `data-fit`, usually with a line draw |
| `split` | `none`, `word`, `letter` or `line`, for text |
| `stagger` | Seconds between parts or split pieces |
| `composite` | `add` for emphasis and motion; not allowed on entrances and exits |
| `reduced` | A built-in preset to use when the reader asks for reduced motion |

### Transitions

```json
{
  "duration": 0.65,
  "easing": "cubic-bezier(.65,0,.35,1)",
  "out": [ { "transform": "none" }, { "transform": "translateX(-100%)" } ],
  "in":  [ { "transform": "translateX(100%)" }, { "transform": "none" } ],
  "reduced": "fade"
}
```

### Layouts

```json
{ "areas": { "main": "1-7/1-6", "side": "8-12/2-5" } }
```

Area names are lower-case words. Spans use the body grid, `columns/rows`. A later version adds an area map per aspect ratio.

### Slide templates

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

- **Slots** are the keys a slide fills (`title: …`). Types are `text`, `list`, `number`, `image`, `icon` and `code`. The compiler checks them and fills `{slot}` placeholders.
- **Items** use the same item format as a video. A slide may add its own items and target the template's by id.
- **`do`** runs at the start of the slide's first beat. If a beat of the slide acts on the same item, the slide wins and the template's action for it is dropped.

### Chart templates

```json
{
  "mark": "bar",
  "orient": "horizontal",
  "data": { "min": 1, "max": 12 },
  "look": { "radius": 8, "gap": 0.28, "labels": "end", "axis": false, "grid": false, "format": "0.0" },
  "show": { "preset": "grow", "stagger": 0.12 }
}
```

The player draws the marks and computes the scales. The template chooses the mark, its look and its entrance.

### Styles

```json
{
  "roles": {
    "bg": "--color-bg-primary", "surface": "--color-bg-secondary", "text": "--color-text-primary",
    "muted": "--color-text-muted", "line": "--color-border-default", "accent": "--color-brand-primary",
    "good": "--color-success", "warn": "--color-warning", "bad": "--color-error", "info": "--color-info"
  },
  "fonts": { "text": "--font-family-base", "code": "--font-family-mono" },
  "type": { "head": 56, "s": 28, "m": 36, "l": 48, "xl": 72, "code": 26 },
  "icon": { "s": 64, "m": 96, "l": 144, "xl": 208 },
  "space": { "gap": 32, "radius": 16 },
  "motion": { "easing": "cubic-bezier(.16,1,.3,1)", "duration": 0.6, "stagger": 0.09 },
  "defaults": {
    "bg": "self:soft-grid", "in": "fade", "show": "rise", "emph": "pulse", "hide": "fade",
    "head": "rise", "wait": 0.3, "tail": 0.6
  }
}
```

Roles point at the theme contract's variables, so a video follows the site's theme and its light and dark modes. A style that wants its own look gives literal colours for light and for dark instead.

### Scripts (later)

A script is an ES module whose default export is `{ props, mount(box, props, env) }`, where `mount` returns `{ seek(ms), destroy() }`. `seek` must draw the state at that time and nothing else: no timers, no network, no storage, and the same picture every time for the same time. Script code is third-party, so it runs in a sandboxed iframe, driven by `seek` messages from the player, in line with the library system's decision that library code is sandboxed.

## 07 How the engine uses them

| Component type | At compile time | At play time |
|---|---|---|
| JSON (charts, layouts, slides, animations, transitions, styles) | Read, checked against the category schema, and inlined into the compiled video data, only the ones used | Nothing to fetch |
| SVG (icons, illustrations, backgrounds, frames, annotations) | Passed through the allowlist, ids prefixed, checked and inlined | Nothing to fetch |
| Images | Checked for type and size | Loaded from `/_lib/<alias>/<name>`; the next slide's images are preloaded |
| Widgets | Not used by videos | Artifacts load them sandboxed, as today |

JSON components are never served over `/_lib/`: only the compiler needs them. A published site holds only the images a video uses, copied by `agentks build`.

## 08 The day-one set

What the default library ships before the first video is judged. Counts are targets for the component track.

| Category | Count | Components |
|---|---|---|
| `styles` | 3 | `clean` (calm, the default), `bold` (large type, strong accent), `blueprint` (technical, grid lines, mono accents) |
| `layouts` | 8 | `hero-left`, `hero-right`, `z-pattern`, `big-number`, `timeline-5`, `compare-3`, `focus-side`, `steps-4` |
| `slides` | 12 | `title`, `section`, `bullets`, `bullets-image`, `compare`, `process-3`, `process-4`, `timeline`, `quote`, `big-number`, `code-explain`, `closing` |
| `animations` | 32 | Enter: `blur-in`, `rise-blur`, `slide-left`, `slide-right`, `slide-up`, `reveal-up`, `words`, `letters`, `spring-pop`, `flip-in`, `stamp`, `scale-in`. Emphasis: `underline`, `spotlight`, `color-shift`, `heartbeat`, `wiggle`, `tilt`. Exit: `blur-out`, `slide-out-left`, `slide-out-down`, `collapse`, `fade-down`, `scale-out`. With an annotation: `circle-it`, `underline-it`, `bracket-it`, `box-it`, `point-at`, `tick`, `cross-out`, `star-it` |
| `transitions` | 10 | `dissolve`, `slide-up`, `push-up`, `iris`, `blinds`, `split`, `zoom-through`, `flip`, `cover`, `reveal` |
| `backgrounds` | 10 | `plain`, `soft-gradient`, `soft-grid`, `dots`, `blueprint`, `mesh`, `paper`, `spotlight`, `diagonal`, `aurora` |
| `frames` | 12 | Devices and windows: `browser-frame`, `phone-frame`, `laptop-frame`, `tablet-frame`, `terminal-frame`, `code-frame`. Containers: `card-frame`, `callout-frame`, `bubble-frame`, `note-frame`, `panel-frame`, `window-frame` |
| `annotations` | 8 | `scribble-circle`, `scribble-underline`, `bracket`, `highlight-box`, `hand-arrow`, `tick`, `cross`, `star` |
| `charts` | 8 | `bars`, `columns`, `grouped-columns`, `line`, `area`, `donut`, `funnel`, `progress` |
| `illustrations` | 12 | Drawn for the library or adapted from CC0 sources, each licence in `LICENSES/`: a developer at a laptop, a team, a server rack, a cloud, a database, a phone user, a browser window, a pipeline, a lock and key, a rocket, a checklist, a lightbulb |
| `icons` | 1,857 plus 74 | The full Lucide set (ISC licence, `lucide-static` 1.49.0), imported with Lucide's tags by a script in the library's `scripts/`, so an update is a re-run. The 74 curated icons keep their names and win any clash. A video inlines only the icons it uses, so the set costs nothing at play time |
| `widgets` | 3 today, plus 6 | The six device frame views below |
| `images`, `scripts`, `fonts` | 0 | Contracts only in version 1. Images come from the project's own `assets/`, which is where screenshots and before-and-after states belong anyway |

## 09 What happens to today's library content

The library is at 0.1.0 and has no tag yet, so moving and renaming now costs nothing. After the first tag, the same change would need a major version.

| Today | Becomes |
|---|---|
| `icons/*.svg` | `components/icons/`, names unchanged, joined by the Lucide import |
| `frames/*.html`, six HTML frames drawn with CSS | The chrome is redrawn once as SVG in `components/frames/<name>-frame.svg`, the one source. The HTML versions become widgets, `components/widgets/<name>-view.html` (for example `phone-view`), whose chrome is the same SVG, copied in by the library's existing `--sync-shared` step. One design, two uses, no drift |
| `widgets/*.html` | `components/widgets/`, names unchanged |
| `manifest.json` | Every entry gains `category`; every `file` gains `components/<category>/` |
| `scripts/check.py` | Checks that `category` matches the folder now (track T4a). Once `agentks check libraries` exists, the library's CI calls it for the per-category rules in section 06, instead of a second copy in Python |
| `preview/index.html` | Gains a video page that plays every preset, transition and template on sample items, using the player's build |
