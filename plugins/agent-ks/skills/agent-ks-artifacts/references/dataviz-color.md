# Data visualization: color and the validator

Nobody hand-picks chart color. Each color in a chart holds exactly one job. No palette is allowed until it passes the checks in this file. The checks let you swap a palette safely and let one method drive any design system's ramps. The procedure that calls this file is [dataviz.md](dataviz.md). The values for this framework are in [palette.md](palette.md).

Terms: CVD is color-vision deficiency. ΔE is the color distance the validator computes. A series is one set of values drawn as marks.

## The color jobs

| Job | Stands for | Build |
|---|---|---|
| Categorical | Which series: identity | Eight hues in a fixed order, assigned one by one, never reused |
| Ordinal | A step in an ordered sequence: funnel step, tier, bucket | One hue stepped through lightness. The lightest step keeps ≥ 2:1 on the surface |
| Sequential | How much: magnitude | One hue light to dark; the anchor inverts in dark mode |
| Diverging | Which side of a baseline: polarity | Two hues bridged by a neutral gray, stepped evenly down each arm |
| Status | A state from good to critical | A short fixed scale with reserved meaning, never without an icon and a label |

To tell categorical from ordinal, test whether a reorder changes the meaning. When it does (funnel stages, S/M/L tiers, age brackets), the data is ordinal. Give it a one-hue ramp. When it does not (products, teams, regions), the data is nominal categorical. One series takes slot 1's hue with no legend box, and N series take slots 1..N. Never shade nominal bars by their value. That uses the identity channel to repeat what bar length already shows.

## Pick the job

- **Default to sequential.** Leave it only for identity or polarity.
- **Categorical only when the series are the story.** "This series climbed" is an emphasis job: one series in the accent, the rest in gray. Eight hues for a one-number story is the most frequent chart error. Emphasis is also the answer to "this chart is too busy".
- **A hue belongs to its entity,** never to its position. A filter leaves the survivors' colors in place.
- **Never a rainbow.** Magnitude is one hue, light to dark. A multi-hue sequential is allowed only for neighbouring hues or a semantic heat scale, and then it ships a scale legend.
- **The middle of a diverging scale is never a hue.** Two opposing hues with a neutral gray between them.
- **The [series ladder](#series-ladder) caps the count.** A ninth hue is never created.

## The six checks

Every categorical color, shipping or proposed, clears all six.

| Check | Threshold | Enforced by |
|---|---|---|
| 1. Fixed hue anchors | Eight hue families in one unchanging order; the order is the CVD guarantee | Structure |
| 2. Lightness band | OKLCH L 0.43–0.77 in light, 0.48–0.67 in dark | Validator |
| 3. Chroma floor | OKLCH C ≥ 0.10; below it a hue reads as gray | Validator |
| 4. CVD separation | Machado-2009 ΔE ≥ 12 target, ≥ 8 floor, under protanopia and deuteranopia. The floor is allowed only with a secondary encoding. Check adjacent pairs where only neighbors touch: stacks, bars, lines. Check every pair where any two marks can touch: scatter, bubble, choropleth, small multiples. For those, use `--pairs all`. | Validator |
| 5. Contrast against the surface | Marks ≥ 3:1. Relaxed only when a visible label or the table view carries the value | Validator |
| 6. Documented palette only | Every slot traces to a hex in palette.md. Nothing is picked by eye | Structure |

## Run the validator

```
node <skill>/scripts/validate_palette.js \
  "#2a78d6,#1baf7a,#eda100,#008300,#4a3aa7,#e34948,#e87ba4,#eb6834" \
  --mode light --surface "#f5f5f5"
```

Resolve `<skill>` against this skill's own folder, the parent of `references/`. Your working directory is the project root, not `references/`, so a path relative to this file fails. `--surface` is the light chart surface from palette.md. To run inside the chart's page, load [validate_palette.js](../scripts/validate_palette.js) as `<script type="module">`. It reads `data-palette`, `data-mode` and `data-surface` from `<body>` and prints a `console.table`.

| Result | Meaning | Exit |
|---|---|---|
| PASS | The check holds | 0 |
| WARN, CVD 8–12 | Allowed only with a secondary encoding: direct labels, gaps or texture | 0 |
| WARN, contrast under 3:1 | A relief channel is mandatory: a visible direct label or the table view. Shipped with neither, it is a fail. | 0 |
| FAIL | Fix the palette | 1 |

Run once per mode: `--mode dark --surface "#171717"`. Add `--pairs all` for scatter, bubble, map and small multiples. Run an ordinal ramp with `--ordinal`. That flag swaps in the ramp checks: monotone L, adjacent ΔL ≥ 0.06, light-end contrast ≥ 2.0:1, one hue throughout.

## Scope of the checks

The six checks judge a categorical palette: series identity. They say nothing about a lone status or text color, or about a ramp.

| Color | Check with |
|---|---|
| A single status or text color | WCAG text contrast: 4.5:1 for body text, 3:1 for large. The script exports `contrast(a, b)` for this. |
| A sequential or diverging ramp | Lightness rises at every step. The categorical validator FAILs a ramp on purpose. Leave a good ramp alone. |

## Snap to passing

To fit the method to any design system's own ramps:

1. Per slot, take the step whose OKLCH L sits inside the mode's band with C above the floor.
2. Validate. Where an adjacent pair lands under ΔE 12, shift one slot by one step: same hue, new lightness. Validate again.
3. Repeat until the tightest adjacent pair clears the floor. The system's own hues stay untouched.

## Slot order

Which hue takes which slot is a named decision, a theme, layered on the same hues under the same checks. Each surface picks one theme and locks it. Two themes never share a dashboard. When a system has no order yet, do not guess. List the candidate orderings, validate each, and keep the one whose smallest adjacent CVD ΔE is largest.

## Series ladder

The categorical channel loses power as the series count grows.

| Series | What it takes |
|---|---|
| 1–3 | Hue alone works for every viewer. Add direct labels |
| 4 | The CVD floor. Direct labels stop being optional |
| 5–6 | Soft ceiling. Use a legend or split into small multiples |
| 7–8 | Hard ceiling. Beyond it, fold the tail into "Other", use small multiples, or double-encode hue × shape |

## Status

Status stands apart from the theme. Its levels are good, warning, serious, critical. Its steps sit clear of the categorical slots. It always shows with an icon and a label. A series whose meaning is good or bad (error rate, pass/fail) draws from status tokens. A series that is merely fourth in line draws from categorical. One chart never mixes the two. The mapping to `--color-success`, `-warning`, `-error` and `-info` is in [palette.md](palette.md#status-palette).

## Ink

Text takes the text tokens: primary, secondary or muted ink. Never color a value, a label, a legend entry or an axis in a series hue. The colored mark beside the text identifies the series. One exception: a label inside a fill switches between white and ink according to the fill's lightness.

## Texture

Texture is the fallback identity channel for deep CVD, grayscale print and `forced-colors`. Use one directional hand-drawn fill at 45° plus its 135° mirror, and no other angle. Horizontal and vertical read as gridlines or bars. Draw it in a darker step of the fill's own ramp, with the same strength on every slot. Over a value scale the texture is ordered. Rotation advances with magnitude, and the lean encodes the diverging sign. It switches on from the accessibility toggle, in print, or under `forced-colors`. The resting state is off. Texture is never decoration.

## What a design system plugs in

The method does not depend on any one design system. Only these parameters vary. The machinery does not. palette.md is the filled-in file.

| Parameter | The system contributes |
|---|---|
| Ramps | The named-step hue scales the palette is built from |
| Categorical order | The fixed hue sequence, a named theme, plus any alternates |
| Sequential hue | The single default hue for magnitude |
| Diverging pair | A warm pole and a cool pole with a neutral middle |
| Status palette | Good, warning, serious, critical on steps apart from the categorical slots |
| Texture fill | One directional fill at 45° and 135° |
| Surfaces | The light and dark chart surfaces, the validator inputs |

To add a system, fill the rows. Run its ramps through the validator. Snap every slot to the nearest passing step. The structure does not change.
