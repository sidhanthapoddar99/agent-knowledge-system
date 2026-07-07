# Color formula

Nobody hand-picks chart color here. Each color in a chart is doing precisely one of
four jobs, and a palette becomes legal only once it survives the checks. Those checks
are the actual deliverable: they're what let you swap a palette safely, and what let
this one method drive any design system's ramps.

## The four jobs

| Job | What the color stands for | The build |
|---|---|---|
| **Categorical** | which series — identity | eight hues in a frozen order, dealt out one by one, never recycled |
| **Ordinal** | a rung in an ordered run — funnel step, tier, bucket | a single hue stepped through lightness; even its lightest rung stays ≥2:1 on the surface |
| **Sequential** | how much — magnitude | a single hue running light → dark; the anchor inverts under dark mode |
| **Diverging** | which side of a baseline — polarity | a pair of hues bridged by a neutral gray, stepped evenly down each arm |
| **Status** | a state from good to critical | a short fixed scale of reserved meaning, never without an icon + label |

**Deciding categorical vs. ordinal:** would reordering the categories rewrite the
meaning? When it would — funnel stages, S/M/L tiers, age brackets, cohort buckets —
the data is **ordinal**, so give it a one-hue ramp and let the reader read the order
straight off the color. When reordering changes nothing — product names, teams,
regions, endpoints — it's **nominal categorical**: a lone series wears slot-1's hue
(skip the legend box; the title already names it), and N distinct series take slots
1..N. Coloring nominal bars by their magnitude is the mistake to avoid — it burns the
identity channel restating what bar length already told the reader.

## The six checks

Any categorical color, whether it's shipping today or you're proposing it, has to
clear all six:

1. **Fixed hue anchors** — eight hue families held in one unchanging order. That order
   *is* how color-vision-deficiency safety is guaranteed, which is exactly why it's
   immovable. *(structural — enforced, not measured)*
2. **Lightness band per mode** — OKLCH L roughly 0.43–0.77 in light, 0.48–0.67 in
   dark. *(validator)*
3. **Chroma floor** — OKLCH C at least ~0.10; drop below it and the hue drifts to gray
   and quits carrying identity. *(validator)*
4. **CVD separation** — Machado-2009 ΔE, aiming for ≥ 12 with a hard floor of ≥ 8
   (that floor is legal only when a secondary encoding rides along), evaluated under
   both protanopia and deuteranopia. Test *adjacent* pairs where only neighbors touch
   (stacks, bars, lines); test **every** pair where any two marks can end up
   shoulder-to-shoulder (scatter, bubble, choropleth, small-multiples) — reach for
   those with `--pairs all`, or a genuine collapse slips through. *(validator)*
5. **Contrast against the surface** — marks at ≥ 3:1, eased only when the value can be
   read some other way (a visible label, the table view). *(validator)*
6. **Documented palette only** — every slot traces to a hex in the instance file
   ([`palette.md`](palette.md)); nothing eyeballed. *(structural; to land on a design
   system's own ramps, snap to the nearest passing step — see below)*

## Run the checks — don't argue about them

```
node ../../scripts/validate_palette.js \
  "#2a78d6,#1baf7a,#eda100,#008300,#4a3aa7,#e34948,#e87ba4,#eb6834" \
  --mode light --surface "#f5f5f5"
```

(The path resolves relative to this file; `--surface` is the framework's light chart
surface — see [`palette.md`](palette.md).) Alternatively, embed it in the chart's page
as a `<script type="module">`; there it pulls `data-palette` off `<body>` and dumps a
`console.table`.

Every computable check (2–5) comes back PASS / WARN / FAIL, with the worst CVD pair
called out. A run exits 0 when nothing hard-FAILs — the two WARN bands (CVD 8–12, and
sub-3:1 contrast relief) still exit 0 but each demands a secondary encoding; any FAIL
exits 1. Do a run per mode (`--mode dark --surface "#171717"`), and tack on
`--pairs all` for scatter/bubble/map/small-multiples. An **ordinal** ramp goes through
`--ordinal`, which swaps in the ramp checks: monotone L, adjacent ΔL ≥ 0.06, a
light-end contrast of ≥ 2.0:1, and one hue throughout.

That CVD WARN (8–12) only passes when a secondary encoding backs it — direct labels,
gaps, or texture. The contrast WARN can't be waved off: it obligates a relief channel
(a visible direct label or the table view), and a sub-3:1 fill shipped with neither is
a plain fail.

**What's in and out of scope.** The six checks judge a *categorical* palette — series
identity. They say nothing about a lone status or text color, or about a sequential
ramp. To vet a single status/text color, run a WCAG *text*-contrast check instead
(4.5:1 for body text, 3:1 for large); the script exposes `contrast(a, b)` for exactly
that. To vet a sequential/diverging ramp, verify lightness monotonicity along the
ramp, not adjacency CVD — point the categorical validator at a sequential ramp and it
**FAILs on purpose** (the ramp covers the whole band with tightly spaced steps). That's
the expected result; leave a good ramp alone rather than bending it to pass.

## Snap-to-passing (any design system)

Starting from a system's ramps and the order you want:

1. Per slot, grab the step whose OKLCH L falls inside the mode's band while keeping
   C above the floor.
2. Validate. Anywhere an adjacent pair lands under ΔE 12, shift one slot by a single
   step — same hue, new lightness — and validate again.
3. Keep going until the tightest adjacent pair sits above the floor. Function intact,
   the system's own hues untouched.

## Themes (slot order)

Which slot goes where is its own named decision — a *theme* — layered onto the same
hues under the same six checks. Each surface picks one theme and locks it; two themes
never share a dashboard. When a system hasn't chosen an order yet, resist guessing:
list the candidate orderings, validate each, and keep whichever pushes the *smallest
adjacent* CVD ΔE the highest.

## Status is fixed

Status stands apart from the theme entirely. It's a compact fixed scale — good →
warning → serious → critical — carrying reserved meaning, set on steps held clear of
the categorical slots, and always shown with an icon + label. When a series itself
*means* good or bad (error rate, pass/fail) it takes status tokens; when it's just
"the fourth series" it takes categorical — one chart never mixes the two. The precise
steps, mapped to the framework's `--color-success` / `-warning` / `-error` / `-info`,
are in [`palette.md`](palette.md).
