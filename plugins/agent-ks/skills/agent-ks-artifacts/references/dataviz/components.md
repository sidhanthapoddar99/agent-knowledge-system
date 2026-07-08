# Components — the chart's part list

Charts here aren't monoliths; each assembles from a small kit of parts, all written
as plain HTML/SVG. The ground everything else stands on is Tier 0. Tier 1 covers the
handful of chart types that account for most requests. Tier 2 holds the rest of the
kit. The System tier is the portable machinery — effectively this reference set
itself.

## Tier 0 — the foundation

- **Color roles.** Eight categorical hues (light and dark value each), the sequential
  ramps, the diverging pairs, four status colors, a de-emphasis / "Other" gray, and
  the grayscale furniture a chart sits on — axis, grid, label, surface. All of them
  live as CSS custom properties declared at the top of the file — see
  [`palette.md`](palette.md).
- **Texture fill.** A single directional hand-drawn fill with its 45° / 135°
  rotations, kept in reserve as the fallback identity channel.
- **Chart container.** A `<figure>` (or card `<div>`) owning three things: responsive
  sizing, the title/caption, and the **table-view toggle** — the accessible twin every
  chart owes its readers. If the container has a fixed height, that height **must
  cover the x-axis band too** (plot *plus* tick labels); get this wrong and the card
  sprouts a nested vertical scrollbar. Letting the container size itself to content is
  safer still.
- **The read-out parts:** a **legend** (click-to-isolate, with swatches that show the
  texture when it's active), a **tooltip**, the **axis**, and the **data label**.

## Tier 1 — what gets asked for most

- **Bar chart.** Grouped and stacked variants, horizontal and vertical, thin bars as
  the default.
- **Line chart.** Multi-series, with an optional soft-fill area variant and
  accessibility markers.
- **Stat tile.** Value + delta + optional sparkline, per the figure contract.
- **Meter / progress track.** The unfilled track is a lighter step of the fill's own
  ramp.

## Tier 2 — the rest of the kit

- **Area chart** (stacked; the band edge doubles as the line) · **sparkline** ·
  **heatmap**
- **Scale legend** for sequential / diverging encodings · **filter and time-range
  controls** · **empty state**

## System tier — the machinery that became the skill

- **The palette validator** —
  [`../../scripts/validate_palette.js`](../../scripts/validate_palette.js).
- **The theming engine** — snaps any design system's ramps onto passing values
  ([`color-formula.md`](color-formula.md)).
- **The form heuristic** — chooses the type, or vetoes the chart
  ([`choosing-a-form.md`](choosing-a-form.md)).
- **The table-view generator** — every chart's WCAG-clean equivalent.

Standing decisions worth knowing: the stacked bar owns part-to-whole, which keeps the
donut deprioritized; small multiples is *layout* draped over these parts rather than
a part itself; and scatter earns a Tier 2 seat only if scatter-heavy surfaces actually
arrive.
