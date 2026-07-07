# Choosing a form

Form is the **first** decision — settle it before you touch color. What picks the
form is the *job* the data has to do for the reader, and one answer is always on the
table: **not a chart**. A single number wrapped in chart furniture is worse than the
number shown plainly.

## First gate — does this even want to be a chart?

Some data reads better as a figure, a tile, or a table than as any plotted mark. Run
this gate before choosing a chart type:

| When the data is… | Show it as | And *not* as |
|---|---|---|
| One current value, maybe with its trend | a **stat tile** — value, delta, sparkline | a bar chart with a single bar |
| A few headline numbers side by side | a **KPI row** of stat tiles | a grouped bar chart |
| The one figure the dashboard is built around | a **hero number** (≥48px, sans) | — |
| One value measured against a limit | a **meter** on a same-hue track | a two-slice pie |
| Roughly eight-plus classes that all matter | a **table**, or a table paired with a chart | still more colors |

Only once the gate says "yes, plot it" do you pick a type.

## Second gate — the job picks the type

Match the reader's task to a default form and a color job in one step:

| The reader needs to… | Reach for | Color does |
|---|---|---|
| Rank magnitudes low → high | bar / column (a **heatmap** for a grid) | sequential, one hue |
| Follow a value over time | line (area for a lone series) | sequential, or one categorical |
| Separate several distinct series | grouped / stacked bar, multi-line | **categorical** |
| See one series against the rest as backdrop | **emphasis** — light up one, gray the others | one hue + gray |
| Read above/below a baseline, or Δ-to-target | diverging bar, or a line against a baseline | diverging |
| Read parts of a whole | **stacked bar** (turn it horizontal when categories are many or long-named) | categorical |
| Read an ordered-scale split (Likert, agree↔disagree) | **diverging stacked bar** centered on neutral | diverging |
| Compare each item's before vs after | dumbbell | one hue, two shades |

## Why the table lands where it does

- **Default to sequential.** A single hue that darkens with magnitude is the form
  that's hardest to misread — legible and consistent every time. Only step off it
  when the job is genuinely *identity* or *polarity*, not mere magnitude.
- **Categorical earns its keep only when the series themselves are the story** — and
  it carries a real hazard: spreading attention across N colors can drown the one
  fact that matters. "This series climbed" is an **emphasis** job, not a categorical
  one.
- **Emphasis is the form people skip and shouldn't.** One series in the accent hue,
  everything else in de-emphasis gray, is usually the honest response to "this chart
  is too busy."
- **Texture is a channel you opt into, never a starting form.** It belongs to
  accessibility (full color-vision-deficiency support), print and export, and
  `forced-colors` — never to decoration. → [`marks-and-anatomy.md`](marks-and-anatomy.md)

## How many series before it breaks (categorical)

The categorical channel degrades as series pile up. The ladder:

| Series | What it takes |
|---|---|
| 1–3 | color alone is comfortable for every viewer; add direct labels |
| 4 | the color-vision-deficiency floor arrives — direct labels stop being optional |
| 5–6 | soft ceiling; lean on a legend or split into small multiples |
| 7–8 | the hard token ceiling; beyond it, roll the tail into "Other", facet into small multiples, or double-encode (hue × shape) |

The one move that's always wrong: minting a new hue to fit a ninth series. A
generated ninth color collapses into an existing slot under color-vision deficiency
and fails every check the palette has to pass.
