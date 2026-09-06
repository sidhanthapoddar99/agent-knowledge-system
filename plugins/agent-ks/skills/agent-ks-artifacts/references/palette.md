# Reference palette: the agent-knowledge-system instance

Every parameter the dataviz method asks for, filled in for this framework. The method is in [dataviz.md](dataviz.md). The color rules are in [dataviz-color.md](dataviz-color.md).

## Two rules

| Rule | Detail |
|---|---|
| Surfaces and ink come from the theme contract | The chart surface, the page plane, the three inks, borders and the status roles are the framework's own `--color-*` tokens. For the values, run `agent-ks theme tokens --json`; the declaring files are `@root/agent-ks-engine/src/styles/theme.yaml` and `color.css`. Never re-declare them as fresh hex. A `site` artifact consumes the token. A `self` artifact derives its values from the same tokens, so it cannot drift from the docs theme. |
| Only the categorical, sequential and diverging slots are own values | The contract carries no chart-series palette, so this file supplies a validated one. Every value below was checked on light `#f5f5f5` and dark `#171717` with the bundled validator. |

To retarget another theme, swap the values in this file and re-run [validate_palette.js](../scripts/validate_palette.js) against that theme's surfaces.

## Consume the values

Declare the slots the chart uses as CSS variables in the chart's own `<style>` block. Let the chart body reference roles, never raw hex, so a light/dark swap happens in one place. In `self` mode spell the surface and ink out as below. In `site` mode skip the copies. The route injects the tokens, so `var(--color-bg-secondary)` resolves live, and `agent-ks theme tokens --json` prints the values to validate against.

```css
.viz-root {
  --surface-1:      #f5f5f5;   /* chart surface = --color-bg-secondary */
  --text-primary:   #1a1a1a;   /* = --color-text-primary */
  --text-secondary: #525252;   /* = --color-text-secondary */
  --series-1:       #2a78d6;   /* categorical slot 1, a chart-only value */
}
@media (prefers-color-scheme: dark) {
  .viz-root { --surface-1: #171717; --text-primary: #fafafa; --text-secondary: #a3a3a3; --series-1: #3987e5; }
}
:root[data-theme="dark"] .viz-root { /* mirror the dark values so the site toggle wins */ }
```

## Categorical palette

Both columns are deliberate. The dark column re-steps the same eight hues for the dark surface. It is not a second palette.

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

Results on this framework's surfaces:

| Mode | Worst adjacent CVD ΔE | Contrast | Obligation |
|---|---|---|---|
| Light, `#f5f5f5` | 24.2, past the ≥ 12 target | Four slots under 3:1: aqua 2.58, yellow 1.99, magenta 2.47, orange 2.94 | Those series carry visible direct labels or the table view |
| Dark, `#171717` | 10.3, inside the 8–12 floor band | All eight clear 3:1 | At four or more series, add direct labels or texture |

The slot order is what keeps the palette safe for colour vision deficiency (CVD). It is not a styling preference. It came from scoring every candidate ordering and keeping the one whose smallest adjacent ΔE is largest. Another theme's hues need that search again. See [dataviz-color.md](dataviz-color.md#slot-order).

## Sequential ramp

Magnitude uses one blue ramp, light to dark. A second sequential context on the same surface takes the next categorical slot's hue, aqua, as its own one-hue ramp.

| Step | Hex | Step | Hex | Step | Hex |
|---|---|---|---|---|---|
| 100 | `#cde2fb` | 300 | `#6da7ec` | 500 | `#256abf` |
| 150 | `#b7d3f6` | 350 | `#5598e7` | 550 | `#1c5cab` |
| 200 | `#9ec5f4` | 400 | `#3987e5` | 600 | `#184f95` |
| 250 | `#86b6ef` | 450 | `#2a78d6` | 650 | `#104281` |
| | | | | 700 | `#0d366b` |

Sequential encoding (continuous magnitude in a heatmap or a choropleth) uses the whole 100–700 span. The palest step means "almost nothing" and may blend into the surface. An ordinal ramp (discrete ordered marks, checked with `--ordinal`) is stricter. Its step nearest the surface must still reach 2:1 contrast.

| Mode | Floor | Reason |
|---|---|---|
| Light, `#f5f5f5` | Begin no paler than step 300 (`#6da7ec`, 2.30:1) | Step 250 gives 1.94:1, under the 2:1 floor |
| Dark, `#171717` | Descend no further than step 600 (`#184f95`, 2.21:1) | Step 650 gives 1.81:1 |

Adjacent 50-steps sit about 0.05 apart in OKLCH lightness, under the `--ordinal` check of ΔL ≥ 0.06. Take every second step (100, 200, 300 …) for an ordinal ramp.

## Diverging pair

Blue ↔ red: one cool pole, one warm pole. The midpoint is the theme's `--color-bg-tertiary` (light `#eeeeee`, dark `#262626`). It sits close to the surface on purpose, because the center of a diverging scale reads as absence. Give both arms the same number of steps. Blue ↔ aqua fails. With two cool poles the middle stops reading as neutral.

## Status palette

The four semantic tokens are the fixed status scale. Map them onto the four levels: good, warning, serious, critical. Each always appears with an icon and a label.

| Role | Token | Light | Dark | Light contrast | Dark contrast |
|---|---|---|---|---|---|
| good | `--color-success` | `#16a34a` | `#22c55e` | 3.02 | 7.87 |
| warning | `--color-warning` | `#ca8a04` | `#eab308` | 2.69 | 9.35 |
| critical | `--color-error` | `#dc2626` | `#ef4444` | 4.43 | 4.76 |
| info | `--color-info` | `#0891b2` | `#06b6d4` | 3.38 | 7.38 |

Warning falls under 3:1 on the light surface by design. The mandatory icon and label carry the meaning. No token maps to a "serious" tier between warning and critical. When a chart needs four severity levels, derive that step between `--color-warning` and `--color-error`. Check it with the exported `contrast()` helper.

## Chart chrome and ink

All from the theme contract.

| Role | Token | Light | Dark |
|---|---|---|---|
| Chart surface | `--color-bg-secondary` | `#f5f5f5` | `#171717` |
| Page plane | `--color-bg-primary` | `#fafafa` | `#0a0a0a` |
| Subtle tint, meter track | `--color-bg-tertiary` | `#eeeeee` | `#262626` |
| Primary ink | `--color-text-primary` | `#1a1a1a` | `#fafafa` |
| Secondary ink | `--color-text-secondary` | `#525252` | `#a3a3a3` |
| Muted (axis, labels) | `--color-text-muted` | `#737373` | `#737373` |
| Gridline, border | `--color-border-default` | `#e5e5e5` | `#262626` |
| Hairline, light border | `--color-border-light` | `#f0f0f0` | `#333333` |
| Delta up, good | `--color-success` | `#16a34a` | `#22c55e` |

The chart surface is the validator input: `--surface "#f5f5f5" --mode light` and `--surface "#171717" --mode dark`. Band and contrast results hold only relative to the surface the chart sits on. A chart drawn on the page plane is validated against the page plane.

## Other parameters

| Parameter | Value |
|---|---|
| Texture fill | One hand-drawn "Lines" fill at 45° with its 135° mirror; the rules are in [dataviz-color.md](dataviz-color.md#texture) |
| Chart typeface | `--font-family-base` (`system-ui, -apple-system, "Segoe UI", …`) for every piece of chart text, the hero figure included; the figure rules are in [dataviz.md](dataviz.md#figures) |
| Filter controls | Ordinary UI, composed per [dataviz.md](dataviz.md#filters). The date picker stacks its presets as rows. A bold 16px check marks the active row. Hover is a faint wash. The custom range sits under a hairline in the footer. A dimension filter is a plain combobox. |
