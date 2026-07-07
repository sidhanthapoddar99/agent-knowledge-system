# Interaction — tooltips & filters

An HTML chart arrives interactive; the hover layer is something you deliver, not a
follow-up enhancement. Skipping it is the rare exception — a bare stat tile — never
where you begin, so give it the craft you'd give the still frame.

## Tooltips & hover

The rule that governs all of it: a tooltip **supplements, it never gates**. Whatever a
tooltip surfaces is obtainable another way too — a direct label, or the table view —
and focusing with the keyboard reveals precisely what hovering does.

- **Line and area charts get a crosshair on the X.** A vertical hairline trails the
  pointer and clicks onto the closest data position, so the reader targets a date
  instead of a 2px stroke.
- **On bars and cells, aim at the mark itself.** Drop the crosshair here and let each
  bar, segment, dot, or heat-cell own its `pointermove` / `focus` tooltip carrying the
  category and value; a small lift on the hovered mark (a nudge in lightness or an
  outline) confirms it heard the pointer.
- **A single tooltip speaks for every series at that X.** The read-out enumerates all
  series at the pointer's column, so nobody must land exactly on a line or fill to
  extract a value.
- **Names are untrusted input — set them with `textContent`.** Series and category
  names come out of CSV headers, tool output, and API payloads; write them into
  tooltip, legend, and table DOM through `textContent` / `createTextNode`, and keep
  them out of `innerHTML` string joins.
- **Lead with the value, trail the name.** In a tooltip the number is the bold,
  high-contrast piece and the series name recedes — the inverse of a legend, because by
  now the reader has the series and is after the figure.
- **Mark series with a stroke, not a swatch.** A tooltip row tags its series with a
  short line of the series color; at this density a filled box is heavy ink doing a
  label's work. (Legends keep echoing the mark — a rectangle for bars and areas, a line
  for lines.)
- **The target is wider than the mark.** A mark's hover/focus zone spills past the
  painted pixels, out through the 2px surface gap and a touch beyond. Nobody reliably
  spears an 8px scatter dot — hand every point a transparent target of **24px** or
  more, and for crowded scatter add a nearest-point / Voronoi layer so being *closest*
  suffices and pixel-perfect aim doesn't.
- **A value that won't ride its mark moves to the tooltip.** Where a label can't fit a
  small bar (see [`marks-and-anatomy.md`](marks-and-anatomy.md)), let that bar's hit
  zone surface the value on hover and focus, with the table view keeping it available
  even without any hover.

## Filters & time ranges

Every monitoring dashboard reaches for the same set of controls. Treat them as **plain
UI, not chart marks** — build them from ordinary HTML form elements dressed to match
the chart chrome. Dataviz contributes only the composition rules:

- **One row, sitting above the charts.** Filters occupy a single left-aligned row over
  whatever they govern — not tucked into a chart card, not duplicated per chart. A
  chart that needs its own range wants a separate dashboard.
- **Date range leads.** It's the control readers grab first; front it with presets
  (today, last 7 / 30 / 90 days) and stash the custom range behind them.
- **Whatever's below inherits the filter.** Charts, stats, and tables all redraw on the
  identical slice, so their numbers can never quietly diverge.
- **A refetch holds its ground.** As fresh data loads, the charts stay up at reduced
  opacity — no skeleton, no reflow, no flicker.

A capable date picker stacks its presets as rows (a calendar grid is a poor way to ask
for "last 30 days"), flags the active one with a 16px bold check, keeps hover to a
faint wash so it never fights the selection, and hides the custom range under a
hairline down in the footer. (The reference spec lives in [`palette.md`](palette.md).)
