---
title: "Slides, layouts and templates"
description: "A slide is one screen. You place its items by naming areas of a layout on a 12 by 6 grid, never by pixels. Templates, transitions, backgrounds and morph."
---

A slide is one screen of a video: a heading, a layout or a template, the items on it, and beats of narration. You place items by naming areas of a layout, never by pixels.

## A slide's keys

| Key | Meaning |
|---|---|
| `head` | The heading, drawn in a band at the top of the slide. Optional |
| `layout` | A layout of named areas, such as `split` |
| `template` | A slide template, such as `ks:title`. A slide has a `layout` or a `template`, never both |
| `items` | The things on the slide, each under its own id. The order is the drawing order |
| `beats` | The narration and its actions, in order. A slide has at least one beat |
| `bg` | The background |
| `in` | The transition into this slide |
| `id` | The slide's id. In a single file only; in a folder, the file's slug is the id |

Any other key fills a slot of the slide's template, as shown below.

## The stage and the grid

Every video plays on a stage of 1920 by 1080, scaled to fit its box. The picture is the same at every size. A slide with a `head` gets a heading band at the top. The rest of the stage is the body: a grid of 12 columns and 6 rows.

A **layout** names areas on that grid. An item picks an area with `at`.

## The built-in layouts

| Layout | Areas | Use it for |
|---|---|---|
| `full` | `main`: the whole body | One big thing, or a row of steps |
| `center` | `main`: columns 3 to 10 | Slides led by text; a narrower line reads better |
| `split` | `left`, `right` | Two things side by side: before and after, code and result |
| `main-side` | `main` (columns 1 to 8), `side` | A main picture with notes or stats beside it |
| `side-main` | `side` (columns 1 to 4), `main` | The mirror of `main-side` |
| `thirds` | `a`, `b`, `c` | Three parts, or three steps |
| `quad` | `tl`, `tr`, `bl`, `br` | Four quadrants: top left, top right, bottom left, bottom right |
| `stack` | `top`, `bottom` | A picture over its explanation |
| `grid6` | `c1` to `c6`, three across and two down | Six small things: features, services |

Libraries add layouts that are harder to name, such as `ks:hero-left`, `ks:big-number` and `ks:timeline-5`. `agentks library show ks --category layouts` lists them with their areas.

## Placing an item

| You write | It means |
|---|---|
| no `at` | The layout's first area |
| `at: right` | A named area of the slide's layout |
| `at: 1-6/2-4` | A span of the grid, `columns/rows`: columns 1 to 6, rows 2 to 4. Use it only when no layout fits |
| `at: browser` | The screen of the frame item `browser` |
| `align: tl` | Where the item sits inside its area: `tl t tr l c r bl b br`. Default: `c`, the centre |

**Items that share an area arrange themselves.** They get equal cells: in a row when the area is wider than it is tall, in a column otherwise. Five shapes in `full` become one even row with no placement at all. Arrows take no cell. They draw between items wherever those items land.

## Templates

A **template** is a ready-made slide from a library. It brings a layout, placed items, a background and its own motion. You fill its **slots** with keys on the slide:

```yaml
template: ks:title
title: How agentks turns files into pages
subtitle: A three-minute tour
beats:
  - say: This is a three-minute tour of agentks.
```

- `agentks library show ks --category slides` lists every template with its slots. A missing required slot is an error, and so is a key that is not a slot.
- A slide can add its own `items` to a template, and act on the template's items by their ids.
- The template's motion runs at the start of the first beat. When a beat acts on the same item, the beat wins.

## Transitions and backgrounds

`in:` names the transition into a slide. The built-in ones are `cut`, `fade`, `slide`, `push`, `wipe`, `zoom` and `morph`. The default library adds ten more, such as `ks:dissolve` and `ks:iris`. Use one transition for the whole video, set in the header, plus at most one other for a change of section.

`bg:` names a background, such as `ks:soft-grid`. A background is quiet by design: low contrast and no text.

**Morph.** With `in: morph`, every item whose id is also on the slide before glides from its old place, size and colour to its new ones. Items only on the old slide fade out. Items only on the new slide follow their actions, or fade in. Morph is chosen per slide, so an id you reuse by accident never moves anything. A slide with `in: morph` must share at least one item id with the slide before it, and the first slide cannot morph. Otherwise the check reports `video-morph-unmatched`.

## Which slide for which message

| The slide says | Use |
|---|---|
| This is what the video is about | `template: ks:title` |
| We move to a new part | `template: ks:section` |
| Here are some points | A `bullets` item in `center`, or in `split` beside an icon |
| These are the parts of a system | Icons with labels in `thirds`, `quad` or `grid6`, joined by an arrow |
| Something flows through steps | Shapes in `full`, joined by an arrow |
| Before and after | `split` with two images or frames, or two slides joined by a morph |
| Here is the code | `template: ks:code-explain`, or `split` with a code frame |
| This number matters | `template: ks:big-number`, or a `stat` item |
| These values compare | A `chart` item |
| This is what it looks like | A frame holding a screenshot |
| Thanks, and where next | `template: ks:closing` |
