# Data visualization: the procedure

Open this file when an artifact holds plotted data: a chart, a stat tile, a meter. Follow the steps in order and run the machine checks. The color jobs, the color rules and the validator are in [dataviz-color.md](dataviz-color.md). This framework's values are in [palette.md](palette.md).

A series is one set of values drawn as marks. Small multiples are one chart repeated per series.

## The procedure

Color comes last.

1. **Settle the form.** Name the data's job: magnitude, identity, polarity, one figure, or time. The job picks the type, or rules out a chart.
2. **Give every color a job.** Identity, magnitude, polarity or state, per dataviz-color.md. Assign categorical hues in the fixed order.
3. **Validate the palette.** Run [validate_palette.js](../scripts/validate_palette.js) once per mode. Clear every FAIL.
4. **Draw to the mark specs.** Draw slim marks, the two spacers, and only a few labels.
5. **Wire hover.** Put a crosshair tooltip on lines and areas. Put a per-mark tooltip on bars, dots and cells.
6. **Accessibility sweep.** Add a legend at two or more series. Add direct labels up to four series. Add a table view. Build dark mode from re-stepped, re-validated values, never from a flip. Keep texture ready.
7. **Open the render.** Look for colliding labels, broken geometry and overflow. Then audit the chart against every rule in this file and in dataviz-color.md. A match with a forbidden pattern means the chart is wrong.

Two rules hold under every design system. One axis per plot: never two y-scales on one chart. Use two charts, small multiples, or index both series to 100 at t0. Every chart has a table view. The table is the accessible twin that meets WCAG.

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

- **Bar or column.** A bar is at most 24px thick and never fills its slot. Round it 4px at the data end and keep it square at the baseline. All bars share one baseline.
- **Line.** A line is 2px, with round joins and caps.
- **Marker or end-dot.** A marker is at least 8px, with a solid fill in the series hue.
- **Area fill.** An area fill is the series hue at about 10% opacity, never a solid block.
- **Gridlines and axes.** Gridlines and axes are gray, one step off the surface. Draw them as a 1px solid hairline. A dash reads as a forecast or a threshold. Keep them in the background.
- **The two spacers.** The surface gap: a 2px band of surface color between touching marks, at one constant width. The surface ring: a 2px surface-color ring around dots and end-markers. The ring also serves as the hover target. Never draw a border around a mark.
- **Saturation.** Use saturated color on small marks and accents only. Big blocks get none.

## Labels and legend

Text color follows [dataviz-color.md](dataviz-color.md#ink).

- **Legend at two or more series.** The legend is the trusted identity channel. Direct labels back it up. One series gets no legend box. The title names it.
- **Ration labels.** Never one number per point. Call out the endpoint, the outlier, or the series the page argues about. Axis, legend, tooltip and table hold the rest.
- **Order of fallbacks.** Direct labels first, gridlines next, a second axis with the same scale last.
- **Measure before you place.** A label goes inside a bar only with padding on both sides. Else move it past the end or into the tooltip. An interior stack segment gets no inline label. Never clip a label with `overflow: hidden`.
- **Position.** At the tip on bars, on the cap on columns, at the end on lines.
- **Y-axis ticks.** Tidy figures (0 / 1,000 / 2,000) with thousands separators. Keep them unless every value carries its own label.
- **Colliding end-labels.** Use leader lines, small multiples, or legend plus tooltip. Above about four converging series, use small multiples.

## Figures

- **Stat tile.** Four fields. `label`: sentence case, no colon. `value`: semibold sans, shortened (1,284 / 12.9K / $4.2M). `delta`, optional: signed, against a named period, colored by direction and whether up is good. `trend`, optional: a sparkline of about 12 points in the de-emphasis hue, the live period in the accent.
- **Meter.** The fill shows severity: accent, then warning, then danger. The empty track is a paler step of the same ramp.
- **Hero figure.** At least 48px, in the body sans the page uses. A display or serif face reads as ornament. One per view.
- **Digits.** Big standalone numbers use proportional figures. `font-variant-numeric: tabular-nums` is for columns: table rows, axis ticks.

## Components

The part kit, in plain HTML and SVG:

- **Tier 0, foundation.** Color roles as CSS custom properties at the top of the file, per palette.md. The texture fill, kept ready. A `<figure>` container that owns responsive sizing, title and caption, and the table-view toggle. Legend (click to isolate; swatches show the texture when active), tooltip, axis, data label.
- **Tier 1, most asked for.** Bar chart: grouped, stacked, horizontal, vertical, thin by default. Line chart: multi-series, optional soft-fill area, accessibility markers. Stat tile. Meter.
- **Tier 2, the rest.** Area chart (stacked, where the band edge is the line). Sparkline. Heatmap. Scale legend for sequential and diverging. Filter and time-range controls. Empty state.

A fixed container height must include the x-axis band, plot plus tick labels. Otherwise the card grows a nested scrollbar. A content-sized container is safer. The stacked bar owns part-to-whole. A pie or donut is for a quick glance only, up to about six segments, never for close values. Small multiples are a layout over these parts, not a part.

## Tooltips and hover

Hover ships with the chart. The bare stat tile is the one exception. A tooltip adds information and never holds the only copy. Everything it shows is also in a direct label or the table view. Keyboard focus reveals what hover does.

- **Crosshair on X.** Line and area charts: a hairline follows the pointer and snaps to the nearest data position.
- **Aim at the mark.** For bars and cells, each bar, segment, dot or cell owns its own tooltip. The tooltip opens on `pointermove` and `focus` and holds the category and the value. A small lift confirms the hover.
- **One tooltip, every series.** The read-out lists all series at the pointer's column.
- **Names are untrusted input.** They come from CSV headers and API payloads. Write them with `textContent` or `createTextNode`, never `innerHTML`.
- **Value first.** The number is bold. The series name is quieter. A short stroke in the series hue marks the row, not a swatch. Legends echo the mark: a rectangle for bars and areas, a line for lines.
- **The hit zone is larger than the mark.** It extends past the paint, through the 2px gap, to 24px or more. For a crowded scatter add a nearest-point (Voronoi) layer.

## Filters

Filters are ordinary interface controls, not chart marks. Build them from ordinary form elements styled to match the chart chrome. The date-picker spec is in [palette.md](palette.md#other-parameters).

- **One row above the charts.** Left-aligned, over everything it governs. Not inside a chart card, not repeated per chart. A chart that needs its own range belongs in a separate dashboard.
- **Date range leads.** Presets first: today, the last 7, 30 or 90 days, month to date. The custom range sits behind them.
- **Everything inherits.** Charts, stats and tables redraw on the same slice.
- **A refetch holds.** During a refetch, charts stay up and dimmed. Never show a skeleton, a reflow or a flash.
