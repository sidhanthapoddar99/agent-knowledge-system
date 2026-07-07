# Components — the pieces a chart is made of

Every chart is assembled from a small kit of parts, built in plain HTML/SVG. Tier 0
is the ground the rest mounts on; Tier 1 is the handful of charts people actually
ask for; Tier 2 rounds out the kit; and the System tier is the portable machinery —
which is, in effect, this reference set itself.

## Tier 0 — the foundation

- **Color roles.** The eight categorical hues (each in a light and dark value),
  the sequential ramps, the diverging pairs, the four status colors, the
  de-emphasis / "Other" gray, and the grayscale furniture the chart is drawn on
  (axis, grid, label, surface). Declare them as CSS custom properties at the top of
  the file — see [`palette.md`](palette.md).
- **Texture fill.** One directional hand-drawn fill plus its 45° / 135° rotations,
  held in reserve as the backup identity channel.
- **Chart container.** A `<figure>` (or a card `<div>`) that carries responsive
  sizing, the title/caption, and the **table-view toggle** — the accessible twin
  every chart owes. **Any fixed height must include the x-axis band** (plot height
  *plus* axis labels), or the card grows a nested vertical scrollbar; better still,
  let the container size to its content.
- **The read-out parts** — a **legend** (click-to-isolate, swatches that show the
  texture), a **tooltip**, the **axis**, and the **data label**.

## Tier 1 — the charts people ask for

- **Bar chart** — grouped and stacked, thin bars by default, horizontal or vertical.
- **Line chart** — multi-series, an optional soft-fill area variant, markers for
  accessibility.
- **Stat tile** — value, delta, and an optional sparkline (the figure contract).
- **Meter / progress track** — built on same-hue ramp tracks.

## Tier 2 — rounding out the kit

- **Area chart** (stacked, with a line drawn on the band edge) · **sparkline** ·
  **heatmap**
- **Scale legend** (sequential / diverging) · **filter / time-range controls** ·
  **empty state**

## System tier — the parts that become the skill

- **The checks validator** — [`../../scripts/validate_palette.js`](../../scripts/validate_palette.js).
- **The theming engine** — snaps a design system's ramps onto passing values
  ([`color-formula.md`](color-formula.md)).
- **The form heuristic** — picks the type, or rules out a chart entirely
  ([`choosing-a-form.md`](choosing-a-form.md)).
- **The table-view generator** — the WCAG-clean equivalent of any chart.

A few standing calls: part-to-whole is served by the stacked bar, so the donut stays
deprioritized; small multiples is a layout applied *over* these parts, not a part of
its own; and scatter graduates into Tier 2 the day scatter-heavy surfaces show up.
