# Anti-patterns — what goes wrong

Audit every chart against this catalog. If it matches an entry, it's broken — repair
it before it ships. These aren't hypotheticals; each one was caught in a shipping
dashboard.

## Color & encoding

**❌ Two y-scales sharing one plot (dual-axis).** Because the scales align by nothing
but chance, the picture invents a relationship the numbers don't hold — plot Users
against Sessions when one runs 0–30k and the other 0–800k and reviewers call it
"hallucinated". ✅ Break it into two charts or small multiples; or rebase both series
to =100 at t0 and keep them on a **single** axis.

**❌ Colors assigned by live rank, so a filter repaints the survivors.** Drop one
series and everyone left shifts hue — the reader who memorized "Acme is blue" is now
reading a lie. ✅ Pin each hue to its entity rather than its row position; survivors
never change color.

**❌ Reaching past eight hues, by cycling or by generating a new one.** The ninth slot
can't be told apart from an existing one under color-vision deficiency, and it voids
the fixed-order check. ✅ Collapse the tail into "Other", break out small multiples, or
add a second encoding channel.

**❌ Judging colorblind-safety by eye** ("close enough to tell apart"). ✅ Let the
validator decide: adjacent ΔE at 12 or better, or in the 8–12 band *only* when a
secondary encoding backs it up.

**❌ Shading nominal categories by their value.** Making each bar darker as it grows,
where the categories carry no inherent order (products, teams, endpoints), re-paints
magnitude that the bar length already states and blows the categorical checks by
design. ✅ Give every bar of a single series the same slot-1 hue; for categories that
*are* ordered (funnels, tiers, age bands), switch to the ordinal ramp and validate it
with `--ordinal`.

**❌ Spanning several hues to show magnitude (a rainbow ramp).** ✅ Hold one hue and run
it light → dark. The only multi-hue sequential you're allowed is analogous neighbors or
a semantic heat scale — and even then, ship a scale legend.

**❌ Coloring the diverging midpoint, or picking two cool poles.** The center has to
read as absence and the ends as opposites; blue-to-aqua collapses (both cool) where
blue-to-red or blue-to-orange separates. ✅ Two opposing hues with a neutral gray
between them.

**❌ Borrowing a status color for an ordinary series** (or vice versa). ✅ Spend status
tokens only where the color literally signals good or bad; when it signals identity,
that's categorical.

## Form

**❌ Eight categorical hues to tell a one-number story.** This is the single most
frequent way a chart talks past its own point. ✅ Use emphasis — one series lit, the
rest grayed — or drop to a stat tile or hero number.

**❌ A chart with one bar, or a pie split in two.** ✅ Make it a stat tile; the figure
already is the chart.

**❌ A pie or donut asked to compare values that sit close together.** ✅ Use a bar, or
just print the numbers. Part-to-whole is a glance-only move, and only up to ~6
segments.

**❌ More than roughly seven meaning-bearing color classes.** ✅ Move to a table, or a
table alongside the chart — beyond ~7 bins, neighboring classes stop separating.

## Marks & chrome

**❌ Fat saturated blocks, weighty gridlines, no whitespace.** At any real size it
comes across as shouting, even juvenile. ✅ Thin marks, a recessive hairline grid and
axes, and room to breathe; keep saturated fills to small marks and accents, never big
blocks.

**❌ Dashing the gridlines or axis rules.** A dash signals "forecast" or "threshold",
which a plain grid is not. ✅ Draw them solid, a hairline, one shade off the surface.

**❌ Printing a value on every point.** It reads as static and nobody parses it. ✅
Carry identity with a legend for ≥2 series, and direct-label only the points that earn
it — an endpoint, an outlier, the series the story hinges on — leaving the axis and
tooltip for the rest.

**❌ Ringing each mark with a border to pull them apart.** ✅ Separate fills with a 2px
surface gap, and give overlapping markers a 2px surface ring.

**❌ A label that a small bar or segment clips or overflows** — `overflow: hidden`
trimming the leading or trailing characters included. ✅ Only place a label inside when
it clears its padding; when it doesn't, push it past the bar's end or hand it to the
tooltip/legend — the value survives in the table view either way.

**❌ Fixing a container's height so it excludes the axis band.** The plot slots in but
the tick labels don't, and the card grows a hairline nested scrollbar. ✅ Include the
axis band in the height, or let the container track its content.

**❌ Dressing the hero figure in a display or serif face.** It lands as off-brand
ornament. ✅ Set it in the same sans the rest of the page uses.

**❌ Applying `tabular-nums` to one big standalone number.** Forcing every digit to a
uniform width makes something like `121` sit loosely. ✅ Let hero and stat-tile values
use proportional figures; keep `tabular-nums` for columns of numbers that line up
(table rows, axis ticks).

**❌ Texture switched on by default or used as decoration.** A dense field of angled
lines is a vestibular hazard and just reads as grain over a value scale. ✅ Make it
opt-in — an accessibility toggle, print, or forced-colors — at 45°/135° only, and
ordered when it sits on a value scale.

## Interaction & accessibility

**❌ Locking a value behind its tooltip as the sole way to read it.** ✅ Tooltips are
additive and never gates: the value is also reachable via a direct label or the table
view, and keyboard focus mirrors hover.

**❌ Hover targets you have to spear** — an 8px scatter dot demanding a dead-center
hit. ✅ Extend the target through the 2px gap to a ~24px floor; for crowded scatter,
lay down a nearest-point / Voronoi layer.

**❌ Filters scoped to a single chart, or parked inside a chart card.** ✅ One filter
row sitting above everything it governs, with every chart redrawing on the same slice.

**❌ A skeleton that flashes on refetch.** ✅ Keep the prior render up at lowered
opacity so nothing jumps.

**❌ A continuous scale encoded by color alone, with no table fallback.** ✅ Pair every
chart with its table-view twin — the WCAG-clean equivalent.
