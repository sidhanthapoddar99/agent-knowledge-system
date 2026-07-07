# Data visualization — the procedure

Load this the moment an artifact has a chart, a stat tile, a meter, or any plotted
data. A chart is **read by people and drawn by you**, so this turns "make it look
good" into a procedure with checks — the result is right by construction, not by
taste.

**The method is design-system-agnostic.** The procedure, the form heuristic, the
checks, and the mark specs don't depend on any one palette. A design system only
supplies *parameters* — its ramps, a categorical order, a diverging pair, a status
palette, its surfaces. The reference instance for *this* framework — surfaces and
ink derived from the theme contract, with a validated categorical/sequential/
diverging set — is [`palette.md`](palette.md). To retarget, read that file's
structure and swap its values; touch nothing else.

> The one habit that matters most: **color is computable, so compute it.** Never
> eyeball whether a palette is colorblind-safe — run
> [`../../scripts/validate_palette.js`](../../scripts/validate_palette.js).

## The procedure — in order

Color comes **last**. Most bad charts pick color first.

1. **Pick the form.** What is the data's job — magnitude, identity, polarity, a
   single headline, change over time? The job picks the type, and sometimes the
   right answer is *not a chart* (a stat tile or a hero number). →
   [`choosing-a-form.md`](choosing-a-form.md)
2. **Assign color by the job it does.** Categorical (identity), sequential
   (magnitude), diverging (polarity), or status (state) — each has one rule. Assign
   categorical hues in a fixed order, never cycled. → [`color-formula.md`](color-formula.md)
3. **Validate the palette — run the script, don't reason about ΔE.**
   `node ../../scripts/validate_palette.js "<hex,hex,…>" --mode light` (or load it as
   a `<script type="module">` in the chart's own page, where it reads `data-palette`
   off `<body>` and logs a `console.table`). It reports the lightness band, the
   chroma floor, adjacent-pair CVD separation, and contrast. Fix any FAIL before
   continuing, then re-run `--mode dark` against the dark surface.
4. **Apply the mark specs and spacers.** Thin marks, 4px rounded data-ends anchored
   to the baseline, 2px lines, ≥8px markers, a 2px surface gap between touching
   fills, a 2px surface ring on overlapping marks, selective direct labels. →
   [`marks-and-anatomy.md`](marks-and-anatomy.md)
5. **Add the hover layer — by default.** An HTML/SVG chart *is* interactive: ship a
   crosshair + tooltip on line/area and a per-mark tooltip on bar/dot/cell. Only a
   bare stat tile skips it. → [`interaction.md`](interaction.md)
6. **Final accessibility pass.** For ≥2 series a legend is always present, and ≤4
   are also direct-labeled, so identity is never color-alone; a table view exists;
   dark mode is **selected** (its own steps from the same ramps, validated against
   the dark surface — never an auto-flip); texture is available for the CVD / print /
   forced-colors case.
7. **Render it and look at it.** The validator checks color, not layout — open or
   screenshot the output and eyeball it for label collisions, geometry, and overflow
   before calling it done.

Then check the result against [`anti-patterns.md`](anti-patterns.md) — the catalog
of what goes wrong. If your chart matches an entry, it's wrong.

## Non-negotiables (true in every design system)

- **Assign categorical hues in a fixed order, never cycled.** A 9th series is never a
  generated hue — fold it into "Other," small multiples, or a composite encoding.
- **One axis.** Never a dual-axis chart (two y-scales). Two measures of different
  scale → two charts, small multiples, or index both to a common base. *(The #1
  chart mistake — see anti-patterns.)*
- **Color follows the entity, never its rank.** A filter that changes the series
  count must not repaint the survivors.
- **Sequential = one hue, light → dark. Diverging = two hues + a neutral gray
  midpoint.** Never a rainbow; never a hue at the diverging midpoint.
- **Run the validator before shipping any categorical palette.** CVD ≥ 12 is the
  target; 8–12 is a floor that is legal only *with* a secondary encoding. A contrast
  WARN obligates visible labels or a table view — it is not dismissable.
- **Thin marks; a legend always present for ≥2 series (none for one); selective
  direct labels (never a number on every point); recessive grid/axes.**
- **Text wears text tokens, never the series color** — values, labels, and legends
  stay in primary/secondary/muted ink; the colored mark beside them carries identity.
- **Status colors are reserved** (good/warning/serious/critical) and never reused for
  "series 4"; they always ship with an icon + label, never color alone.

## Plugging in a design system

The method is invariant; only these parameters change per system. The reference
instance — every value filled in from the theme contract — is [`palette.md`](palette.md).

| Parameter | What the system supplies |
|---|---|
| **Ramps** | the hue scales (named steps) the palette draws from |
| **Categorical order** | the fixed hue order (a named theme); default + alternates |
| **Sequential hue** | the default single hue for magnitude |
| **Diverging pair** | two warm/cool poles + a neutral midpoint |
| **Status palette** | good / warning / serious / critical, steps distinct from categorical |
| **Texture fill** | one directional fill, at 45° / 135° |
| **Surfaces** | light & dark chart-surface colors (the validator needs these) |
| **Filter controls** | date-range & dimension controls (behaviour in `interaction.md`) |

To onboard a system: fill those rows, feed its ramps to the validator, and let it
snap each slot to the nearest passing step. Structure and rules stay as written.

## Reference files

| File | What it answers |
|---|---|
| [`choosing-a-form.md`](choosing-a-form.md) | Which chart type — or is it even a chart? |
| [`color-formula.md`](color-formula.md) | The four jobs, the six checks, snap-to-passing |
| [`marks-and-anatomy.md`](marks-and-anatomy.md) | Mark specs, spacers, labels, figures, the hero number |
| [`interaction.md`](interaction.md) | Tooltips & hover, filters & time ranges |
| [`components.md`](components.md) | The pieces a chart is made of — build each in plain HTML |
| [`anti-patterns.md`](anti-patterns.md) | **What goes wrong — check every chart against this** |
| [`palette.md`](palette.md) | **The reference palette instance** — every parameter, filled in from the theme |
| [`../../scripts/validate_palette.js`](../../scripts/validate_palette.js) | The runnable checks (run it; don't eyeball) |
