# Design fundamentals

The craft that applies to **every** artifact, whatever its treatment (`SKILL.md`
§0 decides the treatment; this is what you execute afterward). Approach an artifact
the way a versatile studio approaches a client: deliberate choices about palette,
type, and layout that are specific to *this* subject, never a templated default.

## Fundamentals for every artifact

- **Ground it in the subject.** If the subject isn't already pinned, pin it: one
  concrete subject, its audience, and the page's single job. The subject's own
  world — its materials, its instruments, its vernacular — is where distinctive
  choices come from. Build with real content throughout (§ *Realistic content*).
- **Choose neutrals; don't default to them.** A pure mid-grey reads as
  unconsidered. A grey nudged slightly toward the page's accent reads as chosen.
  Pure white and near-black are fine grounds when they suit the subject — the point
  is the neutral was picked, not inherited. (In `site` mode the neutrals come
  from `--color-bg-*` / `--color-text-*`; the "pick, don't default" rule is about
  `self` artifacts that define their own.)
- **Let layout do the spacing.** Lay sibling groups out with flex or grid and
  `gap`, not per-element margins that collapse or double. Wide content — tables,
  code, diagrams — gets `overflow-x: auto` on its *own* container so the page body
  never scrolls sideways. Reach for `font-variant-numeric: tabular-nums` wherever
  digits line up in columns (but not on big standalone numbers — see the dataviz
  figures rules).
- **Build cleanly.** Visual bugs hide in the gap between source and output: watch
  for overlapping elements, cascade collisions, silent font fallbacks. Close every
  non-void element, double-quote attributes, give keyboard focus a visible state,
  honor `prefers-reduced-motion`. For generative or decorative graphics, reach for
  Canvas or WebGL rather than hand-authoring long SVG path data.
- **Mind CSS specificity.** It's easy to generate classes that cancel each other —
  a type-based selector (`.section`) fighting an element-based one (`.cta`) over the
  same padding. Structure the cascade so it doesn't silently undo your spacing.
- **Copy is design material, not decoration.** Write from the reader's side of the
  screen — name things by what people recognise, not how the system is built (a
  person manages *notifications*, not *webhook config*). Active voice; a control
  says exactly what happens ("Publish" → a toast that says "Published"). Errors
  explain what went wrong and how to fix it — no apologies, no vagueness. Specific
  beats clever.
- **Structure is information.** Structural devices — numbering, eyebrows, dividers,
  labels — must encode something true about the content, not decorate it. Numbered
  markers (01 / 02 / 03) belong only where the content genuinely *is* a sequence (a
  real process, a typed timeline). Ask whether a device carries meaning before
  reaching for it.

## The anti-generic rules

Current AI-generated design clusters around a handful of tells. Where the user
pins a visual direction, **follow it exactly — their words always win, including
when they ask for one of these looks.** Where nothing is specified, don't spend
that freedom on a default:

- warm cream (`#F4F1EA`) + a serif display + a terracotta accent
- near-black with a lone acid-green or vermilion pop
- a purple-to-blue gradient hero on white
- Inter or Space Grotesk as the "safe" face
- emoji as section markers
- everything centered
- `rounded-lg` on everything
- an accent bar/rail on rounded cards

None of these is *forbidden* — each is a cliché only because it's the unconsidered
default. If the subject genuinely calls for one, use it deliberately.

**Match complexity to the vision.** Maximalist directions need elaborate execution;
minimal directions need precision in spacing, type, and detail. Elegance is
executing the chosen vision well — not maximum intensity. Spend your boldness in
one place and keep everything around it quiet; if an accent fights the ground,
shift it toward analogous or drop its saturation rather than replacing it.

## Editorial branch only — the tone menu and texture

These apply **only** when `SKILL.md` §0 read the request as *editorial*, and stay
gated behind the restraint governor — they are direction-picking aids for a
standalone showcase, not licence to over-design a utilitarian page.

- **Pick a concrete tone** rather than defaulting to a neutral one: brutally
  minimal, maximalist, retro-futuristic, organic/natural, luxury/refined,
  playful/toy-like, editorial-magazine, brutalist/raw, art-deco/geometric,
  soft/pastel, industrial/utilitarian. Use the list for inspiration; design one
  that is true to *this* subject rather than copying a flavour wholesale.
- **Vary across generations; never converge on one face.** Don't reach for the same
  display family (Space Grotesk is the canonical example) every time. Vary light vs
  dark, the type pairing, the whole aesthetic between artifacts.
- **Backgrounds create atmosphere, not just fill.** Where the direction calls for
  it, consider gradient meshes, subtle noise or grain, geometric patterns, layered
  transparency, dramatic shadows, decorative borders. Texture earns its place when
  it serves the tone — never as busywork, and always subject to `prefers-reduced-motion`.
- **The hero is a thesis.** Open an editorial artifact with the most characteristic
  thing in the subject's world — a headline, an image, a live demo, an interactive
  moment. Motion is deliberate: one orchestrated page-load or scroll reveal usually
  lands harder than scattered micro-interactions, and *too much* animation is itself
  a tell of AI-generated design.

(These are salvaged from the frontend-design source; its uncalibrated
"BOLD / UNFORGETTABLE" framing is deliberately dropped — the treatment governor in
§0 is what decides intensity.)

## Typography

Type carries an artifact even when it isn't *about* type.

- **Measure.** Keep running text near a 65-character line; set a type scale and stay
  on it. In `site` mode use the semantic tokens (`--content-*` for prose,
  `--ui-text-*` for chrome); in `self` mode define your own scale but keep it a
  scale.
- **Pairing.** Pair a characterful display face (used with restraint) with a
  complementary body face, and a utility face for captions or data if needed. Give
  headings `text-wrap: balance`, body text room to breathe, and uppercase labels a
  touch of letter-spacing.
- **Font delivery is a publishing concern.** Ship the face as `.woff2` under the
  repo assets and reference it relatively — do **not** link a webfont CDN (see
  `publishing.md` → *Fonts*). A missing or silently fallen-back font looks "fine" at
  a glance because the fallback renders; catch it by checking the **computed** font,
  not the vibe.

## When it's a UI, not a document — route into dataviz

A dashboard or tool is *scanned and operated*, not read top-to-bottom, so the craft
shifts from typography to information design:

- Surface the summary before the detail.
- Encode state in **form** as well as number — a pill, a chip, a severity stripe —
  so what needs attention reads at a glance.
- **Semantic color (good / warning / critical) is separate from your accent hue and
  does not count as your accent.**
- What's interactive should look interactive.

The moment an artifact has a chart, a stat tile, a meter, or any plotted data,
**switch to [`dataviz/00_overview.md`](dataviz/00_overview.md)** and follow its
procedure — the chart-specific craft (forms, color jobs, marks, interaction,
anti-patterns) lives there, deliberately not duplicated here.

## Process — plan before code

Before writing any code, sketch a compact design plan:

- **Color** — the palette as 4–6 named hex values (or the named theme tokens, in
  `site` mode).
- **Type** — typefaces for 2+ roles: a display face used with restraint, a body
  face, and a utility face for captions/data if needed.
- **Layout** — the layout concept in one or two sentences.

Then build, deriving every color and type decision from the plan. **Editorial
addendum:** before building, review the plan against the subject — if any part
reads like the generic default you'd produce for any similar page, revise it and
note what changed and why. Only once the plan's uniqueness is confirmed do you write
the code, following the revised plan exactly.

## Realistic content

One rule, everywhere: **real content, never lorem, never `foo` / `test`.** Curate
before inventing — if real values exist, use them; if you must fabricate, fabricate
*plausibly* and label it. For anything that shows variants (a design system, a
component gallery), show the canonical example, then a variant sweep, then the
static states (empty, loading, error) — those states are content, not
afterthoughts. The verify gate (`SKILL.md` §3, *Plausible*) checks this.
