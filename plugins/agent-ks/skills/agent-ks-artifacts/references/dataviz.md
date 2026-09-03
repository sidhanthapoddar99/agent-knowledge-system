# Data visualization: the procedure

Open this file when an artifact holds plotted data: a chart, a stat tile, a meter. Follow the steps in order and run the machine checks. The color jobs, the color rules and the validator are in [dataviz-color.md](dataviz-color.md). This framework's values are in [palette.md](palette.md).

A series is one set of values drawn as marks. Small multiples are one chart repeated per series.

## The procedure

Color comes last.

1. **Settle the form.** Name the data's job: magnitude, identity, polarity, one figure, or time. The job picks the type, or rules out a chart.
2. **Give every color a job.** Identity, magnitude, polarity or state, per dataviz-color.md. Deal categorical hues in the frozen order.
3. **Validate the palette.** Run [validate_palette.js](../scripts/validate_palette.js) once per mode. Clear every FAIL.
4. **Draw to the mark specs.** Slim marks, the two spacers, rationed labels.
5. **Wire hover.** A crosshair tooltip on lines and areas; per-mark tooltips on bars, dots and cells.
6. **Accessibility sweep.** A legend at two or more series; direct labels up to four. A table view. Dark mode from re-stepped, re-validated values, never a flip. Texture on standby.
7. **Open the render.** Look for colliding labels, broken geometry and overflow. Then audit the chart against every rule in this file and in dataviz-color.md. A match with a forbidden pattern means the chart is wrong.

Two invariants hold under every design system. One axis per plot: never two y-scales on one chart. Use two charts, small multiples, or index both series to 100 at t0. A table view for every chart: the WCAG-clean twin.

## Choose the form

Form is the first decision, and the reader's job picks it. "Not a chart" is always an option.

### First gate: chart, or figure

| The data is | Show it as | Not as |
|---|---|---|
| One current value, maybe with its trend | A stat tile: value, delta, sparkline | A bar chart with one bar |
| A handful of headline figures | A KPI row: stat tiles in a line | A grouped bar chart |
| The one figure the dashboard is built around | A hero number | — |
| One value against a limit | A meter on a same-hue track | A two-slice pie |
| About eight or more classes that all matter | A table, or a table beside a chart | More colors |

### Second gate: the job picks the type

| The reader needs to | Use | Color does |
|---|---|---|
| Rank magnitudes | Bar or column; a grid takes a heatmap | One-hue sequential |
| Track a value through time | Line; a lone series may take an area | Sequential, or one categorical |
| Separate several distinct series | Grouped or stacked bar, multi-line | Categorical |
| See one series against the rest | Emphasis: one series lit, the others gray | One hue plus gray |
| Read above or below a baseline, or delta to target | Diverging bar, or a line against a baseline | Diverging |
| Read parts of a whole | Stacked bar; horizontal when categories are many or long-named | Categorical |
| Read an ordered-scale split (Likert) | Diverging stacked bar pinned to its neutral center | Diverging |
| Compare each item before and after | Dumbbell | One hue, two shades |

The color job rules are in [dataviz-color.md](dataviz-color.md#pick-the-job).

## Marks

- **Bar or column.** ≤ 24px thick, never filling its slot. Rounded 4px at the data end, square at the baseline. One shared baseline.
- **Line.** 2px, round joins and caps.
- **Marker or end-dot.** ≥ 8px, solid fill in the series hue.
- **Area fill.** About 10% opacity of the series hue, never a solid slab.
- **Gridlines and axes.** Gray one step off the surface. 1px solid hairline; a dash reads as forecast or threshold. Recessive.
- **The two spacers.** The surface gap: a 2px band of surface color between touching marks, at one constant width. The surface ring: a 2px surface-color ring around dots and end-markers; it also serves as the hover target. Never fence a mark with a border.
- **Saturation.** Small marks and accents only. Big blocks get none.

## Labels and legend

Text color follows [dataviz-color.md](dataviz-color.md#ink).

- **Legend at two or more series.** The legend is the trusted identity channel; direct labels back it up. One series gets no legend box; the title names it.
- **Ration labels.** Never one number per point. Call out the endpoint, the outlier, or the argued series. Axis, legend, tooltip and table hold the rest.
- **Order of resort.** Direct labels first, gridlines next, a second axis with the same scale last.
- **Measure before you place.** A label goes inside a bar only with padding on both sides. Else move it past the end or into the tooltip. An interior stack segment gets no inline label. Never clip a label with `overflow: hidden`.
- **Position.** At the tip on bars, on the cap on columns, at the end on lines.
- **Y-axis ticks.** Tidy figures (0 / 1,000 / 2,000) with thousands separators. Keep them unless every value carries its own label.
- **Colliding end-labels.** Use leader lines, small multiples, or legend plus tooltip. Above about four converging series, use small multiples.

## Figures

- **Stat tile.** Four fields. `label`: sentence case, no colon. `value`: semibold sans, compacted (1,284 / 12.9K / $4.2M). `delta`, optional: signed, against a named period, colored by direction and whether up is good. `trend`, optional: a sparkline of about 12 points in the de-emphasis hue, the live period in the accent.
- **Meter.** Severity lives in the fill: accent → warning → danger. The empty track is a paler step of the same ramp.
- **Hero figure.** ≥ 48px, in the body sans the page uses; a display or serif face reads as ornament. One per view.
- **Digits.** Big standalone numbers use proportional figures. `font-variant-numeric: tabular-nums` is for columns: table rows, axis ticks.

## Components

The part kit, in plain HTML and SVG:

- **Tier 0, foundation.** Color roles as CSS custom properties at the top of the file, per palette.md. The texture fill in reserve. A `<figure>` container that owns responsive sizing, title and caption, and the table-view toggle. Legend (click to isolate; swatches show the texture when active), tooltip, axis, data label.
- **Tier 1, most asked for.** Bar chart: grouped, stacked, horizontal, vertical, thin by default. Line chart: multi-series, optional soft-fill area, accessibility markers. Stat tile. Meter.
- **Tier 2, the rest.** Area chart (stacked; the band edge is the line). Sparkline. Heatmap. Scale legend for sequential and diverging. Filter and time-range controls. Empty state.

A fixed container height must include the x-axis band, plot plus tick labels; otherwise the card grows a nested scrollbar. A content-sized container is safer. The stacked bar owns part-to-whole. A pie or donut is a glance-only move, up to about six segments, never for close values. Small multiples are a layout over these parts, not a part.

## Tooltips and hover

Hover ships with the chart; the bare stat tile is the one exception. A tooltip supplements and never gates: everything it shows is also in a direct label or the table view. Keyboard focus reveals what hover does.

- **Crosshair on X.** Line and area charts: a hairline follows the pointer and snaps to the nearest data position.
- **Aim at the mark.** Bars and cells: each bar, segment, dot or cell owns its `pointermove` and `focus` tooltip with category and value. A small lift confirms the hover.
- **One tooltip, every series.** The read-out lists all series at the pointer's column.
- **Names are untrusted input.** They come from CSV headers and API payloads. Write them with `textContent` or `createTextNode`, never `innerHTML`.
- **Value first.** The number is bold; the series name recedes. A short stroke in the series hue marks the row, not a swatch. Legends echo the mark: a rectangle for bars and areas, a line for lines.
- **Targets outsize marks.** The hit zone spills past the paint, through the 2px gap, to 24px or more. For crowded scatter add a nearest-point (Voronoi) layer.

## Filters

Filters are interface furniture, not chart marks. Build them from ordinary form elements styled to match the chart chrome. The date-picker spec is in [palette.md](palette.md#other-parameters).

- **One row above the charts.** Left-aligned, over everything it governs. Not inside a chart card, not repeated per chart. A chart that needs its own range wants a separate dashboard.
- **Date range leads.** Presets first: today, the last 7, 30 or 90 days, month to date. The custom range sits behind them.
- **Everything inherits.** Charts, stats and tables redraw on the same slice.
- **A refetch holds.** Charts stay up, dimmed. Never a skeleton, a reflow or a flash.
