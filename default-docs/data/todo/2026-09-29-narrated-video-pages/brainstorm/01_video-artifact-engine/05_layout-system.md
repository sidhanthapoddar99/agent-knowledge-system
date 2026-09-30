---
title: "The layout system"
---

**An author never writes a pixel.** Every video plays on a fixed stage of 1920 × 1080 logical pixels, scaled to whatever box it sits in. Inside a safe area, the stage has an optional header band and a body. The body is a 12-column, 6-row grid. A layout names areas on that grid (`left`, `right`, `tl`, `main` …), and an item picks an area with `at`. Several items in one area arrange themselves evenly. A frame's screen is an area too. When no preset fits, a raw grid span such as `1-6/2-4` is the escape hatch. The style supplies the sizes, gaps and colours, so a slide looks designed by default.

## 01 The stage

```text
 0                                                                      1920
 ┌──────────────────────────────────────────────────────────────────────┐ 0
 │ margin 96                     margin 72                     margin 96 │
 │   ┌──────────────────────────────────────────────────────────────┐   │ 72
 │   │ HEAD BAND  (the slide's head; only when the slide has one)    │   │
 │   ├──────────────────────────────────────────────────────────────┤   │ 224
 │   │ BODY: 12 columns × 6 rows, gutter 24                          │   │
 │   │  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                        │   │
 │   │  │ 1│ 2│ 3│ 4│ 5│ 6│ 7│ 8│ 9│10│11│12│  row 1                  │   │
 │   │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤  …                      │   │
 │   │  │  │  │  │  │  │  │  │  │  │  │  │  │  row 6                  │   │
 │   │  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                        │   │
 │   └──────────────────────────────────────────────────────────────┘   │ 1008
 │                    bottom margin 72 (captions in full screen)          │
 └──────────────────────────────────────────────────────────────────────┘ 1080
```

| Measure | Value |
|---|---|
| Stage | 1920 × 1080 logical pixels, 16:9 |
| Safe area | Inset 96 left and right, 72 top and bottom: 1728 × 936 |
| Head band | The top 120 pixels of the safe area, then a 32-pixel gap. Present only when the slide has a `head` |
| Body grid | 12 columns of 122 pixels and 6 rows, 24-pixel gutters. Rows are 136 pixels tall without a head band and about 111 with one |
| Captions | Under the stage on a page. In full screen, one line at a time inside the bottom margin, on a scrim |

**Scaling.** The stage is laid out once at its logical size and scaled to fit its box, whether that is a 700-pixel embed or a 4K screen. The composition is identical at every size, which is what makes placement predictable for an author who never sees the result while writing. The player spike picks the scaling method, CSS `zoom` or a scale transform, by measuring which keeps text sharpest. It checks text after scaling the stage and after a `focus` zoom, because a scaled compositor layer can leave text blurred in Chromium while `will-change` stays set. The player sets `will-change` only while an animation runs.

## 02 Layouts and areas

A layout is a map of area names to grid spans on the body. Areas are written `columns/rows`: `1-6/1-6` is columns 1 to 6, rows 1 to 6.

**Built into the player:**

| Layout | Areas | Use for |
|---|---|---|
| `full` | `main` 1-12/1-6 | One big thing, or a row of steps |
| `center` | `main` 3-10/1-6 | Text-led slides; a narrower measure reads better |
| `split` | `left` 1-6/1-6 · `right` 7-12/1-6 | Two things side by side: before and after, code and result |
| `main-side` | `main` 1-8/1-6 · `side` 9-12/1-6 | A main visual with notes or stats beside it |
| `side-main` | `side` 1-4/1-6 · `main` 5-12/1-6 | The mirror of `main-side` |
| `thirds` | `a` 1-4 · `b` 5-8 · `c` 9-12, all rows | Three parts, three steps |
| `quad` | `tl` 1-6/1-3 · `tr` 7-12/1-3 · `bl` 1-6/4-6 · `br` 7-12/4-6 | Four quadrants |
| `stack` | `top` 1-12/1-3 · `bottom` 1-12/4-6 | A visual over its explanation |
| `grid6` | `c1` to `c6`, three columns by two rows | Six small things: features, services |

**Quadrants are named by position**, `tl tr bl br`, not numbered, because "quadrant 1" means top-right to a mathematician and top-left to everyone else.

**From libraries** come the layouts that are harder to name: `ks:hero-left`, `ks:hero-right`, `ks:z-pattern`, `ks:big-number`, `ks:timeline-5`, `ks:compare-3` and more ([library components](./08_library-components.md#08-the-day-one-set)). A slide template brings its own layout.

## 03 Placing an item

| Written | Means |
|---|---|
| no `at` | The layout's first area (`main`, `left`, `a`, `tl` …) |
| `at: right` | A named area of the slide's layout |
| `at: 1-6/2-4` | A raw span of the body grid: columns 1 to 6, rows 2 to 4 |
| `at: browser` | The screen of the frame item `browser` |
| `align: tl` … `br` | Where the item sits inside its area, on a 3 × 3 set of points. Default `c` |
| `size: s m l xl` | A step on the style's scale for the item's kind |

**Several items in one area arrange themselves.** Items that share an area are laid out in equal cells: in a row when the area is wider than tall, in a column otherwise, with the style's gap between them. Icons and their labels line up on a shared baseline. When a row holds more than four icons, they step down one size. Arrows never take a cell: they draw between items wherever those items land.

That is why the example's pipeline slide needs no placement at all: five pills in `full` become one even row, and the arrow joins them.

**Frames are areas.** A frame is device or window chrome, such as a browser or a phone, or a container, such as a card, a callout or a speech bubble. A frame fills its area and keeps its own proportions. Its screen (the slot in its SVG) becomes an area named after the frame's id. An image placed there covers the screen; code or text fits inside it.

**Sizes come from the style**, never from the file:

| Kind | `s` | `m` | `l` | `xl` | Default |
|---|---|---|---|---|---|
| Text (font size) | 28 | 36 | 48 | 72 | `m` |
| Icon (box) | 64 | 96 | 144 | 208 | `l` |
| Stat (number) | 48 | 72 | 96 | 144 | `xl` |

Values are logical pixels in the `ks:clean` style; another style may use another scale. Images, frames and charts fill their area.

**Text fits, or the player says so.** Text shrinks, step by step, until it fits its area, but never below the style's smallest step. Past that, it is drawn at the smallest step and overflows visibly, and the player reports `layout-text-fit`. Text is never clipped and never shrunk past the floor.

**Who measures.** The player does all of this in the browser, because only the browser knows the real font: styles use the site's font stacks, and the reader's machine picks the font. The player waits for `document.fonts.ready` before it lays out a slide, so the first layout uses the real font and seeking stays exact. It then checks each slide's final state for three problems: text that does not fit, items that leave their area, and items that overlap. These are the layout diagnostics in [the format](./03_artifact-format.md#layer-3-the-players-layout-diagnostics). They show in the review sheet, which the authoring skill makes an agent look at ([the player](./06_player.md#07-layout-diagnostics-and-the-review-sheet)).

## 04 Why it looks good without trying

1. **Everything sits on the grid.** Edges line up across slides because they line up with the same 12 columns.
2. **One type scale and one spacing scale per style.** Four sizes, one gap, one corner radius.
3. **Colour through roles only.** `tone: accent` rather than a hex value. The style maps roles to the site's theme variables, so light and dark mode both work, and a video matches the site it lives on.
4. **Even distribution.** Auto-flow spaces items evenly and centres them optically, with icons nudged up slightly to balance their labels.
5. **Safe areas stay empty.** Only the background and captions use the margins.
6. **Density limits.** More than six items or forty words on screen at once is a warning. Explainers fail from crowding far more often than from emptiness.
7. **Motion from the style.** One easing family, one base duration and small travel distances ([scenes and timeline](./04_scenes-and-timeline.md#04-presets)).
8. **Quiet backgrounds.** A background component is low-contrast by contract and holds no text ([library components](./08_library-components.md#06-the-contract-of-each-category)).

## 05 Other shapes later

The format keeps an `aspect` key, and each layout may declare an area map per aspect. In 9:16 the body grid becomes 6 columns by 12 rows, and `split` becomes top and bottom. Version 1 accepts only 16:9, because every layout, template and preset must look right in each shape before that shape ships.
