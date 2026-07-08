# Marks & anatomy

That calm, deliberate look isn't taste — it's a handful of fixed mark specs plus two
uses of empty space. Only the data gets to raise its voice.

## Mark specs (identical on every chart)

| Mark | Spec |
|---|---|
| Bar / column | **≤ 24px thick** — capped, never filling its slot; the band's remainder is left as air. **Rounded 4px at the data end, square at the baseline**, rising from one shared baseline |
| Line | **2px**, with round joins and caps |
| Marker / end-dot | **≥ 8px** (radius ≥ 4), solid-filled with its series hue |
| Area fill | **~10% opacity** of the series hue — a tint wash, never a solid slab |
| Gridlines / axes | gray a step off the surface, **1px hairline and solid** (dashing is out), staying recessive |

## The two spacers — separation done in white

- **Surface gap.** Touching marks are parted by a **2px band of the surface color** —
  between each segment of a stack, and between any two bars that would otherwise
  touch, always at one width. Hold that width steady across a stack: two neighbors a
  step apart look separate thanks to the gap itself, not thanks to any stroke ringing
  them.
- **Surface ring.** Give dots and end-markers a **2px surface-color ring** so they
  hold up where a line crosses them or where they pile onto each other. That ring
  doubles as hover/hit territory for the mark, not decoration — see
  [`interaction.md`](interaction.md), where undersized dot targets are a standing
  hazard.

Don't fence a mark with a border to set it apart. Gap and ring do the separating; a
border merely lays down ink at data weight that carries no data.

## Labels & legend

Two or more series means **a legend is always on-screen** — it's the trustworthy
identity channel, and no chart should force readers to color-match by eye. Direct
labels then sit on the marks to *back it up*. **One series wants no legend box**: a
single color plus a title that already names the plot makes the box pure repetition
and wasted room.

- **Ration the labels — never one number per point.** A figure clinging to every dot
  or segment turns into visual grain and gets skipped. Call out the endpoint, the
  outlier, or the single series the chart is arguing about, and leave the axis, legend,
  and tooltip/table to hold everything else. Sparseness is *why* direct labels work.
- **Order of resort:** direct labels first, gridlines next, a second axis last.
- **Measure a label before you place it — don't clip it.** A label goes *inside* a bar
  or segment only when the drawn text keeps comfortable padding on both flanks. Failing
  that: on a whole bar or column, shift the label beyond the end (or into the tooltip);
  on an *interior* stacked segment with no open end, skip the inline label entirely —
  legend and tooltip stand in. The value persists in the table view regardless, so
  nothing's locked away. Never paper over it with `overflow: hidden` — cropping the
  first or last characters beats having no label only in the wrong direction.
- **Where each value sits:** at the tip on bars, on the cap on columns, at the end on
  lines.
- **Y-axis ticks** snap to tidy figures (0 / 1,000 / 2,000) with thousands separators;
  they hold whatever values you left unlabeled, so they stay unless every value
  already has its own label.
- **Never paint text in the data color.** The mark carries the series hue; the label,
  value, legend, and axis text stay in the **text tokens** (primary / secondary /
  muted). Set as text on the surface, a pale categorical hue — a yellow, an aqua —
  disappears. What signals identity is the colored mark *sitting beside* the text: a
  dot, a stub of line, a swatch. The single carve-out: a label dropped *inside* a
  colored fill flips between white and ink according to that fill's luminance, which
  keeps its contrast safe everywhere.
- **Colliding end-labels don't get stacked.** Prying labels apart where lines meet cuts
  them loose from their lines and just adds clutter. Reach for **leader lines** (a thin
  tie), **small multiples**, or a fallback to legend + tooltip instead. Once more than
  ~4 series converge, small multiples is usually the answer.

## Figures — when the chart is just a number

- **The stat tile carries four fields.** A `label`, set in sentence case and never
  ending in a colon. A `value` in semibold sans that compacts itself (1,284 / 12.9K /
  $4.2M). Optionally a `delta` — signed, measured against a named period, its color
  determined by direction crossed with whether up counts as good. Optionally a
  `trend` — a sparkline of about 12 points in the de-emphasis hue, the live period
  picked out in the accent.
- **Meter:** severity lives in the fill (accent → warning → danger), and the empty part
  of the track is a **paler step of that same ramp**, so the state reads along the
  bar's full length.
- **Hero figure:** the one number a dashboard is built around — ≥48px, set in the very
  typeface the rest of the page uses, the body sans (a display or serif cut here just
  reads as off-brand ornament). Precisely one to a view.
- **Big numbers get proportional figures; save tabular for columns.** A big freestanding
  number rides on the font's default proportional figures. `font-variant-numeric:
  tabular-nums` pins every digit to a `0`'s width, leaving `121` looking airy at display
  size — so keep it for figures that stack vertically (table rows, axis ticks).

## Texture — the fallback channel (opt-in)

When hue can't do identity — deep color-vision deficiency, grayscale print,
`forced-colors` — texture picks up the load. Use **one** directional hand-drawn fill,
at **45° plus its 135° mirror and no other angle** (horizontal and vertical read as
gridlines or bars). Ink it tone-on-tone from a step of the fill's own ramp, kept
equally loud across every slot. Over a value scale the texture must be *ordered*:
rotation advances with magnitude, and which way the arm leans encodes the diverging
sign. It switches on via the accessibility toggle, in print, or under
`forced-colors`; the resting state is off. (See [`palette.md`](palette.md).)
