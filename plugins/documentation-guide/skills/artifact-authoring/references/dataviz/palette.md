# Reference palette — the documentation-template instance

This is the **reference instance** of the data-viz method for *this* framework: every
parameter filled in. Two rules govern it:

1. **Surfaces and ink come from the theme contract — it is the single source of
   truth.** The chart surface, page plane, primary/secondary/muted ink, borders, and
   the status roles are the framework's own `--color-*` tokens
   (`astro-doc-code/src/styles/theme.yaml`, `color.css`). Do not re-declare them with
   fresh hex — a `site`-mode artifact consumes the token; a `self`-mode artifact
   *derives* its values from these so it never double-declares with the docs theme.
2. **Only the categorical / sequential / diverging slots are novel values** — the
   theme contract does not ship a chart-series palette, so this file supplies a
   validated one. All numbers below were re-validated against **this framework's
   surfaces** (light `#f5f5f5`, dark `#171717`) with the bundled validator.

To retarget another theme, swap these values and re-run
[`../../scripts/validate_palette.js`](../../scripts/validate_palette.js) against that
theme's surfaces.

## How to use these values

In an HTML chart, define the slots you use as CSS custom properties in a local
`<style>` block, then reference them by role — so light/dark values swap in one place
and the chart body is written against roles, not raw hex. The surface/ink values are
the theme's (shown here for a `self`-mode chart; in `site` mode reference the
`--color-*` tokens directly — the route injects them, so `var(--color-bg-secondary)`
resolves live, and `docs-guide theme tokens --json` prints the values to validate against):

```css
.viz-root {
  --surface-1:      #f5f5f5;   /* chart surface  = --color-bg-secondary */
  --text-primary:   #1a1a1a;   /* = --color-text-primary  */
  --text-secondary: #525252;   /* = --color-text-secondary */
  --series-1:       #2a78d6;   /* categorical slot 1 (novel value) */
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

## Categorical palette (novel values)

Both modes are selected — the dark column is the same eight hues stepped for the dark
surface, not a separate palette:

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

**Validated against this framework's surfaces:**

- **Light on `#f5f5f5`:** worst adjacent CVD ΔE **24.2** (well clear of the ≥12
  target). Four slots sit below 3:1 contrast on the light surface — aqua (2.58),
  yellow (1.99), magenta (2.47), orange (2.94): the **relief rule** applies (ship
  visible direct labels or the table view for those series).
- **Dark on `#171717`:** worst adjacent CVD ΔE **10.3** — the floor band — so
  four-plus series lean on direct labels or texture in dark mode. All eight clear 3:1
  contrast on the dark surface.

The slot **ordering** is the CVD-safety mechanism, not cosmetic — it was derived by
enumerating orderings and keeping the one that maximizes the minimum adjacent ΔE. When
you swap in a different theme's hues, do the same.

## Sequential hue

Default single hue **blue**, light → dark. When two sequential contexts appear at
once, the second takes the next categorical slot's hue (aqua), each as its own one-hue
ramp.

| step | hex | step | hex | step | hex |
|---|---|---|---|---|---|
| 100 | `#cde2fb` | 300 | `#6da7ec` | 500 | `#256abf` |
| 150 | `#b7d3f6` | 350 | `#5598e7` | 550 | `#1c5cab` |
| 200 | `#9ec5f4` | 400 | `#3987e5` | 600 | `#184f95` |
| 250 | `#86b6ef` | 450 | `#2a78d6` | 650 | `#104281` |
| | | | | 700 | `#0d366b` |

The full 100→700 range is for **sequential** encoding (continuous magnitude — heatmaps,
choropleths) where the lightest step means "near zero" and may recede toward the
surface. For an **ordinal** ramp (discrete ordered marks — funnel stages, tiers,
validated with `--ordinal`) the step nearest the surface must still clear 2:1 —
**against this framework's surfaces that floor is one step darker than the dataviz
default**: on light `#f5f5f5`, start no lighter than **step 300** (`#6da7ec`, 2.30:1;
step 250 falls to 1.94:1 here); on dark `#171717`, go no darker than **step 600**
(`#184f95`, which clears 2:1 against the darker surface). Keep adjacent steps ≥ 0.06
apart in OKLCH lightness (the `--ordinal` ΔL check).

## Diverging pair

**blue ↔ red** — warm/cool poles that read as opposite. Neutral midpoint is the
theme's `--color-bg-tertiary` (light `#eeeeee`, dark `#262626`) — it deliberately
sits near the surface so the midpoint reads as "nothing." Equal step count per arm.
(blue↔aqua is rejected — both cool, the midpoint doesn't read as neutral.)

## Status palette (from the theme contract — never themed)

The framework ships four semantic status tokens; use them as the fixed status scale,
mapped onto the good → warning → serious → critical framing. They are deliberately
distinct from the categorical slots, so a status color never impersonates a series,
and each always ships with an **icon + label**.

| Role | Token | Light | Dark | Light-surface contrast | Dark-surface contrast |
|---|---|---|---|---|---|
| good | `--color-success` | `#16a34a` | `#22c55e` | 3.02 | 7.87 |
| warning | `--color-warning` | `#ca8a04` | `#eab308` | 2.69 | 9.35 |
| critical | `--color-error` | `#dc2626` | `#ef4444` | 4.43 | 4.76 |
| info | `--color-info` | `#0891b2` | `#06b6d4` | 3.38 | 7.38 |

On the light surface (`#f5f5f5`) **warning sits below 3:1 by design** — the icon +
label pairing is the mitigation, so a status color never carries meaning alone. A
distinct "serious" tier (between warning and critical) has no dedicated theme token;
derive it from a step between `--color-warning` and `--color-error` if a chart truly
needs four severity levels, and validate it with the exported `contrast()` helper.

## Texture fill (the accessibility channel)

One hand-drawn **"Lines"** fill, at **45° and its 135° mirror only**. Inked
tone-on-tone (a darker step of the fill's own ramp). On value scales it is *ordered*
(rotation steps with magnitude; arm angle carries the diverging sign). Triggered by
the accessibility setting, print, or `forced-colors` — never decorative, never on by
default.

## Surfaces (for the validator)

- Light chart surface: `#f5f5f5` (`--color-bg-secondary`)
- Dark chart surface: `#171717` (`--color-bg-secondary`, dark)

Pass these to the validator: `--surface "#f5f5f5" --mode light` and
`--surface "#171717" --mode dark`. Contrast and band results are only meaningful
against the surface the chart actually renders on — if a chart card sits on the page
plane (`--color-bg-primary`: light `#fafafa`, dark `#0a0a0a`) rather than a card, pass
that instead.

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

Filters are standard UI, not chart components — the chart layer only adds the
composition rules in [`interaction.md`](interaction.md). A date-range control is a list
of preset rows (today, last 7/30/90 days, month-to-date) with selection marked by a
16px bold check, hover as a ghost wash, and a custom range behind a hairline in the
footer. Dimension filters are a standard combobox.

## Typeface & figures

Everything — including the hero figure — stays in the framework's UI sans:
`--font-family-base` (`system-ui, -apple-system, "Segoe UI", …`). No display or serif
face on chart figures. Large standalone numbers (hero figure, stat-tile values) use
the default proportional figures; reserve `font-variant-numeric: tabular-nums` for
columns that must align vertically (table rows, axis ticks).
