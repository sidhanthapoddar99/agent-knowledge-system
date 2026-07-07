# Data visualization — the procedure

Open this file the moment an artifact acquires plotted data of any kind — a chart, a
stat tile, a meter. People read charts; you draw them. That asymmetry is why this
reference replaces "make it look good" with an ordered procedure plus machine checks:
correctness gets built in up front instead of judged afterward.

**Nothing in the method belongs to any one design system.** The step order, the form
heuristic, the checks, and the mark specs hold no matter whose palette is in play — a
design system contributes only *parameters*: ramps, an order for the categorical
hues, a diverging pair, a status set, its surfaces. For *this* framework the filled-in parameter file is
[`palette.md`](palette.md) — surfaces and ink read off the theme contract, joined to a
validated categorical/sequential/diverging set. Retargeting means editing that one
file's values; everything else stays untouched.

> If a single habit survives from this page: **palette safety is arithmetic, so do the
> arithmetic.** Whether a palette survives color-vision deficiency is never a judgment
> call by eye — it is the question
> [`../../scripts/validate_palette.js`](../../scripts/validate_palette.js) exists to
> answer.

## Seven steps, in this order

Color arrives **last**. Charts usually go wrong because color arrived first.

1. **Settle the form.** Ask what job the data does for the reader — magnitude?
   identity? polarity? one headline figure? movement over time? The job selects the
   type, and occasionally it rules out a chart altogether (a stat tile or a hero
   number instead). → [`choosing-a-form.md`](choosing-a-form.md)
2. **Give every color a job.** Identity → categorical; magnitude → sequential;
   polarity → diverging; state → status. Each job carries exactly one rule — and
   categorical hues are dealt in a frozen order, never wrapped around. →
   [`color-formula.md`](color-formula.md)
3. **Put the palette through the validator — no hand-reasoning about ΔE.**
   `node ../../scripts/validate_palette.js "<hex,hex,…>" --mode light` — or embed it
   in the chart's own page as a `<script type="module">`, where it picks up
   `data-palette` from `<body>` and prints a `console.table`. It scores the lightness
   band, the chroma floor, adjacent-pair CVD separation, and contrast. Clear every
   FAIL, then repeat with `--mode dark` against the dark surface.
4. **Draw to the mark specs.** Slim marks; 4px rounding at the data end with a square
   baseline; 2px line strokes; markers no smaller than 8px; a 2px band of surface
   color wherever fills touch and a 2px surface ring wherever marks overlap; labels
   placed sparingly. → [`marks-and-anatomy.md`](marks-and-anatomy.md)
5. **Wire up hover as standard equipment.** HTML/SVG output is interactive by nature:
   line and area charts carry a crosshair with a tooltip, bar/dot/cell charts carry
   per-mark tooltips. The bare stat tile is the lone exception. →
   [`interaction.md`](interaction.md)
6. **Close with the accessibility sweep.** At two or more series the legend is
   non-optional, and up to four series also get direct labels — identity never rides
   on color alone. A table view exists. Dark mode is a **choice**: fresh steps off the
   same ramps, validated on the dark surface, never a mechanical flip. Texture stands
   by for the CVD / print / forced-colors case.
7. **Open the render and use your eyes.** Layout sits outside the validator's remit —
   screenshot or open the output and hunt for colliding labels, broken geometry, and
   overflow before declaring the chart done.

Finish by holding the result against [`anti-patterns.md`](anti-patterns.md) — the
inventory of known failure modes. Matching any entry means the chart is wrong.

## Invariants — no design system changes these

- **Categorical hues are dealt in a frozen order and never wrapped around.** A ninth
  hue is never minted; series nine gets swept into "Other", becomes a small-multiples
  facet, or picks up a second encoding channel.
- **One axis per plot.** Two y-scales on one chart is banned outright; measures on
  different scales become two charts, small multiples, or get indexed to a shared
  base. *(Anti-patterns opens with this — it's the single most frequent chart error.)*
- **A hue belongs to its entity, not its position.** Filtering series away must leave
  the survivors' colors exactly where they were.
- **Magnitude = a single hue stepped light → dark; polarity = two opposing hues
  meeting at a neutral gray middle.** Rainbows are out, and the center of a diverging
  scale is never a hue.
- **No categorical palette ships unvalidated.** The CVD target is ≥ 12; the 8–12 band
  is tolerable only when a secondary encoding rides along. A contrast WARN creates an
  obligation — visible labels or the table view — not a judgment call.
- **Slim marks; a legend whenever series ≥ 2 (never for one); labels rationed, never
  one per point; grid and axes kept quiet.**
- **Type is inked with text tokens, never with a series hue** — values, labels, and
  legend text stay in primary/secondary/muted ink while a colored mark alongside does
  the identifying.
- **The status scale is off-limits to ordinary series** — good/warning/serious/
  critical keep their reserved meaning, and always travel with an icon + label rather
  than color alone.

## What a design system plugs in

Only the parameters below vary between systems; the machinery doesn't.
[`palette.md`](palette.md) is the worked example, every row filled from the theme
contract.

| Parameter | What the system contributes |
|---|---|
| **Ramps** | the named-step hue scales the palette is built from |
| **Categorical order** | the frozen hue sequence (a named theme), plus any alternates |
| **Sequential hue** | the single default hue that encodes magnitude |
| **Diverging pair** | a warm/cool pole pair with a neutral middle |
| **Status palette** | good / warning / serious / critical, on steps kept apart from the categorical slots |
| **Texture fill** | one directional fill, applied at 45° / 135° |
| **Surfaces** | the light and dark chart surfaces (validator inputs) |
| **Filter controls** | date-range and dimension pickers (behaviour spec: `interaction.md`) |

Onboarding a system: fill the rows, run its ramps through the validator, and snap
every slot to the nearest step that passes. Nothing structural moves.

## Reference files

| File | Question it settles |
|---|---|
| [`choosing-a-form.md`](choosing-a-form.md) | picking the type — or ruling out a chart entirely |
| [`color-formula.md`](color-formula.md) | the four color jobs, the checks, snapping to a passing step |
| [`marks-and-anatomy.md`](marks-and-anatomy.md) | mark specs, the two spacers, labels, figures, the hero number |
| [`interaction.md`](interaction.md) | hover + tooltips, filters + time ranges |
| [`components.md`](components.md) | the part list a chart assembles from, each in plain HTML |
| [`anti-patterns.md`](anti-patterns.md) | **the failure catalog — audit every chart against it** |
| [`palette.md`](palette.md) | **the filled-in parameter file** — this framework's instance |
| [`../../scripts/validate_palette.js`](../../scripts/validate_palette.js) | the executable checks (never judged by eye) |
