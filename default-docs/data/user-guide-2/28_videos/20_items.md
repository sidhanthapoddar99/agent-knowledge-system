---
title: "Items"
description: "The twelve kinds of item a slide can hold, the keys every item shares, the parts an action can name, and which items start hidden."
---

An item is one thing on a slide: a paragraph, a list, a code block, an icon, a chart. Each item sits under its own id in the slide's `items:`, and has exactly one **kind key**. The kind key says what the item is and holds its main content. This page lists the twelve kinds and the keys every item shares.

```yaml
items:
  tree: {tree: [config/site.yaml, data/docs/01_intro.md, data/docs/02_setup.md], at: left}
  pages: {stat: 1300, label: pages indexed, at: right}
  speed: {stat: 7.8, unit: ms, label: to rebuild the index, at: right}
```

An id uses lower-case letters, digits and underscores, and starts with a letter. Actions name the item by its id.

## The twelve kinds

| Kind key | Value | Parts an action can name | Enters with |
|---|---|---|---|
| `text` | A paragraph or a title | none | `rise` |
| `bullets` | A list of 1 to 7 entries | an entry: `.2`, or all: `.*` | `rise`, one entry after another |
| `code` | A block of code; `lang:` names the language | a line: `.3`, or lines: `.3-5` | `type` for up to 8 lines, else `fade` |
| `icon` | A library icon, such as `ks:server` | none | `pop` |
| `image` | An image in `assets/`, such as `./assets/shot.webp`, or a library illustration | none | `fade` |
| `shape` | `box`, `pill`, `circle` or `line`; `label:` is its text | none | `rise` |
| `arrow` | A chain of item ids, `a>b>c` | a segment: `.1` is a to b | `draw` |
| `tree` | A list of file paths; the folders are built from them | a folder or a file: `.data/docs` | `rise` |
| `frame` | A library frame, such as `ks:browser-frame` | none | `rise` |
| `chart` | A library chart, such as `ks:bars`, with `data:` and `unit:` | a bar or other mark: `.1` | `grow` |
| `stat` | A number, with `unit:` and `label:` | none | `count` |
| `table` | A list of rows; the first row is the header | a row: `.2` | `rise`, one row after another |

A **part** is a piece of an item that an action can name on its own. Write the item's id, a dot and the part: `points.2` is the second entry of the bullets item `points`, and `src.3-5` is lines 3 to 5 of the code item `src`. Parts count from 1.

The last column is the item's default entrance. [Narration and actions](./25_narration-and-actions.md) shows how to choose another.

## Keys every item shares

| Key | Meaning |
|---|---|
| `at` | Where: an area of the layout, a grid span, or a frame item's id. [Slides, layouts and templates](./15_slides-and-layouts.md#placing-an-item) explains each |
| `align` | Where inside the area: `tl t tr l c r bl b br`. Default: `c` |
| `size` | `s`, `m`, `l` or `xl`: a step on the style's scale. Text defaults to `m`, icons to `l` and stats to `xl`. Images, frames and charts fill their area |
| `tone` | A colour role: `accent`, `muted`, `good`, `warn`, `bad` or `info` |
| `label` | A caption under an icon, a stat or a frame, or the text inside a shape |

`tone` names a role, not a colour. The style maps each role to a colour of your site's theme, so the item looks right in light and dark mode.

## Notes on some kinds

- **Text** fits its area. It steps down the style's sizes until it fits, but never below the smallest. Text that still does not fit is drawn at the smallest size and spills over visibly, and the player reports it. Text is never cut off.
- **Code** is highlighted the same way as code on your pages. It holds at most 1,200 characters, about 30 lines. A longer listing belongs in an image or a trimmed excerpt.
- **Frames** are device and window chrome, such as a browser, a phone or a terminal. They are also containers, such as a card, a callout or a speech bubble. A frame's screen is an area named after the frame's id, so another item goes inside it with `at: <frame id>`. An image there covers the screen; code or text fits inside it.
- **Charts** take `data:`, a map from each label to a number, with 1 to 12 entries: `data: {Preact: 8.0, Solid: 11.1}`. The chart component chooses the mark (bars, columns, a line, an area, a donut or a funnel) and its look.
- **Stats** count up to their number as they enter.
- **Arrows** run between the edges of the items they join, straight or with one bend. The `send` action moves a dot along an arrow, like a packet on a wire.
- **Trees** take the paths of files. A path names a file, and each folder on the way appears once.
- **Tables** hold 2 to 8 rows.

## Diagrams

Build a diagram from these kinds: icons or shapes placed by a layout, joined by arrows. Then each box and each arrow can appear on the word that names it. Mermaid diagrams do not play in a video, because their layout cannot be animated piece by piece. Keep those in a markdown page.

## What starts hidden

**An item or part that some beat shows starts hidden. Everything else arrives with the slide.** The slide's heading arrives with the slide too.

So a simple slide needs no actions at all: its items are there from the start. A slide that builds up needs one `show` for each item, and each item waits for its cue. In the example above, a beat that says `show pages count` makes the first stat wait, then count up to 1,300.
