# Reference palette — the agent-knowledge-system instance

Every parameter the data-viz method asks for, filled in for *this* framework. Two
rules decide where each value comes from:

1. **Surfaces and ink are the theme contract's — it is the single source of truth.**
   Chart surface, page plane, primary/secondary/muted ink, borders, and the status
   roles are all the framework's own `--color-*` tokens
   (`astro-doc-code/src/styles/theme.yaml`, `color.css`). Never re-declare them as
   fresh hex: a `site`-mode artifact consumes the token directly, and a `self`-mode
   artifact *derives* its values from the same tokens so it can't drift out of step
   with the docs theme.
2. **Only the categorical / sequential / diverging slots are values of their own** —
   the theme contract carries no chart-series palette, so this file supplies a
   validated one. (The hue set itself is the upstream dataviz reference set, adopted
   as-is and **re-validated against this framework's surfaces** rather than derived
   here.) Every number below was checked on light `#f5f5f5` / dark `#171717` with the
   bundled validator.

Retargeting another theme means swapping the values in this file and re-running
[`../../scripts/validate_palette.js`](../../scripts/validate_palette.js) against that
theme's surfaces.

## How to consume these values

Inside an HTML chart, declare the slots the chart actually uses as CSS variables
inside the chart's own `<style>` block, and let the chart body reference *roles* —
never raw hex scattered through the markup — so a light/dark swap happens in exactly
one place. The surface and ink entries below are the theme's own (spelled out here for
a `self`-mode chart; in `site` mode skip the copies and use the `--color-*` tokens
directly — the route injects them, so `var(--color-bg-secondary)` resolves live, and
`agent-ks theme tokens --json` prints the values to validate against):

```css
.viz-root {
  --surface-1:      #f5f5f5;   /* chart surface  = --color-bg-secondary */
  --text-primary:   #1a1a1a;   /* = --color-text-primary  */
  --text-secondary: #525252;   /* = --color-text-secondary */
  --series-1:       #2a78d6;   /* categorical slot 1 (chart-only value) */
}
@media (prefers-color-scheme: dark) {
  .viz-root {
    --surface-1:      #171717;  /* = --color-bg-secondary (dark) */
    --text-primary:   #fafafa;
    --text-secondary: #a3a3a3;
    --series-1:       #3987e5;
  }
}
:root[data-theme="dark"] .viz-root { /* mirror the dark values so the site toggle wins */ }
```

## Categorical palette (chart-only values)

Both columns are deliberate choices: the dark column re-steps the *same* eight hues
for the dark surface — it is not a second palette.

| Slot | Hue | Light | Dark |
|---|---|---|---|
| 1 | blue | `#2a78d6` | `#3987e5` |
| 2 | aqua | `#1baf7a` | `#199e70` |
| 3 | yellow | `#eda100` | `#c98500` |
| 4 | green | `#008300` | `#008300` |
| 5 | violet | `#4a3aa7` | `#9085e9` |
| 6 | red | `#e34948` | `#e66767` |
| 7 | magenta | `#e87ba4` | `#d55181` |
| 8 | orange | `#eb6834` | `#d95926` |

**Results on this framework's surfaces:**

- **Light, on `#f5f5f5`:** the worst adjacent CVD ΔE comes out at **24.2** —
  comfortably past the ≥12 target. Four slots land under 3:1 contrast against the
  light surface — aqua (2.58), yellow (1.99), magenta (2.47), orange (2.94) — putting
  them in the validator's **relief** band: those series owe visible direct labels or
  the table view.
- **Dark, on `#171717`:** the worst adjacent CVD ΔE is **10.3**, inside the floor
  band — so once a dark-mode chart carries four or more series, back it with direct
  labels or texture. Contrast is clean: all eight slots clear 3:1 on the dark surface.

The slot **order is itself the CVD-safety device**, not a styling preference: it was
found by scoring every candidate ordering and keeping the one whose *smallest*
adjacent ΔE is largest. Swapping in another theme's hues obliges you to repeat that
search.

## Sequential hue

Magnitude defaults to a single **blue** ramp, light → dark. If a second sequential
context shows up on the same surface, it takes the next categorical slot's hue (aqua)
as its own independent one-hue ramp.

| step | hex | step | hex | step | hex |
|---|---|---|---|---|---|
| 100 | `#cde2fb` | 300 | `#6da7ec` | 500 | `#256abf` |
| 150 | `#b7d3f6` | 350 | `#5598e7` | 550 | `#1c5cab` |
| 200 | `#9ec5f4` | 400 | `#3987e5` | 600 | `#184f95` |
| 250 | `#86b6ef` | 450 | `#2a78d6` | 650 | `#104281` |
| | | | | 700 | `#0d366b` |

Use the whole 100→700 span for **sequential** encoding — continuous magnitude in
heatmaps and choropleths — where the palest step stands for "almost nothing" and is
permitted to melt into the surface. A ramp used **ordinally** — discrete, ordered
marks such as funnel stages or tiers (checked with `--ordinal`) — is stricter: its surface-nearest step
still owes 2:1 contrast, and **on this framework's surfaces that floor sits one step
darker than the dataviz default** — on light `#f5f5f5` begin no paler than **step
300** (`#6da7ec`, 2.30:1; step 250 only manages 1.94:1 here), and on dark `#171717`
descend no further than **step 600** (`#184f95`, which still clears 2:1 on the darker
ground). Hold neighboring steps at least 0.06 apart in OKLCH lightness — that is the
`--ordinal` ΔL check.

## Diverging pair

**blue ↔ red**: one warm pole, one cool pole, unmistakably opposed. The midpoint is
the theme's `--color-bg-tertiary` (light `#eeeeee`, dark `#262626`) — intentionally
close to the surface, because the center of a diverging scale has to read as
*absence*. Give both arms the same number of steps. (A blue ↔ aqua pairing fails the
brief: with two cool poles the middle stops reading as neutral.)

## Status palette (from the theme contract — never themed)

The framework's four semantic status tokens *are* the fixed status scale; map them
onto the good → warning → serious → critical framing. Their steps sit deliberately
apart from the categorical slots — a status color must never pass for a series — and
each one always appears with an **icon + label**.

| Role | Token | Light | Dark | Light-surface contrast | Dark-surface contrast |
|---|---|---|---|---|---|
| good | `--color-success` | `#16a34a` | `#22c55e` | 3.02 | 7.87 |
| warning | `--color-warning` | `#ca8a04` | `#eab308` | 2.69 | 9.35 |
| critical | `--color-error` | `#dc2626` | `#ef4444` | 4.43 | 4.76 |
| info | `--color-info` | `#0891b2` | `#06b6d4` | 3.38 | 7.38 |

On the light surface (`#f5f5f5`) **warning falls under 3:1 — by design**: the
mandatory icon + label is the mitigation, so a status color never has to carry its
meaning unassisted. No theme token maps to a distinct "serious" tier between warning
and critical; if a chart genuinely needs four severity levels, derive that step
between `--color-warning` and `--color-error` and check it with the exported
`contrast()` helper.

## Texture fill (the accessibility channel)

A single hand-drawn **"Lines"** fill, drawn at **45° with a 135° mirror — no other
angles**. Its ink is tone-on-tone, taken from a darker step of the ramp it sits on.
Over a value scale the texture must be *ordered*: rotation advances with magnitude,
and which arm leans encodes the diverging sign. It activates from the accessibility
setting, print, or `forced-colors` — it is never ornamental and never the default
state.

## Surfaces (validator inputs)

- Light chart surface: `#f5f5f5` (`--color-bg-secondary`)
- Dark chart surface: `#171717` (`--color-bg-secondary`, dark)

Hand these to the validator as `--surface "#f5f5f5" --mode light` and
`--surface "#171717" --mode dark`. Band and contrast results only mean something
relative to the surface the chart actually sits on — a chart drawn straight on the
page plane (`--color-bg-primary`: light `#fafafa`, dark `#0a0a0a`) gets validated
against *that* instead.

## Chart chrome & ink (all from the theme contract)

| Role | Token | Light | Dark |
|---|---|---|---|
| Chart surface | `--color-bg-secondary` | `#f5f5f5` | `#171717` |
| Page plane | `--color-bg-primary` | `#fafafa` | `#0a0a0a` |
| Subtle tint / track | `--color-bg-tertiary` | `#eeeeee` | `#262626` |
| Primary ink | `--color-text-primary` | `#1a1a1a` | `#fafafa` |
| Secondary ink | `--color-text-secondary` | `#525252` | `#a3a3a3` |
| Muted (axis/labels) | `--color-text-muted` | `#737373` | `#737373` |
| Gridline / border | `--color-border-default` | `#e5e5e5` | `#262626` |
| Hairline / light border | `--color-border-light` | `#f0f0f0` | `#333333` |
| Delta ↑ good | `--color-success` | `#16a34a` | `#22c55e` |

## Filter controls

Filters belong to ordinary UI, not to the chart layer — the chart layer's only stake
is the composition rules in [`interaction.md`](interaction.md). For a date-range
control: presets stacked as rows (today; the last 7, 30, or 90 days; month-to-date),
the active row flagged with a 16px bold check, hover kept to a faint wash so it never
competes with the selection, and the custom range tucked under a hairline at the
footer. A dimension filter is an ordinary combobox.

## Typeface & figures

Every piece of chart text — the hero figure included — is set in the framework's UI
sans, `--font-family-base` (`system-ui, -apple-system, "Segoe UI", …`); display and
serif faces have no place on chart figures. Big standalone numbers (the hero figure,
stat-tile values) keep the font's proportional figures; save
`font-variant-numeric: tabular-nums` for digit columns that must align vertically —
table rows and axis ticks.
